export * from './tax';

export interface ReconciliationItem {
  id: string;
  fecha: string;
  archivo_origen?: string;
  soporte_documento?: string;
  fila_origen?: number;
  tercero_nombre: string;
  tercero_nit: string;
  descripcion: string;
  tipo_movimiento?: string;
  valor_cop: number;
  valor_declarado_cop?: number;
  cedula?: string;
  cedula_destino?: string;
  concepto_tributario?: string;
  beneficio_asociado?: string;
  confianza_clasificacion?: string;
  observaciones?: string;
  estado_exogena?: string;
  estado_conciliacion?: string;
  valor_exogena_cop?: number | null;
  diferencia_exogena_cop?: number | null;
  resolucion_usuario?: string;
  casilla_f210_nombre?: string;
  casilla_f210_sugerida?: string;
  explicacion_didactica?: string;
  norma_et?: string;
}

export interface CsvValidationError {
  row?: number;
  fila?: number;
  column?: string;
  campo?: string;
  value?: string;
  valor_encontrado?: string;
  error?: string;
  mensaje?: string;
}

export interface ReconciliationResponse {
  transacciones?: ReconciliationItem[];
  items?: ReconciliationItem[];
  total_transacciones?: number;
  total_valor_declarado_cop?: number;
  total_valor_exogena_cop?: number;
  total_diferencias_cop?: number;
  resumen_por_estado?: Record<string, number>;
  resumen_por_cedula?: Record<string, number>;
  alertas_criticas?: string[];
  errores_validacion?: CsvValidationError[];
  validation_errors?: CsvValidationError[];
}

export interface SessionState {
  session_id: string;
  tax_year: number;
  custom_uvt?: number;
  persona_natural?: any;
  persona_juridica?: any;
  beneficios_auditoria?: any;
  reconciliation?: any;
  updated_at?: string;
}
