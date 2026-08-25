import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { RetefuenteF350Input, RetefuenteF350Output } from '../../types/tax';
import { calculateRetefuenteF350 } from '../../services/api';
import { RetefuenteCalcSubtab } from './Retefuente/RetefuenteCalcSubtab';
import { RetefuenteF350Subtab } from './Retefuente/RetefuenteF350Subtab';
import { RetefuenteLaboralSubtab } from './Retefuente/RetefuenteLaboralSubtab';
import { RetefuenteTablaSubtab } from './Retefuente/RetefuenteTablaSubtab';

export const RetefuenteModule: React.FC = () => {
  const { activeSubTab, navigateTo, taxYear, uvtValue, showToast } = useApp();

  const [inputs, setInputs] = useState<RetefuenteF350Input>({
    tax_year: taxYear,
    custom_uvt: uvtValue,
    periodo_mes: 1,
    razon_social: 'DISTRIBUIDORA COMERCIAL NACIONAL S.A.S.',
    nit: '900876543',
    dv: '2',
    base_rentas_trabajo: 35000000,
    retencion_rentas_trabajo: 1850000,
    base_honorarios_declarante: 12000000,
    base_honorarios_no_declarante: 4000000,
    base_comisiones_declarante: 6000000,
    base_comisiones_no_declarante: 0,
    base_servicios_declarante: 15000000,
    base_servicios_no_declarante: 2000000,
    base_servicios_transporte_carga: 8000000,
    base_compras_declarante: 45000000,
    base_compras_no_declarante: 3000000,
    base_arrendamiento_inmuebles: 6000000,
    base_arrendamiento_muebles: 1500000,
    base_rendimientos_financieros: 1200000,
    base_enajenacion_activos_fijos: 0,
    base_pagos_exterior_servicios: 4000000,
    base_pagos_exterior_paraisos: 0,
    ingresos_brutos_propios_mes: 80000000,
    tarifa_autorretencion_especial_pct: 0.55,
    otras_autorretenciones_valor: 0,
    base_iva_sujeto_reteiva: 8550000,
    reteiva_servicios_exterior: 0,
    base_impuesto_timbre: 0,
    tarifa_timbre_pct: 0,
    sanciones: 0,
  });

  const [result, setResult] = useState<RetefuenteF350Output | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

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
      const res = await calculateRetefuenteF350(inputs);
      setResult(res);
    } catch (err: any) {
      console.error('Error en cálculo F-350:', err);
    }
  };

  const loadPresetPyme = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      periodo_mes: 1,
      razon_social: 'PYME ANDINA INTEGRAL S.A.S.',
      nit: '900111222',
      dv: '5',
      base_rentas_trabajo: 20000000,
      retencion_rentas_trabajo: 850000,
      base_honorarios_declarante: 8000000,
      base_honorarios_no_declarante: 2000000,
      base_comisiones_declarante: 0,
      base_comisiones_no_declarante: 0,
      base_servicios_declarante: 10000000,
      base_servicios_no_declarante: 0,
      base_servicios_transporte_carga: 3000000,
      base_compras_declarante: 30000000,
      base_compras_no_declarante: 0,
      base_arrendamiento_inmuebles: 4000000,
      base_arrendamiento_muebles: 0,
      base_rendimientos_financieros: 500000,
      base_enajenacion_activos_fijos: 0,
      base_pagos_exterior_servicios: 0,
      base_pagos_exterior_paraisos: 0,
      ingresos_brutos_propios_mes: 50000000,
      tarifa_autorretencion_especial_pct: 0.55,
      otras_autorretenciones_valor: 0,
      base_iva_sujeto_reteiva: 0,
      reteiva_servicios_exterior: 0,
      base_impuesto_timbre: 0,
      tarifa_timbre_pct: 0,
      sanciones: 0,
    });
    showToast('✓ Preset Pyme Estándar cargado', 'info', 2000);
  };

  const loadPresetComercial = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      periodo_mes: 2,
      razon_social: 'GRANDES ALMACENES COMERCIALES S.A.',
      nit: '860012345',
      dv: '9',
      base_rentas_trabajo: 60000000,
      retencion_rentas_trabajo: 4200000,
      base_honorarios_declarante: 15000000,
      base_honorarios_no_declarante: 0,
      base_comisiones_declarante: 10000000,
      base_comisiones_no_declarante: 0,
      base_servicios_declarante: 25000000,
      base_servicios_no_declarante: 0,
      base_servicios_transporte_carga: 18000000,
      base_compras_declarante: 120000000,
      base_compras_no_declarante: 5000000,
      base_arrendamiento_inmuebles: 12000000,
      base_arrendamiento_muebles: 3000000,
      base_rendimientos_financieros: 2500000,
      base_enajenacion_activos_fijos: 0,
      base_pagos_exterior_servicios: 8000000,
      base_pagos_exterior_paraisos: 0,
      ingresos_brutos_propios_mes: 250000000,
      tarifa_autorretencion_especial_pct: 1.10,
      otras_autorretenciones_valor: 0,
      base_iva_sujeto_reteiva: 22800000,
      reteiva_servicios_exterior: 0,
      base_impuesto_timbre: 0,
      tarifa_timbre_pct: 0,
      sanciones: 0,
    });
    showToast('✓ Preset Empresa Comercial cargado', 'info', 2000);
  };

  const loadPresetServicios = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      periodo_mes: 3,
      razon_social: 'CONSULTORÍA & ESTRATEGIA LEGAL S.A.S.',
      nit: '901234567',
      dv: '1',
      base_rentas_trabajo: 45000000,
      retencion_rentas_trabajo: 3100000,
      base_honorarios_declarante: 30000000,
      base_honorarios_no_declarante: 8000000,
      base_comisiones_declarante: 5000000,
      base_comisiones_no_declarante: 0,
      base_servicios_declarante: 12000000,
      base_servicios_no_declarante: 1500000,
      base_servicios_transporte_carga: 0,
      base_compras_declarante: 8000000,
      base_compras_no_declarante: 0,
      base_arrendamiento_inmuebles: 7000000,
      base_arrendamiento_muebles: 2000000,
      base_rendimientos_financieros: 800000,
      base_enajenacion_activos_fijos: 0,
      base_pagos_exterior_servicios: 6000000,
      base_pagos_exterior_paraisos: 0,
      ingresos_brutos_propios_mes: 120000000,
      tarifa_autorretencion_especial_pct: 0.55,
      otras_autorretenciones_valor: 0,
      base_iva_sujeto_reteiva: 5700000,
      reteiva_servicios_exterior: 0,
      base_impuesto_timbre: 0,
      tarifa_timbre_pct: 0,
      sanciones: 0,
    });
    showToast('✓ Preset Servicios y Honorarios cargado', 'info', 2000);
  };

  const loadPresetExterior = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      periodo_mes: 4,
      razon_social: 'GLOBAL TECH COLOMBIA S.A.S.',
      nit: '900999888',
      dv: '4',
      base_rentas_trabajo: 50000000,
      retencion_rentas_trabajo: 3800000,
      base_honorarios_declarante: 10000000,
      base_honorarios_no_declarante: 0,
      base_comisiones_declarante: 0,
      base_comisiones_no_declarante: 0,
      base_servicios_declarante: 15000000,
      base_servicios_no_declarante: 0,
      base_servicios_transporte_carga: 0,
      base_compras_declarante: 12000000,
      base_compras_no_declarante: 0,
      base_arrendamiento_inmuebles: 8000000,
      base_arrendamiento_muebles: 5000000,
      base_rendimientos_financieros: 1000000,
      base_enajenacion_activos_fijos: 0,
      base_pagos_exterior_servicios: 35000000,
      base_pagos_exterior_paraisos: 10000000,
      ingresos_brutos_propios_mes: 180000000,
      tarifa_autorretencion_especial_pct: 0.55,
      otras_autorretenciones_valor: 0,
      base_iva_sujeto_reteiva: 6650000,
      reteiva_servicios_exterior: 2500000,
      base_impuesto_timbre: 0,
      tarifa_timbre_pct: 0,
      sanciones: 0,
    });
    showToast('✓ Preset Pagos al Exterior y Software cargado', 'info', 2000);
  };

  const currentSubTab = activeSubTab || 'calc';

  return (
    <div id="module-retefuente">
      {/* CONTENIDO DE CADA SUBPESTAÑA */}
      {currentSubTab === 'calc' && (
        <RetefuenteCalcSubtab
          inputs={inputs}
          setInputs={setInputs}
          result={result}
          onOpenAudit={() => setIsAuditModalOpen(true)}
          onNavigateToF350={() => navigateTo('retefuente', 'f350')}
          onNavigateToLaboral={() => navigateTo('retefuente', 'laboral')}
          onNavigateToTabla={() => navigateTo('retefuente', 'tabla')}
          loadPresetPyme={loadPresetPyme}
          loadPresetComercial={loadPresetComercial}
          loadPresetServicios={loadPresetServicios}
          loadPresetExterior={loadPresetExterior}
        />
      )}

      {currentSubTab === 'f350' && (
        <RetefuenteF350Subtab result={result} onNavigateToCalc={() => navigateTo('retefuente', 'calc')} />
      )}

      {currentSubTab === 'laboral' && <RetefuenteLaboralSubtab />}

      {currentSubTab === 'tabla' && <RetefuenteTablaSubtab />}

      {/* MODAL DE TRAZABILIDAD Y AUDITORÍA RETEFUENTE */}
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
                  🔍 Trazabilidad y Memoria Fiscal (Formulario 350)
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Audit Trail determinista de Retenciones en la Fuente (Art. 365 a 437-2 E.T.)
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
                          background: 'rgba(2, 132, 199, 0.15)',
                          color: '#0284c7',
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
                    <div>Resultado Final: <strong style={{ color: '#0284c7' }}>${item.final_allowed_cop.toLocaleString('es-CO')}</strong></div>
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
