import React, { useState, useEffect } from 'react';
import type { IvaProrrateoInput, IvaProrrateoOutput } from '../../../types/tax';
import { useApp } from '../../../context/AppContext';
import { calculateIvaProrrateo } from '../../../services/api';
import { formatCOP, parseCOP } from '../../../utils/formatters';

export const IvaProrrateoSubtab: React.FC = () => {
  const { taxYear, uvtValue } = useApp();

  const [inputs, setInputs] = useState<IvaProrrateoInput>({
    tax_year: taxYear,
    custom_uvt: uvtValue,
    ingresos_gravados_19: 60000000,
    ingresos_gravados_5: 0,
    ingresos_exentos_0: 20000000,
    ingresos_excluidos: 20000000,
    ingresos_no_gravados: 0,
    iva_comun_en_compras_gastos: 9500000,
  });

  const [result, setResult] = useState<IvaProrrateoOutput | null>(null);

  useEffect(() => {
    setInputs((prev) => ({ ...prev, tax_year: taxYear, custom_uvt: uvtValue }));
  }, [taxYear, uvtValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      runCalculation();
    }, 100);
    return () => clearTimeout(timer);
  }, [inputs]);

  const runCalculation = async () => {
    try {
      const res = await calculateIvaProrrateo(inputs);
      setResult(res);
    } catch (err) {
      console.error('Error calculando prorrateo IVA:', err);
    }
  };

  const handleNumChange = (field: keyof IvaProrrateoInput, valStr: string) => {
    const num = parseCOP(valStr);
    setInputs((prev) => ({ ...prev, [field]: num }));
  };

  return (
    <div className="module-pane active" id="pane-iva-prorrateo">
      <div className="calc-grid">
        {/* COLUMNA ENTRADAS */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">⚖️ Parámetros de Prorrateo de IVA Común (Art. 490 E.T.)</h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Gastos Indivisibles</span>
          </div>
          <div className="card-body">
            <div className="module-legal-alert" style={{ marginTop: 0, marginBottom: '16px' }}>
              Cuando una empresa realiza simultáneamente operaciones gravadas (19% o 5%), exentas (0%) y excluidas, el IVA pagado en costos y gastos comunes que no se puedan imputar directamente a unas u otras (arriendo, servicios, honorarios) debe <strong>prorratearse proporcionalmente</strong>.
            </div>

            <div className="form-section">
              <h3 className="section-title">Composición de Ingresos del Período</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">
                    <span>1. Ventas e Ingresos Gravados 19%</span>
                    <span className="input-helper">Dan derecho a descontable</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.ingresos_gravados_19, false)}
                      onChange={(e) => handleNumChange('ingresos_gravados_19', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">
                    <span>2. Ventas e Ingresos Gravados 5%</span>
                    <span className="input-helper">Dan derecho a descontable</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.ingresos_gravados_5, false)}
                      onChange={(e) => handleNumChange('ingresos_gravados_5', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">
                    <span>3. Ventas e Ingresos Exentos (0%)</span>
                    <span className="input-helper">Art. 477 / Exportaciones</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.ingresos_exentos_0, false)}
                      onChange={(e) => handleNumChange('ingresos_exentos_0', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">
                    <span>4. Ventas e Ingresos Excluidos</span>
                    <span className="input-helper">Art. 424 y 476 E.T.</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.ingresos_excluidos, false)}
                      onChange={(e) => handleNumChange('ingresos_excluidos', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">IVA en Costos y Gastos Comunes Indivisibles</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">
                    <span>5. IVA Pagado en Compras y Gastos Comunes</span>
                    <span className="input-helper">IVA soportado no imputable directamente</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      style={{ fontWeight: 800, color: 'var(--primary)' }}
                      value={formatCOP(inputs.iva_comun_en_compras_gastos, false)}
                      onChange={(e) => handleNumChange('iva_comun_en_compras_gastos', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA RESULTADOS STICKY */}
        <div className="card results-card sticky-card">
          <div className="card-header results-card-header">
            <h2 className="card-title">Resultado del Prorrateo</h2>
          </div>

          <div className="card-body">
            {result && (
              <>
                <div className="result-hero-box hero-blue">
                  <span className="result-hero-label">Factor de Prorrateo Aplicable</span>
                  <div className="result-hero-value">{result.factor_prorrateo_porcentaje}%</div>
                  <span className="result-hero-subtext">Proporción con derecho a descuento</span>
                </div>

                <div className="results-list">
                  <div className="result-row">
                    <span className="result-label">Ventas con Derecho (Grav + Exen):</span>
                    <span className="result-val">${formatCOP(result.total_ingresos_con_derecho, false)}</span>
                  </div>
                  <div className="result-row">
                    <span className="result-label">Total Ingresos Operacionales:</span>
                    <span className="result-val">${formatCOP(result.total_ingresos_operacionales, false)}</span>
                  </div>
                  <div className="result-row result-row-subtotal">
                    <span className="result-label">IVA Común a Distribuir:</span>
                    <span className="result-val">${formatCOP(inputs.iva_comun_en_compras_gastos, false)}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginTop: '12px' }}>
                  <div
                    style={{
                      background: 'rgba(22, 163, 74, 0.08)',
                      border: '1px solid rgba(22, 163, 74, 0.25)',
                      padding: '12px',
                      borderRadius: '8px',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', display: 'block' }}>
                      ✅ IVA Descontable F-300 (Casilla 90)
                    </span>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>
                      ${formatCOP(result.iva_descontable_aceptado_f300, false)}
                    </div>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                      Resta directamente del IVA a pagar en el período
                    </span>
                  </div>

                  <div
                    style={{
                      background: 'rgba(124, 58, 237, 0.08)',
                      border: '1px solid rgba(124, 58, 237, 0.25)',
                      padding: '12px',
                      borderRadius: '8px',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#6b21a8', display: 'block' }}>
                      📄 Mayor Costo en Renta (F-110 / F-210)
                    </span>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#7c3aed', marginTop: '4px' }}>
                      ${formatCOP(result.iva_rechazado_mayor_costo_renta, false)}
                    </div>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                      Deducible como gasto / costo en la Declaración de Renta
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
