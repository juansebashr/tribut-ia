from app.core.rules_engine.loader import get_rules_for_year
from app.models.common import AuditTraceItem
from app.models.regimen_simple import (
    ComparativaSimpleInput,
    ComparativaSimpleOutput,
    Formulario260Casillas,
    RegimenSimpleInput,
    RegimenSimpleOutput,
)


def _get_tarifa_simple(grupo: int, ingreso_uvt: float, rules_rst) -> float:
    """Calcula la tarifa porcentual consolidada según el grupo de actividad y los ingresos en UVT."""
    if grupo == 1:
        brackets = rules_rst.grupo1_tiendas
    elif grupo == 2:
        brackets = rules_rst.grupo2_comercio
    elif grupo == 3:
        brackets = rules_rst.grupo3_restaurantes
    elif grupo == 4:
        brackets = rules_rst.grupo4_educacion_salud
    elif grupo == 5:
        brackets = rules_rst.grupo5_profesionales
    elif grupo == 6:
        return rules_rst.grupo6_reciclaje_tarifa
    else:
        brackets = rules_rst.grupo2_comercio

    tarifa = brackets[0].tarifa
    for b in brackets:
        if ingreso_uvt >= b.desde_uvt:
            tarifa = b.tarifa
    return tarifa


def _get_nombre_grupo(grupo: int) -> str:
    nombres = {
        1: "Grupo 1: Tiendas pequeñas, minimercados, micromercados y peluquerías",
        2: "Grupo 2: Actividades comerciales, industriales y servicios técnicos",
        3: "Grupo 3: Expendio de comidas y bebidas, y actividades de transporte",
        4: "Grupo 4: Educación y actividades de salud humana y asistencia social",
        5: "Grupo 5: Servicios profesionales, consultoría y profesiones liberales",
        6: "Grupo 6: Reciclaje y recuperación de materiales (CIIU 4665, 3830, 3811)",
    }
    return nombres.get(grupo, "Grupo 2: Actividades comerciales e industriales")


def liquidar_regimen_simple(payload: RegimenSimpleInput) -> RegimenSimpleOutput:
    rules = get_rules_for_year(payload.tax_year, payload.custom_uvt)
    uvt = rules.uvt_value
    rst_rules = rules.regimen_simple

    trace: list[AuditTraceItem] = []

    # 1. PATRIMONIO (Casillas 28 a 30)
    c28 = payload.patrimonio_bruto
    c29 = payload.pasivos
    c30 = max(0.0, c28 - c29)

    trace.append(
        AuditTraceItem(
            step_id="patrimonio_simple",
            title="Patrimonio Bruto y Líquido (Formulario 260)",
            statutory_reference="Art. 261, 283 E.T.",
            raw_input_cop=c28,
            calculated_cop=c30,
            final_allowed_cop=c30,
            notes=f"Patrimonio Bruto (${c28:,.0f}) menos Pasivos (${c29:,.0f}) = Patrimonio Líquido (${c30:,.0f}).",
        )
    )

    # 2. INGRESOS POR GRUPOS Y BASE GRAVABLE (Casillas 31 a 45)
    c31 = payload.ingresos_brutos_nacionales if payload.grupo_actividad == 1 else 0.0
    c32 = payload.ingresos_brutos_exterior if payload.grupo_actividad == 1 else 0.0
    c33 = payload.ingresos_brutos_nacionales if payload.grupo_actividad == 2 else 0.0
    c34 = payload.ingresos_brutos_exterior if payload.grupo_actividad == 2 else 0.0
    c35 = payload.ingresos_brutos_nacionales if payload.grupo_actividad == 3 else 0.0
    c36 = payload.ingresos_brutos_exterior if payload.grupo_actividad == 3 else 0.0
    c37 = payload.ingresos_brutos_nacionales if payload.grupo_actividad == 4 else 0.0
    c38 = payload.ingresos_brutos_exterior if payload.grupo_actividad == 4 else 0.0
    c39 = payload.ingresos_brutos_nacionales if payload.grupo_actividad == 5 else 0.0
    c40 = payload.ingresos_brutos_exterior if payload.grupo_actividad == 5 else 0.0
    c41 = payload.ingresos_brutos_nacionales if payload.grupo_actividad == 6 else 0.0
    c42 = payload.ingresos_brutos_exterior if payload.grupo_actividad == 6 else 0.0

    ingresos_brutos_totales = payload.ingresos_brutos_nacionales + payload.ingresos_brutos_exterior
    c43 = ingresos_brutos_totales
    c44 = payload.ingresos_no_constitutivos_renta
    ingresos_gravables = max(0.0, c43 - c44)
    c45 = ingresos_gravables
    ingresos_en_uvt = ingresos_gravables / uvt if uvt > 0 else 0.0

    # 3. TARIFA SIMPLE CONSOLIDADA & COMPONENTES (Casillas 46 a 48)
    tarifa_pct = _get_tarifa_simple(payload.grupo_actividad, ingresos_en_uvt, rst_rules)
    impuesto_simple_consolidado = round((ingresos_gravables * tarifa_pct) / 1000.0) * 1000.0
    c46 = impuesto_simple_consolidado

    # ICA territorial anual
    if payload.componente_ica_territorial_fijo is not None:
        componente_ica = min(c46, payload.componente_ica_territorial_fijo)
    else:
        componente_ica = min(
            c46,
            round((ingresos_gravables * (payload.tarifa_ica_consolidada_x_mil / 1000.0)) / 1000.0)
            * 1000.0,
        )
    c47 = componente_ica
    componente_simple_nacional = max(0.0, c46 - c47)
    c48 = componente_simple_nacional

    trace.append(
        AuditTraceItem(
            step_id="impuesto_simple_consolidado",
            title=f"Liquidación Impuesto SIMPLE ({tarifa_pct * 100:.2f}%)",
            statutory_reference="Art. 908 E.T.",
            raw_input_cop=ingresos_gravables,
            calculated_cop=c46,
            final_allowed_cop=c48,
            notes=f"Ingreso Gravable ${ingresos_gravables:,.0f} ({ingresos_en_uvt:,.1f} UVT) x {tarifa_pct * 100:.2f}% = Impuesto ${c46:,.0f} (ICA: ${c47:,.0f} | Nacional: ${c48:,.0f}).",
        )
    )

    # 4. DESCUENTOS TRIBUTARIOS (Casillas 49 a 52)
    # Aportes a pensión a cargo del empleador
    c49 = payload.aportes_pension_empleador_ano
    # 0.5% ventas con medios de pago electrónicos
    c50 = round((payload.ventas_por_medios_electronicos * 0.005) / 1000.0) * 1000.0
    c51 = payload.gmf_pagado

    descuentos_solicitados = c49 + c50 + c51
    # Los descuentos no pueden superar el componente SIMPLE nacional (Casilla 48)
    descuentos_aceptados = min(c48, descuentos_solicitados)
    c52 = descuentos_aceptados

    impuesto_neto_simple = max(0.0, c48 - c52)
    c53 = impuesto_neto_simple

    trace.append(
        AuditTraceItem(
            step_id="descuentos_simple",
            title="Descuentos Tributarios (Pensión Empleador & 0.5% Pagos Electrónicos)",
            statutory_reference="Art. 903, 912 E.T.",
            raw_input_cop=descuentos_solicitados,
            calculated_cop=descuentos_aceptados,
            final_allowed_cop=descuentos_aceptados,
            notes=f"Aportes pensión empleador (${c49:,.0f}) + 0.5% ventas electrónicas (${c50:,.0f}) limitados a ${c48:,.0f}.",
        )
    )

    # 5. RETENCIONES PREVIAS Y ANTICIPOS PAGADOS (Casillas 54 a 58 y 63-64)
    c54 = payload.retenciones_antes_pertenecer_simple
    c55 = payload.anticipo_renta_ano_anterior
    total_anticipos_simple = sum(payload.anticipos_simple_pagados)
    c56 = total_anticipos_simple
    c57 = payload.saldo_a_favor_simple_ano_anterior

    creditos_simple = c54 + c55 + c56 + c57
    c58 = max(0.0, c53 - creditos_simple)

    # Sanciones SIMPLE
    c59 = payload.sanciones_simple
    c60 = 0.0
    c61 = 0.0
    c62 = c59 + c60 + c61
    c63 = c58 + c62
    c64 = max(0.0, creditos_simple - c53 - c62)

    # Sanciones ICA
    c65 = payload.sanciones_ica
    c66 = 0.0
    c67 = 0.0
    c68 = c65 + c66 + c67

    # 6. IMPUESTO NACIONAL AL CONSUMO (INC COMIDAS Y BEBIDAS - Casillas 69 a 79)
    c69 = payload.ingresos_servicio_comidas_bebidas
    c70 = round((c69 * rst_rules.inc_comidas_bebidas_tarifa) / 1000.0) * 1000.0 if c69 > 0 else 0.0
    total_anticipos_inc = sum(payload.anticipos_inc_pagados)
    c71 = total_anticipos_inc
    c72 = payload.saldo_a_favor_inc_ano_anterior

    creditos_inc = c71 + c72
    c73 = max(0.0, c70 - creditos_inc)
    c74 = payload.sanciones_inc
    c75 = 0.0
    c76 = 0.0
    c77 = c74 + c75 + c76
    c78 = c73 + c77
    c79 = max(0.0, creditos_inc - c70 - c77)

    # 7. GANANCIAS OCASIONALES (Casillas 80 a 95)
    c80 = payload.ganancias_ocasionales_brutas
    c81 = payload.costos_ganancia_ocasional
    c82 = payload.ganancias_ocasionales_exentas
    c83 = max(0.0, c80 - c81 - c82)
    c84 = round((c83 * rst_rules.ganancia_ocasional_tarifa) / 1000.0) * 1000.0
    c85 = 0.0
    c86 = max(0.0, c84 - c85)
    c87 = payload.saldo_a_favor_go_ano_anterior
    c88 = 0.0

    creditos_go = c87 + c88
    c89 = max(0.0, c86 - creditos_go)
    c90 = payload.sanciones_go
    c91 = 0.0
    c92 = 0.0
    c93 = c90 + c91 + c92
    c94 = c89 + c93
    c95 = max(0.0, creditos_go - c86 - c93)

    # 8. ANTICIPOS BIMESTRALES DETALLADOS (Casillas 96 a 107)
    bims_simple = payload.anticipos_simple_pagados + [0.0] * 6
    bims_inc = payload.anticipos_inc_pagados + [0.0] * 6

    c96 = bims_simple[0]
    c97 = bims_simple[1]
    c98 = bims_simple[2]
    c99 = bims_simple[3]
    c100 = bims_simple[4]
    c101 = bims_simple[5]

    c102 = bims_inc[0]
    c103 = bims_inc[1]
    c104 = bims_inc[2]
    c105 = bims_inc[3]
    c106 = bims_inc[4]
    c107 = bims_inc[5]

    # Gran Total Consolidado Formulario 260
    gran_total_pagar = c63 + c68 + c78 + c94
    gran_total_favor = c64 + c79 + c95
    c980 = gran_total_pagar

    form_260 = Formulario260Casillas(
        ano=payload.tax_year,
        fraccion_ano_siguiente=False,
        numero_formulario=f"260{payload.tax_year}99999",
        nit=payload.nit,
        dv=payload.dv,
        primer_apellido="",
        segundo_apellido="",
        primer_nombre="",
        otros_nombres="",
        razon_social=payload.razon_social_o_nombre,
        cod_direccion_seccional=32,
        actividad_economica="4711" if payload.grupo_actividad == 1 else "6201",
        tarifa_simple_consolidada=tarifa_pct * 100.0,
        c28_patrimonio_bruto=c28,
        c29_pasivos=c29,
        c30_patrimonio_liquido=c30,
        c31_ingresos_grupo1_pais=c31,
        c32_ingresos_grupo1_exterior=c32,
        c33_ingresos_grupo2_pais=c33,
        c34_ingresos_grupo2_exterior=c34,
        c35_ingresos_grupo3_pais=c35,
        c36_ingresos_grupo3_exterior=c36,
        c37_ingresos_grupo4_pais=c37,
        c38_ingresos_grupo4_exterior=c38,
        c39_ingresos_grupo5_pais=c39,
        c40_ingresos_grupo5_exterior=c40,
        c41_ingresos_grupo6_pais=c41,
        c42_ingresos_grupo6_exterior=c42,
        c43_total_ingresos_brutos_sin_go=c43,
        c44_ingresos_no_constitutivos_renta=c44,
        c45_total_ingresos_gravables=c45,
        c46_impuesto_simple=c46,
        c47_componente_ica_territorial=c47,
        c48_valor_componente_simple_nacional=c48,
        c49_descuento_aportes_pension_empleador=c49,
        c50_descuento_ventas_medios_electronicos=c50,
        c51_descuento_gmf=c51,
        c52_total_descuentos=c52,
        c53_impuesto_neto_simple=c53,
        c54_retenciones_antes_pertenecer_simple=c54,
        c55_anticipo_renta_ano_anterior=c55,
        c56_anticipos_simple_efectivamente_pagados=c56,
        c57_saldo_favor_simple_ano_anterior=c57,
        c58_saldo_a_pagar_impuesto_simple=c58,
        c59_sancion_extemporaneidad_simple=c59,
        c60_sancion_correccion_simple=c60,
        c61_otras_sanciones_simple=c61,
        c62_total_sanciones_simple=c62,
        c63_total_saldo_a_pagar_simple=c63,
        c64_total_saldo_a_favor_simple=c64,
        c65_sancion_extemporaneidad_ica=c65,
        c66_sancion_correccion_ica=c66,
        c67_otras_sanciones_ica=c67,
        c68_total_sanciones_ica=c68,
        c69_ingresos_gravados_inc=c69,
        c70_impuesto_nacional_consumo=c70,
        c71_inc_efectivamente_pagado_anticipos=c71,
        c72_saldo_favor_inc_ano_anterior=c72,
        c73_saldo_a_pagar_inc=c73,
        c74_sancion_extemporaneidad_inc=c74,
        c75_sancion_correccion_inc=c75,
        c76_otras_sanciones_inc=c76,
        c77_total_sanciones_inc=c77,
        c78_total_saldo_a_pagar_inc=c78,
        c79_total_saldo_a_favor_inc=c79,
        c80_ingresos_ganancias_ocasionales=c80,
        c81_costos_ganancias_ocasionales=c81,
        c82_ganancias_ocasionales_exentas=c82,
        c83_ganancias_ocasionales_gravables=c83,
        c84_impuesto_ganancias_ocasionales=c84,
        c85_descuento_impuestos_exterior_go=c85,
        c86_impuesto_neto_ganancias_ocasionales=c86,
        c87_saldo_favor_go_ano_anterior=c87,
        c88_retenciones_ganancias_ocasionales=c88,
        c89_saldo_a_pagar_go=c89,
        c90_sancion_extemporaneidad_go=c90,
        c91_sancion_correccion_go=c91,
        c92_otras_sanciones_go=c92,
        c93_total_sanciones_go=c93,
        c94_total_saldo_a_pagar_go=c94,
        c95_total_saldo_a_favor_go=c95,
        c96_anticipo_simple_bim1=c96,
        c97_anticipo_simple_bim2=c97,
        c98_anticipo_simple_bim3=c98,
        c99_anticipo_simple_bim4=c99,
        c100_anticipo_simple_bim5=c100,
        c101_anticipo_simple_bim6=c101,
        c102_anticipo_inc_bim1=c102,
        c103_anticipo_inc_bim2=c103,
        c104_anticipo_inc_bim3=c104,
        c105_anticipo_inc_bim4=c105,
        c106_anticipo_inc_bim5=c106,
        c107_anticipo_inc_bim6=c107,
        c980_pago_total=c980,
    )

    resumen = (
        f"Liquidación SIMPLE Formulario 260 ({payload.tax_year}): "
        f"Grupo {payload.grupo_actividad} | Ingresos ${ingresos_gravables:,.0f} | "
        f"Tarifa Consolidada {tarifa_pct * 100:.2f}% | "
        f"Impuesto Consolidado ${c46:,.0f} (ICA: ${c47:,.0f} / Nacional: ${c48:,.0f}) | "
        f"Descuentos ${c52:,.0f} | Impuesto Neto ${c53:,.0f} | "
        f"Anticipos Pagados ${total_anticipos_simple:,.0f} | "
        f"{'Saldo Final a Pagar: $' + f'{gran_total_pagar:,.0f}' if gran_total_pagar > 0 else 'Saldo Final a Favor: $' + f'{gran_total_favor:,.0f}'}."
    )

    return RegimenSimpleOutput(
        tax_year=payload.tax_year,
        uvt_value=uvt,
        grupo_actividad=payload.grupo_actividad,
        nombre_grupo=_get_nombre_grupo(payload.grupo_actividad),
        ingresos_brutos_totales=c43,
        ingresos_gravables_simple=ingresos_gravables,
        ingresos_en_uvt=ingresos_en_uvt,
        tarifa_simple_consolidada_pct=tarifa_pct * 100.0,
        impuesto_simple_consolidado=c46,
        componente_ica_territorial=c47,
        componente_simple_nacional=c48,
        descuento_pension_empleador=c49,
        descuento_medios_electronicos_0_5pct=c50,
        total_descuentos_aplicados=c52,
        impuesto_neto_simple=c53,
        total_anticipos_simple_pagados=total_anticipos_simple,
        saldo_a_pagar_simple=c58,
        saldo_a_favor_simple=c64,
        impuesto_inc_comidas_bebidas=c70,
        total_anticipos_inc_pagados=total_anticipos_inc,
        saldo_a_pagar_inc=c73,
        saldo_a_favor_inc=c79,
        impuesto_ganancias_ocasionales=c84,
        saldo_a_pagar_go=c89,
        saldo_a_favor_go=c95,
        gran_total_saldo_a_pagar=gran_total_pagar,
        gran_total_saldo_a_favor=gran_total_favor,
        form_260_casillas=form_260,
        audit_trace=trace,
        resumen_ejecutivo=resumen,
    )


def comparar_ordinario_vs_simple(payload: ComparativaSimpleInput) -> ComparativaSimpleOutput:
    rules = get_rules_for_year(payload.tax_year, payload.custom_uvt)
    uvt = rules.uvt_value

    # 1. CÁLCULO RÉGIMEN ORDINARIO
    renta_liquida = max(0.0, payload.ingresos_brutos_anuales - payload.costos_y_gastos_deducibles)
    tarifa_ordinaria = (
        0.35 if payload.tipo_persona == "juridica" else 0.28
    )  # Estimado persona natural
    impuesto_renta_ordinario = round((renta_liquida * tarifa_ordinaria) / 1000.0) * 1000.0
    ica_ordinario = (
        round((payload.ingresos_brutos_anuales * (payload.tarifa_ica_x_mil / 1000.0)) / 1000.0)
        * 1000.0
    )
    total_ordinario = impuesto_renta_ordinario + ica_ordinario
    tasa_efectiva_ord = (
        (total_ordinario / payload.ingresos_brutos_anuales) * 100.0
        if payload.ingresos_brutos_anuales > 0
        else 0.0
    )

    # 2. CÁLCULO RÉGIMEN SIMPLE
    ingreso_uvt = payload.ingresos_brutos_anuales / uvt if uvt > 0 else 0.0
    tarifa_simple_pct = _get_tarifa_simple(
        payload.grupo_actividad, ingreso_uvt, rules.regimen_simple
    )
    impuesto_simple_bruto = (
        round((payload.ingresos_brutos_anuales * tarifa_simple_pct) / 1000.0) * 1000.0
    )
    ica_integrado = min(impuesto_simple_bruto, ica_ordinario)
    componente_nacional = max(0.0, impuesto_simple_bruto - ica_integrado)

    desc_pension = payload.aportes_pension_empleador
    ventas_electronicas = payload.ingresos_brutos_anuales * (
        payload.porcentaje_ventas_medios_electronicos / 100.0
    )
    desc_electronico = round((ventas_electronicas * 0.005) / 1000.0) * 1000.0

    total_descuentos_rst = min(componente_nacional, desc_pension + desc_electronico)
    impuesto_simple_neto = max(0.0, componente_nacional - total_descuentos_rst)
    total_simple = impuesto_simple_neto + ica_integrado
    tasa_efectiva_simple = (
        (total_simple / payload.ingresos_brutos_anuales) * 100.0
        if payload.ingresos_brutos_anuales > 0
        else 0.0
    )

    # 3. AHORROS Y BENEFICIOS COMPLEMENTARIOS
    ahorro_tributario_cop = total_ordinario - total_simple
    ahorro_tributario_pct = (
        (ahorro_tributario_cop / total_ordinario * 100.0) if total_ordinario > 0 else 0.0
    )

    # Beneficio parafiscales Art. 114-1 E.T. (Salud 8.5% + SENA 2% + ICBF 3% = 13.5% sobre nómina de empleados < 10 SMMLV)
    # Suponiendo salario promedio de 1.8 SMMLV (~$2.5M COP/mes por empleado = ~$30M COP/año)
    ahorro_parafiscales = payload.numero_empleados_menos_10_smlmv * 30000000.0 * 0.135

    # Beneficio flujo de caja (ahorro de no sufrir retenciones en la fuente de 2.5% a 11%)
    tarifa_retefuente_promedio = 0.035  # 3.5% promedio de retención ordinaria
    flujo_caja_liberado = payload.ingresos_brutos_anuales * tarifa_retefuente_promedio

    conviene_simple = ahorro_tributario_cop > 0 or (ahorro_tributario_cop + ahorro_parafiscales > 0)
    recomendacion = (
        "Recomendado: Régimen SIMPLE (F-260)"
        if conviene_simple
        else "Recomendado: Régimen Ordinario (F-110/F-210)"
    )

    conclusion = (
        f"El Régimen SIMPLE genera una tasa efectiva total del {tasa_efectiva_simple:.2f}% frente al {tasa_efectiva_ord:.2f}% del Ordinario. "
        f"{'Ahorro fiscal directo estimado de $' + f'{ahorro_tributario_cop:,.0f} COP ({ahorro_tributario_pct:.1f}% de reducción).' if ahorro_tributario_cop > 0 else 'El Ordinario resulta más conveniente debido al bajo margen de utilidad.'} "
        f"Adicionalmente, el SIMPLE libera ${flujo_caja_liberado:,.0f} COP en flujo de caja al no sufrir retenciones en la fuente y ahorra ${ahorro_parafiscales:,.0f} COP en aportes de nómina (Art. 114-1 E.T.)."
    )

    return ComparativaSimpleOutput(
        tax_year=payload.tax_year,
        uvt_value=uvt,
        renta_liquida_ordinaria=renta_liquida,
        impuesto_renta_ordinario=impuesto_renta_ordinario,
        ica_ordinario=ica_ordinario,
        total_carga_tributaria_ordinario=total_ordinario,
        tasa_efectiva_ordinario_pct=tasa_efectiva_ord,
        tarifa_simple_pct=tarifa_simple_pct * 100.0,
        impuesto_simple_bruto=impuesto_simple_bruto,
        descuento_pension_simple=desc_pension,
        descuento_electronico_simple=desc_electronico,
        impuesto_simple_neto=impuesto_simple_neto,
        ica_integrado_en_simple=ica_integrado,
        total_carga_tributaria_simple=total_simple,
        tasa_efectiva_simple_pct=tasa_efectiva_simple,
        ahorro_tributario_neto_cop=ahorro_tributario_cop,
        ahorro_tributario_pct=ahorro_tributario_pct,
        ahorro_parafiscales_salud_sena_icbf_cop=ahorro_parafiscales,
        beneficio_flujo_caja_sin_retefuente_cop=flujo_caja_liberado,
        regimen_recomendado=recomendacion,
        conclusion_didactica=conclusion,
    )
