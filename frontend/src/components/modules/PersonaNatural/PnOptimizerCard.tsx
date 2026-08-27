import React, { useState, useEffect } from 'react';
import type { PersonaNaturalInput, PersonaNaturalOutput } from '../../../types/tax';
import { formatCOP, parseCOP } from '../../../utils/formatters';
import { calculatePersonaNatural } from '../../../services/api';

interface PnOptimizerCardProps {
  inputs: PersonaNaturalInput;
  result: PersonaNaturalOutput | null;
  uvtValue: number;
  taxYear?: number;
  onApplyOptimization: (modifications: Partial<PersonaNaturalInput>) => void;
  onNavigateToCalc?: () => void;
  onNavigateToF210?: () => void;
}

export const PnOptimizerCard: React.FC<PnOptimizerCardProps> = ({
  inputs,
  result,
  uvtValue,
  taxYear = 2026,
  onApplyOptimization,
  onNavigateToCalc,
  onNavigateToF210,
}) => {
  // Local simulated levers
  const [simAfcFpv, setSimAfcFpv] = useState<number>(inputs.aportes_voluntarios_pension_afc || 0);
  const [simPrepagada, setSimPrepagada] = useState<number>(inputs.medicina_prepagada_anual || 0);
  const [simInteresesVivienda, setSimInteresesVivienda] = useState<number>(inputs.intereses_vivienda_anual || 0);
  const [simDependienteGeneral, setSimDependienteGeneral] = useState<boolean>(inputs.aplica_dependiente_general ?? true);
  const [simDependientesAdic, setSimDependientesAdic] = useState<number>(
    inputs.numero_dependientes_adicionales_72uvt || 0
  );
  const [simFacturas, setSimFacturas] = useState<number>(
    inputs.compras_factura_electronica || 0
  );

  // Simulated live result
  const [simResult, setSimResult] = useState<PersonaNaturalOutput | null>(result);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Keep levers in sync when parent inputs change drastically (e.g. preset switch)
  useEffect(() => {
    setSimAfcFpv(inputs.aportes_voluntarios_pension_afc || 0);
    setSimPrepagada(inputs.medicina_prepagada_anual || 0);
    setSimInteresesVivienda(inputs.intereses_vivienda_anual || 0);
    setSimDependienteGeneral(inputs.aplica_dependiente_general ?? true);
    setSimDependientesAdic(inputs.numero_dependientes_adicionales_72uvt || 0);
    setSimFacturas(inputs.compras_factura_electronica || 0);
  }, [
    inputs.rentas_trabajo,
    inputs.patrimonio_bruto,
    inputs.deudas,
    inputs.tax_year,
    inputs.custom_uvt,
  ]);

  // Run live exact calculation when levers change
  useEffect(() => {
    const simulatedInputs: PersonaNaturalInput = {
      ...inputs,
      aportes_voluntarios_pension_afc: simAfcFpv,
      medicina_prepagada_anual: simPrepagada,
      intereses_vivienda_anual: simInteresesVivienda,
      aplica_dependiente_general: simDependienteGeneral,
      numero_dependientes_adicionales_72uvt: simDependientesAdic,
      compras_factura_electronica: simFacturas,
    };

    setIsCalculating(true);
    const timer = setTimeout(async () => {
      try {
        const res = await calculatePersonaNatural(simulatedInputs);
        setSimResult(res);
      } catch (err) {
        console.error('Error calculando simulación what-if:', err);
      } finally {
        setIsCalculating(false);
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [
    inputs,
    simAfcFpv,
    simPrepagada,
    simInteresesVivienda,
    simDependienteGeneral,
    simDependientesAdic,
    simFacturas,
  ]);

  // Benchmark metrics
  const baseImpuestoCargo = result?.total_impuesto_a_cargo ?? result?.impuesto_neto_renta ?? 0;
  const simImpuestoCargo = simResult?.total_impuesto_a_cargo ?? simResult?.impuesto_neto_renta ?? 0;
  const ahorroNetoEstimado = Math.max(0, baseImpuestoCargo - simImpuestoCargo);

  const baseSaldoPagar = result?.saldo_a_pagar ?? 0;
  const simSaldoPagar = simResult?.saldo_a_pagar ?? 0;

  const baseRentaGravable = result?.renta_liquida_gravable ?? 0;
  const simRentaGravable = simResult?.renta_liquida_gravable ?? 0;
  const reduccionBaseGravable = Math.max(0, baseRentaGravable - simRentaGravable);

  // 40% Cap Analysis
  const limiteConjuntoCop = simResult?.limite_conjunto_aplicable_cop || (1340 * uvtValue);
  const totalAliviosAceptados40 = (simResult?.alivios_procedentes_finales || 0);
  const aliviosRechazados = simResult?.alivios_rechazados_por_limite || 0;
  const cupoLibre40 = Math.max(0, limiteConjuntoCop - totalAliviosAceptados40);
  const porcentajeUso40 = limiteConjuntoCop > 0 ? Math.min(100, Math.round((totalAliviosAceptados40 / limiteConjuntoCop) * 100)) : 0;
  const isCapReached = cupoLibre40 <= 0 || aliviosRechazados > 0;

  // Quick preset scenarios
  const applyPresetPrepagada = () => {
    // Si el límite del 40% está lleno por otras deducciones, ajustamos para que se note el efecto de medicina prepagada
    setSimPrepagada(192 * uvtValue); // 16 UVT/mes = 192 UVT/año
    if (isCapReached && (simInteresesVivienda > 0 || simAfcFpv > 0)) {
      // Dejamos espacio para que el usuario aprecie el impacto de la prepagada
      setSimAfcFpv(0);
    }
  };

  const applyPresetAfc = () => {
    const maxAfcAllowed = Math.min(3800 * uvtValue, Math.round((inputs.rentas_trabajo || 0) * 0.3));
    setSimAfcFpv(maxAfcAllowed > 0 ? maxAfcAllowed : 15000000);
  };

  const applyPresetFamiliar = () => {
    setSimDependientesAdic(4); // 4 dependientes adicionales = 288 UVT
    setSimPrepagada(192 * uvtValue);
    setSimDependienteGeneral(true);
  };

  const applyPresetFacturas = () => {
    setSimFacturas(240 * uvtValue * 100); // Para maximizar los 240 UVT de deducción (1% de compras)
  };

  const applyPresetIntegral = () => {
    setSimDependientesAdic(4);
    setSimPrepagada(192 * uvtValue);
    setSimDependienteGeneral(true);
    setSimFacturas(240 * uvtValue * 100);
    const sugeridoAfc = Math.min(3800 * uvtValue, Math.max(5000000, Math.round((inputs.rentas_trabajo || 0) * 0.2)));
    setSimAfcFpv(sugeridoAfc);
  };

  const resetToBaseline = () => {
    setSimAfcFpv(inputs.aportes_voluntarios_pension_afc || 0);
    setSimPrepagada(inputs.medicina_prepagada_anual || 0);
    setSimInteresesVivienda(inputs.intereses_vivienda_anual || 0);
    setSimDependienteGeneral(inputs.aplica_dependiente_general ?? true);
    setSimDependientesAdic(inputs.numero_dependientes_adicionales_72uvt || 0);
    setSimFacturas(inputs.compras_factura_electronica || 0);
  };

  const handleApply = () => {
    onApplyOptimization({
      aportes_voluntarios_pension_afc: simAfcFpv,
      medicina_prepagada_anual: simPrepagada,
      intereses_vivienda_anual: simInteresesVivienda,
      aplica_dependiente_general: simDependienteGeneral,
      numero_dependientes_adicionales_72uvt: simDependientesAdic,
      compras_factura_electronica: simFacturas,
    });
  };

  return (
    <div id="pane-pn-optimizer" data-testid="card-pn-optimizer" className="module-pane active card-pn-optimizer" style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
      {/* BARRA DE ACCIONES Y VOLVER */}
      <div className="presets-toolbar" style={{ marginBottom: '16px' }}>
        <div className="presets-toolbar-group">
          <span className="presets-toolbar-label">⚡ Planes Rápidos What-If:</span>
          <button className="btn btn-outline btn-sm" onClick={applyPresetPrepagada} title="Simular tope de Medicina Prepagada (192 UVT)">
            🩺 Prepagada Máx.
          </button>
          <button className="btn btn-outline btn-sm" onClick={applyPresetAfc} title="Simular Aportes Voluntarios a Pensión / Cuentas AFC">
            🏦 Aportes AFC/FPV
          </button>
          <button className="btn btn-outline btn-sm" onClick={applyPresetFamiliar} title="Simular 4 dependientes de 72 UVT + Prepagada">
            👨‍👩‍👧‍👦 Plan Familiar
          </button>
          <button className="btn btn-outline btn-sm" onClick={applyPresetFacturas} title="Simular 1% en compras con factura electrónica">
            🧾 Facturas (1%)
          </button>
          <button className="btn btn-outline btn-sm" onClick={applyPresetIntegral} style={{ borderColor: '#d97706', color: '#b45309', fontWeight: 700 }} title="Maximizar todas las deducciones permitidas por ley">
            ✨ Optimización Total
          </button>
          <button className="btn btn-outline btn-sm" onClick={resetToBaseline} title="Restablecer a los valores actuales del borrador">
            🔄 Restablecer
          </button>
        </div>

        <div className="presets-toolbar-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {onNavigateToCalc && (
            <button className="btn btn-secondary btn-sm" onClick={onNavigateToCalc}>
              ← Volver a Cédula General
            </button>
          )}
          {onNavigateToF210 && (
            <button className="btn btn-outline btn-sm" onClick={onNavigateToF210}>
              📋 Ver Formulario 210
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={handleApply} title="Guardar estos valores en el liquidador oficial">
            ✨ Aplicar Plan al F-210
          </button>
        </div>
      </div>

      {/* HERO SCOREBOARD / KPI CARDS */}
      <div className="card" style={{ marginBottom: '20px', border: '1.5px solid #f59e0b', overflow: 'hidden' }}>
        <div className="card-header" style={{ background: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)', color: 'white', padding: '16px 20px' }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
              💡 Planeación Tributaria &amp; Optimización What-If (Año Gravable {taxYear})
            </div>
            <h2 className="card-title" style={{ color: 'white', fontSize: '20px', margin: '0 0 4px 0' }}>
              Laboratorio de Ahorro en Impuesto de Renta (Formulario 210)
            </h2>
            <span style={{ fontSize: '12.5px', color: '#fef3c7' }}>
              Simula escenarios con AFC, Medicina Prepagada, Dependientes y Facturas Electrónicas con cálculo matemático 100% exacto en tiempo real.
            </span>
          </div>
        </div>

        <div className="card-body" style={{ padding: '20px' }}>
          {/* GRID DE IMPACTO / COMPARATIVA ANTES VS DESPUÉS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            {/* AHORRO NETO */}
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: ahorroNetoEstimado > 0 ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : '#f8fafc',
                border: ahorroNetoEstimado > 0 ? '2px solid #10b981' : '1.5px solid #cbd5e1',
                boxShadow: ahorroNetoEstimado > 0 ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, color: ahorroNetoEstimado > 0 ? '#065f46' : '#64748b', textTransform: 'uppercase' }}>
                🎉 Ahorro Neto en Impuesto
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: ahorroNetoEstimado > 0 ? '#047857' : '#334155', margin: '4px 0' }}>
                {ahorroNetoEstimado > 0 ? `+${formatCOP(ahorroNetoEstimado)} COP` : '$0 COP'}
              </div>
              <div style={{ fontSize: '11.5px', color: ahorroNetoEstimado > 0 ? '#059669' : '#64748b' }}>
                {ahorroNetoEstimado > 0
                  ? `Disminuye tu impuesto a cargo en un ${baseImpuestoCargo > 0 ? ((ahorroNetoEstimado / baseImpuestoCargo) * 100).toFixed(1) : 0}%.`
                  : 'Modifica las palancas abajo para descubrir tu ahorro legal.'}
              </div>
            </div>

            {/* IMPUESTO ACTUAL VS PROYECTADO */}
            <div style={{ padding: '16px', borderRadius: '12px', background: '#eff6ff', border: '1.5px solid #bfdbfe' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>
                Impuesto a Cargo Proyectado
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#1d4ed8', margin: '4px 0' }}>
                {formatCOP(simImpuestoCargo)}
              </div>
              <div style={{ fontSize: '11.5px', color: '#3b82f6' }}>
                Línea Base Actual: <strong>{formatCOP(baseImpuestoCargo)}</strong>
              </div>
            </div>

            {/* BASE GRAVABLE DEPURADA */}
            <div style={{ padding: '16px', borderRadius: '12px', background: '#f5f3ff', border: '1.5px solid #ddd6fe' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase' }}>
                Renta Líquida Gravable
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#7c3aed', margin: '4px 0' }}>
                {formatCOP(simRentaGravable)}
              </div>
              <div style={{ fontSize: '11.5px', color: '#8b5cf6' }}>
                Reducción de Base: <strong>-{formatCOP(reduccionBaseGravable)}</strong>
              </div>
            </div>

            {/* SALDO A PAGAR / A FAVOR */}
            <div style={{ padding: '16px', borderRadius: '12px', background: '#fffbeb', border: '1.5px solid #fde68a' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>
                Saldo Final Estimado
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: simSaldoPagar > 0 ? '#b45309' : '#059669', margin: '4px 0' }}>
                {simSaldoPagar > 0 ? `${formatCOP(simSaldoPagar)} (Pagar)` : `${formatCOP(simResult?.saldo_a_favor || 0)} (A Favor)`}
              </div>
              <div style={{ fontSize: '11.5px', color: '#d97706' }}>
                Antes: {baseSaldoPagar > 0 ? `${formatCOP(baseSaldoPagar)} (Pagar)` : `${formatCOP(result?.saldo_a_favor || 0)} (A Favor)`}
              </div>
            </div>
          </div>

          {/* DIAGNÓSTICO DEL LÍMITE DEL 40% (ART. 336 E.T.) */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: isCapReached ? '#fffbeb' : '#f0fdf4',
              border: isCapReached ? '1.5px solid #f59e0b' : '1.5px solid #86efac',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{isCapReached ? '⚠️' : '📊'}</span>
                <span style={{ fontWeight: 800, fontSize: '13.5px', color: isCapReached ? '#92400e' : '#166534' }}>
                  Control del Límite Conjunto del 40% (Art. 336 E.T. &amp; Tope 1.340 UVT: {formatCOP(limiteConjuntoCop)})
                </span>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: isCapReached ? '#b45309' : '#15803d' }}>
                {porcentajeUso40}% Utilizado ({formatCOP(totalAliviosAceptados40)} de {formatCOP(limiteConjuntoCop)})
              </div>
            </div>

            {/* BARRA DE PROGRESO */}
            <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden', marginBottom: '10px' }}>
              <div
                style={{
                  width: `${porcentajeUso40}%`,
                  height: '100%',
                  background: isCapReached ? 'linear-gradient(90deg, #f59e0b 0%, #dc2626 100%)' : 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                  borderRadius: '6px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            {/* EXPLICACIÓN DIDÁCTICA DEL TOPE */}
            <div style={{ fontSize: '12px', color: isCapReached ? '#78350f' : '#14532d', lineHeight: 1.5 }}>
              {isCapReached ? (
                <>
                  <strong>Límite del 40% copado:</strong> Has alcanzado el tope máximo de deducciones y rentas exentas generales permitidas por ley ({formatCOP(limiteConjuntoCop)}).
                  Nuevos aportes a Medicina Prepagada o AFC <strong>no reducirán más tu impuesto</strong> a menos que reduzcas otras deducciones.
                  <span style={{ display: 'block', marginTop: '4px', fontWeight: 700, color: '#b45309' }}>
                    💡 Para seguir ahorrando, utiliza las palancas del <strong>Grupo B (Dependientes de 72 UVT y Factura Electrónica del 1%)</strong>, las cuales por Ley 2277 <u>NO están sujetas al límite del 40%</u>.
                  </span>
                </>
              ) : (
                <>
                  <strong>Cupo disponible:</strong> Aún cuentas con <strong>{formatCOP(cupoLibre40)}</strong> de cupo legal para deducir Medicina Prepagada, Aportes AFC o Intereses de Vivienda antes de llegar al tope del 40%.
                </>
              )}
            </div>
          </div>

          {/* PALANCAS DE OPTIMIZACIÓN DIVIDIDAS DIDÁCTICAMENTE */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {/* GRUPO A: PALANCAS DENTRO DEL 40% */}
            <div className="card" style={{ border: '1.5px solid #cbd5e1', boxShadow: 'none' }}>
              <div className="card-header" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🏦</span>
                  <div>
                    <h3 className="card-title" style={{ fontSize: '13.5px', margin: 0 }}>
                      Grupo A: Sujetas al Límite del 40% (Art. 336 E.T.)
                    </h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Medicina Prepagada, AFC, Intereses y Dependiente Tradicional
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* MEDICINA PREPAGADA */}
                <div className="input-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="input-label" style={{ margin: 0 }}>
                      <span>🩺 Medicina Prepagada Anual (Art. 387 E.T.)</span>
                    </label>
                    <span style={{ fontSize: '10.5px', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      Tope: 192 UVT ({formatCOP(192 * uvtValue)})
                    </span>
                  </div>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      className="currency-input"
                      value={formatCOP(simPrepagada, false)}
                      onChange={(e) => setSimPrepagada(parseCOP(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: '10.5px', padding: '2px 6px' }} onClick={() => setSimPrepagada((prev) => prev + 2000000)}>
                      +$2M
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: '10.5px', padding: '2px 6px' }} onClick={() => setSimPrepagada((prev) => prev + 5000000)}>
                      +$5M
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: '10.5px', padding: '2px 6px' }} onClick={() => setSimPrepagada(192 * uvtValue)}>
                      Tope Máx (192 UVT)
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: '10.5px', padding: '2px 6px' }} onClick={() => setSimPrepagada(0)}>
                      $0
                    </button>
                  </div>
                  <span className="input-helper">Deducción de planes complementarios y medicina prepagada hasta 16 UVT/mes.</span>
                </div>

                {/* APORTES AFC / FPV */}
                <div className="input-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="input-label" style={{ margin: 0 }}>
                      <span>🏦 Aportes Pensión Voluntaria / AFC (Arts. 126-1/126-4)</span>
                    </label>
                    <span style={{ fontSize: '10.5px', background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      Tope: 3.800 UVT ({formatCOP(3800 * uvtValue)})
                    </span>
                  </div>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      className="currency-input"
                      value={formatCOP(simAfcFpv, false)}
                      onChange={(e) => setSimAfcFpv(parseCOP(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: '10.5px', padding: '2px 6px' }} onClick={() => setSimAfcFpv((prev) => prev + 5000000)}>
                      +$5M
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: '10.5px', padding: '2px 6px' }} onClick={() => setSimAfcFpv((prev) => prev + 10000000)}>
                      +$10M
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: '10.5px', padding: '2px 6px' }} onClick={() => setSimAfcFpv(Math.min(3800 * uvtValue, Math.round((inputs.rentas_trabajo || 0) * 0.3)))}>
                      Tope 30% Laboral
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: '10.5px', padding: '2px 6px' }} onClick={() => setSimAfcFpv(0)}>
                      $0
                    </button>
                  </div>
                  <span className="input-helper">Renta exenta hasta el 30% del ingreso laboral o 3.800 UVT.</span>
                </div>

                {/* INTERESES DE VIVIENDA */}
                <div className="input-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="input-label" style={{ margin: 0 }}>
                      <span>🏡 Intereses Crédito Vivienda / Leasing (Art. 119 E.T.)</span>
                    </label>
                    <span style={{ fontSize: '10.5px', background: '#ecfdf5', color: '#065f46', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      Tope: 1.200 UVT ({formatCOP(1200 * uvtValue)})
                    </span>
                  </div>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      className="currency-input"
                      value={formatCOP(simInteresesVivienda, false)}
                      onChange={(e) => setSimInteresesVivienda(parseCOP(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <span className="input-helper">Deducción de intereses pagados por adquisición de vivienda habitual hasta 100 UVT/mes.</span>
                </div>

                {/* DEPENDIENTE GENERAL 10% */}
                <div className="form-group-checkbox" style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', fontWeight: 600, margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={simDependienteGeneral}
                      onChange={(e) => setSimDependienteGeneral(e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>Deducción General por Dependiente (10% Ingreso Laboral - Tope 384 UVT: {formatCOP(384 * uvtValue)})</span>
                  </label>
                </div>
              </div>
            </div>

            {/* GRUPO B: SUPER-DEDUCCIONES FUERA DEL 40% */}
            <div className="card" style={{ border: '1.5px solid #10b981', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: 'white', padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🚀</span>
                  <div>
                    <h3 className="card-title" style={{ fontSize: '13.5px', color: 'white', margin: 0 }}>
                      Grupo B: Super-Deducciones 100% EXENTAS del 40% (Ley 2277)
                    </h3>
                    <span style={{ fontSize: '11px', color: '#d1fae5' }}>
                      ¡Deducción pura garantizada incluso si tu límite del 40% está lleno!
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* DEPENDIENTES ADICIONALES (72 UVT C/U) */}
                <div className="input-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="input-label" style={{ margin: 0 }}>
                      <span>👨‍👩‍👦 Dependientes Adicionales (72 UVT c/u - Art. 336 num. 2)</span>
                    </label>
                    <span style={{ fontSize: '10.5px', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                      ¡Fuera del 40%!
                    </span>
                  </div>
                  <select
                    className="select-input"
                    value={simDependientesAdic}
                    onChange={(e) => setSimDependientesAdic(parseInt(e.target.value, 10))}
                    style={{ width: '100%', padding: '9px 12px', fontWeight: 600 }}
                  >
                    <option value="0">0 dependientes adicionales ($0 COP)</option>
                    <option value="1">1 dependiente (+{formatCOP(72 * uvtValue)} de deducción pura)</option>
                    <option value="2">2 dependientes (+{formatCOP(144 * uvtValue)} de deducción pura)</option>
                    <option value="3">3 dependientes (+{formatCOP(216 * uvtValue)} de deducción pura)</option>
                    <option value="4">4 dependientes (+{formatCOP(288 * uvtValue)} de deducción pura) [Máximo Legal]</option>
                  </select>
                  <span className="input-helper">
                    Hijos menores, cónyuge, padres o hermanos dependientes. Hasta 4 dependientes sin afectar el límite del 40%.
                  </span>
                </div>

                {/* FACTURAS ELECTRÓNICAS (1%) */}
                <div className="input-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="input-label" style={{ margin: 0 }}>
                      <span>🧾 Compras con Factura Electrónica (1% Deducible - Art. 336 num. 5)</span>
                    </label>
                    <span style={{ fontSize: '10.5px', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                      ¡Fuera del 40%!
                    </span>
                  </div>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      className="currency-input"
                      value={formatCOP(simFacturas, false)}
                      onChange={(e) => setSimFacturas(parseCOP(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div style={{ marginTop: '4px', fontSize: '11.5px', color: '#047857', fontWeight: 700 }}>
                    → Deducción generada (1%): {formatCOP(Math.min(240 * uvtValue, Math.round(simFacturas * 0.01)))}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: '10.5px', padding: '2px 6px' }} onClick={() => setSimFacturas((prev) => prev + 10000000)}>
                      +$10M compras
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: '10.5px', padding: '2px 6px' }} onClick={() => setSimFacturas((prev) => prev + 30000000)}>
                      +$30M compras
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: '10.5px', padding: '2px 6px' }} onClick={() => setSimFacturas(240 * uvtValue * 100)}>
                      Tope Máx (240 UVT deducible)
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: '10.5px', padding: '2px 6px' }} onClick={() => setSimFacturas(0)}>
                      $0
                    </button>
                  </div>
                  <span className="input-helper">
                    Compras soportadas con factura electrónica y medios de pago bancarizados. Tope de deducción: 240 UVT ({formatCOP(240 * uvtValue)}).
                  </span>
                </div>

                {/* BANNER INFORMATIVO */}
                <div style={{ padding: '10px 12px', background: '#f0fdf4', borderRadius: '8px', border: '1px dashed #22c55e', fontSize: '11.5px', color: '#14532d' }}>
                  ✨ <strong>Tip Estratégico:</strong> Si tu salario supera los 10 millones mensuales, las deducciones del Grupo B son el mecanismo legal más potente para reducir tu impuesto neto a pagar.
                </div>
              </div>
            </div>
          </div>

          {/* TABLA COMPARATIVA ANTES VS DESPUÉS */}
          <div className="table-responsive" style={{ marginBottom: '20px' }}>
            <table className="table" style={{ width: '100%', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th>Concepto Tributario (Formulario 210)</th>
                  <th style={{ textAlign: 'right' }}>Línea Base Actual</th>
                  <th style={{ textAlign: 'right' }}>Escenario Optimizado</th>
                  <th style={{ textAlign: 'right' }}>Diferencia / Ahorro</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Total Ingresos Brutos</strong></td>
                  <td style={{ textAlign: 'right' }}>{formatCOP(result?.total_ingresos_brutos || 0)}</td>
                  <td style={{ textAlign: 'right' }}>{formatCOP(simResult?.total_ingresos_brutos || 0)}</td>
                  <td style={{ textAlign: 'right', color: '#64748b' }}>$0</td>
                </tr>
                <tr>
                  <td><strong>Total Deducciones Solicitadas</strong></td>
                  <td style={{ textAlign: 'right' }}>{formatCOP(result?.total_deducciones_solicitadas || 0)}</td>
                  <td style={{ textAlign: 'right', color: '#2563eb', fontWeight: 700 }}>{formatCOP(simResult?.total_deducciones_solicitadas || 0)}</td>
                  <td style={{ textAlign: 'right', color: '#2563eb' }}>
                    +{(formatCOP((simResult?.total_deducciones_solicitadas || 0) - (result?.total_deducciones_solicitadas || 0)))}
                  </td>
                </tr>
                <tr>
                  <td><strong>Alivios Aceptados (Tope 40% Art. 336)</strong></td>
                  <td style={{ textAlign: 'right' }}>{formatCOP(result?.alivios_procedentes_finales || 0)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCOP(simResult?.alivios_procedentes_finales || 0)}</td>
                  <td style={{ textAlign: 'right' }}>
                    +{(formatCOP((simResult?.alivios_procedentes_finales || 0) - (result?.alivios_procedentes_finales || 0)))}
                  </td>
                </tr>
                <tr>
                  <td><strong>Renta Líquida Gravable (Casilla 92)</strong></td>
                  <td style={{ textAlign: 'right' }}>{formatCOP(baseRentaGravable)}</td>
                  <td style={{ textAlign: 'right', color: '#7c3aed', fontWeight: 800 }}>{formatCOP(simRentaGravable)}</td>
                  <td style={{ textAlign: 'right', color: '#7c3aed', fontWeight: 800 }}>
                    -{formatCOP(reduccionBaseGravable)}
                  </td>
                </tr>
                <tr style={{ background: '#ecfdf5' }}>
                  <td><strong>Impuesto a Cargo (Casilla 117 / 121)</strong></td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCOP(baseImpuestoCargo)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 900, color: '#047857' }}>{formatCOP(simImpuestoCargo)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 900, color: '#047857' }}>
                    {ahorroNetoEstimado > 0 ? `-${formatCOP(ahorroNetoEstimado)}` : '$0'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ACTION BUTTONS FOOTER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {isCalculating ? '⏳ Calculando escenario...' : '✓ Cálculos verificados contra Tabla Art. 241 E.T.'}
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn btn-outline" onClick={resetToBaseline}>
                🔄 Restablecer a Valores Iniciales
              </button>
              <button className="btn btn-primary" onClick={handleApply} style={{ boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}>
                ✨ Aplicar estas Deducciones al Liquidador F-210
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

