from app.core.rules_engine.loader import get_rules_for_year
from app.models.common import AuditTraceItem
from app.models.persona_juridica import (
    Formulario110Casillas,
    PersonaJuridicaInput,
    PersonaJuridicaOutput,
)


def liquidar_persona_juridica(payload: PersonaJuridicaInput) -> PersonaJuridicaOutput:
    rules = get_rules_for_year(payload.tax_year, payload.custom_uvt)
    uvt = rules.uvt_value
    pj_rules = rules.persona_juridica

    trace: list[AuditTraceItem] = []

    # 1. SECCIÓN PATRIMONIO (Casillas 36 a 46)
    c36 = payload.efectivo_y_equivalentes
    c37 = payload.inversiones_derivados
    c38 = payload.cuentas_por_cobrar
    c39 = payload.inventarios
    c40 = payload.activos_intangibles
    c41 = payload.activos_biologicos
    c42 = payload.propiedades_planta_equipo
    c43 = payload.otros_activos

    patrimonio_bruto = c36 + c37 + c38 + c39 + c40 + c41 + c42 + c43
    c44 = patrimonio_bruto
    pasivos = payload.pasivos
    c45 = pasivos
    patrimonio_liquido = max(0.0, patrimonio_bruto - pasivos)
    c46 = patrimonio_liquido

    trace.append(
        AuditTraceItem(
            step_id="patrimonio_pj",
            title="Patrimonio Bruto y Líquido Fiscal (Formulario 110)",
            statutory_reference="Art. 261-287 E.T.",
            raw_input_cop=patrimonio_bruto,
            calculated_cop=patrimonio_liquido,
            final_allowed_cop=patrimonio_liquido,
            notes=f"Patrimonio Bruto (${patrimonio_bruto:,.0f}) menos Deudas (${pasivos:,.0f}) = Patrimonio Líquido (${patrimonio_liquido:,.0f}).",
        )
    )

    # 2. SECCIÓN INGRESOS (Casillas 47 a 61)
    c47 = payload.ingresos_brutos_operacionales
    c48 = (
        payload.ingresos_financieros
        if payload.ingresos_financieros > 0
        else payload.ingresos_brutos_no_operacionales
    )
    c49 = payload.dividendos_no_constitutivos
    c50 = 0.0
    c51 = payload.dividendos_gravados_tarifa_general
    c52 = 0.0
    c53 = 0.0
    c54 = 0.0
    c55 = 0.0
    c56 = 0.0
    c57 = payload.otros_ingresos

    ingresos_brutos_totales = c47 + c48 + c49 + c50 + c51 + c52 + c53 + c54 + c55 + c56 + c57
    c58 = ingresos_brutos_totales
    c59 = payload.devoluciones_rebajas_descuentos
    c60 = (
        payload.ingresos_no_constitutivos_renta
        if payload.ingresos_no_constitutivos_renta > 0
        else c49
    )
    ingresos_netos = max(0.0, c58 - c59 - c60)
    c61 = ingresos_netos

    trace.append(
        AuditTraceItem(
            step_id="ingresos_fiscales_pj",
            title="Ingresos Brutos y Netos Fiscales (Casillas 58 y 61)",
            statutory_reference="Art. 26, 27, 28 E.T.",
            raw_input_cop=c58,
            calculated_cop=c61,
            final_allowed_cop=c61,
            notes=f"Total Ingresos Brutos (${c58:,.0f}) menos Devoluciones (${c59:,.0f}) e INCRNGO (${c60:,.0f}) = Ingresos Netos (${c61:,.0f}).",
        )
    )

    # 3. SECCIÓN COSTOS Y GASTOS (Casillas 62 a 67)
    c62 = payload.costos_procedentes
    c63 = payload.gastos_administracion
    c64 = payload.gastos_ventas
    c65 = payload.gastos_financieros
    c66 = payload.otros_gastos_deducciones + payload.deducciones_especiales

    gastos_brutos = c63 + c64 + c65 + c66
    gastos_deducibles = max(0.0, gastos_brutos - payload.gastos_no_deducibles)
    total_costos_gastos = c62 + gastos_deducibles
    c67 = total_costos_gastos
    renta_bruta = max(0.0, c61 - c62)

    trace.append(
        AuditTraceItem(
            step_id="costos_gastos_deducibles_pj",
            title="Costos y Gastos Deducibles (Casilla 67)",
            statutory_reference="Art. 107 E.T.",
            raw_input_cop=total_costos_gastos,
            calculated_cop=c67,
            excess_rejected_cop=payload.gastos_no_deducibles,
            final_allowed_cop=c67,
            notes=f"Costos (${c62:,.0f}) + Gastos Admin (${c63:,.0f}) + Ventas (${c64:,.0f}) + Financieros (${c65:,.0f}) + Otros (${c66:,.0f}).",
        )
    )

    # 4. SECCIÓN RENTA (Casillas 70 a 79)
    c68 = 0.0  # Inversiones ESAL
    c69 = 0.0
    c70 = 0.0  # Recuperación deducciones
    c71 = 0.0  # Rentas pasivas ECE

    renta_liquida_ordinaria = max(
        0.0, c61 + c69 + c70 + c71 - (c52 + c53 + c54 + c55 + c56) - c67 - c68
    )
    perdida_liquida = max(0.0, (c52 + c53 + c54 + c55 + c56) + c67 + c68 - (c61 + c69 + c70 + c71))
    c72 = renta_liquida_ordinaria
    c73 = perdida_liquida

    total_compensaciones = min(
        c72, payload.compensacion_perdidas_fiscales + payload.compensacion_exceso_renta_presuntiva
    )
    c74 = total_compensaciones
    c75 = max(0.0, c72 - c74)
    c76 = 0.0  # Renta presuntiva 0%
    c77 = min(c75, payload.rentas_exentas)
    c78 = 0.0  # Rentas gravables especiales
    c79 = max(0.0, max(c75, c76) - c77 + c78)
    renta_liquida_gravable = c79

    trace.append(
        AuditTraceItem(
            step_id="renta_liquida_gravable_pj",
            title="Renta Líquida Gravable (Casilla 79 / Formulario 110)",
            statutory_reference="Art. 147, 178, 188, 235-2 E.T.",
            raw_input_cop=c72,
            calculated_cop=c79,
            final_allowed_cop=c79,
            notes=f"Renta Líquida Ordinaria (${c72:,.0f}) menos Compensaciones (${c74:,.0f}) y Rentas Exentas (${c77:,.0f}) = RLG (${c79:,.0f}).",
        )
    )

    # 5. TARIFA GENERAL Y SOBRETASAS (Casillas 84 y 85)
    tarifa_base = pj_rules.tarifa_general
    if payload.tarifa_personalizada is not None and payload.tarifa_personalizada > 0:
        tarifa_base = payload.tarifa_personalizada
    elif payload.tipo_regimen == "zona_franca":
        tarifa_base = pj_rules.tarifa_zona_franca
    elif payload.tipo_regimen == "hotelero":
        tarifa_base = pj_rules.tarifa_hoteles_ecoturismo
    elif payload.tipo_regimen == "cooperativa":
        tarifa_base = pj_rules.tarifa_cooperativas
    elif payload.tipo_regimen == "zomac":
        tarifa_base = 0.175  # Tarifa escalonada promedio ZOMAC

    impuesto_basico = round((renta_liquida_gravable * tarifa_base) / 1000.0) * 1000.0
    c84 = impuesto_basico

    # Sobretasas (Parágrafos 2, 3 y 4 del Art. 240 E.T.)
    puntos_adicionales_pct = 0.0
    rlg_en_uvt = renta_liquida_gravable / uvt if uvt > 0 else 0.0

    if (
        payload.aplica_sobretasa_financiera
        and rlg_en_uvt >= pj_rules.sobretasa_financiera.umbral_uvt
    ):
        puntos_adicionales_pct += pj_rules.sobretasa_financiera.puntos_adicionales  # 5%
    if (
        payload.aplica_sobretasa_hidroelectrica
        and rlg_en_uvt >= pj_rules.sobretasa_hidroelectricas.umbral_uvt
    ):
        puntos_adicionales_pct += pj_rules.sobretasa_hidroelectricas.puntos_adicionales  # 3%
    if payload.sobretasa_minero_petroleo_pct > 0 and rlg_en_uvt >= 50000.0:
        puntos_adicionales_pct += payload.sobretasa_minero_petroleo_pct

    impuesto_sobretasa = round((renta_liquida_gravable * puntos_adicionales_pct) / 1000.0) * 1000.0
    c85 = impuesto_sobretasa

    c86 = round((c54 * 0.20) / 1000.0) * 1000.0
    c87 = round((c55 * tarifa_base) / 1000.0) * 1000.0
    c88 = round((c56 * 0.27) / 1000.0) * 1000.0
    c89 = round((c53 * tarifa_base) / 1000.0) * 1000.0
    c90 = round((c52 * 0.33) / 1000.0) * 1000.0
    c91 = c84 + c85 + c86 + c87 + c88 + c89 + c90

    # 6. VALOR A ADICIONAR (VAA - Art. 259-1 E.T.)
    c92 = 0.0  # VAA límite 3%

    # 7. DESCUENTOS TRIBUTARIOS (Casilla 93)
    desc_ica_aplicado = min(payload.descuento_tributario_ica, c91)
    otros_desc_aplicado = min(
        payload.otros_descuentos_tributarios, max(0.0, c91 - desc_ica_aplicado)
    )
    total_descuentos = desc_ica_aplicado + otros_desc_aplicado
    c93 = total_descuentos

    c94 = max(0.0, c91 + c92 - c93)

    # 8. TASA DE TRIBUTACIÓN DEPURADA (TTD - Art. 240 Parágrafo 6) & CASILLA 95
    ttd_pct = 0.0
    aplica_ia_ttd = False
    impuesto_adicional_ttd = 0.0
    utilidad_depurada = max(
        0.0, payload.utilidad_contable_antes_impuestos - payload.diferencias_permanentes_ttd
    )
    impuesto_depurado = max(0.0, c94)

    if pj_rules.tasa_minima_ttd.aplica and payload.utilidad_contable_antes_impuestos > 0:
        if utilidad_depurada > 0:
            ttd_pct = impuesto_depurado / utilidad_depurada
            tarifa_minima_req = pj_rules.tasa_minima_ttd.tarifa_minima  # 15%

            if ttd_pct < tarifa_minima_req:
                aplica_ia_ttd = True
                impuesto_requerido = utilidad_depurada * tarifa_minima_req
                impuesto_adicional_ttd = (
                    round(max(0.0, impuesto_requerido - impuesto_depurado) / 1000.0) * 1000.0
                )

        trace.append(
            AuditTraceItem(
                step_id="tasa_minima_ttd",
                title="Tasa de Tributación Depurada (TTD - Art. 240 Par. 6 / Casilla 95)",
                statutory_reference="Art. 240 Parágrafo 6 E.T.",
                raw_input_cop=payload.utilidad_contable_antes_impuestos,
                calculated_cop=impuesto_adicional_ttd,
                final_allowed_cop=impuesto_adicional_ttd,
                notes=f"TTD Calculada: {ttd_pct * 100:.2f}% (Mínimo: 15.00%). {'Impuesto a Adicionar (IA): $' + f'{impuesto_adicional_ttd:,.0f}' if aplica_ia_ttd else 'Cumple con la tasa mínima legal del 15%.'}",
            )
        )

    c95 = impuesto_adicional_ttd
    c96 = c94 + c95

    # 9. GANANCIAS OCASIONALES (Casillas 80 a 83 y 97)
    c80 = payload.ganancias_ocasionales_brutas
    c81 = payload.costos_ganancia_ocasional
    c82 = payload.ganancias_ocasionales_exentas
    go_gravable = max(0.0, c80 - c81 - c82) if c80 > 0 else payload.ganancia_ocasional_gravable
    c83 = go_gravable

    impuesto_go = round((c83 * pj_rules.ganancia_ocasional) / 1000.0) * 1000.0
    c97 = impuesto_go
    c98 = 0.0
    c99 = max(0.0, c96 + c97 - c98)

    # 10. OBRAS POR IMPUESTOS Y CRÉDITO FISCAL (Casillas 100 a 102)
    c100 = min(payload.obras_por_impuestos_mod1, c99 * 0.50)
    c101 = min(payload.descuento_obras_mod2, c99 * 0.50)
    c102 = payload.credito_fiscal_256_1

    # 11. RETENCIONES Y ANTICIPOS (Casillas 103 a 110)
    c103 = payload.anticipo_ano_anterior
    c104 = payload.saldo_a_favor_ano_anterior
    c105 = payload.autorretenciones_practicadas
    c106 = payload.retenciones_en_la_fuente
    c107 = c105 + c106

    # Anticipo año siguiente (Art. 807 E.T.)
    pct_ant = payload.porcentaje_anticipo_siguiente
    anticipo_ano_siguiente = max(0.0, round((c96 * pct_ant - c107) / 1000.0) * 1000.0)
    c108 = anticipo_ano_siguiente
    c109 = payload.anticipo_sobretasa_ano_anterior

    # Anticipo sobretasa 100% de la sobretasa liquidada
    anticipo_sobretasa_siguiente = c85 if puntos_adicionales_pct > 0 else 0.0
    c110 = anticipo_sobretasa_siguiente

    # 12. SALDOS FINALES Y SANCIONES (Casillas 111 a 114 y 980)
    c112 = payload.sanciones
    if c112 > 0:
        c112 = max(c112, round((10 * uvt) / 1000.0) * 1000.0)

    creditos_totales = c100 + c101 + c102 + c103 + c104 + c107 + c109
    debitos_totales = c99 + c108 + c110 + c112

    diferencia = debitos_totales - creditos_totales
    c111 = max(0.0, c99 + c108 + c110 - creditos_totales)
    c113 = max(0.0, diferencia)
    c114 = max(0.0, -diferencia)
    c115 = payload.obras_por_impuestos_mod1
    c116 = 0.0
    c117 = payload.aporte_voluntario_art244_1
    c980 = c113 + c117

    total_retenciones_anticipos = creditos_totales

    trace.append(
        AuditTraceItem(
            step_id="saldo_final_pj",
            title="Liquidación Privada y Saldo Final (Casillas 113 y 114)",
            statutory_reference="Art. 801, 802 E.T.",
            raw_input_cop=c99,
            calculated_cop=diferencia,
            final_allowed_cop=c113 if c113 > 0 else -c114,
            notes=f"Total Impuesto a Cargo (${c99:,.0f}) + Anticipo (${c108:,.0f}) - Retenciones (${c107:,.0f}) - Anticipo Anterior (${c103:,.0f}) = Saldo {'a Pagar: $' + f'{c113:,.0f}' if c113 > 0 else 'a Favor: $' + f'{c114:,.0f}'}.",
        )
    )

    # Determinar necesidad de Revisor Fiscal vs Contador
    # Revisor Fiscal: Activos >= 5000 SMMLV o Ingresos >= 3000 SMMLV
    cod_profesional = "2" if (patrimonio_bruto >= 7000000000.0 or c58 >= 4200000000.0) else "1"

    form_110 = Formulario110Casillas(
        ano=payload.tax_year,
        numero_formulario=f"110{payload.tax_year}99999",
        nit="900123456",
        dv="1",
        razon_social="EMPRESA NACIONAL S.A.S.",
        cod_direccion_seccional=32,
        actividad_economica="6201",
        c33_total_costos_gastos_nomina=payload.total_costos_gastos_nomina,
        c34_aportes_seguridad_social=payload.aportes_seguridad_social,
        c35_aportes_sena_icbf_cajas=payload.aportes_sena_icbf_cajas,
        c36_efectivo_y_equivalentes=c36,
        c37_inversiones_derivados=c37,
        c38_cuentas_por_cobrar=c38,
        c39_inventarios=c39,
        c40_activos_intangibles=c40,
        c41_activos_biologicos=c41,
        c42_propiedades_planta_equipo=c42,
        c43_otros_activos=c43,
        c44_total_patrimonio_bruto=c44,
        c45_pasivos=c45,
        c46_total_patrimonio_liquido=c46,
        c47_ingresos_brutos_ordinarios=c47,
        c48_ingresos_financieros=c48,
        c49_dividendos_no_constitutivos=c49,
        c50_dividendos_chc=c50,
        c51_dividendos_gravados_tarifa_general=c51,
        c52_dividendos_no_residentes_2016=c52,
        c53_dividendos_no_residentes_2017=c53,
        c54_dividendos_art245_246=c54,
        c55_dividendos_ep_extranjeras_2017=c55,
        c56_dividendos_megainversion_27=c56,
        c57_otros_ingresos=c57,
        c58_total_ingresos_brutos=c58,
        c59_devoluciones_rebajas_descuentos=c59,
        c60_ingresos_no_constitutivos_renta=c60,
        c61_total_ingresos_netos=c61,
        c62_costos=c62,
        c63_gastos_administracion=c63,
        c64_gastos_distribucion_ventas=c64,
        c65_gastos_financieros=c65,
        c66_otros_gastos_deducciones=c66,
        c67_total_costos_gastos_deducibles=c67,
        c68_inversiones_efectuadas_ano=c68,
        c69_inversiones_liquidadas_periodos_anteriores=c69,
        c70_renta_recuperacion_deducciones=c70,
        c71_renta_pasiva_ece=c71,
        c72_renta_liquida_ordinaria=c72,
        c73_perdida_liquida_ejercicio=c73,
        c74_compensaciones=c74,
        c75_renta_liquida=c75,
        c76_renta_presuntiva=c76,
        c77_renta_exenta=c77,
        c78_rentas_gravables=c78,
        c79_renta_liquida_gravable=c79,
        c80_ingresos_ganancias_ocasionales=c80,
        c81_costos_ganancias_ocasionales=c81,
        c82_ganancias_ocasionales_exentas=c82,
        c83_ganancias_ocasionales_gravables=c83,
        c84_impuesto_renta_liquida_gravable=c84,
        c85_puntos_adicionales_sobretasa=c85,
        c86_impuesto_dividendos_art245_246=c86,
        c87_impuesto_dividendos_art240=c87,
        c88_impuesto_dividendos_megainversion=c88,
        c89_impuesto_dividendos_no_residentes_2017=c89,
        c90_impuesto_dividendos_no_residentes_2016=c90,
        c91_total_impuesto_rentas_liquidas=c91,
        c92_valor_a_adicionar_vaa=c92,
        c93_descuentos_tributarios=c93,
        c94_impuesto_neto_renta_sin_adicion=c94,
        c95_impuesto_a_adicionar_ttd=c95,
        c96_impuesto_neto_renta_con_adicion=c96,
        c97_impuesto_ganancias_ocasionales=c97,
        c98_descuento_impuestos_exterior_go=c98,
        c99_total_impuesto_a_cargo=c99,
        c100_obras_por_impuestos_mod1=c100,
        c101_descuento_obras_por_impuestos_mod2=c101,
        c102_credito_fiscal_256_1=c102,
        c103_anticipo_renta_ano_anterior=c103,
        c104_saldo_a_favor_ano_anterior=c104,
        c105_autorretenciones=c105,
        c106_otras_retenciones=c106,
        c107_total_retenciones_ano_declarar=c107,
        c108_anticipo_renta_ano_siguiente=c108,
        c109_anticipo_sobretasa_ano_anterior=c109,
        c110_anticipo_sobretasa_ano_siguiente=c110,
        c111_saldo_a_pagar_por_impuesto=c111,
        c112_sanciones=c112,
        c113_total_saldo_a_pagar=c113,
        c114_total_saldo_a_favor=c114,
        c115_obras_impuestos_exigible_mod1=c115,
        c116_total_proyecto_obras_mod2=c116,
        c117_aporte_voluntario_art244_1=c117,
        c980_pago_total=c980,
        c981_cod_representacion="1",
        c982_cod_contador_o_revisor=cod_profesional,
        c983_tarjeta_profesional="123456-T",
    )

    resumen = (
        f"Liquidación Persona Jurídica Formulario 110 ({payload.tax_year}): "
        f"Ingresos Netos ${ingresos_netos:,.0f} | "
        f"Renta Líquida Gravable ${renta_liquida_gravable:,.0f} | "
        f"Impuesto Básico ({tarifa_base * 100:.1f}%) ${impuesto_basico:,.0f} | "
        f"Sobretasas ${impuesto_sobretasa:,.0f} | "
        f"Impuesto Adicional TTD ${impuesto_adicional_ttd:,.0f} | "
        f"Impuesto a Cargo ${c99:,.0f} | "
        f"{'Saldo a Pagar: $' + f'{c113:,.0f}' if c113 > 0 else 'Saldo a Favor: $' + f'{c114:,.0f}'}."
    )

    return PersonaJuridicaOutput(
        tax_year=payload.tax_year,
        uvt_value=uvt,
        patrimonio_bruto=patrimonio_bruto,
        pasivos=pasivos,
        patrimonio_liquido=patrimonio_liquido,
        ingresos_brutos_totales=c58,
        ingresos_netos=ingresos_netos,
        renta_bruta=renta_bruta,
        total_gastos_deducibles=gastos_deducibles,
        renta_liquida_ordinaria=renta_liquida_ordinaria,
        renta_liquida_gravable=renta_liquida_gravable,
        tarifa_renta_aplicada=tarifa_base,
        impuesto_basico_renta=impuesto_basico,
        puntos_adicionales_sobretasa=puntos_adicionales_pct,
        impuesto_sobretasa=impuesto_sobretasa,
        ttd_calculada_pct=ttd_pct * 100.0,
        utilidad_depurada_ttd=utilidad_depurada,
        impuesto_depurado_ttd=impuesto_depurado,
        aplica_impuesto_adicional_ttd=aplica_ia_ttd,
        impuesto_adicional_ttd=impuesto_adicional_ttd,
        impuesto_ganancias_ocasionales=impuesto_go,
        total_descuentos_tributarios_aplicados=total_descuentos,
        total_impuesto_a_cargo=c99,
        impuesto_neto_total=c96 + c97,
        total_retenciones_declarar=c107,
        anticipo_ano_siguiente=c108,
        anticipo_sobretasa_ano_siguiente=c110,
        total_retenciones_y_anticipos=total_retenciones_anticipos,
        saldo_a_pagar=c113,
        saldo_a_favor=c114,
        form_110_casillas=form_110,
        audit_trace=trace,
        resumen_ejecutivo=resumen,
    )
