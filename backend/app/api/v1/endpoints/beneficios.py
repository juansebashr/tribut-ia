from fastapi import APIRouter

from app.services.beneficios import (
    BeneficioAuditoriaRequest,
    BeneficioAuditoriaResponse,
    BeneficioItem,
    ReduccionSancionRequest,
    ReduccionSancionResponse,
    calcular_beneficio_auditoria,
    calcular_reduccion_sancion,
    get_catalogo_beneficios,
)

router = APIRouter()


@router.get(
    "/catalog",
    response_model=list[BeneficioItem],
    summary="Catálogo Completo de Beneficios Tributarios",
    description="Retorna la lista estructurada de beneficios tributarios (INCRNGO, Deducciones, Rentas Exentas, Descuentos, Beneficio de Auditoría y Reducción de Sanciones) con su fundamento en el Estatuto Tributario.",
)
async def listar_beneficios():
    return get_catalogo_beneficios()


@router.post(
    "/simular-auditoria",
    response_model=BeneficioAuditoriaResponse,
    summary="Simular Beneficio de Auditoría (Art. 689-3 E.T.)",
    description="Calcula el incremento necesario del 35% (firmeza en 6 meses) o del 25% (firmeza en 12 meses) respecto al impuesto neto del año anterior para obtener el Beneficio de Auditoría.",
)
async def simular_auditoria(payload: BeneficioAuditoriaRequest):
    return calcular_beneficio_auditoria(payload)


@router.post(
    "/simular-reduccion-sancion",
    response_model=ReduccionSancionResponse,
    summary="Simular Reducción de Sanciones (Art. 640 y 644 E.T.)",
    description="Calcula la reducción de sanciones tributarias por corrección voluntaria y principio de favorabilidad/gradualidad (50% o 75% de rebaja).",
)
async def simular_sancion(payload: ReduccionSancionRequest):
    return calcular_reduccion_sancion(payload)
