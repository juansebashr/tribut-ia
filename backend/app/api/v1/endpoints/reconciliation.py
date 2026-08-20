import csv
import io
from typing import Any

from fastapi import APIRouter, Body, File, HTTPException, UploadFile
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

router = APIRouter()

# Plantilla estándar canónica de transacciones y conciliación
CSV_TEMPLATE_HEADER = (
    "id,fecha,archivo_origen,tercero_nombre,tercero_nit,descripcion,tipo_movimiento,"
    "valor_cop,cedula_destino,concepto_tributario,beneficio_asociado,confianza_clasificacion,"
    "observaciones,estado_exogena,valor_exogena_cop,diferencia_exogena_cop,resolucion_usuario\n"
)

CSV_DEMO_ROWS = (
    "1,2026-01-30,Certificado_Ingresos_Retenciones_220.pdf,EMPRESA EMPLEADORA EJEMPLO S.A.S.,900123456-1,Salarios y pagos laborales devengados,INGRESO,120000000,TRABAJO,SALARIO,Art. 103 E.T.,ALTA,Casilla 37 Formulario 220,MATCH_EXACTO,120000000,0,CONFIRMADO_CERTIFICADO\n"
    "2,2026-01-30,Certificado_Ingresos_Retenciones_220.pdf,ENTIDAD PROMOTORA DE SALUD DEMO EPS,800111222-3,Aportes obligatorios a salud (4%),EGRESO,4800000,TRABAJO,INCRNGO_SALUD,Art. 56 E.T.,ALTA,Casilla 49 Formulario 220,MATCH_EXACTO,4800000,0,CONFIRMADO_CERTIFICADO\n"
    "3,2026-01-30,Certificado_Ingresos_Retenciones_220.pdf,FONDO DE PENSIONES Y CESANTIAS DEMO,800333444-5,Aportes obligatorios a pension (4%),EGRESO,4800000,TRABAJO,INCRNGO_PENSION,Art. 55 E.T.,ALTA,Casilla 50 Formulario 220,MATCH_EXACTO,4800000,0,CONFIRMADO_CERTIFICADO\n"
    "4,2026-01-30,Certificado_Ingresos_Retenciones_220.pdf,EMPRESA EMPLEADORA EJEMPLO S.A.S.,900123456-1,Retenciones en la fuente practicadas en el ano,RETENCION,5000000,TRABAJO,RETENCION_FUENTE,Art. 383 E.T.,ALTA,Casilla 53 Formulario 220,MATCH_EXACTO,5000000,0,CONFIRMADO_CERTIFICADO\n"
    "5,2026-12-15,Certificado_Credito_Hipotecario_Banco_Demo.pdf,ENTIDAD BANCARIA DEMO S.A.,900777888-9,Intereses pagados por credito de vivienda principal,EGRESO,12000000,TRABAJO,DED_VIVIENDA,Art. 119 E.T.,ALTA,Deduccion imputable con tope 1.200 UVT,MATCH_EXACTO,12000000,0,CONFIRMADO_CERTIFICADO\n"
    "6,2026-12-20,Certificado_Medicina_Prepagada_Demo.pdf,COMPAÑIA DE MEDICINA PREPAGADA DEMO S.A.,900999000-1,Pagos por plan complementario de salud,EGRESO,6000000,TRABAJO,DED_PREPAGADA,Art. 387 E.T.,ALTA,Deduccion imputable con tope 192 UVT,SOLO_EN_CERTIFICADOS,0,6000000,CONFIRMADO_CERTIFICADO\n"
    "7,2026-12-31,Certificado_Tributario_Cta_Ahorros_Demo.pdf,ENTIDAD BANCARIA DEMO S.A.,900777888-9,Saldo en cuenta de ahorros a 31 de diciembre,PATRIMONIO_ACTIVO,45000000,PATRIMONIO,PATRIMONIO_CUENTAS,Art. 261 E.T.,ALTA,Saldo liquido bancario a fin de ano,MATCH_EXACTO,45000000,0,CONFIRMADO_CERTIFICADO\n"
    "8,2026-12-31,Certificado_Credito_Hipotecario_Banco_Demo.pdf,ENTIDAD BANCARIA DEMO S.A.,900777888-9,Saldo de deuda hipotecaria a 31 de diciembre,PATRIMONIO_PASIVO,80000000,PATRIMONIO,DEUDA_HIPOTECARIA,Art. 283 E.T.,ALTA,Pasivo soportado fiscalmente,MATCH_EXACTO,80000000,0,CONFIRMADO_CERTIFICADO\n"
)


class CsvValidationError(BaseModel):
    row: int
    column: str
    value: str
    error: str


class ReconciliationItem(BaseModel):
    id: str
    fecha: str
    archivo_origen: str
    tercero_nombre: str
    tercero_nit: str
    descripcion: str
    tipo_movimiento: str
    valor_cop: float
    cedula_destino: str
    concepto_tributario: str
    beneficio_asociado: str
    confianza_clasificacion: str
    observaciones: str
    estado_exogena: (
        str  # MATCH_EXACTO, DIFERENCIA_JUSTIFICADA, SOLO_EN_CERTIFICADOS, DISCREPANCIA_ALERTA
    )
    valor_exogena_cop: float
    diferencia_exogena_cop: float
    resolucion_usuario: str
    casilla_f210_sugerida: str
    explicacion_didactica: str


class ReconciliationKpis(BaseModel):
    total_transacciones: int
    total_declarado_cop: float
    total_exogena_cop: float
    total_conciliado_match: int
    total_diferencias_justificadas: int
    total_solo_certificados: int
    total_discrepancias_alerta: int
    porcentaje_conciliacion: float


class ReconciliationParseResponse(BaseModel):
    valid: bool
    is_ephemeral: bool = True
    notice: str = "🔒 Visualización Efímera en Tiempo Real: Datos procesados únicamente en memoria para auditoría. No se almacena en base de datos ni en Redis."
    kpis: ReconciliationKpis
    items: list[ReconciliationItem]
    total_errors: int = 0
    errors: list[CsvValidationError] = []


def _detect_delimiter(sample_text: str) -> str:
    """Detecta inteligentemente si el CSV usa comas, punto y coma o tabuladores."""
    first_line = sample_text.strip().split("\n")[0]
    if ";" in first_line and first_line.count(";") >= first_line.count(","):
        return ";"
    if "\t" in first_line:
        return "\t"
    return ","


def _clean_numeric_value(val_str: Any) -> float:
    """Sanitiza y convierte texto a flotante numérico."""
    if val_str is None:
        return 0.0
    s = str(val_str).strip().replace("$", "").replace(" ", "").replace("COP", "").replace("cop", "")
    if not s:
        return 0.0
    # Manejar formatos 100.000.000,00 vs 100,000,000.00
    if "." in s and "," in s:
        if s.rfind(",") > s.rfind("."):
            s = s.replace(".", "").replace(",", ".")
        else:
            s = s.replace(",", "")
    elif "," in s and "." not in s:
        s = s.replace(",", ".")
    elif s.count(".") > 1:
        s = s.replace(".", "")
    return float(s)


def _generate_didactic_explanation(
    cedula: str, concepto: str, estado: str, dif: float
) -> tuple[str, str]:
    """Genera la casilla sugerida del F210 y la justificación didáctica para el contribuyente."""
    cedula_upper = cedula.upper()
    concepto_upper = concepto.upper()

    casilla = "Casilla General"
    explicacion = ""

    if "TRABAJO" in cedula_upper:
        if "SALARIO" in concepto_upper:
            casilla = "Casilla 32 (Ingresos Brutos de Trabajo)"
            explicacion = "Ingreso originado en relación laboral o legal reglamentaria soportado en el Formulario 220 emitido por el empleador."
        elif "SALUD" in concepto_upper or "PENSION" in concepto_upper:
            casilla = "Casilla 34 (INCRNGO Trabajo)"
            explicacion = "Aportes obligatorios a seguridad social que no constituyen renta ni ganancia ocasional (Art. 55 y 56 del E.T.)."
        elif "VIVIENDA" in concepto_upper:
            casilla = "Casilla 35 (Deducciones Imputables Trabajo)"
            explicacion = "Intereses pagados por crédito hipotecario o leasing habitacional deducibles hasta 1.200 UVT anuales (Art. 119 E.T.)."
        elif "PREPAGADA" in concepto_upper:
            casilla = "Casilla 35 (Deducciones Imputables Trabajo)"
            explicacion = "Pagos por planes complementarios de salud deducibles hasta 16 UVT mensuales / 192 UVT anuales (Art. 387 E.T.)."
        elif "RETENCION" in concepto_upper:
            casilla = "Casilla 134 (Retenciones en la fuente año gravable)"
            explicacion = "Retenciones practicadas que se descuentan del impuesto liquidado a pagar (Art. 383 E.T.)."
        else:
            casilla = "Cédula General (Trabajo)"
            explicacion = "Concepto imputable a la Cédula General de Rentas de Trabajo."
    elif "CAPITAL" in cedula_upper:
        casilla = "Casilla 58 a 72 (Rentas de Capital)"
        explicacion = "Ingresos por intereses, rendimientos financieros, arrendamientos o regalías."
    elif "NOLABORAL" in cedula_upper:
        casilla = "Casilla 74 a 89 (Rentas No Laborales)"
        explicacion = (
            "Honorarios no laborales o comercio independiente con costos procedentes soportados."
        )
    elif "PATRIMONIO" in cedula_upper:
        if "PASIVO" in concepto_upper or "DEUDA" in concepto_upper:
            casilla = "Casilla 30 (Deudas a 31 de Diciembre)"
            explicacion = "Obligaciones financieras vigentes al cierre del año fiscal respaldadas en extracto bancario (Art. 283 E.T.)."
        else:
            casilla = "Casilla 28 (Patrimonio Bruto)"
            explicacion = "Activos poseídos en el país y en el exterior al 31 de diciembre (cuentas bancarias, inmuebles, vehículos)."
    else:
        casilla = "Formulario 210"
        explicacion = "Transacción clasificada según naturaleza contable del contribuyente."

    if estado == "MATCH_EXACTO":
        explicacion += (
            " ✓ Conciliado al 100% con el reporte de terceros en la Información Exógena DIAN."
        )
    elif estado == "SOLO_EN_CERTIFICADOS":
        explicacion += f" ℹ️ Deducción soportada en certificado privado (${dif:,.0f} COP) no reportada obligatoriamente en exógena bancaria estándar."
    elif estado == "DISCREPANCIA_ALERTA":
        explicacion += f" ⚠️ Discrepancia detectada de ${dif:,.0f} COP frente al valor informado por la DIAN. Requiere verificación de extractos."

    return casilla, explicacion


def process_csv_content(csv_text: str) -> ReconciliationParseResponse:
    """Procesa, valida y cruza el contenido CSV en memoria sin tocar bases de datos."""
    if not csv_text or not csv_text.strip():
        raise HTTPException(status_code=400, detail="El archivo CSV proporcionado está vacío.")

    delimiter = _detect_delimiter(csv_text)
    f = io.StringIO(csv_text.strip())
    reader = csv.DictReader(f, delimiter=delimiter)

    if not reader.fieldnames:
        raise HTTPException(
            status_code=400, detail="No se pudieron identificar los encabezados del archivo CSV."
        )

    # Normalizar encabezados (quitar espacios, minúsculas)
    header_map = {orig: orig.strip().lower() for orig in reader.fieldnames}
    clean_headers = set(header_map.values())

    # Columnas mínimas obligatorias
    required_keys = {"id", "fecha", "tercero_nombre", "valor_cop", "cedula_destino"}
    missing = required_keys - clean_headers
    if missing:
        raise HTTPException(
            status_code=422,
            detail={
                "valid": False,
                "error_type": "MISSING_HEADERS",
                "message": f"Faltan columnas obligatorias en el archivo CSV: {', '.join(missing)}",
                "required_columns": list(required_keys),
                "detected_columns": list(clean_headers),
            },
        )

    items: list[ReconciliationItem] = []
    errors: list[CsvValidationError] = []

    total_declarado = 0.0
    total_exogena = 0.0
    count_match = 0
    count_justified = 0
    count_solo_cert = 0
    count_alert = 0

    row_idx = 1
    for raw_row in reader:
        row_idx += 1
        # Mapear claves limpias
        row = {
            header_map[k]: (v.strip() if v else "") for k, v in raw_row.items() if k in header_map
        }

        row_id = row.get("id") or str(row_idx - 1)
        fecha = row.get("fecha", "")
        tercero_nom = row.get("tercero_nombre", "")
        tercero_nit = row.get("tercero_nit", "")
        descripcion = row.get("descripcion", "")
        tipo_mov = row.get("tipo_movimiento", "INGRESO").upper()
        cedula = row.get("cedula_destino", "TRABAJO").upper()
        concepto = row.get("concepto_tributario", "GENERAL")
        beneficio = row.get("beneficio_asociado", "")
        confianza = row.get("confianza_clasificacion", "MEDIA")
        observaciones = row.get("observaciones", "")
        archivo_orig = row.get("archivo_origen", "archivo_manual.csv")
        resolucion = row.get("resolucion_usuario", "NO_REVISADO")

        # Validación de valor declarado
        try:
            val_cop = _clean_numeric_value(row.get("valor_cop", "0"))
        except Exception as e:
            errors.append(
                CsvValidationError(
                    row=row_idx,
                    column="valor_cop",
                    value=str(row.get("valor_cop")),
                    error=f"Formato numérico inválido: {e}",
                )
            )
            continue

        # Validación de valor exógena
        try:
            val_exo = _clean_numeric_value(row.get("valor_exogena_cop", "0"))
        except Exception as e:
            errors.append(
                CsvValidationError(
                    row=row_idx,
                    column="valor_exogena_cop",
                    value=str(row.get("valor_exogena_cop")),
                    error=f"Formato numérico de exógena inválido: {e}",
                )
            )
            continue

        # Determinar estado de conciliación si no viene explícito
        estado = row.get("estado_exogena", "").upper()
        diferencia = abs(val_cop - val_exo)

        if not estado or estado not in (
            "MATCH_EXACTO",
            "DIFERENCIA_JUSTIFICADA",
            "SOLO_EN_CERTIFICADOS",
            "DISCREPANCIA_ALERTA",
        ):
            if val_cop > 0 and val_exo > 0 and diferencia == 0:
                estado = "MATCH_EXACTO"
            elif val_exo == 0 and val_cop > 0:
                estado = "SOLO_EN_CERTIFICADOS"
            elif diferencia > 0:
                estado = (
                    "DIFERENCIA_JUSTIFICADA"
                    if ("PREPAGADA" in concepto.upper() or "VIVIENDA" in concepto.upper())
                    else "DISCREPANCIA_ALERTA"
                )
            else:
                estado = "MATCH_EXACTO"

        if estado == "MATCH_EXACTO":
            count_match += 1
        elif estado == "SOLO_EN_CERTIFICADOS":
            count_solo_cert += 1
        elif estado == "DIFERENCIA_JUSTIFICADA":
            count_justified += 1
        else:
            count_alert += 1

        total_declarado += val_cop
        total_exogena += val_exo

        casilla_sug, explicacion = _generate_didactic_explanation(
            cedula, concepto, estado, diferencia
        )

        items.append(
            ReconciliationItem(
                id=str(row_id),
                fecha=fecha,
                archivo_origen=archivo_orig,
                tercero_nombre=tercero_nom,
                tercero_nit=tercero_nit,
                descripcion=descripcion,
                tipo_movimiento=tipo_mov,
                valor_cop=val_cop,
                cedula_destino=cedula,
                concepto_tributario=concepto,
                beneficio_asociado=beneficio,
                confianza_clasificacion=confianza,
                observaciones=observaciones,
                estado_exogena=estado,
                valor_exogena_cop=val_exo,
                diferencia_exogena_cop=diferencia,
                resolucion_usuario=resolucion,
                casilla_f210_sugerida=casilla_sug,
                explicacion_didactica=explicacion,
            )
        )

    if errors:
        raise HTTPException(
            status_code=422,
            detail={
                "valid": False,
                "total_errors": len(errors),
                "errors": [e.model_dump() for e in errors],
                "message": f"Se encontraron {len(errors)} errores de formato o tipado en el archivo CSV.",
            },
        )

    total_trx = len(items)
    pct_match = round((count_match / total_trx * 100.0), 1) if total_trx > 0 else 100.0

    kpis = ReconciliationKpis(
        total_transacciones=total_trx,
        total_declarado_cop=total_declarado,
        total_exogena_cop=total_exogena,
        total_conciliado_match=count_match,
        total_diferencias_justificadas=count_justified,
        total_solo_certificados=count_solo_cert,
        total_discrepancias_alerta=count_alert,
        porcentaje_conciliacion=pct_match,
    )

    return ReconciliationParseResponse(
        valid=True, is_ephemeral=True, kpis=kpis, items=items, total_errors=0, errors=[]
    )


@router.post(
    "/parse-csv",
    response_model=ReconciliationParseResponse,
    summary="Parsear y Conciliar CSV en Tiempo Real (100% Efímero / Sin Persistencia)",
    description="Procesa un archivo CSV de transacciones fiscales, valida encabezados y tipos de datos, calcula diferencias frente a la Información Exógena DIAN y genera la estructura de visualización tipo hoja de cálculo didáctica. NO almacena información en base de datos ni en Redis.",
)
async def parse_reconciliation_csv(file: UploadFile = File(...)):
    filename = file.filename or ""
    if not filename.lower().endswith(".csv") and not filename.lower().endswith(".txt"):
        raise HTTPException(
            status_code=400,
            detail="Formato de archivo inválido. Por favor sube un archivo con extensión .csv",
        )

    try:
        content_bytes = await file.read()
        # Intentar decodificar en UTF-8 con fallback a Latin-1
        try:
            content_text = content_bytes.decode("utf-8-sig")
        except UnicodeDecodeError:
            content_text = content_bytes.decode("latin-1")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"No se pudo leer el archivo: {e}") from e

    return process_csv_content(content_text)


@router.post(
    "/parse-raw",
    response_model=ReconciliationParseResponse,
    summary="Parsear CSV desde Texto Raw (Efímero)",
    description="Permite enviar el contenido del CSV como texto plano para agentes IA o scripts CLI.",
)
async def parse_raw_csv(payload: str = Body(..., media_type="text/plain")):
    return process_csv_content(payload)


@router.get(
    "/demo",
    response_model=ReconciliationParseResponse,
    summary="Obtener Datos de Demostración de Conciliación",
    description="Retorna el dataset de demostración precargado de transacciones certificadas para visualización inmediata en la hoja de cálculo.",
)
async def get_reconciliation_demo():
    full_demo = CSV_TEMPLATE_HEADER + CSV_DEMO_ROWS
    return process_csv_content(full_demo)


@router.get(
    "/template",
    response_class=PlainTextResponse,
    summary="Descargar Plantilla Oficial CSV de Transacciones",
    description="Descarga el archivo CSV con los encabezados oficiales requeridos para alimentar la conciliación exógena y hoja de cálculo fiscal.",
)
async def download_csv_template():
    return PlainTextResponse(
        content=CSV_TEMPLATE_HEADER + CSV_DEMO_ROWS,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=plantilla_transacciones_tributia.csv"
        },
    )
