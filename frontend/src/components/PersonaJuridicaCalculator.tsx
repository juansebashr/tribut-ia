import React, { useState, useEffect } from 'react';
import { Sparkles, Eye, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { PersonaJuridicaInput, PersonaJuridicaOutput } from '../types/tax';
import { calculatePersonaJuridica } from '../services/api';
import { AuditTraceModal } from './AuditTraceModal';

interface PersonaJuridicaCalculatorProps {
  taxYear: number;
  uvtValue: number;
}

export const PersonaJuridicaCalculator: React.FC<PersonaJuridicaCalculatorProps> = ({
  taxYear,
  uvtValue,
}) => {
  const [inputs, setInputs] = useState<PersonaJuridicaInput>({
    tax_year: taxYear,
    custom_uvt: uvtValue,
    tarifa_personalizada: undefined,
    ingresos_brutos_operacionales: 1200000000,
    ingresos_brutos_no_operacionales: 50000000,
    devoluciones_rebajas_descuentos: 20000000,
    ingresos_no_constitutivos_renta: 10000000,
    costos_procedentes: 650000000,
    gastos_administracion: 180000000,
    gastos_ventas: 100000000,
    gastos_financieros: 30000000,
    gastos_no_deducibles: 15000000,
    deducciones_especiales: 0,
    rentas_exentas: 0,
    compensacion_perdidas_fiscales: 0,
    compensacion_exceso_renta_presuntiva: 0,
    utilidad_contable_antes_impuestos: 260000000,
    diferencias_permanentes_ttd: 0,
    ganancia_ocasional_gravable: 0,
    descuento_tributario_ica: 12000000,
    otros_descuentos_tributarios: 0,
    retenciones_en_la_fuente: 35000000,
    autorretenciones_practicadas: 20000000,
    anticipo_ano_anterior: 0,
    saldo_a_favor_ano_anterior: 0,
  });

  const [result, setResult] = useState<PersonaJuridicaOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setInputs((prev) => ({ ...prev, tax_year: taxYear, custom_uvt: uvtValue }));
  }, [taxYear, uvtValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      runCalculation();
    }, 150);
    return () => clearTimeout(timer);
  }, [inputs]);

  const runCalculation = async () => {
    setError(null);
    try {
      const res = await calculatePersonaJuridica(inputs);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Error al calcular persona jurídica');
    }
  };

  const handleInputChange = (field: keyof PersonaJuridicaInput, value: any) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const loadStandardPreset = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      tarifa_personalizada: undefined,
      ingresos_brutos_operacionales: 1200000000,
      ingresos_brutos_no_operacionales: 50000000,
      devoluciones_rebajas_descuentos: 20000000,
      ingresos_no_constitutivos_renta: 10000000,
      costos_procedentes: 650000000,
      gastos_administracion: 180000000,
      gastos_ventas: 100000000,
      gastos_financieros: 30000000,
      gastos_no_deducibles: 15000000,
      deducciones_especiales: 0,
      rentas_exentas: 0,
      compensacion_perdidas_fiscales: 0,
      compensacion_exceso_renta_presuntiva: 0,
      utilidad_contable_antes_impuestos: 260000000,
      diferencias_permanentes_ttd: 0,
      ganancia_ocasional_gravable: 0,
      descuento_tributario_ica: 12000000,
      otros_descuentos_tributarios: 0,
      retenciones_en_la_fuente: 35000000,
      autorretenciones_practicadas: 20000000,
      anticipo_ano_anterior: 0,
      saldo_a_favor_ano_anterior: 0,
    });
  };

  const loadTtdTriggeredPreset = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      tarifa_personalizada: undefined,
      ingresos_brutos_operacionales: 800000000,
      ingresos_brutos_no_operacionales: 0,
      devoluciones_rebajas_descuentos: 0,
      ingresos_no_constitutivos_renta: 0,
      costos_procedentes: 500000000,
      gastos_administracion: 220000000,
      gastos_ventas: 30000000,
      gastos_financieros: 0,
      gastos_no_deducibles: 0,
      deducciones_especiales: 0,
      rentas_exentas: 40000000,
      compensacion_perdidas_fiscales: 0,
      compensacion_exceso_renta_presuntiva: 0,
      utilidad_contable_antes_impuestos: 450000000, // Gran utilidad contable con poca renta gravable
      diferencias_permanentes_ttd: 0,
      ganancia_ocasional_gravable: 0,
      descuento_tributario_ica: 0,
      otros_descuentos_tributarios: 0,
      retenciones_en_la_fuente: 5000000,
      autorretenciones_practicadas: 3000000,
      anticipo_ano_anterior: 0,
      saldo_a_favor_ano_anterior: 0,
    });
  };

  return (
    <div className="calc-container">
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className="btn btn-outline btn-sm" onClick={loadStandardPreset}>
          <Sparkles size={14} color="#1e3a8a" /> Cargar Empresa Ordinaria (Tarifa 35%)
        </button>
        <button className="btn btn-outline btn-sm" onClick={loadTtdTriggeredPreset}>
          <ShieldAlert size={14} color="#d97706" /> Cargar Caso Tasa Mínima TTD (&lt; 15%)
        </button>
      </div>

      <div className="calc-grid">
        {/* INPUTS COLUMN */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Datos Fiscales - Formulario 110</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Régimen Ordinario</span>
          </div>

          <div className="card-body">
            {/* SECCIÓN 1: INGRESOS */}
            <div className="form-section">
              <h3 className="section-title">1. Ingresos Fiscales</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Ingresos Brutos Operacionales</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.ingresos_brutos_operacionales}
                      onChange={(e) => handleInputChange('ingresos_brutos_operacionales', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Ingresos No Operacionales (Financieros/Otros)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.ingresos_brutos_no_operacionales}
                      onChange={(e) => handleInputChange('ingresos_brutos_no_operacionales', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">(-) Devoluciones, Rebajas y Descuentos</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.devoluciones_rebajas_descuentos}
                      onChange={(e) => handleInputChange('devoluciones_rebajas_descuentos', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">(-) INCRNGO (Dividendos no gravados Art. 48/49)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.ingresos_no_constitutivos_renta}
                      onChange={(e) => handleInputChange('ingresos_no_constitutivos_renta', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: COSTOS Y GASTOS */}
            <div className="form-section">
              <h3 className="section-title">2. Costos y Gastos Operacionales</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Costos Fiscales Procedentes (Ventas / Servicios)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.costos_procedentes}
                      onChange={(e) => handleInputChange('costos_procedentes', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Gastos de Administración</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.gastos_administracion}
                      onChange={(e) => handleInputChange('gastos_administracion', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Gastos de Ventas</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.gastos_ventas}
                      onChange={(e) => handleInputChange('gastos_ventas', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Gastos Financieros</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.gastos_financieros}
                      onChange={(e) => handleInputChange('gastos_financieros', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: CONCILIACIÓN FISCAL & TASA MÍNIMA TTD */}
            <div className="form-section">
              <h3 className="section-title">3. Conciliación & Tasa Mínima TTD (Art. 240 Par. 6)</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">
                    <span>Utilidad Contable Antes de Impuestos</span>
                    <span className="input-helper">Auditoría TTD 15%</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.utilidad_contable_antes_impuestos}
                      onChange={(e) => handleInputChange('utilidad_contable_antes_impuestos', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">
                    <span>Gastos No Deducibles</span>
                    <span className="input-helper">Sanciones, sin FE, etc.</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.gastos_no_deducibles}
                      onChange={(e) => handleInputChange('gastos_no_deducibles', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Rentas Exentas Persona Jurídica</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.rentas_exentas}
                      onChange={(e) => handleInputChange('rentas_exentas', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Compensación de Pérdidas Fiscales</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.compensacion_perdidas_fiscales}
                      onChange={(e) => handleInputChange('compensacion_perdidas_fiscales', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 4: GANANCIAS OCASIONALES Y DESCUENTOS */}
            <div className="form-section">
              <h3 className="section-title">4. Ganancias Ocasionales & Descuentos</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">
                    <span>Ganancia Ocasional Gravable</span>
                    <span className="input-helper">Tarifa 15%</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.ganancia_ocasional_gravable}
                      onChange={(e) => handleInputChange('ganancia_ocasional_gravable', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">
                    <span>Descuento Tributario ICA (50%)</span>
                    <span className="input-helper">Art. 115 E.T.</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.descuento_tributario_ica}
                      onChange={(e) => handleInputChange('descuento_tributario_ica', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 5: RETENCIONES Y AUTORRETENCIONES */}
            <div className="form-section">
              <h3 className="section-title">5. Retenciones y Anticipos</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Retenciones en la Fuente Practicadas</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.retenciones_en_la_fuente}
                      onChange={(e) => handleInputChange('retenciones_en_la_fuente', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Autorretenciones Practicadas</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      className="number-input"
                      value={inputs.autorretenciones_practicadas}
                      onChange={(e) => handleInputChange('autorretenciones_practicadas', parseFloat(e.target.value) || 0)}
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
              <h2 className="card-title">Liquidación Privada PJ (F110)</h2>
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
                        {result.saldo_a_pagar > 0 ? 'Saldo Total a Pagar' : 'Saldo a Favor'}
                      </div>
                      <div className="kpi-value">
                        ${(result.saldo_a_pagar > 0 ? result.saldo_a_pagar : result.saldo_a_favor).toLocaleString('es-CO')} COP
                      </div>
                    </div>
                    <div>
                      <span className="badge-uvt" style={{ fontSize: '12px' }}>
                        Tarifa: {(result.tarifa_renta_aplicada * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* TTD STATUS ALERT */}
                  {result.aplica_impuesto_adicional_ttd ? (
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', fontWeight: 700, marginBottom: '4px' }}>
                        <ShieldAlert size={16} />
                        Alerta TTD: Tasa Mínima del 15% Activada
                      </div>
                      <p style={{ color: '#78350f', fontSize: '12px', lineHeight: 1.4 }}>
                        La Tasa de Tributación Depurada ({ (result.ttd_calculada_pct * 100).toFixed(2) }%) es inferior al 15.00% legal. Se adicionó un <strong>Impuesto Adicional (IA) de ${result.impuesto_adicional_ttd.toLocaleString('es-CO')} COP</strong> según Art. 240 Parágrafo 6.
                      </p>
                    </div>
                  ) : (
                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px', fontSize: '12px', color: '#065f46', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={15} color="#059669" />
                      TTD ({ (result.ttd_calculada_pct * 100).toFixed(2) }%) cumple con el mínimo del 15%.
                    </div>
                  )}

                  {/* STEP BY STEP BREAKDOWN */}
                  <table className="breakdown-table">
                    <tbody>
                      <tr>
                        <td>Ingresos Fiscales Netos</td>
                        <td className="amount">${result.ingresos_netos.toLocaleString('es-CO')}</td>
                      </tr>
                      <tr>
                        <td>(-) Costos Fiscales Procedentes</td>
                        <td className="amount negative">-${inputs.costos_procedentes.toLocaleString('es-CO')}</td>
                      </tr>
                      <tr className="highlight">
                        <td>(=) Renta Bruta Fiscal</td>
                        <td className="amount">${result.renta_bruta.toLocaleString('es-CO')}</td>
                      </tr>
                      <tr>
                        <td>(-) Gastos Deducibles Procedentes</td>
                        <td className="amount negative">-${result.total_gastos_deducibles.toLocaleString('es-CO')}</td>
                      </tr>
                      <tr className="highlight">
                        <td>(=) Renta Líquida Ordinaria</td>
                        <td className="amount">${result.renta_liquida_ordinaria.toLocaleString('es-CO')}</td>
                      </tr>
                      <tr className="highlight" style={{ borderTop: '2px solid var(--primary-border)' }}>
                        <td>(=) Renta Líquida Gravable</td>
                        <td className="amount" style={{ color: 'var(--primary)' }}>
                          ${result.renta_liquida_gravable.toLocaleString('es-CO')}
                        </td>
                      </tr>
                      <tr>
                        <td>Impuesto Básico de Renta (35%)</td>
                        <td className="amount">${result.impuesto_basico_renta.toLocaleString('es-CO')}</td>
                      </tr>
                      {result.total_descuentos_tributarios_aplicados > 0 && (
                        <tr>
                          <td>(-) Descuentos Tributarios (ICA/Otros)</td>
                          <td className="amount negative">-${result.total_descuentos_tributarios_aplicados.toLocaleString('es-CO')}</td>
                        </tr>
                      )}
                      {result.impuesto_adicional_ttd > 0 && (
                        <tr>
                          <td style={{ color: '#b45309' }}>(+) Impuesto Adicional TTD (Tasa 15%)</td>
                          <td className="amount" style={{ color: '#b45309' }}>+${result.impuesto_adicional_ttd.toLocaleString('es-CO')}</td>
                        </tr>
                      )}
                      {result.impuesto_ganancias_ocasionales > 0 && (
                        <tr>
                          <td>(+) Impuesto Ganancias Ocasionales (15%)</td>
                          <td className="amount">+${result.impuesto_ganancias_ocasionales.toLocaleString('es-CO')}</td>
                        </tr>
                      )}
                      <tr className="highlight">
                        <td>(=) Impuesto Neto Total</td>
                        <td className="amount">${result.impuesto_neto_total.toLocaleString('es-CO')}</td>
                      </tr>
                      <tr>
                        <td>(-) Retenciones y Autorretenciones</td>
                        <td className="amount negative">-${result.total_retenciones_y_anticipos.toLocaleString('es-CO')}</td>
                      </tr>
                    </tbody>
                  </table>

                  <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => setIsAuditModalOpen(true)}
                  >
                    <Eye size={16} /> Ver Auditoría & Conciliación Fiscal
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
          title="Persona Jurídica (Formulario 110)"
          auditTrace={result.audit_trace}
        />
      )}
    </div>
  );
};
