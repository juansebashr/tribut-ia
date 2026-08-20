from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.core.rules_engine.loader import load_all_rules

app = FastAPI(
    title="TributIA API - Suite Tributaria Colombiana & Agentes IA",
    description=(
        "## TributIA - Suite Tributaria DIAN & Motor de Liquidación en Tiempo Real\n\n"
        "API y plataforma para cálculo, planeación y liquidación automatizada del impuesto sobre la renta "
        "en Colombia para Personas Naturales (Cédula General, Ganancias Ocasionales, Formulario 210) "
        "y Personas Jurídicas (Formulario 110 & Tasa Mínima TTD).\n\n"
        "### 🔒 Control de Acceso & Aislamiento de Sesiones en Redis:\n"
        "- Para sincronizar datos con una sesión específica o la pantalla en vivo de un usuario, "
        "incluye la cabecera HTTP **`X-Session-ID: <session_id>`** (o el parámetro de consulta `?session_id=...`).\n"
        "- Si el cliente es un navegador web, se auto-emite de forma transparente una cookie `tributia_sid` con un UUID seguro.\n"
        "- Todas las mutaciones emitidas por la API se transmiten en vivo a la interfaz gráfica vía Redis Pub/Sub y Server-Sent Events (`/api/v1/session/events`)."
    ),
    version="1.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files directory
STATIC_DIR = Path(__file__).parent / "static"
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.on_event("startup")
def startup_event():
    load_all_rules()


# API Router
app.include_router(api_router, prefix="/api/v1")


# Web UI entrypoint
@app.get("/", tags=["UI"])
def serve_ui():
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(
            str(index_file),
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
            },
        )
    return {"app": "TributIA API", "status": "online", "docs": "/docs", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {"status": "ok", "app": "TributIA"}


@app.get("/.well-known/appspecific/com.chrome.devtools.json", include_in_schema=False)
def chrome_devtools_endpoint():
    """Silencia la solicitud interna automática de Google Chrome DevTools."""
    return {}
