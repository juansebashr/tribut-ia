from fastapi import APIRouter

from app.services.beneficios import (
    AjusteArticulo73Item,
    BeneficioAuditoriaRequest,
    BeneficioAuditoriaResponse,
    BeneficioItem,
    ReduccionSancionRequest,
    ReduccionSancionResponse,
    SimulacionAjusteArticulo73Request,
    SimulacionAjusteArticulo73Response,
    calcular_ajuste_articulo_73,
    calcular_beneficio_auditoria,
    calcular_reduccion_sancion,
    get_catalogo_beneficios,
    get_tabla_articulo_73,
)

router = APIRouter()


@router.get(
    "/catalog",
    response_model=list[BeneficioItem],
    summary="Catálogo Completo de Beneficios Tributarios",
    description="Retorna la lista estructurada de beneficios tributarios (INCRNGO, Deducciones, Rentas Exentas, Descuentos, Beneficio de Auditoría, Reducción de Sanciones y Ajuste Fiscal de Activos Art. 73) con su fundamento en el Estatuto Tributario.",
)
async def listar_beneficios():
    return get_catalogo_beneficios()


@router.get(
    "/articulo-73/tabla",
    response_model=list[AjusteArticulo73Item],
    summary="Tabla Oficial de Ajuste Fiscal Art. 73 E.T. (1955-2024)",
    description="Retorna la tabla completa oficial de factores multiplicadores para reajuste del costo fiscal de acciones, aportes e inmuebles (urbanos, rurales y agropecuarios) según el año de adquisición.",
)
async def obtener_tabla_articulo_73():
    return get_tabla_articulo_73()


@router.post(
    "/simular-articulo-73",
    response_model=SimulacionAjusteArticulo73Response,
    summary="Simular Ajuste Fiscal de Inmuebles e Inversiones (Art. 73 E.T.)",
    description="Calcula el costo fiscal ajustado multiplicando el costo histórico por el factor oficial del Art. 73, y simula el ahorro neto en impuesto de Ganancia Ocasional o Renta.",
)
async def simular_articulo_73(payload: SimulacionAjusteArticulo73Request):
    return calcular_ajuste_articulo_73(payload)


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
