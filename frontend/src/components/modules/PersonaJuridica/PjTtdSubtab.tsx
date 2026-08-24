import React, { useState } from 'react';
import { formatCOP, parseCOP } from '../../../utils/formatters';

export const PjTtdSubtab: React.FC = () => {
  const [uc, setUc] = useState<number>(500000000); // Utilidad Contable
  const [dp, setDp] = useState<number>(40000000); // Diferencias permanentes (+ gastos no deducibles)
  const [incrngo, setIncrngo] = useState<number>(20000000); // INCRNGO
  const [re, setRe] = useState<number>(50000000); // Rentas exentas
  const [inr, setInr] = useState<number>(45000000); // Impuesto Neto de Renta
  const [dte, setDte] = useState<number>(10000000); // Descuentos tributarios del exterior

  // Fórmulas Art. 240 Parágrafo 6
  const ud = Math.max(0, uc + dp - incrngo - re); // Utilidad Depurada
  const id = Math.max(0, inr + dte); // Impuesto Depurado
  const ttd = ud > 0 ? (id / ud) * 100 : 0;
  const ttdCumple = ttd >= 15.0;
  const impuestoRequerido15 = ud * 0.15;
  const impuestoAdicionarIa = ttdCumple ? 0 : Math.max(0, impuestoRequerido15 - id);

  return (
    <div id="pane-pj-ttd" className="module-pane active">
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          ⚖️ Laboratorio Interactivo de Tasa de Tributación Depurada (TTD - 15%)
        </h2>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
          Simulador oficial del <strong>Art. 240 Parágrafo 6 del Estatuto Tributario</strong> (Ley 2277 de 2022).
          Valida que la tasa efectiva de tributación sobre la Utilidad Depurada no sea inferior al 15%.
        </p>
      </div>

      <div className="responsive-grid-split">
        {/* PANEL DE VARIABLES */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Variables de la Fórmula Legal (Art. 240 Par. 6)</h3>
          </div>

          <div className="card-body">
            <div className="form-section">
              <h4 className="section-title">1. Componentes de la Utilidad Depurada (UD)</h4>
              <div className="input-field" style={{ marginBottom: '10px' }}>
                <label className="input-label">Utilidad Contable antes de Impuestos (UC)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="currency-input"
                    value={formatCOP(uc, false)}
                    onChange={(e) => setUc(parseCOP(e.target.value))}
                  />
                </div>
              </div>

              <div className="input-field" style={{ marginBottom: '10px' }}>
                <label className="input-label">(+) Diferencias Permanentes Gravables (DP)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="currency-input"
                    value={formatCOP(dp, false)}
                    onChange={(e) => setDp(parseCOP(e.target.value))}
                  />
                </div>
                <span className="input-help">Gastos no deducibles que aumentan la renta líquida.</span>
              </div>

              <div className="input-field" style={{ marginBottom: '10px' }}>
                <label className="input-label">(-) Ingresos No Constitutivos de Renta (INCRNGO)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="currency-input"
                    value={formatCOP(incrngo, false)}
                    onChange={(e) => setIncrngo(parseCOP(e.target.value))}
                  />
                </div>
              </div>

              <div className="input-field" style={{ marginBottom: '10px' }}>
                <label className="input-label">(-) Rentas Exentas (RE)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="currency-input"
                    value={formatCOP(re, false)}
                    onChange={(e) => setRe(parseCOP(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4 className="section-title">2. Componentes del Impuesto Depurado (ID)</h4>
              <div className="input-field" style={{ marginBottom: '10px' }}>
                <label className="input-label">Impuesto Neto de Renta Liquidado (INR - Casilla 94)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="currency-input"
                    value={formatCOP(inr, false)}
                    onChange={(e) => setInr(parseCOP(e.target.value))}
                  />
                </div>
              </div>

              <div className="input-field">
                <label className="input-label">(+) Descuentos por Impuestos en el Exterior (DTE - Art. 254)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="currency-input"
                    value={formatCOP(dte, false)}
                    onChange={(e) => setDte(parseCOP(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL DE RESULTADOS Y DIAGNÓSTICO */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Resultado de la Tasa Mínima TTD</h3>
          </div>

          <div className="card-body">
            {/* GAUGE DE TTD */}
            <div
              style={{
                padding: '20px',
                borderRadius: '8px',
                background: ttdCumple ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: `2px solid ${ttdCumple ? '#10b981' : '#ef4444'}`,
                textAlign: 'center',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                TASA DE TRIBUTACIÓN DEPURADA (TTD)
              </div>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 900,
                  color: ttdCumple ? '#10b981' : '#ef4444',
                  margin: '6px 0',
                }}
              >
                {ttd.toFixed(2)}%
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>
                {ttdCumple ? '✅ CUMPLE CON LA TASA MÍNIMA LEGAL (≥ 15.0%)' : '⚠️ NO ALCANZA LA TASA MÍNIMA DEL 15.0%'}
              </div>
            </div>

            {/* FÓRMULA MATEMÁTICA EN VIVO */}
            <div
              style={{
                padding: '12px',
                background: 'var(--bg-tertiary)',
                borderRadius: '6px',
                fontSize: '12px',
                marginBottom: '16px',
                lineHeight: '1.6',
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: '4px' }}>Fórmula Oficial: TTD = (ID / UD) × 100</div>
              <div>• <strong>Impuesto Depurado (ID):</strong> ${formatCOP(id, false)}</div>
              <div>• <strong>Utilidad Depurada (UD):</strong> ${formatCOP(ud, false)}</div>
              <div>• <strong>Tasa Calculada:</strong> (${formatCOP(id, false)} / ${formatCOP(ud, false)}) = <strong>{ttd.toFixed(2)}%</strong></div>
            </div>

            {/* IMPUESTO ADICIONAL (IA) */}
            <div
              style={{
                padding: '14px',
                borderRadius: '6px',
                background: impuestoAdicionarIa > 0 ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>
                  Impuesto a Adicionar (IA - Casilla 95 F-110):
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 900,
                    color: impuestoAdicionarIa > 0 ? '#d97706' : 'var(--text-primary)',
                  }}
                >
                  ${formatCOP(impuestoAdicionarIa, false)}
                </span>
              </div>
              {impuestoAdicionarIa > 0 ? (
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', margin: 0 }}>
                  Para cumplir con la tasa mínima del 15% sobre la UD (${formatCOP(ud, false)}), la sociedad debe pagar
                  ${formatCOP(impuestoRequerido15, false)} de impuesto. Al haber liquidado ${formatCOP(id, false)}, se
                  adiciona la diferencia de ${formatCOP(impuestoAdicionarIa, false)} en la <strong>Casilla 95 del Formulario 110</strong>.
                </p>
              ) : (
                <p style={{ fontSize: '11px', color: '#10b981', marginTop: '6px', margin: 0 }}>
                  La sociedad ya tributa a una tasa superior al 15%, por lo que no requiere ajuste en la Casilla 95 ($0).
                </p>
              )}
            </div>

            {/* TIPS Y RECOMENDACIONES FISCALES */}
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                📌 Recomendaciones de Planeación Contable-Fiscal:
              </div>
              <ul style={{ paddingLeft: '16px', margin: 0 }}>
                <li>La TTD aplica a todas las personas jurídicas contribuyentes del régimen ordinario y zonas francas.</li>
                <li>No aplica a personas jurídicas en el Régimen SIMPLE de Tributación (Formulario 260).</li>
                <li>Si la UD es menor o igual a cero ($0), no se genera cálculo de TTD ni impuesto a adicionar.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
