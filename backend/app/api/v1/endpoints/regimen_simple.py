from fastapi import APIRouter, HTTPException

from app.models.regimen_simple import (
    ComparativaSimpleInput,
    ComparativaSimpleOutput,
    RegimenSimpleInput,
    RegimenSimpleOutput,
)
from app.services.liquidacion_simple import (
    comparar_ordinario_vs_simple,
    liquidar_regimen_simple,
)

router = APIRouter()


@router.post(
    "/calculate",
    response_model=RegimenSimpleOutput,
    summary="Liquidar Régimen Simple de Tributación - SIMPLE (Formulario 260)",
    description="Calcula la liquidación consolidada anual del Régimen Simple de Tributación según el grupo de actividad empresarial (Art. 908 E.T.), componente ICA territorial, descuentos por pensión empleador y 0.5% ventas electrónicas, e Impuesto Nacional al Consumo de comidas y bebidas.",
)
async def calcular_regimen_simple(payload: RegimenSimpleInput):
    try:
        return liquidar_regimen_simple(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post(
    "/comparativa",
    response_model=ComparativaSimpleOutput,
    summary="Simulador Comparativo: Régimen Ordinario vs Régimen SIMPLE",
    description="Compara en paralelo la carga impositiva en el Régimen Ordinario (F-110/F-210) frente al Régimen SIMPLE (F-260) y evalúa el ahorro neto, liberación de flujo de caja y exoneración parafiscal.",
)
async def simular_comparativa_regimen(payload: ComparativaSimpleInput):
    try:
        return comparar_ordinario_vs_simple(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
