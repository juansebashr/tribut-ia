from typing import Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter
from app.models.persona_natural import PersonaNaturalInput, PersonaNaturalOutput
from app.services.liquidacion_pn import liquidar_persona_natural

router = APIRouter()


class ScenarioComparisonRequest(BaseModel):
    base_scenario: PersonaNaturalInput = Field(..., description="Escenario fiscal actual / base")
    optimized_scenario: PersonaNaturalInput = Field(..., description="Escenario fiscal optimizado o simulado")


class ScenarioComparisonResponse(BaseModel):
    base_result: PersonaNaturalOutput
    optimized_result: PersonaNaturalOutput
    ahorro_impuesto_cop: float
    variacion_renta_gravable_cop: float
    alivios_adicionales_aprovechados_cop: float
    recomendacion_estrategica: str


@router.post(
    "/compare-pn",
    response_model=ScenarioComparisonResponse,
    summary="Comparación y Simulación de Escenarios Fiscales (Persona Natural)",
    description="Compara dos escenarios de planeación tributaria para evaluar el impacto en el impuesto a pagar al aplicar alivios adicionales (AFC, dependientes, medicina prepagada, etc.)."
)
async def comparar_escenarios_pn(payload: ScenarioComparisonRequest):
    base_res = liquidar_persona_natural(payload.base_scenario)
    opt_res = liquidar_persona_natural(payload.optimized_scenario)
    
    ahorro = max(0.0, base_res.impuesto_neto_renta - opt_res.impuesto_neto_renta)
    var_rg = opt_res.renta_liquida_gravable - base_res.renta_liquida_gravable
    alivios_extra = opt_res.alivios_procedentes_finales - base_res.alivios_procedentes_finales

    if ahorro > 0:
        rec = f"El escenario optimizado reduce el impuesto neto a cargo en ${ahorro:,.0f} COP al incrementar los alivios procedentes en ${alivios_extra:,.0f} COP."
    else:
        rec = "El escenario optimizado no generó ahorros tributarios adicionales, posiblemente debido a que se alcanzó el límite global del 40% / tope UVT (Art. 336 E.T.)."

    return ScenarioComparisonResponse(
        base_result=base_res,
        optimized_result=opt_res,
        ahorro_impuesto_cop=ahorro,
        variacion_renta_gravable_cop=var_rg,
        alivios_adicionales_aprovechados_cop=alivios_extra,
        recomendacion_estrategica=rec
    )
