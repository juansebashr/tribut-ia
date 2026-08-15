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
  rentas_trabajo: number;
  viaticos: number;
  otros_ingresos_brutos: number;
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
  descuentos_tributarios: number;
  retenciones_fuente_practicadas: number;
  anticipo_ano_anterior: number;
  saldo_a_favor_ano_anterior: number;
}

export interface PersonaNaturalOutput {
  tax_year: number;
  uvt_value: number;
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
  total_anticipos_y_retenciones: number;
  saldo_a_pagar: number;
  saldo_a_favor: number;
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
