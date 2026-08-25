from fastapi import APIRouter, HTTPException, Query

from app.models.retefuente import (
    RetefuenteF350Input,
    RetefuenteF350Output,
    RetefuenteLaboralInput,
    RetefuenteLaboralOutput,
    TablaRetefuenteItem,
)
from app.services.liquidacion_retefuente import (
    calcular_formulario_350,
    calcular_retefuente_laboral_art383,
    obtener_tabla_maestra_retefuente,
)

router = APIRouter()


@router.post(
    "/laboral",
    response_model=RetefuenteLaboralOutput,
    summary="Depuración y cálculo de retención en la fuente por rentas de trabajo (Art. 383 y 388 E.T.)",
)
def calculate_retefuente_laboral(payload: RetefuenteLaboralInput) -> RetefuenteLaboralOutput:
    try:
        return calcular_retefuente_laboral_art383(payload)
    except Exception as err:
        raise HTTPException(
            status_code=400, detail=f"Error en liquidación de retención laboral: {err}"
        ) from err


@router.post(
    "/f350",
    response_model=RetefuenteF350Output,
    summary="Liquidación mensual de Retención en la Fuente Formulario 350 DIAN",
)
def calculate_formulario_350(payload: RetefuenteF350Input) -> RetefuenteF350Output:
    try:
        return calcular_formulario_350(payload)
    except Exception as err:
        raise HTTPException(
            status_code=400, detail=f"Error en liquidación Formulario 350: {err}"
        ) from err


@router.get(
    "/tabla-retenciones",
    response_model=list[TablaRetefuenteItem],
    summary="Tabla maestra de conceptos, tarifas y bases mínimas de retención en la fuente",
)
def get_tabla_retenciones(
    year: int = Query(2026, description="Año gravable"),
    custom_uvt: float | None = Query(None, description="UVT personalizado opcional"),
) -> list[TablaRetefuenteItem]:
    try:
        return obtener_tabla_maestra_retefuente(year, custom_uvt)
    except Exception as err:
        raise HTTPException(
            status_code=400, detail=f"Error consultando tabla de retenciones: {err}"
        ) from err
