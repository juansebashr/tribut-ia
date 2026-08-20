from pydantic import BaseModel, Field


class BeneficioItem(BaseModel):
    id: str
    categoria: (
        str  # "incrngo", "deducciones", "rentas_exentas", "descuentos", "auditoria_sanciones"
    )
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


def get_catalogo_beneficios() -> list[BeneficioItem]:
    return [
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
