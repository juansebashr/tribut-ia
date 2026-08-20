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
