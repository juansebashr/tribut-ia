import os
import sys
from pathlib import Path

# Añadir scripts del skill al sys.path para pruebas
SKILL_SCRIPTS_DIR = Path(__file__).resolve().parent.parent.parent / "skills" / "colombian-tax-assistant" / "scripts"
SKILL_TEMPLATES_DIR = Path(__file__).resolve().parent.parent.parent / "skills" / "colombian-tax-assistant" / "templates"
sys.path.insert(0, str(SKILL_SCRIPTS_DIR))

from consolidar_transacciones import consolidar_csv_a_payload
from inyectar_tributia import format_cop


def test_consolidar_template_csv():
    template_path = SKILL_TEMPLATES_DIR / "transacciones_template.csv"
    assert template_path.exists()

    payload = consolidar_csv_a_payload(
        csv_path=str(template_path),
        tax_year=2026,
        custom_uvt=52350.0,
        nombre="MARIA FERNANDA ROJAS",
        nit="987654321"
    )

    assert payload["metadata"]["nombre"] == "MARIA FERNANDA ROJAS"
    assert payload["metadata"]["nit"] == "987654321"
    assert payload["metadata"]["tax_year"] == 2026

    pn = payload["persona_natural"]
    assert pn["rentas_trabajo"] == 120000000.0
    assert pn["aporte_salud_obligatorio"] == 4800000.0
    assert pn["aporte_pension_obligatorio"] == 4800000.0
    assert pn["retenciones_fuente_practicadas"] == 5000000.0
    assert pn["intereses_vivienda_anual"] == 12000000.0
    assert pn["medicina_prepagada_anual"] == 6000000.0
    assert pn["patrimonio_bruto"] == 45000000.0
    assert pn["deudas"] == 80000000.0


def test_format_cop_colombian_mask():
    assert format_cop(0) == "$0"
    assert format_cop(1000) == "$1.000"
    assert format_cop(1280000) == "$1'280.000"
    assert format_cop(120000000) == "$120'000.000"
    assert format_cop(1500000000) == "$1.500'000.000"


def test_conciliacion_exogena_matching(tmp_path):
    from conciliar_exogena import conciliar_transacciones_con_exogena, normalize_nit

    assert normalize_nit("900123456-1") == "900123456"
    assert normalize_nit("800.088.702-2") == "800088702"

    # Crear CSV temporal de transacciones
    csv_file = tmp_path / "test_trans.csv"
    with open(csv_file, "w", encoding="utf-8") as f:
        f.write("id,fecha,archivo_origen,tercero_nombre,tercero_nit,descripcion,tipo_movimiento,valor_cop,cedula_destino,concepto_tributario,beneficio_asociado,confianza_clasificacion,observaciones\n")
        f.write("1,2025-12-31,F220.pdf,EMPRESA SAS,900123456-1,Salarios,INGRESO,100000000,TRABAJO,SALARIO,Art. 103,ALTA,Certificado\n")
        f.write("2,2025-12-31,Cert.pdf,BANCO ABC,890000111-2,Intereses Vivienda,EGRESO,10000000,TRABAJO,DED_VIVIENDA,Art. 119,ALTA,Certificado\n")

    # Crear CSV temporal de exógena
    exo_file = tmp_path / "test_exogena.csv"
    with open(exo_file, "w", encoding="utf-8") as f:
        f.write("NIT,Nombre,NIT_Informado,Nombre_Informado,Detalle,Valor,Uso,Info\n")
        f.write("900123456,EMPRESA SAS,123456,DECLARANTE,Pagos por salarios,100000000,Tope 1,Ok\n")
        f.write("800999888,OTRO BANCO,123456,DECLARANTE,Rendimientos financieros,500000,Tope 1,Cuenta Ahorros\n")

    res = conciliar_transacciones_con_exogena(str(csv_file), str(exo_file))
    assert res["has_exogena"] is True
    assert res["total_partidas_exogena"] == 2
    assert res["total_conciliadas"] == 1
    assert res["metricas"]["match_exacto"] == 1
    assert res["metricas"]["solo_en_exogena"] == 1
    assert res["metricas"]["solo_en_certificados"] == 1

