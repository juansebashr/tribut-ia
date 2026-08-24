from pydantic import BaseModel, Field

from app.models.common import AuditTraceItem


class Formulario110Casillas(BaseModel):
    # Cabecera y datos generales
    ano: int = Field(2025, description="1. Año gravable")
    numero_formulario: str = Field("1109999999999", description="4. Número de formulario")
    nit: str = Field("900123456", description="5. NIT")
    dv: str = Field("1", description="6. DV")
    razon_social: str = Field("EMPRESA NACIONAL S.A.S.", description="11. Razón social")
    cod_direccion_seccional: int = Field(32, description="12. Cód. Dirección seccional")
    actividad_economica: str = Field("6201", description="24. Actividad económica principal")

    # Datos informativos
    c33_total_costos_gastos_nomina: float = Field(
        0.0, description="33. Total costos y gastos de nómina"
    )
    c34_aportes_seguridad_social: float = Field(0.0, description="34. Aportes a seguridad social")
    c35_aportes_sena_icbf_cajas: float = Field(0.0, description="35. Aportes SENA, ICBF y Cajas")

    # Sección Patrimonio (36 a 46)
    c36_efectivo_y_equivalentes: float = Field(
        0.0, description="36. Efectivo y equivalentes al efectivo"
    )
    c37_inversiones_derivados: float = Field(
        0.0, description="37. Inversiones e instrumentos financieros derivados"
    )
    c38_cuentas_por_cobrar: float = Field(
        0.0, description="38. Cuentas, documentos y arrendamientos financieros por cobrar"
    )
    c39_inventarios: float = Field(0.0, description="39. Inventarios")
    c40_activos_intangibles: float = Field(0.0, description="40. Activos intangibles")
    c41_activos_biologicos: float = Field(0.0, description="41. Activos biológicos")
    c42_propiedades_planta_equipo: float = Field(
        0.0, description="42. Propiedades, planta y equipo, propiedades de inversión y ANCMV"
    )
    c43_otros_activos: float = Field(0.0, description="43. Otros activos")
    c44_total_patrimonio_bruto: float = Field(0.0, description="44. Total patrimonio bruto")
    c45_pasivos: float = Field(0.0, description="45. Pasivos")
    c46_total_patrimonio_liquido: float = Field(0.0, description="46. Total patrimonio líquido")

    # Sección Ingresos (47 a 61)
    c47_ingresos_brutos_ordinarios: float = Field(
        0.0, description="47. Ingresos brutos de actividades ordinarias"
    )
    c48_ingresos_financieros: float = Field(0.0, description="48. Ingresos financieros")
    c49_dividendos_no_constitutivos: float = Field(
        0.0, description="49. Dividendos y participaciones no constitutivos"
    )
    c50_dividendos_chc: float = Field(
        0.0, description="50. Dividendos CHC y prima colocación acciones"
    )
    c51_dividendos_gravados_tarifa_general: float = Field(
        0.0, description="51. Dividendos gravados a tarifa general"
    )
    c52_dividendos_no_residentes_2016: float = Field(
        0.0, description="52. Dividendos no residentes 2016 y anteriores"
    )
    c53_dividendos_no_residentes_2017: float = Field(
        0.0, description="53. Dividendos no residentes 2017 y siguientes"
    )
    c54_dividendos_art245_246: float = Field(
        0.0, description="54. Dividendos a tarifas Art. 245 o 246 E.T."
    )
    c55_dividendos_ep_extranjeras_2017: float = Field(
        0.0, description="55. Dividendos gravados tarifa general EP y extranjeras"
    )
    c56_dividendos_megainversion_27: float = Field(
        0.0, description="56. Dividendos megainversión gravadas 27%"
    )
    c57_otros_ingresos: float = Field(0.0, description="57. Otros ingresos")
    c58_total_ingresos_brutos: float = Field(0.0, description="58. Total ingresos brutos")
    c59_devoluciones_rebajas_descuentos: float = Field(
        0.0, description="59. Devoluciones, rebajas y descuentos en ventas"
    )
    c60_ingresos_no_constitutivos_renta: float = Field(
        0.0, description="60. Ingresos no constitutivos de renta"
    )
    c61_total_ingresos_netos: float = Field(0.0, description="61. Total ingresos netos")

    # Sección Costos y Deducciones (62 a 67)
    c62_costos: float = Field(0.0, description="62. Costos")
    c63_gastos_administracion: float = Field(0.0, description="63. Gastos de administración")
    c64_gastos_distribucion_ventas: float = Field(
        0.0, description="64. Gastos de distribución y ventas"
    )
    c65_gastos_financieros: float = Field(0.0, description="65. Gastos financieros")
    c66_otros_gastos_deducciones: float = Field(0.0, description="66. Otros gastos y deducciones")
    c67_total_costos_gastos_deducibles: float = Field(
        0.0, description="67. Total costos y gastos deducibles"
    )

    # ESAL / Régimen Especial (68 a 69)
    c68_inversiones_efectuadas_ano: float = Field(
        0.0, description="68. Inversiones efectuadas en el año (ESAL)"
    )
    c69_inversiones_liquidadas_periodos_anteriores: float = Field(
        0.0, description="69. Inversiones liquidadas periodos anteriores"
    )

    # Sección Renta (70 a 79)
    c70_renta_recuperacion_deducciones: float = Field(
        0.0, description="70. Renta por recuperación de deducciones"
    )
    c71_renta_pasiva_ece: float = Field(
        0.0, description="71. Renta pasiva - ECE sin residencia fiscal"
    )
    c72_renta_liquida_ordinaria: float = Field(
        0.0, description="72. Renta líquida ordinaria del ejercicio"
    )
    c73_perdida_liquida_ejercicio: float = Field(
        0.0, description="73. Pérdida líquida del ejercicio"
    )
    c74_compensaciones: float = Field(0.0, description="74. Compensaciones")
    c75_renta_liquida: float = Field(0.0, description="75. Renta líquida")
    c76_renta_presuntiva: float = Field(0.0, description="76. Renta presuntiva")
    c77_renta_exenta: float = Field(0.0, description="77. Renta exenta")
    c78_rentas_gravables: float = Field(0.0, description="78. Rentas gravables")
    c79_renta_liquida_gravable: float = Field(0.0, description="79. Renta líquida gravable")

    # Sección Ganancias Ocasionales (80 a 83)
    c80_ingresos_ganancias_ocasionales: float = Field(
        0.0, description="80. Ingresos por ganancias ocasionales"
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

    # Sección Liquidación Privada (84 a 117)
    c84_impuesto_renta_liquida_gravable: float = Field(
        0.0, description="84. Sobre la renta líquida gravable"
    )
    c85_puntos_adicionales_sobretasa: float = Field(
        0.0, description="85. Puntos adicionales a la tarifa del impuesto renta"
    )
    c86_impuesto_dividendos_art245_246: float = Field(
        0.0, description="86. De dividendos y participaciones gravadas tarifa 20%"
    )
    c87_impuesto_dividendos_art240: float = Field(
        0.0, description="87. De dividendos y participaciones gravadas tarifa Art. 240"
    )
    c88_impuesto_dividendos_megainversion: float = Field(
        0.0, description="88. De dividendos y participaciones gravadas 27%"
    )
    c89_impuesto_dividendos_no_residentes_2017: float = Field(
        0.0, description="89. De dividendos no residentes 2017+"
    )
    c90_impuesto_dividendos_no_residentes_2016: float = Field(
        0.0, description="90. De dividendos no residentes 2016 y anteriores"
    )
    c91_total_impuesto_rentas_liquidas: float = Field(
        0.0, description="91. Total impuesto sobre las rentas líquidas gravables"
    )
    c92_valor_a_adicionar_vaa: float = Field(
        0.0, description="92. Valor a adicionar (VAA Art. 259-1)"
    )
    c93_descuentos_tributarios: float = Field(0.0, description="93. Descuentos tributarios")
    c94_impuesto_neto_renta_sin_adicion: float = Field(
        0.0, description="94. Impuesto neto de renta (sin impuesto adicionado)"
    )
    c95_impuesto_a_adicionar_ttd: float = Field(
        0.0, description="95. Impuesto a adicionar (IA - TTD 15%)"
    )
    c96_impuesto_neto_renta_con_adicion: float = Field(
        0.0, description="96. Impuesto neto de renta (con impuesto adicionado)"
    )
    c97_impuesto_ganancias_ocasionales: float = Field(
        0.0, description="97. Impuesto de ganancias ocasionales"
    )
    c98_descuento_impuestos_exterior_go: float = Field(
        0.0, description="98. Descuento impuestos pagados exterior por GO"
    )
    c99_total_impuesto_a_cargo: float = Field(0.0, description="99. Total impuesto a cargo")
    c100_obras_por_impuestos_mod1: float = Field(
        0.0, description="100. Inversión Obras por Impuestos (Mod 1)"
    )
    c101_descuento_obras_por_impuestos_mod2: float = Field(
        0.0, description="101. Descuento Obras por Impuestos (Mod 2)"
    )
    c102_credito_fiscal_256_1: float = Field(0.0, description="102. Crédito fiscal Art. 256-1 E.T.")
    c103_anticipo_renta_ano_anterior: float = Field(
        0.0, description="103. Anticipo renta liquidado año anterior"
    )
    c104_saldo_a_favor_ano_anterior: float = Field(
        0.0, description="104. Saldo a favor año gravable anterior"
    )
    c105_autorretenciones: float = Field(0.0, description="105. Autorretenciones")
    c106_otras_retenciones: float = Field(0.0, description="106. Otras retenciones")
    c107_total_retenciones_ano_declarar: float = Field(
        0.0, description="107. Total retenciones año gravable a declarar"
    )
    c108_anticipo_renta_ano_siguiente: float = Field(
        0.0, description="108. Anticipo renta año gravable siguiente"
    )
    c109_anticipo_sobretasa_ano_anterior: float = Field(
        0.0, description="109. Anticipo puntos adicionales año anterior"
    )
    c110_anticipo_sobretasa_ano_siguiente: float = Field(
        0.0, description="110. Anticipo puntos adicionales año siguiente"
    )
    c111_saldo_a_pagar_por_impuesto: float = Field(
        0.0, description="111. Saldo a pagar por impuesto"
    )
    c112_sanciones: float = Field(0.0, description="112. Sanciones")
    c113_total_saldo_a_pagar: float = Field(0.0, description="113. Total saldo a pagar")
    c114_total_saldo_a_favor: float = Field(0.0, description="114. Total saldo a favor")
    c115_obras_impuestos_exigible_mod1: float = Field(
        0.0, description="115. Valor impuesto exigible Obras por Impuestos Mod 1"
    )
    c116_total_proyecto_obras_mod2: float = Field(
        0.0, description="116. Valor total proyecto Obras por Impuestos Mod 2"
    )
    c117_aporte_voluntario_art244_1: float = Field(
        0.0, description="117. Aporte voluntario Art. 244-1 E.T."
    )

    # Firmas
    c980_pago_total: float = Field(0.0, description="980. Pago total")
    c981_cod_representacion: str = Field("1", description="981. Cód. Representación")
    c982_cod_contador_o_revisor: str = Field(
        "2", description="982. Código Contador (1) o Revisor Fiscal (2)"
    )
    c983_tarjeta_profesional: str = Field("123456-T", description="983. No. Tarjeta profesional")


class PersonaJuridicaInput(BaseModel):
    tax_year: int = Field(2025, description="Año gravable para la declaración")
    custom_uvt: float | None = Field(None, description="UVT personalizado")
    tarifa_personalizada: float | None = Field(
        None, description="Tarifa de renta personalizada (ej: 0.20 para zona franca o 0.35 general)"
    )
    tipo_regimen: str = Field(
        "general",
        description="Régimen o sector: general (35%), zona_franca (20%), hotelero (15%), cooperativa (20%), zomac",
    )
    aplica_sobretasa_financiera: bool = Field(
        False, description="Entidad financiera sujeta a 5 puntos adicionales (Art. 240 Par. 2)"
    )
    aplica_sobretasa_hidroelectrica: bool = Field(
        False,
        description="Generadora hidroeléctrica sujeta a 3 puntos adicionales (Art. 240 Par. 4)",
    )
    sobretasa_minero_petroleo_pct: float = Field(
        0.0,
        description="Puntos adicionales para carbón o crudo (0%, 5%, 10%, 15% - Art. 240 Par. 3)",
    )

    # 1. Datos Informativos
    total_costos_gastos_nomina: float = Field(
        0.0, description="Total costos y gastos laborales del año"
    )
    aportes_seguridad_social: float = Field(
        0.0, description="Aportes a salud, pensión y ARL pagados"
    )
    aportes_sena_icbf_cajas: float = Field(0.0, description="Aportes parafiscales pagados")

    # 2. Patrimonio
    efectivo_y_equivalentes: float = Field(0.0, description="Efectivo en caja y bancos")
    inversiones_derivados: float = Field(0.0, description="Inversiones e instrumentos financieros")
    cuentas_por_cobrar: float = Field(0.0, description="Clientes y cuentas por cobrar")
    inventarios: float = Field(0.0, description="Inventarios de mercancías o productos")
    activos_intangibles: float = Field(0.0, description="Marcas, patentes, software")
    activos_biologicos: float = Field(0.0, description="Plantas y animales")
    propiedades_planta_equipo: float = Field(0.0, description="Inmuebles, vehículos, maquinaria")
    otros_activos: float = Field(0.0, description="Gastos anticipados y otros activos")
    pasivos: float = Field(0.0, description="Obligaciones financieras, proveedores y deudas")

    # 3. Ingresos
    ingresos_brutos_operacionales: float = Field(
        0.0, description="Ingresos por actividad principal o venta de bienes/servicios"
    )
    ingresos_brutos_no_operacionales: float = Field(
        0.0, description="Rendimientos financieros y otros ingresos"
    )
    ingresos_financieros: float = Field(
        0.0, description="Intereses y rendimientos del sector financiero"
    )
    dividendos_no_constitutivos: float = Field(0.0, description="Dividendos no gravados Art. 48/49")
    dividendos_gravados_tarifa_general: float = Field(
        0.0, description="Dividendos gravados a tarifa general"
    )
    otros_ingresos: float = Field(0.0, description="Utilidad en activos < 2 años, indemnizaciones")
    devoluciones_rebajas_descuentos: float = Field(
        0.0, description="Devoluciones, rebajas y descuentos en ventas"
    )
    ingresos_no_constitutivos_renta: float = Field(
        0.0,
        description="Ingresos no constitutivos de renta ni ganancia ocasional",
    )

    # 4. Costos y Gastos Deducibles
    costos_procedentes: float = Field(
        0.0, description="Costo fiscal de ventas y prestación de servicios"
    )
    gastos_administracion: float = Field(0.0, description="Gastos operacionales de administración")
    gastos_ventas: float = Field(0.0, description="Gastos operacionales de ventas y mercadeo")
    gastos_financieros: float = Field(0.0, description="Intereses y comisiones bancarias")
    otros_gastos_deducciones: float = Field(0.0, description="Otras deducciones procedentes")

    # 5. Conciliación Contable-Fiscal
    gastos_no_deducibles: float = Field(
        0.0,
        description="Gastos sin soporte electrónico, sanciones o multas no deducibles",
    )
    deducciones_especiales: float = Field(
        0.0, description="Otras deducciones con beneficio tributario (ej. primer empleo, I+D)"
    )
    rentas_exentas: float = Field(0.0, description="Rentas exentas legales para personas jurídicas")
    compensacion_perdidas_fiscales: float = Field(
        0.0, description="Compensación de pérdidas fiscales de años anteriores (Art. 147 E.T.)"
    )
    compensacion_exceso_renta_presuntiva: float = Field(
        0.0, description="Compensación de excesos de renta presuntiva de años anteriores"
    )

    # 6. Tasa Mínima de Tributación (TTD - Art. 240 Parágrafo 6)
    utilidad_contable_antes_impuestos: float = Field(
        0.0,
        description="Utilidad comercial/contable antes de impuestos (necesaria para validar la TTD del 15%)",
    )
    diferencias_permanentes_ttd: float = Field(
        0.0, description="Ajustes y partidas no gravadas de la utilidad para depuración de la TTD"
    )

    # 7. Ganancia Ocasional y Descuentos
    ganancias_ocasionales_brutas: float = Field(
        0.0, description="Ingresos por venta de activos fijos poseídos > 2 años o herencias"
    )
    costos_ganancia_ocasional: float = Field(
        0.0, description="Costo fiscal del activo fijo enajenado"
    )
    ganancias_ocasionales_exentas: float = Field(
        0.0, description="Ganancias ocasionales no gravadas"
    )
    ganancia_ocasional_gravable: float = Field(
        0.0, description="Utilidad gravable en venta de activos fijos poseídos > 2 años"
    )
    descuento_tributario_ica: float = Field(
        0.0, description="Descuento del 50% del ICA efectivamente pagado (Art. 115 E.T.)"
    )
    otros_descuentos_tributarios: float = Field(
        0.0, description="Donaciones a ESAL (Art. 257), impuestos pagados en el exterior (Art. 254)"
    )

    # 8. Obras por Impuestos y Crédito Fiscal
    obras_por_impuestos_mod1: float = Field(
        0.0, description="Modalidad 1: hasta 50% del impuesto a cargo"
    )
    descuento_obras_mod2: float = Field(0.0, description="Modalidad 2: descuento efectivo")
    credito_fiscal_256_1: float = Field(0.0, description="Crédito fiscal I+D certificado CNBT")

    # 9. Retenciones, Anticipos y Sanciones
    retenciones_en_la_fuente: float = Field(
        0.0, description="Retenciones que le practicaron clientes a la sociedad"
    )
    autorretenciones_practicadas: float = Field(
        0.0, description="Autorretenciones especiales de renta practicadas"
    )
    anticipo_ano_anterior: float = Field(
        0.0, description="Anticipo de renta liquidado en la declaración del año anterior"
    )
    saldo_a_favor_ano_anterior: float = Field(
        0.0, description="Saldo a favor del año gravable anterior"
    )
    anticipo_sobretasa_ano_anterior: float = Field(
        0.0, description="Anticipo sobretasa liquidado en el año anterior"
    )
    porcentaje_anticipo_siguiente: float = Field(
        0.75,
        description="Porcentaje de anticipo año siguiente (75% general, 25% primer año, 50% segundo año)",
    )
    sanciones: float = Field(0.0, description="Sanciones por extemporaneidad o corrección")
    aporte_voluntario_art244_1: float = Field(
        0.0, description="Aporte voluntario social Art. 244-1"
    )


class PersonaJuridicaOutput(BaseModel):
    tax_year: int
    uvt_value: float

    # Patrimonio
    patrimonio_bruto: float
    pasivos: float
    patrimonio_liquido: float

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
    puntos_adicionales_sobretasa: float
    impuesto_sobretasa: float

    # Tasa de Tributación Depurada (TTD)
    ttd_calculada_pct: float
    utilidad_depurada_ttd: float
    impuesto_depurado_ttd: float
    aplica_impuesto_adicional_ttd: bool
    impuesto_adicional_ttd: float

    # Ganancias Ocasionales y Descuentos
    impuesto_ganancias_ocasionales: float
    total_descuentos_tributarios_aplicados: float
    total_impuesto_a_cargo: float
    impuesto_neto_total: float

    # Retenciones, Anticipos y Saldos Finales
    total_retenciones_declarar: float
    anticipo_ano_siguiente: float
    anticipo_sobretasa_ano_siguiente: float
    total_retenciones_y_anticipos: float
    saldo_a_pagar: float
    saldo_a_favor: float

    # Mapeo completo Formulario 110 DIAN
    form_110_casillas: Formulario110Casillas

    # Trazabilidad
    audit_trace: list[AuditTraceItem]
    resumen_ejecutivo: str
