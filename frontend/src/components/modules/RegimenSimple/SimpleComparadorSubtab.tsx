import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import type { ComparativaSimpleInput, ComparativaSimpleOutput } from '../../../types/tax';
import { simularComparativaSimple } from '../../../services/api';
import { formatCOP, parseCOP } from '../../../utils/formatters';

export const SimpleComparadorSubtab: React.FC = () => {
  const { taxYear, uvtValue } = useApp();

  const [inputs, setInputs] = useState<ComparativaSimpleInput>({
    tax_year: taxYear,
    custom_uvt: uvtValue,
    tipo_persona: 'juridica',
    grupo_actividad: 2,
    ingresos_brutos_anuales: 600000000,
    costos_y_gastos_deducibles: 380000000,
    aportes_pension_empleador: 12000000,
    porcentaje_ventas_medios_electronicos: 60,
    tarifa_ica_x_mil: 7.0,
    numero_empleados_menos_10_smlmv: 3,
  });

  const [result, setResult] = useState<ComparativaSimpleOutput | null>(null);

  useEffect(() => {
    setInputs((prev) => ({ ...prev, tax_year: taxYear, custom_uvt: uvtValue }));
  }, [taxYear, uvtValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      runComparison();
    }, 150);
    return () => clearTimeout(timer);
  }, [inputs]);

  const runComparison = async () => {
    try {
      const res = await simularComparativaSimple(inputs);
      setResult(res);
    } catch (err) {
      console.warn('Error comparando regímenes:', err);
    }
  };

  const handleNumChange = (field: keyof ComparativaSimpleInput, valStr: string) => {
    const num = parseCOP(valStr);
    setInputs((prev) => ({ ...prev, [field]: num }));
  };

  return (
    <div id="pane-simple-comparador" className="module-pane active">
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          ⚖️ Simulador de Decisión: Régimen Ordinario vs Régimen SIMPLE
        </h2>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
          Evalúa en tiempo real si a tu empresa o actividad profesional le conviene migrar al <strong>Régimen Simple de Tributación (F-260)</strong> frente al Régimen Ordinario (F-110/F-210), analizando ahorro impositivo, exoneración de nómina (Art. 114-1) y flujo de caja libre de retenciones.
        </p>
      </div>

      <div className="responsive-grid-split">
        {/* PARÁMETROS DEL SIMULADOR */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Datos Financieros de la Empresa / Profesional</h3>
          </div>

          <div className="card-body">
            <div className="inputs-row" style={{ marginBottom: '12px' }}>
              <div className="input-field">
                <label className="input-label">Tipo de Contribuyente</label>
                <select
                  className="select-input"
                  value={inputs.tipo_persona}
                  onChange={(e) => setInputs((prev) => ({ ...prev, tipo_persona: e.target.value }))}
                >
                  <option value="juridica">Persona Jurídica (Tarifa 35% en Ordinario)</option>
                  <option value="natural">Persona Natural (Tarifa Marginal Progresiva)</option>
                </select>
              </div>

              <div className="input-field">
                <label className="input-label">Grupo de Actividad en SIMPLE</label>
                <select
                  className="select-input"
                  value={inputs.grupo_actividad}
                  onChange={(e) => setInputs((prev) => ({ ...prev, grupo_actividad: parseInt(e.target.value) }))}
                >
                  <option value={1}>Grupo 1: Tiendas y Peluquerías (1.2% - 5.6%)</option>
                  <option value={2}>Grupo 2: Comercio e Industria (1.6% - 4.5%)</option>
                  <option value={3}>Grupo 3: Restaurantes y Transporte (1.6% - 4.5%)</option>
                  <option value={4}>Grupo 4: Educación y Salud (3.7% - 5.9%)</option>
                  <option value={5}>Grupo 5: Servicios Profesionales (7.3% - 12.0%)</option>
                  <option value={6}>Grupo 6: Reciclaje (1.62%)</option>
                </select>
              </div>
            </div>

            <div className="input-field" style={{ marginBottom: '12px' }}>
              <label className="input-label">Ingresos Brutos Anuales Estimados</label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="currency-input"
                  value={formatCOP(inputs.ingresos_brutos_anuales, false)}
                  onChange={(e) => handleNumChange('ingresos_brutos_anuales', e.target.value)}
                />
              </div>
            </div>

            <div className="input-field" style={{ marginBottom: '12px' }}>
              <label className="input-label">Costos y Gastos Deducibles Reales</label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="currency-input"
                  value={formatCOP(inputs.costos_y_gastos_deducibles, false)}
                  onChange={(e) => handleNumChange('costos_y_gastos_deducibles', e.target.value)}
                />
              </div>
              <span className="input-help">
                Margen de utilidad bruta estimada:{' '}
                <strong>
                  {inputs.ingresos_brutos_anuales > 0
                    ? (((inputs.ingresos_brutos_anuales - inputs.costos_y_gastos_deducibles) / inputs.ingresos_brutos_anuales) * 100).toFixed(1)
                    : 0}
                  %
                </strong>.
              </span>
            </div>

            <div className="inputs-row" style={{ marginBottom: '12px' }}>
              <div className="input-field">
                <label className="input-label">Aportes Pensión Empleador (Año)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="currency-input"
                    value={formatCOP(inputs.aportes_pension_empleador, false)}
                    onChange={(e) => handleNumChange('aportes_pension_empleador', e.target.value)}
                  />
                </div>
              </div>

              <div className="input-field">
                <label className="input-label">N° Trabajadores (&lt; 10 SMMLV)</label>
                <input
                  type="number"
                  min="0"
                  className="text-input"
                  value={inputs.numero_empleados_menos_10_smlmv}
                  onChange={(e) => setInputs((prev) => ({ ...prev, numero_empleados_menos_10_smlmv: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="inputs-row">
              <div className="input-field">
                <label className="input-label">% Ventas con Tarjetas / PSE</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="text-input"
                  value={inputs.porcentaje_ventas_medios_electronicos}
                  onChange={(e) => setInputs((prev) => ({ ...prev, porcentaje_ventas_medios_electronicos: parseFloat(e.target.value) || 0 }))}
                />
                <span className="input-help">Descuento del 0.5% en SIMPLE.</span>
              </div>

              <div className="input-field">
                <label className="input-label">Tarifa ICA Promedio (por mil)</label>
                <input
                  type="number"
                  step="0.5"
                  className="text-input"
                  value={inputs.tarifa_ica_x_mil}
                  onChange={(e) => setInputs((prev) => ({ ...prev, tarifa_ica_x_mil: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* COMPARACIÓN EN PARALELO */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Matriz Comparativa de Carga Impositiva</h3>
          </div>

          <div className="card-body">
            {result ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* VEREDICTO */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    background: result.ahorro_tributario_neto_cop > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    border: `2px solid ${result.ahorro_tributario_neto_cop > 0 ? '#10b981' : '#3b82f6'}`,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                    DIAGNÓSTICO TRIBUTARIO ESTRATÉGICO
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: result.ahorro_tributario_neto_cop > 0 ? '#059669' : '#1e40af', margin: '4px 0' }}>
                    {result.regimen_recomendado}
                  </div>
                  {result.ahorro_tributario_neto_cop > 0 ? (
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#10b981' }}>
                      Ahorro Anual Estimado: ${formatCOP(result.ahorro_tributario_neto_cop, false)} ({result.ahorro_tributario_pct.toFixed(1)}% de reducción)
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      El margen de utilidad es bajo; el Régimen Ordinario tributa sobre renta líquida real.
                    </div>
                  )}
                </div>

                {/* TABLA COMPARATIVA CARA A CARA */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {/* COLUMNA ORDINARIO */}
                  <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#3b82f6', marginBottom: '8px' }}>
                      🏛️ Régimen Ordinario
                    </div>
                    <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Renta Líquida:</span>
                        <strong>${formatCOP(result.renta_liquida_ordinaria, false)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Impuesto Renta:</span>
                        <strong>${formatCOP(result.impuesto_renta_ordinario, false)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Impuesto ICA:</span>
                        <strong>${formatCOP(result.ica_ordinario, false)}</strong>
                      </div>
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                        <span>Carga Total:</span>
                        <span style={{ color: '#ef4444' }}>${formatCOP(result.total_carga_tributaria_ordinario, false)}</span>
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right' }}>
                        Tasa Efectiva: {result.tasa_efectiva_ordinario_pct.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* COLUMNA SIMPLE */}
                  <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.06)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#059669', marginBottom: '8px' }}>
                      ⚡ Régimen SIMPLE
                    </div>
                    <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Tarifa Consolidada:</span>
                        <strong>{result.tarifa_simple_pct.toFixed(2)}%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Impuesto Bruto:</span>
                        <strong>${formatCOP(result.impuesto_simple_bruto, false)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                        <span>(-) Descuentos:</span>
                        <strong>-${formatCOP(result.descuento_pension_simple + result.descuento_electronico_simple, false)}</strong>
                      </div>
                      <div style={{ borderTop: '1px solid rgba(16, 185, 129, 0.3)', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                        <span>Carga Total:</span>
                        <span style={{ color: '#059669' }}>${formatCOP(result.total_carga_tributaria_simple, false)}</span>
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right' }}>
                        Tasa Efectiva: {result.tasa_efectiva_simple_pct.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* BENEFICIOS COMPLEMENTARIOS */}
                <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '11.5px', lineHeight: '1.6' }}>
                  <div style={{ fontWeight: 800, marginBottom: '4px' }}>✨ Beneficios Complementarios del SIMPLE:</div>
                  <div>
                    • <strong>Liberación de Flujo de Caja:</strong> ${formatCOP(result.beneficio_flujo_caja_sin_retefuente_cop, false)} en liquidez inmediata al no sufrir retenciones en la fuente a título de renta ni de ICA.
                  </div>
                  <div>
                    • <strong>Exoneración de Nómina (Art. 114-1 E.T.):</strong> ${formatCOP(result.ahorro_parafiscales_salud_sena_icbf_cop, false)} en aportes patronales de Salud (8.5%), SENA (2%) e ICBF (3%).
                  </div>
                </div>

                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                  {result.conclusion_didactica}
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                Comparando escenarios fiscales...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
