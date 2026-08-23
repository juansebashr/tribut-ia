import React, { useState, useEffect } from 'react';
import { formatCOP, parseCOP } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import {
  fetchTablaComponenteInflacionario,
  simularComponenteInflacionario,
} from '../../services/api';
import type {
  ItemTablaComponenteInflacionario,
  SimulacionComponenteInflacionarioResponse,
} from '../../types/tax';

export const ComponenteInflacionarioModule: React.FC = () => {
  const { showToast, taxYear, uvtValue, navigateTo } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'simulador' | 'tabla' | 'guia'>('simulador');

  // Tabla histórica de decretos
  const [tableData, setTableData] = useState<ItemTablaComponenteInflacionario[]>([]);
  const [searchTable, setSearchTable] = useState<string>('');

  // Estado del Simulador Individual
  const [selectedYear, setSelectedYear] = useState<number>(taxYear || 2025);
  const [tipoInstrumento, setTipoInstrumento] = useState<string>('nacional_financiero');
  const [montoBruto, setMontoBruto] = useState<number>(20000000);
  const [tarifaMarginal, setTarifaMarginal] = useState<number>(28);
  const [useCustomPct, setUseCustomPct] = useState<boolean>(false);
  const [customPct, setCustomPct] = useState<number>(55.43);
  const [simResult, setSimResult] = useState<SimulacionComponenteInflacionarioResponse | null>(null);

  // Carga de la tabla oficial al montar
  useEffect(() => {
    loadTableData();
  }, []);

  const loadTableData = async () => {
    try {
      const data = await fetchTablaComponenteInflacionario();
      setTableData(data);
    } catch (err) {
      console.warn('Error cargando tabla de componente inflacionario:', err);
    }
  };

  // Ejecutar simulación individual en cambios
  useEffect(() => {
    runIndividualSim();
  }, [selectedYear, tipoInstrumento, montoBruto, tarifaMarginal, useCustomPct, customPct]);

  const runIndividualSim = async () => {
    try {
      const res = await simularComponenteInflacionario({
        tax_year: selectedYear,
        tipo_instrumento: tipoInstrumento,
        monto_bruto_cop: montoBruto > 0 ? montoBruto : 1000000,
        porcentaje_personalizado_pct: useCustomPct ? customPct : null,
        tarifa_marginal_estimada_pct: tarifaMarginal,
      });
      setSimResult(res);
    } catch (err) {
      console.warn('Error simulando componente inflacionario en backend, usando fallback local:', err);
      const defaultPcts: Record<number, number> = {
        2026: 52.0,
        2025: 55.0,
        2024: 60.32,
        2023: 55.43,
        2022: 100.0,
        2021: 100.0,
        2020: 44.23,
        2019: 50.78,
        2018: 60.1,
      };
      const pct = useCustomPct && customPct != null ? customPct : defaultPcts[selectedYear] || 55.43;
      const bruto = montoBruto > 0 ? montoBruto : 1000000;
      const incrngo = Math.round(bruto * (pct / 100.0));
      const gravable = Math.max(0, bruto - incrngo);
      const ahorro = Math.round(incrngo * (tarifaMarginal / 100.0));
      setSimResult({
        tax_year: selectedYear,
        decreto_reglamentario: `Decreto Reglamentario Oficial (${selectedYear})`,
        tipo_instrumento: tipoInstrumento,
        tipo_instrumento_label: 'Rendimientos Financieros',
        monto_bruto_cop: bruto,
        porcentaje_inflacionario_aplicado: pct,
        es_porcentaje_personalizado: useCustomPct,
        monto_incrngo_no_gravado_cop: incrngo,
        monto_gravable_real_cop: gravable,
        monto_no_deducible_intereses_cop: incrngo,
        monto_deducible_intereses_reales_cop: gravable,
        tarifa_marginal_estimada_pct: tarifaMarginal,
        ahorro_estimado_impuesto_cop: ahorro,
        casilla_f210_asociada: 'Casilla 59 - Ingresos no constitutivos de renta',
        casilla_f210_numero: 59,
        fundamento_legal: 'Artículos 38, 40-1 y 41 del Estatuto Tributario Nacional',
        explicacion_didactica: `De los $${formatCOP(bruto)} COP percibidos, el ${pct.toFixed(2)}% ($${formatCOP(incrngo)} COP) constituye INCRNGO (Casilla 59 F-210) no sujeto a renta ni al tope del 40%.`,
        pasos_calculo: [
          `1. Rendimiento bruto percibido: $${formatCOP(bruto)} COP.`,
          `2. Porcentaje no gravado: ${pct.toFixed(2)}%.`,
          `3. INCRNGO (Casilla 59 F210): $${formatCOP(incrngo)} COP.`,
          `4. Rendimiento gravable real (Casilla 60 F210): $${formatCOP(gravable)} COP.`,
          `5. Ahorro estimado en impuesto: $${formatCOP(ahorro)} COP.`,
        ],
        combinabilidad_art73: {
          combinable_con_art73: true,
          acumulable_art70_con_art73_mismo_activo: false,
          explicacion_combinabilidad: 'SÍ se puede combinar con el Art. 73 E.T.',
        },
      });
    }
  };

  // Presets didácticos
  const loadPresetCdt2023 = () => {
    setSelectedYear(2023);
    setTipoInstrumento('nacional_financiero');
    setMontoBruto(15000000);
    setTarifaMarginal(28);
    setUseCustomPct(false);
    showToast('✓ Ejemplo CDT 2023 cargado: Decreto 1006/2024 (55,43% no gravado)', 'info', 2500);
  };

  const loadPresetFics2024 = () => {
    setSelectedYear(2024);
    setTipoInstrumento('fics_fondos_mutuos');
    setMontoBruto(35000000);
    setTarifaMarginal(33);
    setUseCustomPct(false);
    showToast('✓ Ejemplo FICs 2024 cargado: Decreto 0572/2025 (60,32% no gravado)', 'info', 2500);
  };

  const loadPresetGastosIntereses = () => {
    setSelectedYear(2023);
    setTipoInstrumento('gastos_intereses_costo');
    setMontoBruto(18000000);
    setTarifaMarginal(28);
    setUseCustomPct(false);
    showToast('✓ Ejemplo Gastos Intereses cargado: 55,43% no deducible según Art. 118 E.T.', 'info', 2500);
  };

  const filteredData = tableData.filter((i) => {
    const s = searchTable.toLowerCase().trim();
    if (!s) return true;
    return (
      String(i.ano_gravable).includes(s) ||
      i.decreto_reglamentario.toLowerCase().includes(s)
    );
  });

  return (
    <div id="pane-inflacionario" className="module-pane active" style={{ paddingBottom: '30px' }}>
      {/* HEADER HERO */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '26px' }}>📊</span>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Ajuste por Valor Inflacionario &amp; Componente Inflacionario de Rendimientos
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Estatuto Tributario Nacional — Artículos 38, 39, 40-1, 41, 70, 81-1 y 118
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: '#0284c7', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px' }}>
              INCRNGO Casilla 59 F-210
            </span>
            <span className="badge" style={{ background: '#059669', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px' }}>
              Compatible con Art. 73
            </span>
          </div>
        </div>
        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '8px', marginBottom: 0, lineHeight: 1.5 }}>
          Las personas naturales no obligadas a llevar contabilidad tienen derecho a restar como <strong>Ingreso No Constitutivo de Renta ni Ganancia Ocasional (INCRNGO)</strong> la porción de los rendimientos financieros que compensa la inflación del año. Este beneficio <strong>no consume el límite conjunto del 40% / 1.340 UVT</strong> y se puede combinar legítimamente con el reajuste fiscal del Art. 73.
        </p>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          className={`btn btn-sm ${activeSubTab === 'simulador' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('simulador')}
          style={{ fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>🧮</span> Simulador Componente Inflacionario
        </button>
        <button
          className={`btn btn-sm ${activeSubTab === 'tabla' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('tabla')}
          style={{ fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>📜</span> Tabla Histórica de Decretos (2018-2026)
        </button>
        <button
          className={`btn btn-sm ${activeSubTab === 'guia' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('guia')}
          style={{ fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>📖</span> Fundamentos Legales &amp; Normativa
        </button>
      </div>

      {/* TAB 1: SIMULADOR INDIVIDUAL */}
      {activeSubTab === 'simulador' && (
        <div>
          {/* BARRA DE PRESETS EJEMPLOS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '18px', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              ⚡ Cargar Ejemplos Oficiales:
            </span>
            <button className="btn btn-outline btn-xs" onClick={loadPresetCdt2023} style={{ fontSize: '11.5px', borderRadius: '4px' }}>
              🏦 CDT Banco 2023 ($15M - D.1006)
            </button>
            <button className="btn btn-outline btn-xs" onClick={loadPresetFics2024} style={{ fontSize: '11.5px', borderRadius: '4px' }}>
              📈 FICs / Fondos 2024 ($35M - D.0572)
            </button>
            <button className="btn btn-outline btn-xs" onClick={loadPresetGastosIntereses} style={{ fontSize: '11.5px', borderRadius: '4px' }}>
              💳 Intereses Pagados (Art. 118 E.T.)
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* PANEL DE PARÁMETROS */}
            <div className="card" style={{ padding: '18px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚙️</span> Parámetros de la Liquidación
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* AÑO GRAVABLE */}
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Año Gravable de la Declaración:
                  </label>
                  <select
                    className="select-input"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    style={{ width: '100%', fontSize: '12.5px', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
                  >
                    <option value={2026}>2026 (Proyección Oficial ~52,00%)</option>
                    <option value={2025}>2025 (Estimado MinHacienda ~55,00%)</option>
                    <option value={2024}>2024 (Decreto 0572 de 2025 - 60,32%)</option>
                    <option value={2023}>2023 (Decreto 1006 de 2024 - 55,43%)</option>
                    <option value={2022}>2022 (Decreto 203 de 2023 - 100,00%)</option>
                    <option value={2021}>2021 (Decreto 1846 de 2021 - 100,00%)</option>
                    <option value={2020}>2020 (Decreto 453 de 2021 - 44,23%)</option>
                    <option value={2019}>2019 (Decreto 849 de 2020 - 50,78%)</option>
                    <option value={2018}>2018 (Decreto 703 de 2019 - 60,10%)</option>
                  </select>
                </div>

                {/* TIPO DE INSTRUMENTO */}
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Tipo de Ingreso Financiero o Gasto:
                  </label>
                  <select
                    className="select-input"
                    value={tipoInstrumento}
                    onChange={(e) => setTipoInstrumento(e.target.value)}
                    style={{ width: '100%', fontSize: '12.5px', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
                  >
                    <option value="nacional_financiero">🏦 Cuentas de Ahorro, CDTs y Pagarés (Bancos vigilados SFC)</option>
                    <option value="fics_fondos_mutuos">📈 Fondos de Inversión Colectiva (FICs) y Fondos Mutuos (Art. 39 E.T.)</option>
                    <option value="moneda_extranjera">💵 Rendimientos en Moneda Extranjera / Diferencia en Cambio</option>
                    <option value="gastos_intereses_costo">💳 Intereses y Gastos Financieros Pagados (Art. 81-1 y 118 E.T.)</option>
                  </select>
                </div>

                {/* MONTO BRUTO EN COP */}
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    {tipoInstrumento === 'gastos_intereses_costo'
                      ? 'Total de Intereses y Gastos Financieros Pagados ($ COP):'
                      : 'Rendimientos Financieros Brutos Percibidos ($ COP):'}
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formatCOP(montoBruto)}
                    onChange={(e) => setMontoBruto(parseCOP(e.target.value))}
                    style={{ width: '100%', fontSize: '13px', padding: '8px', fontWeight: 700, borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Equivalente a ≈ {Math.round(montoBruto / (uvtValue || 52350)).toLocaleString()} UVT
                  </span>
                </div>

                {/* TARIFA MARGINAL ESTIMADA */}
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Tarifa Marginal de Renta Estimada (Art. 241 E.T.):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                    {[19, 28, 33, 35, 39].map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`btn btn-xs ${tarifaMarginal === t ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setTarifaMarginal(t)}
                        style={{ fontSize: '11.5px', fontWeight: 700, padding: '5px' }}
                      >
                        {t}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* TOGGLE PERSONALIZADO */}
                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    <input
                      type="checkbox"
                      checked={useCustomPct}
                      onChange={(e) => setUseCustomPct(e.target.checked)}
                    />
                    <span>Ingresar porcentaje inflacionario personalizado (%)</span>
                  </label>
                  {useCustomPct && (
                    <div style={{ marginTop: '8px' }}>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className="input-field"
                        value={customPct}
                        onChange={(e) => setCustomPct(parseFloat(e.target.value) || 0)}
                        style={{ width: '100%', fontSize: '12.5px', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                        placeholder="Ej. 55.43"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PANEL DE RESULTADOS EN VIVO */}
            <div className="card" style={{ padding: '18px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎯</span> Liquidación &amp; Ahorro Tributario
                </span>
                <span className="badge" style={{ background: '#0284c7', color: '#fff', fontSize: '11px' }}>
                  {simResult ? `${simResult.porcentaje_inflacionario_aplicado.toFixed(2)}% No Gravado` : 'Calculando...'}
                </span>
              </h3>

              {simResult && (
                <>
                  {/* KPI CARDS */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                    {tipoInstrumento !== 'gastos_intereses_costo' ? (
                      <>
                        <div style={{ padding: '12px', background: 'rgba(2, 132, 199, 0.08)', borderRadius: '8px', border: '1px solid rgba(2, 132, 199, 0.25)' }}>
                          <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 700, display: 'block' }}>
                            INCRNGO NO GRAVADO (Casilla 59)
                          </span>
                          <strong style={{ fontSize: '16px', color: '#0284c7', display: 'block', marginTop: '4px' }}>
                            ${formatCOP(simResult.monto_incrngo_no_gravado_cop)}
                          </strong>
                          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                            {simResult.porcentaje_inflacionario_aplicado.toFixed(2)}% del valor bruto
                          </span>
                        </div>

                        <div style={{ padding: '12px', background: 'rgba(234, 88, 12, 0.08)', borderRadius: '8px', border: '1px solid rgba(234, 88, 12, 0.25)' }}>
                          <span style={{ fontSize: '11px', color: '#ea580c', fontWeight: 700, display: 'block' }}>
                            BASE GRAVABLE REAL (Casilla 60)
                          </span>
                          <strong style={{ fontSize: '16px', color: '#ea580c', display: 'block', marginTop: '4px' }}>
                            ${formatCOP(simResult.monto_gravable_real_cop)}
                          </strong>
                          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                            Rendimiento real sujeto a renta
                          </span>
                        </div>

                        <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                          <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700, display: 'block' }}>
                            AHORRO ESTIMADO EN IMPUESTO
                          </span>
                          <strong style={{ fontSize: '16px', color: '#059669', display: 'block', marginTop: '4px' }}>
                            ${formatCOP(simResult.ahorro_estimado_impuesto_cop)}
                          </strong>
                          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                            A tarifa marginal del {simResult.tarifa_marginal_estimada_pct}%
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                          <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700, display: 'block' }}>
                            INTERESES NO DEDUCIBLES
                          </span>
                          <strong style={{ fontSize: '16px', color: '#dc2626', display: 'block', marginTop: '4px' }}>
                            ${formatCOP(simResult.monto_no_deducible_intereses_cop || 0)}
                          </strong>
                          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                            {simResult.porcentaje_inflacionario_aplicado.toFixed(2)}% (Art. 118 E.T.)
                          </span>
                        </div>

                        <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                          <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700, display: 'block' }}>
                            DEDUCCIÓN REAL PROCEDENTE
                          </span>
                          <strong style={{ fontSize: '16px', color: '#059669', display: 'block', marginTop: '4px' }}>
                            ${formatCOP(simResult.monto_deducible_intereses_reales_cop || 0)}
                          </strong>
                          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                            Casilla 61 (Costos y deducciones)
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* VISTA PREVIA FORMULARIO 210 */}
                  <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                      📋 Mapeo Oficial al Formulario 210 (Cédula General - Rentas de Capital):
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '11.5px' }}>
                      <div style={{ padding: '6px 8px', background: 'var(--card-bg)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block' }}>Casilla 58 (Bruto):</span>
                        <strong>${formatCOP(simResult.monto_bruto_cop)}</strong>
                      </div>
                      <div style={{ padding: '6px 8px', background: 'rgba(2, 132, 199, 0.1)', borderRadius: '6px', border: '1px solid #0284c7' }}>
                        <span style={{ color: '#0284c7', display: 'block', fontWeight: 600 }}>Casilla 59 (INCRNGO):</span>
                        <strong style={{ color: '#0284c7' }}>${formatCOP(simResult.monto_incrngo_no_gravado_cop)}</strong>
                      </div>
                      <div style={{ padding: '6px 8px', background: 'var(--card-bg)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block' }}>Casilla 60 (Neto):</span>
                        <strong>${formatCOP(simResult.monto_gravable_real_cop)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* PASOS DE CÁLCULO */}
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                      Desglose y Explicación del Decreto Aplicable ({simResult.decreto_reglamentario}):
                    </span>
                    <ul style={{ margin: 0, paddingLeft: '18px' }}>
                      {simResult.pasos_calculo.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {/* BOTÓN DE ACCIÓN */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        showToast(`✓ INCRNGO de $${formatCOP(simResult.monto_incrngo_no_gravado_cop)} listo para transferir a Casilla 59 F-210`, 'success', 3000);
                        navigateTo('pn', 'calc');
                      }}
                      style={{ fontSize: '12px', flex: 1, borderColor: '#0284c7', color: '#0284c7' }}
                    >
                      <span>📥</span> Aplicar este INCRNGO al Formulario 210
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => navigateTo('art73', 'main')}
                      style={{ fontSize: '12px', borderColor: '#059669', color: '#059669' }}
                    >
                      <span>🏢</span> Ver Reajuste Art. 73 ➡️
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TABLA HISTÓRICA */}
      {activeSubTab === 'tabla' && (
        <div className="card" style={{ padding: '18px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📜</span> Decretos Reglamentarios Oficiales del Componente Inflacionario (MinHacienda)
            </h3>
            <input
              type="text"
              className="input-field"
              placeholder="🔍 Buscar año o decreto..."
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
              style={{ fontSize: '12px', padding: '6px 10px', width: '220px', borderRadius: '6px' }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '10px 8px', fontWeight: 700 }}>Año Gravable</th>
                  <th style={{ padding: '10px 8px', fontWeight: 700 }}>Decreto Reglamentario</th>
                  <th style={{ padding: '10px 8px', fontWeight: 700, textAlign: 'right' }}>% No Gravado (Rend. Nal)</th>
                  <th style={{ padding: '10px 8px', fontWeight: 700, textAlign: 'right' }}>% No Gravado (FICs)</th>
                  <th style={{ padding: '10px 8px', fontWeight: 700, textAlign: 'right' }}>% No Deducible Gastos</th>
                  <th style={{ padding: '10px 8px', fontWeight: 700, textAlign: 'right' }}>Inflación DANE</th>
                  <th style={{ padding: '10px 8px', fontWeight: 700, textAlign: 'right' }}>Reajuste Art. 70</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row) => (
                  <tr
                    key={row.ano_gravable}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      background: selectedYear === row.ano_gravable ? 'rgba(2, 132, 199, 0.08)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '10px 8px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {row.ano_gravable} {row.es_proyectado && <span style={{ fontSize: '10px', color: '#0284c7' }}>(Est.)</span>}
                    </td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>
                      {row.decreto_reglamentario}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>
                      {row.porcentaje_rendimientos_nacionales.toFixed(2)}%
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: 'var(--text-primary)' }}>
                      {row.porcentaje_fics_fondos.toFixed(2)}%
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: '#dc2626' }}>
                      {row.porcentaje_no_deducible_gastos_interes.toFixed(2)}%
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                      {row.inflacion_dane_pct.toFixed(2)}%
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: '#059669', fontWeight: 600 }}>
                      {row.reajuste_fiscal_art70_pct.toFixed(2)}%
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <button
                        className="btn btn-outline btn-xs"
                        onClick={() => {
                          setSelectedYear(row.ano_gravable);
                          setActiveSubTab('simulador');
                          showToast(`✓ Año ${row.ano_gravable} seleccionado para simulación`, 'info', 2000);
                        }}
                        style={{ fontSize: '11px', padding: '3px 8px' }}
                      >
                        Simular
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GUÍA Y FUNDAMENTOS */}
      {activeSubTab === 'guia' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* TARJETA DE COMBINABILIDAD CLARA */}
          <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.1), rgba(16, 185, 129, 0.1))', borderRadius: '10px', border: '1px solid rgba(2, 132, 199, 0.25)' }}>
            <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚖️</span> ¿Se pueden combinar el Componente Inflacionario y el Reajuste Fiscal del Art. 73?
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 10px 0', lineHeight: 1.5 }}>
              <strong>SÍ, SON 100% COMPATIBLES EN LA MISMA DECLARACIÓN DE RENTA.</strong> Operan sobre cédulas independientes:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', fontSize: '12px' }}>
              <div style={{ padding: '10px', background: 'var(--card-bg)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: '#0284c7' }}>1. Componente Inflacionario (Art. 38 E.T.)</strong>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
                  Aplica sobre <em>Rentas de Capital (Cédula General)</em> para depurar rendimientos de CDTs y cuentas bancarias restando el INCRNGO en la Casilla 59.
                </p>
              </div>
              <div style={{ padding: '10px', background: 'var(--card-bg)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: '#059669' }}>2. Reajuste Fiscal (Art. 73 E.T.)</strong>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
                  Aplica sobre el costo de <em>Activos Fijos (Bienes Raíces y Acciones)</em> en la sección de Ganancias Ocasionales o Patrimonio.
                </p>
              </div>
            </div>
            <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '11.5px', color: '#b91c1c' }}>
              ⚠️ <strong>Regla sobre el Art. 70:</strong> Para un <em>mismo activo fijo</em> no se puede acumular el reajuste del Art. 70 y el multiplicador del Art. 73 (inciso final del Art. 73 E.T.). Son métodos alternativos.
            </div>
          </div>

          <div className="card" style={{ padding: '18px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
              📚 Fundamentos del Estatuto Tributario sobre la Inflación
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '12.5px', color: '#0284c7', display: 'block', marginBottom: '4px' }}>
                  Art. 38, 40-1 y 41 E.T. — Componente Inflacionario
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  No constituye renta ni ganancia ocasional la parte que corresponda al componente inflacionario de los rendimientos financieros percibidos por personas naturales no obligadas a llevar contabilidad.
                </p>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '12.5px', color: '#dc2626', display: 'block', marginBottom: '4px' }}>
                  Art. 81-1 y 118 E.T. — Simetría en Gastos Financieros
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  No constituye costo ni deducción el componente inflacionario de los intereses y gastos financieros pagados por personas naturales no obligadas a llevar contabilidad.
                </p>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '12.5px', color: '#059669', display: 'block', marginBottom: '4px' }}>
                  Art. 73 E.T. — Reajuste Multiplicador de Activos
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Permite multiplicar el costo histórico de adquisición por los factores del DANE para determinar el costo fiscal en enajenación de inmuebles y acciones.
                </p>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '12.5px', color: '#d97706', display: 'block', marginBottom: '4px' }}>
                  Art. 70 E.T. — Reajuste Anual Ordinario
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Reajuste porcentual anual fijado por el Gobierno Nacional según el Art. 868. No es acumulable con la tabla del Art. 73 para el mismo activo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
