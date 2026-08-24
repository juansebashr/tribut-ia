import React, { useState } from 'react';
import { formatCOP, parseCOP } from '../../../utils/formatters';

export const PjConciliacionSubtab: React.FC = () => {
  const [utilidadContable, setUtilidadContable] = useState<number>(450000000);

  // Partidas que aumentan renta (Partidas +)
  const [gastosSinSoporte, setGastosSinSoporte] = useState<number>(25000000);
  const [sancionesMultas, setSancionesMultas] = useState<number>(8000000);
  const [excesoDepreciacion, setExcesoDepreciacion] = useState<number>(18000000);
  const [deterioroCarteraNoDeducible, setDeterioroCarteraNoDeducible] = useState<number>(14000000);
  const [gmfNoDeducible, setGmfNoDeducible] = useState<number>(6000000);

  // Partidas que disminuyen renta (Partidas -)
  const [dividendosNoGravados, setDividendosNoGravados] = useState<number>(30000000);
  const [deduccionPrimerEmpleo, setDeduccionPrimerEmpleo] = useState<number>(15000000);
  const [deduccionInvestigacionId, setDeduccionInvestigacionId] = useState<number>(20000000);

  const totalAumentos =
    gastosSinSoporte + sancionesMultas + excesoDepreciacion + deterioroCarteraNoDeducible + gmfNoDeducible;
  const totalDisminuciones = dividendosNoGravados + deduccionPrimerEmpleo + deduccionInvestigacionId;
  const rentaLiquidaConciliada = Math.max(0, utilidadContable + totalAumentos - totalDisminuciones);

  // Diferencias permanentes vs temporarias (NIC 12)
  const difPermanentes = gastosSinSoporte + sancionesMultas + gmfNoDeducible + dividendosNoGravados + deduccionPrimerEmpleo + deduccionInvestigacionId;
  const difTemporarias = excesoDepreciacion + deterioroCarteraNoDeducible;
  const impuestoDiferidoEstimado = Math.round(difTemporarias * 0.35);

  return (
    <div id="pane-pj-conciliacion" className="module-pane active">
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          📑 Conciliación Contable-Fiscal NIIF vs Fiscal (Formato 2516 - Art. 772-1 E.T.)
        </h2>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
          Herramienta didáctica para conciliar el resultado comercial antes de impuestos bajo Normas Internacionales de Información Financiera (NIIF)
          con la Renta Líquida Gravable declarada en el Formulario 110, distinguiendo diferencias permanentes y temporarias (Impuesto Diferido - NIC 12).
        </p>
      </div>

      <div className="responsive-grid-split">
        {/* ENTRADAS DE CONCILIACIÓN */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Partidas de Conciliación NIIF a Fiscal</h3>
          </div>

          <div className="card-body">
            {/* BASE NIIF */}
            <div className="input-field" style={{ marginBottom: '14px' }}>
              <label className="input-label">Utilidad Contable Comercial Antes de Impuestos (NIIF)</label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="currency-input"
                  value={formatCOP(utilidadContable, false)}
                  onChange={(e) => setUtilidadContable(parseCOP(e.target.value))}
                />
              </div>
            </div>

            {/* PARTIDAS POSITIVAS */}
            <div className="form-section">
              <h4 className="section-title" style={{ color: '#ef4444' }}>
                (+) Partidas que Aumentan la Renta Líquida (Gastos no procedentes / Ajustes NIIF)
              </h4>

              <div className="input-field" style={{ marginBottom: '8px' }}>
                <label className="input-label">Gastos sin soporte electrónico o bancarización (Art. 771-2 / 771-5)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="currency-input"
                    value={formatCOP(gastosSinSoporte, false)}
                    onChange={(e) => setGastosSinSoporte(parseCOP(e.target.value))}
                  />
                </div>
              </div>

              <div className="input-field" style={{ marginBottom: '8px' }}>
                <label className="input-label">Sanciones, multas e intereses moratorios tributarios (Art. 107 E.T.)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="currency-input"
                    value={formatCOP(sancionesMultas, false)}
                    onChange={(e) => setSancionesMultas(parseCOP(e.target.value))}
                  />
                </div>
              </div>

              <div className="input-field" style={{ marginBottom: '8px' }}>
                <label className="input-label">Exceso de depreciación contable sobre tasas fiscales máximas (Art. 137 E.T.)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="currency-input"
                    value={formatCOP(excesoDepreciacion, false)}
                    onChange={(e) => setExcesoDepreciacion(parseCOP(e.target.value))}
                  />
                </div>
              </div>

              <div className="input-field" style={{ marginBottom: '8px' }}>
                <label className="input-label">Deterioro de cartera NIIF no deducible fiscalmente (Art. 145 E.T.)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="currency-input"
                    value={formatCOP(deterioroCarteraNoDeducible, false)}
                    onChange={(e) => setDeterioroCarteraNoDeducible(parseCOP(e.target.value))}
                  />
                </div>
              </div>

              <div className="input-field">
                <label className="input-label">50% del Gravamen a los Movimientos Financieros (GMF no deducible - Art. 115)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="currency-input"
                    value={formatCOP(gmfNoDeducible, false)}
                    onChange={(e) => setGmfNoDeducible(parseCOP(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* PARTIDAS NEGATIVAS */}
            <div className="form-section">
              <h4 className="section-title" style={{ color: '#10b981' }}>
                (-) Partidas que Disminuyen la Renta Líquida (Ingresos no gravados / Beneficios especiales)
              </h4>

              <div className="input-field" style={{ marginBottom: '8px' }}>
                <label className="input-label">Dividendos no constitutivos de renta recibidos (Art. 48/49 E.T.)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="currency-input"
                    value={formatCOP(dividendosNoGravados, false)}
                    onChange={(e) => setDividendosNoGravados(parseCOP(e.target.value))}
                  />
                </div>
              </div>

              <div className="input-field" style={{ marginBottom: '8px' }}>
                <label className="input-label">Deducción 120% nómina primer empleo menores 28 años (Art. 108-5 E.T.)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="currency-input"
                    value={formatCOP(deduccionPrimerEmpleo, false)}
                    onChange={(e) => setDeduccionPrimerEmpleo(parseCOP(e.target.value))}
                  />
                </div>
              </div>

              <div className="input-field">
                <label className="input-label">Deducción especial inversiones en Investigación y Desarrollo (Art. 158-1 E.T.)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="currency-input"
                    value={formatCOP(deduccionInvestigacionId, false)}
                    onChange={(e) => setDeduccionInvestigacionId(parseCOP(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PUENTE DE CONCILIACIÓN Y RESULTADOS */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Puente de Conciliación NIIF vs Fiscal</h3>
          </div>

          <div className="card-body">
            {/* RENTA LÍQUIDA DETERMINADA */}
            <div
              style={{
                padding: '16px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.08)',
                border: '2px solid var(--primary)',
                textAlign: 'center',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                RENTA LÍQUIDA ORDINARIA FISCAL RESULTANTE
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 900,
                  color: 'var(--primary)',
                  margin: '4px 0',
                }}
              >
                ${formatCOP(rentaLiquidaConciliada, false)}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                Traslado directo a la <strong>Casilla 72 del Formulario 110</strong>
              </div>
            </div>

            {/* TABLA PUENTE NIIF */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                <span>Utilidad Contable NIIF:</span>
                <span style={{ fontWeight: 800 }}>${formatCOP(utilidadContable, false)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '4px' }}>
                <span style={{ color: '#ef4444' }}>(+) Total Partidas que Aumentan Renta:</span>
                <span style={{ fontWeight: 800, color: '#ef4444' }}>+${formatCOP(totalAumentos, false)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '4px' }}>
                <span style={{ color: '#10b981' }}>(-) Total Partidas que Disminuyen Renta:</span>
                <span style={{ fontWeight: 800, color: '#10b981' }}>-${formatCOP(totalDisminuciones, false)}</span>
              </div>
            </div>

            {/* ANÁLISIS DE IMPUESTO DIFERIDO (NIC 12) */}
            <div
              style={{
                padding: '12px',
                borderRadius: '6px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>
                📊 Desglose de Diferencias (NIIF - NIC 12 / Sección 29 NIIF Pymes)
              </div>
              <div style={{ fontSize: '11.5px', lineHeight: '1.6' }}>
                <div>• <strong>Diferencias Permanentes:</strong> ${formatCOP(difPermanentes, false)} (Afectan la tasa efectiva sin generar impuesto diferido).</div>
                <div>• <strong>Diferencias Temporarias:</strong> ${formatCOP(difTemporarias, false)} (Reversibles en periodos futuros).</div>
                <div style={{ marginTop: '4px', fontWeight: 700, color: 'var(--primary)' }}>
                  • <strong>Impuesto Diferido Estimado (35%):</strong> ${formatCOP(impuestoDiferidoEstimado, false)}
                </div>
              </div>
            </div>

            {/* FUNDAMENTO LEGAL */}
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              <strong>Art. 772-1 E.T. & Formato 2516:</strong> Los contribuyentes obligados a llevar contabilidad deben presentar el Reporte de Conciliación Fiscal (Formato 2516)
              anexo a la declaración de renta F-110, reflejando las diferencias entre los marcos contables NIIF y el Estatuto Tributario.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
