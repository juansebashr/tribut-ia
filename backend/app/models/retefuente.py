from pydantic import BaseModel, Field

from app.models.common import AuditTraceItem


class TablaRetefuenteItem(BaseModel):
    id: str = Field(..., description="Identificador único del concepto")
    concepto: str = Field(..., description="Nombre descriptivo del concepto de retención")
    categoria: str = Field(..., description="Categoría (Compras, Servicios, Honorarios, etc.)")
    base_minima_uvt: float = Field(0.0, description="Base mínima en UVT")
    base_minima_cop: float = Field(0.0, description="Base mínima calculada en pesos COP")
    tarifa_declarante: float = Field(..., description="Tarifa aplicable a declarantes (%)")
    tarifa_no_declarante: float = Field(..., description="Tarifa aplicable a no declarantes (%)")
    articulo_et: str = Field(
        ..., description="Artículo del Estatuto Tributario o norma reglamentaria"
    )
    observaciones: str = Field("", description="Notas técnicas o requisitos especiales")


class RetefuenteLaboralInput(BaseModel):
    tax_year: int = Field(2026, description="Año gravable")
    custom_uvt: float | None = Field(None, description="Valor UVT personalizado")
    mes_nombre: str = Field("Enero", description="Mes a liquidar")
    salario_basico: float = Field(0.0, description="Salario básico o asignación mensual")
    comisiones_horas_extras: float = Field(
        0.0, description="Comisiones, horas extras, recargos y bonificaciones gravadas"
    )
    viaticos_gravados: float = Field(0.0, description="Viáticos constitutivos de salario")
    otros_pagos_laborales: float = Field(
        0.0, description="Otros pagos o beneficios laborales en dinero o en especie"
    )
    # Aportes obligatorios (INCRGO)
    aporte_salud_obligatorio: float = Field(
        0.0, description="Aporte a salud del trabajador (4% o calculado)"
    )
    aporte_pension_obligatorio: float = Field(
        0.0, description="Aporte a pensión del trabajador (4% o calculado)"
    )
    fondo_solidaridad_pensional: float = Field(
        0.0, description="Fondo de Solidaridad Pensional (1% a 2%)"
    )
    # Deducciones mensuales permitidas (Art. 387 y 336 E.T.)
    intereses_vivienda_mes: float = Field(
        0.0,
        description="Intereses crédito de vivienda o leasing habitacional mensual (máx 100 UVT)",
    )
    medicina_prepagada_mes: float = Field(
        0.0, description="Pagos de salud prepagada / seguros médicos (máx 16 UVT)"
    )
    aplica_dependiente_10pct: bool = Field(
        False,
        description="Deducción por dependientes económicos (10% del ingreso bruto laboral, máx 32 UVT)",
    )
    numero_dependientes_adicionales_72uvt: int = Field(
        0,
        description="Número de dependientes adicionales (máx 4, 6 UVT mensuales cada uno según Ley 2277)",
    )
    # Rentas exentas mensuales
    aportes_voluntarios_pension_afc: float = Field(
        0.0, description="Aportes voluntarios a pensiones o cuentas AFC del mes"
    )
    otras_rentas_exentas: float = Field(0.0, description="Otras rentas exentas autorizadas por ley")
    solicitar_25pct_exenta_laboral: bool = Field(
        True,
        description="Calcular la renta exenta laboral del 25% (Art. 206 Num. 10, máx 65.83 UVT/mes)",
    )


class RetefuenteLaboralOutput(BaseModel):
    tax_year: int
    uvt_value: float
    mes_nombre: str
    total_ingresos_brutos_laborales: float
    total_incrngo_seguridad_social: float
    ingreso_laboral_neto: float
    total_deducciones_solicitadas: float
    total_deducciones_aceptadas: float
    total_rentas_exentas_previas: float
    renta_exenta_laboral_25_aceptada: float
    total_rentas_exentas_aceptadas: float
    subtotal_alivios_antes_limite: float
    limite_conjunto_40pct_cop: float
    limite_conjunto_uvt_cop: float  # 111.67 UVT mensual (1.340 / 12)
    limite_conjunto_aplicable_cop: float
    total_alivios_procedentes: float
    alivios_rechazados_por_limite: float
    base_gravable_depurada_cop: float
    base_gravable_depurada_uvt: float
    rango_tabla_art383: str
    tarifa_marginal_aplicada_pct: float
    retencion_fuente_pesos: float
    porcentaje_efectivo_retencion: float
    audit_trace: list[AuditTraceItem] = Field(default_factory=list)


class Formulario350Casillas(BaseModel):
    # Encabezado
    ano: int = Field(2026, description="1. Año")
    periodo_mes: int = Field(1, description="2. Período (Mes 1 a 12)")
    numero_formulario: str = Field("3509999999999", description="4. Número de formulario")
    nit: str = Field("900123456", description="5. NIT")
    dv: str = Field("7", description="6. DV")
    razon_social: str = Field(
        "EMPRESA EJEMPLO S.A.S.", description="11. Razón social / Nombre del agente retenedor"
    )
    cod_direccion_seccional: int = Field(32, description="12. Cód. Dirección seccional")

    # A. Retenciones a título de Renta - Bases (Casillas 28 a 41)
    c28_base_rentas_trabajo: float = Field(
        0.0, description="28. Base pagos o abonos por rentas de trabajo"
    )
    c29_base_honorarios: float = Field(0.0, description="29. Base honorarios")
    c30_base_comisiones: float = Field(0.0, description="30. Base comisiones")
    c31_base_servicios: float = Field(0.0, description="31. Base servicios")
    c32_base_arrendamientos: float = Field(0.0, description="32. Base arrendamientos")
    c33_base_rendimientos_financieros: float = Field(
        0.0, description="33. Base rendimientos financieros e intereses"
    )
    c34_base_enajenacion_activos_fijos: float = Field(
        0.0, description="34. Base enajenación activos fijos"
    )
    c35_base_compras: float = Field(0.0, description="35. Base compras")
    c36_base_otros_pagos_sujetos: float = Field(
        0.0, description="36. Base otros pagos o abonos en cuenta"
    )
    c37_base_pagos_exterior_renta: float = Field(
        0.0, description="37. Base pagos al exterior a título de renta"
    )
    c41_total_bases_renta: float = Field(
        0.0, description="41. Total bases de retención a título de renta"
    )

    # B. Retenciones a título de Renta - Retenciones practicadas (Casillas 42 a 60)
    c42_ret_rentas_trabajo: float = Field(0.0, description="42. Retención por rentas de trabajo")
    c43_ret_honorarios: float = Field(0.0, description="43. Retención por honorarios")
    c44_ret_comisiones: float = Field(0.0, description="44. Retención por comisiones")
    c45_ret_servicios: float = Field(0.0, description="45. Retención por servicios")
    c46_ret_arrendamientos: float = Field(0.0, description="46. Retención por arrendamientos")
    c47_ret_rendimientos_financieros: float = Field(
        0.0, description="47. Retención por rendimientos financieros"
    )
    c48_ret_enajenacion_activos_fijos: float = Field(
        0.0, description="48. Retención por enajenación activos fijos"
    )
    c49_ret_compras: float = Field(0.0, description="49. Retención por compras")
    c50_ret_otros_pagos_sujetos: float = Field(0.0, description="50. Retención por otros pagos")
    c51_ret_pagos_exterior_renta: float = Field(
        0.0, description="51. Retención pagos al exterior renta"
    )
    c59_total_retenciones_renta_practicadas: float = Field(
        0.0, description="59. Total retenciones de renta practicadas"
    )

    # C. Autorretenciones a título de Renta (Casillas 61 a 66)
    c61_base_autorretencion_especial: float = Field(
        0.0, description="61. Base autorretención especial D. 2201/2016"
    )
    c62_autorretencion_especial_decreto_2201: float = Field(
        0.0, description="62. Autorretención especial D. 2201/2016"
    )
    c63_base_otras_autorretenciones: float = Field(
        0.0, description="63. Base otras autorretenciones"
    )
    c64_otras_autorretenciones: float = Field(0.0, description="64. Otras autorretenciones")
    c65_total_autorretenciones_renta: float = Field(
        0.0, description="65. Total autorretenciones a título de renta"
    )

    # D. Retenciones a título de IVA (Casillas 67 a 75)
    c67_base_iva_responsables: float = Field(0.0, description="67. Base operaciones ReteIVA")
    c68_retencion_iva_practicada: float = Field(
        0.0, description="68. Retención de IVA practicada (15% Art. 437-1)"
    )
    c69_retencion_iva_prestadores_exterior: float = Field(
        0.0, description="69. Retención IVA prestadores de servicios exterior"
    )
    c74_total_retenciones_iva: float = Field(
        0.0, description="74. Total retenciones a título de IVA"
    )

    # E. Retenciones de Timbre (Casillas 76 a 81)
    c76_base_timbre_nacional: float = Field(0.0, description="76. Base impuesto de timbre nacional")
    c77_retencion_timbre: float = Field(
        0.0, description="77. Retención a título de impuesto de timbre"
    )

    # F. Totales y Liquidación (Casillas 82 a 88)
    c82_total_retenciones_periodo: float = Field(
        0.0, description="82. Total retenciones del período"
    )
    c83_sanciones: float = Field(0.0, description="83. Total sanciones")
    c84_total_saldo_a_pagar: float = Field(0.0, description="84. Total saldo a pagar")


class RetefuenteF350Input(BaseModel):
    tax_year: int = Field(2026, description="Año gravable")
    custom_uvt: float | None = Field(None, description="Valor UVT personalizado")
    periodo_mes: int = Field(1, description="Período mensual (1=Enero a 12=Diciembre)")
    razon_social: str = Field(
        "EMPRESA EJEMPLO S.A.S.", description="Nombre o razón social del agente retenedor"
    )
    nit: str = Field("900123456", description="NIT")
    dv: str = Field("7", description="Dígito de verificación")

    # Bases ingresadas por concepto
    base_rentas_trabajo: float = Field(0.0, description="Base gravable total nómina del mes")
    retencion_rentas_trabajo: float = Field(
        0.0, description="Valor total retenido por rentas de trabajo (Art. 383)"
    )

    base_honorarios_declarante: float = Field(0.0, description="Base honorarios declarantes (11%)")
    base_honorarios_no_declarante: float = Field(
        0.0, description="Base honorarios no declarantes (10%)"
    )

    base_comisiones_declarante: float = Field(0.0, description="Base comisiones declarantes (11%)")
    base_comisiones_no_declarante: float = Field(
        0.0, description="Base comisiones no declarantes (10%)"
    )

    base_servicios_declarante: float = Field(
        0.0, description="Base servicios generales declarantes (4%)"
    )
    base_servicios_no_declarante: float = Field(
        0.0, description="Base servicios no declarantes (6%)"
    )
    base_servicios_transporte_carga: float = Field(
        0.0, description="Base servicios transporte carga (1%)"
    )

    base_compras_declarante: float = Field(0.0, description="Base compras declarantes (2.5%)")
    base_compras_no_declarante: float = Field(0.0, description="Base compras no declarantes (3.5%)")

    base_arrendamiento_inmuebles: float = Field(
        0.0, description="Base arrendamiento inmuebles (3.5%)"
    )
    base_arrendamiento_muebles: float = Field(
        0.0, description="Base arrendamiento maquinaria/muebles (4%)"
    )

    base_rendimientos_financieros: float = Field(
        0.0, description="Base intereses y rendimientos financieros (7%)"
    )
    base_enajenacion_activos_fijos: float = Field(
        0.0, description="Base venta activos fijos ante notario (1%)"
    )

    base_pagos_exterior_servicios: float = Field(
        0.0, description="Base pagos al exterior servicios/software (20%)"
    )
    base_pagos_exterior_paraisos: float = Field(
        0.0, description="Base pagos al exterior paraísos fiscales (35%)"
    )

    # Autorretenciones
    ingresos_brutos_propios_mes: float = Field(
        0.0, description="Ingresos brutos operacionales propios para autorretención"
    )
    tarifa_autorretencion_especial_pct: float = Field(
        0.55, description="Tarifa CIIU autorretención especial D. 2201 (%)"
    )
    otras_autorretenciones_valor: float = Field(
        0.0, description="Otras autorretenciones practicadas"
    )

    # Retención de IVA (ReteIVA 15%)
    base_iva_sujeto_reteiva: float = Field(
        0.0, description="Valor del IVA sobre compras gravadas donde es agente retenedor"
    )
    reteiva_servicios_exterior: float = Field(
        0.0, description="Retención IVA por servicios prestados desde el exterior"
    )

    # Timbre
    base_impuesto_timbre: float = Field(
        0.0, description="Base para retención de timbre (inmuebles > 20.000 UVT)"
    )
    tarifa_timbre_pct: float = Field(0.0, description="Tarifa timbre (1.5% o 3.0%)")

    # Sanciones
    sanciones: float = Field(0.0, description="Sanciones por extemporaneidad o corrección")


class RetefuenteF350Output(BaseModel):
    tax_year: int
    uvt_value: float
    periodo_mes: int
    periodo_nombre: str
    razon_social: str
    nit: str
    dv: str

    total_bases_renta: float
    total_retenciones_renta_practicadas: float
    total_autorretenciones_renta: float
    total_retenciones_iva_practicadas: float
    total_retenciones_timbre: float

    total_retenciones_periodo: float
    sanciones: float
    total_a_pagar: float

    casillas: Formulario350Casillas
    audit_trace: list[AuditTraceItem] = Field(default_factory=list)
    resumen_ejecutivo: str
