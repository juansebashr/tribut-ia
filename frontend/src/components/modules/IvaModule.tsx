import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { IvaF300Input, IvaF300Output } from '../../types/tax';
import { calculateIvaF300 } from '../../services/api';
import { IvaCalcSubtab } from './Iva/IvaCalcSubtab';
import { IvaF300Subtab } from './Iva/IvaF300Subtab';
import { IvaProrrateoSubtab } from './Iva/IvaProrrateoSubtab';
import { IvaClasificadorSubtab } from './Iva/IvaClasificadorSubtab';
import { WorkspaceHubLanding } from '../common/WorkspaceHubLanding';

export const IvaModule: React.FC = () => {
  const { activeSubTab, navigateTo, taxYear, uvtValue, showToast } = useApp();

  const [inputs, setInputs] = useState<IvaF300Input>({
    tax_year: taxYear,
    custom_uvt: uvtValue,
    tipo_periodicidad: 'BIMESTRAL',
    periodo: 1,
    razon_social: 'DISTRIBUIDORA Y SERVICIOS INTEGRALES S.A.S.',
    nit: '900876543',
    dv: '2',
    actividad_economica: '4711',
    ingresos_bienes_gravados_19: 150000000,
    ingresos_bienes_gravados_5: 20000000,
    ingresos_servicios_gravados_19: 45000000,
    ingresos_servicios_gravados_5: 0,
    operaciones_exentas_art477: 15000000,
    exportaciones_bienes: 0,
    exportaciones_servicios: 0,
    operaciones_excluidas: 10000000,
    operaciones_no_gravadas: 0,
    devoluciones_en_ventas: 0,
    compras_bienes_gravados_19: 90000000,
    compras_bienes_gravados_5: 12000000,
    servicios_gravados_19: 25000000,
    servicios_gravados_5: 0,
    importaciones_gravadas_19: 0,
    importaciones_gravadas_5: 0,
    compras_bienes_excluidos_exentos: 5000000,
    servicios_excluidos_exentos: 2000000,
    iva_comun_sujeto_prorrateo: 3800000,
    devoluciones_en_compras: 0,
    saldo_a_favor_periodo_anterior: 0,
    retenciones_iva_practicadas_a_favor: 2850000,
    sanciones: 0,
  });

  const [result, setResult] = useState<IvaF300Output | null>(null);
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
      const res = await calculateIvaF300(inputs);
      setResult(res);
    } catch (err: any) {
      console.error('Error en cálculo F-300 IVA:', err);
    }
  };

  const loadPresetComercio = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      tipo_periodicidad: 'BIMESTRAL',
      periodo: 1,
      razon_social: 'SUPER TIENDAS & COMERCIO S.A.S.',
      nit: '900555444',
      dv: '3',
      actividad_economica: '4711',
      ingresos_bienes_gravados_19: 180000000,
      ingresos_bienes_gravados_5: 35000000,
      ingresos_servicios_gravados_19: 0,
      ingresos_servicios_gravados_5: 0,
      operaciones_exentas_art477: 0,
      exportaciones_bienes: 0,
      exportaciones_servicios: 0,
      operaciones_excluidas: 0,
      operaciones_no_gravadas: 0,
      devoluciones_en_ventas: 2000000,
      compras_bienes_gravados_19: 110000000,
      compras_bienes_gravados_5: 20000000,
      servicios_gravados_19: 15000000,
      servicios_gravados_5: 0,
      importaciones_gravadas_19: 0,
      importaciones_gravadas_5: 0,
      compras_bienes_excluidos_exentos: 0,
      servicios_excluidos_exentos: 0,
      iva_comun_sujeto_prorrateo: 0,
      devoluciones_en_compras: 0,
      saldo_a_favor_periodo_anterior: 0,
      retenciones_iva_practicadas_a_favor: 2500000,
      sanciones: 0,
    });
    showToast('✓ Preset Comercio Minorista 19% cargado', 'info', 2000);
  };

  const loadPresetMixto = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      tipo_periodicidad: 'CUATRIMESTRAL',
      periodo: 1,
      razon_social: 'AGROINDUSTRIA & ALIMENTOS MIXTOS S.A.S.',
      nit: '901222333',
      dv: '8',
      actividad_economica: '1089',
      ingresos_bienes_gravados_19: 80000000,
      ingresos_bienes_gravados_5: 40000000,
      ingresos_servicios_gravados_19: 10000000,
      ingresos_servicios_gravados_5: 0,
      operaciones_exentas_art477: 30000000,
      exportaciones_bienes: 0,
      exportaciones_servicios: 0,
      operaciones_excluidas: 60000000,
      operaciones_no_gravadas: 0,
      devoluciones_en_ventas: 0,
      compras_bienes_gravados_19: 45000000,
      compras_bienes_gravados_5: 15000000,
      servicios_gravados_19: 12000000,
      servicios_gravados_5: 0,
      importaciones_gravadas_19: 0,
      importaciones_gravadas_5: 0,
      compras_bienes_excluidos_exentos: 25000000,
      servicios_excluidos_exentos: 8000000,
      iva_comun_sujeto_prorrateo: 7600000,
      devoluciones_en_compras: 0,
      saldo_a_favor_periodo_anterior: 0,
      retenciones_iva_practicadas_a_favor: 1800000,
      sanciones: 0,
    });
    showToast('✓ Preset Ventas Mixtas con Prorrateo cargado', 'info', 2000);
  };

  const loadPresetExportador = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      tipo_periodicidad: 'BIMESTRAL',
      periodo: 2,
      razon_social: 'EXPORTADORES DE CAFÉ Y FRUTAS S.A.',
      nit: '860987654',
      dv: '1',
      actividad_economica: '4620',
      ingresos_bienes_gravados_19: 10000000,
      ingresos_bienes_gravados_5: 0,
      ingresos_servicios_gravados_19: 0,
      ingresos_servicios_gravados_5: 0,
      operaciones_exentas_art477: 0,
      exportaciones_bienes: 250000000,
      exportaciones_servicios: 0,
      operaciones_excluidas: 0,
      operaciones_no_gravadas: 0,
      devoluciones_en_ventas: 0,
      compras_bienes_gravados_19: 120000000,
      compras_bienes_gravados_5: 30000000,
      servicios_gravados_19: 35000000,
      servicios_gravados_5: 0,
      importaciones_gravadas_19: 0,
      importaciones_gravadas_5: 0,
      compras_bienes_excluidos_exentos: 40000000,
      servicios_excluidos_exentos: 5000000,
      iva_comun_sujeto_prorrateo: 0,
      devoluciones_en_compras: 0,
      saldo_a_favor_periodo_anterior: 5000000,
      retenciones_iva_practicadas_a_favor: 0,
      sanciones: 0,
    });
    showToast('✓ Preset Exportador (Saldo a Favor) cargado', 'info', 2000);
  };

  const loadPresetSoftware = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      tipo_periodicidad: 'BIMESTRAL',
      periodo: 3,
      razon_social: 'CLOUD TECH SOLUTIONS S.A.S.',
      nit: '901888777',
      dv: '6',
      actividad_economica: '6201',
      ingresos_bienes_gravados_19: 0,
      ingresos_bienes_gravados_5: 0,
      ingresos_servicios_gravados_19: 60000000,
      ingresos_servicios_gravados_5: 0,
      operaciones_exentas_art477: 0,
      exportaciones_bienes: 0,
      exportaciones_servicios: 80000000,
      operaciones_excluidas: 40000000,
      operaciones_no_gravadas: 0,
      devoluciones_en_ventas: 0,
      compras_bienes_gravados_19: 15000000,
      compras_bienes_gravados_5: 0,
      servicios_gravados_19: 25000000,
      servicios_gravados_5: 0,
      importaciones_gravadas_19: 0,
      importaciones_gravadas_5: 0,
      compras_bienes_excluidos_exentos: 10000000,
      servicios_excluidos_exentos: 20000000,
      iva_comun_sujeto_prorrateo: 4500000,
      devoluciones_en_compras: 0,
      saldo_a_favor_periodo_anterior: 0,
      retenciones_iva_practicadas_a_favor: 1500000,
      sanciones: 0,
    });
    showToast('✓ Preset Empresa de Software & SaaS cargado', 'info', 2000);
  };

  const currentSubTab = activeSubTab || 'calc';

  return (
    <div id="module-iva">
      {/* CONTENIDO DE CADA SUBPESTAÑA */}
      {(currentSubTab === 'hub' || currentSubTab === 'overview') && (
        <WorkspaceHubLanding workspace="periodicos" />
      )}

      {currentSubTab === 'calc' && (
        <IvaCalcSubtab
          inputs={inputs}
          setInputs={setInputs}
          result={result}
          onOpenAudit={() => setIsAuditModalOpen(true)}
          onNavigateToF300={() => navigateTo('iva', 'f300')}
          onNavigateToProrrateo={() => navigateTo('iva', 'prorrateo')}
          onNavigateToClasificador={() => navigateTo('iva', 'clasificador')}
          loadPresetComercio={loadPresetComercio}
          loadPresetMixto={loadPresetMixto}
          loadPresetExportador={loadPresetExportador}
          loadPresetSoftware={loadPresetSoftware}
        />
      )}

      {currentSubTab === 'f300' && (
        <IvaF300Subtab result={result} onNavigateToCalc={() => navigateTo('iva', 'calc')} />
      )}

      {currentSubTab === 'prorrateo' && <IvaProrrateoSubtab />}

      {currentSubTab === 'clasificador' && <IvaClasificadorSubtab />}

      {/* MODAL DE TRAZABILIDAD Y AUDITORÍA IVA */}
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
                  🔍 Trazabilidad y Memoria Fiscal de IVA (Formulario 300)
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Audit Trail determinista del Impuesto sobre las Ventas (Art. 420 a 512-22 E.T.)
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
                          background: 'rgba(37, 99, 235, 0.15)',
                          color: '#2563eb',
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
                    <div>Resultado Final: <strong style={{ color: '#2563eb' }}>${item.final_allowed_cop.toLocaleString('es-CO')}</strong></div>
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
