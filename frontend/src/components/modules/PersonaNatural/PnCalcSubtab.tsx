import React from 'react';
import type { PersonaNaturalInput, PersonaNaturalOutput } from '../../../types/tax';
import { formatCOP, parseCOP } from '../../../utils/formatters';

interface PnCalcSubtabProps {
  inputs: PersonaNaturalInput;
  setInputs: React.Dispatch<React.SetStateAction<PersonaNaturalInput>>;
  result: PersonaNaturalOutput | null;
  onOpenAudit: () => void;
  onNavigateToF210: () => void;
  onNavigateToMarginal: () => void;
  loadPresetStandard: () => void;
  loadPreset35: () => void;
  loadPresetGo: () => void;
}

export const PnCalcSubtab: React.FC<PnCalcSubtabProps> = ({
  inputs,
  setInputs,
  result,
  onOpenAudit,
  onNavigateToF210,
  onNavigateToMarginal,
  loadPresetStandard,
  loadPreset35,
  loadPresetGo,
}) => {
  const handleNumChange = (field: keyof PersonaNaturalInput, valStr: string) => {
    const num = parseCOP(valStr);
    setInputs((prev) => ({ ...prev, [field]: num }));
  };

  const handleCheckboxChange = (field: keyof PersonaNaturalInput, checked: boolean) => {
    setInputs((prev) => ({ ...prev, [field]: checked }));
  };

  return (
    <div id="pane-pn-calc" className="module-pane active">
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button className="btn btn-outline btn-sm" onClick={loadPresetStandard}>
          ✨ Cargar Ejemplo Estándar (Tramo 28%)
        </button>
        <button className="btn btn-outline btn-sm" onClick={loadPreset35}>
          🔥 Cargar Altos Ingresos (Tramo 35%)
        </button>
        <button className="btn btn-outline btn-sm" onClick={loadPresetGo}>
          ✨ Cargar Ejemplo con Ganancia Ocasional
        </button>
        <button className="btn btn-primary btn-sm" onClick={onNavigateToMarginal}>
          🌡️ Ver Termómetro y Tarifa Progresiva
        </button>
        <button className="btn btn-secondary btn-sm" onClick={onNavigateToF210}>
          📋 Ver Formulario 210 DIAN
        </button>
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
                    defaultValue="CONTRIBUYENTE PERSONA NATURAL DEMO"
                  />
                </div>
                <div className="input-field">
                  <label className="input-label">Número de NIT / Cédula</label>
                  <input
                    type="text"
                    id="pn_nit_declarante"
                    className="text-input"
                    defaultValue="9001234567"
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
              </div>
            </div>
          </div>
        </div>

        {/* RESULTS */}
        <div>
          <div className="card results-card">
            <div className="card-header">
              <h2 className="card-title">Resumen de Liquidación</h2>
              <button className="btn btn-outline btn-sm" onClick={onOpenAudit}>
                👁️ Ver Auditoría Legal
              </button>
            </div>

            <div className="card-body">
              <div
                id="pn-kpi-box"
                className={`kpi-banner ${result && result.saldo_a_pagar > 0 ? 'to-pay' : 'to-favor'}`}
              >
                <div>
                  <div id="pn-kpi-label" className="kpi-label">
                    {result && result.saldo_a_favor > 0 ? 'Saldo a Favor (Casilla 137)' : 'Saldo a Pagar (Casilla 136)'}
                  </div>
                  <div id="pn-kpi-value" className="kpi-value">
                    {result ? formatCOP(result.saldo_a_pagar > 0 ? result.saldo_a_pagar : result.saldo_a_favor) : '$0 COP'}
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
                    <td>(=) Total Ingreso Neto</td>
                    <td id="res-pn-ingreso-neto" className="amount">
                      {formatCOP(result?.ingreso_neto)}
                    </td>
                  </tr>
                  <tr>
                    <td>(-) Deducciones Aceptadas</td>
                    <td id="res-pn-deducciones" className="amount negative">
                      -{formatCOP(result?.total_deducciones_aceptadas)}
                    </td>
                  </tr>
                  <tr>
                    <td>(-) Rentas Exentas (AFC + Otras)</td>
                    <td id="res-pn-exentas-afc" className="amount negative">
                      -{formatCOP(result?.total_rentas_exentas_previas)}
                    </td>
                  </tr>
                  <tr>
                    <td>(-) Renta Exenta Laboral (25%)</td>
                    <td id="res-pn-exenta-25" className="amount negative">
                      -{formatCOP(result?.renta_exenta_laboral_25)}
                    </td>
                  </tr>
                  <tr>
                    <td>Tope Límite Conjunto (40% / 1.340 UVT)</td>
                    <td id="res-pn-limite-conjunto" className="amount" style={{ color: 'var(--amber)' }}>
                      {formatCOP(result?.limite_conjunto_aplicable_cop)}
                    </td>
                  </tr>
                  <tr className="highlight" style={{ borderTop: '2px solid var(--primary-border)' }}>
                    <td>(=) Renta Líquida Gravable (Casilla 111)</td>
                    <td id="res-pn-renta-gravable" className="amount" style={{ color: 'var(--primary)' }}>
                      {formatCOP(result?.renta_liquida_gravable)}
                    </td>
                  </tr>
                  <tr className="highlight">
                    <td>(=) Impuesto Neto de Renta (Casilla 126)</td>
                    <td id="res-pn-impuesto-bruto" className="amount">
                      {formatCOP(result?.impuesto_neto_renta)}
                    </td>
                  </tr>
                  <tr className="highlight" style={{ background: '#eff6ff', fontWeight: 800 }}>
                    <td>(=) Total Impuesto a Cargo (Casilla 129)</td>
                    <td id="res-pn-total-impuesto-cargo" className="amount">
                      {formatCOP(result?.impuesto_neto_renta)}
                    </td>
                  </tr>
                  <tr>
                    <td>(-) Retenciones y Anticipos</td>
                    <td id="res-pn-retenciones" className="amount negative">
                      -{formatCOP(result?.total_anticipos_y_retenciones)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={onOpenAudit}>
                  🔍 Auditoría Legal
                </button>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={onNavigateToF210}>
                  📋 Ver F210 DIAN Real
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
