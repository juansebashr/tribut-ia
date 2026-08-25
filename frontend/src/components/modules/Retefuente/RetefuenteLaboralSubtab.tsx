import React, { useState, useEffect } from 'react';
import type { RetefuenteLaboralInput, RetefuenteLaboralOutput } from '../../../types/tax';
import { useApp } from '../../../context/AppContext';
import { calculateRetefuenteLaboral } from '../../../services/api';
import { formatCOP, parseCOP } from '../../../utils/formatters';

export const RetefuenteLaboralSubtab: React.FC = () => {
  const { taxYear, uvtValue, showToast } = useApp();

  const [inputs, setInputs] = useState<RetefuenteLaboralInput>({
    tax_year: taxYear,
    custom_uvt: uvtValue,
    mes_nombre: 'Enero',
    salario_basico: 10000000,
    comisiones_horas_extras: 0,
    viaticos_gravados: 0,
    otros_pagos_laborales: 0,
    aporte_salud_obligatorio: 400000,
    aporte_pension_obligatorio: 400000,
    fondo_solidaridad_pensional: 100000,
    intereses_vivienda_mes: 800000,
    medicina_prepagada_mes: 400000,
    aplica_dependiente_10pct: true,
    numero_dependientes_adicionales_72uvt: 1,
    aportes_voluntarios_pension_afc: 500000,
    otras_rentas_exentas: 0,
    solicitar_25pct_exenta_laboral: true,
  });

  const [result, setResult] = useState<RetefuenteLaboralOutput | null>(null);

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
      const res = await calculateRetefuenteLaboral(inputs);
      setResult(res);
    } catch (err: any) {
      console.error('Error calculando retención laboral:', err);
    }
  };

  const handleNumChange = (field: keyof RetefuenteLaboralInput, valStr: string) => {
    const num = parseCOP(valStr);
    setInputs((prev) => ({ ...prev, [field]: num }));
  };

  const loadPresetIngresoMedio = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      mes_nombre: 'Enero',
      salario_basico: 6500000,
      comisiones_horas_extras: 0,
      viaticos_gravados: 0,
      otros_pagos_laborales: 0,
      aporte_salud_obligatorio: 260000,
      aporte_pension_obligatorio: 260000,
      fondo_solidaridad_pensional: 0,
      intereses_vivienda_mes: 0,
      medicina_prepagada_mes: 0,
      aplica_dependiente_10pct: false,
      numero_dependientes_adicionales_72uvt: 0,
      aportes_voluntarios_pension_afc: 0,
      otras_rentas_exentas: 0,
      solicitar_25pct_exenta_laboral: true,
    });
    showToast('✓ Preset Salario $6.5M cargado', 'info', 2000);
  };

  const loadPresetIngresoAlto = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      mes_nombre: 'Enero',
      salario_basico: 18000000,
      comisiones_horas_extras: 2000000,
      viaticos_gravados: 0,
      otros_pagos_laborales: 0,
      aporte_salud_obligatorio: 800000,
      aporte_pension_obligatorio: 800000,
      fondo_solidaridad_pensional: 200000,
      intereses_vivienda_mes: 2500000,
      medicina_prepagada_mes: 800000,
      aplica_dependiente_10pct: true,
      numero_dependientes_adicionales_72uvt: 2,
      aportes_voluntarios_pension_afc: 1500000,
      otras_rentas_exentas: 0,
      solicitar_25pct_exenta_laboral: true,
    });
    showToast('✓ Preset Salario Directivo $20M cargado', 'info', 2000);
  };

  const loadPresetMinimo = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      mes_nombre: 'Enero',
      salario_basico: 3500000,
      comisiones_horas_extras: 0,
      viaticos_gravados: 0,
      otros_pagos_laborales: 0,
      aporte_salud_obligatorio: 140000,
      aporte_pension_obligatorio: 140000,
      fondo_solidaridad_pensional: 0,
      intereses_vivienda_mes: 0,
      medicina_prepagada_mes: 0,
      aplica_dependiente_10pct: false,
      numero_dependientes_adicionales_72uvt: 0,
      aportes_voluntarios_pension_afc: 0,
      otras_rentas_exentas: 0,
      solicitar_25pct_exenta_laboral: true,
    });
    showToast('✓ Preset Salario Base ($3.5M sin retención) cargado', 'info', 2000);
  };

  const superaLimite = (result?.alivios_rechazados_por_limite ?? 0) > 0;

  return (
    <div id="pane-retefuente-laboral" className="module-pane active">
      {/* BARRA DE PRESETS ESTANDARIZADA */}
      <div className="presets-toolbar">
        <div className="presets-toolbar-group">
          <span className="presets-toolbar-label">⚡ Presets Salarios Nómina:</span>
          <button className="btn btn-outline btn-sm" onClick={loadPresetMinimo}>
            💵 Salario $3.5M (Exento)
          </button>
          <button className="btn btn-outline btn-sm" onClick={loadPresetIngresoMedio}>
            💼 Salario $6.5M (Profesional)
          </button>
          <button className="btn btn-outline btn-sm" onClick={loadPresetIngresoAlto}>
            🏢 Salario $20M (Directivo)
          </button>
        </div>
      </div>

      <div className="calc-grid">
        {/* COLUMNA FORMULARIO DE ENTRADA */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Depuración Mensual de Nómina (Procedimiento 1 - Arts. 383 &amp; 388 E.T.)</h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Retención mensual individual</span>
          </div>

          <div className="card-body">
            {/* PASO 1: INGRESOS LABORALES */}
            <div className="form-section">
              <h3 className="section-title">1. Total Ingresos Laborales del Mes</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Salario Básico Mensual</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.salario_basico, false)}
                      onChange={(e) => handleNumChange('salario_basico', e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label className="input-label">Comisiones, Bonificaciones y Horas Extras</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.comisiones_horas_extras ?? 0, false)}
                      onChange={(e) => handleNumChange('comisiones_horas_extras', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* PASO 2: APORTES OBLIGATORIOS (INCRGO) */}
            <div className="form-section">
              <h3 className="section-title">2. Aportes Obligatorios de Seguridad Social (INCRGO)</h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Aportes descontados al trabajador para Salud (4%), Pensión (4%) y Fondo de Solidaridad Pensional.
              </p>

              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Aporte Obligatorio a Salud (4%)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.aporte_salud_obligatorio ?? 0, false)}
                      onChange={(e) => handleNumChange('aporte_salud_obligatorio', e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label className="input-label">Aporte Obligatorio a Pensión (4%)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.aporte_pension_obligatorio ?? 0, false)}
                      onChange={(e) => handleNumChange('aporte_pension_obligatorio', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Fondo de Solidaridad Pensional (FSP)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.fondo_solidaridad_pensional ?? 0, false)}
                      onChange={(e) => handleNumChange('fondo_solidaridad_pensional', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* PASO 3: DEDUCCIONES IMPUTABLES */}
            <div className="form-section">
              <h3 className="section-title">3. Deducciones Imputables (Art. 387 E.T.)</h3>

              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">
                    Intereses de Vivienda / Leasing (Tope 100 UVT/mes)
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.intereses_vivienda_mes ?? 0, false)}
                      onChange={(e) => handleNumChange('intereses_vivienda_mes', e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label className="input-label">
                    Medicina Prepagada / Pólizas (Tope 16 UVT/mes)
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.medicina_prepagada_mes ?? 0, false)}
                      onChange={(e) => handleNumChange('medicina_prepagada_mes', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">
                    <input
                      type="checkbox"
                      checked={inputs.aplica_dependiente_10pct ?? false}
                      onChange={(e) => setInputs((prev) => ({ ...prev, aplica_dependiente_10pct: e.target.checked }))}
                      style={{ marginRight: '6px' }}
                    />
                    Deducción por Dependientes Tradicional (10%, máx 32 UVT/mes)
                  </label>
                </div>
                <div className="input-field">
                  <label className="input-label">
                    Dependientes Adicionales Ley 2277 (6 UVT/mes c/u, hasta 4)
                  </label>
                  <select
                    className="select-input"
                    value={inputs.numero_dependientes_adicionales_72uvt ?? 0}
                    onChange={(e) => setInputs((prev) => ({ ...prev, numero_dependientes_adicionales_72uvt: parseInt(e.target.value) }))}
                  >
                    <option value={0}>0 dependientes adicionales (0 UVT)</option>
                    <option value={1}>1 dependiente adicional (6 UVT/mes)</option>
                    <option value={2}>2 dependientes adicionales (12 UVT/mes)</option>
                    <option value={3}>3 dependientes adicionales (18 UVT/mes)</option>
                    <option value={4}>4 dependientes adicionales (24 UVT/mes)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* PASO 4: RENTAS EXENTAS Y 25% LABORAL */}
            <div className="form-section">
              <h3 className="section-title">4. Rentas Exentas y 25% Exenta Laboral</h3>

              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Aportes Voluntarios a Pensión / AFC (Art. 126-1/4)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.aportes_voluntarios_pension_afc ?? 0, false)}
                      onChange={(e) => handleNumChange('aportes_voluntarios_pension_afc', e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label className="input-label">
                    <input
                      type="checkbox"
                      checked={inputs.solicitar_25pct_exenta_laboral ?? true}
                      onChange={(e) => setInputs((prev) => ({ ...prev, solicitar_25pct_exenta_laboral: e.target.checked }))}
                      style={{ marginRight: '6px' }}
                    />
                    Renta Exenta Laboral 25% (Numeral 10 Art. 206, máx 65.83 UVT/mes)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESULTADOS */}
        <div className="card results-card sticky-card">
          <div className="card-header results-card-header">
            <h2 className="card-title" style={{ color: '#00594c' }}>
              🎯 Retención en la Fuente del Mes
            </h2>
            <span className="badge-uvt">UVT: ${formatCOP(uvtValue, false)}</span>
          </div>

          <div className="card-body">
            {/* RESULTADO PRINCIPAL */}
            <div
              style={{
                background: 'linear-gradient(135deg, #00594c 0%, #0f766e 100%)',
                color: '#ffffff',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0, 89, 76, 0.2)',
              }}
            >
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>
                Valor a Retener en Nómina
              </span>
              <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                ${formatCOP(result?.retencion_fuente_pesos ?? 0, false)}
              </div>
              <span style={{ fontSize: '12px', opacity: 0.9, marginTop: '2px', display: 'block', fontWeight: 700 }}>
                {((result?.retencion_fuente_pesos ?? 0) / (uvtValue || 49799)).toFixed(2)} UVT • Tasa Efectiva: {result?.porcentaje_efectivo_retencion.toFixed(2)}%
              </span>
            </div>

            {/* CONTROL DEL LÍMITE DEL 40% */}
            <div
              style={{
                padding: '12px',
                borderRadius: '6px',
                background: superaLimite ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                border: `1px solid ${superaLimite ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                marginBottom: '16px',
                fontSize: '11.5px',
              }}
            >
              <strong style={{ color: superaLimite ? '#dc2626' : '#059669', display: 'block', marginBottom: '2px' }}>
                {superaLimite ? '⚠️ Límite del 40% o 111.67 UVT Superado:' : '✅ Dentro del Límite del 40% / 111.67 UVT:'}
              </strong>
              {superaLimite
                ? `Alivios solicitados: $${formatCOP(result?.subtotal_alivios_antes_limite ?? 0, false)}. Aceptados bajo tope: $${formatCOP(result?.total_alivios_procedentes ?? 0, false)}.`
                : `Alivios procedentes: $${formatCOP(result?.total_alivios_procedentes ?? 0, false)} dentro del tope conjunto.`}
            </div>

            {/* DESGLOSE DETALLADO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '16px' }}>
              <div className="result-row">
                <span className="result-label">Total Ingresos Brutos:</span>
                <span className="result-val">${formatCOP(result?.total_ingresos_brutos_laborales ?? 0, false)}</span>
              </div>
              <div className="result-row">
                <span className="result-label">(-) INCRGO Seguridad Social:</span>
                <span className="result-val">${formatCOP(result?.total_incrngo_seguridad_social ?? 0, false)}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Ingreso Neto Laboral:</span>
                <span className="result-val">${formatCOP(result?.ingreso_laboral_neto ?? 0, false)}</span>
              </div>
              <div className="result-row">
                <span className="result-label">(-) Total Deducciones Aceptadas:</span>
                <span className="result-val">${formatCOP(result?.total_deducciones_aceptadas ?? 0, false)}</span>
              </div>
              <div className="result-row">
                <span className="result-label">(-) Total Rentas Exentas Aceptadas:</span>
                <span className="result-val">${formatCOP(result?.total_rentas_exentas_aceptadas ?? 0, false)}</span>
              </div>
              <div className="result-row" style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '6px' }}>
                <span className="result-label" style={{ fontWeight: 700 }}>Base Gravable Depurada ($ COP):</span>
                <span className="result-val" style={{ fontWeight: 800 }}>${formatCOP(result?.base_gravable_depurada_cop ?? 0, false)}</span>
              </div>
              <div className="result-row">
                <span className="result-label" style={{ fontWeight: 700 }}>Base Gravable en UVT:</span>
                <span className="result-val" style={{ fontWeight: 800, color: '#00594c' }}>{(result?.base_gravable_depurada_uvt ?? 0).toFixed(2)} UVT</span>
              </div>
              <div className="result-row">
                <span className="result-label">Rango Marginal Aplicable:</span>
                <span className="result-val" style={{ fontWeight: 700 }}>{result?.rango_tabla_art383}</span>
              </div>
            </div>

            {/* NOTA DIDÁCTICA */}
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', background: 'var(--bg-subtle)', padding: '8px', borderRadius: '6px' }}>
              💡 <strong>Base exenta de retención:</strong> Los primeros <strong>95 UVT</strong> de base gravable depurada tienen tarifa del <strong>0%</strong> (no generan retención).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
