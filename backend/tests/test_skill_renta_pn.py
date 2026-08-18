import os
import sys
from pathlib import Path

# Añadir scripts del skill al sys.path para pruebas
SKILL_SCRIPTS_DIR = Path(__file__).resolve().parent.parent.parent / "skills" / "renta-persona-natural" / "scripts"
SKILL_TEMPLATES_DIR = Path(__file__).resolve().parent.parent.parent / "skills" / "renta-persona-natural" / "templates"
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
