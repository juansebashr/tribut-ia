from app.core.rules_engine.loader import get_rules_for_year
from app.models.common import AuditTraceItem
from app.models.tributacion_pareja import (
    AnalisisRiesgoPatrimonialConyugal,
    ConyugeFinanzasInput,
    EscenarioTributarioPareja,
    LiquidacionIndividualConyuge,
    TributacionParejaRequest,
    TributacionParejaResponse,
)


def _calcular_impuesto_tabla_241(
    renta_gravable_uvt: float, uvt_value: float
) -> tuple[float, float]:
    """Calcula el impuesto de renta según la tabla progresiva del Art. 241 del Estatuto Tributario.

    Retorna (impuesto_cop, tarifa_marginal_pct).
    """
    if renta_gravable_uvt <= 1090.0:
        return 0.0, 0.0
    elif renta_gravable_uvt <= 1700.0:
        imp_uvt = (renta_gravable_uvt - 1090.0) * 0.19
        return round((imp_uvt * uvt_value) / 1000) * 1000, 19.0
    elif renta_gravable_uvt <= 4100.0:
        imp_uvt = ((renta_gravable_uvt - 1700.0) * 0.28) + 116.0
        return round((imp_uvt * uvt_value) / 1000) * 1000, 28.0
    elif renta_gravable_uvt <= 8670.0:
        imp_uvt = ((renta_gravable_uvt - 4100.0) * 0.33) + 788.0
        return round((imp_uvt * uvt_value) / 1000) * 1000, 33.0
    elif renta_gravable_uvt <= 18970.0:
        imp_uvt = ((renta_gravable_uvt - 8670.0) * 0.35) + 2296.0
        return round((imp_uvt * uvt_value) / 1000) * 1000, 35.0
    elif renta_gravable_uvt <= 31000.0:
        imp_uvt = ((renta_gravable_uvt - 18970.0) * 0.37) + 5901.0
        return round((imp_uvt * uvt_value) / 1000) * 1000, 37.0
    else:
        imp_uvt = ((renta_gravable_uvt - 31000.0) * 0.39) + 10352.0
        return round((imp_uvt * uvt_value) / 1000) * 1000, 39.0


def _liquidar_conyuge_individual(
    conyuge: ConyugeFinanzasInput,
    rentas_capital_asignadas: float,
    costos_capital_asignados: float,
    intereses_vivienda_asignados: float,
    uvt_value: float,
) -> LiquidacionIndividualConyuge:
    """Realiza la depuración individual de la cédula general de un cónyuge."""
    # 1. Ingresos Laborales Netos de INCRNGO
    ingresos_laborales_netos = max(
        0.0,
        conyuge.ingresos_laborales_anuales - conyuge.aportes_seguridad_social_salud_pension,
    )

    # 2. Rentas de Capital Netas
    rentas_capital_netas = max(0.0, rentas_capital_asignadas - costos_capital_asignados)

    # 3. Renta Bruta Cédula General
    renta_bruta = ingresos_laborales_netos + rentas_capital_netas

    if renta_bruta <= 0.0:
        return LiquidacionIndividualConyuge(
            nombre=conyuge.nombre,
            ingresos_laborales_netos=0.0,
            rentas_capital_asignadas=0.0,
            costos_capital_asignados=0.0,
            renta_bruta_cedula_general=0.0,
            total_deducciones_y_exentas_aplicadas=0.0,
            renta_liquida_gravable_cop=0.0,
            renta_liquida_gravable_uvt=0.0,
            impuesto_renta_determinado_cop=0.0,
            tarifa_marginal_maxima_aplicada_pct=0.0,
            tarifa_efectiva_tributacion_pct=0.0,
            tramo_cero_uvt_aprovechado=0.0,
        )

    # 4. Deducciones y Exentas sujetas al límite del 40% / 1.340 UVT
    # Dependiente general Art. 387 (10% ingresos laborales brutos hasta 384 UVT)
    deduccion_dependiente_general = 0.0
    if conyuge.tiene_dependiente_general_387 and conyuge.ingresos_laborales_anuales > 0:
        tope_384_uvt = 384.0 * uvt_value
        deduccion_dependiente_general = min(
            conyuge.ingresos_laborales_anuales * 0.10,
            tope_384_uvt,
        )

    # Intereses de vivienda Art. 119 (hasta 1.200 UVT)
    tope_intereses_1200_uvt = 1200.0 * uvt_value
    deduccion_intereses_vivienda = min(intereses_vivienda_asignados, tope_intereses_1200_uvt)

    # Suma de deducciones y exentas sujetas al 40%
    subtotal_deducciones_sujetas_40 = (
        deduccion_dependiente_general
        + deduccion_intereses_vivienda
        + conyuge.otras_deducciones_y_exentas_cedula_general
    )

    # Límite del 40% y 1.340 UVT
    tope_40_pct = renta_bruta * 0.40
    tope_1340_uvt = 1340.0 * uvt_value
    limite_aceptado_40 = min(subtotal_deducciones_sujetas_40, tope_40_pct, tope_1340_uvt)

    # 5. Deducción adicional de 72 UVT por dependiente (Art. 336 num. 2 - Ley 2277 de 2022)
    # Esta deducción no está sujeta al límite del 40%
    deduccion_72uvt_adicional = (
        min(4, conyuge.numero_dependientes_adicionales_72uvt) * 72.0 * uvt_value
    )

    total_deducciones_y_exentas = limite_aceptado_40 + deduccion_72uvt_adicional

    # 6. Renta Líquida Gravable
    renta_liquida_gravable = max(0.0, renta_bruta - total_deducciones_y_exentas)
    renta_liquida_gravable_uvt = (
        round(renta_liquida_gravable / uvt_value, 2) if uvt_value > 0 else 0.0
    )

    # 7. Liquidación del Impuesto de Renta Art. 241
    impuesto_cop, tarifa_marginal = _calcular_impuesto_tabla_241(
        renta_liquida_gravable_uvt, uvt_value
    )

    tarifa_efectiva = round((impuesto_cop / renta_bruta) * 100.0, 2) if renta_bruta > 0 else 0.0
    tramo_cero_aprovechado = min(renta_liquida_gravable_uvt, 1090.0)

    return LiquidacionIndividualConyuge(
        nombre=conyuge.nombre,
        ingresos_laborales_netos=round(ingresos_laborales_netos, 2),
        rentas_capital_asignadas=round(rentas_capital_asignadas, 2),
        costos_capital_asignados=round(costos_capital_asignados, 2),
        renta_bruta_cedula_general=round(renta_bruta, 2),
        total_deducciones_y_exentas_aplicadas=round(total_deducciones_y_exentas, 2),
        renta_liquida_gravable_cop=round(renta_liquida_gravable, 2),
        renta_liquida_gravable_uvt=round(renta_liquida_gravable_uvt, 2),
        impuesto_renta_determinado_cop=round(impuesto_cop, 2),
        tarifa_marginal_maxima_aplicada_pct=tarifa_marginal,
        tarifa_efectiva_tributacion_pct=tarifa_efectiva,
        tramo_cero_uvt_aprovechado=round(tramo_cero_aprovechado, 2),
    )


def simular_tributacion_pareja(
    payload: TributacionParejaRequest,
) -> TributacionParejaResponse:
    """Ejecuta la simulación comparativa de tributación en pareja y planeación conyugal.

    Compara:
    1. Escenario No Optimizado: Rentas de capital concentradas 100% en Cónyuge A, sin planeación.
    2. Escenario Optimizado: Rentas de capital al 50/50 (copropiedad proindiviso), deducción de
       intereses y dependientes distribuida para maximizar el aprovechamiento de tramos del 0%.
    """
    rules = get_rules_for_year(payload.tax_year)
    uvt = (
        payload.custom_uvt
        if (payload.custom_uvt and payload.custom_uvt > 0)
        else getattr(rules, "uvt_value", 52350.0)
    )

    # -------------------------------------------------------------------------
    # ESCENARIO 1: NO OPTIMIZADO (CONCENTRADO)
    # -------------------------------------------------------------------------
    # En el escenario no optimizado:
    # - Cónyuge A asume el 100% de las rentas de capital familiares y sus costos.
    # - Cónyuge B no tiene rentas de capital asignadas.
    # - Intereses de vivienda asignados 50/50 de forma pasiva o sin optimizar.
    mitad_intereses = payload.intereses_credito_vivienda_conjunto_anual * 0.5
    liq_no_opt_a = _liquidar_conyuge_individual(
        conyuge=payload.conyuge_a,
        rentas_capital_asignadas=payload.rentas_capital_conjuntas_arriendos_intereses,
        costos_capital_asignados=payload.costos_procedentes_rentas_capital,
        intereses_vivienda_asignados=mitad_intereses,
        uvt_value=uvt,
    )

    liq_no_opt_b = _liquidar_conyuge_individual(
        conyuge=payload.conyuge_b,
        rentas_capital_asignadas=0.0,
        costos_capital_asignados=0.0,
        intereses_vivienda_asignados=mitad_intereses,
        uvt_value=uvt,
    )

    total_impuesto_no_opt = (
        liq_no_opt_a.impuesto_renta_determinado_cop + liq_no_opt_b.impuesto_renta_determinado_cop
    )
    total_renta_no_opt = (
        liq_no_opt_a.renta_bruta_cedula_general + liq_no_opt_b.renta_bruta_cedula_general
    )
    tarifa_efectiva_familiar_no_opt = (
        round((total_impuesto_no_opt / total_renta_no_opt) * 100.0, 2)
        if total_renta_no_opt > 0
        else 0.0
    )

    escenario_no_opt = EscenarioTributarioPareja(
        nombre_escenario="Escenario Tradicional / Sin Planificación",
        descripcion="El cónyuge con mayores ingresos concentra el 100% de las rentas de capital de los activos familiares, tributando en los tramos marginales más altos.",
        conyuge_a=liq_no_opt_a,
        conyuge_b=liq_no_opt_b,
        total_impuesto_familiar_cop=round(total_impuesto_no_opt, 2),
        total_renta_gravable_familiar_cop=round(
            liq_no_opt_a.renta_liquida_gravable_cop + liq_no_opt_b.renta_liquida_gravable_cop, 2
        ),
        tarifa_efectiva_familiar_pct=tarifa_efectiva_familiar_no_opt,
    )

    # -------------------------------------------------------------------------
    # ESCENARIO 2: OPTIMIZADO (PLANEACIÓN CONYUGAL INTELIGENTE)
    # -------------------------------------------------------------------------
    # - Rentas de capital divididas 50/50 por copropiedad / proindiviso.
    # - Costos de capital divididos 50/50.
    # - Intereses de vivienda asignados según selección estratégica (por defecto 100% al de mayor tasa).
    intereses_opt_a = 0.0
    intereses_opt_b = 0.0
    if payload.distribucion_intereses_vivienda == "100_CONYUGE_A":
        intereses_opt_a = payload.intereses_credito_vivienda_conjunto_anual
    elif payload.distribucion_intereses_vivienda == "100_CONYUGE_B":
        intereses_opt_b = payload.intereses_credito_vivienda_conjunto_anual
    else:
        intereses_opt_a = mitad_intereses
        intereses_opt_b = mitad_intereses

    mitad_rentas_capital = payload.rentas_capital_conjuntas_arriendos_intereses * 0.5
    mitad_costos_capital = payload.costos_procedentes_rentas_capital * 0.5

    liq_opt_a = _liquidar_conyuge_individual(
        conyuge=payload.conyuge_a,
        rentas_capital_asignadas=mitad_rentas_capital,
        costos_capital_asignados=mitad_costos_capital,
        intereses_vivienda_asignados=intereses_opt_a,
        uvt_value=uvt,
    )

    liq_opt_b = _liquidar_conyuge_individual(
        conyuge=payload.conyuge_b,
        rentas_capital_asignadas=mitad_rentas_capital,
        costos_capital_asignados=mitad_costos_capital,
        intereses_vivienda_asignados=intereses_opt_b,
        uvt_value=uvt,
    )

    total_impuesto_opt = (
        liq_opt_a.impuesto_renta_determinado_cop + liq_opt_b.impuesto_renta_determinado_cop
    )
    total_renta_opt = liq_opt_a.renta_bruta_cedula_general + liq_opt_b.renta_bruta_cedula_general
    tarifa_efectiva_familiar_opt = (
        round((total_impuesto_opt / total_renta_opt) * 100.0, 2) if total_renta_opt > 0 else 0.0
    )

    escenario_opt = EscenarioTributarioPareja(
        nombre_escenario="Escenario de Planeación Conyugal Optimizada",
        descripcion="Rentas de capital repartidas 50/50 (copropiedad proindiviso) para aprovechar duplicadamente el tramo del 0% (hasta 1.090 UVT cada uno) y concentración de deducciones de vivienda en la mayor tasa marginal.",
        conyuge_a=liq_opt_a,
        conyuge_b=liq_opt_b,
        total_impuesto_familiar_cop=round(total_impuesto_opt, 2),
        total_renta_gravable_familiar_cop=round(
            liq_opt_a.renta_liquida_gravable_cop + liq_opt_b.renta_liquida_gravable_cop, 2
        ),
        tarifa_efectiva_familiar_pct=tarifa_efectiva_familiar_opt,
    )

    # -------------------------------------------------------------------------
    # AHORRO FAMILIAR NETO
    # -------------------------------------------------------------------------
    ahorro_familiar_cop = max(0.0, total_impuesto_no_opt - total_impuesto_opt)
    porcentaje_ahorro = (
        round((ahorro_familiar_cop / total_impuesto_no_opt) * 100.0, 2)
        if total_impuesto_no_opt > 0
        else 0.0
    )

    # -------------------------------------------------------------------------
    # ANÁLISIS DE RIESGO PATRIMONIAL CONYUGAL (Arts. 236 y 302 E.T.)
    # -------------------------------------------------------------------------
    riesgo_desajuste = False
    monto_desajuste = 0.0
    riesgo_donacion = False
    impuesto_donacion = 0.0
    diagnostico = ""
    solucion = ""

    if payload.esquema_adquisicion_activo == "TITULARIDAD_EXCLUSIVA_SIN_FONDOS":
        # Cónyuge B adquiere el activo al 100% pero sus ingresos netos no alcanzan para justificarlo
        capacidad_conyuge_b = (
            liq_opt_b.ingresos_laborales_netos + liq_opt_b.rentas_capital_asignadas
        )
        if payload.valor_activo_adquirido_en_el_ano > capacidad_conyuge_b:
            riesgo_desajuste = True
            monto_desajuste = max(
                0.0, payload.valor_activo_adquirido_en_el_ano - capacidad_conyuge_b
            )
            riesgo_donacion = True
            # Donación gravada al 15% como ganancia ocasional (Art. 302 y 313 E.T.)
            # Exención Art. 307 num. 4: 20% del valor donado hasta máx 1.625 UVT
            exencion_donacion = min(monto_desajuste * 0.20, 1625.0 * uvt)
            base_donacion_gravable = max(0.0, monto_desajuste - exencion_donacion)
            impuesto_donacion = round((base_donacion_gravable * 0.15) / 1000) * 1000

            diagnostico = (
                f"ALERTA CRÍTICA: Cónyuge B figura como titular del 100% del activo (${payload.valor_activo_adquirido_en_el_ano:,.0f} COP), "
                f"pero sus ingresos del año solo justifican ${capacidad_conyuge_b:,.0f} COP. "
                f"La DIAN detectará un desajuste por comparación patrimonial de ${monto_desajuste:,.0f} COP (Arts. 236 y 237 E.T.) "
                f"o presumirá una donación no declarada con impuesto de Ganancia Ocasional de ${impuesto_donacion:,.0f} COP (Art. 302 E.T.)."
            )
            solucion = (
                "Reestructurar la titularidad: 1) Escriturar en Copropiedad / Proindiviso (50/50 u 80/20) según el aporte real de cada uno, o "
                "2) Suscribir un Contrato de Mutuo (préstamo entre cónyuges) con documento de fecha cierta ante notaría, "
                "registrando el pasivo en el cónyuge titular y la cuenta por cobrar en el aportante."
            )
        else:
            diagnostico = "Los ingresos del cónyuge titular son suficientes para respaldar la adquisición del activo."
            solucion = "Conservar los soportes de pago y extractos bancarios del año."
    elif payload.esquema_adquisicion_activo == "COPROPIEDAD_PROINDIVISO_50_50":
        diagnostico = (
            "ESTRUCTURA BLINDADA: La titularidad en proindiviso 50/50 distribuye el costo fiscal y el patrimonio entre ambos cónyuges. "
            "Cada uno justifica únicamente su cuota parte ($"
            + f"{payload.valor_activo_adquirido_en_el_ano * 0.5:,.0f} COP), reduciendo a cero el riesgo de comparación patrimonial."
        )
        solucion = "Asegurar que la escritura pública de compraventa establezca explícitamente el porcentaje de participación del 50% para cada uno."
    else:  # MUTUO_PRESTAMO_CON_FECHA_CIERTA
        diagnostico = (
            "ESTRUCTURA DE FINANCIACIÓN CONYUGAL VÁLIDA: El cónyuge titular declara el activo en su patrimonio bruto y paralelamente "
            f"un pasivo (deuda) por ${payload.valor_activo_adquirido_en_el_ano:,.0f} COP a favor de su cónyuge. "
            "El cónyuge aportante declara una cuenta por cobrar (activo). Ambos patrimonios líquidos permanecen equilibrados."
        )
        solucion = "Firmar contrato de mutuo con reconocimiento de firma y fecha cierta ante notario público para tener plena validez probatoria ante la DIAN (Art. 283 E.T.)."

    analisis_riesgo = AnalisisRiesgoPatrimonialConyugal(
        riesgo_comparacion_patrimonial_conyuge_titular=riesgo_desajuste,
        monto_desajuste_potencial_cop=round(monto_desajuste, 2),
        riesgo_donacion_involuntaria_art302=riesgo_donacion,
        impuesto_ganancia_ocasional_donacion_cop=round(impuesto_donacion, 2),
        diagnostico_legal=diagnostico,
        solucion_recomendada=solucion,
    )

    # Estrategias aplicadas
    estrategias = [
        "Aprovechamiento duplicado de los primeros 1.090 UVT exentos (0% de tarifa) del Art. 241 E.T.",
        "Distribución del límite del 40% de rentas exentas (hasta 1.340 UVT) en dos declaraciones independientes.",
        f"Optimización de la deducción de intereses de crédito de vivienda (Art. 119 E.T.) bajo esquema '{payload.distribucion_intereses_vivienda}'.",
        "Estructuración de copropiedad / proindiviso para evitar presunciones de renta por comparación patrimonial (Arts. 236 y 237 E.T.).",
    ]

    # Recomendaciones legales
    recomendaciones = [
        "Principio de Individualidad (Art. 8 E.T.): Recordar que en Colombia no existen declaraciones conjuntas de esposos; cada cónyuge declara únicamente los bienes e ingresos bajo su titularidad legal.",
        "Cuentas Bancarias Mancomunadas: En el reporte de información exógena DIAN (Formatos 1008/1009), los bancos reportan al titular principal o al 50/50. Asegurar que ambos declaren el porcentaje exacto y no dupliquen saldos.",
        "Contrato de Mutuo entre Cónyuges (Art. 283 E.T.): Si un cónyuge financia la compra de un bien a nombre del otro, formalizar un contrato de mutuo sin intereses con fecha cierta para justificar el pasivo.",
        "Venta de Casa de Habitación en Copropiedad (Art. 311-1 E.T.): Si el inmueble familiar está al 50/50, ambos cónyuges pueden beneficiarse individualmente de hasta 5.000 UVT de ganancia ocasional exenta cada uno (hasta 10.000 UVT combinadas).",
        "Gananciales (Art. 47 E.T.): La repartición 50/50 de bienes como gananciales es INCRNGO únicamente en la liquidación formal de la sociedad conyugal por divorcio, disolución voluntaria o fallecimiento.",
    ]

    # Trace
    trace = [
        AuditTraceItem(
            step_id="individualidad_fiscal_art8",
            title="1. Principio de Individualidad Fiscal Conyugal",
            statutory_reference="Art. 8 E.T., Sentencia C-875 de 2005",
            raw_input_cop=total_renta_no_opt,
            calculated_cop=total_renta_no_opt,
            final_allowed_cop=total_renta_no_opt,
            notes="Cada cónyuge es sujeto gravable individual e independiente. No existen declaraciones conjuntas en Colombia.",
        ),
        AuditTraceItem(
            step_id="escenario_no_optimizado",
            title="2. Liquidación Escenario Tradicional (Concentrado)",
            statutory_reference="Art. 241 E.T.",
            raw_input_cop=total_impuesto_no_opt,
            calculated_cop=total_impuesto_no_opt,
            final_allowed_cop=total_impuesto_no_opt,
            notes=f"Impuesto Cónyuge A (${liq_no_opt_a.impuesto_renta_determinado_cop:,.0f}) + Cónyuge B (${liq_no_opt_b.impuesto_renta_determinado_cop:,.0f}) = Total Familiar de ${total_impuesto_no_opt:,.0f} COP.",
        ),
        AuditTraceItem(
            step_id="escenario_optimizado",
            title="3. Liquidación Escenario Conyugal Optimizado",
            statutory_reference="Art. 241, 119, 387 E.T.",
            raw_input_cop=total_impuesto_opt,
            calculated_cop=total_impuesto_opt,
            final_allowed_cop=total_impuesto_opt,
            notes=f"Impuesto Cónyuge A (${liq_opt_a.impuesto_renta_determinado_cop:,.0f}) + Cónyuge B (${liq_opt_b.impuesto_renta_determinado_cop:,.0f}) = Total Familiar Optimizado de ${total_impuesto_opt:,.0f} COP.",
        ),
        AuditTraceItem(
            step_id="ahorro_tributario_neto",
            title="4. Ahorro Tributario Familiar Consolidado",
            statutory_reference="Arts. 8, 241 E.T.",
            raw_input_cop=ahorro_familiar_cop,
            calculated_cop=ahorro_familiar_cop,
            final_allowed_cop=ahorro_familiar_cop,
            notes=f"Ahorro neto anual de ${ahorro_familiar_cop:,.0f} COP ({porcentaje_ahorro}% de reducción en el impuesto familiar).",
        ),
        AuditTraceItem(
            step_id="analisis_riesgo_patrimonial",
            title="5. Control de Riesgo Patrimonial y Donaciones",
            statutory_reference="Arts. 236, 237, 302 E.T.",
            raw_input_cop=monto_desajuste,
            calculated_cop=impuesto_donacion,
            final_allowed_cop=impuesto_donacion,
            notes=diagnostico,
        ),
    ]

    return TributacionParejaResponse(
        tax_year=payload.tax_year,
        uvt_value=uvt,
        escenario_no_optimizado=escenario_no_opt,
        escenario_optimizado=escenario_opt,
        ahorro_tributario_familiar_neto_cop=round(ahorro_familiar_cop, 2),
        porcentaje_ahorro_familiar_pct=porcentaje_ahorro,
        analisis_riesgo_patrimonial=analisis_riesgo,
        estrategias_aplicadas=estrategias,
        recomendaciones_legales_y_formales=recomendaciones,
        audit_trace=trace,
    )
