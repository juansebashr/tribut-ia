import io

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_reconciliation_demo_endpoint():
    """Valida endpoint /demo para obtener dataset precargado."""
    res = client.get("/api/v1/reconciliation/demo")
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is True
    assert data["is_ephemeral"] is True
    assert "No se almacena" in data["notice"]
    assert data["kpis"]["total_transacciones"] == 8
    assert len(data["items"]) == 8
    # Verificar cálculo didáctico en fila 1 (Salarios)
    item_salario = data["items"][0]
    assert item_salario["concepto_tributario"] == "SALARIO"
    assert "Casilla 32" in item_salario["casilla_f210_sugerida"]
    assert item_salario["estado_exogena"] == "MATCH_EXACTO"


def test_reconciliation_template_download():
    """Valida descarga de plantilla oficial CSV."""
    res = client.get("/api/v1/reconciliation/template")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "attachment" in res.headers["content-disposition"]
    assert "id,fecha,archivo_origen" in res.text


def test_reconciliation_parse_csv_file_upload():
    """Valida subida de archivo CSV válido con separador coma."""
    csv_content = (
        "id,fecha,archivo_origen,tercero_nombre,tercero_nit,descripcion,tipo_movimiento,valor_cop,cedula_destino,concepto_tributario,estado_exogena,valor_exogena_cop\n"
        "1,2026-01-15,Cert_Sueldos.pdf,ACME CORP,900555666-1,Salario Enero,INGRESO,15000000,TRABAJO,SALARIO,MATCH_EXACTO,15000000\n"
        "2,2026-06-20,Factura_Medica.pdf,COLSANITAS,860072049-1,Medicina Prepagada,EGRESO,3500000,TRABAJO,PREPAGADA,SOLO_EN_CERTIFICADOS,0\n"
    )
    files = {"file": ("mis_transacciones.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    res = client.post("/api/v1/reconciliation/parse-csv", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is True
    assert data["kpis"]["total_transacciones"] == 2
    assert data["kpis"]["total_declarado_cop"] == 18500000.0


def test_reconciliation_parse_csv_semicolon_delimiter():
    """Valida subida de CSV con delimitador punto y coma (;)."""
    csv_content = (
        "id;fecha;archivo_origen;tercero_nombre;tercero_nit;descripcion;tipo_movimiento;valor_cop;cedula_destino;concepto_tributario;estado_exogena;valor_exogena_cop\n"
        "10;2026-02-10;Extracto.pdf;BANCO BOGOTA;860002964-4;Rendimientos CDT;INGRESO;5000000;CAPITAL;RENDIMIENTOS;MATCH_EXACTO;5000000\n"
    )
    files = {
        "file": ("extracto_puntoycoma.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")
    }
    res = client.post("/api/v1/reconciliation/parse-csv", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is True
    assert data["kpis"]["total_transacciones"] == 1


def test_reconciliation_parse_raw_text():
    """Valida endpoint /parse-raw con texto plano."""
    raw_text = (
        "id,fecha,tercero_nombre,valor_cop,cedula_destino,concepto_tributario\n"
        "1,2026-03-01,EMPRESA ABC,50000000,TRABAJO,SALARIO\n"
    )
    res = client.post(
        "/api/v1/reconciliation/parse-raw", content=raw_text, headers={"Content-Type": "text/plain"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is True
    assert data["items"][0]["valor_cop"] == 50000000.0


def test_reconciliation_missing_required_headers_error_422():
    """Valida error 422 cuando faltan columnas obligatorias."""
    bad_csv = "columna_invalida,otra_columna\n1,2\n"
    files = {"file": ("bad_headers.csv", io.BytesIO(bad_csv.encode("utf-8")), "text/csv")}
    res = client.post("/api/v1/reconciliation/parse-csv", files=files)
    assert res.status_code == 422
    err = res.json()
    assert "detail" in err
    assert "Faltan columnas obligatorias" in str(err["detail"])


def test_reconciliation_invalid_numeric_types_error_422():
    """Valida error 422 con detalle de filas cuando hay campos numéricos inválidos."""
    bad_numbers_csv = (
        "id,fecha,tercero_nombre,valor_cop,cedula_destino,concepto_tributario,valor_exogena_cop\n"
        "1,2026-01-01,TERCERO UNO,cien_pesos,TRABAJO,SALARIO,0\n"
        "2,2026-01-02,TERCERO DOS,5000,TRABAJO,SALARIO,no_es_numero\n"
    )
    files = {"file": ("bad_types.csv", io.BytesIO(bad_numbers_csv.encode("utf-8")), "text/csv")}
    res = client.post("/api/v1/reconciliation/parse-csv", files=files)
    assert res.status_code == 422
    data = res.json()["detail"]
    assert data["valid"] is False
    assert data["total_errors"] >= 2
    assert any(e["column"] == "valor_cop" for e in data["errors"])
    assert any(e["column"] == "valor_exogena_cop" for e in data["errors"])


def test_reconciliation_invalid_file_extension_error_400():
    """Valida error 400 cuando se sube un archivo que no es CSV."""
    files = {"file": ("documento.pdf", io.BytesIO(b"%PDF-1.4..."), "application/pdf")}
    res = client.post("/api/v1/reconciliation/parse-csv", files=files)
    assert res.status_code == 400
    assert "extensión .csv" in res.json()["detail"]


def test_reconciliation_empty_file_error_400():
    """Valida error 400 cuando el archivo está vacío."""
    files = {"file": ("vacio.csv", io.BytesIO(b""), "text/csv")}
    res = client.post("/api/v1/reconciliation/parse-csv", files=files)
    assert res.status_code == 400


def test_reconciliation_parse_tab_delimiter_and_various_cedulas():
    """Valida delimitador tab y ramas didácticas para capital, no laboral, patrimonio y otros."""
    tsv_content = (
        "id\tfecha\ttercero_nombre\tvalor_cop\tcedula_destino\tconcepto_tributario\testado_exogena\tvalor_exogena_cop\n"
        "1\t2026-01-01\tARRENDATARIO\t12000000\tCAPITAL\tARRENDAMIENTOS\tMATCH_EXACTO\t12000000\n"
        "2\t2026-02-01\tCLIENTE HONORARIOS\t8000000\tNOLABORAL\tHONORARIOS\tDISCREPANCIA_ALERTA\t5000000\n"
        "3\t2026-03-01\tBANCO DAVIVIENDA\t25000000\tPATRIMONIO\tPASIVO_DEUDA\tMATCH_EXACTO\t25000000\n"
        "4\t2026-04-01\tFIDUCIARIA\t40000000\tPATRIMONIO\tACTIVO_INMUEBLE\tMATCH_EXACTO\t40000000\n"
        "5\t2026-05-01\tOTRO\t1000000\tDIVIDENDOS\tDIVIDENDOS_GRAVADOS\tSOLO_EN_CERTIFICADOS\t0\n"
        "6\t2026-06-01\tEMPLEADOR\t5000000\tTRABAJO\tOTRO_CONCEPTO\tMATCH_EXACTO\t5000000\n"
        "7\t2026-07-01\tENTIDAD\t3000000\tTRABAJO\tINCRNGO_SALUD\tMATCH_EXACTO\t3000000\n"
    )
    res = client.post(
        "/api/v1/reconciliation/parse-raw",
        content=tsv_content,
        headers={"Content-Type": "text/plain"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is True
    assert data["kpis"]["total_transacciones"] == 7


def test_reconciliation_empty_raw_400():
    """Valida que texto vacío arroje error 400."""
    res = client.post(
        "/api/v1/reconciliation/parse-raw", content="   ", headers={"Content-Type": "text/plain"}
    )
    assert res.status_code == 400


def test_reconciliation_number_formatting_edge_cases():
    """Valida formatos numéricos colombianos con comas y puntos."""
    from app.api.v1.endpoints.reconciliation import _clean_numeric_value

    assert _clean_numeric_value(None) == 0.0
    assert _clean_numeric_value("") == 0.0
    assert _clean_numeric_value("$ 100.000.000,50 COP") == 100000000.5
    assert _clean_numeric_value("$ 100,000,000.50 COP") == 100000000.5
    assert _clean_numeric_value("100,50") == 100.5
    assert _clean_numeric_value("100.000.000") == 100000000.0


def test_reconciliation_didactic_explanations_branches():
    """Valida explicaciones didácticas para vivienda, prepagada y retenciones."""
    csv_content = (
        "id,fecha,tercero_nombre,valor_cop,cedula_destino,concepto_tributario,estado_exogena,valor_exogena_cop\n"
        "1,2026-01-01,BANCO,10000000,TRABAJO,DED_VIVIENDA,MATCH_EXACTO,10000000\n"
        "2,2026-01-02,PREPAGADA,5000000,TRABAJO,DED_PREPAGADA,SOLO_EN_CERTIFICADOS,0\n"
        "3,2026-01-03,RETENEDOR,2000000,TRABAJO,RETENCION_FUENTE,MATCH_EXACTO,2000000\n"
        "4,2026-01-04,EMPLEADOR,3000000,TRABAJO,INCRNGO_PENSION,MATCH_EXACTO,3000000\n"
    )
    res = client.post(
        "/api/v1/reconciliation/parse-raw",
        content=csv_content,
        headers={"Content-Type": "text/plain"},
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) == 4
    assert any("Art. 119" in item["explicacion_didactica"] for item in data["items"])
    assert any("Art. 387" in item["explicacion_didactica"] for item in data["items"])
    assert any("Casilla 134" in item["casilla_f210_sugerida"] for item in data["items"])
