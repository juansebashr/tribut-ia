from fastapi import APIRouter, HTTPException

from app.models.comparacion_patrimonial import (
    ComparacionPatrimonialRequest,
    ComparacionPatrimonialResponse,
)
from app.models.persona_natural import PersonaNaturalInput, PersonaNaturalOutput
from app.services.comparacion_patrimonial import liquidar_comparacion_patrimonial
from app.services.liquidacion_pn import liquidar_persona_natural

router = APIRouter()


@router.post(
    "/calculate",
    response_model=PersonaNaturalOutput,
    summary="Liquidar Impuesto de Renta Persona Natural",
    description="Calcula la depuración de cédula general de rentas de trabajo y mixtas para personas naturales en Colombia, aplicando límites de UVT, topes individuales y conjuntos (Art. 336 E.T.) y tabla marginal progresiva (Art. 241 E.T.).",
)
async def calcular_renta_persona_natural(payload: PersonaNaturalInput):
    try:
        return liquidar_persona_natural(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post(
    "/comparacion-patrimonial",
    response_model=ComparacionPatrimonialResponse,
    summary="Simular y Liquidar Comparación Patrimonial (Art. 236 y 237 E.T.)",
    description="Evalúa si el incremento del patrimonio líquido del contribuyente está plenamente justificado con sus rentas ordinarias, rentas exentas, ganancias ocasionales, deudas o desahorro, o si se genera Renta Líquida Gravable por Comparación Patrimonial.",
)
async def calcular_comparacion_patrimonial_endpoint(payload: ComparacionPatrimonialRequest):
    try:
        return liquidar_comparacion_patrimonial(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
