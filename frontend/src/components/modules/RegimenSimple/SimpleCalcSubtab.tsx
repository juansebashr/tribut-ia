import React, { useState } from 'react';
import type { RegimenSimpleInput, RegimenSimpleOutput } from '../../../types/tax';
import { formatCOP, parseCOP } from '../../../utils/formatters';
import { TaxPdfReportModal, type TaxReportData } from '../../common/TaxPdfReportModal';

interface SimpleCalcSubtabProps {
  inputs: RegimenSimpleInput;
  setInputs: React.Dispatch<React.SetStateAction<RegimenSimpleInput>>;
  result: RegimenSimpleOutput | null;
  taxYear?: number;
  uvtValue?: number;
  onOpenAudit: () => void;
  onNavigateToF260: () => void;
  onNavigateToComparador: () => void;
  onNavigateToF2593: () => void;
  loadPresetGrupo1: () => void;
  loadPresetGrupo2: () => void;
  loadPresetGrupo3: () => void;
  loadPresetGrupo4: () => void;
  loadPresetGrupo5: () => void;
  loadPresetGrupo6: () => void;
}

export const SimpleCalcSubtab: React.FC<SimpleCalcSubtabProps> = ({
  inputs,
  setInputs,
  result,
  taxYear = 2025,
  uvtValue = 49799,
  onOpenAudit,
  onNavigateToF260,
  onNavigateToComparador,
  onNavigateToF2593,
  loadPresetGrupo1,
  loadPresetGrupo2,
  loadPresetGrupo3,
  loadPresetGrupo4,
  loadPresetGrupo5,
  loadPresetGrupo6,
}) => {
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  const handleNumChange = (field: keyof RegimenSimpleInput, valStr: string) => {
    const num = parseCOP(valStr);
    setInputs((prev) => ({ ...prev, [field]: num }));
  };

  const handleGrupoChange = (grupo: number) => {
    setInputs((prev) => ({ ...prev, grupo_actividad: grupo }));
  };

  const handleAnticipoSimpleChange = (index: number, valStr: string) => {
    const num = parseCOP(valStr);
    setInputs((prev) => {
      const current = [...(prev.anticipos_simple_pagados || [0, 0, 0, 0, 0, 0])];
      current[index] = num;
      return { ...prev, anticipos_simple_pagados: current };
    });
  };

  const handleAnticipoIncChange = (index: number, valStr: string) => {
    const num = parseCOP(valStr);
    setInputs((prev) => {
      const current = [...(prev.anticipos_inc_pagados || [0, 0, 0, 0, 0, 0])];
      current[index] = num;
      return { ...prev, anticipos_inc_pagados: current };
    });
  };

  const simpleReportData: TaxReportData | null = result
    ? {
        moduleType: 'simple',
        title: 'DICTAMEN FISCAL RÉGIMEN SIMPLE DE TRIBUTACIÓN (FORMULARIO 260)',
        formName: 'Formulario 260',
        taxYear: taxYear,
        uvtValue: uvtValue,
        contributorName: inputs.razon_social_o_nombre || 'CONTRIBUYENTE SIMPLE',
        contributorId: inputs.nit ? `NIT ${inputs.nit}-${inputs.dv || '0'}` : undefined,
        regimeType: `Régimen SIMPLE - Grupo ${inputs.grupo_actividad} (Art. 908 E.T.)`,
        mainKpiLabel:
          result.saldo_a_pagar_simple > 0
            ? 'Saldo Final a Pagar a la DIAN (Casilla 60)'
            : 'Saldo Final a Favor en el SIMPLE (Casilla 61)',
        mainKpiValue: result.saldo_a_pagar_simple > 0 ? result.saldo_a_pagar_simple : result.saldo_a_favor_simple,
        isPayable: result.saldo_a_pagar_simple > 0,
        metrics: [
          { label: 'Tarifa Consolidada SIMPLE', value: `${(result.tarifa_simple_consolidada_pct || 0).toFixed(2)}%` },
          { label: 'Ingresos Gravables UVT', value: `${(result.ingresos_en_uvt || 0).toFixed(0)} UVT` },
          { label: 'Impuesto Neto SIMPLE', value: `$${formatCOP(result.impuesto_neto_simple, false)}` },
        ],
        depurationRows: [
          { label: 'Total Ingresos Brutos del Régimen SIMPLE', value: `$${formatCOP(result.ingresos_brutos_totales, false)}`, isHeader: true },
          { label: '(-) Ingresos No Constitutivos de Renta (INCRNGO)', value: `-$${formatCOP(inputs.ingresos_no_constitutivos_renta || 0, false)}`, isNegative: true },
          { label: '(=) Base Gravable Consolidada SIMPLE (Casilla 42)', value: `$${formatCOP(result.ingresos_gravables_simple, false)}`, isBold: true },
          { label: '(=) Impuesto SIMPLE Consolidado (Casilla 46)', value: `$${formatCOP(result.impuesto_simple_consolidado, false)}`, isBold: true },
          { label: '(-) Componente ICA Territorial Consolidado (Casilla 47)', value: `-$${formatCOP(result.componente_ica_territorial, false)}` },
          { label: '(=) Componente SIMPLE Nacional (Casilla 48)', value: `$${formatCOP(result.componente_simple_nacional, false)}`, bg: '#f1f5f9' },
          { label: '(-) Descuento Pensión Empleador (Art. 903 E.T.) (Casilla 49)', value: `-$${formatCOP(result.descuento_pension_empleador, false)}`, isNegative: true },
          { label: '(-) Descuento 0.5% Medios Electrónicos (Casilla 50)', value: `-$${formatCOP(result.descuento_medios_electronicos_0_5pct, false)}`, isNegative: true },
          { label: '(=) Impuesto Neto SIMPLE Nacional (Casilla 53)', value: `$${formatCOP(result.impuesto_neto_simple, false)}`, isBold: true, bg: '#eff6ff' },
          { label: '(+) Impuesto Nacional al Consumo INC 8% (Casilla 70)', value: `+$${formatCOP(result.impuesto_inc_comidas_bebidas, false)}` },
          { label: '(-) Total Anticipos Bimestrales Pagados F-2593 (Casilla 56)', value: `-$${formatCOP(result.total_anticipos_simple_pagados, false)}`, isNegative: true },
        ],
        keyBoxes: [
          { box: '42', label: 'Base Gravable SIMPLE', value: `$${formatCOP(result.ingresos_gravables_simple, false)}` },
          { box: '47', label: 'Componente ICA', value: `$${formatCOP(result.componente_ica_territorial, false)}` },
          { box: '48', label: 'SIMPLE Nacional', value: `$${formatCOP(result.componente_simple_nacional, false)}` },
          { box: '53', label: 'Impuesto Neto', value: `$${formatCOP(result.impuesto_neto_simple, false)}` },
          { box: '56', label: 'Anticipos Pagados', value: `$${formatCOP(result.total_anticipos_simple_pagados, false)}` },
          { box: '60/61', label: 'Saldo Final F-260', value: `$${formatCOP(result.saldo_a_pagar_simple > 0 ? result.saldo_a_pagar_simple : result.saldo_a_favor_simple, false)}` },
        ],
      }
    : null;

  return (
    <div id="pane-simple-calc" className="module-pane active">
      <TaxPdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        report={simpleReportData}
      />
      {/* BARRA DE PRESETS ESTANDARIZADA */}
      <div className="presets-toolbar">
        <div className="presets-toolbar-group">
          <span className="presets-toolbar-label">⚡ Presets de 1 Clic:</span>
          <button className="btn btn-outline btn-sm" onClick={loadPresetGrupo1}>
            🏪 G1: Tienda / Peluquería
          </button>
          <button className="btn btn-outline btn-sm" onClick={loadPresetGrupo2}>
            📦 G2: Comercio / Industria
          </button>
          <button className="btn btn-outline btn-sm" onClick={loadPresetGrupo3}>
            🍽️ G3: Restaurante / INC 8%
          </button>
          <button className="btn btn-outline btn-sm" onClick={loadPresetGrupo4}>
            🎓 G4: Educación / Salud
          </button>
          <button className="btn btn-outline btn-sm" onClick={loadPresetGrupo5}>
            💼 G5: Profesionales
          </button>
          <button className="btn btn-outline btn-sm" onClick={loadPresetGrupo6}>
            ♻️ G6: Reciclaje
          </button>
        </div>
        <div className="presets-toolbar-actions">
          <button
            className="btn btn-export-outline btn-sm"
            onClick={() => setIsPdfModalOpen(true)}
            title="Generar dictamen ejecutivo formal para imprimir o guardar en PDF"
          >
            <span>📄</span> Dictamen PDF <span className="export-badge">PDF</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onNavigateToComparador}>
            ⚖️ Comparador Ordinario vs SIMPLE
          </button>
          <button className="btn btn-primary btn-sm" onClick={onNavigateToF260}>
            📋 Ver Formulario 260 DIAN
          </button>
        </div>
      </div>

      <div className="calc-grid">
        {/* COLUMNA FORMULARIO DE ENTRADA */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Declaración Anual Consolidada SIMPLE (Formulario 260)</h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cálculo reactivo con UVT dinámica</span>
          </div>

          <div className="card-body">
            {/* SELECCIÓN DE GRUPO DE ACTIVIDAD */}
            <div className="form-section">
              <h3 className="section-title">1. Grupo de Actividad Económica (Art. 908 E.T.)</h3>
              <div className="input-field">
                <select
                  className="select-input"
                  value={inputs.grupo_actividad}
                  onChange={(e) => handleGrupoChange(parseInt(e.target.value))}
                >
                  <option value={1}>Grupo 1: Tiendas pequeñas, minimercados, micromercados y peluquerías (1.2% - 5.6%)</option>
                  <option value={2}>Grupo 2: Actividades comerciales, industriales y servicios técnicos (1.6% - 4.5%)</option>
                  <option value={3}>Grupo 3: Expendio de comidas y bebidas, y actividades de transporte (1.6% - 4.5% + INC 8%)</option>
                  <option value={4}>Grupo 4: Educación y actividades de salud humana y asistencia social (3.7% - 5.9%)</option>
                  <option value={5}>Grupo 5: Servicios profesionales, consultoría y profesiones liberales (7.3% - 12.0% / Tope 12.000 UVT)</option>
                  <option value={6}>Grupo 6: Reciclaje y recuperación de materiales (Tarifa fija reducida 1.62%)</option>
                </select>
              </div>
            </div>

            {/* IDENTIFICACIÓN Y PATRIMONIO */}
            <div className="form-section">
              <h3 className="section-title">2. Identificación y Patrimonio (Casillas 28 a 30)</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Razón Social o Nombre Completo</label>
                  <input
                    type="text"
                    className="text-input"
                    value={inputs.razon_social_o_nombre}
                    onChange={(e) => setInputs((prev) => ({ ...prev, razon_social_o_nombre: e.target.value }))}
                  />
                </div>
                <div className="input-field">
                  <label className="input-label">NIT / Cédula</label>
                  <input
                    type="text"
                    className="text-input"
                    value={inputs.nit}
                    onChange={(e) => setInputs((prev) => ({ ...prev, nit: e.target.value }))}
                  />
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Total Patrimonio Bruto (c28)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.patrimonio_bruto, false)}
                      onChange={(e) => handleNumChange('patrimonio_bruto', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Total Pasivos / Deudas (c29)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.pasivos, false)}
                      onChange={(e) => handleNumChange('pasivos', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* INGRESOS BRUTOS */}
            <div className="form-section">
              <h3 className="section-title">3. Ingresos Brutos del Año (Casillas 31 a 45)</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Ingresos Brutos en el País</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.ingresos_brutos_nacionales, false)}
                      onChange={(e) => handleNumChange('ingresos_brutos_nacionales', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Ingresos Brutos del Exterior</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.ingresos_brutos_exterior, false)}
                      onChange={(e) => handleNumChange('ingresos_brutos_exterior', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Ingresos No Constitutivos de Renta (c44)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.ingresos_no_constitutivos_renta, false)}
                      onChange={(e) => handleNumChange('ingresos_no_constitutivos_renta', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Tarifa ICA Municipal Consolidada (por mil)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">‰</span>
                    <input
                      type="number"
                      step="0.5"
                      className="text-input"
                      value={inputs.tarifa_ica_consolidada_x_mil}
                      onChange={(e) => setInputs((prev) => ({ ...prev, tarifa_ica_consolidada_x_mil: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <span className="input-help">Tarifa ICA unificada distrital/municipal (ej. 7 por mil).</span>
                </div>
              </div>
            </div>

            {/* DESCUENTOS TRIBUTARIOS DEL SIMPLE */}
            <div className="form-section">
              <h3 className="section-title">4. Descuentos Tributarios Directos (Casillas 49 a 52)</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Aportes Pensión Empleador (100% Descuento - Art. 903)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.aportes_pension_empleador_ano, false)}
                      onChange={(e) => handleNumChange('aportes_pension_empleador_ano', e.target.value)}
                    />
                  </div>
                  <span className="input-help">Aportes obligatorios pagados por el empleador (12%).</span>
                </div>

                <div className="input-field">
                  <label className="input-label">Ventas con Tarjetas / Medios Electrónicos (Art. 912)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.ventas_por_medios_electronicos, false)}
                      onChange={(e) => handleNumChange('ventas_por_medios_electronicos', e.target.value)}
                    />
                  </div>
                  <span className="input-help">Descuento automático del <strong>0.5%</strong> sobre estas ventas.</span>
                </div>
              </div>
            </div>

            {/* SECCIÓN ESPECIAL: IMPUESTO AL CONSUMO (GRUPO 3) */}
            {inputs.grupo_actividad === 3 && (
              <div className="form-section" style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '12px', borderRadius: '6px' }}>
                <h3 className="section-title" style={{ color: '#d97706' }}>
                  🍽️ Impuesto Nacional al Consumo (INC 8% - Casillas 69 a 79)
                </h3>
                <div className="input-field">
                  <label className="input-label">Ingresos por Servicio de Comidas y Bebidas Preparadas (c69)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.ingresos_servicio_comidas_bebidas, false)}
                      onChange={(e) => handleNumChange('ingresos_servicio_comidas_bebidas', e.target.value)}
                    />
                  </div>
                  <span className="input-help">Genera el 8% de INC integrado en la declaración anual.</span>
                </div>
              </div>
            )}

            {/* ANTICIPOS BIMESTRALES PAGADOS */}
            <div className="form-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 className="section-title" style={{ margin: 0 }}>
                  5. Anticipos Bimestrales Pagados en el Año (Formulario 2593)
                </h3>
                <button className="btn btn-outline btn-xs" onClick={onNavigateToF2593}>
                  📅 Ver Calendario F-2593
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                {['Bim 1 (Ene-Feb)', 'Bim 2 (Mar-Abr)', 'Bim 3 (May-Jun)', 'Bim 4 (Jul-Ago)', 'Bim 5 (Sep-Oct)', 'Bim 6 (Nov-Dic)'].map((bimLabel, idx) => (
                  <div key={idx} className="input-field">
                    <label className="input-label" style={{ fontSize: '10.5px' }}>{bimLabel}</label>
                    <div className="input-wrapper">
                      <span className="input-prefix" style={{ fontSize: '11px' }}>$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="currency-input"
                        style={{ fontSize: '11.5px', padding: '4px 6px 4px 18px' }}
                        value={formatCOP(inputs.anticipos_simple_pagados?.[idx] ?? 0, false)}
                        onChange={(e) => handleAnticipoSimpleChange(idx, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {inputs.grupo_actividad === 3 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#d97706', marginBottom: '6px' }}>
                    Anticipos INC Bimestrales Pagados (Comidas y Bebidas F-2593):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                    {['Bim 1 INC', 'Bim 2 INC', 'Bim 3 INC', 'Bim 4 INC', 'Bim 5 INC', 'Bim 6 INC'].map((bimLabel, idx) => (
                      <div key={idx} className="input-field">
                        <label className="input-label" style={{ fontSize: '10px' }}>{bimLabel}</label>
                        <div className="input-wrapper">
                          <span className="input-prefix" style={{ fontSize: '11px' }}>$</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            className="currency-input"
                            style={{ fontSize: '11px', padding: '4px 6px 4px 18px' }}
                            value={formatCOP(inputs.anticipos_inc_pagados?.[idx] ?? 0, false)}
                            onChange={(e) => handleAnticipoIncChange(idx, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESULTADOS EN TIEMPO REAL */}
        <div className="card results-card sticky-card">
          <div className="card-header results-card-header">
            <h2 className="card-title">Liquidación Privada F-260</h2>
            <button className="btn btn-outline btn-xs" onClick={onOpenAudit}>
              🔍 Memoria Fiscal
            </button>
          </div>

          <div className="card-body">
            {result ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* SALDO PRINCIPAL A PAGAR / A FAVOR */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    background: result.gran_total_saldo_a_pagar > 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                    border: `1px solid ${result.gran_total_saldo_a_pagar > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {result.gran_total_saldo_a_pagar > 0 ? 'TOTAL SALDO A PAGAR (Casilla 980)' : 'TOTAL SALDO A FAVOR CONSOLIDADO'}
                  </span>
                  <div
                    style={{
                      fontSize: '26px',
                      fontWeight: 900,
                      color: result.gran_total_saldo_a_pagar > 0 ? '#ef4444' : '#10b981',
                      marginTop: '4px',
                    }}
                  >
                    ${formatCOP(result.gran_total_saldo_a_pagar > 0 ? result.gran_total_saldo_a_pagar : result.gran_total_saldo_a_favor, false)}
                  </div>
                </div>

                {/* KPI METRICS */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ padding: '10px', background: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Ingresos en UVT</div>
                    <div style={{ fontSize: '14px', fontWeight: 800 }}>
                      {result.ingresos_en_uvt.toLocaleString('es-CO', { maximumFractionDigits: 1 })} UVT
                    </div>
                  </div>

                  <div style={{ padding: '10px', background: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Tarifa Consolidada</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)' }}>
                      {result.tarifa_simple_consolidada_pct.toFixed(2)}%
                    </div>
                  </div>

                  <div style={{ padding: '10px', background: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Impuesto Consolidado</div>
                    <div style={{ fontSize: '14px', fontWeight: 800 }}>${formatCOP(result.impuesto_simple_consolidado, false)}</div>
                  </div>

                  <div style={{ padding: '10px', background: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Descuentos Aplicados</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#10b981' }}>
                      -${formatCOP(result.total_descuentos_aplicados, false)}
                    </div>
                  </div>
                </div>

                {/* COMPONENTES NACIONAL VS ICA */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Componente SIMPLE Nacional (c48):</span>
                    <span style={{ fontWeight: 700 }}>${formatCOP(result.componente_simple_nacional, false)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Componente ICA Municipal (c47):</span>
                    <span style={{ fontWeight: 700 }}>${formatCOP(result.componente_ica_territorial, false)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Impuesto Neto SIMPLE (c53):</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>${formatCOP(result.impuesto_neto_simple, false)}</span>
                  </div>
                  {result.impuesto_inc_comidas_bebidas > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#d97706' }}>Impuesto Consumo INC 8% (c70):</span>
                      <span style={{ fontWeight: 700, color: '#d97706' }}>+${formatCOP(result.impuesto_inc_comidas_bebidas, false)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Anticipos Pagados (c56):</span>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>-${formatCOP(result.total_anticipos_simple_pagados, false)}</span>
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN Y EXPORTACIÓN */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={onOpenAudit}>
                    🔍 Auditoría Legal
                  </button>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={onNavigateToF260}>
                    📋 Ver F260 DIAN Real
                  </button>
                </div>

                {/* CTA PRIMARIO DESTACADO: DESCARGA DE DICTAMEN PDF */}
                <div className="results-export-cta">
                  <button
                    id="btn-simple-export-pdf"
                    className="btn-export-primary"
                    onClick={() => setIsPdfModalOpen(true)}
                    title="Generar y descargar dictamen formal con membrete para imprimir o guardar en PDF"
                  >
                    <span>📄</span> Descargar Dictamen Ejecutivo SIMPLE (PDF)
                  </button>
                </div>

                <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', margin: '8px 0 0 0' }}>
                  {result.resumen_ejecutivo}
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                Calculando liquidación Régimen Simple...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
