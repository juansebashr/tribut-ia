export interface AuditTraceItem {
  step_id: string;
  title: string;
  statutory_reference?: string;
  raw_input_cop?: number;
  calculated_cop: number;
  limit_cop?: number;
  limit_uvt?: number;
  excess_rejected_cop?: number;
  final_allowed_cop: number;
  notes?: string;
}

export interface PersonaNaturalInput {
  tax_year: number;
  custom_uvt?: number;
  patrimonio_bruto?: number;
  deudas?: number;
  rentas_trabajo: number;
  viaticos: number;
  otros_ingresos_brutos: number;
  rentas_capital?: number;
  incrngo_capital?: number;
  rentas_nolaborales?: number;
  incrngo_nolaborales?: number;
  costos_nolaborales?: number;
  aporte_salud_obligatorio: number;
  aporte_pension_obligatorio: number;
  otros_incrngo: number;
  aplica_dependiente_general: boolean;
  numero_dependientes_adicionales_72uvt: number;
  medicina_prepagada_anual: number;
  intereses_vivienda_anual: number;
  gmf_4x1000_total: number;
  compras_factura_electronica: number;
  aportes_voluntarios_pension_afc: number;
  otras_rentas_exentas: number;
  ganancias_ocasionales_brutas_activos_fijos?: number;
  ganancias_ocasionales_brutas_herencias?: number;
  ganancias_ocasionales_brutas_loterias?: number;
  costos_ganancia_ocasional?: number;
  ganancias_ocasionales_exentas_solicitadas?: number;
  descuentos_tributarios: number;
  retenciones_fuente_practicadas: number;
  anticipo_ano_anterior: number;
  saldo_a_favor_ano_anterior: number;
}

export interface PersonaNaturalOutput {
  tax_year: number;
  uvt_value: number;
  patrimonio_bruto?: number;
  deudas?: number;
  patrimonio_liquido?: number;
  total_ingresos_brutos: number;
  total_incrngo: number;
  ingreso_neto: number;
  total_deducciones_solicitadas: number;
  total_deducciones_aceptadas: number;
  total_rentas_exentas_previas: number;
  renta_exenta_laboral_25: number;
  total_rentas_exentas_aceptadas: number;
  subtotal_alivios_antes_de_limite: number;
  limite_conjunto_porcentaje_cop: number;
  limite_conjunto_uvt_cop: number;
  limite_conjunto_aplicable_cop: number;
  alivios_procedentes_finales: number;
  alivios_rechazados_por_limite: number;
  renta_liquida_gravable: number;
  renta_liquida_gravable_uvt: number;
  tarifa_marginal_maxima: number;
  impuesto_bruto_renta: number;
  descuentos_tributarios: number;
  impuesto_neto_renta: number;
  total_ganancias_ocasionales_brutas?: number;
  costos_ganancia_ocasional?: number;
  ganancias_ocasionales_exentas_aceptadas?: number;
  ganancia_ocasional_gravable?: number;
  impuesto_ganancias_ocasionales?: number;
  total_impuesto_a_cargo?: number;
  total_anticipos_y_retenciones: number;
  saldo_a_pagar: number;
  saldo_a_favor: number;
  form_210_casillas?: Record<string, number>;
  audit_trace: AuditTraceItem[];
  resumen_ejecutivo: string;
}

export interface Formulario110Casillas {
  ano: number;
  numero_formulario: string;
  nit: string;
  dv: string;
  razon_social: string;
  cod_direccion_seccional: number;
  actividad_economica: string;
  c33_total_costos_gastos_nomina: number;
  c34_aportes_seguridad_social: number;
  c35_aportes_sena_icbf_cajas: number;
  c36_efectivo_y_equivalentes: number;
  c37_inversiones_derivados: number;
  c38_cuentas_por_cobrar: number;
  c39_inventarios: number;
  c40_activos_intangibles: number;
  c41_activos_biologicos: number;
  c42_propiedades_planta_equipo: number;
  c43_otros_activos: number;
  c44_total_patrimonio_bruto: number;
  c45_pasivos: number;
  c46_total_patrimonio_liquido: number;
  c47_ingresos_brutos_ordinarios: number;
  c48_ingresos_financieros: number;
  c49_dividendos_no_constitutivos: number;
  c50_dividendos_chc: number;
  c51_dividendos_gravados_tarifa_general: number;
  c52_dividendos_no_residentes_2016: number;
  c53_dividendos_no_residentes_2017: number;
  c54_dividendos_art245_246: number;
  c55_dividendos_ep_extranjeras_2017: number;
  c56_dividendos_megainversion_27: number;
  c57_otros_ingresos: number;
  c58_total_ingresos_brutos: number;
  c59_devoluciones_rebajas_descuentos: number;
  c60_ingresos_no_constitutivos_renta: number;
  c61_total_ingresos_netos: number;
  c62_costos: number;
  c63_gastos_administracion: number;
  c64_gastos_distribucion_ventas: number;
  c65_gastos_financieros: number;
  c66_otros_gastos_deducciones: number;
  c67_total_costos_gastos_deducibles: number;
  c68_inversiones_efectuadas_ano: number;
  c69_inversiones_liquidadas_periodos_anteriores: number;
  c70_renta_recuperacion_deducciones: number;
  c71_renta_pasiva_ece: number;
  c72_renta_liquida_ordinaria: number;
  c73_perdida_liquida_ejercicio: number;
  c74_compensaciones: number;
  c75_renta_liquida: number;
  c76_renta_presuntiva: number;
  c77_renta_exenta: number;
  c78_rentas_gravables: number;
  c79_renta_liquida_gravable: number;
  c80_ingresos_ganancias_ocasionales: number;
  c81_costos_ganancias_ocasionales: number;
  c82_ganancias_ocasionales_exentas: number;
  c83_ganancias_ocasionales_gravables: number;
  c84_impuesto_renta_liquida_gravable: number;
  c85_puntos_adicionales_sobretasa: number;
  c86_impuesto_dividendos_art245_246: number;
  c87_impuesto_dividendos_art240: number;
  c88_impuesto_dividendos_megainversion: number;
  c89_impuesto_dividendos_no_residentes_2017: number;
  c90_impuesto_dividendos_no_residentes_2016: number;
  c91_total_impuesto_rentas_liquidas: number;
  c92_valor_a_adicionar_vaa: number;
  c93_descuentos_tributarios: number;
  c94_impuesto_neto_renta_sin_adicion: number;
  c95_impuesto_a_adicionar_ttd: number;
  c96_impuesto_neto_renta_con_adicion: number;
  c97_impuesto_ganancias_ocasionales: number;
  c98_descuento_impuestos_exterior_go: number;
  c99_total_impuesto_a_cargo: number;
  c100_obras_por_impuestos_mod1: number;
  c101_descuento_obras_por_impuestos_mod2: number;
  c102_credito_fiscal_256_1: number;
  c103_anticipo_renta_ano_anterior: number;
  c104_saldo_a_favor_ano_anterior: number;
  c105_autorretenciones: number;
  c106_otras_retenciones: number;
  c107_total_retenciones_ano_declarar: number;
  c108_anticipo_renta_ano_siguiente: number;
  c109_anticipo_sobretasa_ano_anterior: number;
  c110_anticipo_sobretasa_ano_siguiente: number;
  c111_saldo_a_pagar_por_impuesto: number;
  c112_sanciones: number;
  c113_total_saldo_a_pagar: number;
  c114_total_saldo_a_favor: number;
  c115_obras_impuestos_exigible_mod1: number;
  c116_total_proyecto_obras_mod2: number;
  c117_aporte_voluntario_art244_1: number;
  c980_pago_total: number;
  c981_cod_representacion: string;
  c982_cod_contador_o_revisor: string;
  c983_tarjeta_profesional: string;
}

export interface PersonaJuridicaInput {
  tax_year: number;
  custom_uvt?: number;
  tarifa_personalizada?: number;
  tipo_regimen?: string;
  aplica_sobretasa_financiera?: boolean;
  aplica_sobretasa_hidroelectrica?: boolean;
  sobretasa_minero_petroleo_pct?: number;

  // 1. Datos Informativos
  total_costos_gastos_nomina?: number;
  aportes_seguridad_social?: number;
  aportes_sena_icbf_cajas?: number;

  // 2. Patrimonio
  efectivo_y_equivalentes?: number;
  inversiones_derivados?: number;
  cuentas_por_cobrar?: number;
  inventarios?: number;
  activos_intangibles?: number;
  activos_biologicos?: number;
  propiedades_planta_equipo?: number;
  otros_activos?: number;
  pasivos?: number;

  // 3. Ingresos
  ingresos_brutos_operacionales: number;
  ingresos_brutos_no_operacionales: number;
  ingresos_financieros?: number;
  dividendos_no_constitutivos?: number;
  dividendos_gravados_tarifa_general?: number;
  otros_ingresos?: number;
  devoluciones_rebajas_descuentos: number;
  ingresos_no_constitutivos_renta: number;

  // 4. Costos y Gastos
  costos_procedentes: number;
  gastos_administracion: number;
  gastos_ventas: number;
  gastos_financieros: number;
  otros_gastos_deducciones?: number;

  // 5. Conciliación
  gastos_no_deducibles: number;
  deducciones_especiales: number;
  rentas_exentas: number;
  compensacion_perdidas_fiscales: number;
  compensacion_exceso_renta_presuntiva: number;

  // 6. TTD
  utilidad_contable_antes_impuestos: number;
  diferencias_permanentes_ttd: number;

  // 7. Ganancia Ocasional y Descuentos
  ganancias_ocasionales_brutas?: number;
  costos_ganancia_ocasional?: number;
  ganancias_ocasionales_exentas?: number;
  ganancia_ocasional_gravable: number;
  descuento_tributario_ica: number;
  otros_descuentos_tributarios: number;

  // 8. Obras y Créditos
  obras_por_impuestos_mod1?: number;
  descuento_obras_mod2?: number;
  credito_fiscal_256_1?: number;

  // 9. Retenciones y Anticipos
  retenciones_en_la_fuente: number;
  autorretenciones_practicadas: number;
  anticipo_ano_anterior: number;
  saldo_a_favor_ano_anterior: number;
  anticipo_sobretasa_ano_anterior?: number;
  porcentaje_anticipo_siguiente?: number;
  sanciones?: number;
  aporte_voluntario_art244_1?: number;
}

export interface PersonaJuridicaOutput {
  tax_year: number;
  uvt_value: number;
  patrimonio_bruto: number;
  pasivos: number;
  patrimonio_liquido: number;
  ingresos_brutos_totales: number;
  ingresos_netos: number;
  renta_bruta: number;
  total_gastos_deducibles: number;
  renta_liquida_ordinaria: number;
  renta_liquida_gravable: number;
  tarifa_renta_aplicada: number;
  impuesto_basico_renta: number;
  puntos_adicionales_sobretasa: number;
  impuesto_sobretasa: number;
  ttd_calculada_pct: number;
  utilidad_depurada_ttd: number;
  impuesto_depurado_ttd: number;
  aplica_impuesto_adicional_ttd: boolean;
  impuesto_adicional_ttd: number;
  impuesto_ganancias_ocasionales: number;
  total_descuentos_tributarios_aplicados: number;
  total_impuesto_a_cargo: number;
  impuesto_neto_total: number;
  total_retenciones_declarar: number;
  anticipo_ano_siguiente: number;
  anticipo_sobretasa_ano_siguiente: number;
  total_retenciones_y_anticipos: number;
  saldo_a_pagar: number;
  saldo_a_favor: number;
  form_110_casillas: Formulario110Casillas;
  audit_trace: AuditTraceItem[];
  resumen_ejecutivo: string;
}

export interface Formulario260Casillas {
  ano: number;
  fraccion_ano_siguiente: boolean;
  numero_formulario: string;
  nit: string;
  dv: string;
  primer_apellido: string;
  segundo_apellido: string;
  primer_nombre: string;
  otros_nombres: string;
  razon_social: string;
  cod_direccion_seccional: number;
  actividad_economica: string;
  tarifa_simple_consolidada: number;
  c28_patrimonio_bruto: number;
  c29_pasivos: number;
  c30_patrimonio_liquido: number;
  c31_ingresos_grupo1_pais: number;
  c32_ingresos_grupo1_exterior: number;
  c33_ingresos_grupo2_pais: number;
  c34_ingresos_grupo2_exterior: number;
  c35_ingresos_grupo3_pais: number;
  c36_ingresos_grupo3_exterior: number;
  c37_ingresos_grupo4_pais: number;
  c38_ingresos_grupo4_exterior: number;
  c39_ingresos_grupo5_pais: number;
  c40_ingresos_grupo5_exterior: number;
  c41_ingresos_grupo6_pais: number;
  c42_ingresos_grupo6_exterior: number;
  c43_total_ingresos_brutos_sin_go: number;
  c44_ingresos_no_constitutivos_renta: number;
  c45_total_ingresos_gravables: number;
  c46_impuesto_simple: number;
  c47_componente_ica_territorial: number;
  c48_valor_componente_simple_nacional: number;
  c49_descuento_aportes_pension_empleador: number;
  c50_descuento_ventas_medios_electronicos: number;
  c51_descuento_gmf: number;
  c52_total_descuentos: number;
  c53_impuesto_neto_simple: number;
  c54_retenciones_antes_pertenecer_simple: number;
  c55_anticipo_renta_ano_anterior: number;
  c56_anticipos_simple_efectivamente_pagados: number;
  c57_saldo_favor_simple_ano_anterior: number;
  c58_saldo_a_pagar_impuesto_simple: number;
  c59_sancion_extemporaneidad_simple: number;
  c60_sancion_correccion_simple: number;
  c61_otras_sanciones_simple: number;
  c62_total_sanciones_simple: number;
  c63_total_saldo_a_pagar_simple: number;
  c64_total_saldo_a_favor_simple: number;
  c65_sancion_extemporaneidad_ica: number;
  c66_sancion_correccion_ica: number;
  c67_otras_sanciones_ica: number;
  c68_total_sanciones_ica: number;
  c69_ingresos_gravados_inc: number;
  c70_impuesto_nacional_consumo: number;
  c71_inc_efectivamente_pagado_anticipos: number;
  c72_saldo_favor_inc_ano_anterior: number;
  c73_saldo_a_pagar_inc: number;
  c74_sancion_extemporaneidad_inc: number;
  c75_sancion_correccion_inc: number;
  c76_otras_sanciones_inc: number;
  c77_total_sanciones_inc: number;
  c78_total_saldo_a_pagar_inc: number;
  c79_total_saldo_a_favor_inc: number;
  c80_ingresos_ganancias_ocasionales: number;
  c81_costos_ganancias_ocasionales: number;
  c82_ganancias_ocasionales_exentas: number;
  c83_ganancias_ocasionales_gravables: number;
  c84_impuesto_ganancias_ocasionales: number;
  c85_descuento_impuestos_exterior_go: number;
  c86_impuesto_neto_ganancias_ocasionales: number;
  c87_saldo_favor_go_ano_anterior: number;
  c88_retenciones_ganancias_ocasionales: number;
  c89_saldo_a_pagar_go: number;
  c90_sancion_extemporaneidad_go: number;
  c91_sancion_correccion_go: number;
  c92_otras_sanciones_go: number;
  c93_total_sanciones_go: number;
  c94_total_saldo_a_pagar_go: number;
  c95_total_saldo_a_favor_go: number;
  c96_anticipo_simple_bim1: number;
  c97_anticipo_simple_bim2: number;
  c98_anticipo_simple_bim3: number;
  c99_anticipo_simple_bim4: number;
  c100_anticipo_simple_bim5: number;
  c101_anticipo_simple_bim6: number;
  c102_anticipo_inc_bim1: number;
  c103_anticipo_inc_bim2: number;
  c104_anticipo_inc_bim3: number;
  c105_anticipo_inc_bim4: number;
  c106_anticipo_inc_bim5: number;
  c107_anticipo_inc_bim6: number;
  c980_pago_total: number;
  c981_cod_representacion?: string;
  c982_cod_contador_o_revisor?: string;
  c983_tarjeta_profesional?: string;
}

export interface RegimenSimpleInput {
  tax_year: number;
  custom_uvt?: number;
  grupo_actividad: number;
  razon_social_o_nombre: string;
  nit: string;
  dv: string;
  patrimonio_bruto: number;
  pasivos: number;
  ingresos_brutos_nacionales: number;
  ingresos_brutos_exterior: number;
  ingresos_no_constitutivos_renta: number;
  tarifa_ica_consolidada_x_mil: number;
  componente_ica_territorial_fijo?: number | null;
  aportes_pension_empleador_ano: number;
  ventas_por_medios_electronicos: number;
  gmf_pagado?: number;
  ingresos_servicio_comidas_bebidas: number;
  ganancias_ocasionales_brutas?: number;
  costos_ganancia_ocasional?: number;
  ganancias_ocasionales_exentas?: number;
  anticipos_simple_pagados?: number[];
  anticipos_inc_pagados?: number[];
  retenciones_antes_pertenecer_simple?: number;
  anticipo_renta_ano_anterior?: number;
  saldo_a_favor_simple_ano_anterior?: number;
  saldo_a_favor_inc_ano_anterior?: number;
  saldo_a_favor_go_ano_anterior?: number;
  sanciones_simple?: number;
  sanciones_ica?: number;
  sanciones_inc?: number;
  sanciones_go?: number;
}

export interface RegimenSimpleOutput {
  tax_year: number;
  uvt_value: number;
  grupo_actividad: number;
  nombre_grupo: string;
  ingresos_brutos_totales: number;
  ingresos_gravables_simple: number;
  ingresos_en_uvt: number;
  tarifa_simple_consolidada_pct: number;
  impuesto_simple_consolidado: number;
  componente_ica_territorial: number;
  componente_simple_nacional: number;
  descuento_pension_empleador: number;
  descuento_medios_electronicos_0_5pct: number;
  total_descuentos_aplicados: number;
  impuesto_neto_simple: number;
  total_anticipos_simple_pagados: number;
  saldo_a_pagar_simple: number;
  saldo_a_favor_simple: number;
  impuesto_inc_comidas_bebidas: number;
  total_anticipos_inc_pagados: number;
  saldo_a_pagar_inc: number;
  saldo_a_favor_inc: number;
  impuesto_ganancias_ocasionales: number;
  saldo_a_pagar_go: number;
  saldo_a_favor_go: number;
  gran_total_saldo_a_pagar: number;
  gran_total_saldo_a_favor: number;
  form_260_casillas: Formulario260Casillas;
  audit_trace: AuditTraceItem[];
  resumen_ejecutivo: string;
}

export interface ComparativaSimpleInput {
  tax_year: number;
  custom_uvt?: number;
  tipo_persona: 'natural' | 'juridica' | string;
  grupo_actividad: number;
  ingresos_brutos_anuales: number;
  costos_y_gastos_deducibles: number;
  aportes_pension_empleador: number;
  porcentaje_ventas_medios_electronicos: number;
  tarifa_ica_x_mil: number;
  numero_empleados_menos_10_smlmv: number;
}

export interface ComparativaSimpleOutput {
  tax_year: number;
  uvt_value: number;
  renta_liquida_ordinaria: number;
  impuesto_renta_ordinario: number;
  ica_ordinario: number;
  total_carga_tributaria_ordinario: number;
  tasa_efectiva_ordinario_pct: number;
  tarifa_simple_pct: number;
  impuesto_simple_bruto: number;
  descuento_pension_simple: number;
  descuento_electronico_simple: number;
  impuesto_simple_neto: number;
  ica_integrado_en_simple: number;
  total_carga_tributaria_simple: number;
  tasa_efectiva_simple_pct: number;
  ahorro_tributario_neto_cop: number;
  ahorro_tributario_pct: number;
  ahorro_parafiscales_salud_sena_icbf_cop: number;
  beneficio_flujo_caja_sin_retefuente_cop: number;
  regimen_recomendado: string;
  conclusion_didactica: string;
}

export interface TaxYearRules {
  tax_year: number;
  uvt_value: number;
  description?: string;
  persona_natural: {
    cedula_general: {
      limite_conjunto_rentas_exentas_deducciones: {
        porcentaje_max_ingreso_neto: number;
        tope_uvt: number;
      };
      deducciones: {
        dependiente_general: { porcentaje_ingreso_laboral: number; tope_uvt: number };
        dependientes_adicionales_72uvt: { tope_uvt_por_dependiente: number; max_dependientes: number };
        medicina_prepagada: { tope_uvt_anual: number };
        intereses_vivienda: { tope_uvt_anual: number };
        gmf: { porcentaje_deducible: number };
        compras_factura_electronica_1pct?: { porcentaje_compras: number; tope_uvt: number };
      };
      rentas_exentas: {
        voluntarias_pension_afc: { porcentaje_max_ingreso: number; tope_uvt: number };
        laboral_25: { porcentaje: number; tope_uvt: number };
      };
      tabla_marginal_art241: Array<{
        desde_uvt: number;
        hasta_uvt: number;
        tarifa: number;
        uvt_adicional: number;
      }>;
    };
  };
  persona_juridica: {
    tarifa_general: number;
    ganancia_ocasional: number;
    tarifa_zona_franca?: number;
    tarifa_hoteles_ecoturismo?: number;
    tarifa_cooperativas?: number;
    tasa_minima_ttd: { aplica: boolean; tarifa_minima: number };
    descuentos: { ica_descuento_porcentaje: number; donaciones_porcentaje: number };
  };
  regimen_simple?: any;
}

export interface BeneficioItem {
  id: string;
  categoria: string;
  nombre: string;
  articulo_et: string;
  descripcion: string;
  tope_legal_texto: string;
  requisitos: string[];
  ejemplo_calculo: string;
}

export interface BeneficioAuditoriaRequest {
  tax_year: number;
  impuesto_neto_ano_anterior: number;
  custom_uvt?: number;
}

export interface BeneficioAuditoriaResponse {
  tax_year: number;
  uvt_value: number;
  impuesto_neto_ano_anterior: number;
  impuesto_minimo_requerido_uvt: number;
  impuesto_minimo_requerido_cop: number;
  cumple_impuesto_minimo: boolean;
  impuesto_objetivo_6_meses_cop: number;
  incremento_requerido_6_meses_cop: number;
  impuesto_objetivo_12_meses_cop: number;
  incremento_requerido_12_meses_cop: number;
  requisitos_legales: string[];
  recomendacion: string;
}

export interface ReduccionSancionRequest {
  monto_sancion_base_cop: number;
  sin_sanciones_ultimos_2_anos: boolean;
  sin_sanciones_ultimo_1_ano: boolean;
}

export interface ReduccionSancionResponse {
  monto_sancion_plena_cop: number;
  porcentaje_reduccion_aplicado: number;
  sancion_final_reducida_cop: number;
  ahorro_sancion_cop: number;
  articulo_aplicable: string;
  explicacion: string;
}

export interface AjusteArticulo73Item {
  ano_adquisicion: string;
  acciones_aportes: number;
  bienes_raices_urbanos: number;
  bienes_raices_rurales_agro: number;
  bienes_raices_rurales: number;
}

export interface SimulacionAjusteArticulo73Request {
  ano_adquisicion: string;
  tipo_activo: string;
  costo_adquisicion_historico_cop: number;
  precio_venta_estimado_cop?: number;
  ano_gravable_enajenacion?: number;
}

export interface SimulacionAjusteArticulo73Response {
  ano_adquisicion: string;
  tipo_activo: string;
  tipo_activo_label: string;
  factor_multiplicador: number;
  costo_adquisicion_historico_cop: number;
  costo_fiscal_ajustado_art73_cop: number;
  incremento_costo_fiscal_cop: number;
  precio_venta_cop?: number;
  ganancia_sin_ajuste_cop?: number;
  ganancia_con_ajuste_cop?: number;
  ahorro_base_gravable_cop?: number;
  tarifa_ganancia_ocasional_pct: number;
  impuesto_estimado_sin_ajuste_cop?: number;
  impuesto_estimado_con_ajuste_cop?: number;
  ahorro_impuesto_estimado_cop?: number;
  es_ganancia_ocasional: boolean;
  fundamento_legal: string;
  explicacion_didactica: string;
  pasos_calculo: string[];
}

export interface EscenarioComparativoInmueble {
  nombre: string;
  descripcion: string;
  costo_fiscal_aplicado_cop: number;
  ganancia_ocasional_bruta_cop: number;
  exencion_art44_cop: number;
  exencion_afc_cop: number;
  ganancia_ocasional_gravable_cop: number;
  impuesto_ganancia_ocasional_cop: number;
  retefuente_notarial_cop: number;
  ahorro_frente_a_sin_planeacion_cop: number;
}

export interface SimulacionInmuebleAfcRequest {
  precio_venta_cop: number;
  costo_adquisicion_historico_cop?: number;
  costo_historico_cop?: number;
  costo_fiscal_inmueble_cop?: number;
  ano_adquisicion?: string;
  tipo_inmueble?: string;
  metodo_costo_fiscal?: string;
  metodo_costo?: string;
  costo_fiscal_personalizado_cop?: number;
  costo_personalizado_cop?: number;
  mejoras_y_contribuciones_cop?: number;
  mejoras_adiciones_cop?: number;
  depreciacion_acumulada_deducida_cop?: number;
  depreciacion_acumulada_cop?: number;
  es_vivienda_habitacion?: boolean;
  es_casa_habitacion?: boolean;
  posesion_mas_2_anos?: boolean;
  posesion_mayor_a_2_anos?: boolean;
  monto_depositado_afc_o_vivienda_cop?: number;
  monto_consignado_afc_cop?: number;
  tax_year?: number;
  custom_uvt?: number;
}

export interface SimulacionInmuebleAfcResponse {
  tax_year: number;
  uvt_value: number;
  precio_venta_cop: number;
  costo_historico_cop: number;
  ano_adquisicion: string;
  tipo_inmueble: string;
  metodo_costo_fiscal_aplicado: string;
  factor_art73_aplicado?: number | null;
  costo_fiscal_determinado_cop: number;
  costo_fiscal_cop: number;
  ganancia_ocasional_bruta_cop: number;
  es_vivienda_habitacion: boolean;
  posesion_mas_2_anos: boolean;
  aplica_art44_pre1987: boolean;
  porcentaje_exencion_art44_pct: number;
  ganancia_exenta_art44_cop: number;
  monto_depositado_afc_cop: number;
  tope_maximo_exencion_uvt: number;
  tope_maximo_exencion_cop: number;
  ganancia_exenta_afc_art311_1_cop: number;
  ganancia_ocasional_exenta_total_cop: number;
  ganancia_ocasional_exenta_cop: number;
  ganancia_ocasional_gravada_final_cop: number;
  tarifa_ganancia_ocasional_pct: number;
  impuesto_go_sin_planeacion_cop: number;
  impuesto_go_sin_beneficios_cop?: number;
  impuesto_go_con_beneficios_cop: number;
  impuesto_go_sin_afc_cop: number;
  impuesto_go_con_afc_cop: number;
  ahorro_total_impuesto_cop: number;
  ahorro_impuesto_afc_cop: number;
  porcentaje_ahorro_tributario_pct: number;
  retefuente_notarial_tarifa_base_pct: number;
  porcentaje_reduccion_retefuente_art399_pct: number;
  retefuente_notarial_sin_beneficio_cop: number;
  retefuente_notarial_final_cop: number;
  retencion_en_fuente_notarial_cop?: number;
  ahorro_retefuente_notarial_cop: number;
  total_ganancia_exenta_cop?: number;
  casilla_80_ingresos_brutos_cop?: number;
  casilla_81_costos_cop?: number;
  casilla_82_exentas_cop?: number;
  casilla_83_gravables_cop?: number;
  casilla_87_impuesto_go_cop?: number;
  escenarios: EscenarioComparativoInmueble[];
  matriz_comparativa_escenarios?: any[];
  estrategias_aplicadas: string[];
  requisitos_estatuto: string[];
  advertencias_legales: string[];
  explicacion_paso_a_paso: string[];
}

export interface ItemTablaComponenteInflacionario {
  ano_gravable: number;
  decreto_reglamentario: string;
  porcentaje_rendimientos_nacionales: number;
  porcentaje_fics_fondos: number;
  porcentaje_moneda_extranjera: number;
  porcentaje_no_deducible_gastos_interes: number;
  inflacion_dane_pct: number;
  tasa_captacion_superfinanciera_pct: number;
  reajuste_fiscal_art70_pct: number;
  es_proyectado: boolean;
}

export interface SimulacionComponenteInflacionarioRequest {
  tax_year: number;
  tipo_instrumento: 'nacional_financiero' | 'fics_fondos_mutuos' | 'moneda_extranjera' | 'gastos_intereses_costo' | string;
  monto_bruto_cop: number;
  porcentaje_personalizado_pct?: number | null;
  tarifa_marginal_estimada_pct?: number;
}

export interface SimulacionComponenteInflacionarioResponse {
  tax_year: number;
  decreto_reglamentario: string;
  tipo_instrumento: string;
  tipo_instrumento_label: string;
  monto_bruto_cop: number;
  porcentaje_inflacionario_aplicado: number;
  es_porcentaje_personalizado: boolean;
  monto_incrngo_no_gravado_cop: number;
  monto_gravable_real_cop: number;
  monto_no_deducible_intereses_cop?: number | null;
  monto_deducible_intereses_reales_cop?: number | null;
  tarifa_marginal_estimada_pct: number;
  ahorro_estimado_impuesto_cop: number;
  casilla_f210_asociada: string;
  casilla_f210_numero: number;
  fundamento_legal: string;
  explicacion_didactica: string;
  pasos_calculo: string[];
  combinabilidad_art73: {
    combinable_con_art73: boolean;
    acumulable_art70_con_art73_mismo_activo: boolean;
    explicacion_combinabilidad: string;
  };
}

export interface SimulacionCombinabilidadRequest {
  tax_year: number;
  rendimientos_financieros_brutos_cop: number;
  ano_adquisicion_activo: string;
  tipo_activo: string;
  costo_historico_activo_cop: number;
  precio_venta_activo_cop: number;
  tarifa_marginal_renta_pct: number;
}

export interface SimulacionCombinabilidadResponse {
  tax_year: number;
  rendimientos_brutos_cop: number;
  porcentaje_inflacionario_aplicado: number;
  incrngo_inflacionario_cop: number;
  rendimiento_gravado_cop: number;
  ahorro_renta_capital_cop: number;
  costo_historico_activo_cop: number;
  factor_art73_aplicado: number;
  costo_ajustado_art73_cop: number;
  precio_venta_activo_cop: number;
  ganancia_sin_art73_cop: number;
  ganancia_con_art73_cop: number;
  ahorro_impuesto_go_cop: number;
  ahorro_total_combinado_cop: number;
  se_pueden_combinar: boolean;
  conclusion_juridica: string;
  advertencia_art70_vs_art73: string;
}

export interface ComparacionPatrimonialRequest {
  tax_year: number;
  custom_uvt?: number;
  patrimonio_liquido_ano_anterior: number;
  patrimonio_bruto_ano_actual: number;
  deudas_ano_actual: number;
  reajustes_fiscales_activos_fijos: number;
  valorizaciones_nominales_o_revalorizaciones: number;
  desvalorizaciones_o_castigos_nominales: number;
  renta_liquida_ordinaria_cedula_general: number;
  rentas_liquidas_pensiones_y_dividendos: number;
  rentas_exentas_totales: number;
  ingresos_no_constitutivos_renta: number;
  ganancia_ocasional_neta: number;
  ingresos_no_gravados_o_recibidos_exterior: number;
  nuevas_deudas_adquiridas_en_el_ano: number;
  desahorro_o_liquidacion_activos_anteriores: number;
  impuesto_renta_y_ganancia_ocasional_pagado: number;
  retenciones_fuente_asumidas_en_el_ano: number;
  gastos_personales_y_consumo_estimado: number;
  perdidas_extraordinarias_no_deducibles: number;
}

export interface ComparacionPatrimonialResponse {
  tax_year: number;
  uvt_value: number;
  patrimonio_liquido_ano_anterior: number;
  patrimonio_bruto_ano_actual: number;
  deudas_ano_actual: number;
  patrimonio_liquido_ano_actual: number;
  variacion_patrimonial_bruta: number;
  ajustes_patrimoniales_netos: number;
  incremento_patrimonial_a_justificar: number;
  total_rentas_justificativas: number;
  total_detracciones_consumos: number;
  capacidad_justificacion_neta: number;
  diferencia_no_justificada: number;
  existe_renta_por_comparacion_patrimonial: boolean;
  renta_liquida_gravable_adicional_cop: number;
  renta_liquida_gravable_adicional_uvt: number;
  impuesto_estimado_comparacion_patrimonial_cop: number;
  estado_patrimonial: 'JUSTIFICADO_CORRECTAMENTE' | 'ALERTA_DESAJUSTE_PATRIMONIAL';
  porcentaje_justificacion: number;
  explicacion_didactica: string;
  recomendaciones_defensa_dian: string[];
  audit_trace: AuditTraceItem[];
}

export interface ConyugeFinanzasInput {
  nombre: string;
  ingresos_laborales_anuales: number;
  aportes_seguridad_social_salud_pension: number;
  tiene_dependiente_general_387: boolean;
  numero_dependientes_adicionales_72uvt: number;
  otras_deducciones_y_exentas_cedula_general: number;
}

export interface TributacionParejaRequest {
  tax_year: number;
  custom_uvt?: number;
  conyuge_a: ConyugeFinanzasInput;
  conyuge_b: ConyugeFinanzasInput;
  rentas_capital_conjuntas_arriendos_intereses: number;
  costos_procedentes_rentas_capital: number;
  intereses_credito_vivienda_conjunto_anual: number;
  valor_activo_adquirido_en_el_ano: number;
  esquema_adquisicion_activo:
    | 'TITULARIDAD_EXCLUSIVA_SIN_FONDOS'
    | 'COPROPIEDAD_PROINDIVISO_50_50'
    | 'MUTUO_PRESTAMO_CON_FECHA_CIERTA';
  distribucion_intereses_vivienda: '50_50' | '100_CONYUGE_A' | '100_CONYUGE_B';
}

export interface LiquidacionIndividualConyuge {
  nombre: string;
  ingresos_laborales_netos: number;
  rentas_capital_asignadas: number;
  costos_capital_asignados: number;
  renta_bruta_cedula_general: number;
  total_deducciones_y_exentas_aplicadas: number;
  renta_liquida_gravable_cop: number;
  renta_liquida_gravable_uvt: number;
  impuesto_renta_determinado_cop: number;
  tarifa_marginal_maxima_aplicada_pct: number;
  tarifa_efectiva_tributacion_pct: number;
  tramo_cero_uvt_aprovechado: number;
}

export interface EscenarioTributarioPareja {
  nombre_escenario: string;
  descripcion: string;
  conyuge_a: LiquidacionIndividualConyuge;
  conyuge_b: LiquidacionIndividualConyuge;
  total_impuesto_familiar_cop: number;
  total_renta_gravable_familiar_cop: number;
  tarifa_efectiva_familiar_pct: number;
}

export interface AnalisisRiesgoPatrimonialConyugal {
  riesgo_comparacion_patrimonial_conyuge_titular: boolean;
  monto_desajuste_potencial_cop: number;
  riesgo_donacion_involuntaria_art302: boolean;
  impuesto_ganancia_ocasional_donacion_cop: number;
  diagnostico_legal: string;
  solucion_recomendada: string;
}

export interface TributacionParejaResponse {
  tax_year: number;
  uvt_value: number;
  escenario_no_optimizado: EscenarioTributarioPareja;
  escenario_optimizado: EscenarioTributarioPareja;
  ahorro_tributario_familiar_neto_cop: number;
  porcentaje_ahorro_familiar_pct: number;
  analisis_riesgo_patrimonial: AnalisisRiesgoPatrimonialConyugal;
  estrategias_aplicadas: string[];
  recomendaciones_legales_y_formales: string[];
  audit_trace: AuditTraceItem[];
}

// RETENCIÓN EN LA FUENTE
export interface TablaRetefuenteItem {
  id: string;
  concepto: string;
  categoria: string;
  base_minima_uvt: number;
  base_minima_cop: number;
  tarifa_declarante: number;
  tarifa_no_declarante: number;
  articulo_et: string;
  observaciones: string;
}

export interface RetefuenteLaboralInput {
  tax_year: number;
  custom_uvt?: number;
  mes_nombre?: string;
  salario_basico: number;
  comisiones_horas_extras?: number;
  viaticos_gravados?: number;
  otros_pagos_laborales?: number;
  aporte_salud_obligatorio?: number;
  aporte_pension_obligatorio?: number;
  fondo_solidaridad_pensional?: number;
  intereses_vivienda_mes?: number;
  medicina_prepagada_mes?: number;
  aplica_dependiente_10pct?: boolean;
  numero_dependientes_adicionales_72uvt?: number;
  aportes_voluntarios_pension_afc?: number;
  otras_rentas_exentas?: number;
  solicitar_25pct_exenta_laboral?: boolean;
}

export interface RetefuenteLaboralOutput {
  tax_year: number;
  uvt_value: number;
  mes_nombre: string;
  total_ingresos_brutos_laborales: number;
  total_incrngo_seguridad_social: number;
  ingreso_laboral_neto: number;
  total_deducciones_solicitadas: number;
  total_deducciones_aceptadas: number;
  total_rentas_exentas_previas: number;
  renta_exenta_laboral_25_aceptada: number;
  total_rentas_exentas_aceptadas: number;
  subtotal_alivios_antes_limite: number;
  limite_conjunto_40pct_cop: number;
  limite_conjunto_uvt_cop: number;
  limite_conjunto_aplicable_cop: number;
  total_alivios_procedentes: number;
  alivios_rechazados_por_limite: number;
  base_gravable_depurada_cop: number;
  base_gravable_depurada_uvt: number;
  rango_tabla_art383: string;
  tarifa_marginal_aplicada_pct: number;
  retencion_fuente_pesos: number;
  porcentaje_efectivo_retencion: number;
  audit_trace: AuditTraceItem[];
}

export interface Formulario350Casillas {
  ano: number;
  periodo_mes: number;
  numero_formulario: string;
  nit: string;
  dv: string;
  razon_social: string;
  cod_direccion_seccional: number;
  actividad_economica?: string;
  c28_base_rentas_trabajo: number;
  c29_base_honorarios: number;
  c30_base_comisiones: number;
  c31_base_servicios: number;
  c32_base_arrendamientos: number;
  c33_base_rendimientos_financieros: number;
  c34_base_enajenacion_activos_fijos: number;
  c35_base_compras: number;
  c36_base_otros_pagos_sujetos: number;
  c37_base_pagos_exterior_renta: number;
  c41_total_bases_renta: number;
  c42_ret_rentas_trabajo: number;
  c43_ret_honorarios: number;
  c44_ret_comisiones: number;
  c45_ret_servicios: number;
  c46_ret_arrendamientos: number;
  c47_ret_rendimientos_financieros: number;
  c48_ret_enajenacion_activos_fijos: number;
  c49_ret_compras: number;
  c50_ret_otros_pagos_sujetos: number;
  c51_ret_pagos_exterior_renta: number;
  c59_total_retenciones_renta_practicadas: number;
  c61_base_autorretencion_especial: number;
  c62_autorretencion_especial_decreto_2201: number;
  c63_base_otras_autorretenciones: number;
  c64_otras_autorretenciones: number;
  c65_total_autorretenciones_renta: number;
  c67_base_iva_responsables: number;
  c68_retencion_iva_practicada: number;
  c69_retencion_iva_prestadores_exterior: number;
  c74_total_retenciones_iva: number;
  c76_base_timbre_nacional: number;
  c77_retencion_timbre: number;
  c82_total_retenciones_periodo: number;
  c83_sanciones: number;
  c84_total_saldo_a_pagar: number;
}

export interface RetefuenteF350Input {
  tax_year: number;
  custom_uvt?: number;
  periodo_mes: number;
  razon_social: string;
  nit: string;
  dv: string;
  actividad_economica?: string;
  base_rentas_trabajo?: number;
  ret_rentas_trabajo_manual?: number;
  retencion_rentas_trabajo?: number;
  base_honorarios_declarante?: number;
  base_honorarios_no_declarante?: number;
  base_comisiones_declarante?: number;
  base_comisiones_no_declarante?: number;
  base_servicios_declarante?: number;
  base_servicios_no_declarante?: number;
  base_servicios_transporte_carga?: number;
  base_compras_declarante?: number;
  base_compras_no_declarante?: number;
  base_arrendamiento_inmuebles?: number;
  base_arrendamiento_muebles?: number;
  base_rendimientos_financieros?: number;
  base_enajenacion_activos_fijos?: number;
  base_pagos_exterior_servicios?: number;
  base_pagos_exterior_paraisos?: number;
  ingresos_brutos_propios_mes?: number;
  tarifa_autorretencion_especial_pct?: number;
  otras_autorretenciones_valor?: number;
  base_iva_sujeto_reteiva?: number;
  reteiva_servicios_exterior?: number;
  base_impuesto_timbre?: number;
  tarifa_timbre_pct?: number;
  sanciones?: number;
}

export interface RetefuenteF350Output {
  tax_year: number;
  uvt_value: number;
  periodo_mes: number;
  periodo_nombre: string;
  razon_social: string;
  nit: string;
  dv: string;
  total_bases_renta: number;
  total_retenciones_renta_practicadas: number;
  total_autorretenciones_renta: number;
  total_retenciones_iva_practicadas: number;
  total_retenciones_timbre: number;
  total_retenciones_periodo: number;
  sanciones: number;
  total_a_pagar: number;
  casillas: Formulario350Casillas;
  audit_trace: AuditTraceItem[];
  resumen_ejecutivo: string;
}

// IMPUESTO SOBRE LAS VENTAS (IVA)
export interface BienServicioIvaItem {
  id: string;
  nombre: string;
  categoria: string;
  tratamiento: string;
  tarifa_pct: number;
  articulo_et: string;
  derecho_devolucion_iva: boolean;
  descripcion_tecnica: string;
}

export interface IvaProrrateoInput {
  tax_year: number;
  custom_uvt?: number;
  ingresos_gravados_19: number;
  ingresos_gravados_5: number;
  ingresos_exentos_0: number;
  ingresos_excluidos: number;
  ingresos_no_gravados?: number;
  iva_comun_en_compras_gastos: number;
}

export interface IvaProrrateoOutput {
  tax_year: number;
  total_ingresos_con_derecho: number;
  total_ingresos_operacionales: number;
  factor_prorrateo_porcentaje: number;
  factor_prorrateo_decimal: number;
  iva_comun_total: number;
  iva_descontable_aceptado_f300: number;
  iva_rechazado_mayor_costo_renta: number;
  explicacion_didactica: string;
  audit_trace: AuditTraceItem[];
}

export interface Formulario300Casillas {
  ano: number;
  periodo: number;
  tipo_periodicidad: string;
  numero_formulario: string;
  nit: string;
  dv: string;
  razon_social: string;
  cod_direccion_seccional: number;
  actividad_economica: string;
  c27_ingresos_bienes_gravados_5: number;
  c28_ingresos_bienes_gravados_19: number;
  c29_ingresos_servicios_gravados_5: number;
  c30_ingresos_servicios_gravados_19: number;
  c34_operaciones_exentas_art477: number;
  c35_exportaciones_bienes: number;
  c36_exportaciones_servicios: number;
  c37_operaciones_excluidas: number;
  c38_operaciones_no_gravadas: number;
  c41_total_ingresos_brutos: number;
  c42_devoluciones_en_ventas: number;
  c43_total_ingresos_netos: number;
  c45_iva_gravados_5: number;
  c46_iva_gravados_19: number;
  c56_total_iva_generado_operaciones: number;
  c57_iva_devoluciones_en_compras: number;
  c58_total_iva_generado: number;
  c66_compras_bienes_gravados_5: number;
  c67_compras_bienes_gravados_19: number;
  c68_servicios_gravados_5: number;
  c69_servicios_gravados_19: number;
  c72_importaciones_gravadas_5: number;
  c73_importaciones_gravadas_19: number;
  c74_compras_bienes_excluidos_exentos: number;
  c75_servicios_excluidos_exentos: number;
  c79_total_compras_importaciones_brutas: number;
  c80_devoluciones_en_compras: number;
  c81_descontable_compras_5: number;
  c82_descontable_compras_19: number;
  c83_descontable_servicios_5: number;
  c84_descontable_servicios_19: number;
  c87_descontable_importaciones_5: number;
  c88_descontable_importaciones_19: number;
  c90_descontable_iva_comun_prorrateado: number;
  c95_iva_devoluciones_en_ventas: number;
  c96_total_iva_descontable: number;
  c98_saldo_a_pagar_periodo: number;
  c99_saldo_a_favor_periodo: number;
  c100_saldo_a_favor_periodo_anterior: number;
  c101_retenciones_iva_que_le_practicaron: number;
  c104_sanciones: number;
  c105_total_saldo_a_pagar: number;
  c106_total_saldo_a_favor: number;
}

export interface IvaF300Input {
  tax_year: number;
  custom_uvt?: number;
  tipo_periodicidad: string;
  periodo: number;
  razon_social: string;
  nit: string;
  dv: string;
  actividad_economica?: string;
  ingresos_bienes_gravados_5?: number;
  ingresos_bienes_gravados_19?: number;
  ingresos_servicios_gravados_5?: number;
  ingresos_servicios_gravados_19?: number;
  operaciones_exentas_art477?: number;
  exportaciones_bienes?: number;
  exportaciones_servicios?: number;
  operaciones_excluidas?: number;
  operaciones_no_gravadas?: number;
  devoluciones_en_ventas?: number;
  compras_bienes_gravados_5?: number;
  compras_bienes_gravados_19?: number;
  servicios_gravados_5?: number;
  servicios_gravados_19?: number;
  importaciones_gravadas_5?: number;
  importaciones_gravadas_19?: number;
  compras_bienes_excluidos_exentos?: number;
  servicios_excluidos_exentos?: number;
  devoluciones_en_compras?: number;
  iva_comun_sujeto_prorrateo?: number;
  retenciones_iva_practicadas_a_favor?: number;
  saldo_a_favor_periodo_anterior?: number;
  sanciones?: number;
}

export interface IvaF300Output {
  tax_year: number;
  uvt_value: number;
  tipo_periodicidad: string;
  periodo: number;
  periodo_nombre: string;
  razon_social: string;
  nit: string;
  dv: string;
  total_ingresos_brutos: number;
  total_ingresos_netos: number;
  total_iva_generado: number;
  total_compras_brutas: number;
  total_iva_descontable: number;
  factor_prorrateo_art490_pct: number;
  iva_comun_rechazado_renta: number;
  saldo_periodo_a_pagar: number;
  saldo_periodo_a_favor: number;
  total_saldo_a_pagar: number;
  total_saldo_a_favor: number;
  casillas: Formulario300Casillas;
  audit_trace: AuditTraceItem[];
  resumen_ejecutivo: string;
}


