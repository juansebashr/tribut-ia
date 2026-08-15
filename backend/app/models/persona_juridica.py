from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.common import AuditTraceItem


class PersonaJuridicaInput(BaseModel):
    tax_year: int = Field(2026, description="Año gravable para la declaración")
    custom_uvt: Optional[float] = Field(None, description="UVT personalizado")
    tarifa_personalizada: Optional[float] = Field(None, description="Tarifa de renta personalizada (ej: 0.20 para zona franca o 0.35 general)")
    
    # 1. Ingresos
    ingresos_brutos_operacionales: float = Field(0.0, description="Ingresos por actividad principal o venta de bienes/servicios")
    ingresos_brutos_no_operacionales: float = Field(0.0, description="Rendimientos financieros, dividendos, otros ingresos")
    devoluciones_rebajas_descuentos: float = Field(0.0, description="Devoluciones, rebajas y descuentos en ventas")
    ingresos_no_constitutivos_renta: float = Field(0.0, description="Ingresos no constitutivos de renta ni ganancia ocasional (ej. dividendos no gravados Art. 48/49)")
    
    # 2. Costos y Gastos Deducibles
    costos_procedentes: float = Field(0.0, description="Costo fiscal de ventas y prestación de servicios")
    gastos_administracion: float = Field(0.0, description="Gastos operacionales de administración")
    gastos_ventas: float = Field(0.0, description="Gastos operacionales de ventas y mercadeo")
    gastos_financieros: float = Field(0.0, description="Intereses y comisiones bancarias")
    
    # 3. Conciliación Contable-Fiscal
    gastos_no_deducibles: float = Field(0.0, description="Gastos sin soporte electrónico, sanciones, multas o intereses no deducibles")
    deducciones_especiales: float = Field(0.0, description="Otras deducciones con beneficio tributario (ej. primer empleo, I+D)")
    rentas_exentas: float = Field(0.0, description="Rentas exentas legales para personas jurídicas")
    compensacion_perdidas_fiscales: float = Field(0.0, description="Compensación de pérdidas fiscales de años anteriores (Art. 147 E.T.)")
    compensacion_exceso_renta_presuntiva: float = Field(0.0, description="Compensación de excesos de renta presuntiva de años anteriores")
    
    # 4. Tasa Mínima de Tributación (TTD - Art. 240 Parágrafo 6)
    utilidad_contable_antes_impuestos: float = Field(0.0, description="Utilidad comercial/contable antes de impuestos (necesaria para validar la TTD del 15%)")
    diferencias_permanentes_ttd: float = Field(0.0, description="Ajustes y partidas no gravadas de la utilidad para depuración de la TTD")
    
    # 5. Ganancia Ocasional y Descuentos
    ganancia_ocasional_gravable: float = Field(0.0, description="Utilidad gravable en venta de activos fijos poseídos > 2 años")
    descuento_tributario_ica: float = Field(0.0, description="Descuento del 50% del ICA efectivamente pagado (Art. 115 E.T.)")
    otros_descuentos_tributarios: float = Field(0.0, description="Donaciones a ESAL (Art. 257), impuestos pagados en el exterior (Art. 254)")
    
    # 6. Retenciones y Pagos Previos
    retenciones_en_la_fuente: float = Field(0.0, description="Retenciones que le practicaron clientes a la sociedad")
    autorretenciones_practicadas: float = Field(0.0, description="Autorretenciones especiales de renta practicadas")
    anticipo_ano_anterior: float = Field(0.0, description="Anticipo de renta liquidado en la declaración del año anterior")
    saldo_a_favor_ano_anterior: float = Field(0.0, description="Saldo a favor del año gravable anterior")


class PersonaJuridicaOutput(BaseModel):
    tax_year: int
    uvt_value: float
    
    # Ingresos y Renta Bruta
    ingresos_brutos_totales: float
    ingresos_netos: float
    renta_bruta: float
    
    # Gastos y Renta Líquida
    total_gastos_deducibles: float
    renta_liquida_ordinaria: float
    renta_liquida_gravable: float
    
    # Liquidación del Impuesto de Renta
    tarifa_renta_aplicada: float
    impuesto_basico_renta: float
    
    # Tasa de Tributación Depurada (TTD)
    ttd_calculada_pct: float
    aplica_impuesto_adicional_ttd: bool
    impuesto_adicional_ttd: float
    
    # Ganancias Ocasionales y Descuentos
    impuesto_ganancias_ocasionales: float
    total_descuentos_tributarios_aplicados: float
    impuesto_neto_total: float
    
    # Liquidación Privada
    total_retenciones_y_anticipos: float
    saldo_a_pagar: float
    saldo_a_favor: float
    
    # Trazabilidad
    audit_trace: List[AuditTraceItem]
    resumen_ejecutivo: str
