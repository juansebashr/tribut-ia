import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCOP, parseCOP } from '../../utils/formatters';

export const PresentacionSancionesModule: React.FC = () => {
  const { uvtValue } = useApp();

  // Auditoría state
  const [impuestoAnt, setImpuestoAnt] = useState<number>(10000000);

  // Sanciones state
  const [sancionTipo, setSancionTipo] = useState<string>('correccion');
  const [montoBase, setMontoBase] = useState<number>(5000000);
  const [isSaldoFavor, setIsSaldoFavor] = useState<boolean>(false);
  const [mesesRetraso, setMesesRetraso] = useState<number>(3);
  const [tieneEmplazamiento, setTieneEmplazamiento] = useState<boolean>(false);
  const [art640Gradualidad, setArt640Gradualidad] = useState<string>('50'); // '50', '25', '0'
  const [diasMora, setDiasMora] = useState<number>(90);
  const [tasaEa, setTasaEa] = useState<number>(23.0);

  // Auditoría Calculation
  const minImpuestoAuditUvt = 71;
  const minImpuestoAuditCop = minImpuestoAuditUvt * uvtValue;
  const cumpleTopeMinimo = impuestoAnt >= minImpuestoAuditCop;

  const meta6Meses = impuestoAnt * 1.35;
  const inc6Meses = meta6Meses - impuestoAnt;
  const meta12Meses = impuestoAnt * 1.25;
  const inc12Meses = meta12Meses - impuestoAnt;

  // Sanciones Calculation
  const minSancionLegalCop = 10 * uvtValue;

  const calculateSancion = () => {
    let tarifaBasePct = 0.1; // Default 10% corrección
    let descripcionBase = 'Corrección voluntaria';

    if (sancionTipo === 'correccion') {
      tarifaBasePct = tieneEmplazamiento ? 0.2 : 0.1;
      descripcionBase = tieneEmplazamiento
        ? 'Corrección tras emplazamiento para corregir (20%)'
        : 'Corrección voluntaria antes de emplazamiento (10%)';
    } else if (sancionTipo === 'extemporaneidad') {
      const tarifaMes = tieneEmplazamiento ? 0.1 : 0.05;
      const meses = Math.max(1, mesesRetraso);
      const maxTarifa = tieneEmplazamiento ? 2.0 : 1.5;
      tarifaBasePct = Math.min(tarifaMes * meses, maxTarifa);
      descripcionBase = `Extemporaneidad (${(tarifaMes * 100).toFixed(0)}% x ${meses} mes/fracción)`;
    } else if (sancionTipo === 'inexactitud_general') {
      tarifaBasePct = 1.0;
      descripcionBase = 'Inexactitud general (100%)';
    } else if (sancionTipo === 'inexactitud_facturas_falsas') {
      tarifaBasePct = 1.6;
      descripcionBase = 'Inexactitud por facturas falsas / proveedores ficticios (160%)';
    } else if (sancionTipo === 'inexactitud_abuso') {
      tarifaBasePct = 2.0;
      descripcionBase = 'Inexactitud por abuso tributario (200%)';
    } else if (sancionTipo === 'inexactitud_req_especial') {
      tarifaBasePct = 0.35;
      descripcionBase = 'Inexactitud con aceptación en Requerimiento Especial (35%)';
    } else if (sancionTipo === 'inexactitud_recurso') {
      tarifaBasePct = 0.7;
      descripcionBase = 'Inexactitud con aceptación en Recurso de Reconsideración (70%)';
    }

    const sancionSinReduccion = montoBase * tarifaBasePct;

    // Apply Art. 640 reductions
    let factorReduccion = 1.0;
    if (art640Gradualidad === '50') {
      factorReduccion = 0.5;
    } else if (art640Gradualidad === '25') {
      factorReduccion = 0.75;
    }

    let sancionReducida = sancionSinReduccion * factorReduccion;
    let aplicaMinima = false;

    if (sancionReducida < minSancionLegalCop) {
      sancionReducida = minSancionLegalCop;
      aplicaMinima = true;
    }

    // Intereses moratorios calculation (compound daily)
    let interesesMoraCop = 0;
    if (!isSaldoFavor && montoBase > 0 && diasMora > 0) {
      const iEa = tasaEa / 100;
      const factorInteres = Math.pow(1 + iEa, diasMora / 365) - 1;
      interesesMoraCop = Math.round(montoBase * factorInteres);
    }

    const totalAPagar = sancionReducida + interesesMoraCop;

    return {
      descripcionBase,
      tarifaBasePct,
      sancionSinReduccion,
      factorReduccion,
      sancionReducida,
      aplicaMinima,
      interesesMoraCop,
      totalAPagar,
    };
  };

  const sancionResult = calculateSancion();

  return (
    <div id="pane-presentacion" className="module-pane active">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          ⚖️ Presentación de la Declaración, Beneficio de Auditoría &amp; Régimen Sancionatorio
        </h2>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
          Guía completa para presentar correctamente tu declaración de renta, obtener firmeza legal anticipada (Art. 689-3 E.T.) y entender las consecuencias de no cumplir o de corregir bajo el Régimen Sancionatorio del Estatuto Tributario.
        </p>
      </div>

      {/* SECCIÓN 1: BENEFICIO DE AUDITORÍA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to right, #3b82f6, transparent)' }} />
        <div
          style={{
            background: '#1e3a8a',
            color: 'white',
            fontSize: '11px',
            fontWeight: 800,
            padding: '4px 14px',
            borderRadius: '20px',
            whiteSpace: 'nowrap',
          }}
        >
          ⚡ SECCIÓN 1 — BENEFICIO DE AUDITORÍA (ART. 689-3 E.T.)
        </div>
        <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to left, #3b82f6, transparent)' }} />
      </div>

      <div className="responsive-grid-split" style={{ marginBottom: '32px' }}>
        {/* SIMULADOR AUDITORIA */}
        <div className="card" style={{ border: '2px solid var(--primary-border)' }}>
          <div className="card-header" style={{ background: 'var(--primary-light)' }}>
            <div className="card-title" style={{ color: 'var(--primary)', fontSize: '14px' }}>
              ⚡ Simulador de Beneficio de Auditoría (Art. 689-3 E.T.)
            </div>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Ingresa tu Impuesto Neto de Renta del año gravable anterior para calcular las metas de incremento requeridas para obtener <strong>firmeza definitiva en 6 o 12 meses</strong>.
            </p>

            <div className="input-field" style={{ marginBottom: '12px' }}>
              <label className="input-label">Impuesto Neto de Renta del Año Anterior (Casilla 112 F210)</label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  id="sim-aud-impuesto-ant"
                  className="currency-input"
                  value={formatCOP(impuestoAnt, false)}
                  onChange={(e) => setImpuestoAnt(parseCOP(e.target.value))}
                />
              </div>
            </div>

            <div id="sim-aud-result" style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '6px', fontSize: '12px' }}>
              {!cumpleTopeMinimo ? (
                <div style={{ color: 'var(--rose)', fontWeight: 700 }}>
                  ⚠️ Tu impuesto del año anterior ({formatCOP(impuestoAnt)}) es inferior a 71 UVT ({formatCOP(minImpuestoAuditCop)}). No tienes acceso al Beneficio de Auditoría según el Art. 689-3 Parágrafo 3 del E.T.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '13px' }}>⚡ FIRMEZA EN 6 MESES (Incremento &ge; 35%):</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Impuesto neto mínimo a liquidar este año: <strong>{formatCOP(meta6Meses)}</strong> (+{formatCOP(inc6Meses)} de aumento).
                    </div>
                  </div>

                  <div style={{ background: 'var(--emerald-light)', border: '1px solid var(--emerald-border)', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--emerald)', fontSize: '13px' }}>📅 FIRMEZA EN 12 MESES (Incremento &ge; 25%):</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Impuesto neto mínimo a liquidar este año: <strong>{formatCOP(meta12Meses)}</strong> (+{formatCOP(inc12Meses)} de aumento).
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* GUÍA AUDITORIA */}
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ fontSize: '13px' }}>📋 Plazos Legales de Presentación 2026</div>
          </div>
          <div className="card-body" style={{ fontSize: '11.5px', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '10px', marginBottom: '10px' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>📆 Calendario de Vencimientos para Personas Naturales</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                • Dos últimos dígitos del NIT determinan tu fecha exacta.<br />
                • Generalmente entre <strong>agosto y octubre</strong> del año siguiente al gravable.<br />
                • Presentar extemporáneamente genera <strong>Sanción por Extemporaneidad</strong>.
              </div>
            </div>
            <div style={{ background: 'var(--amber-light)', border: '1px solid var(--amber-border)', borderRadius: '6px', padding: '10px' }}>
              <div style={{ fontWeight: 700, color: 'var(--amber)', marginBottom: '4px' }}>💡 Estrategia Óptima con Beneficio de Auditoría</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                1. Presentar y pagar completo en el plazo legal.<br />
                2. La firmeza opera de pleno derecho: <strong>no necesitas solicitarla</strong>.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: RÉGIMEN SANCIONATORIO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to right, #dc2626, transparent)' }} />
        <div
          style={{
            background: '#7f1d1d',
            color: 'white',
            fontSize: '11px',
            fontWeight: 800,
            padding: '4px 14px',
            borderRadius: '20px',
            whiteSpace: 'nowrap',
          }}
        >
          ⚖️ SECCIÓN 2 — RÉGIMEN SANCIONATORIO TRIBUTARIO
        </div>
        <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to left, #dc2626, transparent)' }} />
      </div>

      {/* CALCULADORA DE SANCIONES */}
      <div className="responsive-grid-split">
        {/* PARÁMETROS CALCULADORA */}
        <div className="card" style={{ border: '2px solid var(--emerald-border)' }}>
          <div
            className="card-header"
            style={{
              background: 'var(--emerald-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div className="card-title" style={{ color: 'var(--emerald)', fontSize: '14px' }}>
              🧮 Calculadora de Sanciones Tributarias &amp; Intereses Moratorios
            </div>
          </div>
          <div className="card-body">
            {/* TIPO DE SANCIÓN */}
            <div className="input-field" style={{ marginBottom: '10px' }}>
              <label className="input-label">Tipo de Infracción / Sanción a Liquidar</label>
              <select
                id="sancion-calc-tipo"
                className="text-input"
                value={sancionTipo}
                onChange={(e) => setSancionTipo(e.target.value)}
              >
                <option value="correccion">✏️ Sanción por Corrección (Art. 644 E.T. — 10% / 20%)</option>
                <option value="extemporaneidad">⏰ Sanción por Extemporaneidad (Art. 641 y 642 E.T. — 5% / 10% mes)</option>
                <option value="inexactitud_general">🎯 Sanción por Inexactitud General (Art. 648 E.T. — 100%)</option>
                <option value="inexactitud_facturas_falsas">🚫 Inexactitud: Facturas Falsas / Proveedores Ficticios (160%)</option>
                <option value="inexactitud_abuso">⚖️ Inexactitud: Abuso en Materia Tributaria (200%)</option>
                <option value="inexactitud_req_especial">🤝 Inexactitud con Aceptación en Requerimiento Especial (35%)</option>
                <option value="inexactitud_recurso">📜 Inexactitud con Aceptación en Recurso Reconsideración (70%)</option>
              </select>
            </div>

            {/* MONTO BASE */}
            <div className="input-field" style={{ marginBottom: '10px' }}>
              <label className="input-label" id="sancion-monto-base-label">
                Monto Base del Impuesto o Mayor Valor ($ COP)
              </label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  id="sancion-calc-monto-base"
                  className="currency-input"
                  value={formatCOP(montoBase, false)}
                  onChange={(e) => setMontoBase(parseCOP(e.target.value))}
                />
              </div>
            </div>

            {/* SALDO A FAVOR TOGGLE */}
            <div style={{ marginBottom: '10px' }}>
              <label className="checkbox-group" style={{ padding: '6px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}>
                <input
                  type="checkbox"
                  id="sancion-calc-saldo-favor"
                  checked={isSaldoFavor}
                  onChange={(e) => setIsSaldoFavor(e.target.checked)}
                />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#991b1b' }}>
                  🛡️ Es declaración con Saldo a Favor (Intereses de Mora = $0 COP)
                </span>
              </label>
            </div>

            {/* MESES RETRASO (IF EXTEMPORANEIDAD) */}
            {sancionTipo === 'extemporaneidad' && (
              <div className="input-field" id="sancion-meses-container" style={{ marginBottom: '10px' }}>
                <label className="input-label">Meses o Fracción de Mes Calendario de Retraso</label>
                <input
                  type="number"
                  id="sancion-calc-meses"
                  className="text-input"
                  value={mesesRetraso}
                  min={1}
                  onChange={(e) => setMesesRetraso(parseInt(e.target.value, 10) || 1)}
                />
              </div>
            )}

            {/* EMPLAZAMIENTO TOGGLE */}
            <div style={{ marginBottom: '10px' }}>
              <label className="checkbox-group">
                <input
                  type="checkbox"
                  id="sancion-calc-emplazamiento"
                  checked={tieneEmplazamiento}
                  onChange={(e) => setTieneEmplazamiento(e.target.checked)}
                />
                <span style={{ fontSize: '11.5px' }}>
                  ⚠️ ¿Media emplazamiento de la DIAN? (Duplica o aumenta la tarifa)
                </span>
              </label>
            </div>

            {/* GRADUALIDAD ART 640 */}
            <div className="input-field" style={{ marginBottom: '10px' }}>
              <label className="input-label">Gradualidad y Rebajas (Art. 640 E.T.)</label>
              <select
                id="sancion-calc-art640"
                className="text-input"
                value={art640Gradualidad}
                onChange={(e) => setArt640Gradualidad(e.target.value)}
              >
                <option value="50">🌟 Reducción al 50% (Sin sanciones en los últimos 2 años)</option>
                <option value="25">⭐ Reducción al 75% (Sin sanciones en el último año)</option>
                <option value="0">❌ Sin reducción (Reincidencia o tarifa plena 100%)</option>
              </select>
            </div>

            {/* DÍAS MORA E INTERESES */}
            {!isSaldoFavor && (
              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Días de Mora en el Pago</label>
                  <input
                    type="number"
                    id="sancion-dias-mora"
                    className="text-input"
                    value={diasMora}
                    onChange={(e) => setDiasMora(parseInt(e.target.value, 10) || 0)}
                  />
                </div>
                <div className="input-field">
                  <label className="input-label">Tasa E.A. Usura - 2 pts (%)</label>
                  <input
                    type="number"
                    id="sancion-tasa-ea"
                    className="text-input"
                    value={tasaEa}
                    step={0.1}
                    onChange={(e) => setTasaEa(parseFloat(e.target.value) || 23.0)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RESULT BOX */}
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ fontSize: '13.5px', fontWeight: 800 }}>
              📊 Resultado de la Liquidación Sancionatoria
            </div>
          </div>
          <div className="card-body" id="sancion-calc-result-box" style={{ padding: '16px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px', marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                {sancionResult.descripcionBase} • Tarifa Base: {Math.round(sancionResult.tarifaBasePct * 100)}%
              </div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--rose)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                Sanción Liquidada a Pagar: {formatCOP(sancionResult.sancionReducida)} COP
              </div>
              {parseInt(art640Gradualidad, 10) > 0 && (
                <div style={{ fontSize: '11px', color: 'var(--emerald)', marginTop: '4px', fontWeight: 600 }}>
                  ✓ Descuento Art. 640 ({art640Gradualidad}%): Ahorro Favorabilidad {formatCOP(sancionResult.sancionSinReduccion - sancionResult.sancionReducida)} COP
                </div>
              )}
              {sancionResult.aplicaMinima && (
                <div style={{ fontSize: '10.5px', color: 'var(--amber)', marginTop: '2px' }}>
                  ⚠️ Se aplicó la Sanción Mínima legal de 10 UVT ({formatCOP(minSancionLegalCop)}).
                </div>
              )}
            </div>

            {!isSaldoFavor && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Intereses Moratorios ({diasMora} días @ {tasaEa}% E.A.)
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  Intereses: +{formatCOP(sancionResult.interesesMoraCop)} COP
                </div>
              </div>
            )}

            <div style={{ background: 'var(--emerald-light)', border: '2px solid var(--emerald)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--emerald)', textTransform: 'uppercase', fontWeight: 800 }}>
                GRAN TOTAL CONSOLIDADO (SANCIÓN + INTERESES)
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--emerald)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {formatCOP(sancionResult.totalAPagar)} COP
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
