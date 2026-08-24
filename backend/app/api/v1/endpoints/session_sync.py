import asyncio
import json
import uuid
from typing import Any

from fastapi import APIRouter, Body, Depends, Header, Query, Request, Response
from fastapi.responses import StreamingResponse

from app.models.persona_juridica import PersonaJuridicaInput
from app.models.persona_natural import PersonaNaturalInput
from app.services.liquidacion_pj import liquidar_persona_juridica
from app.services.liquidacion_pn import liquidar_persona_natural
from app.services.session_store import SessionState, session_store

router = APIRouter()


async def resolve_session_id(
    request: Request,
    response: Response,
    x_session_id: str | None = Header(None, alias="X-Session-ID"),
    session_id: str | None = Query(None, description="ID de sesión opcional en URL"),
) -> str:
    """
    Resolución unificada de ID de Sesión (Dual-Mode):
    1. Header HTTP 'X-Session-ID' (Scripts CLI, Python, cURL, Agentes IA)
    2. Query Param '?session_id=...' (Enlaces directos o tests)
    3. Cookie 'fiscol_sid' del navegador (con fallback a 'tributia_sid')
    4. Auto-generación de UUID criptográfico si es un usuario nuevo
    """
    # 1. Header HTTP
    if x_session_id and x_session_id.strip():
        sid = x_session_id.strip()
        response.set_cookie(
            key="fiscol_sid", value=sid, max_age=86400, samesite="lax", httponly=False
        )
        return sid

    # 2. Query param
    if session_id and session_id.strip():
        sid = session_id.strip()
        response.set_cookie(
            key="fiscol_sid", value=sid, max_age=86400, samesite="lax", httponly=False
        )
        return sid

    # 3. Cookie de navegador
    cookie_sid = request.cookies.get("fiscol_sid") or request.cookies.get("tributia_sid")
    if cookie_sid and cookie_sid.strip():
        return cookie_sid.strip()

    # 4. Auto-generación de UUIDv4 seguro
    new_sid = f"ses_{uuid.uuid4().hex[:16]}"
    response.set_cookie(
        key="fiscol_sid",
        value=new_sid,
        max_age=86400,  # 1 día de TTL
        samesite="lax",
        httponly=False,
    )
    return new_sid


@router.get("/current", summary="Consultar o inicializar ID de sesión activa")
async def get_current_session_info(
    response: Response, session_id: str = Depends(resolve_session_id)
):
    """
    Retorna el ID de sesión asignado al cliente actual vía Cookie o Header.
    """
    response.set_cookie(
        key="tributia_sid", value=session_id, max_age=86400, samesite="lax", httponly=False
    )
    return {"session_id": session_id, "ttl_seconds": 86400, "auth_mode": "header_or_cookie"}


@router.get("/state", response_model=SessionState, summary="Obtener estado actual de la sesión")
async def get_session_state(session_id: str = Depends(resolve_session_id)):
    """
    Retorna el estado completo actual de la sesión resuelta:
    metadatos, datos de Persona Natural, Persona Jurídica y cálculos.
    """
    return await session_store.get_state(session_id)


@router.post(
    "/state", response_model=SessionState, summary="Inyectar / Actualizar estado en la sesión"
)
async def update_session_state(
    request: Request,
    payload: dict[str, Any] = Body(
        ..., description="Estado parcial o total a inyectar en la sesión"
    ),
    source: str = Query("api", description="Origen de la actualización ('api' o 'ui')"),
    session_id: str = Depends(resolve_session_id),
):
    """
    Inyecta datos en la sesión activa. Si la interfaz web está abierta con esta sesión,
    recibirá los datos inmediatamente por SSE (Server-Sent Events) y actualizará la pantalla.
    """
    current_state = await session_store.get_state(session_id)

    # Extraer y combinar datos de persona natural
    merged_pn = dict(current_state.persona_natural)
    if "persona_natural" in payload and isinstance(payload["persona_natural"], dict):
        merged_pn.update(payload["persona_natural"])
        try:
            tax_year = payload.get("metadata", {}).get(
                "tax_year", current_state.metadata.get("tax_year", 2026)
            )
            custom_uvt = payload.get("metadata", {}).get(
                "custom_uvt", current_state.metadata.get("custom_uvt", 52350.0)
            )

            pn_fields = {
                k: v
                for k, v in merged_pn.items()
                if k in PersonaNaturalInput.model_fields and k not in ("tax_year", "custom_uvt")
            }
            calc_input_pn = PersonaNaturalInput(
                tax_year=tax_year, custom_uvt=custom_uvt, **pn_fields
            )
            res_pn = liquidar_persona_natural(calc_input_pn)
            if "calculation_results" not in payload:
                payload["calculation_results"] = {}
            payload["calculation_results"]["persona_natural"] = res_pn.model_dump()
        except Exception as e:
            print(f"[ERROR CALCULATING PN]: {e}")

    # Extraer y combinar datos de persona jurídica
    merged_pj = dict(current_state.persona_juridica)
    if "persona_juridica" in payload and isinstance(payload["persona_juridica"], dict):
        merged_pj.update(payload["persona_juridica"])
        try:
            tax_year = payload.get("metadata", {}).get(
                "tax_year", current_state.metadata.get("tax_year", 2026)
            )
            custom_uvt = payload.get("metadata", {}).get(
                "custom_uvt", current_state.metadata.get("custom_uvt", 52350.0)
            )

            pj_fields = {
                k: v
                for k, v in merged_pj.items()
                if k in PersonaJuridicaInput.model_fields and k not in ("tax_year", "custom_uvt")
            }
            calc_input_pj = PersonaJuridicaInput(
                tax_year=tax_year, custom_uvt=custom_uvt, **pj_fields
            )
            res_pj = liquidar_persona_juridica(calc_input_pj)
            if "calculation_results" not in payload:
                payload["calculation_results"] = {}
            payload["calculation_results"]["persona_juridica"] = res_pj.model_dump()
        except Exception as e:
            print(f"[ERROR CALCULATING PJ]: {e}")

    updated_state = await session_store.update_state(session_id, payload, source=source)
    return updated_state


@router.get("/events", summary="Stream de eventos en tiempo real (SSE)")
async def session_events_stream(request: Request, session_id: str = Depends(resolve_session_id)):
    """
    Canal Server-Sent Events (SSE) al que se conecta el navegador web para recibir
    notificaciones en vivo de su sesión específica vía Redis Pub/Sub.
    """
    queue = await session_store.subscribe(session_id)

    async def event_generator():
        # Enviar evento inicial de conexión con el estado actual
        initial_state = await session_store.get_state(session_id)
        yield f"event: connected\ndata: {json.dumps({'status': 'connected', 'session_id': session_id, 'state': initial_state.model_dump()})}\n\n"

        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    msg = await asyncio.wait_for(queue.get(), timeout=20.0)
                    if isinstance(msg, str):
                        yield msg
                    else:
                        yield f"event: {msg.get('type', 'state_update')}\ndata: {json.dumps(msg)}\n\n"
                except TimeoutError:
                    yield f"event: ping\ndata: {json.dumps({'time': asyncio.get_event_loop().time()})}\n\n"
        finally:
            await session_store.unsubscribe(session_id, queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/reset", response_model=SessionState, summary="Restablecer estado de la sesión")
async def reset_session(session_id: str = Depends(resolve_session_id)):
    """
    Restablece todos los datos de la sesión actual a sus valores iniciales por defecto.
    """
    return await session_store.reset_state(session_id)
