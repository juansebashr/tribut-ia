import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { PersonaJuridicaInput, PersonaJuridicaOutput } from '../../types/tax';
import { calculatePersonaJuridica } from '../../services/api';
import { PjCalcSubtab } from './PersonaJuridica/PjCalcSubtab';
import { PjF110Subtab } from './PersonaJuridica/PjF110Subtab';
import { PjTtdSubtab } from './PersonaJuridica/PjTtdSubtab';
import { PjSobretasasSubtab } from './PersonaJuridica/PjSobretasasSubtab';
import { PjConciliacionSubtab } from './PersonaJuridica/PjConciliacionSubtab';
import { WorkspaceHubLanding } from '../common/WorkspaceHubLanding';

export const PersonaJuridicaModule: React.FC = () => {
  const { activeSubTab, navigateTo, taxYear, uvtValue, showToast } = useApp();

  const [inputs, setInputs] = useState<PersonaJuridicaInput>({
    tax_year: taxYear,
    custom_uvt: uvtValue,
    tarifa_personalizada: undefined,
    tipo_regimen: 'general',
    aplica_sobretasa_financiera: false,
    aplica_sobretasa_hidroelectrica: false,
    sobretasa_minero_petroleo_pct: 0,
    total_costos_gastos_nomina: 250000000,
    aportes_seguridad_social: 55000000,
    aportes_sena_icbf_cajas: 15000000,
    efectivo_y_equivalentes: 120000000,
    inversiones_derivados: 50000000,
    cuentas_por_cobrar: 280000000,
    inventarios: 350000000,
    activos_intangibles: 0,
    activos_biologicos: 0,
    propiedades_planta_equipo: 650000000,
    otros_activos: 25000000,
    pasivos: 450000000,
    ingresos_brutos_operacionales: 1250000000,
    ingresos_brutos_no_operacionales: 45000000,
    ingresos_financieros: 0,
    dividendos_no_constitutivos: 0,
    dividendos_gravados_tarifa_general: 0,
    otros_ingresos: 0,
    devoluciones_rebajas_descuentos: 15000000,
    ingresos_no_constitutivos_renta: 30000000,
    costos_procedentes: 620000000,
    gastos_administracion: 180000000,
    gastos_ventas: 95000000,
    gastos_financieros: 25000000,
    otros_gastos_deducciones: 0,
    gastos_no_deducibles: 18000000,
    deducciones_especiales: 12000000,
    rentas_exentas: 0,
    compensacion_perdidas_fiscales: 0,
    compensacion_exceso_renta_presuntiva: 0,
    utilidad_contable_antes_impuestos: 350000000,
    diferencias_permanentes_ttd: 15000000,
    ganancias_ocasionales_brutas: 0,
    costos_ganancia_ocasional: 0,
    ganancias_ocasionales_exentas: 0,
    ganancia_ocasional_gravable: 0,
    descuento_tributario_ica: 8500000,
    otros_descuentos_tributarios: 0,
    obras_por_impuestos_mod1: 0,
    descuento_obras_mod2: 0,
    credito_fiscal_256_1: 0,
    retenciones_en_la_fuente: 42000000,
    autorretenciones_practicadas: 18500000,
    anticipo_ano_anterior: 28000000,
    saldo_a_favor_ano_anterior: 0,
    anticipo_sobretasa_ano_anterior: 0,
    porcentaje_anticipo_siguiente: 0.75,
    sanciones: 0,
    aporte_voluntario_art244_1: 0,
  });

  const [result, setResult] = useState<PersonaJuridicaOutput | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  // Sync year and uvt changes
  useEffect(() => {
    setInputs((prev) => ({ ...prev, tax_year: taxYear, custom_uvt: uvtValue }));
  }, [taxYear, uvtValue]);

  // Recalculate on inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      runCalculation();
    }, 100);
    return () => clearTimeout(timer);
  }, [inputs]);

  const runCalculation = async () => {
    try {
      const res = await calculatePersonaJuridica(inputs);
      setResult(res);
    } catch (err: any) {
      console.error('Error calculando Persona Jurídica:', err);
    }
  };

  // PRESETS
  const loadPresetComercial = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      tipo_regimen: 'general',
      aplica_sobretasa_financiera: false,
      aplica_sobretasa_hidroelectrica: false,
      sobretasa_minero_petroleo_pct: 0,
      total_costos_gastos_nomina: 250000000,
      aportes_seguridad_social: 55000000,
      aportes_sena_icbf_cajas: 15000000,
      efectivo_y_equivalentes: 120000000,
      inversiones_derivados: 50000000,
      cuentas_por_cobrar: 280000000,
      inventarios: 350000000,
      activos_intangibles: 0,
      activos_biologicos: 0,
      propiedades_planta_equipo: 650000000,
      otros_activos: 25000000,
      pasivos: 450000000,
      ingresos_brutos_operacionales: 1250000000,
      ingresos_brutos_no_operacionales: 45000000,
      devoluciones_rebajas_descuentos: 15000000,
      ingresos_no_constitutivos_renta: 30000000,
      costos_procedentes: 620000000,
      gastos_administracion: 180000000,
      gastos_ventas: 95000000,
      gastos_financieros: 25000000,
      otros_gastos_deducciones: 0,
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
      porcentaje_anticipo_siguiente: 0.75,
      sanciones: 0,
    });
    showToast('✓ Preset Empresa Comercial Estándar cargado', 'info', 2000);
  };

  const loadPresetTech = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      tipo_regimen: 'general',
      aplica_sobretasa_financiera: false,
      aplica_sobretasa_hidroelectrica: false,
      sobretasa_minero_petroleo_pct: 0,
      total_costos_gastos_nomina: 400000000,
      aportes_seguridad_social: 88000000,
      aportes_sena_icbf_cajas: 0,
      efectivo_y_equivalentes: 300000000,
      inversiones_derivados: 100000000,
      cuentas_por_cobrar: 180000000,
      inventarios: 0,
      activos_intangibles: 80000000,
      activos_biologicos: 0,
      propiedades_planta_equipo: 120000000,
      otros_activos: 20000000,
      pasivos: 150000000,
      ingresos_brutos_operacionales: 1800000000,
      ingresos_brutos_no_operacionales: 60000000,
      devoluciones_rebajas_descuentos: 0,
      ingresos_no_constitutivos_renta: 0,
      costos_procedentes: 500000000,
      gastos_administracion: 220000000,
      gastos_ventas: 140000000,
      gastos_financieros: 15000000,
      otros_gastos_deducciones: 0,
      gastos_no_deducibles: 10000000,
      deducciones_especiales: 45000000, // I+D y 1er empleo
      rentas_exentas: 0,
      compensacion_perdidas_fiscales: 0,
      compensacion_exceso_renta_presuntiva: 0,
      utilidad_contable_antes_impuestos: 850000000,
      diferencias_permanentes_ttd: 20000000,
      ganancia_ocasional_gravable: 0,
      descuento_tributario_ica: 12000000,
      otros_descuentos_tributarios: 0,
      retenciones_en_la_fuente: 65000000,
      autorretenciones_practicadas: 28000000,
      anticipo_ano_anterior: 45000000,
      saldo_a_favor_ano_anterior: 0,
      porcentaje_anticipo_siguiente: 0.75,
      sanciones: 0,
    });
    showToast('✓ Preset Empresa de Servicios Tech & I+D cargado', 'info', 2000);
  };

  const loadPresetZonaFranca = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      tipo_regimen: 'zona_franca',
      aplica_sobretasa_financiera: false,
      aplica_sobretasa_hidroelectrica: false,
      sobretasa_minero_petroleo_pct: 0,
      total_costos_gastos_nomina: 500000000,
      aportes_seguridad_social: 110000000,
      aportes_sena_icbf_cajas: 25000000,
      efectivo_y_equivalentes: 450000000,
      inversiones_derivados: 200000000,
      cuentas_por_cobrar: 600000000,
      inventarios: 800000000,
      activos_intangibles: 0,
      activos_biologicos: 0,
      propiedades_planta_equipo: 1500000000,
      otros_activos: 50000000,
      pasivos: 900000000,
      ingresos_brutos_operacionales: 3500000000,
      ingresos_brutos_no_operacionales: 80000000,
      devoluciones_rebajas_descuentos: 40000000,
      ingresos_no_constitutivos_renta: 0,
      costos_procedentes: 1800000000,
      gastos_administracion: 400000000,
      gastos_ventas: 250000000,
      gastos_financieros: 60000000,
      otros_gastos_deducciones: 0,
      gastos_no_deducibles: 20000000,
      deducciones_especiales: 0,
      rentas_exentas: 0,
      compensacion_perdidas_fiscales: 0,
      compensacion_exceso_renta_presuntiva: 0,
      utilidad_contable_antes_impuestos: 1050000000,
      diferencias_permanentes_ttd: 30000000,
      ganancia_ocasional_gravable: 0,
      descuento_tributario_ica: 15000000,
      otros_descuentos_tributarios: 0,
      retenciones_en_la_fuente: 80000000,
      autorretenciones_practicadas: 40000000,
      anticipo_ano_anterior: 60000000,
      saldo_a_favor_ano_anterior: 0,
      porcentaje_anticipo_siguiente: 0.75,
      sanciones: 0,
    });
    showToast('✓ Preset Usuario Industrial Zona Franca (20%) cargado', 'info', 2000);
  };

  const loadPresetFinanciera = () => {
    const uvt = uvtValue || 49799;
    const rlg = 140000 * uvt; // > 120.000 UVT
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      tipo_regimen: 'general',
      aplica_sobretasa_financiera: true,
      aplica_sobretasa_hidroelectrica: false,
      sobretasa_minero_petroleo_pct: 0,
      total_costos_gastos_nomina: 1200000000,
      aportes_seguridad_social: 260000000,
      aportes_sena_icbf_cajas: 60000000,
      efectivo_y_equivalentes: 2500000000,
      inversiones_derivados: 8000000000,
      cuentas_por_cobrar: 12000000000,
      inventarios: 0,
      activos_intangibles: 300000000,
      activos_biologicos: 0,
      propiedades_planta_equipo: 1800000000,
      otros_activos: 400000000,
      pasivos: 18000000000,
      ingresos_brutos_operacionales: rlg + 1500000000,
      ingresos_brutos_no_operacionales: 250000000,
      devoluciones_rebajas_descuentos: 0,
      ingresos_no_constitutivos_renta: 50000000,
      costos_procedentes: 1200000000,
      gastos_administracion: 400000000,
      gastos_ventas: 150000000,
      gastos_financieros: 0,
      otros_gastos_deducciones: 0,
      gastos_no_deducibles: 30000000,
      deducciones_especiales: 0,
      rentas_exentas: 0,
      compensacion_perdidas_fiscales: 0,
      compensacion_exceso_renta_presuntiva: 0,
      utilidad_contable_antes_impuestos: rlg,
      diferencias_permanentes_ttd: 40000000,
      ganancia_ocasional_gravable: 0,
      descuento_tributario_ica: 25000000,
      otros_descuentos_tributarios: 0,
      retenciones_en_la_fuente: 150000000,
      autorretenciones_practicadas: 90000000,
      anticipo_ano_anterior: 200000000,
      saldo_a_favor_ano_anterior: 0,
      porcentaje_anticipo_siguiente: 0.75,
      sanciones: 0,
    });
    showToast('✓ Preset Entidad Financiera (Sobretasa +5%) cargado', 'info', 2000);
  };

  const currentSubTab = activeSubTab || 'calc';

  return (
    <div id="module-persona-juridica">
      {/* CONTENIDO DE CADA SUBPESTAÑA */}
      {(currentSubTab === 'hub' || currentSubTab === 'overview') && (
        <WorkspaceHubLanding workspace="juridicas" />
      )}

      {currentSubTab === 'calc' && (
        <PjCalcSubtab
          inputs={inputs}
          setInputs={setInputs}
          result={result}
          onOpenAudit={() => setIsAuditModalOpen(true)}
          onNavigateToF110={() => navigateTo('pj', 'f110')}
          onNavigateToTtd={() => navigateTo('pj', 'ttd')}
          onNavigateToSobretasas={() => navigateTo('pj', 'sobretasas')}
          loadPresetComercial={loadPresetComercial}
          loadPresetTech={loadPresetTech}
          loadPresetZonaFranca={loadPresetZonaFranca}
          loadPresetFinanciera={loadPresetFinanciera}
        />
      )}

      {currentSubTab === 'f110' && (
        <PjF110Subtab result={result} onNavigateToCalc={() => navigateTo('pj', 'calc')} />
      )}

      {currentSubTab === 'ttd' && <PjTtdSubtab />}

      {currentSubTab === 'sobretasas' && <PjSobretasasSubtab />}

      {currentSubTab === 'conciliacion' && <PjConciliacionSubtab />}

      {/* MODAL DE TRAZABILIDAD Y AUDITORÍA */}
      {isAuditModalOpen && result && (
        <div
          className="modal-backdrop"
          onClick={() => setIsAuditModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-primary)',
              borderRadius: '12px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '12px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                  🔍 Trazabilidad y Memoria de Cálculo Fiscal (Formulario 110)
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Audit Trail determinista paso a paso con fundamentos del Estatuto Tributario
                </span>
              </div>
              <button
                className="btn btn-outline btn-xs"
                onClick={() => setIsAuditModalOpen(false)}
                style={{ fontSize: '16px', padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {result.audit_trace.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800 }}>
                      {idx + 1}. {item.title}
                    </span>
                    {item.statutory_reference && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          background: 'var(--primary-light, #e0e7ff)',
                          color: 'var(--primary, #4338ca)',
                          borderRadius: '4px',
                        }}
                      >
                        {item.statutory_reference}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                    {item.notes}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    {item.raw_input_cop !== undefined && (
                      <div>Valor Base: <strong>${item.raw_input_cop.toLocaleString('es-CO')}</strong></div>
                    )}
                    <div>Valor Determinado: <strong>${item.calculated_cop.toLocaleString('es-CO')}</strong></div>
                    <div>Resultado Final: <strong style={{ color: 'var(--primary)' }}>${item.final_allowed_cop.toLocaleString('es-CO')}</strong></div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setIsAuditModalOpen(false)}>
                Entendido y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
