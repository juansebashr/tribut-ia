from typing import List, Optional, Any
from pydantic import BaseModel, Field


class AuditTraceItem(BaseModel):
    step_id: str = Field(..., description="Identificador único del paso (ej: 'deduccion_dependientes')")
    title: str = Field(..., description="Nombre amigable del paso")
    statutory_reference: Optional[str] = Field(None, description="Artículo del Estatuto Tributario o norma aplicable")
    raw_input_cop: Optional[float] = Field(0.0, description="Valor bruto ingresado por el usuario en COP")
    calculated_cop: float = Field(..., description="Valor calculado según fórmula legal en COP")
    limit_cop: Optional[float] = Field(None, description="Tope máximo permitido en COP")
    limit_uvt: Optional[float] = Field(None, description="Tope máximo permitido en UVT")
    excess_rejected_cop: Optional[float] = Field(0.0, description="Valor que superó el tope y fue rechazado/no procedente")
    final_allowed_cop: float = Field(..., description="Valor final aceptado y computable en la depuración")
    notes: Optional[str] = Field(None, description="Explicación detallada del cálculo o condición legal")


class UvtConversionRequest(BaseModel):
    tax_year: int = Field(2026, description="Año gravable")
    custom_uvt: Optional[float] = Field(None, description="UVT personalizado opcional")
    amount_cop: Optional[float] = Field(None, description="Monto en pesos colombianos para convertir a UVT")
    amount_uvt: Optional[float] = Field(None, description="Monto en UVT para convertir a COP")


class UvtConversionResponse(BaseModel):
    tax_year: int
    uvt_value: float
    amount_cop: float
    amount_uvt: float
