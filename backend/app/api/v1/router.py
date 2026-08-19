from fastapi import APIRouter
from app.api.v1.endpoints import (
    persona_natural,
    persona_juridica,
    rules,
    simulation,
    beneficios,
    session_sync,
    reconciliation
)

api_router = APIRouter()

api_router.include_router(persona_natural.router, prefix="/calculate/persona-natural", tags=["Persona Natural"])
api_router.include_router(persona_juridica.router, prefix="/calculate/persona-juridica", tags=["Persona Jurídica"])
api_router.include_router(rules.router, prefix="/rules", tags=["Reglas y Parámetros"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["Simulación y Planeación"])
api_router.include_router(beneficios.router, prefix="/beneficios", tags=["Beneficios y Auditoría"])
api_router.include_router(reconciliation.router, prefix="/reconciliation", tags=["Conciliación Exógena & CSV"])
api_router.include_router(session_sync.router, prefix="/session", tags=["Sincronización API-UI"])
api_router.include_router(session_sync.router, prefix="/ui", tags=["Sincronización API-UI"])
