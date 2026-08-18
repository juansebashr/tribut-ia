from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from app.models.common import AuditTraceItem


class PersonaNaturalInput(BaseModel):
    tax_year: int = Field(2026, description="Año gravable para la liquidación (ej. 2022, 2024, 2025, 2026)")
    custom_uvt: Optional[float] = Field(None, description="Valor personalizado de la UVT en caso de querer simular un escenario específico")
    
    # 0. Patrimonio (Casillas 30, 31, 32)
    patrimonio_bruto: float = Field(0.0, description="Total patrimonio bruto a 31 de diciembre (bienes, cuentas, vehículos, inmuebles)")
    deudas: float = Field(0.0, description="Total deudas a 31 de diciembre (créditos, tarjetas, hipotecas)")

    # 1. Ingresos Brutos de Trabajo / Cédula General (Casilla 33)
    rentas_trabajo: float = Field(0.0, description="Salarios, honorarios, comisiones, primas, cesantías pagadas directamente")
    viaticos: float = Field(0.0, description="Viáticos gravados")
    otros_ingresos_brutos: float = Field(0.0, description="Otros ingresos brutos de la cédula general")
    rentas_capital: float = Field(0.0, description="Rentas de capital (intereses, rendimientos, arriendos - Casilla 58)")
    incrngo_capital: float = Field(0.0, description="INCRNGO rentas de capital (componente inflacionario - Casilla 59)")
    rentas_nolaborales: float = Field(0.0, description="Rentas no laborales (comercio, servicios independientes sin relación laboral - Casilla 74)")
    incrngo_nolaborales: float = Field(0.0, description="INCRNGO rentas no laborales (daño emergente, PILA - Casilla 76)")
    costos_nolaborales: float = Field(0.0, description="Costos y deducciones procedentes no laborales (Casilla 77)")
    
    # 2. INCRNGO (Casilla 34)
    aporte_salud_obligatorio: float = Field(0.0, description="Aporte obligatorio a salud (EPS / FOSYGA / ADRES)")
    aporte_pension_obligatorio: float = Field(0.0, description="Aporte obligatorio a pensión y Fondo de Solidaridad Pensional (FSP)")
    otros_incrngo: float = Field(0.0, description="Otros ingresos no constitutivos de renta ni ganancia ocasional")
    
    # 3. Deducciones Imputables (Alivios Tributarios)
    aplica_dependiente_general: bool = Field(False, description="Deducción del 10% del ingreso laboral hasta 384 UVT por dependiente económico (Art. 387 E.T.)")
    numero_dependientes_adicionales_72uvt: int = Field(0, ge=0, le=4, description="Número de dependientes adicionales (hasta 4) de 72 UVT c/u (Art. 336 Numeral 2)")
    medicina_prepagada_anual: float = Field(0.0, description="Pagos anuales por planes adicionales de salud y medicina prepagada (hasta 192 UVT)")
    intereses_vivienda_anual: float = Field(0.0, description="Intereses pagados por crédito de vivienda o leasing habitacional (hasta 1.200 UVT)")
    gmf_4x1000_total: float = Field(0.0, description="Total pagado de Gravamen a Movimientos Financieros (50% deducible)")
    compras_factura_electronica: float = Field(0.0, description="Total compras personales soportadas con Factura Electrónica (1% deducible hasta 240 UVT)")
    
    # 4. Rentas Exentas
    aportes_voluntarios_pension_afc: float = Field(0.0, description="Aportes a fondos de pensiones voluntarias o cuentas AFC (hasta 30% ingreso bruto / 3.800 UVT)")
    otras_rentas_exentas: float = Field(0.0, description="Otras rentas exentas legalmente procedentes (cesantías, etc.)")
    
    # 5. Ganancias Ocasionales (Casillas 104 a 107)
    ganancias_ocasionales_brutas_activos_fijos: float = Field(0.0, description="Ingresos brutos por venta de activos fijos poseídos 2 años o más (inmuebles, vehículos)")
    ganancias_ocasionales_brutas_herencias: float = Field(0.0, description="Ingresos por herencias, legados, donaciones o porción conyugal")
    ganancias_ocasionales_brutas_loterias: float = Field(0.0, description="Premios por loterías, rifas, apuestas y similares (tarifa 20%)")
    costos_ganancia_ocasional: float = Field(0.0, description="Costo fiscal de los activos fijos enajenados")
    ganancias_ocasionales_exentas_solicitadas: float = Field(0.0, description="Exenciones solicitadas de ganancia ocasional (primeras 3.250 UVT vivienda urbana del causante, etc. Art. 307)")

    # 6. Liquidación Final y Pagos Previos
    descuentos_tributarios: float = Field(0.0, description="Descuentos tributarios procedentes (donaciones, impuestos exterior)")
    retenciones_fuente_practicadas: float = Field(0.0, description="Retenciones en la fuente a título de renta que le fueron practicadas durante el año")
    anticipo_ano_anterior: float = Field(0.0, description="Anticipo de renta liquidado en la declaración del año anterior")
    saldo_a_favor_ano_anterior: float = Field(0.0, description="Saldo a favor del año anterior sin solicitud de devolución o compensación")


class PersonaNaturalOutput(BaseModel):
    tax_year: int
    uvt_value: float
    
    # 0. Patrimonio
    patrimonio_bruto: float
    deudas: float
    patrimonio_liquido: float

    # 1. Resumen de Depuración Cédula General
    total_ingresos_brutos: float
    total_incrngo: float
    ingreso_neto: float
    
    # Deducciones y Exenciones
    total_deducciones_solicitadas: float
    total_deducciones_aceptadas: float
    total_rentas_exentas_previas: float
    renta_exenta_laboral_25: float
    total_rentas_exentas_aceptadas: float
    
    # Límite Conjunto (Art. 336 E.T.)
    subtotal_alivios_antes_de_limite: float
    limite_conjunto_porcentaje_cop: float
    limite_conjunto_uvt_cop: float
    limite_conjunto_aplicable_cop: float
    alivios_procedentes_finales: float
    alivios_rechazados_por_limite: float
    
    # Base Gravable e Impuesto de Renta Cédula General
    renta_liquida_gravable: float
    renta_liquida_gravable_uvt: float
    tarifa_marginal_maxima: float
    impuesto_bruto_renta: float
    descuentos_tributarios: float
    impuesto_neto_renta: float
    
    # Ganancias Ocasionales
    total_ganancias_ocasionales_brutas: float
    costos_ganancia_ocasional: float
    ganancias_ocasionales_exentas_aceptadas: float
    ganancia_ocasional_gravable: float
    impuesto_ganancias_ocasionales: float

    # Total Impuesto a Cargo y Liquidación Privada
    total_impuesto_a_cargo: float  # Impuesto Neto Renta + Impuesto Ganancias Ocasionales
    total_anticipos_y_retenciones: float
    saldo_a_pagar: float
    saldo_a_favor: float
    
    # Mapeo Oficial Casillas Formulario 210 DIAN
    form_210_casillas: Dict[str, float]

    # Trazabilidad Detallada para Contadores y Agentes AI
    audit_trace: List[AuditTraceItem]
    resumen_ejecutivo: str
