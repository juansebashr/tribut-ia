import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import type {
  ComparacionPatrimonialRequest,
  ComparacionPatrimonialResponse,
  PersonaNaturalInput,
  PersonaNaturalOutput,
} from '../../../types/tax';
import { calcularComparacionPatrimonial } from '../../../services/api';
import { formatCOP, parseCOP } from '../../../utils/formatters';
import { downloadSkillComparacionPatrimonialPack } from '../../../utils/skillBundleDownloader';

interface PnComparacionPatrimonialSubtabProps {
  currentPnInputs?: PersonaNaturalInput;
  currentPnResult?: PersonaNaturalOutput | null;
  onNavigateToCalc?: () => void;
}

export const PnComparacionPatrimonialSubtab: React.FC<PnComparacionPatrimonialSubtabProps> = ({
  currentPnInputs,
  currentPnResult,
  onNavigateToCalc,
}) => {
  const { taxYear, uvtValue, showToast } = useApp();

  const [inputs, setInputs] = useState<ComparacionPatrimonialRequest>({
    tax_year: taxYear,
    custom_uvt: uvtValue,
    patrimonio_liquido_ano_anterior: 220000000,
    patrimonio_bruto_ano_actual: 450000000,
    deudas_ano_actual: 150000000,
    reajustes_fiscales_activos_fijos: 15000000,
    valorizaciones_nominales_o_revalorizaciones: 0,
    desvalorizaciones_o_castigos_nominales: 0,
    renta_liquida_ordinaria_cedula_general: 85000000,
    rentas_liquidas_pensiones_y_dividendos: 0,
    rentas_exentas_totales: 25000000,
    ingresos_no_constitutivos_renta: 9600000,
    ganancia_ocasional_neta: 0,
    ingresos_no_gravados_o_recibidos_exterior: 0,
    nuevas_deudas_adquiridas_en_el_ano: 80000000,
    desahorro_o_liquidacion_activos_anteriores: 20000000,
    impuesto_renta_y_ganancia_ocasional_pagado: 12000000,
    retenciones_fuente_asumidas_en_el_ano: 5000000,
    gastos_personales_y_consumo_estimado: 45000000,
    perdidas_extraordinarias_no_deducibles: 0,
  });

  const [result, setResult] = useState<ComparacionPatrimonialResponse | null>(null);
  const [showAuditTrace, setShowAuditTrace] = useState<boolean>(false);

  // Sync year and UVT
  useEffect(() => {
    setInputs((prev) => ({ ...prev, tax_year: taxYear, custom_uvt: uvtValue }));
  }, [taxYear, uvtValue]);

  // Recalculate on inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      runCalculation();
    }, 120);
    return () => clearTimeout(timer);
  }, [inputs]);

  const runCalculation = async () => {
    try {
      const res = await calcularComparacionPatrimonial(inputs);
      setResult(res);
    } catch (err: any) {
      console.error('Error calculando comparación patrimonial:', err);
    }
  };

  const updateField = (field: keyof ComparacionPatrimonialRequest, val: number) => {
    setInputs((prev) => ({ ...prev, [field]: Math.max(0, val) }));
  };

  // Presets
  const loadPresetJustificado = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      patrimonio_liquido_ano_anterior: 180000000,
      patrimonio_bruto_ano_actual: 520000000,
      deudas_ano_actual: 220000000, // Patrimonio líquido actual = 300M (Variación = 120M)
      reajustes_fiscales_activos_fijos: 20000000,
      valorizaciones_nominales_o_revalorizaciones: 0,
      desvalorizaciones_o_castigos_nominales: 0,
      renta_liquida_ordinaria_cedula_general: 90000000,
      rentas_liquidas_pensiones_y_dividendos: 0,
      rentas_exentas_totales: 22000000,
      ingresos_no_constitutivos_renta: 9000000,
      ganancia_ocasional_neta: 0,
      ingresos_no_gravados_o_recibidos_exterior: 0,
      nuevas_deudas_adquiridas_en_el_ano: 120000000,
      desahorro_o_liquidacion_activos_anteriores: 30000000,
      impuesto_renta_y_ganancia_ocasional_pagado: 10000000,
      retenciones_fuente_asumidas_en_el_ano: 4000000,
      gastos_personales_y_consumo_estimado: 48000000,
      perdidas_extraordinarias_no_deducibles: 0,
    });
    showToast('🟢 Caso 1 cargado: Incremento patrimonial justificado', 'success', 2500);
  };

  const loadPresetDesajuste = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      patrimonio_liquido_ano_anterior: 100000000,
      patrimonio_bruto_ano_actual: 480000000,
      deudas_ano_actual: 50000000, // Patrimonio líquido actual = 430M (Variación = 330M)
      reajustes_fiscales_activos_fijos: 0,
      valorizaciones_nominales_o_revalorizaciones: 0,
      desvalorizaciones_o_castigos_nominales: 0,
      renta_liquida_ordinaria_cedula_general: 60000000,
      rentas_liquidas_pensiones_y_dividendos: 0,
      rentas_exentas_totales: 15000000,
      ingresos_no_constitutivos_renta: 6000000,
      ganancia_ocasional_neta: 0,
      ingresos_no_gravados_o_recibidos_exterior: 0,
      nuevas_deudas_adquiridas_en_el_ano: 20000000,
      desahorro_o_liquidacion_activos_anteriores: 0,
      impuesto_renta_y_ganancia_ocasional_pagado: 4000000,
      retenciones_fuente_asumidas_en_el_ano: 2000000,
      gastos_personales_y_consumo_estimado: 40000000,
      perdidas_extraordinarias_no_deducibles: 0,
    });
    showToast('🔴 Caso 2 cargado: Alerta de desajuste patrimonial', 'warning', 2500);
  };

  const loadPresetDesahorro = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      patrimonio_liquido_ano_anterior: 350000000,
      patrimonio_bruto_ano_actual: 550000000,
      deudas_ano_actual: 80000000, // Patrimonio líquido actual = 470M (Variación = 120M)
      reajustes_fiscales_activos_fijos: 10000000,
      valorizaciones_nominales_o_revalorizaciones: 0,
      desvalorizaciones_o_castigos_nominales: 0,
      renta_liquida_ordinaria_cedula_general: 50000000,
      rentas_liquidas_pensiones_y_dividendos: 0,
      rentas_exentas_totales: 12000000,
      ingresos_no_constitutivos_renta: 5000000,
      ganancia_ocasional_neta: 0,
      ingresos_no_gravados_o_recibidos_exterior: 0,
      nuevas_deudas_adquiridas_en_el_ano: 30000000,
      desahorro_o_liquidacion_activos_anteriores: 100000000, // Desahorro fuerte de cuentas previas
      impuesto_renta_y_ganancia_ocasional_pagado: 3500000,
      retenciones_fuente_asumidas_en_el_ano: 2000000,
      gastos_personales_y_consumo_estimado: 36000000,
      perdidas_extraordinarias_no_deducibles: 0,
    });
    showToast('🟡 Caso 3 cargado: Justificación por desahorro documentado', 'info', 2500);
  };

  const importFromCurrentF210 = () => {
    if (!currentPnInputs || !currentPnResult) {
      showToast('⚠️ No hay una liquidación activa en el Formulario 210 para importar', 'warning', 2500);
      return;
    }

    setInputs((prev) => ({
      ...prev,
      patrimonio_bruto_ano_actual: currentPnInputs.patrimonio_bruto || prev.patrimonio_bruto_ano_actual,
      deudas_ano_actual: currentPnInputs.deudas || prev.deudas_ano_actual,
      renta_liquida_ordinaria_cedula_general: currentPnResult.renta_liquida_gravable || prev.renta_liquida_ordinaria_cedula_general,
      rentas_exentas_totales: currentPnResult.total_rentas_exentas_aceptadas || prev.rentas_exentas_totales,
      ingresos_no_constitutivos_renta: currentPnResult.total_incrngo || prev.ingresos_no_constitutivos_renta,
      ganancia_ocasional_neta: currentPnResult.ganancia_ocasional_gravable || prev.ganancia_ocasional_neta,
      impuesto_renta_y_ganancia_ocasional_pagado: currentPnResult.total_impuesto_a_cargo || prev.impuesto_renta_y_ganancia_ocasional_pagado,
      retenciones_fuente_asumidas_en_el_ano: currentPnInputs.retenciones_fuente_practicadas || prev.retenciones_fuente_asumidas_en_el_ano,
    }));

    showToast('📥 Datos importados con éxito desde el Formulario 210 activo', 'success', 2500);
  };

  return (
    <div id="pane-pn-comparacion" className="module-pane active">
      {/* HEADER NORMATIVO */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              ⚖️ Control por Comparación Patrimonial (Arts. 236 y 237 del Estatuto Tributario)
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Verifica si el incremento de tu patrimonio líquido está plenamente soportado con tus ingresos declarados, desahorros y deudas, o si la DIAN presumirá una <strong>Renta Líquida Gravable por Comparación Patrimonial</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-sm btn-outline"
              style={{ borderColor: 'rgba(139, 92, 246, 0.4)', color: '#7c3aed', background: 'rgba(139, 92, 246, 0.08)' }}
              onClick={() => {
                downloadSkillComparacionPatrimonialPack();
                showToast('🤖 Descargando Skill de IA: control-comparacion-patrimonial', 'info', 3000);
              }}
              title="Descargar Skill de IA para auditar borradores F210 en Antigravity / Claude / Cursor / Codex"
            >
              🤖 Descargar Skill de IA
            </button>
            <button
              className="btn btn-sm btn-outline"
              onClick={importFromCurrentF210}
              title="Importar valores calculados en la pestaña principal del F210"
            >
              📥 Importar desde F210 Activo
            </button>
            {onNavigateToCalc && (
              <button className="btn btn-sm btn-primary" onClick={onNavigateToCalc}>
                ✏️ Ir a Captura F210
              </button>
            )}
          </div>
        </div>

        {/* ALERTA NORMATIVA DE FIRMEZA Y CONTROL DIAN */}
        <div
          style={{
            marginTop: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            fontSize: '12px',
            lineHeight: '1.55',
            color: 'var(--text-secondary)',
          }}
        >
          <strong style={{ color: 'var(--primary)' }}>📌 Fórmula Legal de Fiscalización DIAN:</strong>
          <span style={{ fontFamily: 'var(--font-mono)', marginLeft: '6px', fontWeight: 700 }}>
            Patrimonio Líquido Actual - Patrimonio Líquido Anterior ≤ Rentas Justificadas Netas (Ingresos - Impuestos - Gastos/Consumos)
          </span>
          <p style={{ margin: '6px 0 0 0', fontSize: '11.5px' }}>
            <strong>Término General de Firmeza (Art. 714 E.T.):</strong> La DIAN cuenta con 3 años para auditar y proferir Emplazamiento para Corregir (Art. 685) o Requerimiento Especial (Art. 703). Si no justificas de dónde provino el dinero para adquirir tus nuevos activos, la diferencia tributará como renta gravable a las tarifas del Art. 241 E.T.
          </p>
        </div>
      </div>

      {/* BOTONES DE PRESETS RÁPIDOS */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, alignSelf: 'center', color: 'var(--text-muted)' }}>
          Casos Didácticos:
        </span>
        <button className="btn btn-xs btn-outline" onClick={loadPresetJustificado}>
          🟢 Caso 1: Compra Inmueble Justificada
        </button>
        <button className="btn btn-xs btn-outline" onClick={loadPresetDesajuste}>
          🔴 Caso 2: Alerta Desajuste Patrimonial
        </button>
        <button className="btn btn-xs btn-outline" onClick={loadPresetDesahorro}>
          🟡 Caso 3: Justificación por Desahorro
        </button>
      </div>

      {/* CUADRÍCULA DE 4 TARJETAS MODULARES */}
      <div className="responsive-grid-split" style={{ marginBottom: '24px' }}>
        {/* CUADRANTE 1: PATRIMONIO FISCAL */}
        <div className="card">
          <div className="card-header" style={{ background: 'var(--primary-light)' }}>
            <div className="card-title" style={{ fontSize: '13.5px', color: 'var(--primary)' }}>
              🏛️ 1. Patrimonio Fiscal (Año Anterior vs. Actual)
            </div>
          </div>
          <div className="card-body">
            <div className="input-field" style={{ marginBottom: '10px' }}>
              <label className="input-label">Patrimonio Líquido Año Anterior (Casilla 32 Declaración Anterior)</label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="currency-input"
                  value={formatCOP(inputs.patrimonio_liquido_ano_anterior, false)}
                  onChange={(e) => updateField('patrimonio_liquido_ano_anterior', parseCOP(e.target.value))}
                />
              </div>
            </div>

            <div className="input-field" style={{ marginBottom: '10px' }}>
              <label className="input-label">Patrimonio Bruto Año Actual (Bienes, Cuentas, Inmuebles)</label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="currency-input"
                  value={formatCOP(inputs.patrimonio_bruto_ano_actual, false)}
                  onChange={(e) => updateField('patrimonio_bruto_ano_actual', parseCOP(e.target.value))}
                />
              </div>
            </div>

            <div className="input-field" style={{ marginBottom: '12px' }}>
              <label className="input-label">Deudas y Pasivos Respaldados Año Actual</label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="currency-input"
                  value={formatCOP(inputs.deudas_ano_actual, false)}
                  onChange={(e) => updateField('deudas_ano_actual', parseCOP(e.target.value))}
                />
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: '6px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Patrimonio Líquido Actual:</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>
                  {formatCOP(Math.max(0, inputs.patrimonio_bruto_ano_actual - inputs.deudas_ano_actual))} COP
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Variación Patrimonial Bruta (ΔPL):</span>
                <strong
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color:
                      Math.max(0, inputs.patrimonio_bruto_ano_actual - inputs.deudas_ano_actual) -
                        inputs.patrimonio_liquido_ano_anterior >=
                      0
                        ? 'var(--emerald)'
                        : 'var(--rose)',
                  }}
                >
                  {formatCOP(
                    Math.max(0, inputs.patrimonio_bruto_ano_actual - inputs.deudas_ano_actual) -
                      inputs.patrimonio_liquido_ano_anterior
                  )}{' '}
                  COP
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* CUADRANTE 2: AJUSTES AL PATRIMONIO */}
        <div className="card">
          <div className="card-header" style={{ background: 'var(--emerald-light)' }}>
            <div className="card-title" style={{ fontSize: '13.5px', color: 'var(--emerald)' }}>
              📈 2. Ajustes al Patrimonio (Sin Flujo de Efectivo)
            </div>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Valores que aumentan o disminuyen el patrimonio fiscalmente pero que <strong>no requirieron dinero en efectivo</strong>.
            </p>

            <div className="input-field" style={{ marginBottom: '10px' }}>
              <label className="input-label">Reajustes Fiscales de Activos Fijos (Arts. 70 y 73 E.T.)</label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="currency-input"
                  value={formatCOP(inputs.reajustes_fiscales_activos_fijos, false)}
                  onChange={(e) => updateField('reajustes_fiscales_activos_fijos', parseCOP(e.target.value))}
                />
              </div>
            </div>

            <div className="input-field" style={{ marginBottom: '10px' }}>
              <label className="input-label">Valorizaciones Nominales / Revalorizaciones Patrimoniales</label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="currency-input"
                  value={formatCOP(inputs.valorizaciones_nominales_o_revalorizaciones, false)}
                  onChange={(e) => updateField('valorizaciones_nominales_o_revalorizaciones', parseCOP(e.target.value))}
                />
              </div>
            </div>

            <div className="input-field" style={{ marginBottom: '12px' }}>
              <label className="input-label">Desvalorizaciones o Castigo de Cartera Nominal</label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="currency-input"
                  value={formatCOP(inputs.desvalorizaciones_o_castigos_nominales, false)}
                  onChange={(e) => updateField('desvalorizaciones_o_castigos_nominales', parseCOP(e.target.value))}
                />
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: '6px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Incremento Fiscal a Justificar:</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                  {formatCOP(
                    result?.incremento_patrimonial_a_justificar ??
                      Math.max(
                        0,
                        Math.max(0, inputs.patrimonio_bruto_ano_actual - inputs.deudas_ano_actual) -
                          inputs.patrimonio_liquido_ano_anterior -
                          (inputs.reajustes_fiscales_activos_fijos +
                            inputs.valorizaciones_nominales_o_revalorizaciones -
                            inputs.desvalorizaciones_o_castigos_nominales)
                      )
                  )}{' '}
                  COP
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE RENTAS Y DETRACCIONES */}
      <div className="responsive-grid-split" style={{ marginBottom: '24px' }}>
        {/* CUADRANTE 3: RENTAS Y FUENTES JUSTIFICATIVAS */}
        <div className="card">
          <div className="card-header" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <div className="card-title" style={{ fontSize: '13.5px', color: 'var(--emerald)' }}>
              💵 3. Rentas y Flujos Justificativos (Capacidad de Capitalización)
            </div>
          </div>
          <div className="card-body">
            <div className="inputs-row" style={{ marginBottom: '10px' }}>
              <div className="input-field">
                <label className="input-label">Renta Líquida Cédula General</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="currency-input"
                    value={formatCOP(inputs.renta_liquida_ordinaria_cedula_general, false)}
                    onChange={(e) => updateField('renta_liquida_ordinaria_cedula_general', parseCOP(e.target.value))}
                  />
                </div>
              </div>
              <div className="input-field">
                <label className="input-label">Rentas Exentas Aceptadas</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="currency-input"
                    value={formatCOP(inputs.rentas_exentas_totales, false)}
                    onChange={(e) => updateField('rentas_exentas_totales', parseCOP(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="inputs-row" style={{ marginBottom: '10px' }}>
              <div className="input-field">
                <label className="input-label">INCRNGO (Salud/Pensión Obligatoria)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="currency-input"
                    value={formatCOP(inputs.ingresos_no_constitutivos_renta, false)}
                    onChange={(e) => updateField('ingresos_no_constitutivos_renta', parseCOP(e.target.value))}
                  />
                </div>
              </div>
              <div className="input-field">
                <label className="input-label">Ganancia Ocasional Neta</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="currency-input"
                    value={formatCOP(inputs.ganancia_ocasional_neta, false)}
                    onChange={(e) => updateField('ganancia_ocasional_neta', parseCOP(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="inputs-row" style={{ marginBottom: '10px' }}>
              <div className="input-field">
                <label className="input-label">Nuevas Deudas / Créditos Desembolsados</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="currency-input"
                    value={formatCOP(inputs.nuevas_deudas_adquiridas_en_el_ano, false)}
                    onChange={(e) => updateField('nuevas_deudas_adquiridas_en_el_ano', parseCOP(e.target.value))}
                  />
                </div>
              </div>
              <div className="input-field">
                <label className="input-label">Desahorros / Venta de Activos Previos</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="currency-input"
                    value={formatCOP(inputs.desahorro_o_liquidacion_activos_anteriores, false)}
                    onChange={(e) => updateField('desahorro_o_liquidacion_activos_anteriores', parseCOP(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="input-field" style={{ marginBottom: '12px' }}>
              <label className="input-label">Otros Ingresos No Gravados / Indemnizaciones / Remesas</label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="currency-input"
                  value={formatCOP(inputs.ingresos_no_gravados_o_recibidos_exterior, false)}
                  onChange={(e) => updateField('ingresos_no_gravados_o_recibidos_exterior', parseCOP(e.target.value))}
                />
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: '6px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Fuentes Justificativas:</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald)' }}>
                  {formatCOP(result?.total_rentas_justificativas ?? 0)} COP
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* CUADRANTE 4: DETRACCIONES Y CONSUMOS */}
        <div className="card">
          <div className="card-header" style={{ background: 'rgba(239, 68, 68, 0.08)' }}>
            <div className="card-title" style={{ fontSize: '13.5px', color: 'var(--rose)' }}>
              📉 4. Detracciones y Gastos Personales
            </div>
          </div>
          <div className="card-body">
            <div className="input-field" style={{ marginBottom: '10px' }}>
              <label className="input-label">Impuesto Neto de Renta y Complementarios Pagado</label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="currency-input"
                  value={formatCOP(inputs.impuesto_renta_y_ganancia_ocasional_pagado, false)}
                  onChange={(e) => updateField('impuesto_renta_y_ganancia_ocasional_pagado', parseCOP(e.target.value))}
                />
              </div>
            </div>

            <div className="input-field" style={{ marginBottom: '10px' }}>
              <label className="input-label">Retenciones en la Fuente Asumidas durante el Año</label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="currency-input"
                  value={formatCOP(inputs.retenciones_fuente_asumidas_en_el_ano, false)}
                  onChange={(e) => updateField('retenciones_fuente_asumidas_en_el_ano', parseCOP(e.target.value))}
                />
              </div>
            </div>

            <div className="input-field" style={{ marginBottom: '10px' }}>
              <label className="input-label">Estimación de Gastos Personales, Consumos y Estilo de Vida</label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="currency-input"
                  value={formatCOP(inputs.gastos_personales_y_consumo_estimado, false)}
                  onChange={(e) => updateField('gastos_personales_y_consumo_estimado', parseCOP(e.target.value))}
                />
              </div>
            </div>

            <div className="input-field" style={{ marginBottom: '12px' }}>
              <label className="input-label">Pérdidas Extraordinarias No Deducibles (Siniestros)</label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="currency-input"
                  value={formatCOP(inputs.perdidas_extraordinarias_no_deducibles, false)}
                  onChange={(e) => updateField('perdidas_extraordinarias_no_deducibles', parseCOP(e.target.value))}
                />
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: '6px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Detracciones / Salidas de Caja:</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--rose)' }}>
                  {formatCOP(result?.total_detracciones_consumos ?? 0)} COP
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL DE RESULTADOS & SEMÁFORO DE CONTROL DIAN */}
      {result && (
        <div className="card" style={{ border: `2px solid ${result.existe_renta_por_comparacion_patrimonial ? 'var(--rose)' : 'var(--emerald)'}` }}>
          <div
            className="card-header"
            style={{
              backgroundColor: result.existe_renta_por_comparacion_patrimonial
                ? 'rgba(239, 68, 68, 0.1)'
                : 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div
              className="card-title"
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: result.existe_renta_por_comparacion_patrimonial ? 'var(--rose)' : 'var(--emerald)',
              }}
            >
              {result.existe_renta_por_comparacion_patrimonial
                ? '🔴 ALERTA DE DESAJUSTE — RENTA POR COMPARACIÓN PATRIMONIAL (ART. 236 E.T.)'
                : '🟢 PATRIMONIO 100% JUSTIFICADO ANTE LA DIAN'}
            </div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '12px',
                backgroundColor: result.existe_renta_por_comparacion_patrimonial ? 'var(--rose)' : 'var(--emerald)',
                color: '#fff',
              }}
            >
              {result.porcentaje_justificacion.toFixed(1)}% Justificado
            </span>
          </div>

          <div className="card-body" style={{ padding: '20px' }}>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {result.explicacion_didactica}
            </p>

            {/* COMPARATIVA EN CIFRAS */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '14px',
                marginBottom: '20px',
              }}
            >
              <div style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>
                  Incremento Patrimonial Fiscal:
                </span>
                <strong style={{ fontSize: '16px', fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                  {formatCOP(result.incremento_patrimonial_a_justificar)} COP
                </strong>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>
                  Capacidad Neta de Justificación:
                </span>
                <strong style={{ fontSize: '16px', fontFamily: 'var(--font-mono)', color: 'var(--emerald)' }}>
                  {formatCOP(result.capacidad_justificacion_neta)} COP
                </strong>
              </div>

              <div
                style={{
                  padding: '12px',
                  background: result.existe_renta_por_comparacion_patrimonial ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-card)',
                  border: `1px solid ${result.existe_renta_por_comparacion_patrimonial ? 'var(--rose)' : 'var(--border-subtle)'}`,
                  borderRadius: '8px',
                }}
              >
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>
                  Diferencia No Justificada (Art. 236):
                </span>
                <strong
                  style={{
                    fontSize: '16px',
                    fontFamily: 'var(--font-mono)',
                    color: result.existe_renta_por_comparacion_patrimonial ? 'var(--rose)' : 'var(--text-primary)',
                  }}
                >
                  {formatCOP(result.diferencia_no_justificada)} COP
                </strong>
              </div>

              <div
                style={{
                  padding: '12px',
                  background: result.existe_renta_por_comparacion_patrimonial ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.08)',
                  border: `1px solid ${result.existe_renta_por_comparacion_patrimonial ? 'var(--rose)' : 'var(--emerald)'}`,
                  borderRadius: '8px',
                }}
              >
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>
                  Impuesto Adicional Estimado (Art. 241):
                </span>
                <strong
                  style={{
                    fontSize: '18px',
                    fontFamily: 'var(--font-mono)',
                    color: result.existe_renta_por_comparacion_patrimonial ? 'var(--rose)' : 'var(--emerald)',
                  }}
                >
                  {formatCOP(result.impuesto_estimado_comparacion_patrimonial_cop)} COP
                </strong>
              </div>
            </div>

            {/* RECOMENDACIONES DE DEFENSA TRIBUTARIA */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                📋 Recomendaciones de Defensa Tributaria ante la DIAN:
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                {result.recomendaciones_defensa_dian.map((rec, idx) => (
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
              style={{ marginTop: '4px' }}
            >
              {showAuditTrace ? '▲ Ocultar Trazabilidad Matemática' : '▼ Ver Trazabilidad Matemática Paso a Paso'}
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
    </div>
  );
};
