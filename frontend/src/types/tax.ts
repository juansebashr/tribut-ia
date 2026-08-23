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

export interface PersonaJuridicaInput {
  tax_year: number;
  custom_uvt?: number;
  tarifa_personalizada?: number;
  ingresos_brutos_operacionales: number;
  ingresos_brutos_no_operacionales: number;
  devoluciones_rebajas_descuentos: number;
  ingresos_no_constitutivos_renta: number;
  costos_procedentes: number;
  gastos_administracion: number;
  gastos_ventas: number;
  gastos_financieros: number;
  gastos_no_deducibles: number;
  deducciones_especiales: number;
  rentas_exentas: number;
  compensacion_perdidas_fiscales: number;
  compensacion_exceso_renta_presuntiva: number;
  utilidad_contable_antes_impuestos: number;
  diferencias_permanentes_ttd: number;
  ganancia_ocasional_gravable: number;
  descuento_tributario_ica: number;
  otros_descuentos_tributarios: number;
  retenciones_en_la_fuente: number;
  autorretenciones_practicadas: number;
  anticipo_ano_anterior: number;
  saldo_a_favor_ano_anterior: number;
}

export interface PersonaJuridicaOutput {
  tax_year: number;
  uvt_value: number;
  ingresos_brutos_totales: number;
  ingresos_netos: number;
  renta_bruta: number;
  total_gastos_deducibles: number;
  renta_liquida_ordinaria: number;
  renta_liquida_gravable: number;
  tarifa_renta_aplicada: number;
  impuesto_basico_renta: number;
  ttd_calculada_pct: number;
  aplica_impuesto_adicional_ttd: boolean;
  impuesto_adicional_ttd: number;
  impuesto_ganancias_ocasionales: number;
  total_descuentos_tributarios_aplicados: number;
  impuesto_neto_total: number;
  total_retenciones_y_anticipos: number;
  saldo_a_pagar: number;
  saldo_a_favor: number;
  audit_trace: AuditTraceItem[];
  resumen_ejecutivo: string;
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
    tasa_minima_ttd: { aplica: boolean; tarifa_minima: number };
    descuentos: { ica_descuento_porcentaje: number; donaciones_porcentaje: number };
  };
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

  // Estrategia 4: Art. 44 (pre-1987)
  aplica_art44_pre1987: boolean;
  porcentaje_exencion_art44_pct: number;
  ganancia_exenta_art44_cop: number;

  // Estrategia 3: Art. 311-1 (AFC)
  monto_depositado_afc_cop: number;
  tope_maximo_exencion_uvt: number;
  tope_maximo_exencion_cop: number;
  ganancia_exenta_afc_art311_1_cop: number;

  // Totales
  ganancia_ocasional_exenta_total_cop: number;
  ganancia_ocasional_exenta_cop: number;
  ganancia_ocasional_gravada_final_cop: number;
  tarifa_ganancia_ocasional_pct: number;

  // Impuestos y ahorros
  impuesto_go_sin_planeacion_cop: number;
  impuesto_go_sin_beneficios_cop?: number;
  impuesto_go_con_beneficios_cop: number;
  impuesto_go_sin_afc_cop: number;
  impuesto_go_con_afc_cop: number;
  ahorro_total_impuesto_cop: number;
  ahorro_impuesto_afc_cop: number;
  porcentaje_ahorro_tributario_pct: number;

  // Retención notarial
  retefuente_notarial_tarifa_base_pct: number;
  porcentaje_reduccion_retefuente_art399_pct: number;
  retefuente_notarial_sin_beneficio_cop: number;
  retefuente_notarial_final_cop: number;
  retencion_en_fuente_notarial_cop?: number;
  ahorro_retefuente_notarial_cop: number;

  // Casillas oficiales Formulario 210
  total_ganancia_exenta_cop?: number;
  casilla_80_ingresos_brutos_cop?: number;
  casilla_81_costos_cop?: number;
  casilla_82_exentas_cop?: number;
  casilla_83_gravables_cop?: number;
  casilla_87_impuesto_go_cop?: number;

  // Escenarios
  escenarios: EscenarioComparativoInmueble[];
  matriz_comparativa_escenarios?: any[];

  // Didáctica
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
