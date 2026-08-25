import json
import subprocess
import sys
from pathlib import Path

SKILL_SCRIPTS_DIR = (
    Path(__file__).resolve().parent.parent.parent
    / "skills"
    / "control-comparacion-patrimonial"
    / "scripts"
)
SKILL_TEMPLATES_DIR = (
    Path(__file__).resolve().parent.parent.parent
    / "skills"
    / "control-comparacion-patrimonial"
    / "templates"
)
sys.path.insert(0, str(SKILL_SCRIPTS_DIR))

from analizar_comparacion import (  # noqa: E402
    analizar_borrador_f210,
    cargar_cuestionario_diagnostico,
)
from extraer_f210_borrador import extraer_datos_borrador  # noqa: E402
from generar_plan_optimizacion import generar_reporte_markdown  # noqa: E402


def test_extraer_datos_borrador_f210():
    mock_f210 = {
        "contribuyente": {"nombre": "TEST CONTRIBUYENTE", "nit": "123456-7", "tax_year": 2026},
        "casillas_formulario_210": {
            "casilla_29_patrimonio_bruto": 500000000,
            "casilla_30_deudas": 100000000,
            "casilla_31_patrimonio_liquido_actual": 400000000,
            "casilla_32_patrimonio_liquido_ano_anterior": 200000000,
            "casilla_64_renta_liquida_ordinaria_cedula_general": 80000000,
            "casilla_92_total_rentas_exentas_imputables": 20000000,
            "casilla_34_incrngo_trabajo": 10000000,
            "casilla_104_ganancia_ocasional_gravable": 0,
            "casilla_133_total_impuesto_a_cargo": 8000000,
            "casilla_135_total_retenciones_fuente": 3000000,
        },
        "estimacion_gastos_personales_anuales": 30000000,
    }

    extracted = extraer_datos_borrador(mock_f210)
    assert extracted["contribuyente"] == "TEST CONTRIBUYENTE"
    assert extracted["nit"] == "123456-7"
    assert extracted["patrimonio_bruto_ano_actual"] == 500000000.0
    assert extracted["deudas_ano_actual"] == 100000000.0
    assert extracted["patrimonio_liquido_ano_actual"] == 400000000.0
    assert extracted["patrimonio_liquido_ano_anterior"] == 200000000.0
    assert extracted["renta_liquida_ordinaria_cedula_general"] == 80000000.0


def test_cargar_cuestionario_diagnostico():
    cuestionario = cargar_cuestionario_diagnostico()
    assert isinstance(cuestionario, list)
    assert len(cuestionario) >= 4
    # Verificar categorías clave
    cat_ids = [c["id"] for c in cuestionario]
    assert "CAT_01_ADQUISICIONES" in cat_ids
    assert "CAT_02_DEUDAS_Y_PASIVOS" in cat_ids
    assert "CAT_03_DESAHORRO_Y_RECURSOS_PREVIOS" in cat_ids


def test_analizar_borrador_con_desajuste():
    # Incremento de 330M con capacidad neta menor
    extracted = {
        "contribuyente": "CARLOS ANDRES MENDOZA ROJAS",
        "nit": "80123456-7",
        "tax_year": 2026,
        "patrimonio_liquido_ano_anterior": 200000000,
        "patrimonio_bruto_ano_actual": 650000000,
        "deudas_ano_actual": 120000000,
        "patrimonio_liquido_ano_actual": 530000000,  # Incremento de 330M
        "renta_liquida_ordinaria_cedula_general": 85000000,
        "rentas_exentas_totales": 25000000,
        "ingresos_no_constitutivos_renta": 10400000,
        "ganancias_ocasionales_netas": 0,
        "impuesto_renta_y_ganancia_ocasional_pagado": 11500000,
        "retenciones_fuente_asumidas_en_el_ano": 4500000,
        "gastos_personales_y_consumo_estimado": 45000000,
    }

    res = analizar_borrador_f210(extracted, custom_uvt=52350.0)
    assert res["existe_renta_por_comparacion_patrimonial"] is True
    assert res["diferencia_no_justificada"] > 0
    assert res["estado_patrimonial"] == "ALERTA_DESAJUSTE_PATRIMONIAL"
    assert len(res["cuestionario_diagnostico"]) > 0
    assert "⚠️ ATENCIÓN AGENTE" in res["instruccion_agente"]


def test_analizar_borrador_justificado_correctamente():
    # Incremento de 100M con capacidad neta de 200M
    extracted = {
        "contribuyente": "ANA MARIA LOPEZ",
        "nit": "52987654-1",
        "tax_year": 2026,
        "patrimonio_liquido_ano_anterior": 300000000,
        "patrimonio_bruto_ano_actual": 450000000,
        "deudas_ano_actual": 50000000,
        "patrimonio_liquido_ano_actual": 400000000,  # Incremento de 100M
        "renta_liquida_ordinaria_cedula_general": 150000000,
        "rentas_exentas_totales": 40000000,
        "ingresos_no_constitutivos_renta": 20000000,
        "ganancias_ocasionales_netas": 0,
        "impuesto_renta_y_ganancia_ocasional_pagado": 15000000,
        "retenciones_fuente_asumidas_en_el_ano": 6000000,
        "gastos_personales_y_consumo_estimado": 40000000,
    }

    res = analizar_borrador_f210(extracted, custom_uvt=52350.0)
    assert res["existe_renta_por_comparacion_patrimonial"] is False
    assert res["diferencia_no_justificada"] == 0.0
    assert res["estado_patrimonial"] == "JUSTIFICADO_CORRECTAMENTE"
    assert len(res["cuestionario_diagnostico"]) == 0
    assert "✅ CONSISTENCIA PATRIMONIAL BLINDADA" in res["instruccion_agente"]


def test_generar_reporte_markdown():
    mock_diagnostic = {
        "contribuyente": "JUAN PEREZ",
        "nit": "1234567-8",
        "tax_year": 2026,
        "uvt_value": 52350.0,
        "patrimonio_liquido_ano_anterior": 150000000.0,
        "patrimonio_liquido_ano_actual": 400000000.0,
        "incremento_patrimonial_a_justificar": 250000000.0,
        "capacidad_justificacion_neta": 100000000.0,
        "diferencia_no_justificada": 150000000.0,
        "impuesto_estimado_comparacion_patrimonial_cop": 42000000.0,
        "existe_renta_por_comparacion_patrimonial": True,
        "estado_patrimonial": "ALERTA_DESAJUSTE_PATRIMONIAL",
    }

    respuestas = {
        "hallazgos": [
            {
                "titulo": "Crédito Hipotecario No Registrado",
                "detalle": "El banco desembolsó 120M que no se anotaron en Casilla 30.",
            }
        ],
        "documentos_soportes_anexados": [
            "Certificado bancario Davivienda a dic 31 con saldo de $120.000.000 COP"
        ],
    }

    md = generar_reporte_markdown(mock_diagnostic, respuestas)
    assert "# 🛡️ Plan de Regularización y Control por Comparación Patrimonial" in md
    assert "JUAN PEREZ" in md
    assert "$150,000,000 COP" in md
    assert "Crédito Hipotecario No Registrado" in md
    assert "Certificado bancario Davivienda" in md


def test_cli_subprocess_analizar_comparacion(tmp_path):
    ejemplo_path = (
        Path(__file__).resolve().parent.parent.parent
        / "skills"
        / "control-comparacion-patrimonial"
        / "templates"
        / "f210_borrador_ejemplo.json"
    )
    out_json = tmp_path / "diag_test.json"

    cmd = [
        sys.executable,
        str(
            Path(__file__).resolve().parent.parent.parent
            / "skills"
            / "control-comparacion-patrimonial"
            / "scripts"
            / "analizar_comparacion.py"
        ),
        str(ejemplo_path),
        "--out",
        str(out_json),
    ]

    res = subprocess.run(cmd, capture_output=True, text=True)
    assert res.returncode == 0
    assert out_json.exists()

    with open(out_json, encoding="utf-8") as f:
        data = json.load(f)
    assert "diferencia_no_justificada" in data
    assert data["contribuyente"] == "CARLOS ANDRES MENDOZA ROJAS"


def test_analizar_caso_real_juan_sebastian_2024_vs_2023():
    # Datos oficiales de Juan Sebastian Hernandez Reyes (F210 2024 vs 2023)
    datos_juan_sebastian = {
        "contribuyente": "HERNANDEZ REYES JUAN SEBASTIAN",
        "nit": "1022440206-9",
        "tax_year": 2024,
        "patrimonio_liquido_ano_anterior": 15604000.0,  # Casilla 31 de la declaración 2023
        "patrimonio_bruto_ano_actual": 227450000.0,
        "deudas_ano_actual": 50552000.0,
        "patrimonio_liquido_ano_actual": 176898000.0,  # Incremento de 161.294.000 COP
        "renta_liquida_ordinaria_cedula_general": 80531000.0,  # Casilla 94
        "total_rentas_exentas_deducciones_c90": 37614000.0,  # Casilla 90 (C42 37.496.000 + C28 118.000)
        "ingresos_no_constitutivos_renta_c34": 9135000.0,  # Casilla 34 (Salud/Pensión)
        "nuevas_deudas_adquiridas_en_el_ano": 49864000.0,  # Deudas 2024 (50.552.000) - Deudas 2023 (688.000)
        "impuesto_renta_y_ganancia_ocasional_pagado": 5605000.0,  # Casilla 125
        "retenciones_fuente_asumidas_en_el_ano": 6138000.0,  # Casilla 133
        "gastos_personales_y_consumo_estimado": 0.0,
    }

    res = analizar_borrador_f210(datos_juan_sebastian, custom_uvt=47065.0)
    assert res["existe_renta_por_comparacion_patrimonial"] is False
    assert res["diferencia_no_justificada"] == 0.0
    assert res["porcentaje_justificacion"] >= 100.0
    assert res["estado_patrimonial"] == "JUSTIFICADO_CORRECTAMENTE"
    assert "✅ CONSISTENCIA PATRIMONIAL BLINDADA" in res["instruccion_agente"]
