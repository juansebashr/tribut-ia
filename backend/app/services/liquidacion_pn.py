import math
from typing import List, Dict
from app.models.persona_natural import PersonaNaturalInput, PersonaNaturalOutput
from app.models.common import AuditTraceItem
from app.core.rules_engine.loader import get_rules_for_year


def liquidar_persona_natural(payload: PersonaNaturalInput) -> PersonaNaturalOutput:
    rules = get_rules_for_year(payload.tax_year, payload.custom_uvt)
    uvt = rules.uvt_value
    cg_rules = rules.persona_natural.cedula_general
    go_rules = rules.persona_natural.ganancias_ocasionales
    
    trace: List[AuditTraceItem] = []

    # 0. PATRIMONIO (Casillas 30, 31, 32)
    patrimonio_bruto = payload.patrimonio_bruto
    deudas = payload.deudas
    patrimonio_liquido = max(0.0, patrimonio_bruto - deudas)
    
    if patrimonio_bruto > 0 or deudas > 0:
        trace.append(AuditTraceItem(
            step_id="patrimonio_liquido",
            title="Patrimonio Líquido (Casilla 32)",
            statutory_reference="Art. 261, 282 E.T.",
            raw_input_cop=patrimonio_bruto,
            calculated_cop=patrimonio_liquido,
            final_allowed_cop=patrimonio_liquido,
            notes=f"Patrimonio Bruto (${patrimonio_bruto:,.0f}) menos Deudas (${deudas:,.0f}) = ${patrimonio_liquido:,.0f}."
        ))

    # 1. INGRESOS BRUTOS DE TRABAJO / CÉDULA GENERAL (Casilla 33 / Casilla 32)
    ingresos_trabajo = payload.rentas_trabajo + payload.viaticos
    total_ingresos = ingresos_trabajo + payload.otros_ingresos_brutos + payload.rentas_capital + payload.rentas_nolaborales
    trace.append(AuditTraceItem(
        step_id="ingresos_brutos",
        title="Ingresos Brutos Cédula General (Casilla 32, 58, 74)",
        statutory_reference="Art. 103, 335 E.T.",
        raw_input_cop=total_ingresos,
        calculated_cop=total_ingresos,
        final_allowed_cop=total_ingresos,
        notes=f"Trabajo (${ingresos_trabajo:,.0f}) + Capital (${payload.rentas_capital:,.0f}) + No Laboral (${payload.rentas_nolaborales:,.0f}) + Otros (${payload.otros_ingresos_brutos:,.0f})."
    ))

    # 2. INCRNGO (Casilla 33, 59, 76)
    incrngo_trabajo = payload.aporte_salud_obligatorio + payload.aporte_pension_obligatorio
    total_incrngo = incrngo_trabajo + payload.otros_incrngo + payload.incrngo_capital + payload.incrngo_nolaborales
    trace.append(AuditTraceItem(
        step_id="incrngo",
        title="Ingresos No Constitutivos de Renta (INCRNGO)",
        statutory_reference="Art. 38 a 41, 55, 56 E.T.",
        raw_input_cop=total_incrngo,
        calculated_cop=total_incrngo,
        final_allowed_cop=total_incrngo,
        notes=f"Salud/Pensión (${incrngo_trabajo:,.0f}) + Capital inflacionario (${payload.incrngo_capital:,.0f}) + No laboral (${payload.incrngo_nolaborales:,.0f}) + Otros (${payload.otros_incrngo:,.0f})."
    ))

    # 3. COSTOS PROCEDENTES (Casilla 77)
    total_costos = payload.costos_nolaborales

    # 4. INGRESO NETO / RENTA LÍQUIDA ORDINARIA PREVIA (Casilla 36, 61, 78)
    ingreso_neto = max(0.0, total_ingresos - total_incrngo - total_costos)
    trace.append(AuditTraceItem(
        step_id="ingreso_neto",
        title="Renta Líquida Ordinaria Previa Cédula General",
        statutory_reference="Art. 336 E.T.",
        raw_input_cop=total_ingresos,
        calculated_cop=ingreso_neto,
        final_allowed_cop=ingreso_neto,
        notes=f"Ingreso Bruto (${total_ingresos:,.0f}) menos INCRNGO (${total_incrngo:,.0f}) menos Costos Procedentes (${total_costos:,.0f})."
    ))

    # 4. DEDUCCIONES IMPUTABLES
    deducciones_dict = cg_rules.deducciones
    deducciones_list: List[dict] = []
    
    # 4.1 Dependiente General (10% ingreso laboral o max 384 UVT)
    if payload.aplica_dependiente_general:
        dep_rules = deducciones_dict.dependiente_general
        dep_pct = dep_rules.get("porcentaje_ingreso_laboral", 0.10)
        dep_tope_uvt = dep_rules.get("tope_uvt", 384)
        dep_tope_cop = dep_tope_uvt * uvt
        
        raw_dep = total_ingresos * dep_pct
        allowed_dep = min(raw_dep, dep_tope_cop)
        excess_dep = max(0.0, raw_dep - allowed_dep)
        
        deducciones_list.append({"name": "Dependiente General", "allowed": allowed_dep})
        trace.append(AuditTraceItem(
            step_id="deduccion_dependiente_general",
            title="Deducción por Dependiente Económico",
            statutory_reference="Art. 387 E.T.",
            raw_input_cop=raw_dep,
            calculated_cop=raw_dep,
            limit_uvt=float(dep_tope_uvt),
            limit_cop=dep_tope_cop,
            excess_rejected_cop=excess_dep,
            final_allowed_cop=allowed_dep,
            notes=f"10% de ingresos laborales (${total_ingresos:,.0f}) limitado a {dep_tope_uvt} UVT (${dep_tope_cop:,.0f})."
        ))

    # 4.2 Dependientes Adicionales (72 UVT c/u hasta 4 dependientes)
    if payload.numero_dependientes_adicionales_72uvt > 0:
        dep_add_rules = deducciones_dict.dependientes_adicionales_72uvt
        uvt_per_dep = dep_add_rules.get("tope_uvt_por_dependiente", 72)
        max_deps = dep_add_rules.get("max_dependientes", 4)
        count_deps = min(payload.numero_dependientes_adicionales_72uvt, max_deps)
        
        allowed_dep_add = count_deps * uvt_per_dep * uvt
        deducciones_list.append({"name": "Dependientes Adicionales (72 UVT)", "allowed": allowed_dep_add})
        trace.append(AuditTraceItem(
            step_id="deduccion_dependientes_adicionales",
            title="Deducción por Dependientes Adicionales (72 UVT c/u)",
            statutory_reference="Art. 336 Numeral 2 E.T.",
            raw_input_cop=float(payload.numero_dependientes_adicionales_72uvt * uvt_per_dep * uvt),
            calculated_cop=allowed_dep_add,
            limit_uvt=float(count_deps * uvt_per_dep),
            limit_cop=allowed_dep_add,
            final_allowed_cop=allowed_dep_add,
            notes=f"{count_deps} dependiente(s) x {uvt_per_dep} UVT = {count_deps * uvt_per_dep} UVT (${allowed_dep_add:,.0f})."
        ))

    # 4.3 Medicina Prepagada (Tope 192 UVT)
    if payload.medicina_prepagada_anual > 0:
        med_rules = deducciones_dict.medicina_prepagada
        med_tope_uvt = med_rules.get("tope_uvt_anual", 192)
        med_tope_cop = med_tope_uvt * uvt
        
        raw_med = payload.medicina_prepagada_anual
        allowed_med = min(raw_med, med_tope_cop)
        excess_med = max(0.0, raw_med - allowed_med)
        
        deducciones_list.append({"name": "Medicina Prepagada", "allowed": allowed_med})
        trace.append(AuditTraceItem(
            step_id="deduccion_medicina_prepagada",
            title="Deducción Medicina Prepagada / Seguros de Salud",
            statutory_reference="Art. 387 E.T.",
            raw_input_cop=raw_med,
            calculated_cop=raw_med,
            limit_uvt=float(med_tope_uvt),
            limit_cop=med_tope_cop,
            excess_rejected_cop=excess_med,
            final_allowed_cop=allowed_med,
            notes=f"Pagos prepagada limitados a {med_tope_uvt} UVT (${med_tope_cop:,.0f})."
        ))

    # 4.4 Intereses Vivienda (Tope 1200 UVT)
    if payload.intereses_vivienda_anual > 0:
        viv_rules = deducciones_dict.intereses_vivienda
        viv_tope_uvt = viv_rules.get("tope_uvt_anual", 1200)
        viv_tope_cop = viv_tope_uvt * uvt
        
        raw_viv = payload.intereses_vivienda_anual
        allowed_viv = min(raw_viv, viv_tope_cop)
        excess_viv = max(0.0, raw_viv - allowed_viv)
        
        deducciones_list.append({"name": "Intereses de Vivienda", "allowed": allowed_viv})
        trace.append(AuditTraceItem(
            step_id="deduccion_intereses_vivienda",
            title="Deducción Intereses Crédito Vivienda / Leasing",
            statutory_reference="Art. 119 E.T.",
            raw_input_cop=raw_viv,
            calculated_cop=raw_viv,
            limit_uvt=float(viv_tope_uvt),
            limit_cop=viv_tope_cop,
            excess_rejected_cop=excess_viv,
            final_allowed_cop=allowed_viv,
            notes=f"Intereses de vivienda limitados a {viv_tope_uvt} UVT (${viv_tope_cop:,.0f})."
        ))

    # 4.5 GMF 50%
    if payload.gmf_4x1000_total > 0:
        gmf_rules = deducciones_dict.gmf
        gmf_pct = gmf_rules.get("porcentaje_deducible", 0.50)
        allowed_gmf = payload.gmf_4x1000_total * gmf_pct
        
        deducciones_list.append({"name": "GMF (50%)", "allowed": allowed_gmf})
        trace.append(AuditTraceItem(
            step_id="deduccion_gmf",
            title="Deducción 50% GMF (4x1000)",
            statutory_reference="Art. 115 E.T.",
            raw_input_cop=payload.gmf_4x1000_total,
            calculated_cop=allowed_gmf,
            final_allowed_cop=allowed_gmf,
            notes=f"50% del Gravamen al Movimiento Financiero certificado (${payload.gmf_4x1000_total:,.0f})."
        ))

    # 4.6 Compras Factura Electrónica 1%
    allowed_fe = 0.0
    if payload.compras_factura_electronica > 0 and deducciones_dict.compras_factura_electronica_1pct:
        fe_rules = deducciones_dict.compras_factura_electronica_1pct
        fe_pct = fe_rules.get("porcentaje_compras", 0.01)
        fe_tope_uvt = fe_rules.get("tope_uvt", 240)
        fe_tope_cop = fe_tope_uvt * uvt
        
        raw_fe = payload.compras_factura_electronica * fe_pct
        allowed_fe = min(raw_fe, fe_tope_cop)
        excess_fe = max(0.0, raw_fe - allowed_fe)
        
        deducciones_list.append({"name": "Compras con Factura Electrónica (1%)", "allowed": allowed_fe})
        trace.append(AuditTraceItem(
            step_id="deduccion_factura_electronica_1pct",
            title="Deducción 1% Compras con Factura Electrónica",
            statutory_reference="Art. 336 Numeral 5 E.T.",
            raw_input_cop=payload.compras_factura_electronica,
            calculated_cop=raw_fe,
            limit_uvt=float(fe_tope_uvt),
            limit_cop=fe_tope_cop,
            excess_rejected_cop=excess_fe,
            final_allowed_cop=allowed_fe,
            notes=f"1% de compras (${payload.compras_factura_electronica:,.0f}) limitado a {fe_tope_uvt} UVT (${fe_tope_cop:,.0f})."
        ))

    total_deducciones_aceptadas = sum(d["allowed"] for d in deducciones_list)

    # 5. RENTAS EXENTAS
    re_rules = cg_rules.rentas_exentas
    
    # 5.1 Aportes Voluntarios Pensión y/o AFC (Máx 30% ingreso bruto / 3.800 UVT)
    allowed_afc = 0.0
    if payload.aportes_voluntarios_pension_afc > 0:
        afc_rule = re_rules.voluntarias_pension_afc
        afc_pct = afc_rule.get("porcentaje_max_ingreso", 0.30)
        afc_tope_uvt = afc_rule.get("tope_uvt", 3800)
        afc_tope_cop = afc_tope_uvt * uvt
        
        limite_30pct_ingreso = total_ingresos * afc_pct
        intermediate_afc = min(payload.aportes_voluntarios_pension_afc, limite_30pct_ingreso)
        allowed_afc = min(intermediate_afc, afc_tope_cop)
        excess_afc = max(0.0, payload.aportes_voluntarios_pension_afc - allowed_afc)
        
        trace.append(AuditTraceItem(
            step_id="renta_exenta_afc_pension_voluntaria",
            title="Aportes Voluntarios Pensión / Cuentas AFC",
            statutory_reference="Art. 126-1, 126-4 E.T.",
            raw_input_cop=payload.aportes_voluntarios_pension_afc,
            calculated_cop=intermediate_afc,
            limit_uvt=float(afc_tope_uvt),
            limit_cop=afc_tope_cop,
            excess_rejected_cop=excess_afc,
            final_allowed_cop=allowed_afc,
            notes=f"Máximo 30% de ingresos (${limite_30pct_ingreso:,.0f}) y tope de {afc_tope_uvt} UVT (${afc_tope_cop:,.0f})."
        ))

    total_rentas_exentas_previas = allowed_afc + payload.otras_rentas_exentas

    # 5.2 Renta Exenta Laboral 25% (Art. 206 Numeral 10)
    ingreso_neto_trabajo = max(0.0, ingresos_trabajo - incrngo_trabajo)
    base_exenta_laboral = max(0.0, ingreso_neto_trabajo - total_deducciones_aceptadas - total_rentas_exentas_previas)
    lab_rule = re_rules.laboral_25
    lab_pct = lab_rule.get("porcentaje", 0.25)
    lab_tope_uvt = lab_rule.get("tope_uvt", 790)
    lab_tope_cop = lab_tope_uvt * uvt
    
    raw_exenta_laboral = base_exenta_laboral * lab_pct
    allowed_exenta_laboral = min(raw_exenta_laboral, lab_tope_cop)
    excess_exenta_laboral = max(0.0, raw_exenta_laboral - allowed_exenta_laboral)
    
    trace.append(AuditTraceItem(
        step_id="renta_exenta_laboral_25",
        title="Renta Exenta Laboral (25%)",
        statutory_reference="Art. 206 Numeral 10 E.T.",
        raw_input_cop=base_exenta_laboral,
        calculated_cop=raw_exenta_laboral,
        limit_uvt=float(lab_tope_uvt),
        limit_cop=lab_tope_cop,
        excess_rejected_cop=excess_exenta_laboral,
        final_allowed_cop=allowed_exenta_laboral,
        notes=f"25% sobre base depurada de trabajo (${base_exenta_laboral:,.0f}) limitado a {lab_tope_uvt} UVT (${lab_tope_cop:,.0f})."
    ))

    total_rentas_exentas_aceptadas = total_rentas_exentas_previas + allowed_exenta_laboral

    # 6. LÍMITE CONJUNTO (Art. 336 E.T. - Casilla 37)
    subtotal_alivios = total_deducciones_aceptadas + total_rentas_exentas_aceptadas
    limite_conjunto_rule = cg_rules.limite_conjunto_rentas_exentas_deducciones
    limite_pct_cop = ingreso_neto * limite_conjunto_rule.porcentaje_max_ingreso_neto
    limite_uvt_cop = limite_conjunto_rule.tope_uvt * uvt
    limite_aplicable_cop = min(limite_pct_cop, limite_uvt_cop)
    
    alivios_procedentes_finales = min(subtotal_alivios, limite_aplicable_cop)
    alivios_rechazados_por_limite = max(0.0, subtotal_alivios - alivios_procedentes_finales)
    
    trace.append(AuditTraceItem(
        step_id="limite_conjunto_alivios",
        title="Rentas Exentas y Deducciones Limitadas (Casilla 37)",
        statutory_reference="Art. 336 E.T.",
        raw_input_cop=subtotal_alivios,
        calculated_cop=subtotal_alivios,
        limit_uvt=float(limite_conjunto_rule.tope_uvt),
        limit_cop=limite_aplicable_cop,
        excess_rejected_cop=alivios_rechazados_por_limite,
        final_allowed_cop=alivios_procedentes_finales,
        notes=f"Menor entre el 40% del Ingreso Neto (${limite_pct_cop:,.0f}) y {limite_conjunto_rule.tope_uvt} UVT (${limite_uvt_cop:,.0f}). Alivios solicitados: ${subtotal_alivios:,.0f} -> Procedentes: ${alivios_procedentes_finales:,.0f}."
    ))

    # 7. RENTA LÍQUIDA GRAVABLE (Casilla 39 / Casilla 97)
    renta_liquida_gravable = max(0.0, ingreso_neto - alivios_procedentes_finales - allowed_fe)
    renta_liquida_gravable_uvt = renta_liquida_gravable / uvt if uvt > 0 else 0.0
    
    trace.append(AuditTraceItem(
        step_id="renta_liquida_gravable",
        title="Renta Líquida Gravable Cédula General (Casilla 39)",
        statutory_reference="Art. 241, 336 E.T.",
        raw_input_cop=ingreso_neto,
        calculated_cop=renta_liquida_gravable,
        final_allowed_cop=renta_liquida_gravable,
        notes=f"Ingreso Neto (${ingreso_neto:,.0f}) menos Alivios Procedentes (${alivios_procedentes_finales:,.0f}) = ${renta_liquida_gravable:,.0f} ({renta_liquida_gravable_uvt:,.2f} UVT)."
    ))

    # 8. CÁLCULO DEL IMPUESTO SOBRE LA RENTA (Art. 241 E.T. - Casilla 108)
    impuesto_uvt = 0.0
    tarifa_max = 0.0
    for bracket in cg_rules.tabla_marginal_art241:
        if bracket.desde_uvt <= renta_liquida_gravable_uvt < bracket.hasta_uvt:
            tarifa_max = bracket.tarifa
            impuesto_uvt = (renta_liquida_gravable_uvt - bracket.desde_uvt) * bracket.tarifa + bracket.uvt_adicional
            break
        elif renta_liquida_gravable_uvt >= bracket.hasta_uvt and bracket.hasta_uvt > 9000000:
            tarifa_max = bracket.tarifa
            impuesto_uvt = (renta_liquida_gravable_uvt - bracket.desde_uvt) * bracket.tarifa + bracket.uvt_adicional
            break

    # Redondeo del impuesto a miles de pesos
    impuesto_bruto_cop = round((impuesto_uvt * uvt) / 1000.0) * 1000.0
    
    trace.append(AuditTraceItem(
        step_id="liquidacion_impuesto_renta",
        title="Impuesto sobre Rentas Líquidas Gravables (Casilla 108)",
        statutory_reference="Art. 241 E.T.",
        raw_input_cop=renta_liquida_gravable,
        calculated_cop=impuesto_bruto_cop,
        final_allowed_cop=impuesto_bruto_cop,
        notes=f"Renta gravable en UVT: {renta_liquida_gravable_uvt:,.2f}. Tarifa marginal aplicada: {tarifa_max*100:.0f}%. Impuesto en UVT: {impuesto_uvt:,.2f} UVT = ${impuesto_bruto_cop:,.0f}."
    ))

    # 9. DESCUENTOS TRIBUTARIOS (Casilla 111) & IMPUESTO NETO (Casilla 112)
    descuentos = min(payload.descuentos_tributarios, impuesto_bruto_cop)
    impuesto_neto = max(0.0, impuesto_bruto_cop - descuentos)

    # 10. GANANCIAS OCASIONALES (Art. 300 a 317 E.T. - Casillas 104 a 107 y 113)
    total_go_brutas = (
        payload.ganancias_ocasionales_brutas_activos_fijos +
        payload.ganancias_ocasionales_brutas_herencias +
        payload.ganancias_ocasionales_brutas_loterias
    )
    costos_go = min(payload.costos_ganancia_ocasional, payload.ganancias_ocasionales_brutas_activos_fijos)
    
    # Exenciones Art. 307
    max_exenta_posible = max(0.0, (payload.ganancias_ocasionales_brutas_activos_fijos - costos_go) + payload.ganancias_ocasionales_brutas_herencias)
    go_exenta_aceptada = min(payload.ganancias_ocasionales_exentas_solicitadas, max_exenta_posible)
    
    go_gravable_ordinaria = max(0.0, (payload.ganancias_ocasionales_brutas_activos_fijos - costos_go) + payload.ganancias_ocasionales_brutas_herencias - go_exenta_aceptada)
    go_gravable_loterias = payload.ganancias_ocasionales_brutas_loterias
    total_go_gravable = go_gravable_ordinaria + go_gravable_loterias
    
    tarifa_go_ord = go_rules.tarifa_general  # 15%
    tarifa_go_lot = go_rules.tarifa_loterias_rifas  # 20%
    
    impuesto_go_cop = round(((go_gravable_ordinaria * tarifa_go_ord) + (go_gravable_loterias * tarifa_go_lot)) / 1000.0) * 1000.0

    if total_go_brutas > 0:
        trace.append(AuditTraceItem(
            step_id="ganancias_ocasionales",
            title="Impuesto de Ganancias Ocasionales (Casillas 104 a 113)",
            statutory_reference="Art. 300, 307, 313, 317 E.T.",
            raw_input_cop=total_go_brutas,
            calculated_cop=total_go_gravable,
            excess_rejected_cop=costos_go + go_exenta_aceptada,
            final_allowed_cop=impuesto_go_cop,
            notes=f"Ingresos GO (${total_go_brutas:,.0f}) - Costos (${costos_go:,.0f}) - Exentas Art. 307 (${go_exenta_aceptada:,.0f}) = Gravable: ${total_go_gravable:,.0f} -> Impuesto (15%/20%): ${impuesto_go_cop:,.0f}."
        ))

    # 11. TOTAL IMPUESTO A CARGO (Casilla 115)
    total_impuesto_a_cargo = impuesto_neto + impuesto_go_cop

    # 12. SALDO A PAGAR O SALDO A FAVOR (Casillas 120 / 121)
    total_retenciones_anticipos = payload.retenciones_fuente_practicadas + payload.anticipo_ano_anterior + payload.saldo_a_favor_ano_anterior
    diferencia = total_impuesto_a_cargo - total_retenciones_anticipos
    
    saldo_a_pagar = max(0.0, diferencia)
    saldo_a_favor = max(0.0, -diferencia)

    trace.append(AuditTraceItem(
        step_id="saldo_final",
        title="Total Impuesto a Cargo y Liquidación Privada (Casillas 115, 120, 121)",
        statutory_reference="Art. 801, 802 E.T.",
        raw_input_cop=total_impuesto_a_cargo,
        calculated_cop=diferencia,
        final_allowed_cop=saldo_a_pagar if saldo_a_pagar > 0 else -saldo_a_favor,
        notes=f"Total Impuesto a Cargo (${total_impuesto_a_cargo:,.0f}) - Retenciones/Anticipos (${total_retenciones_anticipos:,.0f}) = Saldo {'a Pagar: $' + f'{saldo_a_pagar:,.0f}' if saldo_a_pagar > 0 else 'a Favor: $' + f'{saldo_a_favor:,.0f}'}."
    ))

    # Subcédulas Cédula General
    renta_liq_trabajo = max(0.0, ingresos_trabajo - incrngo_trabajo)
    renta_liq_capital = max(0.0, payload.rentas_capital - payload.incrngo_capital)
    renta_liq_nolaboral = max(0.0, payload.rentas_nolaborales - payload.incrngo_nolaborales - payload.costos_nolaborales)

    # Mapeo Oficial Casillas Formulario 210 DIAN
    form_210_dict: Dict[str, float] = {
        "c28_deduccion_facturas_1pct": allowed_fe,
        "c29_patrimonio_bruto": patrimonio_bruto,
        "c30_patrimonio_bruto": patrimonio_bruto,
        "c30_deudas": deudas,
        "c31_deudas": deudas,
        "c31_patrimonio_liquido": patrimonio_liquido,
        "c32_patrimonio_liquido": patrimonio_liquido,
        "c32_ingresos_brutos_trabajo": ingresos_trabajo,
        "c33_ingresos_brutos_trabajo": ingresos_trabajo,
        "c33_incrngo_trabajo": incrngo_trabajo,
        "c34_incrngo_trabajo": incrngo_trabajo,
        "c34_renta_liquida_trabajo": renta_liq_trabajo,
        "c35_afc_fvp_trabajo": allowed_afc,
        "c36_renta_exenta_laboral_25": allowed_exenta_laboral,
        "c37_total_rentas_exentas_trabajo": total_rentas_exentas_aceptadas,
        "c37_rentas_exentas_deducciones_limitadas": alivios_procedentes_finales,
        "c38_intereses_vivienda_trabajo": payload.intereses_vivienda_anual,
        "c39_renta_liquida_gravable_trabajo": renta_liquida_gravable,
        "c40_total_deducciones_trabajo": total_deducciones_aceptadas,
        "c41_rentas_exentas_deducciones_limitadas_trabajo": alivios_procedentes_finales,
        "c42_renta_liquida_ordinaria_trabajo": max(0.0, renta_liq_trabajo - alivios_procedentes_finales),
        "c58_ingresos_brutos_capital": payload.rentas_capital,
        "c59_incrngo_capital": payload.incrngo_capital,
        "c61_renta_liquida_capital": renta_liq_capital,
        "c70_exentas_no_imputables_capital": 0.0,
        "c71_compensacion_perdidas_capital": 0.0,
        "c72_renta_liquida_gravable_capital": renta_liq_capital,
        "c73_renta_liquida_ordinaria_capital": renta_liq_capital,
        "c74_ingresos_brutos_nolaborales": payload.rentas_nolaborales,
        "c75_devoluciones_nolaborales": 0.0,
        "c76_incrngo_nolaborales": payload.incrngo_nolaborales,
        "c77_costos_deducciones_nolaborales": payload.costos_nolaborales,
        "c78_renta_liquida_nolaboral": renta_liq_nolaboral,
        "c87_exentas_no_imputables_nolaboral": 0.0,
        "c88_compensacion_perdidas_nolaboral": 0.0,
        "c89_renta_liquida_gravable_nolaboral": renta_liq_nolaboral,
        "c90_renta_liquida_ordinaria_nolaboral": renta_liq_nolaboral,
        "c91_total_renta_liquida_ordinaria_cedula_general": renta_liq_trabajo + renta_liq_capital + renta_liq_nolaboral,
        "c92_total_rentas_exentas_deducciones_limitadas": alivios_procedentes_finales,
        "c93_renta_liquida_ordinaria_cedula_general": max(0.0, (renta_liq_trabajo + renta_liq_capital + renta_liq_nolaboral) - alivios_procedentes_finales),
        "c97_renta_liquida_gravable_cedula_general": renta_liquida_gravable,
        "c104_ingresos_ganancias_ocasionales": total_go_brutas,
        "c105_costos_ganancias_ocasionales": costos_go,
        "c106_ganancias_ocasionales_exentas": go_exenta_aceptada,
        "c107_ganancias_ocasionales_gravables": total_go_gravable,
        "c108_impuesto_rentas_liquidas_gravables": impuesto_bruto_cop,
        "c111_total_rentas_liquidas_gravables": renta_liquida_gravable,
        "c112_ingresos_ganancias_ocasionales": total_go_brutas,
        "c113_costos_ganancias_ocasionales": costos_go,
        "c114_ganancias_ocasionales_exentas": go_exenta_aceptada,
        "c115_ganancias_ocasionales_gravables": total_go_gravable,
        "c112_impuesto_neto_renta": impuesto_neto,
        "c113_impuesto_ganancias_ocasionales": impuesto_go_cop,
        "c115_total_impuesto_a_cargo": total_impuesto_a_cargo,
        "c116_impuesto_rentas_liquidas_gravables": impuesto_bruto_cop,
        "c121_total_impuesto_a_cargo": total_impuesto_a_cargo,
        "c126_impuesto_neto_renta": impuesto_neto,
        "c127_impuesto_ganancias_ocasionales": impuesto_go_cop,
        "c129_total_impuesto_a_cargo": total_impuesto_a_cargo,
        "c130_anticipo_ano_anterior": payload.anticipo_ano_anterior,
        "c131_saldo_a_favor_ano_anterior": payload.saldo_a_favor_ano_anterior,
        "c132_retenciones_fuente": payload.retenciones_fuente_practicadas,
        "c134_total_anticipos_retenciones": total_retenciones_anticipos,
        "c136_saldo_a_pagar_por_impuesto": saldo_a_pagar,
        "c137_saldo_a_favor": saldo_a_favor,
        "c980_total_a_pagar": saldo_a_pagar,
    }

    resumen = (
        f"Liquidación Renta Persona Natural {payload.tax_year}: "
        f"Ingresos Brutos ${total_ingresos:,.0f} | "
        f"Ingreso Neto ${ingreso_neto:,.0f} | "
        f"Alivios Procedentes ${alivios_procedentes_finales:,.0f} | "
        f"Renta Líquida Gravable ${renta_liquida_gravable:,.0f} ({renta_liquida_gravable_uvt:,.2f} UVT) | "
        f"Impuesto Neto Renta ${impuesto_neto:,.0f} | "
        f"Impuesto Ganancias Ocasionales ${impuesto_go_cop:,.0f} | "
        f"Total Impuesto a Cargo ${total_impuesto_a_cargo:,.0f} | "
        f"{'Saldo a Pagar: $' + f'{saldo_a_pagar:,.0f}' if saldo_a_pagar > 0 else 'Saldo a Favor: $' + f'{saldo_a_favor:,.0f}'}."
    )

    return PersonaNaturalOutput(
        tax_year=payload.tax_year,
        uvt_value=uvt,
        patrimonio_bruto=patrimonio_bruto,
        deudas=deudas,
        patrimonio_liquido=patrimonio_liquido,
        total_ingresos_brutos=total_ingresos,
        total_incrngo=total_incrngo,
        ingreso_neto=ingreso_neto,
        total_deducciones_solicitadas=sum(d.get("raw", d["allowed"]) for d in deducciones_list) if deducciones_list else 0.0,
        total_deducciones_aceptadas=total_deducciones_aceptadas,
        total_rentas_exentas_previas=total_rentas_exentas_previas,
        renta_exenta_laboral_25=allowed_exenta_laboral,
        total_rentas_exentas_aceptadas=total_rentas_exentas_aceptadas,
        subtotal_alivios_antes_de_limite=subtotal_alivios,
        limite_conjunto_porcentaje_cop=limite_pct_cop,
        limite_conjunto_uvt_cop=limite_uvt_cop,
        limite_conjunto_aplicable_cop=limite_aplicable_cop,
        alivios_procedentes_finales=alivios_procedentes_finales,
        alivios_rechazados_por_limite=alivios_rechazados_por_limite,
        renta_liquida_gravable=renta_liquida_gravable,
        renta_liquida_gravable_uvt=renta_liquida_gravable_uvt,
        tarifa_marginal_maxima=tarifa_max,
        impuesto_bruto_renta=impuesto_bruto_cop,
        descuentos_tributarios=descuentos,
        impuesto_neto_renta=impuesto_neto,
        total_ganancias_ocasionales_brutas=total_go_brutas,
        costos_ganancia_ocasional=costos_go,
        ganancias_ocasionales_exentas_aceptadas=go_exenta_aceptada,
        ganancia_ocasional_gravable=total_go_gravable,
        impuesto_ganancias_ocasionales=impuesto_go_cop,
        total_impuesto_a_cargo=total_impuesto_a_cargo,
        total_anticipos_y_retenciones=total_retenciones_anticipos,
        saldo_a_pagar=saldo_a_pagar,
        saldo_a_favor=saldo_a_favor,
        form_210_casillas=form_210_dict,
        audit_trace=trace,
        resumen_ejecutivo=resumen
    )
