from fastapi import APIRouter

from app.models.tributacion_pareja import (
    TributacionParejaRequest,
    TributacionParejaResponse,
)
from app.services.beneficios import (
    AjusteArticulo73Item,
    BeneficioAuditoriaRequest,
    BeneficioAuditoriaResponse,
    BeneficioItem,
    ItemTablaComponenteInflacionario,
    LiquidacionSancionRequest,
    LiquidacionSancionResponse,
    ReduccionSancionRequest,
    ReduccionSancionResponse,
    SimulacionAjusteArticulo73Request,
    SimulacionAjusteArticulo73Response,
    SimulacionCombinabilidadRequest,
    SimulacionCombinabilidadResponse,
    SimulacionComponenteInflacionarioRequest,
    SimulacionComponenteInflacionarioResponse,
    SimulacionInmuebleAfcRequest,
    SimulacionInmuebleAfcResponse,
    calcular_ajuste_articulo_73,
    calcular_beneficio_auditoria,
    calcular_componente_inflacionario,
    calcular_exencion_inmueble_afc,
    calcular_reduccion_sancion,
    calcular_sancion_tributaria,
    get_catalogo_beneficios,
    get_tabla_articulo_73,
    get_tabla_componente_inflacionario,
    simular_combinabilidad_inflacion_art73,
)
from app.services.tributacion_pareja import simular_tributacion_pareja

router = APIRouter()


@router.get(
    "/componente-inflacionario/tabla",
    response_model=list[ItemTablaComponenteInflacionario],
    summary="Tabla Histórica de Decretos y Porcentajes del Componente Inflacionario (2018-2026)",
    description="Retorna el histórico oficial de decretos reglamentarios, tasas de inflación DANE, captación Superfinanciera y porcentajes no gravados para rendimientos nacionales, FICs y moneda extranjera.",
)
async def obtener_tabla_componente_inflacionario():
    return get_tabla_componente_inflacionario()


@router.post(
    "/simular-componente-inflacionario",
    response_model=SimulacionComponenteInflacionarioResponse,
    summary="Simular Componente Inflacionario de Rendimientos y Gastos Financieros (Art. 38, 40-1, 41 y 118 E.T.)",
    description="Calcula la porción no gravada (INCRNGO - Casilla 59 F210) de rendimientos financieros o la porción no deducible de intereses pagados para personas naturales no obligadas a llevar contabilidad.",
)
async def simular_componente_inflacionario_endpoint(
    payload: SimulacionComponenteInflacionarioRequest,
):
    return calcular_componente_inflacionario(payload)


@router.post(
    "/simular-combinabilidad-inflacion-art73",
    response_model=SimulacionCombinabilidadResponse,
    summary="Simular Combinabilidad de Componente Inflacionario + Reajuste Fiscal Art. 73",
    description="Calcula el ahorro tributario consolidado al combinar el beneficio de Componente Inflacionario en Rentas de Capital y el Reajuste Fiscal Art. 73 en Ganancia Ocasional.",
)
async def simular_combinabilidad_endpoint(
    payload: SimulacionCombinabilidadRequest,
):
    return simular_combinabilidad_inflacion_art73(payload)


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
    "/calcular-sancion",
    response_model=LiquidacionSancionResponse,
    summary="Liquidación Integral de Sanciones Tributarias (Art. 641, 642, 644, 640 y 639 E.T.)",
    description="Calcula sanciones por corrección o extemporaneidad con reducción del principio de favorabilidad/gradualidad y control de sanción mínima.",
)
async def liquidar_sancion(payload: LiquidacionSancionRequest):
    return calcular_sancion_tributaria(payload)


@router.post(
    "/simular-reduccion-sancion",
    response_model=ReduccionSancionResponse,
    summary="Simular Reducción de Sanciones (Art. 640 y 644 E.T.)",
    description="Calcula la reducción de sanciones tributarias por corrección voluntaria y principio de favorabilidad/gradualidad (50% o 75% de rebaja).",
)
async def simular_sancion(payload: ReduccionSancionRequest):
    return calcular_reduccion_sancion(payload)


@router.post(
    "/simular-inmueble-afc",
    response_model=SimulacionInmuebleAfcResponse,
    summary="Simular Exención de Ganancia Ocasional en Venta de Inmueble con Cuenta AFC (Art. 311-1 y 126-4 E.T.)",
    description="Calcula la exención de hasta 5.000 UVT de ganancia ocasional al enajenar la casa o apartamento de habitación y destinar los fondos a una cuenta AFC o pago de vivienda.",
)
async def simular_inmueble_afc(payload: SimulacionInmuebleAfcRequest):
    return calcular_exencion_inmueble_afc(payload)


@router.post(
    "/simular-tributacion-pareja",
    response_model=TributacionParejaResponse,
    summary="Simular Planeación Conyugal y Tributación en Pareja (Arts. 8, 119, 236, 241, 302 y 387 E.T.)",
    description="Calcula el ahorro tributario familiar mediante la distribución estratégica de rentas de capital (copropiedad proindiviso 50/50), deducciones de vivienda y dependientes, y evalúa riesgos de inconsistencia patrimonial o donaciones involuntarias.",
)
async def simular_tributacion_pareja_endpoint(payload: TributacionParejaRequest):
    return simular_tributacion_pareja(payload)
