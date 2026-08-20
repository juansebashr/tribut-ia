from pydantic import BaseModel, Field


class TablaMarginalBracket(BaseModel):
    desde_uvt: float
    hasta_uvt: float
    tarifa: float
    uvt_adicional: float = 0.0


class DeduccionesRules(BaseModel):
    dependiente_general: dict = Field(
        default_factory=lambda: {"porcentaje_ingreso_laboral": 0.10, "tope_uvt": 384}
    )
    dependientes_adicionales_72uvt: dict = Field(
        default_factory=lambda: {"tope_uvt_por_dependiente": 72, "max_dependientes": 4}
    )
    medicina_prepagada: dict = Field(default_factory=lambda: {"tope_uvt_anual": 192})
    intereses_vivienda: dict = Field(default_factory=lambda: {"tope_uvt_anual": 1200})
    gmf: dict = Field(default_factory=lambda: {"porcentaje_deducible": 0.50})
    compras_factura_electronica_1pct: dict | None = Field(
        default_factory=lambda: {"porcentaje_compras": 0.01, "tope_uvt": 240}
    )


class RentasExentasRules(BaseModel):
    voluntarias_pension_afc: dict = Field(
        default_factory=lambda: {"porcentaje_max_ingreso": 0.30, "tope_uvt": 3800}
    )
    laboral_25: dict = Field(default_factory=lambda: {"porcentaje": 0.25, "tope_uvt": 790})


class GananciaOcasionalRules(BaseModel):
    tarifa_general: float = 0.15
    tarifa_loterias_rifas: float = 0.20
    exencion_vivienda_urbana_uvt: float = 3250  # Art. 307 Numeral 1
    exencion_inmueble_rural_uvt: float = 7700  # Art. 307 Numeral 2
    exencion_herencias_donaciones_porcentaje: float = 0.20
    exencion_herencias_donaciones_tope_uvt: float = 1625  # Art. 307 Numeral 4


class LimiteConjuntoRules(BaseModel):
    porcentaje_max_ingreso_neto: float = 0.40
    tope_uvt: float = 1340


class CedulaGeneralRules(BaseModel):
    limite_conjunto_rentas_exentas_deducciones: LimiteConjuntoRules
    deducciones: DeduccionesRules
    rentas_exentas: RentasExentasRules
    tabla_marginal_art241: list[TablaMarginalBracket]


class PersonaNaturalRules(BaseModel):
    cedula_general: CedulaGeneralRules
    ganancias_ocasionales: GananciaOcasionalRules = Field(default_factory=GananciaOcasionalRules)


class TasaMinimaRules(BaseModel):
    aplica: bool = True
    tarifa_minima: float = 0.15


class DescuentosPJRules(BaseModel):
    ica_descuento_porcentaje: float = 0.50
    donaciones_porcentaje: float = 0.25


class PersonaJuridicaRules(BaseModel):
    tarifa_general: float = 0.35
    ganancia_ocasional: float = 0.15
    tasa_minima_ttd: TasaMinimaRules = Field(default_factory=TasaMinimaRules)
    descuentos: DescuentosPJRules = Field(default_factory=DescuentosPJRules)


class BeneficioAuditoriaRules(BaseModel):
    aplica: bool = True
    incremento_6_meses_pct: float = 0.35
    incremento_12_meses_pct: float = 0.25
    impuesto_minimo_uvt: float = 71


class TaxYearRules(BaseModel):
    tax_year: int
    uvt_value: float
    description: str | None = None
    persona_natural: PersonaNaturalRules
    persona_juridica: PersonaJuridicaRules
    beneficio_auditoria: BeneficioAuditoriaRules = Field(default_factory=BeneficioAuditoriaRules)
