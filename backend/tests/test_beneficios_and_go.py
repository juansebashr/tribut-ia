from app.models.persona_natural import PersonaNaturalInput
from app.services.beneficios import (
    BeneficioAuditoriaRequest,
    ReduccionSancionRequest,
    calcular_beneficio_auditoria,
    calcular_reduccion_sancion,
    get_catalogo_beneficios,
)
from app.services.liquidacion_pn import liquidar_persona_natural


def test_persona_natural_con_ganancia_ocasional():
    """Valida la liquidación de Ganancia Ocasional (venta inmueble > 2 años) y su integración en el Form 210."""
    uvt = 52350
    input_data = PersonaNaturalInput(
        tax_year=2026,
        custom_uvt=uvt,
        patrimonio_bruto=500000000,
        deudas=150000000,
        rentas_trabajo=80000000,
        aporte_salud_obligatorio=3200000,
        aporte_pension_obligatorio=3200000,
        aplica_dependiente_general=True,
        ganancias_ocasionales_brutas_activos_fijos=300000000,  # Venta inmueble
        costos_ganancia_ocasional=200000000,  # Costo fiscal
        ganancias_ocasionales_exentas_solicitadas=0,
        ganancias_ocasionales_brutas_loterias=10000000,  # Lotería (tarifa 20%)
    )

    result = liquidar_persona_natural(input_data)

    # 1. Patrimonio Líquido = 500M - 150M = 350M (Casilla 32)
    assert result.patrimonio_liquido == 350000000
    assert result.form_210_casillas["c30_patrimonio_bruto"] == 500000000
    assert result.form_210_casillas["c31_deudas"] == 150000000
    assert result.form_210_casillas["c32_patrimonio_liquido"] == 350000000

    # 2. Ganancia Ocasional Bruta = 300M + 10M = 310M (Casilla 104)
    assert result.total_ganancias_ocasionales_brutas == 310000000
    assert result.costos_ganancia_ocasional == 200000000

    # GO Gravable = (300M - 200M) + 10M = 110M (Casilla 107)
    assert result.ganancia_ocasional_gravable == 110000000

    # Impuesto GO = (100M * 15%) + (10M * 20%) = 15.000.000 + 2.000.000 = 17.000.000 (Casilla 113)
    assert result.impuesto_ganancias_ocasionales == 17000000

    # Total Impuesto a Cargo = Impuesto Neto Renta + Impuesto GO (Casilla 115)
    assert result.total_impuesto_a_cargo == result.impuesto_neto_renta + 17000000
    assert result.form_210_casillas["c113_impuesto_ganancias_ocasionales"] == 17000000
    assert result.form_210_casillas["c115_total_impuesto_a_cargo"] == result.total_impuesto_a_cargo


def test_beneficio_auditoria_calculo():
    """Valida el cálculo del beneficio de auditoría para 6 y 12 meses."""
    req = BeneficioAuditoriaRequest(
        tax_year=2026, impuesto_neto_ano_anterior=10000000, custom_uvt=52350
    )
    res = calcular_beneficio_auditoria(req)

    assert res.cumple_impuesto_minimo
    # +35% para 6 meses = 13.500.000
    assert res.impuesto_objetivo_6_meses_cop == 13500000
    # +25% para 12 meses = 12.500.000
    assert res.impuesto_objetivo_12_meses_cop == 12500000


def test_reduccion_sanciones():
    """Valida la reducción de sanciones por el Art. 640 y 644 E.T."""
    req = ReduccionSancionRequest(
        monto_sancion_base_cop=2000000,
        sin_sanciones_ultimos_2_anos=True,
        sin_sanciones_ultimo_1_ano=True,
    )
    res = calcular_reduccion_sancion(req)

    assert res.porcentaje_reduccion_aplicado == 50.0
    assert res.sancion_final_reducida_cop == 1000000
    assert res.ahorro_sancion_cop == 1000000


def test_catalogo_beneficios():
    """Valida que el catálogo de beneficios contenga todas las categorías legales."""
    catalog = get_catalogo_beneficios()
    categories = {b.categoria for b in catalog}
    assert "incrngo" in categories
    assert "deducciones" in categories
    assert "rentas_exentas" in categories
    assert "auditoria_sanciones" in categories
    assert len(catalog) >= 10


def test_calcular_sancion_correccion_voluntaria_con_reduccion():
    """Valida el cálculo de sanción por corrección voluntaria (10%) y reducción al 50% (Art. 640)."""
    from app.services.beneficios import LiquidacionSancionRequest, calcular_sancion_tributaria

    req = LiquidacionSancionRequest(
        tipo_sancion="correccion",
        monto_base_cop=20000000,  # Mayor valor: 20M
        es_voluntario_sin_emplazamiento=True,
        sin_sanciones_ultimos_2_anos=True,
        sin_sanciones_ultimo_1_ano=True,
        tax_year=2026,
        custom_uvt=52350,
    )
    res = calcular_sancion_tributaria(req)

    # 10% de 20M = 2.000.000
    assert res.sancion_plena_sin_reduccion_cop == 2000000
    assert res.porcentaje_reduccion_art640_pct == 50.0
    # Sanción con 50% de descuento = 1.000.000
    assert res.sancion_con_reduccion_cop == 1000000
    assert res.sancion_final_a_pagar_cop == 1000000
    assert not res.aplico_sancion_minima
    # Comparativa si la DIAN hubiese emplazado: 20% de 20M = 4.000.000
    assert res.comparativa_sancion_con_emplazamiento_dian_cop == 4000000
    assert res.ahorro_por_corregir_antes_de_dian_cop == 3000000


def test_calcular_sancion_control_minima_10_uvt():
    """Valida que la sanción liquidada nunca sea inferior a 10 UVT (Art. 639 E.T.)."""
    from app.services.beneficios import LiquidacionSancionRequest, calcular_sancion_tributaria

    uvt = 52350
    req = LiquidacionSancionRequest(
        tipo_sancion="correccion",
        monto_base_cop=1000000,  # Mayor valor pequeño: 1M (sanción 10% = 100k, reducida al 50% = 50k)
        es_voluntario_sin_emplazamiento=True,
        sin_sanciones_ultimos_2_anos=True,
        tax_year=2026,
        custom_uvt=uvt,
    )
    res = calcular_sancion_tributaria(req)

    # 10 UVT = 524.000 COP redondeado
    assert res.aplico_sancion_minima
    assert res.sancion_final_a_pagar_cop == 524000


def test_calcular_sancion_extemporaneidad_mensual():
    """Valida la sanción por extemporaneidad voluntaria (5% por mes o fracción)."""
    from app.services.beneficios import LiquidacionSancionRequest, calcular_sancion_tributaria

    req = LiquidacionSancionRequest(
        tipo_sancion="extemporaneidad",
        monto_base_cop=10000000,  # Impuesto a cargo: 10M
        meses_fraccion_retraso=3,  # 3 meses (15%)
        es_voluntario_sin_emplazamiento=True,
        sin_sanciones_ultimos_2_anos=False,
        sin_sanciones_ultimo_1_ano=True,  # 25% descuento (paga 75%)
        tax_year=2026,
        custom_uvt=52350,
    )
    res = calcular_sancion_tributaria(req)

    # 15% de 10M = 1.500.000
    assert res.sancion_plena_sin_reduccion_cop == 1500000
    assert res.porcentaje_reduccion_art640_pct == 25.0
    # 1.500.000 * 0.75 = 1.125.000
    assert res.sancion_con_reduccion_cop == 1125000
    assert res.sancion_final_a_pagar_cop == 1125000


def test_calcular_exencion_inmueble_afc_art311_1():
    """Valida el cálculo de la utilidad exenta por venta de casa de habitación depositada en AFC (hasta 5.000 UVT)."""
    from app.services.beneficios import SimulacionInmuebleAfcRequest, calcular_exencion_inmueble_afc

    uvt = 52350
    # Venta de casa en 700M con costo de 350M => Utilidad bruta: 350M
    # Monto depositado en AFC: 300M
    # Tope 5.000 UVT: 261.750.000
    req = SimulacionInmuebleAfcRequest(
        precio_venta_cop=700000000,
        costo_fiscal_inmueble_cop=350000000,
        es_vivienda_habitacion=True,
        posesion_mas_2_anos=True,
        monto_depositado_afc_o_vivienda_cop=300000000,
        tax_year=2026,
        custom_uvt=uvt,
    )
    res = calcular_exencion_inmueble_afc(req)

    assert res.ganancia_ocasional_bruta_cop == 350000000
    assert res.tope_maximo_exencion_cop == 261750000
    # La exención no puede superar el tope de 5.000 UVT
    assert res.ganancia_ocasional_exenta_cop == 261750000
    # Gravada = 350M - 261.75M = 88.25M
    assert res.ganancia_ocasional_gravada_final_cop == 88250000
    # Impuesto sin AFC = 350M * 15% = 52.500.000
    assert res.impuesto_go_sin_afc_cop == 52500000
    # Impuesto con AFC = 88.25M * 15% = 13.237.500
    assert res.impuesto_go_con_afc_cop == 13237500
    # Ahorro = 261.75M * 15% = 39.262.500
    assert res.ahorro_impuesto_afc_cop == 39262500


def test_calcular_sancion_con_intereses_de_mora_compuestos():
    """Valida el cálculo de intereses de mora diarios compuestos (Arts. 634 y 635 E.T.) y total consolidado."""
    from app.services.beneficios import LiquidacionSancionRequest, calcular_sancion_tributaria

    # 10M base, 60 días de mora, 23.0% E.A.
    req = LiquidacionSancionRequest(
        tipo_sancion="correccion",
        monto_base_cop=10000000,
        es_voluntario_sin_emplazamiento=True,
        sin_sanciones_ultimos_2_anos=True,
        incluir_intereses_mora=True,
        dias_mora=60,
        tasa_interes_anual_pct=23.0,
        tax_year=2026,
        custom_uvt=52350,
    )
    res = calcular_sancion_tributaria(req)

    assert res.incluye_intereses_mora
    assert res.dias_mora == 60
    assert res.tasa_interes_anual_pct == 23.0
    # Sanción: 10% de 10M = 1M, reducida al 50% = 500k (ajustado a mínima 10 UVT: 524.000)
    assert res.sancion_final_a_pagar_cop == 524000
    # Factor compuesto: (1 + 0.23)^(60/365) - 1 ≈ 0.034873 => ~349.000 COP
    assert res.intereses_mora_cop > 340000 and res.intereses_mora_cop < 360000
    # Total consolidado = 10.000.000 + 524.000 + ~349.000 = ~10.873.000
    assert (
        res.total_consolidado_a_pagar_cop
        == 10000000 + res.sancion_final_a_pagar_cop + res.intereses_mora_cop
    )


def test_calcular_sancion_inexactitud_tarifas_y_procesos():
    """Valida las tarifas de sanción por inexactitud (General 100%, Facturas Falsas 160%, Abuso 200%, Req Especial 35%)."""
    from app.services.beneficios import LiquidacionSancionRequest, calcular_sancion_tributaria

    # 1. Inexactitud General (100% con rebaja 50% Art. 640)
    res_gen = calcular_sancion_tributaria(
        LiquidacionSancionRequest(
            tipo_sancion="inexactitud_general",
            monto_base_cop=20000000,
            sin_sanciones_ultimos_2_anos=True,
            incluir_intereses_mora=False,
            tax_year=2026,
            custom_uvt=52350,
        )
    )
    assert res_gen.tarifa_base_pct == 100.0
    assert res_gen.sancion_plena_sin_reduccion_cop == 20000000
    assert res_gen.sancion_final_a_pagar_cop == 10000000  # 50% rebaja

    # 2. Inexactitud Facturas Falsas (160% sin rebaja Art. 640 Par. 3)
    res_fact = calcular_sancion_tributaria(
        LiquidacionSancionRequest(
            tipo_sancion="inexactitud_facturas_falsas",
            monto_base_cop=10000000,
            sin_sanciones_ultimos_2_anos=True,
            incluir_intereses_mora=False,
            tax_year=2026,
            custom_uvt=52350,
        )
    )
    assert res_fact.tarifa_base_pct == 160.0
    assert res_fact.sancion_final_a_pagar_cop == 16000000
    assert res_fact.porcentaje_reduccion_art640_pct == 0.0

    # 3. Inexactitud con Aceptación en Requerimiento Especial (Art. 709 - 35%)
    res_req = calcular_sancion_tributaria(
        LiquidacionSancionRequest(
            tipo_sancion="inexactitud_req_especial",
            monto_base_cop=30000000,
            incluir_intereses_mora=False,
            tax_year=2026,
            custom_uvt=52350,
        )
    )
    assert res_req.tarifa_base_pct == 35.0
    assert res_req.sancion_final_a_pagar_cop == 10500000  # 35% de 30M
    assert res_req.comparativa_sancion_con_emplazamiento_dian_cop == 30000000  # 100% si no aceptara


def test_calcular_sancion_saldo_a_favor_sin_intereses():
    """Valida que una declaración con saldo a favor pague sanción pero cero intereses moratorios (Art. 634 E.T.)."""
    from app.services.beneficios import LiquidacionSancionRequest, calcular_sancion_tributaria

    req = LiquidacionSancionRequest(
        tipo_sancion="extemporaneidad",
        monto_base_cop=50000000,  # 50M de saldo a favor base
        meses_fraccion_retraso=2,
        es_voluntario_sin_emplazamiento=True,
        sin_sanciones_ultimos_2_anos=True,
        es_saldo_a_favor=True,
        incluir_intereses_mora=True,
        dias_mora=60,
        tasa_interes_anual_pct=23.0,
        tax_year=2026,
        custom_uvt=52350,
    )
    res = calcular_sancion_tributaria(req)

    # 10% de 50M = 5M, reducida al 50% = 2.500.000
    assert res.sancion_final_a_pagar_cop == 2500000
    # Por saldo a favor los intereses son 0
    assert res.intereses_mora_cop == 0.0
    # Total consolidado a pagar es SOLO la sanción (no hay capital a deber)
    assert res.total_consolidado_a_pagar_cop == 2500000


def test_ejemplo_venta_inmueble_reajuste_dane_y_afc_caso_real():
    """Valida el ejemplo práctico de enajenación de inmueble con Art. 73 y AFC:

    Venta en 450M, compra en 150M en 2011 (factor Art. 73 = 2.86x).
    Sin ajuste: utilidad 300M, impuesto 15% = 45M.
    Con Art. 73: costo ajustado 429M, utilidad 21M, impuesto 15% = 3.15M.
    Ahorro Art. 73: 41.850.000 COP.
    Con AFC adicional de 21M: impuesto final 0 COP (100% ahorro).
    """
    from app.services.beneficios import SimulacionInmuebleAfcRequest, calcular_exencion_inmueble_afc

    # 1. Solo Art. 73 sin AFC
    req = SimulacionInmuebleAfcRequest(
        precio_venta_cop=450000000,
        costo_adquisicion_historico_cop=150000000,
        ano_adquisicion="2011",
        tipo_inmueble="bienes_raices_urbanos",
        metodo_costo_fiscal="art73",
        es_vivienda_habitacion=True,
        posesion_mas_2_anos=True,
        monto_depositado_afc_o_vivienda_cop=0,
        tax_year=2026,
        custom_uvt=52350,
    )
    res = calcular_exencion_inmueble_afc(req)

    assert res.factor_art73_aplicado == 2.86
    assert res.costo_fiscal_determinado_cop == 429000000  # 150M * 2.86
    assert res.ganancia_ocasional_bruta_cop == 21000000  # 450M - 429M
    assert res.impuesto_go_sin_planeacion_cop == 45000000  # (450M - 150M) * 15% = 300M * 15%
    assert res.impuesto_go_con_beneficios_cop == 3150000  # 21M * 15%
    assert res.ahorro_total_impuesto_cop == 41850000  # 45M - 3.15M
    assert len(res.escenarios) == 5

    # 2. Con AFC de 21M (Exención total del remanente)
    req_afc = SimulacionInmuebleAfcRequest(
        precio_venta_cop=450000000,
        costo_adquisicion_historico_cop=150000000,
        ano_adquisicion="2011",
        tipo_inmueble="bienes_raices_urbanos",
        metodo_costo_fiscal="art73",
        es_vivienda_habitacion=True,
        posesion_mas_2_anos=True,
        monto_depositado_afc_o_vivienda_cop=21000000,
        tax_year=2026,
        custom_uvt=52350,
    )
    res_afc = calcular_exencion_inmueble_afc(req_afc)
    assert res_afc.ganancia_exenta_afc_art311_1_cop == 21000000
    assert res_afc.ganancia_ocasional_gravada_final_cop == 0
    assert res_afc.impuesto_go_con_beneficios_cop == 0
    assert res_afc.ahorro_total_impuesto_cop == 45000000
    assert res_afc.porcentaje_ahorro_tributario_pct == 100.0


def test_inmueble_pre_1987_art44_y_retencion_art399():
    """Valida la aplicación del Art. 44 (vivienda pre-1987) y reducción de retención notarial Art. 399."""
    from app.services.beneficios import SimulacionInmuebleAfcRequest, calcular_exencion_inmueble_afc

    # Caso 1: Casa adquirida en 1982 (50% exención Art. 44)
    # Venta: 600M, Costo histórico: 10M, Método: histórico para aislar Art. 44
    req_1982 = SimulacionInmuebleAfcRequest(
        precio_venta_cop=600000000,
        costo_adquisicion_historico_cop=10000000,
        ano_adquisicion="1982",
        tipo_inmueble="bienes_raices_urbanos",
        metodo_costo_fiscal="historico",
        es_vivienda_habitacion=True,
        posesion_mas_2_anos=True,
        monto_depositado_afc_o_vivienda_cop=0,
        tax_year=2026,
        custom_uvt=52350,
    )
    res_1982 = calcular_exencion_inmueble_afc(req_1982)

    assert res_1982.aplica_art44_pre1987 is True
    assert res_1982.porcentaje_exencion_art44_pct == 50.0
    # Ganancia bruta = 600M - 10M = 590M
    assert res_1982.ganancia_ocasional_bruta_cop == 590000000
    assert res_1982.ganancia_exenta_art44_cop == 295000000  # 50% de 590M
    assert res_1982.ganancia_ocasional_gravada_final_cop == 295000000
    # Retención notarial (1% base = 6M) reducida al 50% = 3M
    assert res_1982.porcentaje_reduccion_retefuente_art399_pct == 50.0
    assert res_1982.retefuente_notarial_sin_beneficio_cop == 6000000
    assert res_1982.retefuente_notarial_final_cop == 3000000
    assert res_1982.ahorro_retefuente_notarial_cop == 3000000

    # Caso 2: Casa adquirida en 1975 (antes de 1978 => 100% exención Art. 44)
    req_1975 = SimulacionInmuebleAfcRequest(
        precio_venta_cop=500000000,
        costo_adquisicion_historico_cop=5000000,
        ano_adquisicion="1975",
        tipo_inmueble="bienes_raices_urbanos",
        metodo_costo_fiscal="historico",
        es_vivienda_habitacion=True,
        posesion_mas_2_anos=True,
        monto_depositado_afc_o_vivienda_cop=0,
        tax_year=2026,
        custom_uvt=52350,
    )
    res_1975 = calcular_exencion_inmueble_afc(req_1975)

    assert res_1975.aplica_art44_pre1987 is True
    assert res_1975.porcentaje_exencion_art44_pct == 100.0
    assert res_1975.ganancia_exenta_art44_cop == 495000000
    assert res_1975.ganancia_ocasional_gravada_final_cop == 0
    assert res_1975.impuesto_go_con_beneficios_cop == 0
    # Retención notarial 100% rebajada (0 COP)
    assert res_1975.porcentaje_reduccion_retefuente_art399_pct == 100.0
    assert res_1975.retefuente_notarial_final_cop == 0
    assert res_1975.ahorro_retefuente_notarial_cop == 5000000


def test_calcular_inmueble_afc_frontend_aliases_and_art72():
    """Valida que todos los nombres de campos y aliases enviados por el formulario frontend funcionen correctamente."""
    from app.services.beneficios import SimulacionInmuebleAfcRequest, calcular_exencion_inmueble_afc

    req = SimulacionInmuebleAfcRequest(
        precio_venta_cop=700000000,
        costo_historico_cop=200000000,
        ano_adquisicion="2015",
        tipo_inmueble="bienes_raices_urbanos",
        metodo_costo="art72",
        costo_personalizado_cop=550000000,
        mejoras_adiciones_cop=10000000,
        depreciacion_acumulada_cop=5000000,
        monto_consignado_afc_cop=50000000,
        es_casa_habitacion=True,
        posesion_mayor_a_2_anos=True,
        tax_year=2026,
        custom_uvt=52350,
    )
    res = calcular_exencion_inmueble_afc(req)

    # Costo fiscal determinado = 550M (autoavalúo) + 10M (mejoras) - 5M (deprec) = 555M
    assert res.costo_fiscal_determinado_cop == 555000000
    # Utilidad bruta = 700M - 555M = 145M
    assert res.ganancia_ocasional_bruta_cop == 145000000
    # Exención AFC = min(50M, 145M, 5.000 UVT) = 50M
    assert res.ganancia_exenta_afc_art311_1_cop == 50000000
    assert res.total_ganancia_exenta_cop == 50000000
    # Gravada final = 145M - 50M = 95M
    assert res.ganancia_ocasional_gravada_final_cop == 95000000
    # Impuesto = 95M * 15% = 14.250.000
    assert res.casilla_87_impuesto_go_cop == 14250000
    # Escenarios comparativos
    assert len(res.escenarios) == 5
    assert len(res.matriz_comparativa_escenarios) == 5
    assert res.casilla_80_ingresos_brutos_cop == 700000000
    assert res.casilla_81_costos_cop == 555000000
    assert res.casilla_82_exentas_cop == 50000000
    assert res.casilla_83_gravables_cop == 95000000
