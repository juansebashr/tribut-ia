import asyncio
import json
from typing import Optional, Dict, Any
from fastapi import APIRouter, Query, Request, Body, HTTPException
from fastapi.responses import StreamingResponse
from app.services.session_store import session_store, SessionState
from app.models.persona_natural import PersonaNaturalInput
from app.models.persona_juridica import PersonaJuridicaInput
from app.services.liquidacion_pn import liquidar_persona_natural
from app.services.liquidacion_pj import liquidar_persona_juridica

router = APIRouter()


@router.get("/state", response_model=SessionState, summary="Obtener estado actual de la sesión (UI/API)")
def get_session_state(session_id: str = Query("default", description="ID único de la sesión")):
    """
    Retorna el estado completo actual de la interfaz web/sesión:
    metadatos, datos de Persona Natural, Persona Jurídica y cálculos.
    """
    return session_store.get_state(session_id)


@router.post("/state", response_model=SessionState, summary="Inyectar / Actualizar estado en la UI")
async def update_session_state(
    request: Request,
    session_id: str = Query("default", description="ID único de la sesión"),
    payload: Dict[str, Any] = Body(..., description="Estado parcial o total a inyectar en la UI"),
    source: str = Query("api", description="Origen de la actualización ('api' o 'ui')")
):
    """
    Inyecta datos en la sesión activa. Si la interfaz web está abierta con esta sesión,
    recibirá los datos inmediatamente por SSE (Server-Sent Events) y actualizará la pantalla.
    Además, ejecuta automáticamente los cálculos del motor tributario si se envían datos de PN o PJ.
    """
    current_state = session_store.get_state(session_id)
    
    # Extraer y combinar datos de persona natural
    merged_pn = dict(current_state.persona_natural)
    if "persona_natural" in payload and isinstance(payload["persona_natural"], dict):
        merged_pn.update(payload["persona_natural"])
        try:
            tax_year = payload.get("metadata", {}).get("tax_year", current_state.metadata.get("tax_year", 2026))
            custom_uvt = payload.get("metadata", {}).get("custom_uvt", current_state.metadata.get("custom_uvt", 52350.0))
            
            calc_input = PersonaNaturalInput(
                tax_year=tax_year,
                custom_uvt=custom_uvt,
                **{k: v for k, v in merged_pn.items() if k in PersonaNaturalInput.model_fields}
            )
            res = liquidar_persona_natural(calc_input)
            if "calculation_results" not in payload:
                payload["calculation_results"] = {}
            payload["calculation_results"]["persona_natural"] = res.model_dump()
        except Exception as e:
            pass

    # Extraer y combinar datos de persona jurídica
    merged_pj = dict(current_state.persona_juridica)
    if "persona_juridica" in payload and isinstance(payload["persona_juridica"], dict):
        merged_pj.update(payload["persona_juridica"])
        try:
            tax_year = payload.get("metadata", {}).get("tax_year", current_state.metadata.get("tax_year", 2026))
            custom_uvt = payload.get("metadata", {}).get("custom_uvt", current_state.metadata.get("custom_uvt", 52350.0))
            
            calc_input = PersonaJuridicaInput(
                tax_year=tax_year,
                custom_uvt=custom_uvt,
                **{k: v for k, v in merged_pj.items() if k in PersonaJuridicaInput.model_fields}
            )
            res = liquidar_persona_juridica(calc_input)
            if "calculation_results" not in payload:
                payload["calculation_results"] = {}
            payload["calculation_results"]["persona_juridica"] = res.model_dump()
        except Exception as e:
            pass

    updated_state = await session_store.update_state(session_id, payload, source=source)
    return updated_state


@router.get("/events", summary="Stream de eventos en tiempo real (SSE para la UI)")
async def session_events_stream(
    request: Request,
    session_id: str = Query("default", description="ID único de la sesión a escuchar")
):
    """
    Canal Server-Sent Events (SSE) al que se conecta el navegador web para recibir
    notificaciones en vivo cuando un cliente externo o Agente IA actualiza los datos.
    """
    queue = await session_store.subscribe(session_id)

    async def event_generator():
        # Enviar evento inicial de conexión con el estado actual
        initial_state = session_store.get_state(session_id)
        yield f"event: connected\ndata: {json.dumps({'status': 'connected', 'session_id': session_id, 'state': initial_state.model_dump()})}\n\n"
        
        try:
            while True:
                # Comprobar desconexión del cliente
                if await request.is_disconnected():
                    break
                try:
                    # Esperar hasta 20s por un nuevo mensaje o enviar ping keep-alive
                    msg = await asyncio.wait_for(queue.get(), timeout=20.0)
                    yield f"event: {msg.get('type', 'state_update')}\ndata: {json.dumps(msg)}\n\n"
                except asyncio.TimeoutError:
                    yield f"event: ping\ndata: {json.dumps({'time': asyncio.get_event_loop().time()})}\n\n"
        finally:
            session_store.unsubscribe(queue, session_id)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.post("/reset", response_model=SessionState, summary="Restablecer estado de la sesión")
async def reset_session(session_id: str = Query("default", description="ID único de la sesión")):
    """
    Restablece todos los datos de la sesión a sus valores iniciales por defecto.
    """
    return await session_store.reset_state(session_id)
