from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.core.rules_engine.loader import get_available_tax_years, get_rules_for_year
from app.core.rules_engine.schema import TaxYearRules
from app.models.common import UvtConversionRequest, UvtConversionResponse

router = APIRouter()


@router.get(
    "/years",
    response_model=List[int],
    summary="Listar Años Gravables Disponibles",
    description="Retorna la lista de años fiscales para los cuales existen reglas tributarias configuradas en el motor."
)
async def listar_anos():
    return get_available_tax_years()


@router.get(
    "/{year}",
    response_model=TaxYearRules,
    summary="Consultar Reglas Tributarias de un Año",
    description="Retorna los parámetros tributarios, UVT, topes de deducciones y tarifas aplicables para el año especificado."
)
async def obtener_reglas_ano(
    year: int,
    custom_uvt: Optional[float] = Query(None, description="Sobreescribir UVT para simulación")
):
    try:
        return get_rules_for_year(year, custom_uvt)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post(
    "/convert-uvt",
    response_model=UvtConversionResponse,
    summary="Conversión Bidireccional Pesos (COP) <-> UVT",
    description="Convierte montos entre pesos colombianos y UVT según el año gravable seleccionado o UVT personalizado."
)
async def convertir_uvt(payload: UvtConversionRequest):
    rules = get_rules_for_year(payload.tax_year, payload.custom_uvt)
    uvt = rules.uvt_value
    
    if payload.amount_cop is not None:
        amount_cop = payload.amount_cop
        amount_uvt = amount_cop / uvt if uvt > 0 else 0.0
    elif payload.amount_uvt is not None:
        amount_uvt = payload.amount_uvt
        amount_cop = amount_uvt * uvt
    else:
        amount_cop = 0.0
        amount_uvt = 0.0

    return UvtConversionResponse(
        tax_year=payload.tax_year,
        uvt_value=uvt,
        amount_cop=amount_cop,
        amount_uvt=round(amount_uvt, 4)
    )
