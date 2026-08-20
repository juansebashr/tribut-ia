from fastapi.testclient import TestClient

from app.main import app
from app.models.persona_natural import PersonaNaturalInput
from app.services.liquidacion_pn import liquidar_persona_natural

client = TestClient(app)


def test_api_pn_full_35pct_bracket_cycle():
    """Valida el ciclo completo de liquidación en el tramo marginal del 35%."""
    payload = {
        "tax_year": 2026,
        "custom_uvt": 52350,
        "patrimonio_bruto": 1200000000.0,
        "deudas": 200000000.0,
        "rentas_trabajo": 700000000.0,
        "aporte_salud_obligatorio": 28000000.0,
        "aporte_pension_obligatorio": 28000000.0,
        "medicina_prepagada_anual": 10051200.0,
        "intereses_vivienda_anual": 62820000.0,
        "compras_factura_electronica": 20000000.0,
        "retenciones_fuente_practicadas": 140000000.0,
    }
    response = client.post("/api/v1/calculate/persona-natural/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Renta Líquida Gravable debe estar entre 8.670 y 18.970 UVT (Tramo 35%)
    assert data["renta_liquida_gravable_uvt"] > 8670.0
    assert data["renta_liquida_gravable_uvt"] < 18970.0
    assert data["tarifa_marginal_maxima"] == 0.35
    assert data["impuesto_bruto_renta"] > 0
    assert (
        data["form_210_casillas"]["c39_renta_liquida_gravable_trabajo"]
        == data["renta_liquida_gravable"]
    )
    assert (
        data["form_210_casillas"]["c108_impuesto_rentas_liquidas_gravables"]
        == data["impuesto_bruto_renta"]
    )


def test_progressive_marginal_slices_integrity():
    """Verifica que la descomposición por tramos sume el impuesto liquidado (margen de 1 UVT por redondeo estatutario)."""
    payload = PersonaNaturalInput(
        tax_year=2026,
        custom_uvt=52350,
        rentas_trabajo=250000000.0,
        aporte_salud_obligatorio=10000000.0,
        aporte_pension_obligatorio=10000000.0,
    )
    result = liquidar_persona_natural(payload)
    uvt = 52350.0
    renta_uvt = result.renta_liquida_gravable_uvt

    # Tramos 2026
    tramos = [
        (0.0, 1090.0, 0.0),
        (1090.0, 1700.0, 0.19),
        (1700.0, 4100.0, 0.28),
        (4100.0, 8670.0, 0.33),
        (8670.0, 18970.0, 0.35),
        (18970.0, 31000.0, 0.37),
        (31000.0, 999999999.0, 0.39),
    ]

    total_impuesto_tramos_cop = 0.0
    for desde, hasta, tarifa in tramos:
        if renta_uvt > desde:
            porc_uvt = min(renta_uvt, hasta) - desde
            total_impuesto_tramos_cop += porc_uvt * uvt * tarifa

    # Diferencia no debe exceder 1 UVT ($52.350) debido al redondeo de constantes fijas en la ley (ej. 116 UVT)
    assert abs(total_impuesto_tramos_cop - result.impuesto_bruto_renta) <= uvt


def test_colombian_dian_dv_algorithm():
    """Valida el cálculo del Dígito de Verificación (DV) para NITs oficiales colombianos."""

    def calc_dv(nit_str):
        weights = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3]
        digits = [int(c) for c in nit_str.replace("-", "").replace(".", "").strip()]
        padded = [0] * (15 - len(digits)) + digits
        s = sum(padded[i] * weights[i] for i in range(15))
        remainder = s % 11
        return remainder if remainder <= 1 else 11 - remainder

    test_cases = [
        ("800197268", 4),
        ("860002964", 4),
        ("900156264", 2),
        ("890900608", 9),
        ("900876543", 1),
    ]
    for nit, expected_dv in test_cases:
        assert calc_dv(nit) == expected_dv


def test_colombian_currency_mask_parsing_logic():
    """Valida que la lógica de parsing de getNum extraiga los valores enteros correctos sin confundir '.' con decimales."""
    import re

    def js_get_num(val_str):
        s = str(val_str or "").strip()
        is_neg = s.startswith("-")
        digits_only = re.sub(r"\D", "", s)
        if not digits_only:
            return 0
        val = int(digits_only)
        return -val if is_neg else val

    assert js_get_num("1'280.000") == 1280000
    assert js_get_num("$1'280.000") == 1280000
    assert js_get_num("120'000.000") == 120000000
    assert js_get_num("$120'000.000") == 120000000
    assert js_get_num("700'000.000") == 700000000
    assert js_get_num("-$50'000.000") == -50000000
    assert js_get_num("0") == 0
    assert js_get_num("") == 0
    assert js_get_num(None) == 0
