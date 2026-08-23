import React, { useState, useEffect } from 'react';
import { Sparkles, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { PersonaNaturalInput, PersonaNaturalOutput } from '../types/tax';
import { calculatePersonaNatural } from '../services/api';
import { AuditTraceModal } from './AuditTraceModal';

interface PersonaNaturalCalculatorProps {
  taxYear: number;
  uvtValue: number;
}

export const PersonaNaturalCalculator: React.FC<PersonaNaturalCalculatorProps> = ({
  taxYear,
  uvtValue,
}) => {
  const [inputs, setInputs] = useState<PersonaNaturalInput>({
    tax_year: taxYear,
    custom_uvt: uvtValue,
    rentas_trabajo: 77855856,
    viaticos: 4000000,
    otros_ingresos_brutos: 0,
    aporte_salud_obligatorio: 2563292,
    aporte_pension_obligatorio: 3154789,
    otros_incrngo: 0,
    aplica_dependiente_general: true,
    numero_dependientes_adicionales_72uvt: 0,
    medicina_prepagada_anual: 0,
    intereses_vivienda_anual: 0,
    gmf_4x1000_total: 0,
    compras_factura_electronica: 0,
    aportes_voluntarios_pension_afc: 10068221,
    otras_rentas_exentas: 0,
    descuentos_tributarios: 0,
    retenciones_fuente_practicadas: 0,
    anticipo_ano_anterior: 0,
    saldo_a_favor_ano_anterior: 0,
  });

  const [result, setResult] = useState<PersonaNaturalOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  // Synchronize year changes
  useEffect(() => {
    setInputs((prev) => ({ ...prev, tax_year: taxYear, custom_uvt: uvtValue }));
  }, [taxYear, uvtValue]);

  // Recalculate on inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      runCalculation();
    }, 150);
    return () => clearTimeout(timer);
  }, [inputs]);

  const runCalculation = async () => {
    setError(null);
    try {
      const res = await calculatePersonaNatural(inputs);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Error al calcular');
    }
  };

  const handleInputChange = (field: keyof PersonaNaturalInput, value: any) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const loadExcel2022Preset = () => {
    setInputs({
      tax_year: 2022,
      custom_uvt: 38004,
      rentas_trabajo: 77855856,
      viaticos: 4000000,
      otros_ingresos_brutos: 0,
      aporte_salud_obligatorio: 2563292,
      aporte_pension_obligatorio: 3154789,
      otros_incrngo: 0,
      aplica_dependiente_general: true,
      numero_dependientes_adicionales_72uvt: 0,
      medicina_prepagada_anual: 0,
      intereses_vivienda_anual: 0,
      gmf_4x1000_total: 0,
      compras_factura_electronica: 0,
      aportes_voluntarios_pension_afc: 10068221,
      otras_rentas_exentas: 0,
      descuentos_tributarios: 0,
      retenciones_fuente_practicadas: 0,
      anticipo_ano_anterior: 0,
      saldo_a_favor_ano_anterior: 0,
    });
  };

  const load2026HighEarnerPreset = () => {
    setInputs({
      tax_year: 2026,
      custom_uvt: 52350,
      rentas_trabajo: 180000000,
      viaticos: 12000000,
      otros_ingresos_brutos: 0,
      aporte_salud_obligatorio: 7680000,
      aporte_pension_obligatorio: 7680000,
      otros_incrngo: 0,
      aplica_dependiente_general: true,
      numero_dependientes_adicionales_72uvt: 2,
      medicina_prepagada_anual: 12000000,
      intereses_vivienda_anual: 24000000,
      gmf_4x1000_total: 3000000,
      compras_factura_electronica: 40000000,
      aportes_voluntarios_pension_afc: 25000000,
      otras_rentas_exentas: 0,
      descuentos_tributarios: 0,
      retenciones_fuente_practicadas: 15000000,
      anticipo_ano_anterior: 0,
      saldo_a_favor_ano_anterior: 0,
    });
  };

  return (
    <div className="calc-container">
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className="btn btn-outline btn-sm" onClick={loadExcel2022Preset}>
          <Sparkles size={14} color="#1e3a8a" /> Cargar Caso Original Excel (2022: $809.000)
        </button>
        <button className="btn btn-outline btn-sm" onClick={load2026HighEarnerPreset}>
          <Sparkles size={14} color="#059669" /> Cargar Caso Proyectado 2026 (Alivios Múltiples)
        </button>
      </div>

      <div className="calc-grid">
        {/* INPUTS COLUMN */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Datos de Entrada - Cédula General</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Auto-cálculo en tiempo real</span>
          </div>

          <div className="card-body">
            {/* SECCIÓN 1: INGRESOS */}
            <div className="form-section">
              <h3 className="section-title">1. Ingresos Brutos del Trabajo</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Rentas de Trabajo (Salarios / Honorarios)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.rentas_trabajo}
                      onChange={(e) => handleInputChange('rentas_trabajo', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Viáticos Gravados</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.viaticos}
                      onChange={(e) => handleInputChange('viaticos', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Otros Ingresos Brutos Cédula General</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.otros_ingresos_brutos}
                      onChange={(e) => handleInputChange('otros_ingresos_brutos', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: INCRNGO */}
            <div className="form-section">
              <h3 className="section-title">2. Ingresos No Constitutivos de Renta (INCRNGO)</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Aporte Salud Obligatorio (EPS)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.aporte_salud_obligatorio}
                      onChange={(e) => handleInputChange('aporte_salud_obligatorio', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Aporte Pensión Obligatoria & FSP</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.aporte_pension_obligatorio}
                      onChange={(e) => handleInputChange('aporte_pension_obligatorio', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: DEDUCCIONES */}
            <div className="form-section">
              <h3 className="section-title">3. Deducciones Imputables (Alivios Fiscales)</h3>
              
              <div style={{ marginBottom: '14px' }}>
                <label className="checkbox-group">
                  <input
                    type="checkbox"
                    checked={inputs.aplica_dependiente_general}
                    onChange={(e) => handleInputChange('aplica_dependiente_general', e.target.checked)}
                  />
                  <div>
                    <strong style={{ fontSize: '13.5px' }}>Deducción por Dependiente Económico General (Art. 387 E.T.)</strong>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      10% del ingreso laboral hasta máx 384 UVT (${(384 * uvtValue).toLocaleString('es-CO')} COP)
                    </p>
                  </div>
                </label>
              </div>

              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">
                    <span>Dependientes Adicionales (0 a 4)</span>
                    <span className="input-helper">72 UVT c/u</span>
                  </label>
                  <select
                    className="select-input"
                    value={inputs.numero_dependientes_adicionales_72uvt}
                    onChange={(e) => handleInputChange('numero_dependientes_adicionales_72uvt', parseInt(e.target.value) || 0)}
                  >
                    <option value={0}>0 dependientes adicionales</option>
                    <option value={1}>1 adicional (72 UVT = ${(72 * uvtValue).toLocaleString('es-CO')})</option>
                    <option value={2}>2 adicionales (144 UVT = ${(144 * uvtValue).toLocaleString('es-CO')})</option>
                    <option value={3}>3 adicionales (216 UVT = ${(216 * uvtValue).toLocaleString('es-CO')})</option>
                    <option value={4}>4 adicionales (288 UVT = ${(288 * uvtValue).toLocaleString('es-CO')})</option>
                  </select>
                </div>

                <div className="input-field">
                  <label className="input-label">
                    <span>Medicina Prepagada Anual</span>
                    <span className="input-helper">Máx 192 UVT (${(192 * uvtValue).toLocaleString('es-CO')})</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.medicina_prepagada_anual}
                      onChange={(e) => handleInputChange('medicina_prepagada_anual', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">
                    <span>Intereses Crédito Vivienda / Leasing</span>
                    <span className="input-helper">Máx 1.200 UVT (${(1200 * uvtValue).toLocaleString('es-CO')})</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.intereses_vivienda_anual}
                      onChange={(e) => handleInputChange('intereses_vivienda_anual', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">
                    <span>GMF (4x1000) Pagado</span>
                    <span className="input-helper">50% deducible</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.gmf_4x1000_total}
                      onChange={(e) => handleInputChange('gmf_4x1000_total', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">
                    <span>Compras con Factura Electrónica</span>
                    <span className="input-helper">1% deducible (Máx 240 UVT)</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.compras_factura_electronica}
                      onChange={(e) => handleInputChange('compras_factura_electronica', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 4: RENTAS EXENTAS */}
            <div className="form-section">
              <h3 className="section-title">4. Rentas Exentas</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">
                    <span>Aportes Voluntarios Pensión / AFC</span>
                    <span className="input-helper">Máx 30% ingreso / 3.800 UVT</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.aportes_voluntarios_pension_afc}
                      onChange={(e) => handleInputChange('aportes_voluntarios_pension_afc', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Otras Rentas Exentas Procedentes</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.otras_rentas_exentas}
                      onChange={(e) => handleInputChange('otras_rentas_exentas', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 5: RETENCIONES Y PAGOS */}
            <div className="form-section">
              <h3 className="section-title">5. Retenciones y Saldos Previos</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Retenciones en la Fuente Practicadas</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.retenciones_fuente_practicadas}
                      onChange={(e) => handleInputChange('retenciones_fuente_practicadas', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Anticipo Renta Año Anterior</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.anticipo_ano_anterior}
                      onChange={(e) => handleInputChange('anticipo_ano_anterior', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Saldo a Favor Año Anterior</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.saldo_a_favor_ano_anterior}
                      onChange={(e) => handleInputChange('saldo_a_favor_ano_anterior', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RESULTS COLUMN */}
        <div>
          <div className="card results-card">
            <div className="card-header">
              <h2 className="card-title">Liquidación & Depuración Fiscal</h2>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setIsAuditModalOpen(true)}
                disabled={!result}
              >
                <Eye size={14} /> Ver Trazabilidad
              </button>
            </div>

            <div className="card-body">
              {error && (
                <div style={{ color: '#e11d48', padding: '12px', background: '#fff1f2', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', display: 'flex', gap: '8px' }}>
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {result && (
                <>
                  {/* KPI BANNER */}
                  <div className={`kpi-banner ${result.saldo_a_pagar > 0 ? 'to-pay' : 'favorable'}`}>
                    <div>
                      <div className="kpi-label">
                        {result.saldo_a_pagar > 0 ? 'Saldo Total a Pagar' : 'Saldo a Favor del Contribuyente'}
                      </div>
                      <div className="kpi-value">
                        ${(result.saldo_a_pagar > 0 ? result.saldo_a_pagar : result.saldo_a_favor).toLocaleString('es-CO')} COP
                      </div>
                    </div>
                    {result.saldo_a_pagar > 0 ? (
                      <span className="badge-uvt" style={{ fontSize: '11px' }}>
                        Tarifa Marginal: {(result.tarifa_marginal_maxima * 100).toFixed(0)}%
                      </span>
                    ) : (
                      <span className="badge-uvt" style={{ background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald-border)' }}>
                        <CheckCircle2 size={14} /> Saldo a Favor
                      </span>
                    )}
                  </div>

                  {/* STEP BY STEP BREAKDOWN TABLE */}
                  <table className="breakdown-table">
                    <tbody>
                      <tr>
                        <td>Total Ingresos Brutos</td>
                        <td className="amount">${result.total_ingresos_brutos.toLocaleString('es-CO')}</td>
                      </tr>
                      <tr>
                        <td>(-) Total INCRNGO (Salud, Pensión)</td>
                        <td className="amount negative">-${result.total_incrngo.toLocaleString('es-CO')}</td>
                      </tr>
                      <tr className="highlight">
                        <td>(=) Total Ingresos Netos</td>
                        <td className="amount">${result.ingreso_neto.toLocaleString('es-CO')}</td>
                      </tr>
                      <tr>
                        <td>(-) Deducciones Aceptadas</td>
                        <td className="amount negative">-${result.total_deducciones_aceptadas.toLocaleString('es-CO')}</td>
                      </tr>
                      <tr>
                        <td>(-) Rentas Exentas (AFC + Otras)</td>
                        <td className="amount negative">-${result.total_rentas_exentas_previas.toLocaleString('es-CO')}</td>
                      </tr>
                      <tr>
                        <td>(-) Renta Exenta Laboral (25%)</td>
                        <td className="amount negative">-${result.renta_exenta_laboral_25.toLocaleString('es-CO')}</td>
                      </tr>
                      <tr>
                        <td>Subtotal Alivios Solicitados</td>
                        <td className="amount">${result.subtotal_alivios_antes_de_limite.toLocaleString('es-CO')}</td>
                      </tr>
                      <tr>
                        <td>Tope Límite Conjunto (40% / Tope UVT)</td>
                        <td className="amount" style={{ color: 'var(--accent-amber)' }}>
                          ${result.limite_conjunto_aplicable_cop.toLocaleString('es-CO')}
                        </td>
                      </tr>
                      {result.alivios_rechazados_por_limite > 0 && (
                        <tr>
                          <td style={{ color: '#e11d48', fontSize: '12px' }}>(!) Alivios Rechazados por Límite</td>
                          <td className="amount negative" style={{ fontSize: '12px' }}>
                            -${result.alivios_rechazados_por_limite.toLocaleString('es-CO')}
                          </td>
                        </tr>
                      )}
                      <tr className="highlight" style={{ background: '#f8fafc', borderTop: '2px solid var(--primary-border)' }}>
                        <td>(=) Renta Líquida Gravable</td>
                        <td className="amount" style={{ color: 'var(--primary)' }}>
                          ${result.renta_liquida_gravable.toLocaleString('es-CO')}
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                            {result.renta_liquida_gravable_uvt.toFixed(2)} UVT
                          </div>
                        </td>
                      </tr>
                      <tr className="highlight">
                        <td>(=) Impuesto Bruto de Renta (Art. 241)</td>
                        <td className="amount">${result.impuesto_bruto_renta.toLocaleString('es-CO')}</td>
                      </tr>
                      {result.descuentos_tributarios > 0 && (
                        <tr>
                          <td>(-) Descuentos Tributarios</td>
                          <td className="amount negative">-${result.descuentos_tributarios.toLocaleString('es-CO')}</td>
                        </tr>
                      )}
                      <tr className="highlight">
                        <td>(=) Impuesto Neto de Renta</td>
                        <td className="amount">${result.impuesto_neto_renta.toLocaleString('es-CO')}</td>
                      </tr>
                      <tr>
                        <td>(-) Retenciones y Anticipos</td>
                        <td className="amount negative">-${result.total_anticipos_y_retenciones.toLocaleString('es-CO')}</td>
                      </tr>
                    </tbody>
                  </table>

                  <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => setIsAuditModalOpen(true)}
                  >
                    <Eye size={16} /> Ver Informe Completo de Auditoría Legal
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {result && (
        <AuditTraceModal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          title="Persona Natural (Cédula General)"
          auditTrace={result.audit_trace}
        />
      )}
    </div>
  );
};
