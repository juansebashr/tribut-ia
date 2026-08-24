from pydantic import BaseModel, Field

from app.models.common import AuditTraceItem


class Formulario260Casillas(BaseModel):
    # Cabecera y datos generales
    ano: int = Field(2025, description="1. Año gravable")
    fraccion_ano_siguiente: bool = Field(False, description="171. Fracción año gravable siguiente")
    numero_formulario: str = Field("2609999999999", description="4. Número de formulario")
    nit: str = Field("900987654", description="5. NIT")
    dv: str = Field("3", description="6. DV")
    primer_apellido: str = Field("", description="7. Primer apellido")
    segundo_apellido: str = Field("", description="8. Segundo apellido")
    primer_nombre: str = Field("", description="9. Primer nombre")
    otros_nombres: str = Field("", description="10. Otros nombres")
    razon_social: str = Field("CONTRIBUYENTE SIMPLE S.A.S.", description="11. Razón social")
    cod_direccion_seccional: int = Field(32, description="12. Cód. Dirección seccional")
    actividad_economica: str = Field("4711", description="24. Actividad económica")
    tarifa_simple_consolidada: float = Field(0.0, description="27. Tarifa SIMPLE consolidada (%)")

    # Patrimonio (28 a 30)
    c28_patrimonio_bruto: float = Field(0.0, description="28. Total patrimonio bruto")
    c29_pasivos: float = Field(0.0, description="29. Pasivos en el país y en el exterior")
    c30_patrimonio_liquido: float = Field(0.0, description="30. Total patrimonio líquido")

    # Ingresos brutos por grupos (31 a 42)
    c31_ingresos_grupo1_pais: float = Field(0.0, description="31. Grupo 1 Ingresos país")
    c32_ingresos_grupo1_exterior: float = Field(0.0, description="32. Grupo 1 Ingresos exterior")
    c33_ingresos_grupo2_pais: float = Field(0.0, description="33. Grupo 2 Ingresos país")
    c34_ingresos_grupo2_exterior: float = Field(0.0, description="34. Grupo 2 Ingresos exterior")
    c35_ingresos_grupo3_pais: float = Field(0.0, description="35. Grupo 3 Ingresos país")
    c36_ingresos_grupo3_exterior: float = Field(0.0, description="36. Grupo 3 Ingresos exterior")
    c37_ingresos_grupo4_pais: float = Field(0.0, description="37. Grupo 4 Ingresos país")
    c38_ingresos_grupo4_exterior: float = Field(0.0, description="38. Grupo 4 Ingresos exterior")
    c39_ingresos_grupo5_pais: float = Field(0.0, description="39. Grupo 5 Ingresos país")
    c40_ingresos_grupo5_exterior: float = Field(0.0, description="40. Grupo 5 Ingresos exterior")
    c41_ingresos_grupo6_pais: float = Field(0.0, description="41. Grupo 6 Ingresos país")
    c42_ingresos_grupo6_exterior: float = Field(0.0, description="42. Grupo 6 Ingresos exterior")

    # Total ingresos y liquidación SIMPLE (43 a 64)
    c43_total_ingresos_brutos_sin_go: float = Field(
        0.0, description="43. Total ingresos brutos sin incluir ganancias ocasionales"
    )
    c44_ingresos_no_constitutivos_renta: float = Field(
        0.0, description="44. Ingresos no constitutivos de renta"
    )
    c45_total_ingresos_gravables: float = Field(0.0, description="45. Total ingresos gravables")
    c46_impuesto_simple: float = Field(0.0, description="46. Impuesto SIMPLE")
    c47_componente_ica_territorial: float = Field(
        0.0, description="47. Componente ICA territorial anual"
    )
    c48_valor_componente_simple_nacional: float = Field(
        0.0, description="48. Valor componente SIMPLE nacional"
    )

    # Descuentos (49 a 52)
    c49_descuento_aportes_pension_empleador: float = Field(
        0.0, description="49. Aportes al Sistema General de Pensiones a cargo del empleador"
    )
    c50_descuento_ventas_medios_electronicos: float = Field(
        0.0, description="50. 0.5% ingresos por ventas y servicios con medios de pagos electrónicos"
    )
    c51_descuento_gmf: float = Field(0.0, description="51. Gravamen a los movimientos financieros")
    c52_total_descuentos: float = Field(0.0, description="52. Total descuentos")

    # Impuesto neto y saldos SIMPLE (53 a 64)
    c53_impuesto_neto_simple: float = Field(0.0, description="53. Impuesto neto SIMPLE")
    c54_retenciones_antes_pertenecer_simple: float = Field(
        0.0, description="54. Retenciones y autorretenciones antes de pertenecer al SIMPLE"
    )
    c55_anticipo_renta_ano_anterior: float = Field(
        0.0, description="55. Anticipo de renta liquidado año gravable anterior"
    )
    c56_anticipos_simple_efectivamente_pagados: float = Field(
        0.0, description="56. Anticipos impuesto SIMPLE efectivamente pagados"
    )
    c57_saldo_favor_simple_ano_anterior: float = Field(
        0.0, description="57. Saldo a favor por impuesto SIMPLE año anterior"
    )
    c58_saldo_a_pagar_impuesto_simple: float = Field(
        0.0, description="58. Saldo a pagar por impuesto SIMPLE"
    )
    c59_sancion_extemporaneidad_simple: float = Field(
        0.0, description="59. Sanción extemporaneidad SIMPLE"
    )
    c60_sancion_correccion_simple: float = Field(0.0, description="60. Sanción corrección SIMPLE")
    c61_otras_sanciones_simple: float = Field(0.0, description="61. Otras sanciones SIMPLE")
    c62_total_sanciones_simple: float = Field(
        0.0, description="62. Total sanciones por impuesto SIMPLE"
    )
    c63_total_saldo_a_pagar_simple: float = Field(
        0.0, description="63. Total saldo a pagar por impuesto SIMPLE"
    )
    c64_total_saldo_a_favor_simple: float = Field(
        0.0, description="64. Total saldo a favor por impuesto SIMPLE"
    )

    # Sanciones ICA territorial (65 a 68)
    c65_sancion_extemporaneidad_ica: float = Field(
        0.0, description="65. Por extemporaneidad por ICA territorial anual"
    )
    c66_sancion_correccion_ica: float = Field(
        0.0, description="66. Por corrección por ICA territorial anual"
    )
    c67_otras_sanciones_ica: float = Field(
        0.0, description="67. Otras sanciones ICA territorial anual"
    )
    c68_total_sanciones_ica: float = Field(
        0.0, description="68. Total sanciones ICA territorial anual"
    )

    # Liquidación Impuesto Nacional al Consumo de Comidas y Bebidas (69 a 79)
    c69_ingresos_gravados_inc: float = Field(
        0.0, description="69. Ingresos gravados con impuesto nacional al consumo"
    )
    c70_impuesto_nacional_consumo: float = Field(
        0.0, description="70. Impuesto nacional al consumo (8%)"
    )
    c71_inc_efectivamente_pagado_anticipos: float = Field(
        0.0, description="71. INC efectivamente pagado en anticipos"
    )
    c72_saldo_favor_inc_ano_anterior: float = Field(
        0.0, description="72. Saldo a favor INC declaración año anterior"
    )
    c73_saldo_a_pagar_inc: float = Field(
        0.0, description="73. Saldo a pagar por impuesto nacional al consumo"
    )
    c74_sancion_extemporaneidad_inc: float = Field(0.0, description="74. Por extemporaneidad INC")
    c75_sancion_correccion_inc: float = Field(0.0, description="75. Por corrección INC")
    c76_otras_sanciones_inc: float = Field(0.0, description="76. Otras sanciones INC")
    c77_total_sanciones_inc: float = Field(
        0.0, description="77. Total sanciones por impuesto al consumo"
    )
    c78_total_saldo_a_pagar_inc: float = Field(0.0, description="78. Total saldo a pagar por INC")
    c79_total_saldo_a_favor_inc: float = Field(0.0, description="79. Total saldo a favor por INC")

    # Liquidación Ganancia Ocasional (80 a 95)
    c80_ingresos_ganancias_ocasionales: float = Field(
        0.0, description="80. Ingresos por ganancias ocasionales país y exterior"
    )
    c81_costos_ganancias_ocasionales: float = Field(
        0.0, description="81. Costos por ganancias ocasionales"
    )
    c82_ganancias_ocasionales_exentas: float = Field(
        0.0, description="82. Ganancias ocasionales no gravadas y exentas"
    )
    c83_ganancias_ocasionales_gravables: float = Field(
        0.0, description="83. Ganancias ocasionales gravables"
    )
    c84_impuesto_ganancias_ocasionales: float = Field(
        0.0, description="84. Impuesto de ganancias ocasionales (15%)"
    )
    c85_descuento_impuestos_exterior_go: float = Field(
        0.0, description="85. Descuento por impuestos pagados exterior GO"
    )
    c86_impuesto_neto_ganancias_ocasionales: float = Field(
        0.0, description="86. Impuesto neto de ganancias ocasionales"
    )
    c87_saldo_favor_go_ano_anterior: float = Field(
        0.0, description="87. Saldo a favor por GO año anterior"
    )
    c88_retenciones_ganancias_ocasionales: float = Field(
        0.0, description="88. Retenciones sobre ganancia ocasional practicadas"
    )
    c89_saldo_a_pagar_go: float = Field(
        0.0, description="89. Saldo a pagar por impuesto de ganancias ocasionales"
    )
    c90_sancion_extemporaneidad_go: float = Field(0.0, description="90. Por extemporaneidad GO")
    c91_sancion_correccion_go: float = Field(0.0, description="91. Por corrección GO")
    c92_otras_sanciones_go: float = Field(0.0, description="92. Otras sanciones GO")
    c93_total_sanciones_go: float = Field(0.0, description="93. Total sanciones por impuesto GO")
    c94_total_saldo_a_pagar_go: float = Field(
        0.0, description="94. Total saldo a pagar por impuesto de GO"
    )
    c95_total_saldo_a_favor_go: float = Field(
        0.0, description="95. Total saldo a favor por impuesto de GO"
    )

    # Anticipos bimestrales efectivamente pagados (96 a 107)
    c96_anticipo_simple_bim1: float = Field(0.0, description="96. Anticipo SIMPLE Bimestre 1")
    c97_anticipo_simple_bim2: float = Field(0.0, description="97. Anticipo SIMPLE Bimestre 2")
    c98_anticipo_simple_bim3: float = Field(0.0, description="98. Anticipo SIMPLE Bimestre 3")
    c99_anticipo_simple_bim4: float = Field(0.0, description="99. Anticipo SIMPLE Bimestre 4")
    c100_anticipo_simple_bim5: float = Field(0.0, description="100. Anticipo SIMPLE Bimestre 5")
    c101_anticipo_simple_bim6: float = Field(0.0, description="101. Anticipo SIMPLE Bimestre 6")

    c102_anticipo_inc_bim1: float = Field(0.0, description="102. Anticipo INC Bimestre 1")
    c103_anticipo_inc_bim2: float = Field(0.0, description="103. Anticipo INC Bimestre 2")
    c104_anticipo_inc_bim3: float = Field(0.0, description="104. Anticipo INC Bimestre 3")
    c105_anticipo_inc_bim4: float = Field(0.0, description="105. Anticipo INC Bimestre 4")
    c106_anticipo_inc_bim5: float = Field(0.0, description="106. Anticipo INC Bimestre 5")
    c107_anticipo_inc_bim6: float = Field(0.0, description="107. Anticipo INC Bimestre 6")

    # Totales y firmas
    c980_pago_total: float = Field(0.0, description="980. Pago total consolidado")


class RegimenSimpleInput(BaseModel):
    tax_year: int = Field(2025, description="Año gravable")
    custom_uvt: float | None = Field(None, description="UVT personalizado")
    grupo_actividad: int = Field(
        2,
        ge=1,
        le=6,
        description="Grupo empresarial según Art. 908 E.T. (1: Tiendas, 2: Comercio/Servicios, 3: Restaurantes, 4: Salud/Educación, 5: Profesiones Liberales, 6: Reciclaje)",
    )
    razon_social_o_nombre: str = Field("CONTRIBUYENTE EJEMPLO", description="Nombre o Razón social")
    nit: str = Field("900987654", description="Número de identificación tributaria")
    dv: str = Field("3", description="Dígito de verificación")

    # 1. Patrimonio
    patrimonio_bruto: float = Field(
        250000000.0, description="Total patrimonio bruto a 31 de diciembre"
    )
    pasivos: float = Field(45000000.0, description="Total deudas a 31 de diciembre")

    # 2. Ingresos Brutos por Grupo (Nacionales y Exterior)
    ingresos_brutos_nacionales: float = Field(
        320000000.0, description="Ingresos brutos anuales en Colombia"
    )
    ingresos_brutos_exterior: float = Field(
        0.0, description="Ingresos brutos anuales en el exterior"
    )
    ingresos_no_constitutivos_renta: float = Field(
        0.0, description="Ingresos no constitutivos de renta ni ganancia ocasional"
    )

    # 3. Componente ICA Territorial
    tarifa_ica_consolidada_x_mil: float = Field(
        6.9,
        description="Tarifa promedio ICA consolidado por mil (ej. 6.9x1000 para comercio o 9.66x1000 servicios)",
    )
    componente_ica_territorial_fijo: float | None = Field(
        None, description="Valor fijado o calculado directamente de ICA territorial"
    )

    # 4. Descuentos Tributarios
    aportes_pension_empleador_ano: float = Field(
        9600000.0,
        description="Aportes obligatorios a pensión efectivamente pagados a cargo del empleador",
    )
    ventas_por_medios_electronicos: float = Field(
        180000000.0,
        description="Total de ingresos cobrados vía datáfono, tarjetas de crédito/débito, PSE",
    )
    gmf_pagado: float = Field(0.0, description="Gravamen a los movimientos financieros pagado")

    # 5. Impuesto Nacional al Consumo (Restaurantes y Bares - Grupo 3)
    ingresos_servicio_comidas_bebidas: float = Field(
        0.0, description="Ingresos brutos por expendio de comidas y bebidas sujetos al INC 8%"
    )

    # 6. Ganancias Ocasionales
    ganancias_ocasionales_brutas: float = Field(
        0.0, description="Venta de activos fijos poseídos > 2 años o herencias"
    )
    costos_ganancia_ocasional: float = Field(
        0.0, description="Costo fiscal de los activos enajenados"
    )
    ganancias_ocasionales_exentas: float = Field(0.0, description="Ganancias ocasionales exentas")

    # 7. Anticipos Bimestrales Pagados en Formulario 2593 (Bimestres 1 a 6)
    anticipos_simple_pagados: list[float] = Field(
        default_factory=lambda: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        description="Anticipos impuesto SIMPLE pagados en bimestres 1 a 6",
    )
    anticipos_inc_pagados: list[float] = Field(
        default_factory=lambda: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        description="Anticipos INC comidas y bebidas pagados en bimestres 1 a 6",
    )

    # 8. Retenciones previas y saldos anteriores
    retenciones_antes_pertenecer_simple: float = Field(
        0.0, description="Retenciones practicadas antes de ingresar al régimen SIMPLE"
    )
    anticipo_renta_ano_anterior: float = Field(
        0.0, description="Anticipo de renta liquidado en la declaración ordinaria del año anterior"
    )
    saldo_a_favor_simple_ano_anterior: float = Field(
        0.0, description="Saldo a favor del año gravable anterior en Formulario 260"
    )
    saldo_a_favor_inc_ano_anterior: float = Field(
        0.0, description="Saldo a favor INC del año anterior"
    )
    saldo_a_favor_go_ano_anterior: float = Field(
        0.0, description="Saldo a favor GO del año anterior"
    )

    # 9. Sanciones
    sanciones_simple: float = Field(0.0, description="Sanciones liquidadas para SIMPLE")
    sanciones_ica: float = Field(
        0.0, description="Sanciones liquidadas para componente territorial"
    )
    sanciones_inc: float = Field(0.0, description="Sanciones liquidadas para INC")
    sanciones_go: float = Field(0.0, description="Sanciones liquidadas para Ganancias Ocasionales")


class RegimenSimpleOutput(BaseModel):
    tax_year: int
    uvt_value: float
    grupo_actividad: int
    nombre_grupo: str

    # Ingresos y Base
    ingresos_brutos_totales: float
    ingresos_gravables_simple: float
    ingresos_en_uvt: float

    # Liquidación SIMPLE
    tarifa_simple_consolidada_pct: float
    impuesto_simple_consolidado: float
    componente_ica_territorial: float
    componente_simple_nacional: float

    # Descuentos aplicados
    descuento_pension_empleador: float
    descuento_medios_electronicos_0_5pct: float
    total_descuentos_aplicados: float
    impuesto_neto_simple: float

    # Saldos SIMPLE
    total_anticipos_simple_pagados: float
    saldo_a_pagar_simple: float
    saldo_a_favor_simple: float

    # Liquidación INC Comidas y Bebidas
    impuesto_inc_comidas_bebidas: float
    total_anticipos_inc_pagados: float
    saldo_a_pagar_inc: float
    saldo_a_favor_inc: float

    # Liquidación Ganancias Ocasionales
    impuesto_ganancias_ocasionales: float
    saldo_a_pagar_go: float
    saldo_a_favor_go: float

    # Gran Total
    gran_total_saldo_a_pagar: float
    gran_total_saldo_a_favor: float

    # Formulario 260 DIAN Oficial
    form_260_casillas: Formulario260Casillas

    # Auditoría y Trazabilidad
    audit_trace: list[AuditTraceItem]
    resumen_ejecutivo: str


class ComparativaSimpleInput(BaseModel):
    tax_year: int = Field(2025, description="Año gravable")
    custom_uvt: float | None = Field(None, description="UVT personalizado")
    tipo_persona: str = Field("juridica", description="'natural' o 'juridica'")
    grupo_actividad: int = Field(2, ge=1, le=6, description="Grupo empresarial RST")
    ingresos_brutos_anuales: float = Field(450000000.0, description="Ingresos operacionales brutos")
    costos_y_gastos_deducibles: float = Field(
        270000000.0, description="Costos de ventas y gastos deducibles"
    )
    aportes_pension_empleador: float = Field(
        12000000.0, description="Aportes a pensión de nómina a cargo de la empresa"
    )
    porcentaje_ventas_medios_electronicos: float = Field(
        60.0, description="Porcentaje de ventas cobradas con tarjeta / PSE"
    )
    tarifa_ica_x_mil: float = Field(7.0, description="Tarifa de ICA municipal (por mil)")
    numero_empleados_menos_10_smlmv: int = Field(
        4, description="Empleados que ganan menos de 10 SMMLV"
    )


class ComparativaSimpleOutput(BaseModel):
    tax_year: int
    uvt_value: float

    # Ordinario
    renta_liquida_ordinaria: float
    impuesto_renta_ordinario: float
    ica_ordinario: float
    total_carga_tributaria_ordinario: float
    tasa_efectiva_ordinario_pct: float

    # Régimen SIMPLE
    tarifa_simple_pct: float
    impuesto_simple_bruto: float
    descuento_pension_simple: float
    descuento_electronico_simple: float
    impuesto_simple_neto: float
    ica_integrado_en_simple: float
    total_carga_tributaria_simple: float
    tasa_efectiva_simple_pct: float

    # Comparativa & Ahorro
    ahorro_tributario_neto_cop: float
    ahorro_tributario_pct: float
    ahorro_parafiscales_salud_sena_icbf_cop: float
    beneficio_flujo_caja_sin_retefuente_cop: float
    regimen_recomendado: str
    conclusion_didactica: str
