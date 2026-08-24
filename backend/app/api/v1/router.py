from fastapi import APIRouter

from app.api.v1.endpoints import (
    beneficios,
    persona_juridica,
    persona_natural,
    reconciliation,
    regimen_simple,
    rules,
    session_sync,
    simulation,
)

api_router = APIRouter()

api_router.include_router(
    persona_natural.router, prefix="/calculate/persona-natural", tags=["Persona Natural"]
)
api_router.include_router(
    persona_natural.router, prefix="/persona-natural", tags=["Persona Natural"]
)
api_router.include_router(
    persona_juridica.router, prefix="/calculate/persona-juridica", tags=["Persona Jurídica"]
)
api_router.include_router(
    persona_juridica.router, prefix="/persona-juridica", tags=["Persona Jurídica"]
)
api_router.include_router(
    regimen_simple.router, prefix="/calculate/regimen-simple", tags=["Régimen Simple"]
)
api_router.include_router(regimen_simple.router, prefix="/regimen-simple", tags=["Régimen Simple"])
api_router.include_router(
    regimen_simple.router, prefix="/calculate/simple", tags=["Régimen Simple"]
)
api_router.include_router(rules.router, prefix="/rules", tags=["Reglas y Parámetros"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["Simulación y Planeación"])
api_router.include_router(beneficios.router, prefix="/beneficios", tags=["Beneficios y Auditoría"])
api_router.include_router(
    reconciliation.router, prefix="/reconciliation", tags=["Conciliación Exógena & CSV"]
)
api_router.include_router(session_sync.router, prefix="/session", tags=["Sincronización API-UI"])
api_router.include_router(session_sync.router, prefix="/ui", tags=["Sincronización API-UI"])
