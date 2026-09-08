import sys
from pathlib import Path

# Añadir scripts del skill al sys.path para pruebas
SKILL_SCRIPTS_DIR = (
    Path(__file__).resolve().parent.parent.parent
    / "skills"
    / "declaracion-renta-persona-natural"
    / "scripts"
)
SKILL_TEMPLATES_DIR = (
    Path(__file__).resolve().parent.parent.parent
    / "skills"
    / "declaracion-renta-persona-natural"
    / "templates"
)
sys.path.insert(0, str(SKILL_SCRIPTS_DIR))

from consolidar_transacciones import consolidar_csv_a_payload  # noqa: E402
from inyectar_tributia import format_cop  # noqa: E402


def test_consolidar_template_csv():
    template_path = SKILL_TEMPLATES_DIR / "transacciones_template.csv"
    assert template_path.exists()

    payload = consolidar_csv_a_payload(
        csv_path=str(template_path),
        tax_year=2026,
        custom_uvt=52350.0,
        nombre="CONTRIBUYENTE DEMO EJEMPLO",
        nit="9001234567",
    )

    assert payload["metadata"]["nombre"] == "CONTRIBUYENTE DEMO EJEMPLO"
    assert payload["metadata"]["nit"] == "9001234567"
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
        f.write(
            "id,fecha,archivo_origen,tercero_nombre,tercero_nit,descripcion,tipo_movimiento,valor_cop,cedula_destino,concepto_tributario,beneficio_asociado,confianza_clasificacion,observaciones\n"
        )
        f.write(
            "1,2025-12-31,F220.pdf,EMPRESA SAS,900123456-1,Salarios,INGRESO,100000000,TRABAJO,SALARIO,Art. 103,ALTA,Certificado\n"
        )
        f.write(
            "2,2025-12-31,Cert.pdf,BANCO ABC,890000111-2,Intereses Vivienda,EGRESO,10000000,TRABAJO,DED_VIVIENDA,Art. 119,ALTA,Certificado\n"
        )

    # Crear CSV temporal de exógena
    exo_file = tmp_path / "test_exogena.csv"
    with open(exo_file, "w", encoding="utf-8") as f:
        f.write("NIT,Nombre,NIT_Informado,Nombre_Informado,Detalle,Valor,Uso,Info\n")
        f.write("900123456,EMPRESA SAS,123456,DECLARANTE,Pagos por salarios,100000000,Tope 1,Ok\n")
        f.write(
            "800999888,OTRO BANCO,123456,DECLARANTE,Rendimientos financieros,500000,Tope 1,Cuenta Ahorros\n"
        )

    res = conciliar_transacciones_con_exogena(str(csv_file), str(exo_file))
    assert res["has_exogena"] is True
    assert res["total_partidas_exogena"] == 2
    assert res["total_conciliadas"] == 1
    assert res["metricas"]["match_exacto"] == 1
    assert res["metricas"]["solo_en_exogena"] == 1
    assert res["metricas"]["solo_en_certificados"] == 1


def test_organizar_documentos_helpers(tmp_path):
    from organizar_documentos import (
        calculate_file_hash,
        classify_document,
        generate_index_markdown,
        generate_notas_markdown,
        update_transacciones_csv_filenames,
    )

    # 1. Test clasificación de documentos
    doc1 = classify_document(
        Path("Retencion_Inetum_2025.pdf"), "Certificado de Ingresos y Retenciones Formulario 220"
    )
    assert doc1["order"] == "01"
    assert "F220" in doc1["standard_name"]

    doc2 = classify_document(
        Path("Declaracion_Renta_2024.pdf"), "Declaración de Renta Formulario 210 año 2024"
    )
    assert doc2["order"] == "02"

    doc3 = classify_document(Path("Factura_Predial_2025.pdf"), "Impuesto Predial Unificado 2025")
    assert doc3["order"] == "03"

    doc4 = classify_document(
        Path("Certificacion_Banco_Occidente_2025.pdf"), "Cuenta de ahorros AFC"
    )
    assert doc4["order"] == "04"

    # 2. Test hash calculation
    test_file = tmp_path / "sample.txt"
    test_file.write_text("Hello Taxpayer", encoding="utf-8")
    h1 = calculate_file_hash(test_file)
    assert len(h1) == 64

    # 3. Test generate markdown
    records = [doc1, doc2, doc3, doc4]
    index_md = generate_index_markdown(records)
    assert "# Índice de Documentos" in index_md
    assert "01_Ingresos_Retenciones" in index_md

    notas_md = generate_notas_markdown()
    assert "TIVIT Colombia" in notas_md
    assert "Banco Itaú" in notas_md
    assert "Construcciones Planificadas" in notas_md
    assert "Parroquia de Cristo Rey" in notas_md

    # 4. Test update csv filenames
    csv_file = tmp_path / "transacciones_depuradas.csv"
    csv_file.write_text(
        "id,archivo_origen,valor\n1,Retencion_Inetum_2025.pdf,100\n",
        encoding="utf-8",
    )
    renames = {"Retencion_Inetum_2025.pdf": "01_Ingresos_Retenciones_F220_Inetum_2025.pdf"}
    updated = update_transacciones_csv_filenames(csv_file, renames)
    assert updated == 1
    content = csv_file.read_text(encoding="utf-8")
    assert "01_Ingresos_Retenciones_F220_Inetum_2025.pdf" in content
