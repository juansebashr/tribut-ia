from fastapi import APIRouter, HTTPException

from app.models.iva import (
    BienServicioIvaItem,
    IvaF300Input,
    IvaF300Output,
    IvaProrrateoInput,
    IvaProrrateoOutput,
)
from app.services.liquidacion_iva import (
    calcular_formulario_300,
    calcular_prorrateo_iva_art490,
    obtener_clasificador_bienes_servicios_iva,
)

router = APIRouter()


@router.post(
    "/f300",
    response_model=IvaF300Output,
    summary="Liquidación periódica del Impuesto sobre las Ventas (IVA) Formulario 300 DIAN",
)
def calculate_formulario_300(payload: IvaF300Input) -> IvaF300Output:
    try:
        return calcular_formulario_300(payload)
    except Exception as err:
        raise HTTPException(
            status_code=400, detail=f"Error en liquidación Formulario 300 IVA: {err}"
        ) from err


@router.post(
    "/prorrateo",
    response_model=IvaProrrateoOutput,
    summary="Simulador y cálculo de prorrateo de IVA común (Art. 490 E.T.)",
)
def calculate_prorrateo_art490(payload: IvaProrrateoInput) -> IvaProrrateoOutput:
    try:
        return calcular_prorrateo_iva_art490(payload)
    except Exception as err:
        raise HTTPException(
            status_code=400, detail=f"Error en cálculo de prorrateo de IVA: {err}"
        ) from err


@router.get(
    "/clasificador",
    response_model=list[BienServicioIvaItem],
    summary="Catálogo clasificador de bienes y servicios según tratamiento de IVA en Colombia",
)
def get_clasificador_iva() -> list[BienServicioIvaItem]:
    try:
        return obtener_clasificador_bienes_servicios_iva()
    except Exception as err:
        raise HTTPException(
            status_code=400, detail=f"Error consultando clasificador de IVA: {err}"
        ) from err
