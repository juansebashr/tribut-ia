from fastapi.testclient import TestClient

from app.main import app
from app.models.iva import (
    IvaF300Input,
    IvaProrrateoInput,
)
from app.services.liquidacion_iva import (
    calcular_formulario_300,
    calcular_prorrateo_iva_art490,
    obtener_clasificador_bienes_servicios_iva,
)

client = TestClient(app)


def test_iva_prorrateo_art490_calculo():
    """Valida el simulador de prorrateo con ventas gravadas y excluidas."""
    payload = IvaProrrateoInput(
        tax_year=2026,
        ingresos_gravados_19=100000000.0,
        ingresos_gravados_5=20000000.0,
        ingresos_exentos_0=30000000.0,
        ingresos_excluidos=50000000.0,
        iva_comun_en_compras_gastos=10000000.0,
    )
    res = calcular_prorrateo_iva_art490(payload)
    # Total con derecho = 150M. Total operacionales = 200M. Factor = 75%
    assert res.total_ingresos_con_derecho == 150000000.0
    assert res.total_ingresos_operacionales == 200000000.0
    assert res.factor_prorrateo_porcentaje == 75.0
    assert res.iva_descontable_aceptado_f300 == 7500000.0
    assert res.iva_rechazado_mayor_costo_renta == 2500000.0
    assert len(res.audit_trace) == 3


def test_iva_f300_saldo_a_pagar():
    """Valida liquidación de F-300 que resulta en saldo a pagar."""
    payload = IvaF300Input(
        tax_year=2026,
        tipo_periodicidad="BIMESTRAL",
        periodo=1,
        razon_social="COMERCIALIZADORA DEL CARIBE S.A.S.",
        nit="901234567",
        dv="8",
        ingresos_bienes_gravados_19=100000000.0,  # IVA gen = 19.000.000
        ingresos_servicios_gravados_19=20000000.0,  # IVA gen = 3.800.000
        compras_bienes_gravados_19=40000000.0,  # IVA desc = 7.600.000
        servicios_gravados_19=10000000.0,  # IVA desc = 1.900.000
        retenciones_iva_practicadas_a_favor=2000000.0,
        saldo_a_favor_periodo_anterior=0.0,
        sanciones=0.0,
    )
    res = calcular_formulario_300(payload)

    # IVA Generado = 22.800.000
    # IVA Descontable = 9.500.000
    # Saldo período = 13.300.000
    # Menos ReteIVA = 2.000.000 -> Total a pagar = 11.300.000
    assert res.casillas.c58_total_iva_generado == 22800000.0
    assert res.casillas.c96_total_iva_descontable == 9500000.0
    assert res.casillas.c98_saldo_a_pagar_periodo == 13300000.0
    assert res.total_saldo_a_pagar == 11300000.0
    assert res.total_saldo_a_favor == 0.0


def test_iva_f300_saldo_a_favor():
    """Valida liquidación de F-300 con compras mayores que ventas (saldo a favor)."""
    payload = IvaF300Input(
        tax_year=2026,
        tipo_periodicidad="CUATRIMESTRAL",
        periodo=1,
        razon_social="STARTUP TECNOLÓGICA S.A.S.",
        nit="901999888",
        dv="4",
        ingresos_servicios_gravados_19=10000000.0,  # IVA gen = 1.900.000
        compras_bienes_gravados_19=50000000.0,  # IVA desc = 9.500.000
        retenciones_iva_practicadas_a_favor=0.0,
        saldo_a_favor_periodo_anterior=1000000.0,
        sanciones=0.0,
    )
    res = calcular_formulario_300(payload)

    # IVA Generado = 1.900.000
    # IVA Descontable = 9.500.000
    # Saldo a favor período = 7.600.000 + 1.000.000 anterior = 8.600.000
    assert res.casillas.c99_saldo_a_favor_periodo == 7600000.0
    assert res.total_saldo_a_favor == 8600000.0
    assert res.total_saldo_a_pagar == 0.0


def test_clasificador_bienes_servicios():
    """Valida el catálogo de clasificación de bienes y servicios."""
    items = obtener_clasificador_bienes_servicios_iva()
    assert len(items) >= 10
    carne = next(it for it in items if it.id == "al_carne")
    assert carne.tratamiento == "EXENTO_0"
    assert carne.derecho_devolucion_iva is True

    cloud = next(it for it in items if it.id == "tec_hosting_cloud")
    assert cloud.tratamiento == "EXCLUIDO"


def test_api_endpoints_iva():
    """Valida los endpoints FastAPI de IVA."""
    # 1. Formulario 300
    res_f300 = client.post(
        "/api/v1/calculate/iva/f300",
        json={
            "tax_year": 2026,
            "tipo_periodicidad": "BIMESTRAL",
            "periodo": 1,
            "ingresos_bienes_gravados_19": 50000000,
            "compras_bienes_gravados_19": 20000000,
        },
    )
    assert res_f300.status_code == 200
    data = res_f300.json()
    assert data["total_saldo_a_pagar"] > 0
    assert data["casillas"]["c58_total_iva_generado"] == 9500000.0

    # 2. Prorrateo
    res_pro = client.post(
        "/api/v1/calculate/iva/prorrateo",
        json={
            "tax_year": 2026,
            "ingresos_gravados_19": 80000000,
            "ingresos_excluidos": 20000000,
            "iva_comun_en_compras_gastos": 5000000,
        },
    )
    assert res_pro.status_code == 200
    data_pro = res_pro.json()
    assert data_pro["factor_prorrateo_porcentaje"] == 80.0

    # 3. Clasificador
    res_cat = client.get("/api/v1/calculate/iva/clasificador")
    assert res_cat.status_code == 200
    assert len(res_cat.json()) > 0
