import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { PersonaNaturalInput, PersonaNaturalOutput } from '../../types/tax';
import { calculatePersonaNatural } from '../../services/api';
import { PnCalcSubtab } from './PersonaNatural/PnCalcSubtab';
import { PnF210Subtab } from './PersonaNatural/PnF210Subtab';
import { PnMarginalSubtab } from './PersonaNatural/PnMarginalSubtab';
import { PnConciliacionSubtab } from './PersonaNatural/PnConciliacionSubtab';
import { PnComparacionPatrimonialSubtab } from './PersonaNatural/PnComparacionPatrimonialSubtab';
import { PnObligadosSubtab } from './PersonaNatural/PnObligadosSubtab';
import { PnOptimizerCard } from './PersonaNatural/PnOptimizerCard';
import { ComponenteInflacionarioModule } from './ComponenteInflacionarioModule';
import { WorkspaceHubLanding } from '../common/WorkspaceHubLanding';

export const PersonaNaturalModule: React.FC = () => {
  const { activeSubTab, navigateTo, taxYear, uvtValue, showToast } = useApp();

  const [inputs, setInputs] = useState<PersonaNaturalInput>({
    tax_year: taxYear,
    custom_uvt: uvtValue,
    patrimonio_bruto: 300000000,
    deudas: 80000000,
    rentas_trabajo: 120000000,
    viaticos: 0,
    otros_ingresos_brutos: 0,
    rentas_capital: 0,
    incrngo_capital: 0,
    rentas_nolaborales: 0,
    incrngo_nolaborales: 0,
    costos_nolaborales: 0,
    aporte_salud_obligatorio: 4800000,
    aporte_pension_obligatorio: 4800000,
    otros_incrngo: 0,
    aplica_dependiente_general: true,
    numero_dependientes_adicionales_72uvt: 0,
    medicina_prepagada_anual: 0,
    intereses_vivienda_anual: 12000000,
    gmf_4x1000_total: 0,
    compras_factura_electronica: 15000000,
    aportes_voluntarios_pension_afc: 10000000,
    otras_rentas_exentas: 0,
    ganancias_ocasionales_brutas_activos_fijos: 0,
    ganancias_ocasionales_brutas_herencias: 0,
    ganancias_ocasionales_brutas_loterias: 0,
    costos_ganancia_ocasional: 0,
    ganancias_ocasionales_exentas_solicitadas: 0,
    descuentos_tributarios: 0,
    retenciones_fuente_practicadas: 5000000,
    anticipo_ano_anterior: 0,
    saldo_a_favor_ano_anterior: 0,
  });

  const [result, setResult] = useState<PersonaNaturalOutput | null>(null);
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
      const res = await calculatePersonaNatural(inputs);
      setResult(res);
    } catch (err: any) {
      console.error('Error calculando Persona Natural:', err);
    }
  };

  const loadPresetStandard = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      patrimonio_bruto: 300000000,
      deudas: 80000000,
      rentas_trabajo: 120000000,
      viaticos: 0,
      otros_ingresos_brutos: 0,
      rentas_capital: 0,
      incrngo_capital: 0,
      rentas_nolaborales: 0,
      incrngo_nolaborales: 0,
      costos_nolaborales: 0,
      aporte_salud_obligatorio: 4800000,
      aporte_pension_obligatorio: 4800000,
      otros_incrngo: 0,
      aplica_dependiente_general: true,
      numero_dependientes_adicionales_72uvt: 0,
      medicina_prepagada_anual: 0,
      intereses_vivienda_anual: 12000000,
      gmf_4x1000_total: 0,
      compras_factura_electronica: 15000000,
      aportes_voluntarios_pension_afc: 10000000,
      otras_rentas_exentas: 0,
      ganancias_ocasionales_brutas_activos_fijos: 0,
      ganancias_ocasionales_brutas_herencias: 0,
      ganancias_ocasionales_brutas_loterias: 0,
      costos_ganancia_ocasional: 0,
      ganancias_ocasionales_exentas_solicitadas: 0,
      descuentos_tributarios: 0,
      retenciones_fuente_practicadas: 5000000,
      anticipo_ano_anterior: 0,
      saldo_a_favor_ano_anterior: 0,
    });
    showToast('✓ Ejemplo estándar cargado', 'info', 2000);
  };

  const loadPreset35 = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      patrimonio_bruto: 850000000,
      deudas: 150000000,
      rentas_trabajo: 280000000,
      viaticos: 20000000,
      otros_ingresos_brutos: 0,
      rentas_capital: 0,
      incrngo_capital: 0,
      rentas_nolaborales: 0,
      incrngo_nolaborales: 0,
      costos_nolaborales: 0,
      aporte_salud_obligatorio: 11200000,
      aporte_pension_obligatorio: 11200000,
      otros_incrngo: 0,
      aplica_dependiente_general: true,
      numero_dependientes_adicionales_72uvt: 2,
      medicina_prepagada_anual: 8000000,
      intereses_vivienda_anual: 24000000,
      gmf_4x1000_total: 4000000,
      compras_factura_electronica: 30000000,
      aportes_voluntarios_pension_afc: 35000000,
      otras_rentas_exentas: 0,
      ganancias_ocasionales_brutas_activos_fijos: 0,
      ganancias_ocasionales_brutas_herencias: 0,
      ganancias_ocasionales_brutas_loterias: 0,
      costos_ganancia_ocasional: 0,
      ganancias_ocasionales_exentas_solicitadas: 0,
      descuentos_tributarios: 0,
      retenciones_fuente_practicadas: 22000000,
      anticipo_ano_anterior: 0,
      saldo_a_favor_ano_anterior: 0,
    });
    showToast('🔥 Ejemplo altos ingresos cargado (Tramo 35%)', 'info', 2000);
  };

  const loadPresetGo = () => {
    setInputs({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      patrimonio_bruto: 650000000,
      deudas: 120000000,
      rentas_trabajo: 95000000,
      viaticos: 0,
      otros_ingresos_brutos: 0,
      rentas_capital: 0,
      incrngo_capital: 0,
      rentas_nolaborales: 0,
      incrngo_nolaborales: 0,
      costos_nolaborales: 0,
      aporte_salud_obligatorio: 3800000,
      aporte_pension_obligatorio: 3800000,
      otros_incrngo: 0,
      aplica_dependiente_general: true,
      numero_dependientes_adicionales_72uvt: 0,
      medicina_prepagada_anual: 0,
      intereses_vivienda_anual: 6000000,
      gmf_4x1000_total: 0,
      compras_factura_electronica: 10000000,
      aportes_voluntarios_pension_afc: 5000000,
      otras_rentas_exentas: 0,
      ganancias_ocasionales_brutas_activos_fijos: 180000000,
      costos_ganancia_ocasional: 100000000,
      ganancias_ocasionales_brutas_herencias: 0,
      ganancias_ocasionales_brutas_loterias: 0,
      ganancias_ocasionales_exentas_solicitadas: 20000000,
      descuentos_tributarios: 0,
      retenciones_fuente_practicadas: 4000000,
      anticipo_ano_anterior: 0,
      saldo_a_favor_ano_anterior: 0,
    });
    showToast('✨ Ejemplo con Ganancia Ocasional cargado', 'info', 2000);
  };

  const handleTransferFromObligados = (datos: Partial<PersonaNaturalInput>) => {
    setInputs((prev) => ({ ...prev, ...datos }));
    navigateTo('pn', 'calc');
    showToast('✓ Datos precargados en el Liquidador F-210', 'success', 2500);
  };

  const handleApplyOptimization = (modifications: Partial<PersonaNaturalInput>) => {
    setInputs((prev) => ({ ...prev, ...modifications }));
    navigateTo('pn', 'calc');
    showToast('✨ Deducciones optimizadas aplicadas al Liquidador', 'success', 2500);
  };

  const currentSubTab = activeSubTab || 'calc';

  return (
    <div id="module-persona-natural">
      {currentSubTab === 'hub' || currentSubTab === 'overview' ? (
        <WorkspaceHubLanding workspace="naturales" />
      ) : currentSubTab === 'test_obligados' ? (
        <PnObligadosSubtab
          uvtValue={uvtValue}
          taxYear={taxYear}
          onTransferToCalc={handleTransferFromObligados}
          onNavigateToCalc={() => navigateTo('pn', 'calc')}
        />
      ) : currentSubTab === 'optimizer' ? (
        <div style={{ padding: '0 4px' }}>
          <PnOptimizerCard
            inputs={inputs}
            result={result}
            uvtValue={uvtValue}
            taxYear={taxYear}
            onApplyOptimization={handleApplyOptimization}
            onNavigateToCalc={() => navigateTo('pn', 'calc')}
            onNavigateToF210={() => navigateTo('pn', 'f210')}
          />
        </div>
      ) : currentSubTab === 'inflacionario' ? (
        <ComponenteInflacionarioModule />
      ) : currentSubTab === 'f210' ? (
        <PnF210Subtab result={result} onNavigateToCalc={() => navigateTo('pn', 'calc')} />
      ) : currentSubTab === 'marginal' ? (
        <PnMarginalSubtab
          result={result}
          uvtValue={uvtValue}
          onNavigateToCalc={() => navigateTo('pn', 'calc')}
        />
      ) : currentSubTab === 'conciliacion' ? (
        <PnConciliacionSubtab />
      ) : currentSubTab === 'comparacion_patrimonial' ? (
        <PnComparacionPatrimonialSubtab
          currentPnInputs={inputs}
          currentPnResult={result}
          onNavigateToCalc={() => navigateTo('pn', 'calc')}
        />
      ) : (
        <PnCalcSubtab
          inputs={inputs}
          setInputs={setInputs}
          result={result}
          uvtValue={uvtValue}
          taxYear={taxYear}
          onOpenAudit={() => setIsAuditModalOpen(true)}
          onNavigateToF210={() => navigateTo('pn', 'f210')}
          onNavigateToMarginal={() => navigateTo('pn', 'marginal')}
          onNavigateToOptimizer={() => navigateTo('pn', 'optimizer')}
          onNavigateToObligados={() => navigateTo('pn', 'test_obligados')}
          loadPresetStandard={loadPresetStandard}
          loadPreset35={loadPreset35}
          loadPresetGo={loadPresetGo}
        />
      )}

      {/* AUDIT MODAL */}
      {isAuditModalOpen && (
        <div id="audit-modal" className="modal-backdrop" style={{ display: 'flex' }} onClick={() => setIsAuditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="audit-modal-title" style={{ fontSize: '15px', fontWeight: 700 }}>
                Auditoría y Trazabilidad Paso a Paso
              </h3>
              <button className="btn btn-outline btn-sm" onClick={() => setIsAuditModalOpen(false)}>
                ✕ Cerrar
              </button>
            </div>
            <div id="audit-modal-body" className="modal-body">
              <div className="audit-list">
                {result?.audit_trace?.map((step, idx) => (
                  <div key={idx} className="audit-item">
                    <div className="audit-item-header">
                      <span className="audit-item-title">
                        {idx + 1}. {step.title}
                      </span>
                      {step.statutory_reference && (
                        <span className="audit-item-ref">{step.statutory_reference}</span>
                      )}
                    </div>
                    {step.notes && <p className="audit-item-notes">{step.notes}</p>}
                    <div className="audit-item-values">
                      <span>
                        Calculado: <strong>${step.calculated_cop.toLocaleString('es-CO')} COP</strong>
                      </span>
                      {step.limit_cop !== undefined && step.limit_cop !== null && (
                        <span>
                          Tope Legal: <strong>${step.limit_cop.toLocaleString('es-CO')} COP</strong>
                        </span>
                      )}
                      <span>
                        Aceptado: <strong style={{ color: '#059669' }}>${step.final_allowed_cop.toLocaleString('es-CO')} COP</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
