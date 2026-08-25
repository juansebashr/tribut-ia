from app.core.rules_engine.loader import get_rules_for_year
from app.models.common import AuditTraceItem
from app.models.retefuente import (
    Formulario350Casillas,
    RetefuenteF350Input,
    RetefuenteF350Output,
    RetefuenteLaboralInput,
    RetefuenteLaboralOutput,
    TablaRetefuenteItem,
)


def _nombre_mes(mes_num: int) -> str:
    meses = {
        1: "Enero",
        2: "Febrero",
        3: "Marzo",
        4: "Abril",
        5: "Mayo",
        6: "Junio",
        7: "Julio",
        8: "Agosto",
        9: "Septiembre",
        10: "Octubre",
        11: "Noviembre",
        12: "Diciembre",
    }
    return meses.get(mes_num, f"Mes {mes_num}")


def calcular_retefuente_laboral_art383(payload: RetefuenteLaboralInput) -> RetefuenteLaboralOutput:
    rules = get_rules_for_year(payload.tax_year, payload.custom_uvt)
    uvt = rules.uvt_value
    trace: list[AuditTraceItem] = []

    # 1. Ingresos brutos laborales
    ing_basico = payload.salario_basico
    ing_comisiones = payload.comisiones_horas_extras
    ing_viaticos = payload.viaticos_gravados
    ing_otros = payload.otros_pagos_laborales
    total_ingresos_brutos = ing_basico + ing_comisiones + ing_viaticos + ing_otros

    trace.append(
        AuditTraceItem(
            step_id="ingresos_brutos_laborales",
            title="1. Ingresos Brutos Laborales del Mes",
            statutory_reference="Art. 383 E.T. y Art. 103 E.T.",
            raw_input_cop=total_ingresos_brutos,
            calculated_cop=total_ingresos_brutos,
            final_allowed_cop=total_ingresos_brutos,
            notes=f"Sumatoria de salario básico (${ing_basico:,.0f}), comisiones/horas extras (${ing_comisiones:,.0f}), viáticos (${ing_viaticos:,.0f}) y otros pagos laborales.",
        )
    )

    # 2. INCRGO (Seguridad Social Obligatoria del Empleado)
    salud = payload.aporte_salud_obligatorio
    pension = payload.aporte_pension_obligatorio
    fsp = payload.fondo_solidaridad_pensional
    total_incrngo = salud + pension + fsp

    # Si vienen en 0 pero hay salario básico, calculamos el aporte estándar del 4% + 4%
    if total_incrngo == 0.0 and ing_basico > 0:
        salud = ing_basico * 0.04
        pension = ing_basico * 0.04
        total_incrngo = salud + pension

    trace.append(
        AuditTraceItem(
            step_id="incrngo_seguridad_social",
            title="2. Aportes Obligatorios a Seguridad Social (INCRGO)",
            statutory_reference="Art. 55 y 56 E.T.",
            raw_input_cop=total_incrngo,
            calculated_cop=total_incrngo,
            final_allowed_cop=total_incrngo,
            notes=f"Salud (${salud:,.0f}) + Pensión (${pension:,.0f}) + FSP (${fsp:,.0f}). No constituyen renta ni ganancia ocasional.",
        )
    )

    # 3. Ingreso Laboral Neto
    ingreso_neto = max(0.0, total_ingresos_brutos - total_incrngo)
    trace.append(
        AuditTraceItem(
            step_id="ingreso_laboral_neto",
            title="3. Ingreso Laboral Neto",
            statutory_reference="Art. 388 Num. 1 E.T.",
            raw_input_cop=total_ingresos_brutos,
            calculated_cop=ingreso_neto,
            final_allowed_cop=ingreso_neto,
            notes="Base intermedia: Ingresos brutos menos aportes a seguridad social obligatoria.",
        )
    )

    # 4. Deducciones Mensuales Imputables
    # a) Intereses de vivienda: máx 100 UVT mensual
    tope_vivienda_cop = 100.0 * uvt
    ded_vivienda_solicitada = payload.intereses_vivienda_mes
    ded_vivienda_aceptada = min(ded_vivienda_solicitada, tope_vivienda_cop)

    # b) Medicina prepagada: máx 16 UVT mensual
    tope_prepagada_cop = 16.0 * uvt
    ded_prepagada_solicitada = payload.medicina_prepagada_mes
    ded_prepagada_aceptada = min(ded_prepagada_solicitada, tope_prepagada_cop)

    # c) Dependiente general (10% ingreso bruto, máx 32 UVT mensual)
    ded_dep_gen_solicitada = 0.0
    ded_dep_gen_aceptada = 0.0
    if payload.aplica_dependiente_10pct:
        ded_dep_gen_solicitada = total_ingresos_brutos * 0.10
        tope_dep_gen_cop = 32.0 * uvt
        ded_dep_gen_aceptada = min(ded_dep_gen_solicitada, tope_dep_gen_cop)

    # d) Dependientes adicionales (72 UVT anual / 12 = 6 UVT mensual por dependiente, máx 4)
    num_dep_extra = min(payload.numero_dependientes_adicionales_72uvt, 4)
    ded_dep_extra_aceptada = num_dep_extra * 6.0 * uvt

    total_deducciones_solicitadas = (
        ded_vivienda_solicitada
        + ded_prepagada_solicitada
        + ded_dep_gen_solicitada
        + (payload.numero_dependientes_adicionales_72uvt * 6.0 * uvt)
    )
    total_deducciones_aceptadas = (
        ded_vivienda_aceptada
        + ded_prepagada_aceptada
        + ded_dep_gen_aceptada
        + ded_dep_extra_aceptada
    )

    trace.append(
        AuditTraceItem(
            step_id="deducciones_mensuales",
            title="4. Deducciones Mensuales Imputables (Art. 387 E.T.)",
            statutory_reference="Art. 387 E.T. y Ley 2277 de 2022",
            raw_input_cop=total_deducciones_solicitadas,
            calculated_cop=total_deducciones_aceptadas,
            final_allowed_cop=total_deducciones_aceptadas,
            notes=(
                f"Vivienda: ${ded_vivienda_aceptada:,.0f} (tope 100 UVT); "
                f"Prepagada: ${ded_prepagada_aceptada:,.0f} (tope 16 UVT); "
                f"Dependiente 10%: ${ded_dep_gen_aceptada:,.0f} (tope 32 UVT); "
                f"Dependientes extra ({num_dep_extra}): ${ded_dep_extra_aceptada:,.0f} (6 UVT/mes c/u)."
            ),
        )
    )

    # 5. Rentas Exentas Previas (Aportes voluntarios pensión/AFC y otras)
    # Tope voluntarias: 30% ingreso bruto o (3800/12) UVT mensual
    tope_voluntarias_uvt_mes = 3800.0 / 12.0
    tope_voluntarias_cop = min(total_ingresos_brutos * 0.30, tope_voluntarias_uvt_mes * uvt)
    exenta_afc_solicitada = payload.aportes_voluntarios_pension_afc
    exenta_afc_aceptada = min(exenta_afc_solicitada, tope_voluntarias_cop)
    otras_exentas = payload.otras_rentas_exentas
    total_rentas_exentas_previas = exenta_afc_aceptada + otras_exentas

    # 6. Renta Exenta Laboral del 25% (Art. 206 Num. 10)
    # Base = Ingreso neto - deducciones aceptadas - exentas previas
    base_calculo_25 = max(
        0.0, ingreso_neto - total_deducciones_aceptadas - total_rentas_exentas_previas
    )
    tope_25_uvt_mes = 790.0 / 12.0  # ~65.8333 UVT mensual según Ley 2277
    tope_25_cop = tope_25_uvt_mes * uvt
    renta_25_solicitada = base_calculo_25 * 0.25 if payload.solicitar_25pct_exenta_laboral else 0.0
    renta_25_aceptada = min(renta_25_solicitada, tope_25_cop)

    total_rentas_exentas_aceptadas = total_rentas_exentas_previas + renta_25_aceptada

    trace.append(
        AuditTraceItem(
            step_id="renta_exenta_laboral_25",
            title="5. Renta Exenta Laboral del 25% (Art. 206 Num. 10)",
            statutory_reference="Art. 206 Numeral 10 y Art. 388 E.T.",
            raw_input_cop=renta_25_solicitada,
            calculated_cop=renta_25_solicitada,
            limit_cop=tope_25_cop,
            limit_uvt=tope_25_uvt_mes,
            final_allowed_cop=renta_25_aceptada,
            notes=f"25% sobre base depurada de ${base_calculo_25:,.0f}. Tope mensual: 65.83 UVT (${tope_25_cop:,.0f}).",
        )
    )

    # 7. Límite Conjunto del 40% o 111.67 UVT mensual (Art. 388 E.T.)
    subtotal_alivios = total_deducciones_aceptadas + total_rentas_exentas_aceptadas
    limite_40pct_cop = ingreso_neto * 0.40
    limite_uvt_cop = (1340.0 / 12.0) * uvt  # 111.6667 UVT mensual
    limite_conjunto_aplicable = min(limite_40pct_cop, limite_uvt_cop)

    total_alivios_procedentes = min(subtotal_alivios, limite_conjunto_aplicable)
    alivios_rechazados = max(0.0, subtotal_alivios - total_alivios_procedentes)

    trace.append(
        AuditTraceItem(
            step_id="limite_conjunto_alivios",
            title="6. Límite Conjunto de Deducciones y Rentas Exentas (40% / 111.67 UVT)",
            statutory_reference="Art. 388 Numeral 2 E.T.",
            raw_input_cop=subtotal_alivios,
            calculated_cop=subtotal_alivios,
            limit_cop=limite_conjunto_aplicable,
            limit_uvt=1340.0 / 12.0,
            excess_rejected_cop=alivios_rechazados,
            final_allowed_cop=total_alivios_procedentes,
            notes=(
                f"Límite 40%: ${limite_40pct_cop:,.0f} vs Límite 111.67 UVT: ${limite_uvt_cop:,.0f}. "
                f"Alivios finales procedentes: ${total_alivios_procedentes:,.0f}. Rechazado por tope: ${alivios_rechazados:,.0f}."
            ),
        )
    )

    # 8. Base Gravable Depurada Final
    base_gravable_cop = max(0.0, ingreso_neto - total_alivios_procedentes)
    base_gravable_uvt = base_gravable_cop / uvt if uvt > 0 else 0.0

    # 9. Liquidación según Tabla Progresiva Art. 383 E.T.
    # Rangos:
    # 0 a 95 UVT: 0%
    # > 95 a 150 UVT: (Base - 95) * 19%
    # > 150 a 360 UVT: (Base - 150) * 28% + 10 UVT
    # > 360 a 640 UVT: (Base - 360) * 33% + 69 UVT
    # > 640 a 945 UVT: (Base - 640) * 35% + 162 UVT
    # > 945 a 2300 UVT: (Base - 945) * 37% + 268 UVT
    # > 2300 UVT: (Base - 2300) * 39% + 770 UVT

    retencion_uvt = 0.0
    rango_str = "0 a 95 UVT (Tarifa 0%)"
    tarifa_marginal = 0.0

    if base_gravable_uvt <= 95.0:
        retencion_uvt = 0.0
        rango_str = "0 a 95 UVT (Exento - Tarifa 0%)"
        tarifa_marginal = 0.0
    elif base_gravable_uvt <= 150.0:
        retencion_uvt = (base_gravable_uvt - 95.0) * 0.19
        rango_str = "> 95 a 150 UVT (Tarifa Marginal 19%)"
        tarifa_marginal = 19.0
    elif base_gravable_uvt <= 360.0:
        retencion_uvt = (base_gravable_uvt - 150.0) * 0.28 + 10.0
        rango_str = "> 150 a 360 UVT (Tarifa Marginal 28%)"
        tarifa_marginal = 28.0
    elif base_gravable_uvt <= 640.0:
        retencion_uvt = (base_gravable_uvt - 360.0) * 0.33 + 69.0
        rango_str = "> 360 a 640 UVT (Tarifa Marginal 33%)"
        tarifa_marginal = 33.0
    elif base_gravable_uvt <= 945.0:
        retencion_uvt = (base_gravable_uvt - 640.0) * 0.35 + 162.0
        rango_str = "> 640 a 945 UVT (Tarifa Marginal 35%)"
        tarifa_marginal = 35.0
    elif base_gravable_uvt <= 2300.0:
        retencion_uvt = (base_gravable_uvt - 945.0) * 0.37 + 268.0
        rango_str = "> 945 a 2.300 UVT (Tarifa Marginal 37%)"
        tarifa_marginal = 37.0
    else:
        retencion_uvt = (base_gravable_uvt - 2300.0) * 0.39 + 770.0
        rango_str = "> 2.300 UVT (Tarifa Marginal 39%)"
        tarifa_marginal = 39.0

    retencion_pesos = round(retencion_uvt * uvt, -3)  # Redondeo DIAN al múltiplo de mil
    porcentaje_efectivo = (
        (retencion_pesos / total_ingresos_brutos) * 100.0 if total_ingresos_brutos > 0 else 0.0
    )

    trace.append(
        AuditTraceItem(
            step_id="retencion_final_art383",
            title="7. Retención en la Fuente en Pesos (Art. 383 E.T.)",
            statutory_reference="Art. 383 Estatuto Tributario",
            raw_input_cop=base_gravable_cop,
            calculated_cop=retencion_uvt * uvt,
            final_allowed_cop=retencion_pesos,
            notes=(
                f"Base gravable: {base_gravable_uvt:.2f} UVT (${base_gravable_cop:,.0f}). "
                f"Ubicado en rango: {rango_str}. Retención: {retencion_uvt:.2f} UVT = ${retencion_pesos:,.0f} COP "
                f"(Tasa efectiva: {porcentaje_efectivo:.2f}%)."
            ),
        )
    )

    return RetefuenteLaboralOutput(
        tax_year=payload.tax_year,
        uvt_value=uvt,
        mes_nombre=payload.mes_nombre,
        total_ingresos_brutos_laborales=total_ingresos_brutos,
        total_incrngo_seguridad_social=total_incrngo,
        ingreso_laboral_neto=ingreso_neto,
        total_deducciones_solicitadas=total_deducciones_solicitadas,
        total_deducciones_aceptadas=total_deducciones_aceptadas,
        total_rentas_exentas_previas=total_rentas_exentas_previas,
        renta_exenta_laboral_25_aceptada=renta_25_aceptada,
        total_rentas_exentas_aceptadas=total_rentas_exentas_aceptadas,
        subtotal_alivios_antes_limite=subtotal_alivios,
        limite_conjunto_40pct_cop=limite_40pct_cop,
        limite_conjunto_uvt_cop=limite_uvt_cop,
        limite_conjunto_aplicable_cop=limite_conjunto_aplicable,
        total_alivios_procedentes=total_alivios_procedentes,
        alivios_rechazados_por_limite=alivios_rechazados,
        base_gravable_depurada_cop=base_gravable_cop,
        base_gravable_depurada_uvt=round(base_gravable_uvt, 2),
        rango_tabla_art383=rango_str,
        tarifa_marginal_aplicada_pct=tarifa_marginal,
        retencion_fuente_pesos=retencion_pesos,
        porcentaje_efectivo_retencion=round(porcentaje_efectivo, 2),
        audit_trace=trace,
    )


def calcular_formulario_350(payload: RetefuenteF350Input) -> RetefuenteF350Output:
    rules = get_rules_for_year(payload.tax_year, payload.custom_uvt)
    uvt = rules.uvt_value
    trace: list[AuditTraceItem] = []

    # 1. RETENCIONES A TÍTULO DE RENTA
    # Rentas de trabajo
    c28 = payload.base_rentas_trabajo
    c42 = payload.retencion_rentas_trabajo

    # Honorarios (Declarante 11%, No declarante 10%)
    c29 = payload.base_honorarios_declarante + payload.base_honorarios_no_declarante
    c43 = (payload.base_honorarios_declarante * 0.11) + (
        payload.base_honorarios_no_declarante * 0.10
    )

    # Comisiones (Declarante 11%, No declarante 10%)
    c30 = payload.base_comisiones_declarante + payload.base_comisiones_no_declarante
    c44 = (payload.base_comisiones_declarante * 0.11) + (
        payload.base_comisiones_no_declarante * 0.10
    )

    # Servicios (Declarante 4%, No declarante 6%, Transporte carga 1%)
    c31 = (
        payload.base_servicios_declarante
        + payload.base_servicios_no_declarante
        + payload.base_servicios_transporte_carga
    )
    c45 = (
        (payload.base_servicios_declarante * 0.04)
        + (payload.base_servicios_no_declarante * 0.06)
        + (payload.base_servicios_transporte_carga * 0.01)
    )

    # Arrendamientos (Inmuebles 3.5%, Muebles 4%)
    c32 = payload.base_arrendamiento_inmuebles + payload.base_arrendamiento_muebles
    c46 = (payload.base_arrendamiento_inmuebles * 0.035) + (
        payload.base_arrendamiento_muebles * 0.04
    )

    # Rendimientos Financieros (7%)
    c33 = payload.base_rendimientos_financieros
    c47 = payload.base_rendimientos_financieros * 0.07

    # Enajenación Activos Fijos (1%)
    c34 = payload.base_enajenacion_activos_fijos
    c48 = payload.base_enajenacion_activos_fijos * 0.01

    # Compras (Declarante 2.5%, No declarante 3.5%)
    c35 = payload.base_compras_declarante + payload.base_compras_no_declarante
    c49 = (payload.base_compras_declarante * 0.025) + (payload.base_compras_no_declarante * 0.035)

    # Otros pagos sujetos
    c36 = 0.0
    c50 = 0.0

    # Pagos al exterior (Servicios 20%, Paraísos 35%)
    c37 = payload.base_pagos_exterior_servicios + payload.base_pagos_exterior_paraisos
    c51 = (payload.base_pagos_exterior_servicios * 0.20) + (
        payload.base_pagos_exterior_paraisos * 0.35
    )

    # Total bases y retenciones de renta practicadas
    c41 = c28 + c29 + c30 + c31 + c32 + c33 + c34 + c35 + c36 + c37
    c59 = c42 + c43 + c44 + c45 + c46 + c47 + c48 + c49 + c50 + c51

    trace.append(
        AuditTraceItem(
            step_id="retenciones_renta_practicadas",
            title="1. Retenciones a Título de Renta Practicadas",
            statutory_reference="Art. 383 a 415 Estatuto Tributario",
            raw_input_cop=c41,
            calculated_cop=c59,
            final_allowed_cop=c59,
            notes=f"Total bases de renta: ${c41:,.0f} COP. Total retenciones de renta retenidas a terceros: ${c59:,.0f} COP.",
        )
    )

    # 2. AUTORRETENCIONES A TÍTULO DE RENTA
    c61 = payload.ingresos_brutos_propios_mes
    c62 = payload.ingresos_brutos_propios_mes * (payload.tarifa_autorretencion_especial_pct / 100.0)
    c63 = 0.0
    c64 = payload.otras_autorretenciones_valor
    c65 = c62 + c64

    trace.append(
        AuditTraceItem(
            step_id="autorretenciones_renta",
            title="2. Autorretención Especial de Renta (Decreto 2201 de 2016)",
            statutory_reference="Decreto 2201 de 2016 y Art. 114-1 E.T.",
            raw_input_cop=c61,
            calculated_cop=c65,
            final_allowed_cop=c65,
            notes=f"Base ingresos propios: ${c61:,.0f} COP con tarifa autorretención {payload.tarifa_autorretencion_especial_pct}%. Autorretención calculada: ${c62:,.0f} COP.",
        )
    )

    # 3. RETENCIONES A TÍTULO DE IVA (ReteIVA 15%)
    c67 = payload.base_iva_sujeto_reteiva
    c68 = payload.base_iva_sujeto_reteiva * 0.15
    c69 = payload.reteiva_servicios_exterior
    c74 = c68 + c69

    trace.append(
        AuditTraceItem(
            step_id="retenciones_iva",
            title="3. Retenciones en la Fuente a Título de IVA (ReteIVA)",
            statutory_reference="Art. 437-1 y 437-2 E.T.",
            raw_input_cop=c67,
            calculated_cop=c74,
            final_allowed_cop=c74,
            notes=f"IVA asumido sujeto a retención: ${c67:,.0f} COP (15% ReteIVA = ${c68:,.0f}). Exterior: ${c69:,.0f}.",
        )
    )

    # 4. RETENCIÓN DE TIMBRE
    c76 = payload.base_impuesto_timbre
    c77 = payload.base_impuesto_timbre * (payload.tarifa_timbre_pct / 100.0)

    # 5. TOTALES Y SALDO A PAGAR (Casillas 82 a 84)
    c82 = c59 + c65 + c74 + c77
    c83 = payload.sanciones
    c84 = c82 + c83

    trace.append(
        AuditTraceItem(
            step_id="total_a_pagar_f350",
            title="4. Total a Pagar Formulario 350",
            statutory_reference="Formulario Oficial 350 DIAN",
            raw_input_cop=c82,
            calculated_cop=c84,
            final_allowed_cop=round(c84, -3),
            notes=f"Total retenciones período: ${c82:,.0f} COP + Sanciones: ${c83:,.0f} COP = Total a pagar: ${round(c84, -3):,.0f} COP.",
        )
    )

    # Mapeo a Casillas oficiales Formulario 350 con redondeo al millar
    casillas = Formulario350Casillas(
        ano=payload.tax_year,
        periodo_mes=payload.periodo_mes,
        numero_formulario=f"350{payload.tax_year}{payload.periodo_mes:02d}00001",
        nit=payload.nit,
        dv=payload.dv,
        razon_social=payload.razon_social,
        cod_direccion_seccional=32,
        c28_base_rentas_trabajo=round(c28, -3),
        c29_base_honorarios=round(c29, -3),
        c30_base_comisiones=round(c30, -3),
        c31_base_servicios=round(c31, -3),
        c32_base_arrendamientos=round(c32, -3),
        c33_base_rendimientos_financieros=round(c33, -3),
        c34_base_enajenacion_activos_fijos=round(c34, -3),
        c35_base_compras=round(c35, -3),
        c36_base_otros_pagos_sujetos=round(c36, -3),
        c37_base_pagos_exterior_renta=round(c37, -3),
        c41_total_bases_renta=round(c41, -3),
        c42_ret_rentas_trabajo=round(c42, -3),
        c43_ret_honorarios=round(c43, -3),
        c44_ret_comisiones=round(c44, -3),
        c45_ret_servicios=round(c45, -3),
        c46_ret_arrendamientos=round(c46, -3),
        c47_ret_rendimientos_financieros=round(c47, -3),
        c48_ret_enajenacion_activos_fijos=round(c48, -3),
        c49_ret_compras=round(c49, -3),
        c50_ret_otros_pagos_sujetos=round(c50, -3),
        c51_ret_pagos_exterior_renta=round(c51, -3),
        c59_total_retenciones_renta_practicadas=round(c59, -3),
        c61_base_autorretencion_especial=round(c61, -3),
        c62_autorretencion_especial_decreto_2201=round(c62, -3),
        c63_base_otras_autorretenciones=round(c63, -3),
        c64_otras_autorretenciones=round(c64, -3),
        c65_total_autorretenciones_renta=round(c65, -3),
        c67_base_iva_responsables=round(c67, -3),
        c68_retencion_iva_practicada=round(c68, -3),
        c69_retencion_iva_prestadores_exterior=round(c69, -3),
        c74_total_retenciones_iva=round(c74, -3),
        c76_base_timbre_nacional=round(c76, -3),
        c77_retencion_timbre=round(c77, -3),
        c82_total_retenciones_periodo=round(c82, -3),
        c83_sanciones=round(c83, -3),
        c84_total_saldo_a_pagar=round(c84, -3),
    )

    mes_txt = _nombre_mes(payload.periodo_mes)
    resumen = (
        f"Declaración mensual de Retención en la Fuente ({mes_txt} {payload.tax_year}) para {payload.razon_social}. "
        f"Total retenciones de renta practicadas a terceros: ${casillas.c59_total_retenciones_renta_practicadas:,.0f}, "
        f"Autorretenciones especiales (D. 2201): ${casillas.c65_total_autorretenciones_renta:,.0f}, "
        f"ReteIVA (15%): ${casillas.c74_total_retenciones_iva:,.0f}. "
        f"Total saldo a pagar en bancos (Recibo 490): ${casillas.c84_total_saldo_a_pagar:,.0f} COP."
    )

    return RetefuenteF350Output(
        tax_year=payload.tax_year,
        uvt_value=uvt,
        periodo_mes=payload.periodo_mes,
        periodo_nombre=mes_txt,
        razon_social=payload.razon_social,
        nit=payload.nit,
        dv=payload.dv,
        total_bases_renta=round(c41, -3),
        total_retenciones_renta_practicadas=round(c59, -3),
        total_autorretenciones_renta=round(c65, -3),
        total_retenciones_iva_practicadas=round(c74, -3),
        total_retenciones_timbre=round(c77, -3),
        total_retenciones_periodo=round(c82, -3),
        sanciones=round(c83, -3),
        total_a_pagar=round(c84, -3),
        casillas=casillas,
        audit_trace=trace,
        resumen_ejecutivo=resumen,
    )


def obtener_tabla_maestra_retefuente(
    tax_year: int, custom_uvt: float | None = None
) -> list[TablaRetefuenteItem]:
    rules = get_rules_for_year(tax_year, custom_uvt)
    uvt = rules.uvt_value

    def _make_item(
        item_id: str,
        concepto: str,
        categoria: str,
        base_uvt: float,
        tarifa_dec: float,
        tarifa_no_dec: float,
        articulo: str,
        observaciones: str,
    ) -> TablaRetefuenteItem:
        return TablaRetefuenteItem(
            id=item_id,
            concepto=concepto,
            categoria=categoria,
            base_minima_uvt=base_uvt,
            base_minima_cop=round(base_uvt * uvt, -2),
            tarifa_declarante=tarifa_dec,
            tarifa_no_declarante=tarifa_no_dec,
            articulo_et=articulo,
            observaciones=observaciones,
        )

    return [
        # Compras
        _make_item(
            "comp_gen",
            "Compras generales (bienes corporales muebles)",
            "Compras",
            27.0,
            2.5,
            3.5,
            "Art. 401 E.T. - D.R. 1625/2016",
            "Aplica sobre compras ordinarias con factura",
        ),
        _make_item(
            "comp_agro",
            "Compras de productos agrícolas o pecuarios sin procesamiento",
            "Compras",
            92.0,
            1.5,
            1.5,
            "Art. 401 E.T. - D.R. 1625/2016",
            "Sector agropecuario primario",
        ),
        _make_item(
            "comp_cafe",
            "Compras de café pergamino o cereza",
            "Compras",
            160.0,
            0.5,
            0.5,
            "Art. 401 E.T.",
            "Compras directas al productor cafetero",
        ),
        _make_item(
            "comp_combustibles",
            "Compras de combustibles derivados del petróleo",
            "Compras",
            0.0,
            0.1,
            0.1,
            "Art. 401 E.T.",
            "Distribuidores mayoristas y minoristas",
        ),
        _make_item(
            "comp_tarjeta",
            "Ventas y compras con tarjeta crédito / débito (adquirencia)",
            "Compras",
            0.0,
            1.5,
            1.5,
            "Art. 401 E.T. - D.R. 1625/2016",
            "Practicada por la pasarela de pagos / adquirente",
        ),
        # Servicios
        _make_item(
            "serv_gen",
            "Servicios generales en donde predomina el factor material/físico",
            "Servicios",
            4.0,
            4.0,
            6.0,
            "Art. 392 E.T.",
            "Mantenimientos, reparaciones, aseo, transporte",
        ),
        _make_item(
            "serv_transp_carga",
            "Servicios de transporte terrestre de carga",
            "Servicios",
            4.0,
            1.0,
            1.0,
            "Art. 392 E.T.",
            "Transporte de mercancías nacional",
        ),
        _make_item(
            "serv_transp_pasajeros",
            "Servicios de transporte de pasajeros (terrestre / aéreo)",
            "Servicios",
            27.0,
            3.5,
            3.5,
            "Art. 392 E.T.",
            "Tiquetes de transporte nacional",
        ),
        _make_item(
            "serv_hoteles_rest",
            "Servicios de hoteles, hospedaje y restaurantes",
            "Servicios",
            4.0,
            3.5,
            3.5,
            "Art. 392 E.T.",
            "Alimentación y alojamiento",
        ),
        _make_item(
            "serv_temporales",
            "Servicios prestados por empresas de servicios temporales (sobre AIU)",
            "Servicios",
            4.0,
            1.0,
            1.0,
            "Art. 462-1 y 392 E.T.",
            "Aplica sobre el valor total del contrato (1%)",
        ),
        # Honorarios y Comisiones
        _make_item(
            "hono_gen",
            "Honorarios y comisiones (predomina el factor intelectual)",
            "Honorarios",
            0.0,
            11.0,
            10.0,
            "Art. 392 E.T.",
            "11% para PJ y PN declarante; 10% PN no declarante sin 2+ empleados",
        ),
        _make_item(
            "hono_consultoria_obra",
            "Contratos de consultoría de obras públicas y proyectos de ingeniería",
            "Honorarios",
            0.0,
            6.0,
            6.0,
            "Art. 392 E.T.",
            "Ingeniería, interventoría y consultoría de infraestructura",
        ),
        # Arrendamientos
        _make_item(
            "arrend_inmuebles",
            "Arrendamiento de bienes raíces (locales comerciales, bodegas, oficinas)",
            "Arrendamientos",
            27.0,
            3.5,
            3.5,
            "Art. 401 E.T.",
            "Inmuebles comerciales y vivienda no exceptuada",
        ),
        _make_item(
            "arrend_muebles",
            "Arrendamiento de bienes muebles (vehículos, maquinaria, equipos)",
            "Arrendamientos",
            0.0,
            4.0,
            4.0,
            "Art. 401 E.T.",
            "Maquinaria amarilla, computadores, vehículos",
        ),
        # Rendimientos Financieros
        _make_item(
            "rend_intereses",
            "Rendimientos financieros, intereses, CDT y cuentas remuneradas",
            "Rendimientos Financieros",
            0.0,
            7.0,
            7.0,
            "Art. 395 E.T.",
            "7% general o 4% en títulos de deuda pública/fondos",
        ),
        # Enajenación Activos Fijos
        _make_item(
            "act_fijos_notaria",
            "Enajenación de activos fijos ante notario público",
            "Activos Fijos",
            0.0,
            1.0,
            1.0,
            "Art. 398 y 400 E.T.",
            "1% del valor total de la escritura de venta de inmueble",
        ),
        # Pagos al Exterior
        _make_item(
            "exterior_servicios_software",
            "Pagos al exterior por consultoría, servicios técnicos, asistencia técnica y software",
            "Pagos al Exterior",
            0.0,
            20.0,
            20.0,
            "Art. 408 E.T.",
            "Tarifa del 20% sobre el pago bruto",
        ),
        _make_item(
            "exterior_paraisos",
            "Pagos al exterior a jurisdicciones no cooperantes o paraísos fiscales",
            "Pagos al Exterior",
            0.0,
            35.0,
            35.0,
            "Art. 408 Parágrafo E.T.",
            "Tarifa sancionatoria del 35%",
        ),
        # IVA
        _make_item(
            "reteiva_general",
            "Retención en la fuente a título de IVA (ReteIVA 15%)",
            "ReteIVA",
            0.0,
            15.0,
            15.0,
            "Art. 437-1 E.T.",
            "15% del valor facturado por concepto de IVA",
        ),
    ]
