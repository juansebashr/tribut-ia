from typing import Literal

from pydantic import BaseModel, Field

from app.models.common import AuditTraceItem


class ConyugeFinanzasInput(BaseModel):
    """Datos financieros y tributarios de un cónyuge o compañero permanente."""

    nombre: str = Field(
        default="Cónyuge 1",
        description="Nombre o identificador del cónyuge.",
    )
    ingresos_laborales_anuales: float = Field(
        default=0.0,
        ge=0,
        description="Ingresos brutos por rentas de trabajo (salarios, honorarios laborales) en el año.",
    )
    aportes_seguridad_social_salud_pension: float = Field(
        default=0.0,
        ge=0,
        description="Aportes obligatorios a salud y pensión (INCRNGO Art. 55 y 56 E.T.).",
    )
    tiene_dependiente_general_387: bool = Field(
        default=False,
        description="Aplica deducción del 10% de ingresos laborales (hasta 384 UVT) por dependiente general.",
    )
    numero_dependientes_adicionales_72uvt: int = Field(
        default=0,
        ge=0,
        le=4,
        description="Número de dependientes adicionales con deducción de 72 UVT (máximo 4 según Ley 2277).",
    )
    otras_deducciones_y_exentas_cedula_general: float = Field(
        default=0.0,
        ge=0,
        description="Otras rentas exentas (25% laboral) y deducciones aplicadas en el año.",
    )


class TributacionParejaRequest(BaseModel):
    """Parámetros de entrada para la simulación de tributación en pareja y planeación conyugal."""

    tax_year: int = Field(
        default=2026,
        description="Año gravable a simular.",
    )
    custom_uvt: float | None = Field(
        default=None,
        gt=0,
        description="Valor personalizado de la UVT (opcional). Si no se provee, se toma el valor oficial del año.",
    )
    conyuge_a: ConyugeFinanzasInput = Field(
        default_factory=lambda: ConyugeFinanzasInput(
            nombre="Cónyuge A (Ingresos Principales)",
            ingresos_laborales_anuales=140000000.0,
            aportes_seguridad_social_salud_pension=11200000.0,
            tiene_dependiente_general_387=True,
            numero_dependientes_adicionales_72uvt=1,
            otras_deducciones_y_exentas_cedula_general=28000000.0,
        ),
        description="Información financiera del primer cónyuge.",
    )
    conyuge_b: ConyugeFinanzasInput = Field(
        default_factory=lambda: ConyugeFinanzasInput(
            nombre="Cónyuge B (Menores Ingresos / Independiente)",
            ingresos_laborales_anuales=30000000.0,
            aportes_seguridad_social_salud_pension=2400000.0,
            tiene_dependiente_general_387=False,
            numero_dependientes_adicionales_72uvt=0,
            otras_deducciones_y_exentas_cedula_general=6000000.0,
        ),
        description="Información financiera del segundo cónyuge.",
    )
    rentas_capital_conjuntas_arriendos_intereses: float = Field(
        default=60000000.0,
        ge=0,
        description="Rentas de capital anuales (arriendos, rendimientos) generadas por bienes familiares.",
    )
    costos_procedentes_rentas_capital: float = Field(
        default=6000000.0,
        ge=0,
        description="Costos y gastos procedentes atribuibles a las rentas de capital (mantenimiento, administración, predial).",
    )
    intereses_credito_vivienda_conjunto_anual: float = Field(
        default=24000000.0,
        ge=0,
        description="Intereses pagados por crédito hipotecario o leasing habitacional sobre la vivienda familiar (Art. 119 E.T. - máx 1.200 UVT).",
    )
    valor_activo_adquirido_en_el_ano: float = Field(
        default=350000000.0,
        ge=0,
        description="Valor total de compra de nuevos activos (inmuebles, vehículos) adquiridos durante el año gravable.",
    )
    esquema_adquisicion_activo: Literal[
        "TITULARIDAD_EXCLUSIVA_SIN_FONDOS",
        "COPROPIEDAD_PROINDIVISO_50_50",
        "MUTUO_PRESTAMO_CON_FECHA_CIERTA",
    ] = Field(
        default="COPROPIEDAD_PROINDIVISO_50_50",
        description="Estructura jurídica con la que se adquiere el nuevo activo familiar.",
    )
    distribucion_intereses_vivienda: Literal["50_50", "100_CONYUGE_A", "100_CONYUGE_B"] = Field(
        default="100_CONYUGE_A",
        description="Distribución de la deducción de intereses de vivienda entre ambos cónyuges.",
    )


class LiquidacionIndividualConyuge(BaseModel):
    """Resultado de la liquidación individual de renta de un cónyuge."""

    nombre: str
    ingresos_laborales_netos: float
    rentas_capital_asignadas: float
    costos_capital_asignados: float
    renta_bruta_cedula_general: float
    total_deducciones_y_exentas_aplicadas: float
    renta_liquida_gravable_cop: float
    renta_liquida_gravable_uvt: float
    impuesto_renta_determinado_cop: float
    tarifa_marginal_maxima_aplicada_pct: float
    tarifa_efectiva_tributacion_pct: float
    tramo_cero_uvt_aprovechado: float


class EscenarioTributarioPareja(BaseModel):
    """Resumen consolidado de la pareja en un escenario de liquidación."""

    nombre_escenario: str
    descripcion: str
    conyuge_a: LiquidacionIndividualConyuge
    conyuge_b: LiquidacionIndividualConyuge
    total_impuesto_familiar_cop: float
    total_renta_gravable_familiar_cop: float
    tarifa_efectiva_familiar_pct: float


class AnalisisRiesgoPatrimonialConyugal(BaseModel):
    """Evaluación de consistencia patrimonial y riesgos ante la DIAN."""

    riesgo_comparacion_patrimonial_conyuge_titular: bool
    monto_desajuste_potencial_cop: float
    riesgo_donacion_involuntaria_art302: bool
    impuesto_ganancia_ocasional_donacion_cop: float
    diagnostico_legal: str
    solucion_recomendada: str


class TributacionParejaResponse(BaseModel):
    """Resultado detallado de la simulación de planeación y tributación en pareja."""

    tax_year: int
    uvt_value: float
    escenario_no_optimizado: EscenarioTributarioPareja
    escenario_optimizado: EscenarioTributarioPareja
    ahorro_tributario_familiar_neto_cop: float
    porcentaje_ahorro_familiar_pct: float
    analisis_riesgo_patrimonial: AnalisisRiesgoPatrimonialConyugal
    estrategias_aplicadas: list[str]
    recomendaciones_legales_y_formales: list[str]
    audit_trace: list[AuditTraceItem]
