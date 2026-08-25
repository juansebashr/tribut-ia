from pydantic import BaseModel, Field

from app.models.common import AuditTraceItem


class BienServicioIvaItem(BaseModel):
    id: str = Field(..., description="Identificador único")
    nombre: str = Field(..., description="Nombre del bien o servicio")
    categoria: str = Field(..., description="Categoría (Canasta Familiar, Salud, Tecnología, etc.)")
    tratamiento: str = Field(
        ..., description="Tratamiento: GRAVADO_19, GRAVADO_5, EXENTO_0, EXCLUIDO"
    )
    tarifa_pct: float = Field(..., description="Tarifa del impuesto (%)")
    articulo_et: str = Field(..., description="Artículo del Estatuto Tributario")
    derecho_devolucion_iva: bool = Field(
        False, description="¿Otorga derecho a devolución de IVA bimestral?"
    )
    descripcion_tecnica: str = Field("", description="Condiciones técnicas y requisitos")


class IvaProrrateoInput(BaseModel):
    tax_year: int = Field(2026, description="Año gravable")
    custom_uvt: float | None = Field(None, description="Valor UVT personalizado")
    ingresos_gravados_19: float = Field(
        0.0, description="Ventas e ingresos gravados a la tarifa general (19%)"
    )
    ingresos_gravados_5: float = Field(
        0.0, description="Ventas e ingresos gravados a la tarifa diferencial (5%)"
    )
    ingresos_exentos_0: float = Field(
        0.0,
        description="Ventas e ingresos exentos (tarifa 0% con derecho a descuento - Art. 477/479)",
    )
    ingresos_excluidos: float = Field(
        0.0,
        description="Ventas e ingresos excluidos (sin IVA ni derecho a descuento - Art. 424/476)",
    )
    ingresos_no_gravados: float = Field(
        0.0, description="Ingresos no constitutivos de hecho generador"
    )
    iva_comun_en_compras_gastos: float = Field(
        0.0, description="Total IVA pagado en costos y gastos comunes no imputables directamente"
    )


class IvaProrrateoOutput(BaseModel):
    tax_year: int
    total_ingresos_con_derecho: float  # Gravados 19 + Gravados 5 + Exentos 0
    total_ingresos_operacionales: float  # Con derecho + Excluidos
    factor_prorrateo_porcentaje: float  # (Con derecho / Total) * 100
    factor_prorrateo_decimal: float
    iva_comun_total: float
    iva_descontable_aceptado_f300: float
    iva_rechazado_mayor_costo_renta: float
    explicacion_didactica: str
    audit_trace: list[AuditTraceItem] = Field(default_factory=list)


class Formulario300Casillas(BaseModel):
    # Encabezado
    ano: int = Field(2026, description="1. Año")
    periodo: int = Field(1, description="2. Período (Bimestre 1-6 o Cuatrimestre 1-3)")
    tipo_periodicidad: str = Field("BIMESTRAL", description="BIMESTRAL o CUATRIMESTRAL")
    numero_formulario: str = Field("3009999999999", description="4. Número de formulario")
    nit: str = Field("900123456", description="5. NIT")
    dv: str = Field("7", description="6. DV")
    razon_social: str = Field(
        "EMPRESA COMERCIAL S.A.S.", description="11. Razón social / Nombre declarante"
    )
    cod_direccion_seccional: int = Field(32, description="12. Cód. Dirección seccional")
    actividad_economica: str = Field("4711", description="24. Actividad económica principal")

    # A. Ingresos / Operaciones Realizadas (Casillas 27 a 44)
    c27_ingresos_bienes_gravados_5: float = Field(
        0.0, description="27. Bienes gravados a la tarifa del 5%"
    )
    c28_ingresos_bienes_gravados_19: float = Field(
        0.0, description="28. Bienes gravados a la tarifa general (19%)"
    )
    c29_ingresos_servicios_gravados_5: float = Field(
        0.0, description="29. Servicios gravados a la tarifa del 5%"
    )
    c30_ingresos_servicios_gravados_19: float = Field(
        0.0, description="30. Servicios gravados a la tarifa general (19%)"
    )
    c34_operaciones_exentas_art477: float = Field(
        0.0, description="34. Operaciones exentas (Art. 477)"
    )
    c35_exportaciones_bienes: float = Field(0.0, description="35. Exportaciones de bienes")
    c36_exportaciones_servicios: float = Field(0.0, description="36. Exportaciones de servicios")
    c37_operaciones_excluidas: float = Field(
        0.0, description="37. Operaciones excluidas (Art. 424 y 476)"
    )
    c38_operaciones_no_gravadas: float = Field(0.0, description="38. Operaciones no gravadas")
    c41_total_ingresos_brutos: float = Field(0.0, description="41. Total ingresos brutos")
    c42_devoluciones_en_ventas: float = Field(
        0.0, description="42. Devoluciones en ventas anuladas o rescindidas"
    )
    c43_total_ingresos_netos: float = Field(0.0, description="43. Total ingresos netos")

    # B. Liquidación IVA Generado (Casillas 45 a 65)
    c45_iva_gravados_5: float = Field(0.0, description="45. A la tarifa del 5%")
    c46_iva_gravados_19: float = Field(0.0, description="46. A la tarifa general (19%)")
    c56_total_iva_generado_operaciones: float = Field(
        0.0, description="56. Total impuesto generado por operaciones gravadas"
    )
    c57_iva_devoluciones_en_compras: float = Field(
        0.0, description="57. IVA en devoluciones en compras"
    )
    c58_total_iva_generado: float = Field(0.0, description="58. Total IVA generado")

    # C. Compras e Importaciones (Casillas 66 a 80)
    c66_compras_bienes_gravados_5: float = Field(
        0.0, description="66. De bienes gravados a la tarifa del 5%"
    )
    c67_compras_bienes_gravados_19: float = Field(
        0.0, description="67. De bienes gravados a la tarifa general (19%)"
    )
    c68_servicios_gravados_5: float = Field(
        0.0, description="68. De servicios gravados a la tarifa del 5%"
    )
    c69_servicios_gravados_19: float = Field(
        0.0, description="69. De servicios gravados a la tarifa general (19%)"
    )
    c72_importaciones_gravadas_5: float = Field(0.0, description="72. Importaciones gravadas al 5%")
    c73_importaciones_gravadas_19: float = Field(
        0.0, description="73. Importaciones gravadas al 19%"
    )
    c74_compras_bienes_excluidos_exentos: float = Field(
        0.0, description="74. Compras de bienes excluidos y exentos"
    )
    c75_servicios_excluidos_exentos: float = Field(
        0.0, description="75. Compras de servicios excluidos y exentos"
    )
    c79_total_compras_importaciones_brutas: float = Field(
        0.0, description="79. Total compras e importaciones brutas"
    )
    c80_devoluciones_en_compras: float = Field(0.0, description="80. Devoluciones en compras")

    # D. Liquidación IVA Descontable (Casillas 81 a 97)
    c81_descontable_compras_5: float = Field(
        0.0, description="81. Por compras de bienes gravados al 5%"
    )
    c82_descontable_compras_19: float = Field(
        0.0, description="82. Por compras de bienes gravados al 19%"
    )
    c83_descontable_servicios_5: float = Field(0.0, description="83. Por servicios gravados al 5%")
    c84_descontable_servicios_19: float = Field(
        0.0, description="84. Por servicios gravados al 19%"
    )
    c87_descontable_importaciones_5: float = Field(0.0, description="87. Por importaciones al 5%")
    c88_descontable_importaciones_19: float = Field(0.0, description="88. Por importaciones al 19%")
    c90_descontable_iva_comun_prorrateado: float = Field(
        0.0, description="90. IVA común descontable prorrateado (Art. 490)"
    )
    c95_iva_devoluciones_en_ventas: float = Field(
        0.0, description="95. IVA en devoluciones en ventas"
    )
    c96_total_iva_descontable: float = Field(0.0, description="96. Total IVA descontable")

    # E. Control de Saldos y Liquidación Privada (Casillas 98 a 120)
    c98_saldo_a_pagar_periodo: float = Field(
        0.0, description="98. Saldo a pagar por el período fiscal"
    )
    c99_saldo_a_favor_periodo: float = Field(
        0.0, description="99. Saldo a favor por el período fiscal"
    )
    c100_saldo_a_favor_periodo_anterior: float = Field(
        0.0, description="100. Saldo a favor del período fiscal anterior"
    )
    c101_retenciones_iva_que_le_practicaron: float = Field(
        0.0, description="101. Retenciones en la fuente de IVA que le practicaron (ReteIVA 15%)"
    )
    c104_sanciones: float = Field(0.0, description="104. Sanciones")
    c105_total_saldo_a_pagar: float = Field(
        0.0, description="105. Total saldo a pagar por este período"
    )
    c106_total_saldo_a_favor: float = Field(
        0.0, description="106. Total saldo a favor por este período"
    )


class IvaF300Input(BaseModel):
    tax_year: int = Field(2026, description="Año gravable")
    custom_uvt: float | None = Field(None, description="Valor UVT personalizado")
    tipo_periodicidad: str = Field("BIMESTRAL", description="BIMESTRAL o CUATRIMESTRAL")
    periodo: int = Field(1, description="Número de período (1 a 6 bimestral, 1 a 3 cuatrimestral)")
    razon_social: str = Field("EMPRESA COMERCIAL S.A.S.", description="Razón social o nombre")
    nit: str = Field("900123456", description="NIT")
    dv: str = Field("7", description="Dígito de verificación")
    actividad_economica: str = Field("4711", description="Código CIIU principal")

    # Ingresos / Ventas
    ingresos_bienes_gravados_5: float = Field(0.0, description="Venta de bienes gravados al 5%")
    ingresos_bienes_gravados_19: float = Field(0.0, description="Venta de bienes gravados al 19%")
    ingresos_servicios_gravados_5: float = Field(
        0.0, description="Servicios prestados gravados al 5%"
    )
    ingresos_servicios_gravados_19: float = Field(
        0.0, description="Servicios prestados gravados al 19%"
    )
    operaciones_exentas_art477: float = Field(
        0.0, description="Ventas de bienes exentos (Art. 477)"
    )
    exportaciones_bienes: float = Field(0.0, description="Exportación de bienes (Art. 479)")
    exportaciones_servicios: float = Field(0.0, description="Exportación de servicios")
    operaciones_excluidas: float = Field(
        0.0, description="Ventas o servicios excluidos (Art. 424 y 476)"
    )
    operaciones_no_gravadas: float = Field(0.0, description="Ingresos no gravados")
    devoluciones_en_ventas: float = Field(
        0.0, description="Devoluciones en ventas anuladas del periodo"
    )

    # Compras e Importaciones
    compras_bienes_gravados_5: float = Field(
        0.0, description="Compras nacionales de bienes gravados al 5%"
    )
    compras_bienes_gravados_19: float = Field(
        0.0, description="Compras nacionales de bienes gravados al 19%"
    )
    servicios_gravados_5: float = Field(0.0, description="Servicios tomados gravados al 5%")
    servicios_gravados_19: float = Field(0.0, description="Servicios tomados gravados al 19%")
    importaciones_gravadas_5: float = Field(0.0, description="Importaciones gravadas al 5%")
    importaciones_gravadas_19: float = Field(0.0, description="Importaciones gravadas al 19%")
    compras_bienes_excluidos_exentos: float = Field(
        0.0, description="Compras de bienes excluidos y exentos"
    )
    servicios_excluidos_exentos: float = Field(0.0, description="Servicios excluidos y exentos")
    devoluciones_en_compras: float = Field(0.0, description="Devoluciones en compras realizadas")

    # Costos/Gastos comunes con IVA para prorrateo Art. 490
    iva_comun_sujeto_prorrateo: float = Field(
        0.0, description="IVA pagado en gastos comunes generales para prorratear"
    )

    # Liquidación y Saldos
    retenciones_iva_practicadas_a_favor: float = Field(
        0.0, description="ReteIVA que le practicaron clientes (15%)"
    )
    saldo_a_favor_periodo_anterior: float = Field(
        0.0, description="Saldo a favor del periodo anterior sin solicitar"
    )
    sanciones: float = Field(0.0, description="Sanciones por extemporaneidad o corrección")


class IvaF300Output(BaseModel):
    tax_year: int
    uvt_value: float
    tipo_periodicidad: str
    periodo: int
    periodo_nombre: str
    razon_social: str
    nit: str
    dv: str

    total_ingresos_brutos: float
    total_ingresos_netos: float
    total_iva_generado: float

    total_compras_brutas: float
    total_iva_descontable: float

    factor_prorrateo_art490_pct: float
    iva_comun_rechazado_renta: float

    saldo_periodo_a_pagar: float
    saldo_periodo_a_favor: float

    total_saldo_a_pagar: float
    total_saldo_a_favor: float

    casillas: Formulario300Casillas
    audit_trace: list[AuditTraceItem] = Field(default_factory=list)
    resumen_ejecutivo: str
