import React, { useState } from 'react';
import type { PersonaNaturalInput, PersonaNaturalOutput } from '../../../types/tax';
import { formatCOP, parseCOP } from '../../../utils/formatters';
import { PnWaterfallChart } from './PnWaterfallChart';
import { PnTaxGauge } from './PnTaxGauge';
import { PnPdfReportModal } from './PnPdfReportModal';

interface PnCalcSubtabProps {
  inputs: PersonaNaturalInput;
  setInputs: React.Dispatch<React.SetStateAction<PersonaNaturalInput>>;
  result: PersonaNaturalOutput | null;
  taxYear?: number;
  uvtValue?: number;
  onOpenAudit: () => void;
  onNavigateToF210: () => void;
  loadPresetStandard: () => void;
  loadPreset35: () => void;
  loadPresetGo: () => void;
  declaranteNombre?: string;
  setDeclaranteNombre?: (val: string) => void;
  declaranteNit?: string;
  setDeclaranteNit?: (val: string) => void;
  onNavigateToAnticipo?: () => void;
}

export const PnCalcSubtab: React.FC<PnCalcSubtabProps> = ({
  inputs,
  setInputs,
  result,
  taxYear = 2026,
  uvtValue = 49799,
  onOpenAudit,
  onNavigateToF210,
  loadPresetStandard,
  loadPreset35,
  loadPresetGo,
  declaranteNombre,
  setDeclaranteNombre,
  declaranteNit,
  setDeclaranteNit,
  onNavigateToAnticipo,
}) => {
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  const handleNumChange = (field: keyof PersonaNaturalInput, valStr: string) => {
    const num = parseCOP(valStr);
    setInputs((prev) => ({ ...prev, [field]: num }));
  };

  const handleCheckboxChange = (field: keyof PersonaNaturalInput, checked: boolean) => {
    setInputs((prev) => ({ ...prev, [field]: checked }));
  };

  return (
    <div id="pane-pn-calc" className="module-pane active">
      {/* BARRA DE PRESETS ESTANDARIZADA */}
      <div className="presets-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div className="presets-toolbar-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="presets-toolbar-label">⚡ Ejemplos Rápidos:</span>
          <button className="btn btn-outline btn-sm" onClick={loadPresetStandard}>
            ✨ Ejemplo Estándar (28%)
          </button>
          <button className="btn btn-outline btn-sm" onClick={loadPreset35}>
            🔥 Altos Ingresos (35%)
          </button>
          <button className="btn btn-outline btn-sm" onClick={loadPresetGo}>
            🏢 Ganancia Ocasional
          </button>
        </div>
        <div className="presets-toolbar-actions">
          <button
            className="btn btn-export-outline btn-sm"
            onClick={() => setIsPdfModalOpen(true)}
            title="Generar dictamen ejecutivo formal para imprimir o guardar en PDF"
            style={{ fontWeight: 700 }}
          >
            <span>📄</span> Dictamen PDF <span className="export-badge">PDF</span>
          </button>
        </div>
      </div>

      <div className="calc-grid">
        {/* INPUTS */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Datos del Declarante y Cédula General</h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cálculo reactivo en tiempo real</span>
          </div>

          <div className="card-body">
            {/* DATOS DECLARANTE */}
            <div className="form-section">
              <h3 className="section-title">Datos de Identificación del Contribuyente</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Nombres y Apellidos</label>
                  <input
                    type="text"
                    id="pn_nombre_declarante"
                    className="text-input"
                    value={declaranteNombre ?? 'JUAN PABLO HERNANDEZ GOMEZ'}
                    onChange={(e) => setDeclaranteNombre?.(e.target.value)}
                  />
                </div>
                <div className="input-field">
                  <label className="input-label">Número de NIT / Cédula</label>
                  <input
                    type="text"
                    id="pn_nit_declarante"
                    className="text-input"
                    value={declaranteNit ?? '79463249'}
                    onChange={(e) => setDeclaranteNit?.(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* PATRIMONIO */}
            <div className="form-section">
              <h3 className="section-title">Patrimonio a 31 de Diciembre (Casillas 29, 30, 31)</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Total Patrimonio Bruto (Casilla 29)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_patrimonio_bruto"
                      className="currency-input"
                      value={formatCOP(inputs.patrimonio_bruto ?? 300000000, false)}
                      onChange={(e) => handleNumChange('patrimonio_bruto', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Total Deudas (Casilla 30)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_deudas"
                      className="currency-input"
                      value={formatCOP(inputs.deudas ?? 80000000, false)}
                      onChange={(e) => handleNumChange('deudas', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* INGRESOS LABORALES */}
            <div className="form-section">
              <h3 className="section-title">Rentas de Trabajo (Cédula General - Casilla 32)</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Ingresos Brutos de Trabajo (Salarios / Comisiones)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_rentas_trabajo"
                      className="currency-input"
                      value={formatCOP(inputs.rentas_trabajo, false)}
                      onChange={(e) => handleNumChange('rentas_trabajo', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Viáticos Gravados</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_viaticos"
                      className="currency-input"
                      value={formatCOP(inputs.viaticos, false)}
                      onChange={(e) => handleNumChange('viaticos', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Otros Ingresos Cédula General</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_otros_ingresos"
                      className="currency-input"
                      value={formatCOP(inputs.otros_ingresos_brutos, false)}
                      onChange={(e) => handleNumChange('otros_ingresos_brutos', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* OTRAS RENTAS CEDULA GENERAL (CAPITAL Y NO LABORALES) */}
            <div className="form-section">
              <h3 className="section-title">Otras Rentas: Capital y No Laborales (Casillas 58 y 74)</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Rentas de Capital (Intereses / Arrendamientos - Casilla 58)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_rentas_capital"
                      className="currency-input"
                      value={formatCOP(inputs.rentas_capital ?? 0, false)}
                      onChange={(e) => handleNumChange('rentas_capital', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">INCRNGO Rentas de Capital (Casilla 59)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_incrngo_capital"
                      className="currency-input"
                      value={formatCOP(inputs.incrngo_capital ?? 0, false)}
                      onChange={(e) => handleNumChange('incrngo_capital', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Rentas No Laborales (Honorarios sin relación laboral - Casilla 74)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_rentas_nolaborales"
                      className="currency-input"
                      value={formatCOP(inputs.rentas_nolaborales ?? 0, false)}
                      onChange={(e) => handleNumChange('rentas_nolaborales', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">INCRNGO Rentas No Laborales (Casilla 76)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_incrngo_nolaborales"
                      className="currency-input"
                      value={formatCOP(inputs.incrngo_nolaborales ?? 0, false)}
                      onChange={(e) => handleNumChange('incrngo_nolaborales', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Costos Procedentes No Laborales (Casilla 77)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_costos_nolaborales"
                      className="currency-input"
                      value={formatCOP(inputs.costos_nolaborales ?? 0, false)}
                      onChange={(e) => handleNumChange('costos_nolaborales', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* INCRNGO TRABAJO */}
            <div className="form-section">
              <h3 className="section-title">INCRNGO Rentas de Trabajo (Casilla 33)</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Aporte Salud Obligatorio (EPS)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_salud"
                      className="currency-input"
                      value={formatCOP(inputs.aporte_salud_obligatorio, false)}
                      onChange={(e) => handleNumChange('aporte_salud_obligatorio', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Aporte Pensión Obligatoria & FSP</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_pension"
                      className="currency-input"
                      value={formatCOP(inputs.aporte_pension_obligatorio, false)}
                      onChange={(e) => handleNumChange('aporte_pension_obligatorio', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* DEDUCCIONES */}
            <div className="form-section">
              <h3 className="section-title">Deducciones Imputables (Casillas 38, 39, 40)</h3>
              <div style={{ marginBottom: '12px' }}>
                <label className="checkbox-group">
                  <input
                    type="checkbox"
                    id="pn_dependiente_general"
                    checked={inputs.aplica_dependiente_general}
                    onChange={(e) => handleCheckboxChange('aplica_dependiente_general', e.target.checked)}
                  />
                  <div>
                    <strong style={{ fontSize: '13px' }}>
                      Deducción Dependiente Económico General (Art. 387 E.T.)
                    </strong>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      10% de ingresos de trabajo hasta máx 384 UVT
                    </p>
                  </div>
                </label>
              </div>

              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">
                    <span>Intereses Vivienda / Leasing (Casilla 38)</span>
                    <span className="input-helper">Máx 1.200 UVT</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_vivienda"
                      className="currency-input"
                      value={formatCOP(inputs.intereses_vivienda_anual, false)}
                      onChange={(e) => handleNumChange('intereses_vivienda_anual', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">
                    <span>Medicina Prepagada Anual</span>
                    <span className="input-helper">Máx 192 UVT</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_prepagada"
                      className="currency-input"
                      value={formatCOP(inputs.medicina_prepagada_anual, false)}
                      onChange={(e) => handleNumChange('medicina_prepagada_anual', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">
                    <span>GMF (4x1000) Pagado</span>
                    <span className="input-helper">50% deducible</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_gmf"
                      className="currency-input"
                      value={formatCOP(inputs.gmf_4x1000_total, false)}
                      onChange={(e) => handleNumChange('gmf_4x1000_total', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">
                    <span>Compras Factura Electrónica (Casilla 28)</span>
                    <span className="input-helper">1% deducible (Máx 240 UVT)</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_factura_elec"
                      className="currency-input"
                      value={formatCOP(inputs.compras_factura_electronica, false)}
                      onChange={(e) => handleNumChange('compras_factura_electronica', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RENTAS EXENTAS */}
            <div className="form-section">
              <h3 className="section-title">Rentas Exentas (Casillas 35, 36, 37)</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">
                    <span>Aportes Voluntarios AFC / Pensión (Casilla 35)</span>
                    <span className="input-helper">Máx 30% / 3.800 UVT</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_afc"
                      className="currency-input"
                      value={formatCOP(inputs.aportes_voluntarios_pension_afc, false)}
                      onChange={(e) => handleNumChange('aportes_voluntarios_pension_afc', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Otras Rentas Exentas (Cesantías, etc. - Casilla 36)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_otras_exentas"
                      className="currency-input"
                      value={formatCOP(inputs.otras_rentas_exentas, false)}
                      onChange={(e) => handleNumChange('otras_rentas_exentas', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* GANANCIAS OCASIONALES */}
            <div className="form-section">
              <h3 className="section-title">Ganancias Ocasionales (Casillas 112 a 115)</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">
                    <span>Venta Activos Fijos (&gt;= 2 años)</span>
                    <span className="input-helper">Inmuebles / Vehículos</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_go_activos"
                      className="currency-input"
                      value={formatCOP(inputs.ganancias_ocasionales_brutas_activos_fijos ?? 0, false)}
                      onChange={(e) => handleNumChange('ganancias_ocasionales_brutas_activos_fijos', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">(-) Costo Fiscal del Activo Vendido</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_go_costos"
                      className="currency-input"
                      value={formatCOP(inputs.costos_ganancia_ocasional ?? 0, false)}
                      onChange={(e) => handleNumChange('costos_ganancia_ocasional', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Herencias, Legados o Donaciones</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_go_herencias"
                      className="currency-input"
                      value={formatCOP(inputs.ganancias_ocasionales_brutas_herencias ?? 0, false)}
                      onChange={(e) => handleNumChange('ganancias_ocasionales_brutas_herencias', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">
                    <span>Loterías, Rifas y Juegos</span>
                    <span className="input-helper">Tarifa 20%</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_go_loterias"
                      className="currency-input"
                      value={formatCOP(inputs.ganancias_ocasionales_brutas_loterias ?? 0, false)}
                      onChange={(e) => handleNumChange('ganancias_ocasionales_brutas_loterias', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">
                    <span>(-) Exenciones GO Solicitadas</span>
                    <span className="input-helper">Art. 307 E.T.</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_go_exentas"
                      className="currency-input"
                      value={formatCOP(inputs.ganancias_ocasionales_exentas_solicitadas ?? 0, false)}
                      onChange={(e) => handleNumChange('ganancias_ocasionales_exentas_solicitadas', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RETENCIONES Y PAGOS */}
            <div className="form-section">
              <h3 className="section-title">Retenciones y Pagos Previos (Casillas 130 a 132)</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Retenciones en la Fuente (Casilla 132)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_retenciones"
                      className="currency-input"
                      value={formatCOP(inputs.retenciones_fuente_practicadas, false)}
                      onChange={(e) => handleNumChange('retenciones_fuente_practicadas', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Saldo a Favor Año Anterior (Casilla 131)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_saldo_favor_anterior"
                      className="currency-input"
                      value={formatCOP(inputs.saldo_a_favor_ano_anterior, false)}
                      onChange={(e) => handleNumChange('saldo_a_favor_ano_anterior', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Anticipo Renta Año Anterior (Casilla 130)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_anticipo"
                      className="currency-input"
                      value={formatCOP(inputs.anticipo_ano_anterior, false)}
                      onChange={(e) => handleNumChange('anticipo_ano_anterior', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field" style={{ border: '1px solid #bfdbfe', padding: '10px', borderRadius: '8px', backgroundColor: '#f0f9ff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="input-label" style={{ fontWeight: 700, color: '#0369a1', margin: 0 }}>
                      Anticipo Año Siguiente (Casilla 133 / 135)
                    </label>
                    {onNavigateToAnticipo && (
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        style={{ fontSize: '11px', padding: '2px 8px', borderColor: '#0284c7', color: '#0284c7' }}
                        onClick={onNavigateToAnticipo}
                      >
                        ⚡ Asistente Art. 807
                      </button>
                    )}
                  </div>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="pn_anticipo_siguiente"
                      className="currency-input"
                      value={formatCOP(inputs.anticipo_ano_siguiente ?? 0, false)}
                      onChange={(e) => handleNumChange('anticipo_ano_siguiente', e.target.value)}
                    />
                  </div>
                  <small style={{ color: '#0284c7', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                    Art. 807 E.T. Método 1: $6.015.000 COP | Se suma al saldo final a pagar (Casilla 980).
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RESULTS */}
        <div>
          <div className="card results-card sticky-card">
            <div className="card-header results-card-header">
              <h2 className="card-title">Resumen de Liquidación</h2>
              <button className="btn btn-outline btn-sm" onClick={onOpenAudit}>
                👁️ Ver Auditoría Legal
              </button>
            </div>

            <div className="card-body">
              <div
                id="pn-kpi-box"
                className={`kpi-banner ${(result?.total_a_pagar ?? result?.saldo_a_pagar ?? 0) > 0 ? 'to-pay' : 'to-favor'}`}
              >
                <div>
                  <div id="pn-kpi-label" className="kpi-label">
                    {result && result.saldo_a_favor > 0 && !(result.total_a_pagar && result.total_a_pagar > 0)
                      ? 'Saldo a Favor (Casilla 137)'
                      : 'Total Saldo a Pagar (Casilla 980)'}
                  </div>
                  <div id="pn-kpi-value" className="kpi-value">
                    {result
                      ? formatCOP(
                          (result.total_a_pagar ?? result.saldo_a_pagar) > 0
                            ? (result.total_a_pagar ?? result.saldo_a_pagar)
                            : result.saldo_a_favor
                        )
                      : '$0 COP'}
                  </div>
                </div>
                <span id="pn-kpi-badge" className="badge-uvt">
                  Tarifa: {result ? `${(result.tarifa_marginal_maxima * 100).toFixed(0)}%` : '0%'}
                </span>
              </div>

              <table className="breakdown-table">
                <tbody>
                  <tr>
                    <td>Total Ingresos Brutos (Trabajo + Otras)</td>
                    <td id="res-pn-ingresos-brutos" className="amount">
                      {formatCOP(result?.total_ingresos_brutos)}
                    </td>
                  </tr>
                  <tr>
                    <td>(-) Total INCRNGO</td>
                    <td id="res-pn-incrngo" className="amount negative">
                      -{formatCOP(result?.total_incrngo)}
                    </td>
                  </tr>
                  <tr className="highlight">
                    <td>(=) Total Ingreso Neto (Casilla 91)</td>
                    <td id="res-pn-ingreso-neto" className="amount">
                      {formatCOP(result?.ingreso_neto)}
                    </td>
                  </tr>

                  {/* Detalle y Control de Alivios Sujetos al Tope del 40% (Art. 336 E.T.) */}
                  <tr style={{ background: '#f8fafc', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                    <td colSpan={2} style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          ⚖️ Depuración de Alivios y Tope del 40% (Art. 336 E.T.)
                        </span>
                        <span style={{ fontSize: '11px', color: (result?.alivios_rechazados_por_limite ?? 0) > 0 ? '#b45309' : '#15803d', fontWeight: 700 }}>
                          {(result?.alivios_rechazados_por_limite ?? 0) > 0 ? '⚠️ Límite Excedido' : '✓ Dentro del Límite'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '8px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        <div>
                          • Deducciones sujetas al 40%: <strong id="res-pn-deducciones" style={{ color: 'var(--text-primary)' }}>{formatCOP(result?.total_deducciones_sujetas_40 ?? result?.total_deducciones_aceptadas)}</strong>
                        </div>
                        <div>
                          • Total rentas exentas (AFC + 25% laboral): <strong id="res-pn-total-exentas-logradas" style={{ color: 'var(--text-primary)' }}>{formatCOP(result?.total_rentas_exentas_aceptadas)}</strong>
                          <div style={{ fontSize: '10.5px', color: '#94a3b8', marginLeft: '10px' }}>
                            (AFC/Otras: {formatCOP(result?.total_rentas_exentas_previas)} | 25% Laboral: {formatCOP(result?.renta_exenta_laboral_25)})
                          </div>
                        </div>
                        <div>
                          • Subtotal alivios calculados: <strong style={{ color: 'var(--text-primary)' }}>{formatCOP(result?.subtotal_alivios_antes_de_limite)}</strong>
                        </div>
                        <div>
                          • Tope legal máximo (40% / 1.340 UVT): <strong id="res-pn-limite-conjunto" style={{ color: '#d97706' }}>Máx. {formatCOP(result?.limite_conjunto_aplicable_cop)}</strong>
                        </div>
                      </div>

                      {(result?.alivios_rechazados_por_limite ?? 0) > 0 ? (
                        <div style={{ marginTop: '8px', fontSize: '11px', color: '#b91c1c', background: '#fef2f2', padding: '6px 10px', borderRadius: '6px', border: '1px solid #fecaca' }}>
                          ⚠️ <strong>Tope aplicado:</strong> Los alivios calculados ({formatCOP(result?.subtotal_alivios_antes_de_limite)}) superan el tope legal de {formatCOP(result?.limite_conjunto_aplicable_cop)}. El excedente de <strong>{formatCOP(result?.alivios_rechazados_por_limite)}</strong> queda rechazado y solo proceden <strong>{formatCOP(result?.alivios_procedentes_finales)}</strong>.
                        </div>
                      ) : (
                        <div style={{ marginTop: '8px', fontSize: '11px', color: '#15803d', background: '#f0fdf4', padding: '6px 10px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                          ✓ <strong>100% de alivios aceptados:</strong> El subtotal de alivios ({formatCOP(result?.subtotal_alivios_antes_de_limite)}) no supera el tope legal máximo de {formatCOP(result?.limite_conjunto_aplicable_cop)}.
                        </div>
                      )}
                    </td>
                  </tr>

                  {/* Filas Oficiales de Sustracción Casillas F210 */}
                  <tr>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600 }}>(-) Rentas Exentas y Deducciones dentro del Tope (Casilla 92)</span>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Alivios procedentes limitados según Art. 336 E.T.
                        </div>
                      </div>
                    </td>
                    <td id="res-pn-alivios-procedentes" className="amount negative" style={{ fontWeight: 700, color: '#dc2626' }}>
                      -{formatCOP(result?.alivios_procedentes_finales)}
                    </td>
                  </tr>

                  {(result?.deducciones_fuera_limite_40 ?? 0) > 0 && (
                    <tr>
                      <td>
                        <div>
                          <span style={{ fontWeight: 600 }}>(-) Deducción 1% Factura Electrónica (Art. 336 Num. 5)</span>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Deducción especial por adquisiciones soportadas que no computa para el tope del 40%
                          </div>
                        </div>
                      </td>
                      <td id="res-pn-deduccion-fe" className="amount negative" style={{ fontWeight: 700, color: '#dc2626' }}>
                        -{formatCOP(result?.deducciones_fuera_limite_40)}
                      </td>
                    </tr>
                  )}

                  <tr className="highlight" style={{ borderTop: '2px solid var(--primary-border)' }}>
                    <td>(=) Renta Líquida Gravable Cédula General (Casilla 111)</td>
                    <td id="res-pn-renta-gravable" className="amount" style={{ color: 'var(--primary)', fontWeight: 800 }}>
                      {formatCOP(result?.renta_liquida_gravable)}
                    </td>
                  </tr>
                  <tr className="highlight">
                    <td>(=) Impuesto Neto de Renta Cédula General (Casilla 126)</td>
                    <td id="res-pn-impuesto-bruto" className="amount">
                      {formatCOP(result?.impuesto_neto_renta)}
                    </td>
                  </tr>
                  {(result?.impuesto_ganancias_ocasionales ?? 0) > 0 && (
                    <tr>
                      <td>(+) Impuesto de Ganancias Ocasionales (Casilla 128)</td>
                      <td id="res-pn-impuesto-go" className="amount" style={{ color: '#7c3aed', fontWeight: 700 }}>
                        +{formatCOP(result?.impuesto_ganancias_ocasionales)}
                      </td>
                    </tr>
                  )}
                  <tr className="highlight" style={{ background: '#eff6ff', fontWeight: 800 }}>
                    <td>(=) Total Impuesto a Cargo (Casilla 129)</td>
                    <td id="res-pn-total-impuesto-cargo" className="amount">
                      {formatCOP(result?.total_impuesto_a_cargo ?? result?.impuesto_neto_renta)}
                    </td>
                  </tr>
                  <tr>
                    <td>(-) Retenciones y Anticipos Previos (Casillas 130 a 132)</td>
                    <td id="res-pn-retenciones" className="amount negative">
                      -{formatCOP(result?.total_anticipos_y_retenciones)}
                    </td>
                  </tr>

                  {(result?.saldo_a_pagar ?? 0) > 0 ? (
                    <tr className="highlight" style={{ borderTop: '1px dashed var(--border)' }}>
                      <td>(=) Saldo por Impuesto (Casilla 136)</td>
                      <td id="res-pn-saldo-impuesto" className="amount">
                        {formatCOP(result?.saldo_a_pagar)}
                      </td>
                    </tr>
                  ) : (
                    <tr className="highlight" style={{ borderTop: '1px dashed var(--border)', background: '#f0fdf4' }}>
                      <td style={{ color: '#16a34a', fontWeight: 700 }}>(=) Saldo a Favor por Impuesto (Casilla 137)</td>
                      <td id="res-pn-saldo-favor" className="amount" style={{ color: '#16a34a', fontWeight: 800 }}>
                        {formatCOP(result?.saldo_a_favor)}
                      </td>
                    </tr>
                  )}

                  {(inputs.anticipo_ano_siguiente ?? 0) > 0 && (
                    <tr style={{ color: '#0369a1' }}>
                      <td>(+) Anticipo Año Siguiente (Art. 807 - Casilla 133/135)</td>
                      <td id="res-pn-anticipo-siguiente" className="amount" style={{ color: '#0284c7', fontWeight: 700 }}>
                        +{formatCOP(inputs.anticipo_ano_siguiente)}
                      </td>
                    </tr>
                  )}
                  <tr className="highlight" style={{ background: (result?.total_a_pagar ?? result?.saldo_a_pagar ?? 0) > 0 ? '#dbeafe' : '#f0fdf4', fontWeight: 900, fontSize: '13.5px' }}>
                    <td>
                      {(result?.total_a_pagar ?? result?.saldo_a_pagar ?? 0) > 0
                        ? '(=) TOTAL SALDO A PAGAR (Casilla 980)'
                        : '(=) TOTAL SALDO A FAVOR DEFINITIVO (Casilla 137)'}
                    </td>
                    <td id="res-pn-total-definitivo" className="amount" style={{ color: (result?.total_a_pagar ?? result?.saldo_a_pagar ?? 0) > 0 ? '#1e40af' : '#16a34a' }}>
                      {formatCOP(
                        (result?.total_a_pagar ?? result?.saldo_a_pagar ?? 0) > 0
                          ? (result?.total_a_pagar ?? result?.saldo_a_pagar)
                          : (result?.saldo_a_favor ?? 0)
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={onOpenAudit}>
                  🔍 Auditoría Legal
                </button>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={onNavigateToF210}>
                  📋 Ver F210 DIAN Real
                </button>
              </div>

              {/* CTA PRIMARIO DESTACADO: DESCARGA DE DICTAMEN PDF */}
              <div className="results-export-cta" style={{ marginBottom: '16px' }}>
                <button
                  id="btn-pn-export-pdf"
                  className="btn-export-primary"
                  onClick={() => setIsPdfModalOpen(true)}
                  title="Generar y descargar dictamen formal con membrete para imprimir o guardar en PDF"
                >
                  <span>📄</span> Descargar Dictamen Ejecutivo (PDF)
                </button>
              </div>

              {/* TACÓMETRO DE TASAS */}
              <PnTaxGauge result={result} />

              {/* GRÁFICO CASCADA WATERFALL */}
              <PnWaterfallChart result={result} anticipoAnoSiguiente={inputs.anticipo_ano_siguiente} />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE DICTAMEN EN PDF */}
      <PnPdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        inputs={inputs}
        result={result}
        taxYear={taxYear}
        uvtValue={uvtValue}
      />
    </div>
  );
};
