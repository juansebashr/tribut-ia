from typing import List
from app.models.persona_juridica import PersonaJuridicaInput, PersonaJuridicaOutput
from app.models.common import AuditTraceItem
from app.core.rules_engine.loader import get_rules_for_year


def liquidar_persona_juridica(payload: PersonaJuridicaInput) -> PersonaJuridicaOutput:
    rules = get_rules_for_year(payload.tax_year, payload.custom_uvt)
    uvt = rules.uvt_value
    pj_rules = rules.persona_juridica
    
    trace: List[AuditTraceItem] = []

    # 1. INGRESOS
    ingresos_brutos = payload.ingresos_brutos_operacionales + payload.ingresos_brutos_no_operacionales
    ingresos_netos = max(0.0, ingresos_brutos - payload.devoluciones_rebajas_descuentos - payload.ingresos_no_constitutivos_renta)
    
    trace.append(AuditTraceItem(
        step_id="ingresos_fiscales_pj",
        title="Ingresos Brutos y Netos Fiscales",
        statutory_reference="Art. 26, 27, 28 E.T.",
        raw_input_cop=ingresos_brutos,
        calculated_cop=ingresos_netos,
        final_allowed_cop=ingresos_netos,
        notes=f"Ingresos brutos (${ingresos_brutos:,.0f}) menos devoluciones (${payload.devoluciones_rebajas_descuentos:,.0f}) e INCRNGO (${payload.ingresos_no_constitutivos_renta:,.0f})."
    ))

    # 2. COSTOS Y RENTA BRUTA
    renta_bruta = max(0.0, ingresos_netos - payload.costos_procedentes)
    trace.append(AuditTraceItem(
        step_id="renta_bruta_pj",
        title="Renta Bruta Fiscal (Formulario 110)",
        statutory_reference="Art. 58-88 E.T.",
        raw_input_cop=ingresos_netos,
        calculated_cop=renta_bruta,
        final_allowed_cop=renta_bruta,
        notes=f"Ingresos Netos (${ingresos_netos:,.0f}) menos Costos de Ventas procedentes (${payload.costos_procedentes:,.0f})."
    ))

    # 3. GASTOS OPERACIONALES Y DEDUCCIONES
    gastos_brutos = payload.gastos_administracion + payload.gastos_ventas + payload.gastos_financieros
    gastos_deducibles = max(0.0, gastos_brutos - payload.gastos_no_deducibles + payload.deducciones_especiales)
    
    trace.append(AuditTraceItem(
        step_id="gastos_deducibles_pj",
        title="Gastos Operacionales y Deducciones Procedentes",
        statutory_reference="Art. 107 E.T.",
        raw_input_cop=gastos_brutos,
        calculated_cop=gastos_deducibles,
        excess_rejected_cop=payload.gastos_no_deducibles,
        final_allowed_cop=gastos_deducibles,
        notes=f"Gastos administración, ventas y financieros (${gastos_brutos:,.0f}), menos no deducibles (${payload.gastos_no_deducibles:,.0f}), más deducciones especiales (${payload.deducciones_especiales:,.0f})."
    ))

    # 4. RENTA LÍQUIDA ORDINARIA Y GRAVABLE
    renta_liquida_ordinaria = max(0.0, renta_bruta - gastos_deducibles)
    total_compensaciones_y_exentas = payload.rentas_exentas + payload.compensacion_perdidas_fiscales + payload.compensacion_exceso_renta_presuntiva
    renta_liquida_gravable = max(0.0, renta_liquida_ordinaria - total_compensaciones_y_exentas)
    
    trace.append(AuditTraceItem(
        step_id="renta_liquida_gravable_pj",
        title="Renta Líquida Gravable (Formulario 110)",
        statutory_reference="Art. 147, 178, 235-2 E.T.",
        raw_input_cop=renta_liquida_ordinaria,
        calculated_cop=renta_liquida_gravable,
        final_allowed_cop=renta_liquida_gravable,
        notes=f"Renta Líquida Ordinaria (${renta_liquida_ordinaria:,.0f}) menos compensaciones de pérdidas (${payload.compensacion_perdidas_fiscales:,.0f}) y rentas exentas (${payload.rentas_exentas:,.0f})."
    ))

    # 5. TARIFA GENERAL Y LIQUIDACIÓN IMPUESTO BÁSICO
    tarifa_aplicada = payload.tarifa_personalizada if payload.tarifa_personalizada is not None else pj_rules.tarifa_general
    impuesto_basico = round((renta_liquida_gravable * tarifa_aplicada) / 1000.0) * 1000.0
    
    trace.append(AuditTraceItem(
        step_id="impuesto_basico_renta_pj",
        title="Impuesto Básico de Renta",
        statutory_reference="Art. 240 E.T.",
        raw_input_cop=renta_liquida_gravable,
        calculated_cop=impuesto_basico,
        final_allowed_cop=impuesto_basico,
        notes=f"Tarifa del {tarifa_aplicada*100:.1f}% sobre Renta Líquida Gravable (${renta_liquida_gravable:,.0f})."
    ))

    # 6. DESCUENTOS TRIBUTARIOS
    desc_ica_aplicado = min(payload.descuento_tributario_ica, impuesto_basico)
    otros_desc_aplicado = min(payload.otros_descuentos_tributarios, max(0.0, impuesto_basico - desc_ica_aplicado))
    total_descuentos = desc_ica_aplicado + otros_desc_aplicado

    trace.append(AuditTraceItem(
        step_id="descuentos_tributarios_pj",
        title="Descuentos Tributarios (ICA, Donaciones, Impuestos Exterior)",
        statutory_reference="Art. 115, 254, 257, 259 E.T.",
        raw_input_cop=payload.descuento_tributario_ica + payload.otros_descuentos_tributarios,
        calculated_cop=total_descuentos,
        final_allowed_cop=total_descuentos,
        notes=f"Descuento ICA 50% (${desc_ica_aplicado:,.0f}) + Donaciones/Otros (${otros_desc_aplicado:,.0f})."
    ))

    # 7. TASA DE TRIBUTACIÓN DEPURADA (TTD - Art. 240 Parágrafo 6)
    ttd_pct = 0.0
    aplica_ia_ttd = False
    impuesto_adicional_ttd = 0.0
    
    if pj_rules.tasa_minima_ttd.aplica and payload.utilidad_contable_antes_impuestos > 0:
        utilidad_depurada = max(0.0, payload.utilidad_contable_antes_impuestos - payload.diferencias_permanentes_ttd)
        impuesto_depurado = max(0.0, impuesto_basico - total_descuentos)
        
        if utilidad_depurada > 0:
            ttd_pct = impuesto_depurado / utilidad_depurada
            tarifa_minima_req = pj_rules.tasa_minima_ttd.tarifa_minima  # 15%
            
            if ttd_pct < tarifa_minima_req:
                aplica_ia_ttd = True
                impuesto_requerido = utilidad_depurada * tarifa_minima_req
                impuesto_adicional_ttd = round(max(0.0, impuesto_requerido - impuesto_depurado) / 1000.0) * 1000.0
                
        trace.append(AuditTraceItem(
            step_id="tasa_minima_ttd",
            title="Tasa de Tributación Depurada (TTD - Tasa Mínima 15%)",
            statutory_reference="Art. 240 Parágrafo 6 E.T.",
            raw_input_cop=payload.utilidad_contable_antes_impuestos,
            calculated_cop=impuesto_adicional_ttd,
            final_allowed_cop=impuesto_adicional_ttd,
            notes=f"TTD Calculada: {ttd_pct*100:.2f}% (Mínimo exigido: 15.00%). {'Genera Impuesto Adicional (IA): $' + f'{impuesto_adicional_ttd:,.0f}' if aplica_ia_ttd else 'Cumple con la tasa mínima legal.'}"
        ))

    # 8. GANANCIA OCASIONAL
    tarifa_go = pj_rules.ganancia_ocasional
    impuesto_go = round((payload.ganancia_ocasional_gravable * tarifa_go) / 1000.0) * 1000.0
    if payload.ganancia_ocasional_gravable > 0:
        trace.append(AuditTraceItem(
            step_id="ganancia_ocasional_pj",
            title="Impuesto de Ganancias Ocasionales",
            statutory_reference="Art. 313, 314 E.T.",
            raw_input_cop=payload.ganancia_ocasional_gravable,
            calculated_cop=impuesto_go,
            final_allowed_cop=impuesto_go,
            notes=f"Tarifa del {tarifa_go*100:.0f}% sobre ganancias ocasionales netas (${payload.ganancia_ocasional_gravable:,.0f})."
        ))

    # 9. IMPUESTO NETO TOTAL
    impuesto_neto_renta = max(0.0, impuesto_basico - total_descuentos) + impuesto_adicional_ttd
    impuesto_neto_total = impuesto_neto_renta + impuesto_go

    # 10. LIQUIDACIÓN PRIVADA
    total_retenciones_anticipos = (
        payload.retenciones_en_la_fuente +
        payload.autorretenciones_practicadas +
        payload.anticipo_ano_anterior +
        payload.saldo_a_favor_ano_anterior
    )
    
    diferencia = impuesto_neto_total - total_retenciones_anticipos
    saldo_a_pagar = max(0.0, diferencia)
    saldo_a_favor = max(0.0, -diferencia)

    trace.append(AuditTraceItem(
        step_id="saldo_final_pj",
        title="Saldo Final Privado (Formulario 110)",
        statutory_reference="Art. 801, 802 E.T.",
        raw_input_cop=impuesto_neto_total,
        calculated_cop=diferencia,
        final_allowed_cop=saldo_a_pagar if saldo_a_pagar > 0 else -saldo_a_favor,
        notes=f"Impuesto Neto (${impuesto_neto_total:,.0f}) menos Retenciones y Anticipos (${total_retenciones_anticipos:,.0f}) = Saldo {'a Pagar: $' + f'{saldo_a_pagar:,.0f}' if saldo_a_pagar > 0 else 'a Favor: $' + f'{saldo_a_favor:,.0f}'}."
    ))

    resumen = (
        f"Liquidación Persona Jurídica {payload.tax_year}: "
        f"Ingresos Netos ${ingresos_netos:,.0f} | "
        f"Renta Bruta ${renta_bruta:,.0f} | "
        f"Renta Líquida Gravable ${renta_liquida_gravable:,.0f} | "
        f"Impuesto Básico Renta (${tarifa_aplicada*100:.1f}%) ${impuesto_basico:,.0f} | "
        f"Impuesto Adicional TTD ${impuesto_adicional_ttd:,.0f} | "
        f"Impuesto Neto Total ${impuesto_neto_total:,.0f} | "
        f"{'Saldo a Pagar: $' + f'{saldo_a_pagar:,.0f}' if saldo_a_pagar > 0 else 'Saldo a Favor: $' + f'{saldo_a_favor:,.0f}'}."
    )

    return PersonaJuridicaOutput(
        tax_year=payload.tax_year,
        uvt_value=uvt,
        ingresos_brutos_totales=ingresos_brutos,
        ingresos_netos=ingresos_netos,
        renta_bruta=renta_bruta,
        total_gastos_deducibles=gastos_deducibles,
        renta_liquida_ordinaria=renta_liquida_ordinaria,
        renta_liquida_gravable=renta_liquida_gravable,
        tarifa_renta_aplicada=tarifa_aplicada,
        impuesto_basico_renta=impuesto_basico,
        ttd_calculada_pct=ttd_pct,
        aplica_impuesto_adicional_ttd=aplica_ia_ttd,
        impuesto_adicional_ttd=impuesto_adicional_ttd,
        impuesto_ganancias_ocasionales=impuesto_go,
        total_descuentos_tributarios_aplicados=total_descuentos,
        impuesto_neto_total=impuesto_neto_total,
        total_retenciones_y_anticipos=total_retenciones_anticipos,
        saldo_a_pagar=saldo_a_pagar,
        saldo_a_favor=saldo_a_favor,
        audit_trace=trace,
        resumen_ejecutivo=resumen
    )
