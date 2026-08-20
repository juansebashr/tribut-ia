from pydantic import BaseModel, Field


class AuditTraceItem(BaseModel):
    step_id: str = Field(
        ..., description="Identificador único del paso (ej: 'deduccion_dependientes')"
    )
    title: str = Field(..., description="Nombre amigable del paso")
    statutory_reference: str | None = Field(
        None, description="Artículo del Estatuto Tributario o norma aplicable"
    )
    raw_input_cop: float | None = Field(
        0.0, description="Valor bruto ingresado por el usuario en COP"
    )
    calculated_cop: float = Field(..., description="Valor calculado según fórmula legal en COP")
    limit_cop: float | None = Field(None, description="Tope máximo permitido en COP")
    limit_uvt: float | None = Field(None, description="Tope máximo permitido en UVT")
    excess_rejected_cop: float | None = Field(
        0.0, description="Valor que superó el tope y fue rechazado/no procedente"
    )
    final_allowed_cop: float = Field(
        ..., description="Valor final aceptado y computable en la depuración"
    )
    notes: str | None = Field(
        None, description="Explicación detallada del cálculo o condición legal"
    )


class UvtConversionRequest(BaseModel):
    tax_year: int = Field(2026, description="Año gravable")
    custom_uvt: float | None = Field(None, description="UVT personalizado opcional")
    amount_cop: float | None = Field(
        None, description="Monto en pesos colombianos para convertir a UVT"
    )
    amount_uvt: float | None = Field(None, description="Monto en UVT para convertir a COP")


class UvtConversionResponse(BaseModel):
    tax_year: int
    uvt_value: float
    amount_cop: float
    amount_uvt: float


class ReconciliationItem(BaseModel):
    id: str
    tercero_nit: str
    tercero_nombre: str
    concepto: str
    valor_certificado: float = 0.0
    valor_exogena: float = 0.0
    diferencia: float = 0.0
    estado: str = "MATCH_EXACTO"  # "MATCH_EXACTO", "DIFERENCIA_VALOR", "SOLO_EN_CERTIFICADOS", "SOLO_EN_EXOGENA"
    resolucion_usuario: str | None = None
    observaciones: str | None = None


class ReconciliationState(BaseModel):
    has_exogena: bool = False
    has_facturas_electronicas: bool = False
    archivo_exogena: str | None = None
    archivo_facturas: str | None = None
    total_susceptible_factura_elec: float = 0.0
    deduccion_1pct_factura_elec: float = 0.0
    total_partidas_exogena: int = 0
    total_conciliadas: int = 0
    total_discrepancias: int = 0
    porcentaje_match: float = 0.0
    items: list[ReconciliationItem] = Field(default_factory=list)
