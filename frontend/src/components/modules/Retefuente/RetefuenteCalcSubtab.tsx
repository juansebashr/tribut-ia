import React, { useState } from 'react';
import type { RetefuenteF350Input, RetefuenteF350Output } from '../../../types/tax';
import { formatCOP, parseCOP } from '../../../utils/formatters';
import { TaxPdfReportModal, type TaxReportData } from '../../common/TaxPdfReportModal';

interface RetefuenteCalcSubtabProps {
  inputs: RetefuenteF350Input;
  setInputs: React.Dispatch<React.SetStateAction<RetefuenteF350Input>>;
  result: RetefuenteF350Output | null;
  taxYear?: number;
  uvtValue?: number;
  onOpenAudit: () => void;
  onNavigateToF350: () => void;
  onNavigateToLaboral: () => void;
  onNavigateToTabla: () => void;
  loadPresetPyme: () => void;
  loadPresetComercial: () => void;
  loadPresetServicios: () => void;
  loadPresetExterior: () => void;
}

const MESES = [
  '01 - Enero', '02 - Febrero', '03 - Marzo', '04 - Abril',
  '05 - Mayo', '06 - Junio', '07 - Julio', '08 - Agosto',
  '09 - Septiembre', '10 - Octubre', '11 - Noviembre', '12 - Diciembre'
];

export const RetefuenteCalcSubtab: React.FC<RetefuenteCalcSubtabProps> = ({
  inputs,
  setInputs,
  result,
  taxYear = 2025,
  uvtValue = 49799,
  onOpenAudit,
  onNavigateToF350,
  onNavigateToLaboral,
  onNavigateToTabla,
  loadPresetPyme,
  loadPresetComercial,
  loadPresetServicios,
  loadPresetExterior,
}) => {
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  const handleNumChange = (field: keyof RetefuenteF350Input, valStr: string) => {
    const num = parseCOP(valStr);
    setInputs((prev) => ({ ...prev, [field]: num }));
  };

  const handleMesChange = (mes: number) => {
    setInputs((prev) => ({ ...prev, periodo_mes: mes }));
  };

  const retefuenteReportData: TaxReportData | null = result
    ? {
        moduleType: 'retefuente',
        title: 'DICTAMEN MENSUAL DE RETENCIÓN EN LA FUENTE (FORMULARIO 350)',
        formName: 'Formulario 350',
        taxYear: taxYear,
        uvtValue: uvtValue,
        contributorName: inputs.razon_social || 'AGENTE DE RETENCIÓN',
        contributorId: inputs.nit ? `NIT ${inputs.nit}-${inputs.dv || '0'}` : undefined,
        regimeType: `Agente Retenedor • Período Mes ${inputs.periodo_mes || 1} (${MESES[(inputs.periodo_mes || 1) - 1] || 'Enero'})`,
        mainKpiLabel: 'Total Saldo a Pagar a la DIAN (Casilla 84)',
        mainKpiValue: result.total_a_pagar ?? result.casillas.c84_total_saldo_a_pagar ?? 0,
        isPayable: true,
        metrics: [
          { label: 'Retenciones Renta', value: `$${formatCOP(result.total_retenciones_renta_practicadas ?? 0, false)}` },
          { label: 'Autorretenciones Renta', value: `$${formatCOP(result.total_autorretenciones_renta ?? 0, false)}` },
          { label: 'Retenciones IVA (15%)', value: `$${formatCOP(result.total_retenciones_iva_practicadas ?? 0, false)}` },
        ],
        depurationRows: [
          { label: 'Retención por Rentas de Trabajo (Nómina Art. 383) (Casilla 42)', value: `$${formatCOP(result.casillas.c42_ret_rentas_trabajo, false)}` },
          { label: 'Retención por Honorarios y Comisiones (Casillas 43 + 44)', value: `$${formatCOP((result.casillas.c43_ret_honorarios || 0) + (result.casillas.c44_ret_comisiones || 0), false)}` },
          { label: 'Retención por Servicios y Arrendamientos (Casillas 45 + 46)', value: `$${formatCOP((result.casillas.c45_ret_servicios || 0) + (result.casillas.c46_ret_arrendamientos || 0), false)}` },
          { label: 'Retención por Compras Generales (Casilla 49)', value: `$${formatCOP(result.casillas.c49_ret_compras, false)}` },
          { label: 'Retención por Rendimientos Financieros (Casilla 47)', value: `$${formatCOP(result.casillas.c47_ret_rendimientos_financieros, false)}` },
          { label: 'Retención por Pagos al Exterior (Casilla 51)', value: `$${formatCOP(result.casillas.c51_ret_pagos_exterior_renta, false)}` },
          { label: '(=) Total Retenciones Renta Practicadas (Casilla 59)', value: `$${formatCOP(result.total_retenciones_renta_practicadas, false)}`, isBold: true, bg: '#f1f5f9' },
          { label: '(+) Autorretenciones Especiales de Renta D. 2201 (Casilla 65)', value: `+$${formatCOP(result.total_autorretenciones_renta, false)}` },
          { label: '(+) Retenciones de IVA Practicadas (ReteIVA 15%) (Casilla 74)', value: `+$${formatCOP(result.total_retenciones_iva_practicadas, false)}` },
          { label: '(+) Retenciones de Timbre Nacional (Casilla 77)', value: `+$${formatCOP(result.total_retenciones_timbre, false)}` },
          { label: '(=) Total Retenciones del Período (Casilla 82)', value: `$${formatCOP(result.casillas.c82_total_retenciones_periodo, false)}`, isBold: true, bg: '#eff6ff' },
          { label: '(+) Sanciones Liquidadas (Casilla 83)', value: `+$${formatCOP(result.casillas.c83_sanciones, false)}` },
          { label: '(=) Total Saldo a Pagar Formulario 350 (Casilla 84)', value: `$${formatCOP(result.total_a_pagar ?? result.casillas.c84_total_saldo_a_pagar ?? 0, false)}`, isBold: true, bg: '#fee2e2' },
        ],
        keyBoxes: [
          { box: '42', label: 'Rentas Trabajo', value: `$${formatCOP(result.casillas.c42_ret_rentas_trabajo, false)}` },
          { box: '49', label: 'Compras', value: `$${formatCOP(result.casillas.c49_ret_compras, false)}` },
          { box: '59', label: 'Total Ret. Renta', value: `$${formatCOP(result.total_retenciones_renta_practicadas, false)}` },
          { box: '65', label: 'Autorretenciones', value: `$${formatCOP(result.total_autorretenciones_renta, false)}` },
          { box: '74', label: 'ReteIVA 15%', value: `$${formatCOP(result.total_retenciones_iva_practicadas, false)}` },
          { box: '84', label: 'Total a Pagar', value: `$${formatCOP(result.total_a_pagar ?? result.casillas.c84_total_saldo_a_pagar ?? 0, false)}` },
        ],
      }
    : null;

  return (
    <div id="pane-retefuente-calc" className="module-pane active">
      {/* BARRA DE PRESETS ESTANDARIZADA */}
      <div className="presets-toolbar">
        <div className="presets-toolbar-group">
          <span className="presets-toolbar-label">⚡ Presets de 1 Clic:</span>
          <button className="btn btn-outline btn-sm" onClick={loadPresetPyme} title="Empresa con nómina y compras generales">
            🏢 Pyme Estándar
          </button>
          <button className="btn btn-outline btn-sm" onClick={loadPresetComercial} title="Empresa comercial con autorretención y compras">
            🛒 Comercializadora
          </button>
          <button className="btn btn-outline btn-sm" onClick={loadPresetServicios} title="Empresa de consultoría y servicios con ReteIVA">
            💼 Servicios &amp; Honorarios
          </button>
          <button className="btn btn-outline btn-sm" onClick={loadPresetExterior} title="Compañía con pagos de software al exterior">
            🌐 Pagos al Exterior
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
          <button className="btn btn-secondary btn-sm" onClick={onNavigateToLaboral}>
            👤 Nómina Art. 383
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onNavigateToTabla}>
            📚 Tabla de Retenciones
          </button>
          <button className="btn btn-primary btn-sm" onClick={onNavigateToF350}>
            📋 Ver Formulario 350 DIAN
          </button>
        </div>
      </div>

      <div className="calc-grid">
        {/* COLUMNA FORMULARIO DE ENTRADA */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Datos Mensuales y Liquidación Retención en la Fuente (F-350)</h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cálculo mensual determinista</span>
          </div>

          <div className="card-body">
            {/* SECCIÓN 1: IDENTIFICACIÓN Y PERIODO */}
            <div className="form-section">
              <h3 className="section-title">1. Identificación y Período Mensual</h3>
              <div className="inputs-row">
                <div className="input-field" style={{ flex: 2 }}>
                  <label className="input-label">Razón Social o Nombre del Agente Retenedor</label>
                  <input
                    type="text"
                    className="text-input"
                    value={inputs.razon_social}
                    onChange={(e) => setInputs((prev) => ({ ...prev, razon_social: e.target.value }))}
                    placeholder="EMPRESA EJEMPLO S.A.S."
                  />
                </div>
                <div className="input-field" style={{ flex: 1.2 }}>
                  <label className="input-label">NIT</label>
                  <input
                    type="text"
                    className="text-input"
                    value={inputs.nit}
                    onChange={(e) => setInputs((prev) => ({ ...prev, nit: e.target.value }))}
                    placeholder="900123456"
                  />
                </div>
                <div className="input-field" style={{ width: '60px', flex: '0 0 60px' }}>
                  <label className="input-label">DV</label>
                  <input
                    type="text"
                    className="text-input text-center"
                    value={inputs.dv}
                    onChange={(e) => setInputs((prev) => ({ ...prev, dv: e.target.value }))}
                    maxLength={1}
                  />
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field" style={{ flex: 1 }}>
                  <label className="input-label">Mes del Período Gravable (1 a 12)</label>
                  <select
                    className="select-input"
                    value={inputs.periodo_mes}
                    onChange={(e) => handleMesChange(parseInt(e.target.value))}
                  >
                    {MESES.map((m, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-field" style={{ flex: 1 }}>
                  <label className="input-label">Tarifa Autorretención Especial (D. 2201)</label>
                  <select
                    className="select-input"
                    value={inputs.tarifa_autorretencion_especial_pct ?? 0.55}
                    onChange={(e) => setInputs((prev) => ({ ...prev, tarifa_autorretencion_especial_pct: parseFloat(e.target.value) }))}
                  >
                    <option value={0.55}>0.55% - Actividades comerciales, agro e industria liviana</option>
                    <option value={1.10}>1.10% - Servicios técnicos, manufactura y construcción</option>
                    <option value={1.70}>1.70% - Hoteles, restaurantes y telecomunicaciones</option>
                    <option value={4.50}>4.50% - Actividades mineras y petroleras</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: RETENCIONES PRACTICADAS A TÍTULO DE RENTA */}
            <div className="form-section">
              <h3 className="section-title">2. Retenciones Practicadas a Título de Renta (Pagos o Abonos en Cuenta)</h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Ingresa las bases gravadas del mes sobre las cuales practicaste retención según las tarifas oficiales.
              </p>

              {/* RENTAS DE TRABAJO */}
              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">
                    Rentas de Trabajo / Nómina Gravada (Base Cas. 28)
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.base_rentas_trabajo ?? 0, false)}
                      onChange={(e) => handleNumChange('base_rentas_trabajo', e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label className="input-label">
                    Retención Nómina Practicada (Cas. 42)
                    <span style={{ fontSize: '10.5px', color: 'var(--primary)', marginLeft: '4px' }}>
                      (Manual / Auto)
                    </span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.ret_rentas_trabajo_manual || (result?.casillas.c42_ret_rentas_trabajo ?? 0), false)}
                      onChange={(e) => handleNumChange('ret_rentas_trabajo_manual', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* HONORARIOS Y COMISIONES */}
              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Honorarios Declarantes (11% - Base Cas. 29)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.base_honorarios_declarante ?? 0, false)}
                      onChange={(e) => handleNumChange('base_honorarios_declarante', e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label className="input-label">Honorarios No Declarantes (10% - Base Cas. 29)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.base_honorarios_no_declarante ?? 0, false)}
                      onChange={(e) => handleNumChange('base_honorarios_no_declarante', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Comisiones Declarantes (11% - Base Cas. 30)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.base_comisiones_declarante ?? 0, false)}
                      onChange={(e) => handleNumChange('base_comisiones_declarante', e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label className="input-label">Comisiones No Declarantes (10% - Base Cas. 30)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.base_comisiones_no_declarante ?? 0, false)}
                      onChange={(e) => handleNumChange('base_comisiones_no_declarante', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* SERVICIOS Y TRANSPORTE */}
              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Servicios Declarantes (4% - Base Cas. 31)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.base_servicios_declarante ?? 0, false)}
                      onChange={(e) => handleNumChange('base_servicios_declarante', e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label className="input-label">Servicios No Declarantes (6% - Base Cas. 31)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.base_servicios_no_declarante ?? 0, false)}
                      onChange={(e) => handleNumChange('base_servicios_no_declarante', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Transporte de Carga (1% - Base Cas. 31)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.base_servicios_transporte_carga ?? 0, false)}
                      onChange={(e) => handleNumChange('base_servicios_transporte_carga', e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label className="input-label">Arrendamientos Bienes Raíces (3.5% - Base Cas. 32)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.base_arrendamiento_inmuebles ?? 0, false)}
                      onChange={(e) => handleNumChange('base_arrendamiento_inmuebles', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* COMPRAS Y RENDIMIENTOS */}
              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Compras Declarantes (2.5% - Base Cas. 35)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.base_compras_declarante ?? 0, false)}
                      onChange={(e) => handleNumChange('base_compras_declarante', e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label className="input-label">Compras No Declarantes (3.5% - Base Cas. 35)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.base_compras_no_declarante ?? 0, false)}
                      onChange={(e) => handleNumChange('base_compras_no_declarante', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Rendimientos Financieros (7% - Base Cas. 33)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.base_rendimientos_financieros ?? 0, false)}
                      onChange={(e) => handleNumChange('base_rendimientos_financieros', e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label className="input-label">Enajenación Activos Ante Notario (1% - Base Cas. 34)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.base_enajenacion_activos_fijos ?? 0, false)}
                      onChange={(e) => handleNumChange('base_enajenacion_activos_fijos', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: AUTORRETENCIONES, RETEIVA Y PAGOS EXTERIOR */}
            <div className="form-section">
              <h3 className="section-title">3. Autorretenciones, ReteIVA y Pagos al Exterior</h3>

              <div className="inputs-row">
                <div className="input-field">
                  <label className="input-label">
                    Ingresos Propios Mes / Base Autorretención D. 2201 (Cas. 61)
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.ingresos_brutos_propios_mes ?? 0, false)}
                      onChange={(e) => handleNumChange('ingresos_brutos_propios_mes', e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label className="input-label">
                    Base IVA Sujeto a ReteIVA 15% (Cas. 67)
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.base_iva_sujeto_reteiva ?? 0, false)}
                      onChange={(e) => handleNumChange('base_iva_sujeto_reteiva', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: '10px' }}>
                <div className="input-field">
                  <label className="input-label">Pagos al Exterior Software/Servicios (20% - Base Cas. 37)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.base_pagos_exterior_servicios ?? 0, false)}
                      onChange={(e) => handleNumChange('base_pagos_exterior_servicios', e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label className="input-label">Sanciones por Extemporaneidad / Corrección (Cas. 83)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(inputs.sanciones ?? 0, false)}
                      onChange={(e) => handleNumChange('sanciones', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESULTADOS Y RESUMEN LIQUIDACIÓN */}
        <div className="card results-card sticky-card">
          <div className="card-header results-card-header">
            <h2 className="card-title" style={{ color: '#00594c' }}>
              📊 Resumen de Liquidación F-350
            </h2>
            <button className="btn btn-outline btn-xs" onClick={onOpenAudit}>
              🔍 Trazabilidad
            </button>
          </div>

          <div className="card-body">
            {/* TOTAL SALDO A PAGAR */}
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
                Total Saldo a Pagar (Casilla 84)
              </span>
              <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                ${formatCOP(result?.total_a_pagar ?? result?.casillas.c84_total_saldo_a_pagar ?? 0, false)}
              </div>
              <span style={{ fontSize: '11px', opacity: 0.85, marginTop: '2px', display: 'block' }}>
                Período {result?.periodo_mes || 1} • {inputs.razon_social || 'DISTRIBUIDORA NACIONAL'}
              </span>
            </div>

            {/* DESGLOSE POR CONCEPTOS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <div className="result-row">
                <span className="result-label">Retenciones Renta Practicadas (Cas. 59):</span>
                <span className="result-val">${formatCOP(result?.total_retenciones_renta_practicadas ?? 0, false)}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Autorretenciones Renta D. 2201 (Cas. 65):</span>
                <span className="result-val">${formatCOP(result?.total_autorretenciones_renta ?? 0, false)}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Retenciones IVA - ReteIVA 15% (Cas. 74):</span>
                <span className="result-val">${formatCOP(result?.total_retenciones_iva_practicadas ?? 0, false)}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Retenciones Timbre Nacional (Cas. 81):</span>
                <span className="result-val">${formatCOP(result?.total_retenciones_timbre ?? 0, false)}</span>
              </div>
              <div className="result-row" style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '6px' }}>
                <span className="result-label" style={{ fontWeight: 700 }}>Total Retenciones Período (Cas. 82):</span>
                <span className="result-val" style={{ fontWeight: 800 }}>${formatCOP(result?.casillas.c82_total_retenciones_periodo ?? 0, false)}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Sanciones (Cas. 83):</span>
                <span className="result-val">${formatCOP(result?.casillas.c83_sanciones ?? 0, false)}</span>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="btn btn-primary btn-block" onClick={onNavigateToF350}>
                📋 Ver en Formulario Oficial 350 DIAN
              </button>
              <button className="btn btn-outline btn-block" onClick={onNavigateToLaboral}>
                👤 Abrir Depurador de Nómina Individual Art. 383
              </button>
            </div>

            {/* CTA PRIMARIO DESTACADO: DESCARGA DE DICTAMEN PDF */}
            <div className="results-export-cta" style={{ marginTop: '12px' }}>
              <button
                id="btn-retefuente-export-pdf"
                className="btn-export-primary"
                onClick={() => setIsPdfModalOpen(true)}
                title="Generar y descargar dictamen formal con membrete para imprimir o guardar en PDF"
              >
                <span>📄</span> Descargar Dictamen Mensual F-350 (PDF)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL UNIVERSAL DE DICTAMEN PDF */}
      <TaxPdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        report={retefuenteReportData}
      />
    </div>
  );
};
