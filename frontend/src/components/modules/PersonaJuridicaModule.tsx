import React, { useState, useEffect } from 'react';
import type { PersonaJuridicaInput, PersonaJuridicaOutput } from '../../types/tax';
import { calculatePersonaJuridica } from '../../services/api';
import { formatCOP, parseCOP } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const PersonaJuridicaModule: React.FC = () => {
  const { taxYear, uvtValue } = useApp();

  const [formData, setFormData] = useState<PersonaJuridicaInput>({
    tax_year: taxYear,
    custom_uvt: uvtValue,
    tarifa_personalizada: undefined,
    ingresos_brutos_operacionales: 1250000000,
    ingresos_brutos_no_operacionales: 45000000,
    devoluciones_rebajas_descuentos: 15000000,
    ingresos_no_constitutivos_renta: 30000000,
    costos_procedentes: 620000000,
    gastos_administracion: 180000000,
    gastos_ventas: 95000000,
    gastos_financieros: 25000000,
    gastos_no_deducibles: 18000000,
    deducciones_especiales: 12000000,
    rentas_exentas: 0,
    compensacion_perdidas_fiscales: 0,
    compensacion_exceso_renta_presuntiva: 0,
    utilidad_contable_antes_impuestos: 350000000,
    diferencias_permanentes_ttd: 15000000,
    ganancia_ocasional_gravable: 0,
    descuento_tributario_ica: 8500000,
    otros_descuentos_tributarios: 0,
    retenciones_en_la_fuente: 42000000,
    autorretenciones_practicadas: 18500000,
    anticipo_ano_anterior: 28000000,
    saldo_a_favor_ano_anterior: 0,
  });

  const [result, setResult] = useState<PersonaJuridicaOutput | null>(null);
  const [activeSection, setActiveSection] = useState<'ingresos' | 'costos' | 'ttd' | 'descuentos' | 'retenciones'>('ingresos');

  useEffect(() => {
    runCalculation();
  }, [formData, taxYear, uvtValue]);

  const runCalculation = async () => {
    try {
      const payload: PersonaJuridicaInput = {
        ...formData,
        tax_year: taxYear,
        custom_uvt: uvtValue,
      };
      const res = await calculatePersonaJuridica(payload);
      setResult(res);
    } catch (err) {
      console.warn('Error calculating PJ:', err);
    }
  };

  const handleInputChange = (field: keyof PersonaJuridicaInput, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderCurrencyField = (
    label: string,
    field: keyof PersonaJuridicaInput,
    helpText?: string
  ) => {
    const val = (formData[field] as number) || 0;
    return (
      <div className="input-field" style={{ marginBottom: '12px' }}>
        <label className="input-label">{label}</label>
        <div className="input-wrapper">
          <span className="input-prefix">$</span>
          <input
            type="text"
            inputMode="numeric"
            className="currency-input"
            value={formatCOP(val, false)}
            onChange={(e) => handleInputChange(field, parseCOP(e.target.value))}
          />
        </div>
        {helpText && <span className="input-help">{helpText}</span>}
      </div>
    );
  };

  return (
    <div id="pane-pj" className="module-pane active">
      {/* HEADER EXPLICATIVO */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          🏢 Liquidación Persona Jurídica (Formulario 110 - DIAN)
        </h2>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
          Depuración de Renta Ordinaria a tarifa general (35%), verificación obligatoria de Tasa de Tributación Depurada
          (TTD mínima del 15% - Art. 240 Parágrafo 6) y descuentos tributarios.
        </p>
      </div>

      <div className="responsive-grid-split" style={{ alignItems: 'start' }}>
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="card" style={{ border: '2px solid var(--primary-border)' }}>
          <div className="card-header" style={{ background: 'var(--primary-light)' }}>
            <div className="card-title" style={{ color: 'var(--primary)', fontSize: '14px' }}>
              Parámetros de Depuración Fiscal F-110
            </div>
          </div>

          <div className="card-body">
            {/* SUB-PESTAÑAS DE SECCIÓN */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <button
                className={`btn btn-xs ${activeSection === 'ingresos' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveSection('ingresos')}
              >
                1. Ingresos
              </button>
              <button
                className={`btn btn-xs ${activeSection === 'costos' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveSection('costos')}
              >
                2. Costos &amp; Gastos
              </button>
              <button
                className={`btn btn-xs ${activeSection === 'ttd' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveSection('ttd')}
              >
                3. TTD (15%) &amp; Conciliación
              </button>
              <button
                className={`btn btn-xs ${activeSection === 'descuentos' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveSection('descuentos')}
              >
                4. Descuentos
              </button>
              <button
                className={`btn btn-xs ${activeSection === 'retenciones' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveSection('retenciones')}
              >
                5. Retenciones &amp; Anticipos
              </button>
            </div>

            {/* SECCIÓN 1: INGRESOS */}
            {activeSection === 'ingresos' && (
              <div>
                {renderCurrencyField(
                  'Ingresos Brutos Operacionales ($ COP)',
                  'ingresos_brutos_operacionales',
                  'Ventas netas de bienes o prestación de servicios de la actividad principal'
                )}
                {renderCurrencyField(
                  'Ingresos Brutos No Operacionales ($ COP)',
                  'ingresos_brutos_no_operacionales',
                  'Rendimientos financieros, dividendos u otros ingresos extraordinarios'
                )}
                {renderCurrencyField(
                  'Devoluciones, Rebajas y Descuentos ($ COP)',
                  'devoluciones_rebajas_descuentos',
                  'Devoluciones en ventas documentadas con notas crédito'
                )}
                {renderCurrencyField(
                  'Ingresos No Constitutivos de Renta ($ COP)',
                  'ingresos_no_constitutivos_renta',
                  'INCRNGO: dividendos no gravados (Art. 48/49), capitalizaciones, etc.'
                )}
              </div>
            )}

            {/* SECCIÓN 2: COSTOS Y GASTOS */}
            {activeSection === 'costos' && (
              <div>
                {renderCurrencyField(
                  'Costos Procedentes de Ventas / Servicios ($ COP)',
                  'costos_procedentes',
                  'Costos directamente asociados a la producción o adquisición de bienes'
                )}
                {renderCurrencyField(
                  'Gastos de Administración ($ COP)',
                  'gastos_administracion',
                  'Nómina administrativa, arriendos, servicios públicos y honorarios'
                )}
                {renderCurrencyField(
                  'Gastos de Ventas y Distribución ($ COP)',
                  'gastos_ventas',
                  'Publicidad, comisiones comerciales, logística y transporte'
                )}
                {renderCurrencyField(
                  'Gastos Financieros ($ COP)',
                  'gastos_financieros',
                  'Intereses sobre créditos bancarios, comisiones bancarias'
                )}
              </div>
            )}

            {/* SECCIÓN 3: TTD Y CONCILIACIÓN */}
            {activeSection === 'ttd' && (
              <div>
                {renderCurrencyField(
                  'Utilidad Contable Antes de Impuestos (UC) ($ COP)',
                  'utilidad_contable_antes_impuestos',
                  'Utilidad según Estado de Resultados bajo NIIF (necesaria para TTD)'
                )}
                {renderCurrencyField(
                  'Diferencias Permanentes que Aumentan la Renta ($ COP)',
                  'diferencias_permanentes_ttd',
                  'Gastos no deducibles por falta de soportes electrónicos o retenciones'
                )}
                {renderCurrencyField(
                  'Deducciones Especiales con Beneficio ($ COP)',
                  'deducciones_especiales',
                  'Primer empleo, deducción ambiental, becas de estudio (Art. 107-2)'
                )}
                {renderCurrencyField(
                  'Compensación Pérdidas Fiscales Años Anteriores ($ COP)',
                  'compensacion_perdidas_fiscales',
                  'Pérdidas compensables según Art. 147 E.T.'
                )}
              </div>
            )}

            {/* SECCIÓN 4: DESCUENTOS TRIBUTARIOS */}
            {activeSection === 'descuentos' && (
              <div>
                {renderCurrencyField(
                  'Descuento Tributario ICA Pagado (50%) ($ COP)',
                  'descuento_tributario_ica',
                  'Art. 115 E.T.: 50% del ICA efectivamente pagado durante el año gravable'
                )}
                {renderCurrencyField(
                  'Otros Descuentos Tributarios ($ COP)',
                  'otros_descuentos_tributarios',
                  'Donaciones a ESAL (Art. 257) e impuestos pagados en el exterior (Art. 254)'
                )}
                {renderCurrencyField(
                  'Ganancia Ocasional Gravable ($ COP)',
                  'ganancia_ocasional_gravable',
                  'Utilidad en venta de activos fijos poseídos más de 2 años (Tarifa 15%)'
                )}
              </div>
            )}

            {/* SECCIÓN 5: RETENCIONES Y ANTICIPOS */}
            {activeSection === 'retenciones' && (
              <div>
                {renderCurrencyField(
                  'Retenciones en la Fuente que le Practicaron ($ COP)',
                  'retenciones_en_la_fuente',
                  'Retenciones practicadas por clientes soportadas con certificados'
                )}
                {renderCurrencyField(
                  'Autorretenciones Especiales de Renta Practicadas ($ COP)',
                  'autorretenciones_practicadas',
                  'Decreto 2201 de 2016 pagadas en Formulario 350'
                )}
                {renderCurrencyField(
                  'Anticipo de Renta Liquidado Año Anterior ($ COP)',
                  'anticipo_ano_anterior',
                  'Casilla de anticipo de la declaración del año inmediatamente anterior'
                )}
                {renderCurrencyField(
                  'Saldo a Favor del Año Anterior ($ COP)',
                  'saldo_a_favor_ano_anterior',
                  'Saldo a favor de la declaración previa no solicitado en devolución'
                )}
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: RESULTADO EN VIVO & TTD */}
        <div className="card" style={{ border: '2px solid var(--emerald-border)' }}>
          <div className="card-header" style={{ background: 'var(--emerald-light)' }}>
            <div className="card-title" style={{ color: 'var(--emerald)', fontSize: '14px' }}>
              Liquidación Formulario 110 &amp; Auditoría TTD (15%)
            </div>
          </div>

          <div className="card-body">
            {result ? (
              <div>
                {/* SALDO A PAGAR / FAVOR PRINCIPAL */}
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '14px',
                    marginBottom: '14px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                    {result.saldo_a_pagar > 0 ? 'SALDO A PAGAR (CASILLA 98 / F-110)' : 'SALDO A FAVOR'}
                  </div>
                  <div
                    id="pj-kpi-value"
                    style={{
                      fontSize: '24px',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      color: result.saldo_a_pagar > 0 ? '#15803d' : '#0284c7',
                      margin: '4px 0',
                    }}
                  >
                    {formatCOP(result.saldo_a_pagar > 0 ? result.saldo_a_pagar : result.saldo_a_favor)} COP
                  </div>
                  <div style={{ fontSize: '11px', color: '#166534' }}>
                    Tarifa Nominal Aplicada: <strong>{(result.tarifa_renta_aplicada * 100).toFixed(0)}%</strong>
                  </div>
                </div>

                {/* ALERT BOX TTD 15% */}
                <div
                  id="pj-ttd-alert"
                  style={{
                    background: result.aplica_impuesto_adicional_ttd ? '#fef2f2' : '#f0fdf4',
                    border: `1.5px solid ${result.aplica_impuesto_adicional_ttd ? '#fca5a5' : '#86efac'}`,
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '14px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: '12px',
                        color: result.aplica_impuesto_adicional_ttd ? '#991b1b' : '#166534',
                      }}
                    >
                      {result.aplica_impuesto_adicional_ttd ? '⚠️ AJUSTE REQUERIDO: TTD < 15%' : '✓ TTD CONFORME (≥ 15%)'}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        fontSize: '13px',
                        color: result.aplica_impuesto_adicional_ttd ? '#b91c1c' : '#15803d',
                      }}
                    >
                      TTD: {result.ttd_calculada_pct.toFixed(2)}%
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '11.5px',
                      color: result.aplica_impuesto_adicional_ttd ? '#7f1d1d' : '#14532d',
                      margin: 0,
                    }}
                  >
                    {result.aplica_impuesto_adicional_ttd
                      ? `Se adiciona un impuesto de ${formatCOP(result.impuesto_adicional_ttd)} COP para cumplir con la Tasa de Tributación Depurada mínima legal del 15% (Art. 240 Par. 6).`
                      : 'La tasa de tributación depurada de la sociedad supera el mínimo legal del 15%. No requiere impuesto adicional.'}
                  </p>
                </div>

                {/* TABLA DE DEPURACIÓN FISCAL */}
                <table className="breakdown-table" style={{ fontSize: '11.5px', width: '100%' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '5px 0', color: '#64748b' }}>Ingresos Netos Ordinarios:</td>
                      <td style={{ padding: '5px 0', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        {formatCOP(result.ingresos_netos)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 0', color: '#64748b' }}>Renta Bruta:</td>
                      <td style={{ padding: '5px 0', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        {formatCOP(result.renta_bruta)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 0', color: '#64748b' }}>Total Gastos Deducibles:</td>
                      <td style={{ padding: '5px 0', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        -{formatCOP(result.total_gastos_deducibles)}
                      </td>
                    </tr>
                    <tr style={{ borderTop: '1px solid #cbd5e1', fontWeight: 700 }}>
                      <td style={{ padding: '5px 0', color: '#0b3b60' }}>Renta Líquida Gravable:</td>
                      <td style={{ padding: '5px 0', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#0b3b60' }}>
                        {formatCOP(result.renta_liquida_gravable)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 0', color: '#64748b' }}>Impuesto Básico de Renta (35%):</td>
                      <td style={{ padding: '5px 0', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        {formatCOP(result.impuesto_basico_renta)}
                      </td>
                    </tr>
                    {result.impuesto_adicional_ttd > 0 && (
                      <tr>
                        <td style={{ padding: '5px 0', color: '#b91c1c', fontWeight: 600 }}>
                          (+) Impuesto Adicional TTD (15%):
                        </td>
                        <td style={{ padding: '5px 0', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#b91c1c' }}>
                          +{formatCOP(result.impuesto_adicional_ttd)}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ padding: '5px 0', color: '#64748b' }}>(-) Descuentos Tributarios:</td>
                      <td style={{ padding: '5px 0', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#059669' }}>
                        -{formatCOP(result.total_descuentos_tributarios_aplicados)}
                      </td>
                    </tr>
                    <tr style={{ borderTop: '1px solid #cbd5e1', fontWeight: 800 }}>
                      <td style={{ padding: '5px 0', color: '#0b3b60' }}>Impuesto Neto Total:</td>
                      <td style={{ padding: '5px 0', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#0b3b60' }}>
                        {formatCOP(result.impuesto_neto_total)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 0', color: '#64748b' }}>(-) Retenciones y Anticipos:</td>
                      <td style={{ padding: '5px 0', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#059669' }}>
                        -{formatCOP(result.total_retenciones_y_anticipos)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                Calculando liquidación Persona Jurídica...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
