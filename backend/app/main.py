from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
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

# Rutas de archivos estáticos y frontend SPA
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
FRONTEND_DIST = BASE_DIR.parent.parent / "frontend" / "dist"
if not FRONTEND_DIST.exists():
    FRONTEND_DIST = Path("/app/frontend/dist")

# Montar assets compilados de React Vite
if (FRONTEND_DIST / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="react-assets")

# Montar static si existe para compatibilidad
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.on_event("startup")
def startup_event():
    load_all_rules()


# API Router
app.include_router(api_router, prefix="/api/v1")


# Web UI entrypoint (React SPA como interfaz principal)
@app.get("/", tags=["UI"])
def serve_ui():
    react_index = FRONTEND_DIST / "index.html"
    if react_index.exists():
        return FileResponse(
            str(react_index),
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
            },
        )
    static_index = STATIC_DIR / "index.html"
    if static_index.exists():
        return FileResponse(
            str(static_index),
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
            },
        )
    return {"app": "TributIA API", "status": "online", "docs": "/docs", "version": "1.2.0"}


@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {"status": "ok", "app": "TributIA"}


@app.get("/.well-known/appspecific/com.chrome.devtools.json", include_in_schema=False)
def chrome_devtools_endpoint():
    """Silencia la solicitud interna automática de Google Chrome DevTools."""
    return {}


@app.get("/favicon.ico", include_in_schema=False)
def favicon_ico():
    """Sirve el favicon.ico oficial en formato binario estándar."""
    for path in [
        FRONTEND_DIST / "favicon.ico",
        STATIC_DIR / "favicon.ico",
        BASE_DIR.parent.parent / "frontend" / "public" / "favicon.ico",
    ]:
        if path.exists():
            return FileResponse(str(path), media_type="image/x-icon")
    return Response(status_code=204)


@app.get("/favicon.svg", include_in_schema=False)
def favicon_svg():
    """Sirve el favicon en formato vectorial SVG."""
    for path in [
        FRONTEND_DIST / "favicon.svg",
        STATIC_DIR / "favicon.svg",
        BASE_DIR.parent.parent / "frontend" / "public" / "favicon.svg",
    ]:
        if path.exists():
            return FileResponse(str(path), media_type="image/svg+xml")
    return Response(status_code=204)


@app.get("/favicon.png", include_in_schema=False)
@app.get("/favicon-16x16.png", include_in_schema=False)
@app.get("/favicon-32x32.png", include_in_schema=False)
@app.get("/favicon-48x48.png", include_in_schema=False)
@app.get("/favicon-180x180.png", include_in_schema=False)
@app.get("/favicon-192x192.png", include_in_schema=False)
@app.get("/favicon-512x512.png", include_in_schema=False)
@app.get("/apple-touch-icon.png", include_in_schema=False)
@app.get("/apple-touch-icon-precomposed.png", include_in_schema=False)
def favicon_png(request: Request):
    """Sirve los íconos rasterizados PNG para navegadores de escritorio y móviles."""
    filename = request.url.path.lstrip("/")
    if "apple-touch-icon" in filename:
        filename = "apple-touch-icon.png"
    for path in [
        FRONTEND_DIST / filename,
        STATIC_DIR / filename,
        BASE_DIR.parent.parent / "frontend" / "public" / filename,
    ]:
        if path.exists():
            return FileResponse(str(path), media_type="image/png")
    return Response(status_code=204)


@app.get("/robots.txt", include_in_schema=False)
def serve_robots_txt():
    """Sirve el archivo robots.txt para indexación y crawlers de búsqueda/IA."""
    for path in [
        FRONTEND_DIST / "robots.txt",
        STATIC_DIR / "robots.txt",
        BASE_DIR.parent.parent / "frontend" / "public" / "robots.txt",
    ]:
        if path.exists():
            return FileResponse(str(path), media_type="text/plain; charset=utf-8")
    return Response(content="User-agent: *\nAllow: /\n", media_type="text/plain; charset=utf-8")


@app.get("/sitemap.xml", include_in_schema=False)
def serve_sitemap_xml():
    """Sirve el archivo sitemap.xml para motores de búsqueda."""
    for path in [
        FRONTEND_DIST / "sitemap.xml",
        STATIC_DIR / "sitemap.xml",
        BASE_DIR.parent.parent / "frontend" / "public" / "sitemap.xml",
    ]:
        if path.exists():
            return FileResponse(str(path), media_type="application/xml; charset=utf-8")
    return Response(
        content='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
        media_type="application/xml; charset=utf-8",
    )


@app.get("/llms.txt", include_in_schema=False)
def serve_llms_txt():
    """Sirve el archivo llms.txt para consumo estructurado de modelos de lenguaje e IA."""
    for path in [
        FRONTEND_DIST / "llms.txt",
        STATIC_DIR / "llms.txt",
        BASE_DIR.parent.parent / "frontend" / "public" / "llms.txt",
    ]:
        if path.exists():
            return FileResponse(str(path), media_type="text/plain; charset=utf-8")
    return Response(
        content="# TributIA\n> Suite Tributaria DIAN\n", media_type="text/plain; charset=utf-8"
    )


@app.get("/llms-full.txt", include_in_schema=False)
def serve_llms_full_txt():
    """Sirve la documentación extendida de TributIA para LLMs."""
    for path in [
        FRONTEND_DIST / "llms-full.txt",
        STATIC_DIR / "llms-full.txt",
        BASE_DIR.parent.parent / "frontend" / "public" / "llms-full.txt",
    ]:
        if path.exists():
            return FileResponse(str(path), media_type="text/plain; charset=utf-8")
    return Response(
        content="# TributIA Full Documentation\n", media_type="text/plain; charset=utf-8"
    )
