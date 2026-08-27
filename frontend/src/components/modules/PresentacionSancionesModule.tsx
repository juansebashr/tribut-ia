import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCOP, parseCOP } from '../../utils/formatters';
import { WorkspaceHubLanding } from '../common/WorkspaceHubLanding';

export const PresentacionSancionesModule: React.FC = () => {
  const { uvtValue, taxYear, activeSubTab } = useApp();

  const [activeSection, setActiveSection] = useState<'flujogramas' | 'calculadora' | 'auditoria' | 'guia'>('flujogramas');

  // Interactive Flowchart Selection
  const [selectedFlow, setSelectedFlow] = useState<'extemporaneidad' | 'correccion' | 'inexactitud' | 'auditoria'>('extemporaneidad');

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

  if (activeSubTab === 'hub' || activeSubTab === 'overview') {
    return <WorkspaceHubLanding workspace="sanciones" />;
  }

  return (
    <div id="pane-presentacion" className="module-pane active" style={{ paddingBottom: '30px' }}>
      {/* HEADER PRINCIPAL */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              ⚖️ Presentación, Beneficio de Auditoría &amp; Régimen Sancionatorio
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Aprende de forma visual y didáctica qué hacer si se te pasó el plazo, si necesitas corregir o cómo blindar tu declaración ante la DIAN.
            </p>
          </div>

          <div className="tab-pill-group" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${activeSection === 'flujogramas' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveSection('flujogramas')}
            >
              🔄 Diagramas de Flujo &amp; Decisión
            </button>
            <button
              className={`btn btn-sm ${activeSection === 'calculadora' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveSection('calculadora')}
            >
              🧮 Calculadora de Sanciones
            </button>
            <button
              className={`btn btn-sm ${activeSection === 'auditoria' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveSection('auditoria')}
            >
              ⚡ Beneficio de Auditoría
            </button>
            <button
              className={`btn btn-sm ${activeSection === 'guia' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveSection('guia')}
            >
              📖 Guía para No Contadores
            </button>
          </div>
        </div>

        {/* ALERTA NORMATIVA DE SANCIONES Y FIRMEZA */}
        <div
          style={{
            marginTop: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            fontSize: '12px',
            lineHeight: '1.55',
            color: 'var(--text-secondary)',
          }}
        >
          <strong style={{ color: '#dc2626' }}>📌 Reglas de Oro del Régimen Sancionatorio Colombiano:</strong>
          <span style={{ marginLeft: '6px' }}>
            1) <strong>Sanción Mínima (Art. 639):</strong> Ninguna sanción en 2026 puede ser menor a 10 UVT (<strong>{formatCOP(minSancionLegalCop)} COP</strong>).
            2) <strong>Término de Firmeza (Art. 714):</strong> La DIAN tiene 3 años para auditarte, salvo que te acojas al Beneficio de Auditoría (6 o 12 meses).
            3) <strong>Principio de Favorabilidad (Art. 640):</strong> Si no has tenido sanciones previas, tienes derecho a un 50% o 75% de descuento en la sanción.
          </span>
        </div>
      </div>

      {/* SECCIÓN 1: DIAGRAMAS DE FLUJO INTERACTIVOS */}
      {activeSection === 'flujogramas' && (
        <div>
          {/* SELECTOR DE FLUJOGRAMA */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, alignSelf: 'center', color: 'var(--text-muted)' }}>
              Selecciona tu situación:
            </span>
            <button
              className={`btn btn-xs ${selectedFlow === 'extemporaneidad' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedFlow('extemporaneidad')}
            >
              ⏰ 1. Se me pasó el plazo de declarar
            </button>
            <button
              className={`btn btn-xs ${selectedFlow === 'correccion' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedFlow('correccion')}
            >
              ✏️ 2. Me equivoqué y debo corregir
            </button>
            <button
              className={`btn btn-xs ${selectedFlow === 'inexactitud' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedFlow('inexactitud')}
            >
              ⚠️ 3. La DIAN me descubrió un error
            </button>
            <button
              className={`btn btn-xs ${selectedFlow === 'auditoria' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedFlow('auditoria')}
            >
              🛡️ 4. Quiero que la DIAN no me revise por 3 años
            </button>
          </div>

          {/* FLUJO 1: EXTEMPORANEIDAD */}
          {selectedFlow === 'extemporaneidad' && (
            <div className="card" style={{ border: '2px solid #f59e0b' }}>
              <div className="card-header" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <div className="card-title" style={{ fontSize: '14px', color: '#d97706' }}>
                  🔄 Diagrama de Decisión: Sanción por Extemporaneidad (Arts. 641 y 642 E.T.)
                </div>
              </div>
              <div className="card-body">
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Sigue este camino visual para saber exactamente cuánto deberás pagar si presentas tu declaración después de tu fecha de vencimiento:
                </p>

                {/* PASOS EN CADENA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* PASO 1 */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                      1
                    </div>
                    <div style={{ flex: 1, background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                        Paso 1: ¿Tu declaración da Impuesto a Pagar o Saldo a Favor?
                      </strong>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', marginTop: '8px', fontSize: '11.5px' }}>
                        <div style={{ padding: '8px', background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                          <strong>🅰️ Da Impuesto a Pagar:</strong> La sanción base es del <strong>5% por cada mes o fracción de mes de retraso</strong> sobre el impuesto a cargo (máximo 100%).
                        </div>
                        <div style={{ padding: '8px', background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                          <strong>🅱️ Da Saldo a Favor / $0:</strong> La sanción se calcula sobre el 0.5% de tus ingresos brutos o el 1% del patrimonio líquido del año anterior (máximo 100%).
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FLECHA CONECTOR */}
                  <div style={{ textAlign: 'center', fontSize: '16px', color: 'var(--text-muted)', margin: '-6px 0' }}>⬇️</div>

                  {/* PASO 2 */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                      2
                    </div>
                    <div style={{ flex: 1, background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                        Paso 2: ¿Presentas voluntariamente o la DIAN ya te notificó Emplazamiento?
                      </strong>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', marginTop: '8px', fontSize: '11.5px' }}>
                        <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.06)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                          <strong style={{ color: 'var(--emerald)' }}>✅ Voluntario (Art. 641):</strong> Tarifa estándar del 5% mensual. ¡Presenta cuanto antes para evitar la carta de la DIAN!
                        </div>
                        <div style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.06)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                          <strong style={{ color: 'var(--rose)' }}>❌ Con Emplazamiento (Art. 642):</strong> ¡La tarifa se DUPLICA al <strong>10% por mes</strong> (hasta el 200%)!
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FLECHA CONECTOR */}
                  <div style={{ textAlign: 'center', fontSize: '16px', color: 'var(--text-muted)', margin: '-6px 0' }}>⬇️</div>

                  {/* PASO 3 */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                      3
                    </div>
                    <div style={{ flex: 1, background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                        Paso 3: ¿Tienes historial limpio ante la DIAN? (Principio de Favorabilidad Art. 640)
                      </strong>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', marginTop: '8px', fontSize: '11.5px' }}>
                        <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.06)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                          <strong>🌟 2 años sin sanciones:</strong> Pagas solo el <strong>50% de la sanción</strong> calculada.
                        </div>
                        <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.06)', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                          <strong>⭐ 1 año sin sanciones:</strong> Pagas el <strong>75% de la sanción</strong> (descuento del 25%).
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FLECHA CONECTOR */}
                  <div style={{ textAlign: 'center', fontSize: '16px', color: 'var(--text-muted)', margin: '-6px 0' }}>⬇️</div>

                  {/* PASO 4: RESULTADO FINAL Y SANCIÓN MÍNIMA */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#8b5cf6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                      4
                    </div>
                    <div style={{ flex: 1, background: 'rgba(139, 92, 246, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                      <strong style={{ fontSize: '13px', color: '#7c3aed', display: 'block', marginBottom: '4px' }}>
                        Paso 4: Control de Sanción Mínima Legal + Intereses de Mora
                      </strong>
                      <p style={{ margin: 0, fontSize: '11.5px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                        • <strong>Control de Piso:</strong> Si la sanción reducida da menos de 10 UVT (<strong>{formatCOP(minSancionLegalCop)} COP</strong>), debes subirla a {formatCOP(minSancionLegalCop)} COP.<br />
                        • <strong>Intereses Moratorios (Art. 634):</strong> Se calculan día a día a la tasa de usura vigente sobre el impuesto adeudado.<br />
                        • <strong>Término de Firmeza:</strong> Al presentar extemporáneo, los 3 años de revisión de la DIAN empiezan a contar desde el día de presentación, no desde la fecha original.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FLUJO 2: CORRECCIÓN */}
          {selectedFlow === 'correccion' && (
            <div className="card" style={{ border: '2px solid #3b82f6' }}>
              <div className="card-header" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                <div className="card-title" style={{ fontSize: '14px', color: 'var(--primary)' }}>
                  🔄 Diagrama de Decisión: Sanción por Corrección (Art. 644 E.T.)
                </div>
              </div>
              <div className="card-body">
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Si ya presentaste tu declaración pero olvidaste un ingreso, un activo o tomaste una deducción improcedente:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.06)', borderRadius: '8px', borderLeft: '4px solid var(--emerald)' }}>
                    <strong style={{ color: 'var(--emerald)', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                      1. Corrección Voluntaria (10%)
                    </strong>
                    <p style={{ fontSize: '11.5px', margin: 0, lineHeight: '1.6' }}>
                      Si te das cuenta tú mismo <strong>antes</strong> de que la DIAN te envíe un Emplazamiento para Corregir:
                      <br />• Sanción base: <strong>10% del mayor valor a pagar</strong> (o del menor saldo a favor).
                      <br />• Con Art. 640 (historial limpio 2 años): Se reduce al <strong>5%</strong>.
                      <br />• Piso mínimo: 10 UVT ({formatCOP(minSancionLegalCop)}).
                    </p>
                  </div>

                  <div style={{ padding: '14px', background: 'rgba(239, 68, 68, 0.06)', borderRadius: '8px', borderLeft: '4px solid var(--rose)' }}>
                    <strong style={{ color: 'var(--rose)', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                      2. Corrección tras Emplazamiento DIAN (20%)
                    </strong>
                    <p style={{ fontSize: '11.5px', margin: 0, lineHeight: '1.6' }}>
                      Si la DIAN detectó la inconsistencia en su cruce de exógena y te notificó el <strong>Emplazamiento para Corregir (Art. 685)</strong>:
                      <br />• Sanción base: Se eleva al <strong>20% del mayor valor</strong>.
                      <br />• Con Art. 640: Se reduce al <strong>10% o 15%</strong>.
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '14px', padding: '12px', background: 'var(--bg-subtle)', borderRadius: '6px', fontSize: '11.5px' }}>
                  💡 <strong>¿Cuándo NO hay sanción de corrección?</strong> Cuando corriges para aumentar el saldo a favor o disminuir el impuesto a pagar (Art. 589 E.T.), o cuando corriges solo datos informativos de identificación o dirección (Art. 588 Parágrafo).
                </div>
              </div>
            </div>
          )}

          {/* FLUJO 3: INEXACTITUD */}
          {selectedFlow === 'inexactitud' && (
            <div className="card" style={{ border: '2px solid var(--rose)' }}>
              <div className="card-header" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                <div className="card-title" style={{ fontSize: '14px', color: 'var(--rose)' }}>
                  🔄 Diagrama de Decisión: Sanción por Inexactitud (Art. 648, 709 y 713 E.T.)
                </div>
              </div>
              <div className="card-body">
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  La sanción por inexactitud se impone cuando la DIAN descubre omisión de ingresos, inclusión de costos ficticios o desajustes por comparación patrimonial:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px', borderTop: '4px solid #3b82f6' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)' }}>ETAPA 1: REQUERIMIENTO ESPECIAL</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--emerald)', margin: '4px 0' }}>35% de Sanción</div>
                    <p style={{ fontSize: '11px', margin: 0, color: 'var(--text-muted)' }}>
                      Si aceptas los gloses de la DIAN al responder el Requerimiento Especial (Art. 709 E.T.), la sanción se reduce al 35%.
                    </p>
                  </div>

                  <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px', borderTop: '4px solid #f59e0b' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#d97706' }}>ETAPA 2: RECURSO RECONSIDERACIÓN</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#d97706', margin: '4px 0' }}>70% de Sanción</div>
                    <p style={{ fontSize: '11px', margin: 0, color: 'var(--text-muted)' }}>
                      Si la DIAN ya profirió Liquidación Oficial de Revisión pero aceptas al interponer el Recurso (Art. 713 E.T.), la sanción es del 70%.
                    </p>
                  </div>

                  <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px', borderTop: '4px solid var(--rose)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--rose)' }}>ETAPA 3: SANCIÓN PLENA</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--rose)', margin: '4px 0' }}>100% - 200%</div>
                    <p style={{ fontSize: '11px', margin: 0, color: 'var(--text-muted)' }}>
                      Si no aceptas y pierdes el litigio, pagas el 100% de sanción (160% por compras ficticias o 200% por abuso tributario).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FLUJO 4: BENEFICIO DE AUDITORÍA */}
          {selectedFlow === 'auditoria' && (
            <div className="card" style={{ border: '2px solid var(--emerald)' }}>
              <div className="card-header" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                <div className="card-title" style={{ fontSize: '14px', color: 'var(--emerald)' }}>
                  🔄 Diagrama de Blindaje: Beneficio de Auditoría (Art. 689-3 E.T.)
                </div>
              </div>
              <div className="card-body">
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  ¿Cómo lograr que la DIAN no te revise por 3 años y cierre tu declaración en tiempo récord?
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  <div style={{ padding: '14px', background: 'rgba(59, 130, 246, 0.06)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                      ⚡ OPCIÓN A: Firmeza Total en 6 MESES
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11.5px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                      <li>Incrementar el Impuesto Neto de Renta en <strong>&ge; 35%</strong> frente al año anterior.</li>
                      <li>Impuesto neto del año anterior debe ser <strong>&ge; 71 UVT</strong> ({formatCOP(minImpuestoAuditCop)}).</li>
                      <li>Presentar y pagar oportunamente dentro de los plazos de ley.</li>
                    </ul>
                  </div>

                  <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.06)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--emerald)', marginBottom: '4px' }}>
                      📅 OPCIÓN B: Firmeza Total en 12 MESES
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11.5px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                      <li>Incrementar el Impuesto Neto de Renta en <strong>&ge; 25%</strong> frente al año anterior.</li>
                      <li>Impuesto neto del año anterior &ge; 71 UVT.</li>
                      <li>A los 12 meses exactos la DIAN pierde toda potestad de fiscalización.</li>
                    </ul>
                  </div>
                </div>

                <div style={{ marginTop: '14px', padding: '12px', background: 'var(--bg-subtle)', borderRadius: '6px', fontSize: '11.5px' }}>
                  🛡️ <strong>Comparativa de Firmeza:</strong> Sin este beneficio, la DIAN tiene <strong>3 largos años (Art. 714 E.T.)</strong> para requerirte, pedirte extractos o auditar tu patrimonio.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN 2: CALCULADORA DINÁMICA */}
      {activeSection === 'calculadora' && (
        <div className="responsive-grid-split">
          {/* PARÁMETROS CALCULADORA */}
          <div className="card" style={{ border: '2px solid var(--emerald-border)' }}>
            <div className="card-header" style={{ background: 'var(--emerald-light)' }}>
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

              {/* MESES RETRASO */}
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
      )}

      {/* SECCIÓN 3: BENEFICIO DE AUDITORÍA */}
      {activeSection === 'auditoria' && (
        <div className="responsive-grid-split">
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

          {/* GUÍA AUDITORIA Y FIRMEZA */}
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ fontSize: '13px' }}>📋 Firmeza Legal &amp; Plazos de Presentación {taxYear}</div>
            </div>
            <div className="card-body" style={{ fontSize: '11.5px', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '6px', padding: '10px', marginBottom: '10px' }}>
                <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
                  🛡️ Término General de Firmeza de la DIAN (Art. 714 E.T.)
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  Por regla general, la declaración de renta queda en <strong>firme a los 3 años</strong> contados a partir del vencimiento del plazo para declarar (o de la fecha de presentación si fue extemporánea). Si dentro de ese lapso la DIAN profiere y notifica un <strong>Emplazamiento para Corregir (Art. 685 E.T.)</strong> o un <strong>Requerimiento Especial (Art. 703 E.T.)</strong>, el término de firmeza se suspende o interrumpe, permitiéndole a la administración revisar a fondo y liquidar oficialmente el tributo.
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '10px', marginBottom: '10px' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>📆 Calendario de Vencimientos para Personas Naturales</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  • Dos últimos dígitos del NIT determinan tu fecha exacta (agosto a octubre).<br />
                  • Presentar extemporáneamente genera sanción del Art. 641 y extiende el conteo de los 3 años de firmeza.
                </div>
              </div>

              <div style={{ background: 'var(--amber-light)', border: '1px solid var(--amber-border)', borderRadius: '6px', padding: '10px' }}>
                <div style={{ fontWeight: 700, color: 'var(--amber)', marginBottom: '4px' }}>💡 Beneficio de Auditoría (Art. 689-3 E.T.)</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  Reduce el término general de 3 años a <strong>6 meses (+35%)</strong> o <strong>12 meses (+25%)</strong>. Requiere presentar y pagar completo en el plazo legal y que el impuesto anterior sea &ge; 71 UVT. Opera de pleno derecho.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 4: GUÍA PARA NO CONTADORES */}
      {activeSection === 'guia' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div className="card">
            <div className="card-header" style={{ background: 'rgba(59, 130, 246, 0.08)' }}>
              <div className="card-title" style={{ fontSize: '13.5px', color: 'var(--primary)' }}>
                1. ¿Qué es un Emplazamiento para Corregir? (Art. 685 E.T.)
              </div>
            </div>
            <div className="card-body" style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              <p>
                Es una carta formal que la DIAN te envía cuando detecta inconsistencias en tu declaración (por ejemplo, ingresos no declarados que tus clientes reportaron en medios magnéticos o compras no soportadas).
              </p>
              <p>
                Te da <strong>1 mes</strong> de plazo para corregir. Si corriges dentro de ese mes, la sanción de corrección sube del 10% al <strong>20%</strong> (Art. 644). Si no corriges, la DIAN pasará a emitir un <strong>Requerimiento Especial</strong>.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ background: 'rgba(239, 68, 68, 0.08)' }}>
              <div className="card-title" style={{ fontSize: '13.5px', color: 'var(--rose)' }}>
                2. ¿Qué es un Requerimiento Especial? (Art. 703 E.T.)
              </div>
            </div>
            <div className="card-body" style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              <p>
                Es la propuesta formal de liquidación oficial donde la DIAN te dice cuánto impuesto y cuánta sanción por inexactitud (100%) pretende cobrarte.
              </p>
              <p>
                Tienes <strong>3 meses</strong> para responder, presentar pruebas o aceptar los cargos. Si aceptas en esta etapa, la sanción se rebaja al <strong>35%</strong> (Art. 709).
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ background: 'rgba(16, 185, 129, 0.08)' }}>
              <div className="card-title" style={{ fontSize: '13.5px', color: 'var(--emerald)' }}>
                3. ¿Por qué se cobran Intereses de Mora diarios?
              </div>
            </div>
            <div className="card-body" style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              <p>
                Los intereses moratorios (Art. 634 y 635 E.T.) corren automáticamente por cada día calendario de retraso en el pago del impuesto adeudado, a la tasa de usura fijada por la Superfinanciera menos 2 puntos.
              </p>
              <p>
                A diferencia de las sanciones, los intereses <strong>no tienen valor mínimo ni tienen descuentos por el Art. 640</strong>. Por eso, pagar lo antes posible es la mejor estrategia.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
