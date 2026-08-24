from fastapi.testclient import TestClient

from app.main import app
from app.models.tributacion_pareja import (
    ConyugeFinanzasInput,
    TributacionParejaRequest,
)
from app.services.tributacion_pareja import simular_tributacion_pareja

client = TestClient(app)


def test_simular_tributacion_pareja_copropiedad_50_50():
    """Caso 1: Optimización conyugal con copropiedad proindiviso 50/50 y deducción de intereses."""
    req = TributacionParejaRequest(
        tax_year=2026,
        conyuge_a=ConyugeFinanzasInput(
            nombre="Cónyuge A",
            ingresos_laborales_anuales=140000000.0,
            aportes_seguridad_social_salud_pension=11200000.0,
            tiene_dependiente_general_387=True,
            numero_dependientes_adicionales_72uvt=1,
            otras_deducciones_y_exentas_cedula_general=28000000.0,
        ),
        conyuge_b=ConyugeFinanzasInput(
            nombre="Cónyuge B",
            ingresos_laborales_anuales=30000000.0,
            aportes_seguridad_social_salud_pension=2400000.0,
            tiene_dependiente_general_387=False,
            numero_dependientes_adicionales_72uvt=0,
            otras_deducciones_y_exentas_cedula_general=6000000.0,
        ),
        rentas_capital_conjuntas_arriendos_intereses=60000000.0,
        costos_procedentes_rentas_capital=6000000.0,
        intereses_credito_vivienda_conjunto_anual=24000000.0,
        valor_activo_adquirido_en_el_ano=350000000.0,
        esquema_adquisicion_activo="COPROPIEDAD_PROINDIVISO_50_50",
        distribucion_intereses_vivienda="100_CONYUGE_A",
    )

    res = simular_tributacion_pareja(req)

    # El escenario optimizado debe generar un menor impuesto familiar consolidado
    assert (
        res.escenario_optimizado.total_impuesto_familiar_cop
        < res.escenario_no_optimizado.total_impuesto_familiar_cop
    )
    assert res.ahorro_tributario_familiar_neto_cop > 0.0
    assert res.porcentaje_ahorro_familiar_pct > 0.0

    # Copropiedad 50/50 no genera riesgo de comparación patrimonial
    assert not res.analisis_riesgo_patrimonial.riesgo_comparacion_patrimonial_conyuge_titular
    assert not res.analisis_riesgo_patrimonial.riesgo_donacion_involuntaria_art302
    assert "ESTRUCTURA BLINDADA" in res.analisis_riesgo_patrimonial.diagnostico_legal
    assert len(res.audit_trace) >= 4


def test_simular_tributacion_pareja_riesgo_desajuste_patrimonial():
    """Caso 2: Alerta cuando el cónyuge sin ingresos suficientes figura como titular 100%."""
    req = TributacionParejaRequest(
        tax_year=2026,
        conyuge_a=ConyugeFinanzasInput(
            nombre="Cónyuge A",
            ingresos_laborales_anuales=160000000.0,
            aportes_seguridad_social_salud_pension=12800000.0,
        ),
        conyuge_b=ConyugeFinanzasInput(
            nombre="Cónyuge B",
            ingresos_laborales_anuales=20000000.0,
            aportes_seguridad_social_salud_pension=1600000.0,
        ),
        valor_activo_adquirido_en_el_ano=400000000.0,
        esquema_adquisicion_activo="TITULARIDAD_EXCLUSIVA_SIN_FONDOS",
    )

    res = simular_tributacion_pareja(req)

    # Debe alertar sobre comparación patrimonial y donación involuntaria
    assert res.analisis_riesgo_patrimonial.riesgo_comparacion_patrimonial_conyuge_titular
    assert res.analisis_riesgo_patrimonial.riesgo_donacion_involuntaria_art302
    assert res.analisis_riesgo_patrimonial.monto_desajuste_potencial_cop > 0.0
    assert res.analisis_riesgo_patrimonial.impuesto_ganancia_ocasional_donacion_cop > 0.0
    assert "ALERTA CRÍTICA" in res.analisis_riesgo_patrimonial.diagnostico_legal


def test_simular_tributacion_pareja_mutuo_prestamo():
    """Caso 3: Uso de contrato de mutuo (préstamo con fecha cierta) entre cónyuges."""
    req = TributacionParejaRequest(
        tax_year=2026,
        conyuge_a=ConyugeFinanzasInput(
            nombre="Cónyuge A",
            ingresos_laborales_anuales=150000000.0,
        ),
        conyuge_b=ConyugeFinanzasInput(
            nombre="Cónyuge B",
            ingresos_laborales_anuales=0.0,
        ),
        valor_activo_adquirido_en_el_ano=300000000.0,
        esquema_adquisicion_activo="MUTUO_PRESTAMO_CON_FECHA_CIERTA",
    )

    res = simular_tributacion_pareja(req)

    assert not res.analisis_riesgo_patrimonial.riesgo_comparacion_patrimonial_conyuge_titular
    assert (
        "ESTRUCTURA DE FINANCIACIÓN CONYUGAL VÁLIDA"
        in res.analisis_riesgo_patrimonial.diagnostico_legal
    )


def test_endpoint_simular_tributacion_pareja():
    """Test de integración HTTP para el endpoint /api/v1/beneficios/simular-tributacion-pareja."""
    payload = {
        "tax_year": 2026,
        "conyuge_a": {
            "nombre": "Cónyuge A",
            "ingresos_laborales_anuales": 120000000,
            "aportes_seguridad_social_salud_pension": 9600000,
            "tiene_dependiente_general_387": True,
            "numero_dependientes_adicionales_72uvt": 1,
            "otras_deducciones_y_exentas_cedula_general": 24000000,
        },
        "conyuge_b": {
            "nombre": "Cónyuge B",
            "ingresos_laborales_anuales": 40000000,
            "aportes_seguridad_social_salud_pension": 3200000,
            "tiene_dependiente_general_387": False,
            "numero_dependientes_adicionales_72uvt": 0,
            "otras_deducciones_y_exentas_cedula_general": 8000000,
        },
        "rentas_capital_conjuntas_arriendos_intereses": 50000000,
        "costos_procedentes_rentas_capital": 5000000,
        "intereses_credito_vivienda_conjunto_anual": 18000000,
        "valor_activo_adquirido_en_el_ano": 280000000,
        "esquema_adquisicion_activo": "COPROPIEDAD_PROINDIVISO_50_50",
        "distribucion_intereses_vivienda": "100_CONYUGE_A",
    }

    response = client.post("/api/v1/beneficios/simular-tributacion-pareja", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["tax_year"] == 2026
    assert "ahorro_tributario_familiar_neto_cop" in data
    assert "escenario_no_optimizado" in data
    assert "escenario_optimizado" in data
    assert "analisis_riesgo_patrimonial" in data
    assert len(data["audit_trace"]) >= 4
