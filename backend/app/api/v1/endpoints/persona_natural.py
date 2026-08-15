from fastapi import APIRouter, HTTPException
from app.models.persona_natural import PersonaNaturalInput, PersonaNaturalOutput
from app.services.liquidacion_pn import liquidar_persona_natural

router = APIRouter()


@router.post(
    "/calculate",
    response_model=PersonaNaturalOutput,
    summary="Liquidar Impuesto de Renta Persona Natural",
    description="Calcula la depuración de cédula general de rentas de trabajo y mixtas para personas naturales en Colombia, aplicando límites de UVT, topes individuales y conjuntos (Art. 336 E.T.) y tabla marginal progresiva (Art. 241 E.T.)."
)
async def calcular_renta_persona_natural(payload: PersonaNaturalInput):
    try:
        return liquidar_persona_natural(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
