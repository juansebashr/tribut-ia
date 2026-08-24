from typing import Literal

from pydantic import BaseModel, Field

from app.models.common import AuditTraceItem


class ComparacionPatrimonialRequest(BaseModel):
    tax_year: int = Field(2026, description="Año gravable objeto de declaración")
    custom_uvt: float | None = Field(
        None, description="Valor personalizado de UVT (opcional, fallback a UVT oficial del año)"
    )

    # 1. Patrimonio
    patrimonio_liquido_ano_anterior: float = Field(
        0.0,
        ge=0.0,
        description="Patrimonio líquido fiscal declarado al 31 de diciembre del año gravable inmediatamente anterior",
    )
    patrimonio_bruto_ano_actual: float = Field(
        0.0,
        ge=0.0,
        description="Total patrimonio bruto fiscal al 31 de diciembre del año actual (inmuebles, cuentas, vehículos)",
    )
    deudas_ano_actual: float = Field(
        0.0,
        ge=0.0,
        description="Total pasivos y deudas respaldadas con documentos al 31 de diciembre del año actual",
    )

    # 2. Ajustes al Patrimonio (No requieren flujo de caja efectivo)
    reajustes_fiscales_activos_fijos: float = Field(
        0.0,
        ge=0.0,
        description="Reajustes fiscales aplicados a activos fijos (Art. 70 y 73 E.T.) que incrementan el patrimonio sin flujo de caja",
    )
    valorizaciones_nominales_o_revalorizaciones: float = Field(
        0.0,
        ge=0.0,
        description="Valorizaciones técnicas, sucesiones ilíquidas o revalorizaciones patrimoniales nominales",
    )
    desvalorizaciones_o_castigos_nominales: float = Field(
        0.0,
        ge=0.0,
        description="Castigo de cartera o desvalorizaciones que reducen el patrimonio sin salida de caja",
    )

    # 3. Rentas y Flujos Justificativos (Capacidad de Absorción y Capitalización)
    renta_liquida_ordinaria_cedula_general: float = Field(
        0.0,
        ge=0.0,
        description="Renta líquida ordinaria de la Cédula General (Trabajo, Capital y No Laborales)",
    )
    rentas_liquidas_pensiones_y_dividendos: float = Field(
        0.0,
        ge=0.0,
        description="Renta líquida gravable de pensiones y dividendos/participaciones",
    )
    rentas_exentas_totales: float = Field(
        0.0,
        ge=0.0,
        description="Total rentas exentas aceptadas (25% laboral, aportes voluntarios pensión/AFC, cesantías)",
    )
    ingresos_no_constitutivos_renta: float = Field(
        0.0,
        ge=0.0,
        description="Total ingresos no constitutivos de renta ni ganancia ocasional (INCRNGO: aportes obligatorios salud/pensión)",
    )
    ganancia_ocasional_neta: float = Field(
        0.0,
        ge=0.0,
        description="Ganancia ocasional neta percibida en el año (ingresos brutos por venta de activos/herencias menos costos y exenciones)",
    )
    ingresos_no_gravados_o_recibidos_exterior: float = Field(
        0.0,
        ge=0.0,
        description="Otros ingresos recibidos justificables (indemnizaciones por daño emergente, remesas familiares del exterior)",
    )
    nuevas_deudas_adquiridas_en_el_ano: float = Field(
        0.0,
        ge=0.0,
        description="Desembolsos netos de nuevos créditos hipotecarios, bancarios o de terceros contratados en el año",
    )
    desahorro_o_liquidacion_activos_anteriores: float = Field(
        0.0,
        ge=0.0,
        description="Liquidación de ahorros, cuentas bancarias, CDTs o venta de activos que ya estaban declarados en el año anterior",
    )

    # 4. Detracciones y Gastos (Disminuyen la Capacidad de Justificación)
    impuesto_renta_y_ganancia_ocasional_pagado: float = Field(
        0.0,
        ge=0.0,
        description="Total impuesto neto de renta y ganancia ocasional liquidado y pagado en el año",
    )
    retenciones_fuente_asumidas_en_el_ano: float = Field(
        0.0,
        ge=0.0,
        description="Retenciones en la fuente a título de renta efectivamente descontadas durante el año",
    )
    gastos_personales_y_consumo_estimado: float = Field(
        0.0,
        ge=0.0,
        description="Estimación razonable de gastos personales, alimentación, arriendos, viajes, educación y sostenimiento familiar",
    )
    perdidas_extraordinarias_no_deducibles: float = Field(
        0.0,
        ge=0.0,
        description="Pérdidas por fuerza mayor, siniestros no amparados o destrucciones de bienes",
    )


class ComparacionPatrimonialResponse(BaseModel):
    tax_year: int
    uvt_value: float

    # Variación Patrimonial
    patrimonio_liquido_ano_anterior: float
    patrimonio_bruto_ano_actual: float
    deudas_ano_actual: float
    patrimonio_liquido_ano_actual: float
    variacion_patrimonial_bruta: float
    ajustes_patrimoniales_netos: float
    incremento_patrimonial_a_justificar: float

    # Flujos Justificativos y Detracciones
    total_rentas_justificativas: float
    total_detracciones_consumos: float
    capacidad_justificacion_neta: float

    # Resultado de la Comparación
    diferencia_no_justificada: float
    existe_renta_por_comparacion_patrimonial: bool
    renta_liquida_gravable_adicional_cop: float
    renta_liquida_gravable_adicional_uvt: float
    impuesto_estimado_comparacion_patrimonial_cop: float
    estado_patrimonial: Literal["JUSTIFICADO_CORRECTAMENTE", "ALERTA_DESAJUSTE_PATRIMONIAL"]
    porcentaje_justificacion: float

    # Explicaciones y Trazabilidad Didáctica
    explicacion_didactica: str
    recomendaciones_defensa_dian: list[str]
    audit_trace: list[AuditTraceItem]
