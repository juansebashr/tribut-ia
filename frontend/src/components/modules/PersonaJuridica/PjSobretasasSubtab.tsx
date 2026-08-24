import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { formatCOP, parseCOP } from '../../../utils/formatters';

export const PjSobretasasSubtab: React.FC = () => {
  const { uvtValue } = useApp();

  const [rlg, setRlg] = useState<number>(7500000000); // 7.500M COP (~150.605 UVT)
  const [esFinanciera, setEsFinanciera] = useState<boolean>(true);
  const [esHidroelectrica, setEsHidroelectrica] = useState<boolean>(false);
  const [sobretasaMineroPct, setSobretasaMineroPct] = useState<number>(0);
  const [regimenEspecial, setRegimenEspecial] = useState<string>('general');

  const rlgUvt = uvtValue > 0 ? rlg / uvtValue : 0;

  // 1. Tarifa Base
  let tarifaBasePct = 35.0;
  if (regimenEspecial === 'zona_franca') tarifaBasePct = 20.0;
  else if (regimenEspecial === 'hotelero') tarifaBasePct = 15.0;
  else if (regimenEspecial === 'cooperativa') tarifaBasePct = 20.0;

  // 2. Sobretasa Financiera (Art. 240 Par. 2)
  const aplicaFinanciera = esFinanciera && rlgUvt >= 120000;
  const puntosFinanciera = aplicaFinanciera ? 5.0 : 0.0;

  // 3. Sobretasa Hidroeléctricas (Art. 240 Par. 4)
  const aplicaHidro = esHidroelectrica && rlgUvt >= 30000;
  const puntosHidro = aplicaHidro ? 3.0 : 0.0;

  // 4. Sobretasa Minero-Petrolera (Art. 240 Par. 3)
  const puntosMinero = sobretasaMineroPct;

  const totalPuntosSobretasa = puntosFinanciera + puntosHidro + puntosMinero;
  const tarifaTotalPct = tarifaBasePct + totalPuntosSobretasa;

  const impuestoBasico = Math.round((rlg * (tarifaBasePct / 100)) / 1000) * 1000;
  const impuestoSobretasa = Math.round((rlg * (totalPuntosSobretasa / 100)) / 1000) * 1000;
  const anticipoSobretasaSiguiente = aplicaFinanciera ? impuestoSobretasa : 0;
  const impuestoTotalRenta = impuestoBasico + impuestoSobretasa;

  return (
    <div id="pane-pj-sobretasas" className="module-pane active">
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          ⚡ Simulador de Sobretasas Corporativas y Regímenes Especiales
        </h2>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
          Calcula los puntos adicionales de sobretasa aplicables según sector económico (Financiero, Hidroeléctrico, Minero-Petrolero)
          y regímenes con tarifa preferencial (Zonas Francas, Hoteles, Cooperativas) según el <strong>Art. 240 del Estatuto Tributario</strong>.
        </p>
      </div>

      <div className="responsive-grid-split">
        {/* PARÁMETROS DEL SIMULADOR */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Configuración Sectorial y Renta Gravable</h3>
          </div>

          <div className="card-body">
            <div className="input-field" style={{ marginBottom: '16px' }}>
              <label className="input-label">Renta Líquida Gravable (RLG - Casilla 79)</label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="currency-input"
                  value={formatCOP(rlg, false)}
                  onChange={(e) => setRlg(parseCOP(e.target.value))}
                />
              </div>
              <span className="input-help">
                Equivalente a <strong>{rlgUvt.toLocaleString('es-CO', { maximumFractionDigits: 1 })} UVT</strong> (UVT año: ${formatCOP(uvtValue, false)}).
              </span>
            </div>

            <div className="form-section">
              <h4 className="section-title">Régimen o Tarifa Base</h4>
              <div className="input-field">
                <select
                  className="select-input"
                  value={regimenEspecial}
                  onChange={(e) => setRegimenEspecial(e.target.value)}
                >
                  <option value="general">Régimen Ordinario General (Tarifa 35%)</option>
                  <option value="zona_franca">Usuario Industrial Zona Franca (Tarifa 20% - Art. 240-1)</option>
                  <option value="hotelero">Hoteles y Ecoturismo Nuevos (Tarifa 15% - Art. 240 Par. 5)</option>
                  <option value="cooperativa">Cooperativas / Entidad Especial (Tarifa 20%)</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <h4 className="section-title">Sectores Sujetos a Sobretasas Específicas</h4>

              {/* FINANCIERA */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px',
                  borderRadius: '6px',
                  background: 'var(--bg-secondary)',
                  marginBottom: '10px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={esFinanciera}
                  onChange={(e) => setEsFinanciera(e.target.checked)}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>🏦 Entidad Financiera / Aseguradora (Art. 240 Par. 2)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    +5 puntos si RLG ≥ 120.000 UVT (${formatCOP(120000 * uvtValue, false)}). Exige 100% de anticipo en Casilla 110.
                  </div>
                </div>
              </label>

              {/* HIDROELÉCTRICA */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px',
                  borderRadius: '6px',
                  background: 'var(--bg-secondary)',
                  marginBottom: '10px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={esHidroelectrica}
                  onChange={(e) => setEsHidroelectrica(e.target.checked)}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>💧 Generadora Hidroeléctrica (Art. 240 Par. 4)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    +3 puntos si RLG ≥ 30.000 UVT (${formatCOP(30000 * uvtValue, false)}).
                  </div>
                </div>
              </label>

              {/* MINERO-PETROLERA */}
              <div style={{ padding: '10px', borderRadius: '6px', background: 'var(--bg-secondary)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                  🛢️ Extracción de Crudo o Carbón (Art. 240 Par. 3)
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Sobretasa progresiva según precios internacionales promedio:
                </div>
                <select
                  className="select-input"
                  value={sobretasaMineroPct}
                  onChange={(e) => setSobretasaMineroPct(parseFloat(e.target.value))}
                >
                  <option value={0}>0% - Precios promedio dentro del rango base</option>
                  <option value={5}>+5% - Umbral medio de precios internacionales</option>
                  <option value={10}>+10% - Umbral alto de precios internacionales</option>
                  <option value={15}>+15% - Umbral extraordinario de precios internacionales</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL DE RESULTADOS */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Impacto Tributario Consolidado</h3>
          </div>

          <div className="card-body">
            {/* TARIFA FINAL */}
            <div
              style={{
                padding: '16px',
                borderRadius: '8px',
                background: totalPuntosSobretasa > 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                border: `2px solid ${totalPuntosSobretasa > 0 ? '#ef4444' : '#3b82f6'}`,
                textAlign: 'center',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                TARIFA EFECTIVA TOTAL APLICADA
              </div>
              <div
                style={{
                  fontSize: '34px',
                  fontWeight: 900,
                  color: totalPuntosSobretasa > 0 ? '#ef4444' : 'var(--primary)',
                  margin: '4px 0',
                }}
              >
                {tarifaTotalPct.toFixed(1)}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Base: <strong>{tarifaBasePct}%</strong> {totalPuntosSobretasa > 0 && `+ Sobretasas: +${totalPuntosSobretasa}%`}
              </div>
            </div>

            {/* DESGLOSE EN PESOS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                <span>Impuesto Renta Base (Casilla 84):</span>
                <span style={{ fontWeight: 800 }}>${formatCOP(impuestoBasico, false)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                <span>Puntos Adicionales Sobretasa (Casilla 85):</span>
                <span style={{ fontWeight: 800, color: totalPuntosSobretasa > 0 ? '#ef4444' : 'inherit' }}>
                  +${formatCOP(impuestoSobretasa, false)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 700 }}>Total Impuesto sobre Renta (Casilla 91):</span>
                <span style={{ fontWeight: 900, color: 'var(--primary)' }}>${formatCOP(impuestoTotalRenta, false)}</span>
              </div>

              {aplicaFinanciera && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(245, 158, 11, 0.12)', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                  <span style={{ fontWeight: 700, color: '#d97706' }}>Anticipo 100% Sobretasa Año Siguiente (Casilla 110):</span>
                  <span style={{ fontWeight: 900, color: '#d97706' }}>+${formatCOP(anticipoSobretasaSiguiente, false)}</span>
                </div>
              )}
            </div>

            {/* RESUMEN EXPLICATIVO */}
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                📋 Marco Normativo Aplicable:
              </div>
              <div>• <strong>Art. 240 Par. 2:</strong> Las instituciones financieras con RLG ≥ 120.000 UVT liquidan 5 puntos de sobretasa y deben anticipar el 100% para el año siguiente en la Casilla 110.</div>
              <div>• <strong>Art. 240 Par. 4:</strong> Las hidroeléctricas con RLG ≥ 30.000 UVT liquidan 3 puntos adicionales.</div>
              <div>• <strong>Art. 240-1:</strong> Los usuarios industriales de zonas francas tributan al 20% sobre sus rentas procedentes de exportación o actividades autorizadas.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
