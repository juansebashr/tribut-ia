import React, { useState } from 'react';
import type { PersonaJuridicaInput, PersonaJuridicaOutput } from '../../../types/tax';
import { formatCOP, parseCOP } from '../../../utils/formatters';
import { TaxPdfReportModal, type TaxReportData } from '../../common/TaxPdfReportModal';

interface PjCalcSubtabProps {
  inputs: PersonaJuridicaInput;
  setInputs: React.Dispatch<React.SetStateAction<PersonaJuridicaInput>>;
  result: PersonaJuridicaOutput | null;
  taxYear?: number;
  uvtValue?: number;
  onOpenAudit: () => void;
  onNavigateToF110: () => void;
  onNavigateToTtd: () => void;
  onNavigateToSobretasas: () => void;
  loadPresetComercial: () => void;
  loadPresetTech: () => void;
  loadPresetZonaFranca: () => void;
  loadPresetFinanciera: () => void;
}

export const PjCalcSubtab: React.FC<PjCalcSubtabProps> = ({
  inputs,
  setInputs,
  result,
  taxYear = 2025,
  uvtValue = 49799,
  onOpenAudit,
  onNavigateToF110,
  onNavigateToTtd,
  onNavigateToSobretasas,
  loadPresetComercial,
  loadPresetTech,
  loadPresetZonaFranca,
  loadPresetFinanciera,
}) => {
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  const handleNumChange = (field: keyof PersonaJuridicaInput, valStr: string) => {
    const num = parseCOP(valStr);
    setInputs((prev) => ({ ...prev, [field]: num }));
  };

  const handleSelectChange = (field: keyof PersonaJuridicaInput, val: any) => {
    setInputs((prev) => ({ ...prev, [field]: val }));
  };

  const pjReportData: TaxReportData | null = result
    ? {
        moduleType: 'pj',
        title: 'DICTAMEN FISCAL PERSONA JURÍDICA (FORMULARIO 110)',
        formName: 'Formulario 110',
        taxYear: taxYear,
        uvtValue: uvtValue,
        contributorName: 'SOCIEDAD INDUSTRIAL & COMERCIAL S.A.S.',
        contributorId: 'NIT 900.987.654-1',
        regimeType:
          inputs.tipo_regimen === 'zona_franca'
            ? 'Usuario Industrial Zona Franca (20%)'
            : inputs.tipo_regimen === 'hotelero'
            ? 'Sector Hotelero / Ecoturismo (15%)'
            : 'Régimen Ordinario General (35%)',
        mainKpiLabel:
          result.saldo_a_pagar > 0
            ? 'Saldo Final a Pagar a la DIAN (Casilla 110)'
            : 'Saldo Final a Favor de la Sociedad (Casilla 111)',
        mainKpiValue: result.saldo_a_pagar > 0 ? result.saldo_a_pagar : result.saldo_a_favor,
        isPayable: result.saldo_a_pagar > 0,
        metrics: [
          { label: 'Tarifa Nominal', value: `${(result.tarifa_renta_aplicada * 100).toFixed(1)}%` },
          { label: 'Tasa Mínima TTD (Art. 240 Par. 6)', value: `${result.ttd_calculada_pct.toFixed(2)}% (Mín 15%)` },
          { label: 'Impuesto Neto Renta', value: `$${formatCOP(result.impuesto_neto_total, false)}` },
        ],
        depurationRows: [
          { label: 'Ingresos Brutos Operacionales y no Operacionales', value: `$${formatCOP(result.ingresos_brutos_totales, false)}`, isHeader: true },
          { label: '(-) Devoluciones, Rebajas e INCRNGO', value: `-$${formatCOP((inputs.devoluciones_rebajas_descuentos || 0) + (inputs.ingresos_no_constitutivos_renta || 0), false)}`, isNegative: true },
          { label: '(=) Total Ingresos Netos (Casilla 61)', value: `$${formatCOP(result.ingresos_netos, false)}`, isBold: true },
          { label: '(-) Total Costos Procedentes (Casilla 62)', value: `-$${formatCOP(inputs.costos_procedentes || 0, false)}`, isNegative: true },
          { label: '(-) Gastos Operacionales y Deducciones Especiales', value: `-$${formatCOP(result.total_gastos_deducibles, false)}`, isNegative: true },
          { label: '(=) Renta Líquida Ordinaria del Ejercicio (Casilla 72)', value: `$${formatCOP(result.renta_liquida_ordinaria, false)}`, isBold: true, bg: '#f1f5f9' },
          { label: '(=) Renta Líquida Gravable (Casilla 79)', value: `$${formatCOP(result.renta_liquida_gravable, false)}`, isBold: true },
          { label: 'Impuesto Básico de Renta (Casilla 84)', value: `$${formatCOP(result.impuesto_basico_renta, false)}` },
          { label: '(+) Impuesto Adicional por Tasa Mínima TTD (Casilla 95)', value: `+$${formatCOP(result.impuesto_adicional_ttd, false)}` },
          { label: '(+) Sobretasa Financiera / Hidroeléctrica (Casilla 85)', value: `+$${formatCOP(result.impuesto_sobretasa, false)}` },
          { label: '(-) Descuentos Tributarios (ICA Art. 115 + Otros) (Casilla 91)', value: `-$${formatCOP(result.total_descuentos_tributarios_aplicados, false)}`, isNegative: true },
          { label: '(=) Impuesto Neto de Renta a Cargo (Casilla 96)', value: `$${formatCOP(result.impuesto_neto_total, false)}`, isBold: true, bg: '#eff6ff' },
          { label: '(-) Total Retenciones y Anticipos (Casilla 103 + 107)', value: `-$${formatCOP((result.total_retenciones_declarar || 0) + (inputs.anticipo_ano_anterior || 0), false)}`, isNegative: true },
          { label: '(+) Anticipo de Renta Año Siguiente (Casilla 108)', value: `+$${formatCOP(result.anticipo_ano_siguiente, false)}` },
        ],
        keyBoxes: [
          { box: '59', label: 'Ingresos Netos', value: `$${formatCOP(result.ingresos_netos, false)}` },
          { box: '87', label: 'Renta Líquida Gravable', value: `$${formatCOP(result.renta_liquida_gravable, false)}` },
          { box: '88', label: 'Impuesto Básico', value: `$${formatCOP(result.impuesto_basico_renta, false)}` },
          { box: '96', label: 'Impuesto Neto Renta', value: `$${formatCOP(result.impuesto_neto_total, false)}` },
          { box: '107', label: 'Retenciones Practicadas', value: `$${formatCOP(result.total_retenciones_declarar, false)}` },
          { box: '110/111', label: 'Saldo Final Declaración', value: `$${formatCOP(result.saldo_a_pagar > 0 ? result.saldo_a_pagar : result.saldo_a_favor, false)}` },
        ],
      }
    : null;

  return (
    <div id="pane-pj-calc" className="module-pane active">
      {/* BARRA DE PRESETS ESTANDARIZADA */}
      <div className="presets-toolbar">
        <div className="presets-toolbar-group">
          <span className="presets-toolbar-label">⚡ Presets de 1 Clic:</span>
          <button className="btn btn-outline btn-sm" onClick={loadPresetComercial}>
            🏢 Comercial Estándar (35%)
          </button>
          <button className="btn btn-outline btn-sm" onClick={loadPresetTech}>
            💻 Servicios Tech &amp; I+D
          </button>
          <button className="btn btn-outline btn-sm" onClick={loadPresetZonaFranca}>
            🚢 Zona Franca (20%)
          </button>
          <button className="btn btn-outline btn-sm" onClick={loadPresetFinanciera}>
            🏦 Financiera (+5%)
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
          <button className="btn btn-secondary btn-sm" onClick={onNavigateToTtd}>
            ⚖️ Laboratorio TTD (15%)
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onNavigateToSobretasas}>
            ⚡ Sobretasas
          </button>
          <button className="btn btn-primary btn-sm" onClick={onNavigateToF110}>
            📋 Ver Formulario 110 DIAN
          </button>
        </div>
      </div>

      <div className="calc-grid">
        {/* COLUMNA FORMULARIO DE ENTRADA */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Datos Contables, Fiscales y Depuración F-110</h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cálculo reactivo determinista</span>
          </div>

          <div className="card-body">
            {/* SECCIÓN 1: IDENTIFICACIÓN Y RÉGIMEN */}
            <div className="form-section">
              <h3 className="section-title">1. Identificación y Régimen Tributario</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Razón Social de la Sociedad</label>
                  <input
                    type="text"
                    className="text-input"
                    defaultValue="SOCIEDAD INDUSTRIAL & COMERCIAL S.A.S."
                  />
                </div>
                <div className="input-field">
                  <label className="input-label">NIT</label>
                  <input type="text" className="text-input" defaultValue="900987654" />
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Régimen o Sector Aplicable</label>
                  <select
                    className="select-input"
                    value={inputs.tipo_regimen || 'general'}
                    onChange={(e) => handleSelectChange('tipo_regimen', e.target.value)}
                  >
                    <option value="general">Régimen General Ordinario (Tarifa 35%)</option>
                    <option value="zona_franca">Usuario Industrial Zona Franca (Tarifa 20% - Art. 240-1)</option>
                    <option value="hotelero">Hoteles y Ecoturismo Nuevos (Tarifa 15% - Art. 240 Par. 5)</option>
                    <option value="cooperativa">Cooperativas / Entidad Especial (Tarifa 20%)</option>
                    <option value="zomac">Empresas ZOMAC (Tarifas progresivas)</option>
                  </select>
                </div>

                <div className="input-field">
                  <label className="input-label">Porcentaje Anticipo Año Siguiente</label>
                  <select
                    className="select-input"
                    value={inputs.porcentaje_anticipo_siguiente ?? 0.75}
                    onChange={(e) => handleSelectChange('porcentaje_anticipo_siguiente', parseFloat(e.target.value))}
                  >
                    <option value={0.75}>75% (General - Tercer año en adelante)</option>
                    <option value={0.50}>50% (Segundo año de constitución)</option>
                    <option value={0.25}>25% (Primer año de constitución)</option>
                    <option value={0.00}>0% (Sin anticipo / Liquidación final)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: PATRIMONIO FISCAL */}
            <div className="form-section">
              <h3 className="section-title">2. Patrimonio Fiscal a 31 de Diciembre (Casillas 36 a 46)</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Efectivo y Bancos (c36)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.efectivo_y_equivalentes ?? 0, false)}
                      onChange={(e) => handleNumChange('efectivo_y_equivalentes', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Cuentas por Cobrar Clientes (c38)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.cuentas_por_cobrar ?? 0, false)}
                      onChange={(e) => handleNumChange('cuentas_por_cobrar', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Inventarios Fiscales (c39)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.inventarios ?? 0, false)}
                      onChange={(e) => handleNumChange('inventarios', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Propiedades, Planta y Equipo (c42)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.propiedades_planta_equipo ?? 0, false)}
                      onChange={(e) => handleNumChange('propiedades_planta_equipo', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Total Pasivos / Deudas Fiscales (c45)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.pasivos ?? 0, false)}
                      onChange={(e) => handleNumChange('pasivos', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: INGRESOS FISCALES */}
            <div className="form-section">
              <h3 className="section-title">3. Ingresos Ordinarios y Extraordinarios (Casillas 47 a 61)</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Ingresos Brutos Operacionales (c47)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.ingresos_brutos_operacionales, false)}
                      onChange={(e) => handleNumChange('ingresos_brutos_operacionales', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Ingresos Financieros y No Operacionales (c48)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.ingresos_brutos_no_operacionales, false)}
                      onChange={(e) => handleNumChange('ingresos_brutos_no_operacionales', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Devoluciones, Rebajas y Descuentos (c59)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.devoluciones_rebajas_descuentos, false)}
                      onChange={(e) => handleNumChange('devoluciones_rebajas_descuentos', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Ingresos No Constitutivos de Renta (c60)</label>
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
              </div>
            </div>

            {/* SECCIÓN 4: COSTOS Y GASTOS DEDUCIBLES */}
            <div className="form-section">
              <h3 className="section-title">4. Costos y Gastos Deducibles (Casillas 62 a 67)</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Costo Fiscal de Ventas / Servicios (c62)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.costos_procedentes, false)}
                      onChange={(e) => handleNumChange('costos_procedentes', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Gastos de Administración (c63)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.gastos_administracion, false)}
                      onChange={(e) => handleNumChange('gastos_administracion', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Gastos de Distribución y Ventas (c64)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.gastos_ventas, false)}
                      onChange={(e) => handleNumChange('gastos_ventas', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Gastos Financieros Deducibles (c65)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.gastos_financieros, false)}
                      onChange={(e) => handleNumChange('gastos_financieros', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 5: CONCILIACIÓN NIIF Y TASA MÍNIMA TTD */}
            <div className="form-section">
              <h3 className="section-title">5. Conciliación Contable-Fiscal y Tasa Mínima TTD (Art. 240 Par. 6)</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Utilidad Contable Antes de Impuestos (UD Base)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.utilidad_contable_antes_impuestos, false)}
                      onChange={(e) => handleNumChange('utilidad_contable_antes_impuestos', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Gastos No Deducibles (Multas, sin soporte)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.gastos_no_deducibles, false)}
                      onChange={(e) => handleNumChange('gastos_no_deducibles', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Deducciones Especiales (1er empleo, I+D)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.deducciones_especiales, false)}
                      onChange={(e) => handleNumChange('deducciones_especiales', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Compensación Pérdidas Fiscales (Art. 147)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.compensacion_perdidas_fiscales, false)}
                      onChange={(e) => handleNumChange('compensacion_perdidas_fiscales', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 6: DESCUENTOS Y RETENCIONES */}
            <div className="form-section">
              <h3 className="section-title">6. Descuentos Tributarios, Retenciones y Anticipos</h3>
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">Descuento 50% ICA Pagado (Art. 115 E.T.)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.descuento_tributario_ica, false)}
                      onChange={(e) => handleNumChange('descuento_tributario_ica', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Retenciones en la Fuente Practicadas (c106)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.retenciones_en_la_fuente, false)}
                      onChange={(e) => handleNumChange('retenciones_en_la_fuente', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Autorretenciones Practicadas (c105)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.autorretenciones_practicadas, false)}
                      onChange={(e) => handleNumChange('autorretenciones_practicadas', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">Anticipo Renta Año Anterior (c103)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.anticipo_ano_anterior, false)}
                      onChange={(e) => handleNumChange('anticipo_ano_anterior', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESULTADOS EN TIEMPO REAL */}
        <div className="card results-card sticky-card">
          <div className="card-header results-card-header">
            <h2 className="card-title">Resumen Liquidación F-110</h2>
            <button className="btn btn-outline btn-xs" onClick={onOpenAudit}>
              🔍 Trazabilidad Fiscal
            </button>
          </div>

          <div className="card-body">
            {result ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* SALDO PRINCIPAL */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    background: result.saldo_a_pagar > 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                    border: `1px solid ${result.saldo_a_pagar > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {result.saldo_a_pagar > 0 ? 'TOTAL SALDO A PAGAR (Casilla 113)' : 'TOTAL SALDO A FAVOR (Casilla 114)'}
                  </span>
                  <div
                    style={{
                      fontSize: '26px',
                      fontWeight: 900,
                      color: result.saldo_a_pagar > 0 ? '#ef4444' : '#10b981',
                      marginTop: '4px',
                    }}
                  >
                    ${formatCOP(result.saldo_a_pagar > 0 ? result.saldo_a_pagar : result.saldo_a_favor, false)}
                  </div>
                </div>

                {/* KPI METRICS GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ padding: '10px', background: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Renta Líquida Gravable</div>
                    <div style={{ fontSize: '14px', fontWeight: 800 }}>${formatCOP(result.renta_liquida_gravable, false)}</div>
                  </div>

                  <div style={{ padding: '10px', background: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Tarifa Renta</div>
                    <div style={{ fontSize: '14px', fontWeight: 800 }}>{(result.tarifa_renta_aplicada * 100).toFixed(1)}%</div>
                  </div>

                  <div style={{ padding: '10px', background: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Impuesto Básico Renta</div>
                    <div style={{ fontSize: '14px', fontWeight: 800 }}>${formatCOP(result.impuesto_basico_renta, false)}</div>
                  </div>

                  <div style={{ padding: '10px', background: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Descuento ICA (Art. 115)</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#10b981' }}>
                      -${formatCOP(result.total_descuentos_tributarios_aplicados, false)}
                    </div>
                  </div>
                </div>

                {/* ALERTA TASA MÍNIMA TTD */}
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    background: result.aplica_impuesto_adicional_ttd ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                    border: `1px solid ${result.aplica_impuesto_adicional_ttd ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700 }}>
                      {result.aplica_impuesto_adicional_ttd ? '⚠️ Tasa Mínima TTD No Alcanzada' : '✅ Tasa Mínima TTD Cumplida'}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 800 }}>
                      TTD: {result.ttd_calculada_pct.toFixed(2)}% (Mín 15%)
                    </span>
                  </div>
                  {result.aplica_impuesto_adicional_ttd && (
                    <div style={{ fontSize: '11px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                      Impuesto a Adicionar (IA - Casilla 95): <strong>${formatCOP(result.impuesto_adicional_ttd, false)}</strong>
                    </div>
                  )}
                </div>

                {/* DETALLE RETENCIONES Y ANTICIPOS */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Impuesto Neto Total (c96):</span>
                    <span style={{ fontWeight: 700 }}>${formatCOP(result.impuesto_neto_total, false)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Retenciones (c107):</span>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>-${formatCOP(result.total_retenciones_declarar, false)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Anticipo Anterior (c103):</span>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>-${formatCOP(inputs.anticipo_ano_anterior, false)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Anticipo Año Siguiente (c108):</span>
                    <span style={{ fontWeight: 700 }}>+${formatCOP(result.anticipo_ano_siguiente, false)}</span>
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN Y EXPORTACIÓN */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={onOpenAudit}>
                    🔍 Auditoría Legal
                  </button>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={onNavigateToF110}>
                    📋 Ver F110 DIAN Real
                  </button>
                </div>

                {/* CTA PRIMARIO DESTACADO: DESCARGA DE DICTAMEN PDF */}
                <div className="results-export-cta">
                  <button
                    id="btn-pj-export-pdf"
                    className="btn-export-primary"
                    onClick={() => setIsPdfModalOpen(true)}
                    title="Generar y descargar dictamen formal con membrete para imprimir o guardar en PDF"
                  >
                    <span>📄</span> Descargar Dictamen Ejecutivo PJ (PDF)
                  </button>
                </div>

                <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', margin: '8px 0 0 0' }}>
                  {result.resumen_ejecutivo}
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                Calculando liquidación fiscal...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL UNIVERSAL DE DICTAMEN PDF */}
      <TaxPdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        report={pjReportData}
      />
    </div>
  );
};
