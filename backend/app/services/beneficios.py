import json
from pathlib import Path

from pydantic import BaseModel, Field

TABLA_ART73_PATH = Path(__file__).parent.parent / "rules" / "tabla_articulo_73_et.json"


class BeneficioItem(BaseModel):
    id: str
    categoria: str  # "incrngo", "deducciones", "rentas_exentas", "descuentos", "auditoria_sanciones", "ajustes_patrimonio"
    nombre: str
    articulo_et: str
    descripcion: str
    tope_legal_texto: str
    requisitos: list[str]
    ejemplo_calculo: str


class BeneficioAuditoriaRequest(BaseModel):
    tax_year: int = Field(2026, description="Año gravable a declarar")
    impuesto_neto_ano_anterior: float = Field(
        ...,
        description="Impuesto neto de renta liquidado en la declaración del año anterior (Casilla 112 F210)",
    )
    custom_uvt: float | None = Field(None, description="UVT personalizado opcional")


class BeneficioAuditoriaResponse(BaseModel):
    tax_year: int
    uvt_value: float
    impuesto_neto_ano_anterior: float
    impuesto_minimo_requerido_uvt: float
    impuesto_minimo_requerido_cop: float
    cumple_impuesto_minimo: bool

    # Firmeza 6 meses (35% incremento)
    impuesto_objetivo_6_meses_cop: float
    incremento_requerido_6_meses_cop: float

    # Firmeza 12 meses (25% incremento)
    impuesto_objetivo_12_meses_cop: float
    incremento_requerido_12_meses_cop: float

    requisitos_legales: list[str]
    recomendacion: str


class ReduccionSancionRequest(BaseModel):
    monto_sancion_base_cop: float = Field(
        ...,
        description="Monto base de la sanción liquidada (ej. 10% del mayor valor por corrección Art. 644)",
    )
    sin_sanciones_ultimos_2_anos: bool = Field(
        True,
        description="¿No ha sido sancionado por la DIAN en los últimos 2 años? (Aplica reducción al 50% Art. 640)",
    )
    sin_sanciones_ultimo_1_ano: bool = Field(
        True,
        description="¿No ha sido sancionado por la DIAN en el último año? (Aplica reducción al 75% Art. 640)",
    )


class ReduccionSancionResponse(BaseModel):
    monto_sancion_plena_cop: float
    porcentaje_reduccion_aplicado: float
    sancion_final_reducida_cop: float
    ahorro_sancion_cop: float
    articulo_aplicable: str
    explicacion: str


class AjusteArticulo73Item(BaseModel):
    ano_adquisicion: str = Field(..., description="Año en el cual fue adquirido el activo")
    acciones_aportes: float = Field(
        ..., description="Factor multiplicador para acciones o aportes en sociedades"
    )
    bienes_raices_urbanos: float = Field(
        ..., description="Factor multiplicador para bienes raíces urbanos"
    )
    bienes_raices_rurales_agro: float = Field(
        ...,
        description="Factor multiplicador para bienes raíces rurales dedicados a actividades agropecuarias",
    )
    bienes_raices_rurales: float = Field(
        ..., description="Factor multiplicador para bienes raíces rurales generales"
    )


class SimulacionAjusteArticulo73Request(BaseModel):
    ano_adquisicion: str = Field(
        ...,
        description="Año de adquisición (ej. '2015', '1990', '1955 y anteriores')",
    )
    tipo_activo: str = Field(
        ...,
        description="Tipo de activo: 'acciones_aportes', 'bienes_raices_urbanos', 'bienes_raices_rurales_agro', 'bienes_raices_rurales'",
    )
    costo_adquisicion_historico_cop: float = Field(
        ...,
        gt=0,
        description="Costo de adquisición histórico comprobado o valor de compra original en pesos COP",
    )
    precio_venta_estimado_cop: float | None = Field(
        None,
        description="Precio de venta o enajenación estimado/real del activo en pesos COP",
    )
    ano_gravable_enajenacion: int = Field(
        2025,
        description="Año gravable de enajenación o declaración del activo",
    )


class SimulacionAjusteArticulo73Response(BaseModel):
    ano_adquisicion: str
    tipo_activo: str
    tipo_activo_label: str
    factor_multiplicador: float
    costo_adquisicion_historico_cop: float
    costo_fiscal_ajustado_art73_cop: float
    incremento_costo_fiscal_cop: float
    precio_venta_cop: float | None
    ganancia_sin_ajuste_cop: float | None
    ganancia_con_ajuste_cop: float | None
    ahorro_base_gravable_cop: float | None
    tarifa_ganancia_ocasional_pct: float
    impuesto_estimado_sin_ajuste_cop: float | None
    impuesto_estimado_con_ajuste_cop: float | None
    ahorro_impuesto_estimado_cop: float | None
    es_ganancia_ocasional: bool
    fundamento_legal: str
    explicacion_didactica: str
    pasos_calculo: list[str]


_tabla_art73_cache: list[AjusteArticulo73Item] | None = None


def get_tabla_articulo_73() -> list[AjusteArticulo73Item]:
    """Carga y retorna la tabla oficial de factores de ajuste del Artículo 73 del E.T."""
    global _tabla_art73_cache
    if _tabla_art73_cache is None:
        if not TABLA_ART73_PATH.exists():
            return []
        with open(TABLA_ART73_PATH, encoding="utf-8") as f:
            raw_data = json.load(f)
            _tabla_art73_cache = [AjusteArticulo73Item(**item) for item in raw_data]
    return _tabla_art73_cache


def calcular_ajuste_articulo_73(
    req: SimulacionAjusteArticulo73Request,
) -> SimulacionAjusteArticulo73Response:
    """Calcula el costo fiscal ajustado según el Artículo 73 del E.T.

    y la simulación del ahorro en Ganancia Ocasional o Renta.
    """
    tabla = get_tabla_articulo_73()
    norm_ano = " ".join(req.ano_adquisicion.strip().split())

    # Buscar la fila correspondiente
    item_encontrado: AjusteArticulo73Item | None = None
    for item in tabla:
        if item.ano_adquisicion.lower() == norm_ano.lower():
            item_encontrado = item
            break

    if not item_encontrado:
        # Fallback a 2024 o último año si no se encuentra
        item_encontrado = tabla[-1] if tabla else None

    if not item_encontrado:
        raise ValueError(
            f"No se encontró factor de ajuste para el año de adquisición '{req.ano_adquisicion}'"
        )

    labels_map = {
        "acciones_aportes": "Acciones o Aportes en Sociedades",
        "bienes_raices_urbanos": "Bienes Raíces Urbanos (Inmuebles Urbanos)",
        "bienes_raices_rurales_agro": "Bienes Raíces Rurales (Actividades Agropecuarias)",
        "bienes_raices_rurales": "Bienes Raíces Rurales Generales",
    }
    label = labels_map.get(req.tipo_activo, req.tipo_activo)

    # Determinar factor multiplicador
    factor: float = 1.0
    if req.tipo_activo == "acciones_aportes":
        factor = item_encontrado.acciones_aportes
    elif req.tipo_activo == "bienes_raices_urbanos":
        factor = item_encontrado.bienes_raices_urbanos
    elif req.tipo_activo == "bienes_raices_rurales_agro":
        factor = item_encontrado.bienes_raices_rurales_agro
    elif req.tipo_activo == "bienes_raices_rurales":
        factor = item_encontrado.bienes_raices_rurales
    else:
        factor = item_encontrado.bienes_raices_urbanos

    costo_historico = req.costo_adquisicion_historico_cop
    costo_ajustado = round(costo_historico * factor)
    incremento_costo = max(0.0, costo_ajustado - costo_historico)

    # Evaluación de posesión (para determinar si es Ganancia Ocasional o Renta Ordinaria)
    # Si fue adquirido hace 2 o más años respecto al año gravable
    try:
        ano_adq_num = int(norm_ano)
    except ValueError:
        # "1955 y anteriores"
        ano_adq_num = 1955

    anos_posesion = req.ano_gravable_enajenacion - ano_adq_num
    es_ganancia_ocasional = anos_posesion >= 2
    tarifa_impuesto_pct = 15.0 if es_ganancia_ocasional else 35.0  # 15% GO vs 35% aprox ordinaria

    precio_venta = req.precio_venta_estimado_cop
    ganancia_sin = None
    ganancia_con = None
    ahorro_base = None
    impuesto_sin = None
    impuesto_con = None
    ahorro_impuesto = None

    pasos = [
        f"1. Identificación del activo: {label} adquirido en {item_encontrado.ano_adquisicion}.",
        f"2. Factor de ajuste oficial del Art. 73 E.T.: {factor:,.2f}x (según certificación DANE y decreto reglamentario).",
        f"3. Multiplicación del costo histórico (${costo_historico:,.0f}) por el factor {factor:,.2f}x = Costo Fiscal Ajustado de ${costo_ajustado:,.0f} COP.",
        f"4. Incremento legal del costo fiscal patrimonial: +${incremento_costo:,.0f} COP sin constituir renta gravable.",
    ]

    if precio_venta is not None and precio_venta > 0:
        ganancia_sin = max(0.0, precio_venta - costo_historico)
        ganancia_con = max(0.0, precio_venta - costo_ajustado)
        ahorro_base = max(0.0, ganancia_sin - ganancia_con)

        impuesto_sin = round(ganancia_sin * (tarifa_impuesto_pct / 100.0))
        impuesto_con = round(ganancia_con * (tarifa_impuesto_pct / 100.0))
        ahorro_impuesto = max(0.0, impuesto_sin - impuesto_con)

        pasos.extend(
            [
                f"5. Venta estimada en ${precio_venta:,.0f} COP.",
                f"6. Ganancia gravable SIN ajuste: ${precio_venta:,.0f} - ${costo_historico:,.0f} = ${ganancia_sin:,.0f} COP (Impuesto: ${impuesto_sin:,.0f} COP al {tarifa_impuesto_pct}%).",
                f"7. Ganancia gravable CON ajuste Art. 73: ${precio_venta:,.0f} - ${costo_ajustado:,.0f} = ${ganancia_con:,.0f} COP (Impuesto: ${impuesto_con:,.0f} COP al {tarifa_impuesto_pct}%).",
                f"8. AHORRO TRIBUTARIO NETO: Reducción de base en ${ahorro_base:,.0f} COP → Ahorro estimado de ${ahorro_impuesto:,.0f} COP en impuestos.",
            ]
        )

    explicacion = (
        f"El Artículo 73 del Estatuto Tributario permite a las personas naturales reajustar el costo fiscal de "
        f"sus activos fijos (inmuebles o acciones) multiplicando el costo histórico de compra por el factor de {factor:,.2f}x. "
        f"Esto eleva legalmente el costo fiscal de ${costo_historico:,.0f} a ${costo_ajustado:,.0f} COP. "
    )
    if ahorro_impuesto:
        explicacion += (
            f"Al vender el bien, la utilidad gravable disminuye drásticamente, generando un ahorro directo "
            f"estimado de ${ahorro_impuesto:,.0f} COP en el impuesto de Ganancia Ocasional."
        )

    return SimulacionAjusteArticulo73Response(
        ano_adquisicion=item_encontrado.ano_adquisicion,
        tipo_activo=req.tipo_activo,
        tipo_activo_label=label,
        factor_multiplicador=factor,
        costo_adquisicion_historico_cop=costo_historico,
        costo_fiscal_ajustado_art73_cop=costo_ajustado,
        incremento_costo_fiscal_cop=incremento_costo,
        precio_venta_cop=precio_venta,
        ganancia_sin_ajuste_cop=ganancia_sin,
        ganancia_con_ajuste_cop=ganancia_con,
        ahorro_base_gravable_cop=ahorro_base,
        tarifa_ganancia_ocasional_pct=tarifa_impuesto_pct,
        impuesto_estimado_sin_ajuste_cop=impuesto_sin,
        impuesto_estimado_con_ajuste_cop=impuesto_con,
        ahorro_impuesto_estimado_cop=ahorro_impuesto,
        es_ganancia_ocasional=es_ganancia_ocasional,
        fundamento_legal="Artículo 73 del Estatuto Tributario Nacional (Sustituido anualmente en el DUR 1625 de 2016)",
        explicacion_didactica=explicacion,
        pasos_calculo=pasos,
    )


def get_catalogo_beneficios() -> list[BeneficioItem]:
    return [
        # 0. AJUSTE FISCAL DE ACTIVOS FIJOS (Art. 73 E.T.)
        BeneficioItem(
            id="reajuste_fiscal_activos_art73",
            categoria="ajustes_patrimonio",
            nombre="Ajuste Fiscal de Bienes Raíces y Acciones (Art. 73 E.T.)",
            articulo_et="Art. 73 E.T. (DUR 1.2.1.17.21)",
            descripcion="Mecanismo legal que permite a las personas naturales multiplicar el costo histórico de adquisición de inmuebles y acciones por factores oficiales de inflación y avalúo para determinar un costo fiscal mayor, reduciendo drásticamente la ganancia ocasional o renta en la venta.",
            tope_legal_texto="Factor multiplicador oficial según año de adquisición (hasta 36.085x para inmuebles y 4.664x para acciones)",
            requisitos=[
                "Ser persona natural.",
                "Que el bien inmueble o las acciones califiquen como activo fijo (no inventario).",
                "Comprobante o escritura pública con la fecha y costo de adquisición histórico.",
            ],
            ejemplo_calculo="Un inmueble urbano comprado en 1995 por $20.000.000 se multiplica por 23,50x = Costo fiscal ajustado de $470.000.000. Si se vende en $500.000.000, solo tributa sobre $30.000.000 de utilidad en lugar de $480.000.000.",
        ),
        # 1. INCRNGO
        BeneficioItem(
            id="incrngo_salud",
            categoria="incrngo",
            nombre="Aportes Obligatorios a Salud (EPS)",
            articulo_et="Art. 56 E.T.",
            descripcion="Los pagos obligatorios que efectúe el trabajador o independiente al Sistema General de Seguridad Social en Salud no constituyen renta ni ganancia ocasional.",
            tope_legal_texto="100% de los aportes obligatorios efectivamente pagados",
            requisitos=["Certificado de pagos a EPS o planilla PILA del año gravable."],
            ejemplo_calculo="Si el salario es $10.000.000/mes y aportó $4.800.000 al año en salud, se restan completos como INCRNGO.",
        ),
        BeneficioItem(
            id="incrngo_pension",
            categoria="incrngo",
            nombre="Aportes Obligatorios a Pensión y FSP",
            articulo_et="Art. 55 E.T.",
            descripcion="Los aportes obligatorios a los fondos de pensiones obligatorias (Colpensiones o fondos privados) y al Fondo de Solidaridad Pensional son 100% INCRNGO.",
            tope_legal_texto="100% de los aportes obligatorios efectivamente pagados",
            requisitos=["Planilla PILA o certificado de retenciones Formulario 220."],
            ejemplo_calculo="Aportes obligatorios a pensión de $4.800.000/año se restan directamente de los ingresos brutos.",
        ),
        BeneficioItem(
            id="incrngo_dividendos",
            categoria="incrngo",
            nombre="Dividendos y Utilidades No Gravadas",
            articulo_et="Art. 48 y 49 E.T.",
            descripcion="Las utilidades comerciales que ya tributaron en cabeza de la sociedad no generan impuesto duplicado (distribución como no gravadas).",
            tope_legal_texto="Según cálculo de utilidad susceptible de distribuirse como no gravada (Art. 49)",
            requisitos=["Certificado de dividendos expedido por la sociedad pagadora."],
            ejemplo_calculo="Si una sociedad distribuye $50.000.000 de utilidades no gravadas, el socio las reporta como INCRNGO.",
        ),
        BeneficioItem(
            id="incrngo_componente_inflacionario",
            categoria="incrngo",
            nombre="Componente Inflacionario de Rendimientos Financieros",
            articulo_et="Art. 38, 40-1 y 41 E.T.",
            descripcion="Para personas naturales no obligadas a llevar contabilidad, la porción de los rendimientos financieros que corresponde a la inflación del año no constituye renta ni ganancia ocasional (INCRNGO), tributando únicamente sobre la rentabilidad real.",
            tope_legal_texto="Porcentaje fijado anualmente por decreto nacional (ej. 55,43% en 2025)",
            requisitos=[
                "Ser persona natural no obligada a llevar contabilidad.",
                "Rendimientos pagados por entidades vigiladas por la Superintendencia Financiera o FICs.",
                "Certificado tributario bancario donde conste el componente inflacionario.",
            ],
            ejemplo_calculo="Si un FIC generó $1.000.000 de rendimientos, el 55,43% ($554.300) se resta como INCRNGO y solo tributa sobre $445.700.",
        ),
        BeneficioItem(
            id="costo_fiscal_inversiones_capital",
            categoria="deducciones",
            nombre="Costo Fiscal de Inversión y Enajenación de Activos",
            articulo_et="Art. 71, 90 y 261 E.T.",
            descripcion="El capital aportado en inversiones o compra de activos NO es renta; es patrimonio. Al vender o rescatar una inversión, se resta el costo fiscal de adquisición de modo que el impuesto se calcula estrictamente sobre la ganancia neta realizada.",
            tope_legal_texto="100% del costo de adquisición o valor de compra certificado",
            requisitos=["Comprobante de compra de títulos, acciones o extracto bursátil."],
            ejemplo_calculo="Si compras acciones por $9.000.000 y las vendes en $10.000.000, solo los $1.000.000 de utilidad son base gravable.",
        ),
        BeneficioItem(
            id="ganancia_ocasional_acciones_2anos",
            categoria="rentas_exentas",
            nombre="Tratamiento de Ganancia Ocasional en Venta de Acciones (Posesión ≥ 2 Años)",
            articulo_et="Art. 300, 313 y 314 E.T.",
            descripcion="Si las acciones, títulos o inmuebles han sido poseídos por el contribuyente durante dos (2) años o más, la utilidad obtenida en su venta no se suma a la Cédula General (que tiene tarifas marginales de hasta el 39%), sino que tributa a la tarifa fija del 15% como Ganancia Ocasional.",
            tope_legal_texto="Tarifa fija del 15% sobre la utilidad neta (vs. hasta 39% en renta ordinaria)",
            requisitos=[
                "Posesión fiscal del activo por un periodo continuo de 2 años o más.",
                "Soporte de fecha de adquisición y fecha de enajenación.",
            ],
            ejemplo_calculo="Utilidad de $50.000.000 en acciones poseídas por 3 años tributa 15% ($7.500.000) en lugar del 35%-39% de la cédula general.",
        ),
        # 2. DEDUCCIONES
        BeneficioItem(
            id="deduccion_dependiente_general",
            categoria="deducciones",
            nombre="Deducción por Dependiente Económico General",
            articulo_et="Art. 387 E.T.",
            descripcion="Deducción de hasta el 10% del total de ingresos brutos provenientes de la relación laboral o legal y reglamentaria por tener a cargo hijos menores, cónyuge o padres dependientes.",
            tope_legal_texto="Hasta 384 UVT anuales ($20.102.400 COP en 2026)",
            requisitos=[
                "Hijos menores de 18 años, hijos hasta 23 años que estudien, cónyuge o padres con dependencia económica certificada."
            ],
            ejemplo_calculo="Sobre ingresos de $120.000.000, el 10% es $12.000.000. Como es menor a 384 UVT, se deduce completo.",
        ),
        BeneficioItem(
            id="deduccion_dependientes_adicionales_72uvt",
            categoria="deducciones",
            nombre="Deducción por Dependientes Adicionales (72 UVT c/u)",
            articulo_et="Art. 336 Numeral 2 E.T. (Ley 2277 de 2022)",
            descripcion="Deducción adicional de 72 UVT por cada dependiente económico adicional, hasta un máximo de cuatro (4) dependientes.",
            tope_legal_texto="Hasta 288 UVT anuales (4 dependientes x 72 UVT = $15.076.800 COP en 2026)",
            requisitos=[
                "Certificados de registro civil y dependencia de hasta 4 dependientes adicionales."
            ],
            ejemplo_calculo="Si tiene 2 hijos adicionales, puede deducir 144 UVT adicionales sin importar el límite del 10% de ingresos.",
        ),
        BeneficioItem(
            id="deduccion_medicina_prepagada",
            categoria="deducciones",
            nombre="Pagos por Medicina Prepagada y Pólizas de Salud",
            articulo_et="Art. 387 E.T.",
            descripcion="Pagos efectuados por el trabajador por planes adicionales de salud (medicina prepagada, seguros médicos, planes complementarios) para él, su cónyuge y sus hijos.",
            tope_legal_texto="Hasta 192 UVT anuales (16 UVT mensuales = $10.051.200 COP en 2026)",
            requisitos=[
                "Certificado anual de pagos emitido por la entidad de medicina prepagada o aseguradora."
            ],
            ejemplo_calculo="Pagos de $15.000.000 al año se limitan a 192 UVT ($10.051.200 COP) y ese valor entra a la depuración.",
        ),
        BeneficioItem(
            id="deduccion_intereses_vivienda",
            categoria="deducciones",
            nombre="Intereses en Créditos de Vivienda y Leasing Habitacional",
            articulo_et="Art. 119 E.T.",
            descripcion="Intereses o corrección monetaria pagados en el año gravable por préstamos para adquisición de vivienda de habitación o contratos de leasing habitacional.",
            tope_legal_texto="Hasta 1.200 UVT anuales (100 UVT mensuales = $62.820.000 COP en 2026)",
            requisitos=[
                "Certificado tributario expedido por el banco o entidad financiera acreedora."
            ],
            ejemplo_calculo="Si pagó $25.000.000 en intereses hipotecarios durante el año, se deducen completos al estar bajo 1.200 UVT.",
        ),
        BeneficioItem(
            id="deduccion_gmf_50",
            categoria="deducciones",
            nombre="Deducción del 50% del Gravamen al Movimiento Financiero (GMF 4x1000)",
            articulo_et="Art. 115 E.T.",
            descripcion="Es deducible el 50% del Gravamen a los Movimientos Financieros (4x1000) efectivamente pagado por los contribuyentes durante el año gravable.",
            tope_legal_texto="50% del valor total certificado por las entidades financieras",
            requisitos=["Certificados bancarios anuales donde conste el GMF retenido."],
            ejemplo_calculo="GMF certificado por $4.000.000 permite deducir $2.000.000 en la declaración de renta.",
        ),
        BeneficioItem(
            id="deduccion_factura_electronica_1pct",
            categoria="deducciones",
            nombre="Deducción del 1% por Compras con Factura Electrónica",
            articulo_et="Art. 336 Numeral 5 E.T.",
            descripcion="Las personas naturales pueden deducir el 1% del valor de las compras de bienes y servicios soportadas con Factura Electrónica de Venta con validación previa, pagadas por medios electrónicos (tarjeta, PSE, transferencia).",
            tope_legal_texto="Hasta 240 UVT anuales ($12.564.000 COP en 2026)",
            requisitos=[
                "Factura electrónica a nombre del declarante, pagada por tarjeta débito/crédito o transferencia."
            ],
            ejemplo_calculo="Compras de mercado, ropa y tecnología por $50.000.000 generan una deducción directa de $500.000.",
        ),
        # 3. RENTAS EXENTAS
        BeneficioItem(
            id="renta_exenta_afc_pension_voluntaria",
            categoria="rentas_exentas",
            nombre="Aportes Voluntarios a Fondos de Pensión (FVP) y Cuentas AFC",
            articulo_et="Art. 126-1 y 126-4 E.T.",
            descripcion="Los aportes voluntarios a fondos de pensiones voluntarias o cuentas de Ahorro para el Fomento de la Construcción (AFC) tienen el carácter de renta exenta.",
            tope_legal_texto="Hasta el 30% del ingreso bruto laboral o tributario, máximo 3.800 UVT anuales ($198.930.000 COP en 2026)",
            requisitos=[
                "Permanencia mínima de 10 años en el fondo o retiro para compra de vivienda o pensión."
            ],
            ejemplo_calculo="Aporte voluntario de $30.000.000 sobre ingresos de $120.000.000 es 100% procedente como renta exenta.",
        ),
        BeneficioItem(
            id="renta_exenta_laboral_25",
            categoria="rentas_exentas",
            nombre="Renta Exenta Laboral Automática del 25%",
            articulo_et="Art. 206 Numeral 10 E.T.",
            descripcion="El 25% del valor total de los pagos laborales netos está exento de impuestos. Se calcula automáticamente tras detraer las deducciones y otras rentas exentas.",
            tope_legal_texto="Hasta 790 UVT anuales ($41.356.500 COP en 2026)",
            requisitos=[
                "Ser perceptor de rentas de trabajo (laborales o independientes que no imputen costos)."
            ],
            ejemplo_calculo="Sobre una base depurada de $80.000.000, el 25% exento es $20.000.000.",
        ),
        BeneficioItem(
            id="renta_exenta_cesantias",
            categoria="rentas_exentas",
            nombre="Cesantías e Intereses de Cesantías",
            articulo_et="Art. 206 Numeral 4 E.T.",
            descripcion="Las cesantías e intereses de cesantías pagados a trabajadores están exentos en su totalidad para salarios promedio que no excedan las 350 UVT mensuales.",
            tope_legal_texto="Exención del 100% o proporcional según tabla del Art. 206",
            requisitos=["Certificado de ingresos y retenciones Formulario 220."],
            ejemplo_calculo="Cesantías consignadas en el fondo o pagadas directamente quedan exentas en la cédula general.",
        ),
        # 4. BENEFICIO DE AUDITORÍA (Art. 689-3)
        BeneficioItem(
            id="beneficio_auditoria_art689_3",
            categoria="auditoria_sanciones",
            nombre="Beneficio de Auditoría (Firmeza en 6 o 12 meses)",
            articulo_et="Art. 689-3 E.T.",
            descripcion="Beneficio legal que otorga firmeza definitiva a la declaración de renta (la DIAN no puede fiscalizarla ni modificarla) en un plazo récord de 6 meses (si el impuesto neto de renta se incrementa al menos en un 35% respecto al año anterior) o en 12 meses (si se incrementa al menos en un 25%).",
            tope_legal_texto="Impuesto neto del año anterior mínimo de 71 UVT ($3.716.850 COP en 2026)",
            requisitos=[
                "Haber presentado y pagado la declaración en los plazos legales.",
                "Impuesto neto del año anterior mayor o igual a 71 UVT.",
                "No tener retenciones inexistentes ni pérdidas fiscales improcedentes.",
            ],
            ejemplo_calculo="Si el año pasado pagó $10.000.000, al liquidar este año $13.500.000 (+35%) la declaración queda en firme en solo 6 meses.",
        ),
        # 5. REDUCCIÓN DE SANCIONES (Art. 640 y 644)
        BeneficioItem(
            id="reduccion_sanciones_art640_644",
            categoria="auditoria_sanciones",
            nombre="Régimen de Reducción de Sanciones por Corrección",
            articulo_et="Art. 640 y 644 E.T.",
            descripcion="Si el contribuyente corrige voluntariamente su declaración antes de que la DIAN le notifique un emplazamiento para corregir, la sanción es de solo el 10% del mayor valor a pagar (Art. 644). Además, por el Principio de Proporcionalidad y Gradualidad (Art. 640), dicha sanción se reduce al 50% si no ha sido sancionado en los últimos 2 años, o al 75% si no lo ha sido en el último año.",
            tope_legal_texto="Sanción mínima legal DIAN de 10 UVT ($523.500 COP en 2026)",
            requisitos=[
                "Corregir voluntariamente y liquidar la sanción reducida junto con los intereses de mora."
            ],
            ejemplo_calculo="Un error que generaba $2.000.000 de sanción se reduce a $1.000.000 (50%) por buen historial tributario.",
        ),
    ]


class LiquidacionSancionRequest(BaseModel):
    tipo_sancion: str = Field(
        "correccion",
        description="Tipo de sanción: 'correccion' (Art. 644), 'extemporaneidad' (Art. 641/642), 'inexactitud_general' (Art. 648 - 100%), 'inexactitud_facturas_falsas' (Art. 648 Num. 2 - 160%), 'inexactitud_abuso' (Art. 648 Num. 1 - 200%), 'inexactitud_req_especial' (Art. 709 - 35%), 'inexactitud_recurso' (Art. 710 - 70%)",
    )
    monto_base_cop: float = Field(
        ...,
        description="Monto base: Mayor valor a pagar (corrección/inexactitud) o Impuesto a cargo (extemporaneidad)",
    )
    meses_fraccion_retraso: int = Field(
        1,
        description="Número de meses o fracción de mes calendario de retraso (aplica para extemporaneidad)",
    )
    es_voluntario_sin_emplazamiento: bool = Field(
        True,
        description="¿Es voluntaria antes de cualquier emplazamiento o auto de la DIAN?",
    )
    sin_sanciones_ultimos_2_anos: bool = Field(
        True,
        description="¿No ha sido objeto de sanción tributaria en los últimos 2 años? (Art. 640)",
    )
    sin_sanciones_ultimo_1_ano: bool = Field(
        True,
        description="¿No ha sido objeto de sanción tributaria en el último año? (Art. 640)",
    )
    incluir_intereses_mora: bool = Field(
        True,
        description="¿Calcular e incluir intereses moratorios sobre el impuesto insoluto? (Art. 634 y 635 E.T.)",
    )
    es_saldo_a_favor: bool = Field(
        False,
        description="¿La declaración arroja Saldo a Favor o $0 impuesto a cargo? (En saldo a favor no se generan intereses moratorios)",
    )
    dias_mora: int = Field(
        60,
        description="Número de días calendario de mora transcurridos desde el vencimiento legal",
    )
    tasa_interes_anual_pct: float = Field(
        23.0,
        description="Tasa efectiva anual de interés moratorio DIAN certificada por Superfinanciera (Tasa Usura - 2 puntos)",
    )
    tax_year: int = Field(2026, description="Año gravable")
    custom_uvt: float | None = Field(None, description="UVT personalizado opcional")


class LiquidacionSancionResponse(BaseModel):
    tipo_sancion: str
    tax_year: int
    uvt_value: float
    monto_base_cop: float
    meses_retraso: int
    es_voluntario: bool
    tarifa_base_pct: float
    sancion_plena_sin_reduccion_cop: float
    porcentaje_reduccion_art640_pct: float
    sancion_con_reduccion_cop: float
    sancion_minima_dian_cop: float
    sancion_final_a_pagar_cop: float
    aplico_sancion_minima: bool
    ahorro_favorabilidad_art640_cop: float
    comparativa_sancion_con_emplazamiento_dian_cop: float
    ahorro_por_corregir_antes_de_dian_cop: float
    # Intereses de mora
    incluye_intereses_mora: bool
    dias_mora: int
    tasa_interes_anual_pct: float
    intereses_mora_cop: float
    total_consolidado_a_pagar_cop: float
    articulos_aplicados: list[str]
    explicacion_didactica: str
    pasos_calculo: list[str]


class SimulacionInmuebleAfcRequest(BaseModel):
    precio_venta_cop: float = Field(
        ..., description="Precio pactado en la enajenación de la vivienda"
    )
    costo_fiscal_inmueble_cop: float = Field(
        ...,
        description="Costo fiscal del inmueble (adquisición + mejoras o avalúo / reajuste Art. 73)",
    )
    es_vivienda_habitacion: bool = Field(
        True,
        description="¿El inmueble vendido corresponde a la casa o apartamento de habitación del contribuyente?",
    )
    posesion_mas_2_anos: bool = Field(
        True,
        description="¿El inmueble fue poseído por dos (2) años o más? (Califica como Ganancia Ocasional)",
    )
    monto_depositado_afc_o_vivienda_cop: float = Field(
        ...,
        description="Monto depositado en Cuenta AFC o destinado a adquisición de nueva vivienda o pago hipotecario",
    )
    tax_year: int = Field(2026, description="Año gravable")
    custom_uvt: float | None = Field(None, description="UVT personalizado opcional")


class SimulacionInmuebleAfcResponse(BaseModel):
    tax_year: int
    uvt_value: float
    precio_venta_cop: float
    costo_fiscal_cop: float
    ganancia_ocasional_bruta_cop: float
    es_vivienda_habitacion: bool
    posesion_mas_2_anos: bool
    monto_depositado_afc_cop: float
    tope_maximo_exencion_uvt: float
    tope_maximo_exencion_cop: float
    ganancia_ocasional_exenta_cop: float
    ganancia_ocasional_gravada_final_cop: float
    tarifa_ganancia_ocasional_pct: float
    impuesto_go_sin_afc_cop: float
    impuesto_go_con_afc_cop: float
    ahorro_impuesto_afc_cop: float
    requisitos_estatuto: list[str]
    advertencias_legales: list[str]
    explicacion_paso_a_paso: list[str]


def calcular_sancion_tributaria(req: LiquidacionSancionRequest) -> LiquidacionSancionResponse:
    """Calcula de manera integral las sanciones tributarias (Corrección, Extemporaneidad, Inexactitud),

    los intereses moratorios diarios (Art. 634 y 635 E.T.), reducciones del Art. 640 y sanción mínima Art. 639.
    """
    from app.core.rules_engine.loader import get_rules_for_year

    rules = get_rules_for_year(req.tax_year, req.custom_uvt)
    uvt = rules.uvt_value
    sancion_minima_cop = round(10.0 * uvt / 1000.0) * 1000.0  # 10 UVT (Art. 639)

    monto_base = max(0.0, req.monto_base_cop)
    meses = max(1, req.meses_fraccion_retraso)
    tipo = req.tipo_sancion.lower().strip()

    articulos = []
    pasos = []

    # 1. Determinación de la sanción base plena
    if tipo == "correccion":
        articulos.append("Art. 644 E.T. (Sanción por Corrección)")
        if req.es_voluntario_sin_emplazamiento:
            tarifa_base = 0.10  # 10%
            sancion_plena = round(monto_base * 0.10)
            pasos.append(
                f"1. Sanción por corrección voluntaria: 10% sobre mayor valor (${monto_base:,.0f}) = ${sancion_plena:,.0f} COP."
            )
            sancion_emplazada = round(monto_base * 0.20)
        else:
            tarifa_base = 0.20  # 20% tras emplazamiento
            sancion_plena = round(monto_base * 0.20)
            pasos.append(
                f"1. Sanción por corrección tras emplazamiento DIAN: 20% sobre mayor valor (${monto_base:,.0f}) = ${sancion_plena:,.0f} COP."
            )
            sancion_emplazada = sancion_plena

    elif tipo == "extemporaneidad":
        if req.es_voluntario_sin_emplazamiento:
            articulos.append("Art. 641 E.T. (Extemporaneidad voluntaria)")
            tarifa_base = round(min(1.0, 0.05 * meses), 4)  # 5% por mes, tope 100%
            sancion_plena = round(min(monto_base * tarifa_base, monto_base * 1.0))
            pasos.append(
                f"1. Sanción extemporánea voluntaria: 5% x {meses} mes(es) ({tarifa_base * 100:.0f}%) sobre impuesto (${monto_base:,.0f}) = ${sancion_plena:,.0f} COP (Tope 100%)."
            )
            sancion_emplazada = round(min(monto_base * (0.10 * meses), monto_base * 2.0))
        else:
            articulos.append("Art. 642 E.T. (Extemporaneidad con emplazamiento)")
            tarifa_base = round(min(2.0, 0.10 * meses), 4)  # 10% por mes, tope 200%
            sancion_plena = round(min(monto_base * tarifa_base, monto_base * 2.0))
            pasos.append(
                f"1. Sanción extemporánea tras emplazamiento: 10% x {meses} mes(es) ({tarifa_base * 100:.0f}%) sobre impuesto (${monto_base:,.0f}) = ${sancion_plena:,.0f} COP (Tope 200%)."
            )
            sancion_emplazada = sancion_plena

    elif tipo == "inexactitud_facturas_falsas":
        articulos.append(
            "Arts. 647 y 648 Numeral 2 E.T. (Inexactitud por Facturas Falsas o Proveedores Ficticios)"
        )
        tarifa_base = 1.60  # 160%
        sancion_plena = round(monto_base * 1.60)
        sancion_emplazada = sancion_plena
        pasos.append(
            f"1. Sanción por inexactitud agravada (proveedores ficticios o compras simuladas): 160% sobre mayor valor (${monto_base:,.0f}) = ${sancion_plena:,.0f} COP."
        )

    elif tipo == "inexactitud_abuso":
        articulos.append(
            "Arts. 647 y 648 Numeral 1 E.T. (Inexactitud por Abuso en Materia Tributaria)"
        )
        tarifa_base = 2.00  # 200%
        sancion_plena = round(monto_base * 2.00)
        sancion_emplazada = sancion_plena
        pasos.append(
            f"1. Sanción por inexactitud por abuso tributario / fraude de ley: 200% sobre mayor valor (${monto_base:,.0f}) = ${sancion_plena:,.0f} COP."
        )

    elif tipo == "inexactitud_req_especial":
        articulos.append(
            "Arts. 647 y 709 E.T. (Inexactitud con Aceptación en Requerimiento Especial)"
        )
        tarifa_base = 0.35  # Reducción legal al 35%
        sancion_plena = round(monto_base * 0.35)
        sancion_emplazada = round(monto_base * 1.00)  # Si no aceptara pagaría el 100%
        pasos.append(
            f"1. Sanción por inexactitud reducida con respuesta al Requerimiento Especial (Art. 709 E.T.): 35% sobre mayor valor (${monto_base:,.0f}) = ${sancion_plena:,.0f} COP (frente al 100% ordinario de ${sancion_emplazada:,.0f})."
        )

    elif tipo == "inexactitud_recurso":
        articulos.append(
            "Arts. 647 y 710 E.T. (Inexactitud con Aceptación en Recurso de Reconsideración)"
        )
        tarifa_base = 0.70  # Reducción legal al 70%
        sancion_plena = round(monto_base * 0.70)
        sancion_emplazada = round(monto_base * 1.00)  # Si no aceptara pagaría el 100%
        pasos.append(
            f"1. Sanción por inexactitud reducida con interposición del Recurso de Reconsideración (Art. 710 E.T.): 70% sobre mayor valor (${monto_base:,.0f}) = ${sancion_plena:,.0f} COP (frente al 100% ordinario de ${sancion_emplazada:,.0f})."
        )

    else:
        # inexactitud_general (100%)
        articulos.append("Arts. 647 y 648 E.T. (Sanción General por Inexactitud)")
        tarifa_base = 1.00  # 100%
        sancion_plena = round(monto_base * 1.00)
        sancion_emplazada = sancion_plena
        pasos.append(
            f"1. Sanción general por inexactitud (omisión de ingresos o deducciones improcedentes): 100% sobre mayor valor (${monto_base:,.0f}) = ${sancion_plena:,.0f} COP."
        )

    # 2. Aplicación del Principio de Proporcionalidad y Gradualidad (Art. 640 E.T.)
    articulos.append("Art. 640 E.T. (Principio de Favorabilidad y Gradualidad)")

    # Excepción: Conductas de abuso o facturas falsas no tienen reducción por Art. 640 Parágrafo 3
    if tipo in ("inexactitud_facturas_falsas", "inexactitud_abuso"):
        factor_reduccion = 1.00
        pct_desc = 0.0
        pasos.append(
            "2. Sin reducción de Art. 640: El Parágrafo 3 del Art. 640 prohibe expresamente aplicar favorabilidad en conductas dolosas, abusivas o facturas falsas."
        )
    elif tipo in ("inexactitud_req_especial", "inexactitud_recurso"):
        factor_reduccion = 1.00
        pct_desc = 0.0
        pasos.append(
            "2. Reducción procesal especial: La tarifa liquidada ya incorpora la reducción legal fijada en los Arts. 709 o 710 E.T."
        )
    elif req.es_voluntario_sin_emplazamiento:
        if req.sin_sanciones_ultimos_2_anos:
            factor_reduccion = 0.50  # Paga el 50% (descuento del 50%)
            pct_desc = 50.0
            pasos.append(
                "2. Reducción Art. 640 Numeral 1 Literal a): Descuento del 50% por no haber cometido sanción en los últimos 2 años."
            )
        elif req.sin_sanciones_ultimo_1_ano:
            factor_reduccion = 0.75  # Paga el 75% (descuento del 25%)
            pct_desc = 25.0
            pasos.append(
                "2. Reducción Art. 640 Numeral 2 Literal a): Descuento del 25% por no haber cometido sanción en el último año."
            )
        else:
            factor_reduccion = 1.00
            pct_desc = 0.0
            pasos.append(
                "2. Sin reducción de Art. 640: Registra sanciones recientes, aplica tarifa plena."
            )
    else:
        # Tras emplazamiento
        if req.sin_sanciones_ultimos_2_anos:
            factor_reduccion = 0.70  # Paga el 70% (descuento del 30%)
            pct_desc = 30.0
            pasos.append(
                "2. Reducción Art. 640 Numeral 1 Literal b) (con emplazamiento): Descuento del 30% por no haber cometido sanción en los últimos 2 años."
            )
        elif req.sin_sanciones_ultimo_1_ano:
            factor_reduccion = 0.85  # Paga el 85% (descuento del 15%)
            pct_desc = 15.0
            pasos.append(
                "2. Reducción Art. 640 Numeral 2 Literal b) (con emplazamiento): Descuento del 15% por no haber cometido sanción en el último año."
            )
        else:
            factor_reduccion = 1.00
            pct_desc = 0.0
            pasos.append("2. Sin reducción de Art. 640.")

    sancion_con_reduccion = sancion_plena * factor_reduccion
    ahorro_art640 = max(0.0, sancion_plena - sancion_con_reduccion)

    # 3. Control de Sanción Mínima DIAN (Art. 639 E.T. = 10 UVT)
    articulos.append("Art. 639 E.T. (Sanción Mínima Legal 10 UVT)")
    if sancion_con_reduccion < sancion_minima_cop:
        sancion_final = sancion_minima_cop
        aplico_minima = True
        pasos.append(
            f"3. Sanción Mínima: El valor calculado (${sancion_con_reduccion:,.0f}) es inferior a 10 UVT (${sancion_minima_cop:,.0f}), por lo que se ajusta a la sanción mínima legal."
        )
    else:
        sancion_final = round(sancion_con_reduccion / 1000.0) * 1000.0
        aplico_minima = False
        pasos.append(f"3. Sanción final ajustada al múltiplo de mil: ${sancion_final:,.0f} COP.")

    # 4. Cálculo de Intereses de Mora (Arts. 634 y 635 E.T.)
    dias_mora = max(1, req.dias_mora) if req.dias_mora > 0 else meses * 30
    tasa_ea = max(0.0, req.tasa_interes_anual_pct)
    intereses_mora_cop = 0.0

    if req.es_saldo_a_favor:
        articulos.append("Art. 634 E.T. (Inaplicabilidad de Intereses en Saldo a Favor)")
        pasos.append(
            "4. Intereses Moratorios: $0 COP. Las declaraciones con Saldo a Favor o sin impuesto a pagar no generan intereses moratorios (Art. 634 E.T.)."
        )
        total_consolidado_cop = sancion_final
    elif req.incluir_intereses_mora and monto_base > 0 and dias_mora > 0:
        articulos.append("Arts. 634 y 635 E.T. (Intereses Moratorios Diarios Compuestos)")
        # Fórmula de interés compuesto diario: I = K * ((1 + r_ea)^(D / 365) - 1)
        tasa_decimal = tasa_ea / 100.0
        factor_compuesto = ((1.0 + tasa_decimal) ** (dias_mora / 365.0)) - 1.0
        intereses_mora_cop = round((monto_base * factor_compuesto) / 1000.0) * 1000.0
        pasos.append(
            f"4. Intereses Moratorios: Tasa efectiva anual de {tasa_ea:.2f}% E.A. aplicada por {dias_mora} días calendario sobre capital adeudado (${monto_base:,.0f}) = ${intereses_mora_cop:,.0f} COP."
        )
        pasos.append(
            "💡 Regla DIAN / Consejo de Estado: Los intereses de mora se liquidan exclusivamente sobre el impuesto o mayor valor a cargo (capital principal), NUNCA sobre la sanción."
        )
        total_consolidado_cop = monto_base + sancion_final + intereses_mora_cop
    else:
        total_consolidado_cop = monto_base + sancion_final

    # Comparativa con emplazamiento
    ahorro_voluntario = max(0.0, sancion_emplazada - sancion_final)

    exp = (
        f"La sanción liquidada a pagar es de ${sancion_final:,.0f} COP"
        + (
            f" más ${intereses_mora_cop:,.0f} COP de intereses moratorios por {dias_mora} días de mora"
            if (req.incluir_intereses_mora and not req.es_saldo_a_favor and intereses_mora_cop > 0)
            else ""
        )
        + (
            f", para un gran total consolidado de ${total_consolidado_cop:,.0f} COP (incluyendo capital adeudado de ${monto_base:,.0f} COP)."
            if not req.es_saldo_a_favor
            else f", para un gran total a pagar de ${total_consolidado_cop:,.0f} COP (únicamente sanción, sin intereses por saldo a favor)."
        )
        + f" Al corregir/declarar voluntariamente antes de actuación coactiva de la DIAN y contar con historial favorable, "
        f"obtuviste un ahorro estimado de ${ahorro_voluntario:,.0f} COP en la sanción."
    )

    return LiquidacionSancionResponse(
        tipo_sancion=tipo,
        tax_year=req.tax_year,
        uvt_value=uvt,
        monto_base_cop=monto_base,
        meses_retraso=meses,
        es_voluntario=req.es_voluntario_sin_emplazamiento,
        tarifa_base_pct=tarifa_base * 100.0,
        sancion_plena_sin_reduccion_cop=sancion_plena,
        porcentaje_reduccion_art640_pct=pct_desc,
        sancion_con_reduccion_cop=sancion_con_reduccion,
        sancion_minima_dian_cop=sancion_minima_cop,
        sancion_final_a_pagar_cop=sancion_final,
        aplico_sancion_minima=aplico_minima,
        ahorro_favorabilidad_art640_cop=ahorro_art640,
        comparativa_sancion_con_emplazamiento_dian_cop=sancion_emplazada,
        ahorro_por_corregir_antes_de_dian_cop=ahorro_voluntario,
        incluye_intereses_mora=req.incluir_intereses_mora,
        dias_mora=dias_mora,
        tasa_interes_anual_pct=tasa_ea,
        intereses_mora_cop=intereses_mora_cop,
        total_consolidado_a_pagar_cop=total_consolidado_cop,
        articulos_aplicados=articulos,
        explicacion_didactica=exp,
        pasos_calculo=pasos,
    )


def calcular_exencion_inmueble_afc(
    req: SimulacionInmuebleAfcRequest,
) -> SimulacionInmuebleAfcResponse:
    """Calcula la exención de Ganancia Ocasional por venta de casa/apto de habitación consignada en AFC (Art. 311-1)."""
    from app.core.rules_engine.loader import get_rules_for_year

    rules = get_rules_for_year(req.tax_year, req.custom_uvt)
    uvt = rules.uvt_value

    tope_5000_uvt_cop = round(5000.0 * uvt)
    precio_venta = max(0.0, req.precio_venta_cop)
    costo_fiscal = max(0.0, req.costo_fiscal_inmueble_cop)
    ganancia_bruta = max(0.0, precio_venta - costo_fiscal)
    monto_afc = max(0.0, req.monto_depositado_afc_o_vivienda_cop)

    pasos = [
        f"1. Determinación de la Ganancia Ocasional Bruta: Precio de venta (${precio_venta:,.0f}) - Costo fiscal (${costo_fiscal:,.0f}) = ${ganancia_bruta:,.0f} COP.",
    ]

    # Validar condiciones del Art. 311-1 E.T.
    if req.es_vivienda_habitacion and req.posesion_mas_2_anos and ganancia_bruta > 0:
        # Exención limitada al menor entre: monto depositado en AFC, ganancia bruta y 5.000 UVT
        ganancia_exenta = min(monto_afc, ganancia_bruta, float(tope_5000_uvt_cop))
        pasos.append(
            f"2. Aplicación del Art. 311-1 E.T.: El contribuyente cumple los requisitos (vivienda de habitación poseída por 2+ años). "
            f"La utilidad exenta es el menor entre el valor depositado en AFC (${monto_afc:,.0f}), la utilidad (${ganancia_bruta:,.0f}) "
            f"y el tope legal de 5.000 UVT (${tope_5000_uvt_cop:,.0f}) => Exención calculada: ${ganancia_exenta:,.0f} COP."
        )
    else:
        ganancia_exenta = 0.0
        if not req.posesion_mas_2_anos:
            pasos.append(
                "2. El activo fue poseído por menos de 2 años, por lo que tributa como renta ordinaria en cédula general y no aplica el Art. 311-1."
            )
        elif not req.es_vivienda_habitacion:
            pasos.append(
                "2. El inmueble no corresponde a la casa o apartamento de habitación del contribuyente (Art. 311-1 aplica exclusivamente a vivienda personal)."
            )

    ganancia_gravada = max(0.0, ganancia_bruta - ganancia_exenta)
    tarifa_go = 0.15  # 15% Ley 2277 de 2022

    impuesto_sin_afc = round(ganancia_bruta * tarifa_go)
    impuesto_con_afc = round(ganancia_gravada * tarifa_go)
    ahorro = max(0, impuesto_sin_afc - impuesto_con_afc)

    pasos.append(
        f"3. Liquidación del Impuesto de Ganancia Ocasional (Tarifa 15%): "
        f"Base gravable final = ${ganancia_gravada:,.0f} COP => Impuesto a pagar = ${impuesto_con_afc:,.0f} COP. "
        f"(Sin el beneficio AFC habría pagado ${impuesto_sin_afc:,.0f} COP, logrando un ahorro directo de ${ahorro:,.0f} COP)."
    )

    requisitos = [
        "El inmueble enajenado debe corresponder a la casa o apartamento de habitación del contribuyente.",
        "Haber poseído el inmueble durante al menos dos (2) años continuos a la fecha de la escritura.",
        "Depositar la totalidad o parte de la utilidad en una Cuenta de Ahorro para el Fomento de la Construcción (AFC), o destinarla directamente al pago de un crédito hipotecario o compra de otra vivienda de habitación.",
        "El retiro de los fondos de la cuenta AFC debe destinarse exclusivamente a la adquisición de otra vivienda de habitación dentro de los plazos fijados por la DIAN o permanecer al menos 10 años en la cuenta.",
    ]

    advertencias = [
        "Si retira los recursos de la cuenta AFC para fines distintos a vivienda antes de 10 años, el banco retendrá el 15% del impuesto más sanciones e intereses.",
        "En la notaría se practica una retención en la fuente del 1% por enajenación de activos fijos (Art. 398 E.T.), la cual podrá imputarse en la declaración de renta como anticipo.",
        "El tope de 5.000 UVT opera por contribuyente y por el año gravable de la venta.",
    ]

    return SimulacionInmuebleAfcResponse(
        tax_year=req.tax_year,
        uvt_value=uvt,
        precio_venta_cop=precio_venta,
        costo_fiscal_cop=costo_fiscal,
        ganancia_ocasional_bruta_cop=ganancia_bruta,
        es_vivienda_habitacion=req.es_vivienda_habitacion,
        posesion_mas_2_anos=req.posesion_mas_2_anos,
        monto_depositado_afc_cop=monto_afc,
        tope_maximo_exencion_uvt=5000.0,
        tope_maximo_exencion_cop=float(tope_5000_uvt_cop),
        ganancia_ocasional_exenta_cop=ganancia_exenta,
        ganancia_ocasional_gravada_final_cop=ganancia_gravada,
        tarifa_ganancia_ocasional_pct=tarifa_go * 100.0,
        impuesto_go_sin_afc_cop=float(impuesto_sin_afc),
        impuesto_go_con_afc_cop=float(impuesto_con_afc),
        ahorro_impuesto_afc_cop=float(ahorro),
        requisitos_estatuto=requisitos,
        advertencias_legales=advertencias,
        explicacion_paso_a_paso=pasos,
    )


def calcular_beneficio_auditoria(req: BeneficioAuditoriaRequest) -> BeneficioAuditoriaResponse:
    from app.core.rules_engine.loader import get_rules_for_year

    rules = get_rules_for_year(req.tax_year, req.custom_uvt)
    uvt = rules.uvt_value
    aud_rules = rules.beneficio_auditoria

    impuesto_ant = req.impuesto_neto_ano_anterior
    impuesto_min_cop = aud_rules.impuesto_minimo_uvt * uvt  # 71 UVT
    cumple_minimo = impuesto_ant >= impuesto_min_cop

    # Firmeza 6 meses (+35%)
    obj_6m = round(impuesto_ant * (1.0 + aud_rules.incremento_6_meses_pct) / 1000.0) * 1000.0
    inc_6m = max(0.0, obj_6m - impuesto_ant)

    # Firmeza 12 meses (+25%)
    obj_12m = round(impuesto_ant * (1.0 + aud_rules.incremento_12_meses_pct) / 1000.0) * 1000.0
    inc_12m = max(0.0, obj_12m - impuesto_ant)

    if cumple_minimo:
        rec = (
            f"Para obtener firmeza en 6 MESES, tu Impuesto Neto de Renta debe ser de al menos ${obj_6m:,.0f} COP (+35%). "
            f"Para firmeza en 12 MESES, debe ser de al menos ${obj_12m:,.0f} COP (+25%)."
        )
    else:
        rec = (
            f"El impuesto del año anterior (${impuesto_ant:,.0f} COP) es inferior al mínimo legal de 71 UVT (${impuesto_min_cop:,.0f} COP). "
            "No es posible acogerse al Beneficio de Auditoría este año."
        )

    return BeneficioAuditoriaResponse(
        tax_year=req.tax_year,
        uvt_value=uvt,
        impuesto_neto_ano_anterior=impuesto_ant,
        impuesto_minimo_requerido_uvt=aud_rules.impuesto_minimo_uvt,
        impuesto_minimo_requerido_cop=impuesto_min_cop,
        cumple_impuesto_minimo=cumple_minimo,
        impuesto_objetivo_6_meses_cop=obj_6m if cumple_minimo else 0.0,
        incremento_requerido_6_meses_cop=inc_6m if cumple_minimo else 0.0,
        impuesto_objetivo_12_meses_cop=obj_12m if cumple_minimo else 0.0,
        incremento_requerido_12_meses_cop=inc_12m if cumple_minimo else 0.0,
        requisitos_legales=[
            "Presentar la declaración dentro de los plazos fijados por el Gobierno Nacional.",
            "Realizar el pago total del saldo a pagar dentro de los plazos legales.",
            "Que el impuesto neto del año gravable anterior haya sido igual o superior a 71 UVT.",
            "No haber solicitado devoluciones improcedentes ni compensado pérdidas inexistentes.",
        ],
        recomendacion=rec,
    )


def calcular_reduccion_sancion(req: ReduccionSancionRequest) -> ReduccionSancionResponse:
    sancion_base = req.monto_sancion_base_cop

    if req.sin_sanciones_ultimos_2_anos:
        pct_aplicar = 0.50
        sancion_final = sancion_base * 0.50
        exp = "Aplica reducción al 50% según Art. 640 Numeral 1 literal a) por no tener sanciones en los últimos 2 años."
    elif req.sin_sanciones_ultimo_1_ano:
        pct_aplicar = 0.75
        sancion_final = sancion_base * 0.75
        exp = "Aplica reducción al 75% según Art. 640 Numeral 2 literal a) por no tener sanciones en el último año."
    else:
        pct_aplicar = 1.00
        sancion_final = sancion_base
        exp = "No aplica reducción del Art. 640 por tener historial de sanciones recientes. Se liquida la sanción plena."

    ahorro = max(0.0, sancion_base - sancion_final)

    return ReduccionSancionResponse(
        monto_sancion_plena_cop=sancion_base,
        porcentaje_reduccion_aplicado=(1.0 - pct_aplicar) * 100.0,
        sancion_final_reducida_cop=sancion_final,
        ahorro_sancion_cop=ahorro,
        articulo_aplicable="Art. 640 y 644 del Estatuto Tributario",
        explicacion=exp,
    )
