import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { RegimenSimpleInput, RegimenSimpleOutput } from '../../types/tax';
import { calculateRegimenSimple } from '../../services/api';
import { SimpleCalcSubtab } from './RegimenSimple/SimpleCalcSubtab';
import { SimpleF260Subtab } from './RegimenSimple/SimpleF260Subtab';
import { SimpleComparadorSubtab } from './RegimenSimple/SimpleComparadorSubtab';
import { SimpleF2593Subtab } from './RegimenSimple/SimpleF2593Subtab';
import { SimpleRequisitosSubtab } from './RegimenSimple/SimpleRequisitosSubtab';
import { WorkspaceHubLanding } from '../common/WorkspaceHubLanding';

export const RegimenSimpleModule: React.FC = () => {
  const { activeSubTab, navigateTo, taxYear, uvtValue, showToast } = useApp();

  const [inputs, setInputs] = useState<RegimenSimpleInput>({
    tax_year: taxYear,
    custom_uvt: uvtValue,
    grupo_actividad: 2,
    razon_social_o_nombre: 'DISTRIBUIDORA COMERCIAL NACIONAL S.A.S.',
    nit: '900876543',
    dv: '2',
    patrimonio_bruto: 450000000,
    pasivos: 120000000,
    ingresos_brutos_nacionales: 550000000,
    ingresos_brutos_exterior: 0,
    ingresos_no_constitutivos_renta: 0,
    tarifa_ica_consolidada_x_mil: 7.0,
    componente_ica_territorial_fijo: null,
    aportes_pension_empleador_ano: 9600000,
    ventas_por_medios_electronicos: 280000000,
    gmf_pagado: 0,
    ingresos_servicio_comidas_bebidas: 0,
    ganancias_ocasionales_brutas: 0,
    costos_ganancia_ocasional: 0,
    ganancias_ocasionales_exentas: 0,
    anticipos_simple_pagados: [1200000, 1200000, 1200000, 1200000, 1200000, 1200000],
    anticipos_inc_pagados: [0, 0, 0, 0, 0, 0],
    retenciones_antes_pertenecer_simple: 0,
    anticipo_renta_ano_anterior: 0,
    saldo_a_favor_simple_ano_anterior: 0,
    saldo_a_favor_inc_ano_anterior: 0,
    saldo_a_favor_go_ano_anterior: 0,
    sanciones_simple: 0,
    sanciones_ica: 0,
    sanciones_inc: 0,
    sanciones_go: 0,
  });

  const [result, setResult] = useState<RegimenSimpleOutput | null>(null);
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
      const res = await calculateRegimenSimple(inputs);
      setResult(res);
    } catch (err: any) {
      console.error('Error calculando Régimen Simple:', err);
    }
  };

  // PRESETS POR GRUPO DE ACTIVIDAD
  const loadPresetGrupo1 = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      grupo_actividad: 1,
      razon_social_o_nombre: 'MINIMERCADO LA GRAN ESQUINA',
      nit: '1018293847',
      dv: '1',
      patrimonio_bruto: 180000000,
      pasivos: 40000000,
      ingresos_brutos_nacionales: 220000000,
      ingresos_brutos_exterior: 0,
      ingresos_no_constitutivos_renta: 0,
      tarifa_ica_consolidada_x_mil: 5.0,
      componente_ica_territorial_fijo: null,
      aportes_pension_empleador_ano: 4800000,
      ventas_por_medios_electronicos: 120000000,
      gmf_pagado: 0,
      ingresos_servicio_comidas_bebidas: 0,
      anticipos_simple_pagados: [400000, 400000, 400000, 400000, 400000, 400000],
      anticipos_inc_pagados: [0, 0, 0, 0, 0, 0],
      retenciones_antes_pertenecer_simple: 0,
      anticipo_renta_ano_anterior: 0,
      saldo_a_favor_simple_ano_anterior: 0,
      sanciones_simple: 0,
    });
    showToast('✓ Preset Grupo 1: Tiendas y Peluquerías cargado', 'info', 2000);
  };

  const loadPresetGrupo2 = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      grupo_actividad: 2,
      razon_social_o_nombre: 'DISTRIBUIDORA COMERCIAL NACIONAL S.A.S.',
      nit: '900876543',
      dv: '2',
      patrimonio_bruto: 450000000,
      pasivos: 120000000,
      ingresos_brutos_nacionales: 550000000,
      ingresos_brutos_exterior: 0,
      ingresos_no_constitutivos_renta: 0,
      tarifa_ica_consolidada_x_mil: 7.0,
      componente_ica_territorial_fijo: null,
      aportes_pension_empleador_ano: 9600000,
      ventas_por_medios_electronicos: 280000000,
      gmf_pagado: 0,
      ingresos_servicio_comidas_bebidas: 0,
      anticipos_simple_pagados: [1200000, 1200000, 1200000, 1200000, 1200000, 1200000],
      anticipos_inc_pagados: [0, 0, 0, 0, 0, 0],
      retenciones_antes_pertenecer_simple: 0,
      anticipo_renta_ano_anterior: 0,
      saldo_a_favor_simple_ano_anterior: 0,
      sanciones_simple: 0,
    });
    showToast('✓ Preset Grupo 2: Comercio e Industria cargado', 'info', 2000);
  };

  const loadPresetGrupo3 = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      grupo_actividad: 3,
      razon_social_o_nombre: 'RESTAURANTE EL BUEN SABOR S.A.S.',
      nit: '901234567',
      dv: '8',
      patrimonio_bruto: 320000000,
      pasivos: 90000000,
      ingresos_brutos_nacionales: 480000000,
      ingresos_brutos_exterior: 0,
      ingresos_no_constitutivos_renta: 0,
      tarifa_ica_consolidada_x_mil: 8.0,
      componente_ica_territorial_fijo: null,
      aportes_pension_empleador_ano: 8400000,
      ventas_por_medios_electronicos: 350000000,
      gmf_pagado: 0,
      ingresos_servicio_comidas_bebidas: 480000000,
      anticipos_simple_pagados: [1000000, 1000000, 1000000, 1000000, 1000000, 1000000],
      anticipos_inc_pagados: [6000000, 6000000, 6000000, 6000000, 6000000, 6000000],
      retenciones_antes_pertenecer_simple: 0,
      anticipo_renta_ano_anterior: 0,
      saldo_a_favor_simple_ano_anterior: 0,
      sanciones_simple: 0,
    });
    showToast('✓ Preset Grupo 3: Restaurante con INC 8% cargado', 'info', 2000);
  };

  const loadPresetGrupo4 = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      grupo_actividad: 4,
      razon_social_o_nombre: 'CENTRO EDUCATIVO & SALUD INTEGRAL',
      nit: '900345678',
      dv: '5',
      patrimonio_bruto: 600000000,
      pasivos: 150000000,
      ingresos_brutos_nacionales: 750000000,
      ingresos_brutos_exterior: 0,
      ingresos_no_constitutivos_renta: 0,
      tarifa_ica_consolidada_x_mil: 6.0,
      componente_ica_territorial_fijo: null,
      aportes_pension_empleador_ano: 16000000,
      ventas_por_medios_electronicos: 400000000,
      gmf_pagado: 0,
      ingresos_servicio_comidas_bebidas: 0,
      anticipos_simple_pagados: [3000000, 3000000, 3000000, 3000000, 3000000, 3000000],
      anticipos_inc_pagados: [0, 0, 0, 0, 0, 0],
      retenciones_antes_pertenecer_simple: 0,
      anticipo_renta_ano_anterior: 0,
      saldo_a_favor_simple_ano_anterior: 0,
      sanciones_simple: 0,
    });
    showToast('✓ Preset Grupo 4: Educación y Salud cargado', 'info', 2000);
  };

  const loadPresetGrupo5 = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      grupo_actividad: 5,
      razon_social_o_nombre: 'CONSULTORÍA JURÍDICA & TRIBUTARIA S.A.S.',
      nit: '900456789',
      dv: '3',
      patrimonio_bruto: 280000000,
      pasivos: 50000000,
      ingresos_brutos_nacionales: 380000000, // ~7.630 UVT (< 12.000 UVT)
      ingresos_brutos_exterior: 0,
      ingresos_no_constitutivos_renta: 0,
      tarifa_ica_consolidada_x_mil: 9.66,
      componente_ica_territorial_fijo: null,
      aportes_pension_empleador_ano: 7200000,
      ventas_por_medios_electronicos: 250000000,
      gmf_pagado: 0,
      ingresos_servicio_comidas_bebidas: 0,
      anticipos_simple_pagados: [4000000, 4000000, 4000000, 4000000, 4000000, 4000000],
      anticipos_inc_pagados: [0, 0, 0, 0, 0, 0],
      retenciones_antes_pertenecer_simple: 0,
      anticipo_renta_ano_anterior: 0,
      saldo_a_favor_simple_ano_anterior: 0,
      sanciones_simple: 0,
    });
    showToast('✓ Preset Grupo 5: Servicios Profesionales cargado', 'info', 2000);
  };

  const loadPresetGrupo6 = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      grupo_actividad: 6,
      razon_social_o_nombre: 'RECICLADORA NACIONAL VERDE S.A.S.',
      nit: '900567890',
      dv: '9',
      patrimonio_bruto: 400000000,
      pasivos: 100000000,
      ingresos_brutos_nacionales: 900000000,
      ingresos_brutos_exterior: 0,
      ingresos_no_constitutivos_renta: 0,
      tarifa_ica_consolidada_x_mil: 6.0,
      componente_ica_territorial_fijo: null,
      aportes_pension_empleador_ano: 12000000,
      ventas_por_medios_electronicos: 300000000,
      gmf_pagado: 0,
      ingresos_servicio_comidas_bebidas: 0,
      anticipos_simple_pagados: [2000000, 2000000, 2000000, 2000000, 2000000, 2000000],
      anticipos_inc_pagados: [0, 0, 0, 0, 0, 0],
      retenciones_antes_pertenecer_simple: 0,
      anticipo_renta_ano_anterior: 0,
      saldo_a_favor_simple_ano_anterior: 0,
      sanciones_simple: 0,
    });
    showToast('✓ Preset Grupo 6: Reciclaje (Tarifa 1.62%) cargado', 'info', 2000);
  };

  const currentSubTab = activeSubTab || 'calc';

  return (
    <div id="module-regimen-simple">
      {/* CONTENIDO DE CADA SUBPESTAÑA */}
      {(currentSubTab === 'hub' || currentSubTab === 'overview') && (
        <WorkspaceHubLanding workspace="juridicas" />
      )}

      {currentSubTab === 'calc' && (
        <SimpleCalcSubtab
          inputs={inputs}
          setInputs={setInputs}
          result={result}
          onOpenAudit={() => setIsAuditModalOpen(true)}
          onNavigateToF260={() => navigateTo('simple', 'f260')}
          onNavigateToComparador={() => navigateTo('simple', 'comparador')}
          onNavigateToF2593={() => navigateTo('simple', 'f2593')}
          loadPresetGrupo1={loadPresetGrupo1}
          loadPresetGrupo2={loadPresetGrupo2}
          loadPresetGrupo3={loadPresetGrupo3}
          loadPresetGrupo4={loadPresetGrupo4}
          loadPresetGrupo5={loadPresetGrupo5}
          loadPresetGrupo6={loadPresetGrupo6}
        />
      )}

      {currentSubTab === 'f260' && (
        <SimpleF260Subtab result={result} onNavigateToCalc={() => navigateTo('simple', 'calc')} />
      )}

      {currentSubTab === 'comparador' && <SimpleComparadorSubtab />}

      {currentSubTab === 'f2593' && <SimpleF2593Subtab />}

      {currentSubTab === 'requisitos' && <SimpleRequisitosSubtab />}

      {/* MODAL DE TRAZABILIDAD Y AUDITORÍA SIMPLE */}
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
                  🔍 Trazabilidad y Memoria Fiscal (Formulario 260)
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Audit Trail determinista del Régimen Simple de Tributación (Art. 903 a 916 E.T.)
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
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#059669',
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
                      <div>Base: <strong>${item.raw_input_cop.toLocaleString('es-CO')}</strong></div>
                    )}
                    <div>Calculado: <strong>${item.calculated_cop.toLocaleString('es-CO')}</strong></div>
                    <div>Resultado Final: <strong style={{ color: '#059669' }}>${item.final_allowed_cop.toLocaleString('es-CO')}</strong></div>
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
