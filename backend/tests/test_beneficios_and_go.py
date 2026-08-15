import pytest
from app.models.persona_natural import PersonaNaturalInput
from app.services.liquidacion_pn import liquidar_persona_natural
from app.services.beneficios import (
    calcular_beneficio_auditoria,
    BeneficioAuditoriaRequest,
    calcular_reduccion_sancion,
    ReduccionSancionRequest,
    get_catalogo_beneficios
)


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
        costos_ganancia_ocasional=200000000,                 # Costo fiscal
        ganancias_ocasionales_exentas_solicitadas=0,
        ganancias_ocasionales_brutas_loterias=10000000        # Lotería (tarifa 20%)
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
        tax_year=2026,
        impuesto_neto_ano_anterior=10000000,
        custom_uvt=52350
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
        sin_sanciones_ultimo_1_ano=True
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
