import React from 'react';
import type { IvaF300Input, IvaF300Output } from '../../../types/tax';
import { formatCOP, parseCOP } from '../../../utils/formatters';

interface IvaCalcSubtabProps {
  inputs: IvaF300Input;
  setInputs: React.Dispatch<React.SetStateAction<IvaF300Input>>;
  result: IvaF300Output | null;
  onOpenAudit: () => void;
  onNavigateToF300: () => void;
  onNavigateToProrrateo: () => void;
  onNavigateToClasificador: () => void;
  loadPresetComercio: () => void;
  loadPresetMixto: () => void;
  loadPresetExportador: () => void;
  loadPresetSoftware: () => void;
}

export const IvaCalcSubtab: React.FC<IvaCalcSubtabProps> = ({
  inputs,
  setInputs,
  result,
  onOpenAudit,
  onNavigateToF300,
  onNavigateToProrrateo,
  onNavigateToClasificador,
  loadPresetComercio,
  loadPresetMixto,
  loadPresetExportador,
  loadPresetSoftware,
}) => {
  const handleNumChange = (field: keyof IvaF300Input, valStr: string) => {
    const num = parseCOP(valStr);
    setInputs((prev) => ({ ...prev, [field]: num }));
  };

  const handlePeriodicidadChange = (tipo: 'BIMESTRAL' | 'CUATRIMESTRAL') => {
    setInputs((prev) => ({
      ...prev,
      tipo_periodicidad: tipo,
      periodo: 1,
    }));
  };

  return (
    <div id="pane-iva-calc" className="module-pane active">
      {/* BARRA DE PRESETS ESTANDARIZADA */}
      <div className="presets-toolbar">
        <div className="presets-toolbar-group">
          <span className="presets-toolbar-label">⚡ Presets de 1 Clic:</span>
          <button className="btn btn-outline btn-sm" onClick={loadPresetComercio} title="Comercio al 19% general">
            🛒 Comercio Minorista 19%
          </button>
          <button className="btn btn-outline btn-sm" onClick={loadPresetMixto} title="Ventas gravadas, exentas y excluidas con prorrateo">
            ⚖️ Ventas Mixtas (Art. 490)
          </button>
          <button className="btn btn-outline btn-sm" onClick={loadPresetExportador} title="Exportador exento 0% con saldo a favor">
            🚢 Exportador (0%)
          </button>
          <button className="btn btn-outline btn-sm" onClick={loadPresetSoftware} title="Servicios digitales y software SaaS">
            💻 Software &amp; SaaS
          </button>
        </div>
        <div className="presets-toolbar-actions">
          <button className="btn btn-secondary btn-sm" onClick={onNavigateToProrrateo}>
            ⚖️ Prorrateo Art. 490
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onNavigateToClasificador}>
            🔍 Catálogo Bienes &amp; Servicios
          </button>
          <button className="btn btn-primary btn-sm" onClick={onNavigateToF300}>
            📋 Ver Formulario 300 DIAN
          </button>
        </div>
      </div>

      <div className="calc-grid">
        {/* COLUMNA FORMULARIO DE ENTRADA */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Datos Periódicos y Liquidación Privada de IVA (Formulario 300)</h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cálculo bimestral/cuatrimestral reactivo</span>
          </div>

          <div className="card-body">
            {/* SECCIÓN 1: IDENTIFICACIÓN Y PERIODICIDAD */}
            <div className="form-section">
              <h3 className="section-title">1. Identificación y Periodicidad (Art. 600 E.T.)</h3>
              <div className="inputs-row">
                <div className="input-field" style={{ flex: 2 }}>
                  <label className="input-label">Razón Social o Nombre Completo</label>
                  <input
                    type="text"
                    className="text-input"
                    value={inputs.razon_social}
                    onChange={(e) => setInputs((prev) => ({ ...prev, razon_social: e.target.value }))}
                    placeholder="DISTRIBUIDORA NACIONAL S.A.S."
                  />
                </div>
                <div className="input-field" style={{ flex: 1.2 }}>
                  <label className="input-label">NIT</label>
                  <input
                    type="text"
                    className="text-input"
                    value={inputs.nit}
                    onChange={(e) => setInputs((prev) => ({ ...prev, nit: e.target.value }))}
                    placeholder="900123456"
                  />
                </div>
                <div className="input-field" style={{ width: '60px', flex: '0 0 60px' }}>
                  <label className="input-label">DV</label>
                  <input
                    type="text"
                    className="text-input text-center"
                    value={inputs.dv}
                    onChange={(e) => setInputs((prev) => ({ ...prev, dv: e.target.value }))}
                    maxLength={1}
                  />
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field" style={{ flex: 1 }}>
                  <label className="input-label">Tipo de Periodicidad (Art. 600 E.T.)</label>
                  <select
                    className="select-input"
                    value={inputs.tipo_periodicidad}
                    onChange={(e) => handlePeriodicidadChange(e.target.value as 'BIMESTRAL' | 'CUATRIMESTRAL')}
                  >
                    <option value="BIMESTRAL">Bimestral (Ingresos brutos a 31 dic año ant &ge; 92.000 UVT)</option>
                    <option value="CUATRIMESTRAL">Cuatrimestral (Ingresos brutos a 31 dic año ant &lt; 92.000 UVT)</option>
                  </select>
                </div>
                <div className="input-field" style={{ flex: 1 }}>
                  <label className="input-label">Período Fiscal</label>
                  <select
                    className="select-input"
                    value={inputs.periodo}
                    onChange={(e) => setInputs((prev) => ({ ...prev, periodo: parseInt(e.target.value) }))}
                  >
                    {inputs.tipo_periodicidad === 'BIMESTRAL' ? (
                      <>
                        <option value={1}>Bimestre 1 (Enero - Febrero)</option>
                        <option value={2}>Bimestre 2 (Marzo - Abril)</option>
                        <option value={3}>Bimestre 3 (Mayo - Junio)</option>
                        <option value={4}>Bimestre 4 (Julio - Agosto)</option>
                        <option value={5}>Bimestre 5 (Septiembre - Octubre)</option>
                        <option value={6}>Bimestre 6 (Noviembre - Diciembre)</option>
                      </>
                    ) : (
                      <>
                        <option value={1}>Cuatrimestre 1 (Enero - Abril)</option>
                        <option value={2}>Cuatrimestre 2 (Mayo - Agosto)</option>
                        <option value={3}>Cuatrimestre 3 (Septiembre - Diciembre)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: INGRESOS Y VENTAS (IVA GENERADO) */}
            <div className="form-section">
              <h3 className="section-title">2. Sección Ingresos y Ventas (Generación de IVA)</h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Reporta los ingresos operacionales brutos según su clasificación tributaria.
              </p>

              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Venta de Bienes Gravados al 19% (Cas. 28)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.ingresos_bienes_gravados_19 ?? 0, false)}
                      onChange={(e) => handleNumChange('ingresos_bienes_gravados_19', e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label className="input-label">Venta de Bienes Gravados al 5% (Cas. 27)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.ingresos_bienes_gravados_5 ?? 0, false)}
                      onChange={(e) => handleNumChange('ingresos_bienes_gravados_5', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Servicios Gravados al 19% (Cas. 30)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.ingresos_servicios_gravados_19 ?? 0, false)}
                      onChange={(e) => handleNumChange('ingresos_servicios_gravados_19', e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label className="input-label">Servicios Gravados al 5% (Cas. 29)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.ingresos_servicios_gravados_5 ?? 0, false)}
                      onChange={(e) => handleNumChange('ingresos_servicios_gravados_5', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Operaciones Exentas - Art. 477 (Cas. 34)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.operaciones_exentas_art477 ?? 0, false)}
                      onChange={(e) => handleNumChange('operaciones_exentas_art477', e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label className="input-label">Exportación de Bienes y Servicios (Cas. 35 y 36)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP((inputs.exportaciones_bienes ?? 0) + (inputs.exportaciones_servicios ?? 0), false)}
                      onChange={(e) => handleNumChange('exportaciones_bienes', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Operaciones Excluidas - Arts. 424 y 476 (Cas. 37)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.operaciones_excluidas ?? 0, false)}
                      onChange={(e) => handleNumChange('operaciones_excluidas', e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label className="input-label">(-) Devoluciones en Ventas Anuladas (Cas. 42)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.devoluciones_en_ventas ?? 0, false)}
                      onChange={(e) => handleNumChange('devoluciones_en_ventas', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: COMPRAS, GASTOS E IVA DESCONTABLE */}
            <div className="form-section">
              <h3 className="section-title">3. Sección Compras, Gastos e IVA Descontable</h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Compras e importaciones con derecho a descuento tributario según los Arts. 485, 488 y 490 del E.T.
              </p>

              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Compras de Bienes al 19% (Cas. 67)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.compras_bienes_gravados_19 ?? 0, false)}
                      onChange={(e) => handleNumChange('compras_bienes_gravados_19', e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label className="input-label">Compras de Bienes al 5% (Cas. 66)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.compras_bienes_gravados_5 ?? 0, false)}
                      onChange={(e) => handleNumChange('compras_bienes_gravados_5', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Servicios Gravados al 19% (Cas. 69)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.servicios_gravados_19 ?? 0, false)}
                      onChange={(e) => handleNumChange('servicios_gravados_19', e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label className="input-label">Servicios Gravados al 5% (Cas. 68)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.servicios_gravados_5 ?? 0, false)}
                      onChange={(e) => handleNumChange('servicios_gravados_5', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">
                    IVA Común Sujeto a Prorrateo (Art. 490 E.T.)
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.iva_comun_sujeto_prorrateo ?? 0, false)}
                      onChange={(e) => handleNumChange('iva_comun_sujeto_prorrateo', e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label className="input-label">Compras y Servicios Excluidos / Exentos (Cas. 74)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.compras_bienes_excluidos_exentos ?? 0, false)}
                      onChange={(e) => handleNumChange('compras_bienes_excluidos_exentos', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 4: CONTROL DE SALDOS Y RETENCIONES RECIBIDAS */}
            <div className="form-section">
              <h3 className="section-title">4. Retenciones Recibidas, Saldos Anteriores y Sanciones</h3>

              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Retenciones IVA Practicadas a Favor - ReteIVA (Cas. 101)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.retenciones_iva_practicadas_a_favor ?? 0, false)}
                      onChange={(e) => handleNumChange('retenciones_iva_practicadas_a_favor', e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label className="input-label">Saldo a Favor del Período Anterior (Cas. 100)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.saldo_a_favor_periodo_anterior ?? 0, false)}
                      onChange={(e) => handleNumChange('saldo_a_favor_periodo_anterior', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Sanciones por Extemporaneidad / Corrección (Cas. 104)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.sanciones ?? 0, false)}
                      onChange={(e) => handleNumChange('sanciones', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESULTADOS Y RESUMEN LIQUIDACIÓN */}
        <div className="card results-card sticky-card">
          <div className="card-header results-card-header">
            <h2 className="card-title" style={{ color: '#1d4ed8' }}>
              📊 Liquidación Privada F-300
            </h2>
            <button className="btn btn-outline btn-xs" onClick={onOpenAudit}>
              🔍 Trazabilidad
            </button>
          </div>

          <div className="card-body">
            {/* TOTAL SALDO A PAGAR O SALDO A FAVOR */}
            {(result?.total_saldo_a_favor ?? 0) > 0 ? (
              <div
                style={{
                  background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
                  color: '#ffffff',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)',
                }}
              >
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>
                  🎉 Total Saldo a Favor (Casilla 106)
                </span>
                <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  ${formatCOP(result?.total_saldo_a_favor ?? 0, false)}
                </div>
                <span style={{ fontSize: '11px', opacity: 0.85, marginTop: '2px', display: 'block' }}>
                  {result?.tipo_periodicidad} • Período {result?.periodo || 1}
                </span>
              </div>
            ) : (
              <div
                style={{
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                  color: '#ffffff',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(29, 78, 216, 0.2)',
                }}
              >
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>
                  Total Saldo a Pagar (Casilla 105)
                </span>
                <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  ${formatCOP(result?.total_saldo_a_pagar ?? 0, false)}
                </div>
                <span style={{ fontSize: '11px', opacity: 0.85, marginTop: '2px', display: 'block' }}>
                  {result?.tipo_periodicidad} • Período {result?.periodo || 1}
                </span>
              </div>
            )}

            {/* DESGLOSE POR CASILLAS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <div className="result-row">
                <span className="result-label">Total Ingresos Netos (Cas. 43):</span>
                <span className="result-val">${formatCOP(result?.total_ingresos_netos ?? 0, false)}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Total IVA Generado (Cas. 58):</span>
                <span className="result-val">${formatCOP(result?.total_iva_generado ?? 0, false)}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Total IVA Descontable (Cas. 96):</span>
                <span className="result-val">${formatCOP(result?.total_iva_descontable ?? 0, false)}</span>
              </div>
              <div className="result-row" style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '6px' }}>
                <span className="result-label" style={{ fontWeight: 700 }}>
                  {(result?.saldo_periodo_a_pagar ?? 0) > 0 ? 'Saldo a Pagar Período (Cas. 98):' : 'Saldo a Favor Período (Cas. 99):'}
                </span>
                <span className="result-val" style={{ fontWeight: 800 }}>
                  ${formatCOP((result?.saldo_periodo_a_pagar ?? 0) > 0 ? (result?.saldo_periodo_a_pagar ?? 0) : (result?.saldo_periodo_a_favor ?? 0), false)}
                </span>
              </div>
              <div className="result-row">
                <span className="result-label">(-) ReteIVA Practicado a Favor (Cas. 101):</span>
                <span className="result-val">${formatCOP(result?.casillas.c101_retenciones_iva_que_le_practicaron ?? 0, false)}</span>
              </div>
              <div className="result-row">
                <span className="result-label">(-) Saldo a Favor Período Ant. (Cas. 100):</span>
                <span className="result-val">${formatCOP(result?.casillas.c100_saldo_a_favor_periodo_anterior ?? 0, false)}</span>
              </div>
              <div className="result-row">
                <span className="result-label">(+) Sanciones (Cas. 104):</span>
                <span className="result-val">${formatCOP(result?.casillas.c104_sanciones ?? 0, false)}</span>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="btn btn-primary btn-block" onClick={onNavigateToF300}>
                📋 Ver en Formulario Oficial 300 DIAN
              </button>
              <button className="btn btn-outline btn-block" onClick={onNavigateToProrrateo}>
                ⚖️ Simular Prorrateo de Gastos Comunes Art. 490
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
