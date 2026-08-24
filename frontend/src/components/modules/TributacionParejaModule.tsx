import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type {
  TributacionParejaRequest,
  TributacionParejaResponse,
} from '../../types/tax';
import { simularTributacionPareja } from '../../services/api';
import { formatCOP, parseCOP } from '../../utils/formatters';

export const TributacionParejaModule: React.FC = () => {
  const { taxYear, uvtValue, showToast } = useApp();

  const [activeSection, setActiveSection] = useState<'simulador' | 'riesgos' | 'estrategias' | 'gananciales'>('simulador');

  const [inputs, setInputs] = useState<TributacionParejaRequest>({
    tax_year: taxYear,
    custom_uvt: uvtValue,
    conyuge_a: {
      nombre: 'Cónyuge A (Ingresos Altos)',
      ingresos_laborales_anuales: 140000000,
      aportes_seguridad_social_salud_pension: 11200000,
      tiene_dependiente_general_387: true,
      numero_dependientes_adicionales_72uvt: 1,
      otras_deducciones_y_exentas_cedula_general: 28000000,
    },
    conyuge_b: {
      nombre: 'Cónyuge B (Menores Ingresos / Independiente)',
      ingresos_laborales_anuales: 30000000,
      aportes_seguridad_social_salud_pension: 2400000,
      tiene_dependiente_general_387: false,
      numero_dependientes_adicionales_72uvt: 0,
      otras_deducciones_y_exentas_cedula_general: 6000000,
    },
    rentas_capital_conjuntas_arriendos_intereses: 60000000,
    costos_procedentes_rentas_capital: 6000000,
    intereses_credito_vivienda_conjunto_anual: 24000000,
    valor_activo_adquirido_en_el_ano: 350000000,
    esquema_adquisicion_activo: 'COPROPIEDAD_PROINDIVISO_50_50',
    distribucion_intereses_vivienda: '100_CONYUGE_A',
  });

  const [result, setResult] = useState<TributacionParejaResponse | null>(null);
  const [showAuditTrace, setShowAuditTrace] = useState<boolean>(false);

  // Sync year and UVT
  useEffect(() => {
    setInputs((prev) => ({ ...prev, tax_year: taxYear, custom_uvt: uvtValue }));
  }, [taxYear, uvtValue]);

  // Recalculate on inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      runSimulation();
    }, 120);
    return () => clearTimeout(timer);
  }, [inputs]);

  const runSimulation = async () => {
    try {
      const res = await simularTributacionPareja(inputs);
      setResult(res);
    } catch (err: any) {
      console.error('Error calculando tributación en pareja:', err);
    }
  };

  const updateConyugeA = (field: string, val: any) => {
    setInputs((prev) => ({
      ...prev,
      conyuge_a: { ...prev.conyuge_a, [field]: val },
    }));
  };

  const updateConyugeB = (field: string, val: any) => {
    setInputs((prev) => ({
      ...prev,
      conyuge_b: { ...prev.conyuge_b, [field]: val },
    }));
  };

  // Presets
  const loadPresetCopropiedad = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      conyuge_a: {
        nombre: 'Cónyuge A (Ingresos Altos)',
        ingresos_laborales_anuales: 160000000,
        aportes_seguridad_social_salud_pension: 12800000,
        tiene_dependiente_general_387: true,
        numero_dependientes_adicionales_72uvt: 1,
        otras_deducciones_y_exentas_cedula_general: 32000000,
      },
      conyuge_b: {
        nombre: 'Cónyuge B (Ingresos Moderados)',
        ingresos_laborales_anuales: 35000000,
        aportes_seguridad_social_salud_pension: 2800000,
        tiene_dependiente_general_387: false,
        numero_dependientes_adicionales_72uvt: 0,
        otras_deducciones_y_exentas_cedula_general: 7000000,
      },
      rentas_capital_conjuntas_arriendos_intereses: 70000000,
      costos_procedentes_rentas_capital: 7000000,
      intereses_credito_vivienda_conjunto_anual: 22000000,
      valor_activo_adquirido_en_el_ano: 400000000,
      esquema_adquisicion_activo: 'COPROPIEDAD_PROINDIVISO_50_50',
      distribucion_intereses_vivienda: '100_CONYUGE_A',
    });
    showToast('🟢 Caso 1 cargado: Distribución de rentas de capital en copropiedad 50/50', 'success', 2500);
  };

  const loadPresetAlertaDesajuste = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      conyuge_a: {
        nombre: 'Cónyuge A (Aportante de Fondos)',
        ingresos_laborales_anuales: 180000000,
        aportes_seguridad_social_salud_pension: 14400000,
        tiene_dependiente_general_387: true,
        numero_dependientes_adicionales_72uvt: 1,
        otras_deducciones_y_exentas_cedula_general: 36000000,
      },
      conyuge_b: {
        nombre: 'Cónyuge B (Sin Ingresos Suficientes)',
        ingresos_laborales_anuales: 15000000,
        aportes_seguridad_social_salud_pension: 1200000,
        tiene_dependiente_general_387: false,
        numero_dependientes_adicionales_72uvt: 0,
        otras_deducciones_y_exentas_cedula_general: 3000000,
      },
      rentas_capital_conjuntas_arriendos_intereses: 40000000,
      costos_procedentes_rentas_capital: 4000000,
      intereses_credito_vivienda_conjunto_anual: 18000000,
      valor_activo_adquirido_en_el_ano: 450000000,
      esquema_adquisicion_activo: 'TITULARIDAD_EXCLUSIVA_SIN_FONDOS',
      distribucion_intereses_vivienda: '50_50',
    });
    showToast('🔴 Caso 2 cargado: Alerta de comparación patrimonial y donación involuntaria', 'warning', 2500);
  };

  const loadPresetMutuo = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      conyuge_a: {
        nombre: 'Cónyuge A (Financiador / Prestamista)',
        ingresos_laborales_anuales: 200000000,
        aportes_seguridad_social_salud_pension: 16000000,
        tiene_dependiente_general_387: true,
        numero_dependientes_adicionales_72uvt: 2,
        otras_deducciones_y_exentas_cedula_general: 40000000,
      },
      conyuge_b: {
        nombre: 'Cónyuge B (Titular del Inmueble con Mutuo)',
        ingresos_laborales_anuales: 25000000,
        aportes_seguridad_social_salud_pension: 2000000,
        tiene_dependiente_general_387: false,
        numero_dependientes_adicionales_72uvt: 0,
        otras_deducciones_y_exentas_cedula_general: 5000000,
      },
      rentas_capital_conjuntas_arriendos_intereses: 50000000,
      costos_procedentes_rentas_capital: 5000000,
      intereses_credito_vivienda_conjunto_anual: 20000000,
      valor_activo_adquirido_en_el_ano: 320000000,
      esquema_adquisicion_activo: 'MUTUO_PRESTAMO_CON_FECHA_CIERTA',
      distribucion_intereses_vivienda: '100_CONYUGE_A',
    });
    showToast('🟡 Caso 3 cargado: Estructura de Mutuo y Préstamo con Fecha Cierta', 'info', 2500);
  };

  return (
    <div id="pane-tributacion-pareja" className="module-pane active" style={{ paddingBottom: '30px' }}>
      {/* HEADER NORMATIVO */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              👫 Tributación en Pareja &amp; Bienes Compartidos
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Planeación fiscal familiar, estructuración de activos en copropiedad, contratos de mutuo conyugal y optimización de tramos del Art. 241 E.T.
            </p>
          </div>

          <div className="tab-pill-group" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${activeSection === 'simulador' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveSection('simulador')}
            >
              📊 Simulador Conyugal
            </button>
            <button
              className={`btn btn-sm ${activeSection === 'riesgos' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveSection('riesgos')}
            >
              ⚠️ Riesgo: "Uno Pone la Plata"
            </button>
            <button
              className={`btn btn-sm ${activeSection === 'estrategias' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveSection('estrategias')}
            >
              💡 Estrategias de Optimización
            </button>
            <button
              className={`btn btn-sm ${activeSection === 'gananciales' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveSection('gananciales')}
            >
              🏛️ Gananciales &amp; Sucesiones
            </button>
          </div>
        </div>

        {/* ALERTA DEL ARTÍCULO 8 DEL ESTATUTO TRIBUTARIO */}
        <div
          style={{
            marginTop: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            fontSize: '12px',
            lineHeight: '1.55',
            color: 'var(--text-secondary)',
          }}
        >
          <strong style={{ color: '#7c3aed' }}>📌 La Regla de Oro (Art. 8 del Estatuto Tributario):</strong>
          <span style={{ marginLeft: '6px' }}>
            <em>«Los cónyuges e integrantes de unión marital de hecho, individualmente considerados, son sujetos gravables en cuanto a sus correspondientes bienes y rentas.»</em>
          </span>
          <p style={{ margin: '6px 0 0 0', fontSize: '11.5px' }}>
            En Colombia <strong>no existen declaraciones conjuntas de esposos</strong>. Cada cónyuge declara únicamente los ingresos que percibe a su nombre y los activos/pasivos que figuren bajo su titularidad jurídica. La sociedad conyugal civil no es persona jurídica ni sujeto pasivo del impuesto de renta mientras el matrimonio esté vigente.
          </p>
        </div>
      </div>

      {/* SECCIÓN 1: SIMULADOR INTERACTIVO */}
      {activeSection === 'simulador' && (
        <>
          {/* BOTONES DE PRESETS RÁPIDOS */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, alignSelf: 'center', color: 'var(--text-muted)' }}>
              Escenarios Didácticos:
            </span>
            <button className="btn btn-xs btn-outline" onClick={loadPresetCopropiedad}>
              🟢 Caso 1: Copropiedad 50/50 &amp; Aprovechamiento Tramo 0%
            </button>
            <button className="btn btn-xs btn-outline" onClick={loadPresetAlertaDesajuste}>
              🔴 Caso 2: Alerta Desajuste por Compra a Nombre de Pareja
            </button>
            <button className="btn btn-xs btn-outline" onClick={loadPresetMutuo}>
              🟡 Caso 3: Financiamiento con Contrato de Mutuo
            </button>
          </div>

          {/* GRID DE ENTRADAS: CÓNYUGE A, CÓNYUGE B Y ACTIVOS FAMILIARES */}
          <div className="responsive-grid-split" style={{ marginBottom: '20px' }}>
            {/* CÓNYUGE A */}
            <div className="card">
              <div className="card-header" style={{ background: 'var(--primary-light)' }}>
                <div className="card-title" style={{ fontSize: '13.5px', color: 'var(--primary)' }}>
                  👤 Datos Cónyuge A (Ingresos Principales)
                </div>
              </div>
              <div className="card-body">
                <div className="input-field" style={{ marginBottom: '10px' }}>
                  <label className="input-label">Ingresos Laborales / Honorarios Anuales</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.conyuge_a.ingresos_laborales_anuales, false)}
                      onChange={(e) => updateConyugeA('ingresos_laborales_anuales', parseCOP(e.target.value))}
                    />
                  </div>
                </div>

                <div className="input-field" style={{ marginBottom: '10px' }}>
                  <label className="input-label">Aportes Salud &amp; Pensión Obligatoria (INCRNGO)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.conyuge_a.aportes_seguridad_social_salud_pension, false)}
                      onChange={(e) => updateConyugeA('aportes_seguridad_social_salud_pension', parseCOP(e.target.value))}
                    />
                  </div>
                </div>

                <div className="inputs-row" style={{ marginBottom: '10px' }}>
                  <div className="input-field" style={{ flex: 1 }}>
                    <label className="input-label">Dependiente General (Art. 387)</label>
                    <select
                      className="text-input"
                      value={inputs.conyuge_a.tiene_dependiente_general_387 ? 'SI' : 'NO'}
                      onChange={(e) => updateConyugeA('tiene_dependiente_general_387', e.target.value === 'SI')}
                    >
                      <option value="SI">Sí (10% ingreso máx 384 UVT)</option>
                      <option value="NO">No aplica</option>
                    </select>
                  </div>
                  <div className="input-field" style={{ flex: 1 }}>
                    <label className="input-label">Dependientes 72 UVT (Ley 2277)</label>
                    <select
                      className="text-input"
                      value={inputs.conyuge_a.numero_dependientes_adicionales_72uvt}
                      onChange={(e) => updateConyugeA('numero_dependientes_adicionales_72uvt', parseInt(e.target.value) || 0)}
                    >
                      <option value="0">0 dependientes</option>
                      <option value="1">1 dependiente (72 UVT)</option>
                      <option value="2">2 dependientes (144 UVT)</option>
                      <option value="3">3 dependientes (216 UVT)</option>
                      <option value="4">4 dependientes (288 UVT)</option>
                    </select>
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Otras Rentas Exentas (25% laboral, AFC, FPV) y Deducciones</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.conyuge_a.otras_deducciones_y_exentas_cedula_general, false)}
                      onChange={(e) => updateConyugeA('otras_deducciones_y_exentas_cedula_general', parseCOP(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CÓNYUGE B */}
            <div className="card">
              <div className="card-header" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                <div className="card-title" style={{ fontSize: '13.5px', color: '#7c3aed' }}>
                  👤 Datos Cónyuge B (Menores Ingresos / Pareja)
                </div>
              </div>
              <div className="card-body">
                <div className="input-field" style={{ marginBottom: '10px' }}>
                  <label className="input-label">Ingresos Laborales / Honorarios Anuales</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.conyuge_b.ingresos_laborales_anuales, false)}
                      onChange={(e) => updateConyugeB('ingresos_laborales_anuales', parseCOP(e.target.value))}
                    />
                  </div>
                </div>

                <div className="input-field" style={{ marginBottom: '10px' }}>
                  <label className="input-label">Aportes Salud &amp; Pensión Obligatoria (INCRNGO)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.conyuge_b.aportes_seguridad_social_salud_pension, false)}
                      onChange={(e) => updateConyugeB('aportes_seguridad_social_salud_pension', parseCOP(e.target.value))}
                    />
                  </div>
                </div>

                <div className="inputs-row" style={{ marginBottom: '10px' }}>
                  <div className="input-field" style={{ flex: 1 }}>
                    <label className="input-label">Dependiente General (Art. 387)</label>
                    <select
                      className="text-input"
                      value={inputs.conyuge_b.tiene_dependiente_general_387 ? 'SI' : 'NO'}
                      onChange={(e) => updateConyugeB('tiene_dependiente_general_387', e.target.value === 'SI')}
                    >
                      <option value="SI">Sí (10% ingreso máx 384 UVT)</option>
                      <option value="NO">No aplica</option>
                    </select>
                  </div>
                  <div className="input-field" style={{ flex: 1 }}>
                    <label className="input-label">Dependientes 72 UVT (Ley 2277)</label>
                    <select
                      className="text-input"
                      value={inputs.conyuge_b.numero_dependientes_adicionales_72uvt}
                      onChange={(e) => updateConyugeB('numero_dependientes_adicionales_72uvt', parseInt(e.target.value) || 0)}
                    >
                      <option value="0">0 dependientes</option>
                      <option value="1">1 dependiente (72 UVT)</option>
                      <option value="2">2 dependientes (144 UVT)</option>
                      <option value="3">3 dependientes (216 UVT)</option>
                      <option value="4">4 dependientes (288 UVT)</option>
                    </select>
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Otras Rentas Exentas y Deducciones</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.conyuge_b.otras_deducciones_y_exentas_cedula_general, false)}
                      onChange={(e) => updateConyugeB('otras_deducciones_y_exentas_cedula_general', parseCOP(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CUADRANTE DE ACTIVOS, RENTAS DE CAPITAL Y ESTRUCTURACIÓN */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ background: 'var(--emerald-light)' }}>
              <div className="card-title" style={{ fontSize: '13.5px', color: 'var(--emerald)' }}>
                🏢 Activos Familiares, Rentas de Capital &amp; Crédito de Vivienda
              </div>
            </div>
            <div className="card-body">
              <div className="responsive-grid-split" style={{ gap: '16px', marginBottom: '14px' }}>
                <div>
                  <div className="input-field" style={{ marginBottom: '10px' }}>
                    <label className="input-label">Rentas de Capital Familiares (Arriendos, Rendimientos Financieros)</label>
                    <div className="input-wrapper">
                      <span className="input-prefix">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="currency-input"
                        value={formatCOP(inputs.rentas_capital_conjuntas_arriendos_intereses, false)}
                        onChange={(e) =>
                          setInputs((prev) => ({
                            ...prev,
                            rentas_capital_conjuntas_arriendos_intereses: parseCOP(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="input-field" style={{ marginBottom: '10px' }}>
                    <label className="input-label">Costos Procedentes de Rentas de Capital (Mantenimiento, Predial, Admin)</label>
                    <div className="input-wrapper">
                      <span className="input-prefix">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="currency-input"
                        value={formatCOP(inputs.costos_procedentes_rentas_capital, false)}
                        onChange={(e) =>
                          setInputs((prev) => ({
                            ...prev,
                            costos_procedentes_rentas_capital: parseCOP(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="input-field">
                    <label className="input-label">Intereses de Crédito Hipotecario / Leasing Vivienda Familiar (Art. 119)</label>
                    <div className="input-wrapper">
                      <span className="input-prefix">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="currency-input"
                        value={formatCOP(inputs.intereses_credito_vivienda_conjunto_anual, false)}
                        onChange={(e) =>
                          setInputs((prev) => ({
                            ...prev,
                            intereses_credito_vivienda_conjunto_anual: parseCOP(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="input-field" style={{ marginBottom: '10px' }}>
                    <label className="input-label">Distribución de Intereses de Vivienda</label>
                    <select
                      className="text-input"
                      value={inputs.distribucion_intereses_vivienda}
                      onChange={(e: any) =>
                        setInputs((prev) => ({
                          ...prev,
                          distribucion_intereses_vivienda: e.target.value,
                        }))
                      }
                    >
                      <option value="100_CONYUGE_A">100% Cónyuge A (Mayor Tasa Marginal - Recomendado)</option>
                      <option value="50_50">50% Cónyuge A y 50% Cónyuge B</option>
                      <option value="100_CONYUGE_B">100% Cónyuge B</option>
                    </select>
                  </div>

                  <div className="input-field" style={{ marginBottom: '10px' }}>
                    <label className="input-label">Valor de Nuevos Activos Adquiridos en el Año (Inmuebles / Carros)</label>
                    <div className="input-wrapper">
                      <span className="input-prefix">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="currency-input"
                        value={formatCOP(inputs.valor_activo_adquirido_en_el_ano, false)}
                        onChange={(e) =>
                          setInputs((prev) => ({
                            ...prev,
                            valor_activo_adquirido_en_el_ano: parseCOP(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="input-field">
                    <label className="input-label">Esquema de Titularidad del Activo Adquirido</label>
                    <select
                      className="text-input"
                      value={inputs.esquema_adquisicion_activo}
                      onChange={(e: any) =>
                        setInputs((prev) => ({
                          ...prev,
                          esquema_adquisicion_activo: e.target.value,
                        }))
                      }
                    >
                      <option value="COPROPIEDAD_PROINDIVISO_50_50">
                        🟢 Copropiedad / Proindiviso 50/50 (Escrituración Compartida - Recomendado)
                      </option>
                      <option value="MUTUO_PRESTAMO_CON_FECHA_CIERTA">
                        🟡 Contrato de Mutuo / Préstamo con Fecha Cierta (Art. 283 E.T.)
                      </option>
                      <option value="TITULARIDAD_EXCLUSIVA_SIN_FONDOS">
                        🔴 Titularidad 100% en Cónyuge B sin Fondos Propios (Riesgo DIAN)
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PANEL COMPARATIVO DE RESULTADOS Y AHORRO */}
          {result && (
            <div className="card" style={{ border: '2px solid var(--primary)', marginBottom: '24px' }}>
              <div
                className="card-header"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(139, 92, 246, 0.12))',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div className="card-title" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)' }}>
                  🎉 Resultado de la Planeación Conyugal: Ahorro de {formatCOP(result.ahorro_tributario_familiar_neto_cop)} COP ({result.porcentaje_ahorro_familiar_pct.toFixed(1)}%)
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--emerald)',
                    color: '#fff',
                  }}
                >
                  Optimizador Conyugal Activo
                </span>
              </div>

              <div className="card-body" style={{ padding: '20px' }}>
                {/* TARJETAS COMPARATIVAS: ESCENARIO 1 VS ESCENARIO 2 */}
                <div className="responsive-grid-split" style={{ gap: '16px', marginBottom: '20px' }}>
                  {/* ESCENARIO TRADICIONAL */}
                  <div style={{ padding: '14px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--rose)', marginBottom: '6px' }}>
                      ❌ Escenario Tradicional (Sin Planear / Concentrado)
                    </div>
                    <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      {result.escenario_no_optimizado.descripcion}
                    </p>

                    <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Impuesto {result.escenario_no_optimizado.conyuge_a.nombre}:</span>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>
                          {formatCOP(result.escenario_no_optimizado.conyuge_a.impuesto_renta_determinado_cop)} COP
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Impuesto {result.escenario_no_optimizado.conyuge_b.nombre}:</span>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>
                          {formatCOP(result.escenario_no_optimizado.conyuge_b.impuesto_renta_determinado_cop)} COP
                        </strong>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          borderTop: '1px dashed var(--border-subtle)',
                          marginTop: '6px',
                          paddingTop: '6px',
                          color: 'var(--rose)',
                          fontWeight: 800,
                        }}
                      >
                        <span>Total Impuesto Familiar:</span>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>
                          {formatCOP(result.escenario_no_optimizado.total_impuesto_familiar_cop)} COP
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* ESCENARIO OPTIMIZADO */}
                  <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.06)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <div style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--emerald)', marginBottom: '6px' }}>
                      ✅ Escenario Conyugal Optimizado
                    </div>
                    <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      {result.escenario_optimizado.descripcion}
                    </p>

                    <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Impuesto {result.escenario_optimizado.conyuge_a.nombre}:</span>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>
                          {formatCOP(result.escenario_optimizado.conyuge_a.impuesto_renta_determinado_cop)} COP
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Impuesto {result.escenario_optimizado.conyuge_b.nombre}:</span>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>
                          {formatCOP(result.escenario_optimizado.conyuge_b.impuesto_renta_determinado_cop)} COP
                        </strong>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          borderTop: '1px dashed rgba(16, 185, 129, 0.4)',
                          marginTop: '6px',
                          paddingTop: '6px',
                          color: 'var(--emerald)',
                          fontWeight: 800,
                        }}
                      >
                        <span>Total Impuesto Familiar Optimizado:</span>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>
                          {formatCOP(result.escenario_optimizado.total_impuesto_familiar_cop)} COP
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DIAGNÓSTICO DE RIESGO PATRIMONIAL */}
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: '8px',
                    backgroundColor: result.analisis_riesgo_patrimonial.riesgo_comparacion_patrimonial_conyuge_titular
                      ? 'rgba(239, 68, 68, 0.08)'
                      : 'rgba(59, 130, 246, 0.08)',
                    border: `1px solid ${
                      result.analisis_riesgo_patrimonial.riesgo_comparacion_patrimonial_conyuge_titular
                        ? 'rgba(239, 68, 68, 0.3)'
                        : 'rgba(59, 130, 246, 0.25)'
                    }`,
                    marginBottom: '16px',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: '13px',
                      color: result.analisis_riesgo_patrimonial.riesgo_comparacion_patrimonial_conyuge_titular
                        ? 'var(--rose)'
                        : 'var(--primary)',
                      marginBottom: '6px',
                    }}
                  >
                    {result.analisis_riesgo_patrimonial.riesgo_comparacion_patrimonial_conyuge_titular
                      ? '⚠️ ALERTA DE INCONSISTENCIA PATRIMONIAL ANTE LA DIAN (ARTS. 236 Y 302 E.T.)'
                      : '🛡️ ESTADO DE CONSISTENCIA PATRIMONIAL CONYUGAL'}
                  </div>
                  <p style={{ margin: '0 0 6px 0', fontSize: '12px', lineHeight: '1.55', color: 'var(--text-secondary)' }}>
                    {result.analisis_riesgo_patrimonial.diagnostico_legal}
                  </p>
                  <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    <strong>Solución Jurídica Recomendada:</strong> {result.analisis_riesgo_patrimonial.solucion_recomendada}
                  </p>
                </div>

                {/* RECOMENDACIONES LEGALES Y ESTRATEGIAS APLICADAS */}
                <div style={{ background: 'var(--bg-subtle)', padding: '14px 16px', borderRadius: '8px', marginBottom: '14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '12.5px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    📋 Principios Clave de Formalización para Parejas:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11.5px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                    {result.recomendaciones_legales_y_formales.map((rec, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* BOTÓN PARA EXPANDIR TRAZABILIDAD */}
                <button
                  className="btn btn-xs btn-outline"
                  onClick={() => setShowAuditTrace(!showAuditTrace)}
                >
                  {showAuditTrace ? '▲ Ocultar Trazabilidad Matemática' : '▼ Ver Trazabilidad Paso a Paso'}
                </button>

                {showAuditTrace && (
                  <div className="audit-list" style={{ marginTop: '14px' }}>
                    {result.audit_trace.map((step, idx) => (
                      <div key={idx} className="audit-item">
                        <div className="audit-item-header">
                          <span className="audit-item-title">{step.title}</span>
                          {step.statutory_reference && <span className="audit-item-ref">{step.statutory_reference}</span>}
                        </div>
                        {step.notes && <p className="audit-item-notes">{step.notes}</p>}
                        <div className="audit-item-values">
                          <span>
                            Calculado: <strong>${step.calculated_cop.toLocaleString('es-CO')} COP</strong>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* SECCIÓN 2: RIESGO DE "UNO PONE LA PLATA" */}
      {activeSection === 'riesgos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <div className="card-header" style={{ background: 'rgba(239, 68, 68, 0.08)' }}>
              <div className="card-title" style={{ fontSize: '14px', color: 'var(--rose)' }}>
                ⚠️ ¿Qué pasa fiscalmente cuando «Uno pone la plata y el bien queda a nombre del otro»?
              </div>
            </div>
            <div className="card-body" style={{ fontSize: '12.5px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
              <p>
                Esta es una práctica sumamente común en los hogares colombianos por motivos de protección familiar o tradición. Sin embargo, ante el cruce automático de información exógena de la DIAN, genera dos contingencias graves si no se formaliza adecuadamente:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', margin: '14px 0' }}>
                <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px', borderLeft: '3px solid var(--rose)' }}>
                  <strong style={{ color: 'var(--rose)', display: 'block', marginBottom: '4px' }}>
                    1. Riesgo de Desajuste por Comparación Patrimonial (Art. 236 y 237 E.T.)
                  </strong>
                  <p style={{ fontSize: '11.5px', margin: 0 }}>
                    Para el cónyuge que queda como titular en la escritura pública o matrícula del vehículo, su patrimonio bruto aumenta en el 100% del valor del activo. Si no tuvo ingresos gravados ni deudas formales en ese año, la DIAN presume que la diferencia es <strong>renta líquida gravable no declarada</strong> y liquida el impuesto a las tarifas marginales ordinarias (hasta el 39%).
                  </p>
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
                  <strong style={{ color: '#d97706', display: 'block', marginBottom: '4px' }}>
                    2. Riesgo de Donación Inter Vivos Involuntaria (Art. 302 E.T.)
                  </strong>
                  <p style={{ fontSize: '11.5px', margin: 0 }}>
                    Si un cónyuge transfiere dinero o compra un bien a título gratuito para el otro, el derecho tributario lo califica como una <strong>donación entre vivos</strong>. Las donaciones constituyen Ganancia Ocasional gravada a la tarifa del 15% en cabeza del cónyuge receptor (con la limitada exención del 20% hasta 1.625 UVT del Art. 307 num. 4).
                  </p>
                </div>
              </div>

              <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '16px', marginBottom: '8px' }}>
                🛡️ Las 2 Soluciones Jurídico-Tributarias Válidas:
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.06)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <strong style={{ color: 'var(--emerald)', display: 'block', marginBottom: '4px' }}>
                    Opción A: Copropiedad / Proindiviso (Escrituración Compartida)
                  </strong>
                  <p style={{ fontSize: '11.5px', margin: 0 }}>
                    El inmueble o activo se escritura en porcentajes proporcionales al aporte real de cada cónyuge (ej. 50%-50% u 80%-20%). Cada uno declara en su Formulario 210 su cuota parte de costo fiscal y patrimonio, eliminando por completo cualquier presunción de desajuste.
                  </p>
                </div>

                <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.06)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                  <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>
                    Opción B: Contrato de Mutuo / Préstamo entre Cónyuges (Art. 283 E.T.)
                  </strong>
                  <p style={{ fontSize: '11.5px', margin: 0 }}>
                    Si el activo debe quedar al 100% a nombre de uno de ellos, el cónyuge titular declara el activo en su patrimonio bruto y registra paralelamente una cuenta por pagar (pasivo) a favor de su cónyuge. El cónyuge aportante declara una cuenta por cobrar (activo). Se debe suscribir un contrato de mutuo con reconocimiento de firmas y fecha cierta ante notario.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 3: ESTRATEGIAS DE OPTIMIZACIÓN */}
      {activeSection === 'estrategias' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          <div className="card">
            <div className="card-header" style={{ background: 'rgba(59, 130, 246, 0.08)' }}>
              <div className="card-title" style={{ fontSize: '13.5px', color: 'var(--primary)' }}>
                1. Aprovechamiento del Tramo 0% (Art. 241 E.T.)
              </div>
            </div>
            <div className="card-body" style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              <p>
                En Colombia, las primeras <strong>1.090 UVT</strong> de renta líquida gravable ($57.061.500 COP en 2026) tributan al <strong>0% de impuesto</strong>.
              </p>
              <p>
                Si una pareja tiene inversiones o inmuebles en arriendo que generan $60M anuales, si todo está a nombre del cónyuge con sueldo alto, esos $60M entran a tributar a tasas del 28%, 33% o 35%. Al estructurar los activos en copropiedad 50/50, el segundo cónyuge aprovecha su propio tramo del 0% y el límite del 40% de rentas exentas (hasta 1.340 UVT), generando un ahorro familiar legítimo.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ background: 'rgba(16, 185, 129, 0.08)' }}>
              <div className="card-title" style={{ fontSize: '13.5px', color: 'var(--emerald)' }}>
                2. Distribución de Dependientes (Art. 387 y 336 E.T.)
              </div>
            </div>
            <div className="card-body" style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              <p>
                <strong>Concurrencia de Padres:</strong> Según la doctrina de la DIAN, ambos padres pueden tomar deducción por dependientes si acreditan la manutención y cumplen individualmente los requisitos.
              </p>
              <p>
                <strong>Cónyuge Dependiente:</strong> Si uno de los cónyuges no tiene ingresos o sus ingresos son inferiores a 260 UVT anuales ($13.611.000 COP en 2026), el otro cónyuge puede solicitarlo como dependiente económico (10% del ingreso bruto hasta 384 UVT + 72 UVT adicionales según Ley 2277).
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ background: 'rgba(245, 158, 11, 0.08)' }}>
              <div className="card-title" style={{ fontSize: '13.5px', color: '#d97706' }}>
                3. Intereses de Vivienda Familiar (Art. 119 E.T.)
              </div>
            </div>
            <div className="card-body" style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              <p>
                Si el crédito hipotecario o leasing habitacional está a nombre de ambos cónyuges, pueden deducir los intereses hasta el tope de <strong>1.200 UVT anuales</strong> ($62.820.000 COP).
              </p>
              <p>
                La deducción puede repartirse en partes iguales (50/50) o solicitarse en su totalidad en cabeza del cónyuge que tenga mayor tarifa marginal, siempre que se certifique que el otro cónyuge no la solicitó en su respectiva declaración de renta.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ background: 'rgba(139, 92, 246, 0.08)' }}>
              <div className="card-title" style={{ fontSize: '13.5px', color: '#7c3aed' }}>
                4. Venta de Casa de Habitación (Art. 311-1 E.T.)
              </div>
            </div>
            <div className="card-body" style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              <p>
                La venta de la casa o apartamento de habitación goza de una exención de hasta <strong>5.000 UVT</strong> de ganancia ocasional si los recursos se consignan en cuentas AFC o se destinan a vivienda.
              </p>
              <p>
                Si el inmueble familiar figura en copropiedad 50/50 entre ambos cónyuges, cada uno tiene derecho individual a su cupo de 5.000 UVT de ganancia exenta, permitiendo eximir conjuntamente hasta <strong>10.000 UVT de utilidad</strong> ($523.500.000 COP en 2026).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 4: GANANCIALES Y SUCESIONES */}
      {activeSection === 'gananciales' && (
        <div className="card">
          <div className="card-header" style={{ background: 'rgba(59, 130, 246, 0.08)' }}>
            <div className="card-title" style={{ fontSize: '14px', color: 'var(--primary)' }}>
              🏛️ Gananciales vs. Porción Conyugal (Art. 47 y 307 del Estatuto Tributario)
            </div>
          </div>
          <div className="card-body" style={{ fontSize: '12.5px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div style={{ padding: '14px', background: 'var(--bg-subtle)', borderRadius: '8px', borderLeft: '4px solid var(--emerald)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--emerald)', margin: '0 0 6px 0' }}>
                  1. Gananciales (Art. 47 E.T. - 100% INCRNGO)
                </h4>
                <p style={{ fontSize: '11.5px', margin: 0 }}>
                  Los bienes y recursos que se reciben a título de <strong>gananciales</strong> al momento de liquidar la sociedad conyugal (por divorcio, disolución voluntaria ante notaría o fallecimiento de uno de los cónyuges) son un <strong>Ingreso No Constitutivo de Renta ni Ganancia Ocasional (INCRNGO)</strong>. No pagan ni un solo peso de impuesto.
                </p>
                <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  ⚠️ <em>Condición:</em> Aplica únicamente con la escritura o sentencia formal de liquidación de la sociedad conyugal, nunca en la cotidianidad del matrimonio.
                </div>
              </div>

              <div style={{ padding: '14px', background: 'var(--bg-subtle)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)', margin: '0 0 6px 0' }}>
                  2. Porción Conyugal &amp; Herencias (Art. 307 E.T.)
                </h4>
                <p style={{ fontSize: '11.5px', margin: 0 }}>
                  En caso de fallecimiento, lo recibido por el cónyuge sobreviviente a título de porción conyugal que exceda la porción legitimaria se grava como Ganancia Ocasional (15%), pero goza de las exenciones del Art. 307 E.T.:
                </p>
                <ul style={{ margin: '6px 0 0 0', paddingLeft: '16px', fontSize: '11px' }}>
                  <li>Hasta 13.000 UVT ($680.550.000 COP) en la vivienda del causante.</li>
                  <li>Hasta 6.500 UVT ($340.275.000 COP) en otros inmuebles.</li>
                  <li>Las primeras 3.250 UVT ($170.137.500 COP) en bienes muebles y porción general.</li>
                </ul>
              </div>
            </div>

            <div style={{ background: 'rgba(139, 92, 246, 0.08)', padding: '12px 14px', borderRadius: '6px', fontSize: '12px' }}>
              <strong style={{ color: '#7c3aed' }}>💡 Capitulaciones Matrimoniales / Maritales:</strong> Las capitulaciones suscritas antes del matrimonio o del inicio de la unión marital de hecho permiten la separación total o parcial de bienes desde el día uno, simplificando la titularidad y la trazabilidad fiscal ante la DIAN.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
