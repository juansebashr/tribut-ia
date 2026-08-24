from fastapi.testclient import TestClient

from app.main import app
from app.models.comparacion_patrimonial import ComparacionPatrimonialRequest
from app.services.comparacion_patrimonial import liquidar_comparacion_patrimonial

client = TestClient(app)


def test_comparacion_patrimonial_justificado_estandar():
    """Caso 1: Incremento de patrimonio plenamente justificado con ingresos ordinarios,

    rentas exentas y crédito de vivienda.
    """
    req = ComparacionPatrimonialRequest(
        tax_year=2026,
        patrimonio_liquido_ano_anterior=180000000,
        patrimonio_bruto_ano_actual=520000000,
        deudas_ano_actual=220000000,  # PL Actual = 300M -> Variación = 120M
        reajustes_fiscales_activos_fijos=20000000,  # Incremento a justificar = 100M
        renta_liquida_ordinaria_cedula_general=90000000,
        rentas_exentas_totales=22000000,
        ingresos_no_constitutivos_renta=9000000,
        nuevas_deudas_adquiridas_en_el_ano=120000000,
        desahorro_o_liquidacion_activos_anteriores=30000000,
        impuesto_renta_y_ganancia_ocasional_pagado=10000000,
        retenciones_fuente_asumidas_en_el_ano=4000000,
        gastos_personales_y_consumo_estimado=48000000,
    )

    res = liquidar_comparacion_patrimonial(req)

    assert res.patrimonio_liquido_ano_actual == 300000000
    assert res.variacion_patrimonial_bruta == 120000000
    assert res.ajustes_patrimoniales_netos == 20000000
    assert res.incremento_patrimonial_a_justificar == 100000000

    # Fuentes: 90 + 22 + 9 + 120 + 30 = 271M
    # Detracciones: 10 + 4 + 48 = 62M
    # Capacidad Neta: 209M > 100M
    assert res.total_rentas_justificativas == 271000000
    assert res.total_detracciones_consumos == 62000000
    assert res.capacidad_justificacion_neta == 209000000
    assert res.diferencia_no_justificada == 0.0
    assert not res.existe_renta_por_comparacion_patrimonial
    assert res.renta_liquida_gravable_adicional_cop == 0.0
    assert res.impuesto_estimado_comparacion_patrimonial_cop == 0.0
    assert res.estado_patrimonial == "JUSTIFICADO_CORRECTAMENTE"
    assert res.porcentaje_justificacion == 100.0
    assert len(res.recomendaciones_defensa_dian) >= 3


def test_comparacion_patrimonial_desajuste_injustificado():
    """Caso 2: Alerta de desajuste. El contribuyente adquiere activos por 330M

    pero sus ingresos declarados netos solo alcanzan para 35M.
    """
    req = ComparacionPatrimonialRequest(
        tax_year=2026,
        patrimonio_liquido_ano_anterior=100000000,
        patrimonio_bruto_ano_actual=480000000,
        deudas_ano_actual=50000000,  # PL Actual = 430M -> Variación = 330M
        reajustes_fiscales_activos_fijos=0,
        renta_liquida_ordinaria_cedula_general=60000000,
        rentas_exentas_totales=15000000,
        ingresos_no_constitutivos_renta=6000000,
        nuevas_deudas_adquiridas_en_el_ano=0,
        desahorro_o_liquidacion_activos_anteriores=0,
        impuesto_renta_y_ganancia_ocasional_pagado=4000000,
        retenciones_fuente_asumidas_en_el_ano=2000000,
        gastos_personales_y_consumo_estimado=40000000,
    )

    res = liquidar_comparacion_patrimonial(req)

    # Fuentes: 60 + 15 + 6 = 81M
    # Detracciones: 4 + 2 + 40 = 46M
    # Capacidad Neta: 35M
    # Incremento a justificar: 330M
    # Diferencia no justificada: 330M - 35M = 295M
    assert res.patrimonio_liquido_ano_actual == 430000000
    assert res.incremento_patrimonial_a_justificar == 330000000
    assert res.capacidad_justificacion_neta == 35000000
    assert res.diferencia_no_justificada == 295000000
    assert res.existe_renta_por_comparacion_patrimonial
    assert res.renta_liquida_gravable_adicional_cop == 295000000
    assert res.impuesto_estimado_comparacion_patrimonial_cop > 0
    assert res.estado_patrimonial == "ALERTA_DESAJUSTE_PATRIMONIAL"
    assert res.porcentaje_justificacion < 100.0


def test_comparacion_patrimonial_reajustes_fiscales_art73():
    """Caso 3: Reajuste fiscal de activos fijos (Art. 73 E.T.) que incrementa

    el valor patrimonial en 150M sin requerir flujo de caja.
    """
    req = ComparacionPatrimonialRequest(
        tax_year=2026,
        patrimonio_liquido_ano_anterior=200000000,
        patrimonio_bruto_ano_actual=380000000,
        deudas_ano_actual=0,  # PL Actual = 380M -> Variación = 180M
        reajustes_fiscales_activos_fijos=150000000,  # Incremento a justificar = 30M
        renta_liquida_ordinaria_cedula_general=50000000,
        rentas_exentas_totales=10000000,
        ingresos_no_constitutivos_renta=5000000,
        gastos_personales_y_consumo_estimado=25000000,
    )

    res = liquidar_comparacion_patrimonial(req)

    assert res.incremento_patrimonial_a_justificar == 30000000
    assert res.diferencia_no_justificada == 0.0
    assert not res.existe_renta_por_comparacion_patrimonial
    assert res.estado_patrimonial == "JUSTIFICADO_CORRECTAMENTE"


def test_comparacion_patrimonial_desahorro_y_deudas():
    """Caso 4: Persona que compra apartamento de 500M con 300M de crédito hipotecario

    y 200M de desahorro de cuentas declaradas previamente.
    """
    req = ComparacionPatrimonialRequest(
        tax_year=2026,
        patrimonio_liquido_ano_anterior=350000000,
        patrimonio_bruto_ano_actual=550000000,
        deudas_ano_actual=80000000,  # PL Actual = 470M -> Variación = 120M
        desahorro_o_liquidacion_activos_anteriores=100000000,
        nuevas_deudas_adquiridas_en_el_ano=50000000,
        renta_liquida_ordinaria_cedula_general=40000000,
        gastos_personales_y_consumo_estimado=30000000,
    )

    res = liquidar_comparacion_patrimonial(req)

    assert res.diferencia_no_justificada == 0.0
    assert not res.existe_renta_por_comparacion_patrimonial
    assert res.estado_patrimonial == "JUSTIFICADO_CORRECTAMENTE"


def test_api_comparacion_patrimonial_endpoint():
    """Test de integración HTTP para el endpoint /api/v1/persona-natural/comparacion-patrimonial."""
    payload = {
        "tax_year": 2026,
        "patrimonio_liquido_ano_anterior": 200000000,
        "patrimonio_bruto_ano_actual": 400000000,
        "deudas_ano_actual": 100000000,
        "reajustes_fiscales_activos_fijos": 10000000,
        "renta_liquida_ordinaria_cedula_general": 80000000,
        "rentas_exentas_totales": 20000000,
        "ingresos_no_constitutivos_renta": 8000000,
        "gastos_personales_y_consumo_estimado": 35000000,
    }

    response = client.post("/api/v1/persona-natural/comparacion-patrimonial", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["tax_year"] == 2026
    assert "diferencia_no_justificada" in data
    assert "existe_renta_por_comparacion_patrimonial" in data
    assert "estado_patrimonial" in data
    assert "audit_trace" in data
    assert len(data["audit_trace"]) >= 5
