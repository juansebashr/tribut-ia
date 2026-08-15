from fastapi import APIRouter, HTTPException
from app.models.persona_juridica import PersonaJuridicaInput, PersonaJuridicaOutput
from app.services.liquidacion_pj import liquidar_persona_juridica

router = APIRouter()


@router.post(
    "/calculate",
    response_model=PersonaJuridicaOutput,
    summary="Liquidar Impuesto de Renta Persona Jurídica (Formulario 110)",
    description="Calcula la conciliación contable-fiscal, depuración de renta líquida ordinaria, tarifa general de renta, ganancias ocasionales y validación de la Tasa de Tributación Depurada (TTD - Tasa Mínima del 15% según Art. 240 Parágrafo 6)."
)
async def calcular_renta_persona_juridica(payload: PersonaJuridicaInput):
    try:
        return liquidar_persona_juridica(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
