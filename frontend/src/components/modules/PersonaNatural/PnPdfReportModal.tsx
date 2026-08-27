import React from 'react';
import type { PersonaNaturalInput, PersonaNaturalOutput } from '../../../types/tax';
import { formatCOP } from '../../../utils/formatters';

interface PnPdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: PersonaNaturalInput;
  result: PersonaNaturalOutput | null;
  taxYear: number;
  uvtValue: number;
}

export const PnPdfReportModal: React.FC<PnPdfReportModalProps> = ({
  isOpen,
  onClose,
  inputs,
  result,
  taxYear,
  uvtValue,
}) => {
  if (!isOpen || !result) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="modal-backdrop" style={{ display: 'flex' }} onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '820px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 style={{ fontSize: '16px', fontWeight: 800 }}>
            📄 Dictamen &amp; Resumen Ejecutivo de Renta Persona Natural
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              🖨️ Imprimir / Guardar en PDF
            </button>
            <button className="btn btn-outline btn-sm" onClick={onClose}>
              ✕ Cerrar
            </button>
          </div>
        </div>

        <div className="modal-body" id="printable-tax-report" style={{ padding: '24px', color: '#1e293b' }}>
          {/* ENCABEZADO FORMAL */}
          <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                FISCOL • DICTAMEN TRIBUTARIO
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Liquidación Oficial Preliminar del Impuesto sobre la Renta (Formulario 210 DIAN)
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Año Gravable: {taxYear}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>UVT Oficial: {formatCOP(uvtValue)}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Fecha de Emisión: {currentDate}</div>
            </div>
          </div>

          {/* DATOS DEL CONTRIBUYENTE */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
            <div>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Contribuyente:</span>{' '}
              <strong>PERSONA NATURAL DECLARANTE</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Patrimonio Bruto a 31 de Dic:</span>{' '}
              <strong>{formatCOP(inputs.patrimonio_bruto)}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Régimen Tributario:</span>{' '}
              <strong>Régimen Ordinario (Cédula General)</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Deudas y Pasivos:</span>{' '}
              <strong>{formatCOP(inputs.deudas)}</strong>
            </div>
          </div>

          {/* KPI RESULTADO */}
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              background: result.saldo_a_pagar > 0 ? '#fee2e2' : '#f0fdf4',
              border: `1.5px solid ${result.saldo_a_pagar > 0 ? '#fca5a5' : '#86efac'}`,
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: result.saldo_a_pagar > 0 ? '#991b1b' : '#166534' }}>
                {result.saldo_a_pagar > 0 ? 'Saldo Final a Pagar a la DIAN' : 'Saldo Final a Favor del Contribuyente'}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: result.saldo_a_pagar > 0 ? '#dc2626' : '#16a34a' }}>
                {formatCOP(result.saldo_a_pagar > 0 ? result.saldo_a_pagar : result.saldo_a_favor)} COP
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '12px' }}>
              <div>Tarifa Marginal Máxima: <strong>{(result.tarifa_marginal_maxima * 100).toFixed(0)}%</strong></div>
              <div>Tasa Efectiva Real / Ingresos: <strong>{((result.impuesto_neto_renta / (result.total_ingresos_brutos || 1)) * 100).toFixed(1)}%</strong></div>
            </div>
          </div>

          {/* TABLA DE DEPURACIÓN DETALLADA */}
          <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', color: '#0f172a' }}>
            Cascada de Depuración de la Cédula General
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0', padding: '6px 0' }}>
                <td style={{ padding: '6px 0', color: '#475569' }}>Total Ingresos Brutos de Trabajo y Otras Rentas</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCOP(result.total_ingresos_brutos)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 0', color: '#dc2626' }}>(-) Ingresos No Constitutivos de Renta (Salud &amp; Pensión)</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>-{formatCOP(result.total_incrngo)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <td style={{ padding: '6px 0', fontWeight: 700 }}>(=) Ingreso Neto de la Cédula General</td>
                <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatCOP(result.ingreso_neto)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 0', color: '#ea580c' }}>(-) Deducciones Aceptadas (Vivienda, Prepagada, Dependientes)</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#ea580c' }}>-{formatCOP(result.total_deducciones_aceptadas)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 0', color: '#ca8a04' }}>(-) Rentas Exentas (Exenta 25% + Aportes AFC / FPV)</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#ca8a04' }}>-{formatCOP(result.total_rentas_exentas_previas + result.renta_exenta_laboral_25)}</td>
              </tr>
              <tr style={{ borderBottom: '2px solid #0f172a', background: '#f1f5f9' }}>
                <td style={{ padding: '8px 0', fontWeight: 800, color: '#0f172a' }}>(=) Renta Líquida Gravable (Casilla 111)</td>
                <td style={{ textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>{formatCOP(result.renta_liquida_gravable)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 0', fontWeight: 700 }}>Impuesto Neto de Renta Liquidado (Art. 241 E.T.)</td>
                <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatCOP(result.impuesto_neto_renta)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 0', color: '#16a34a' }}>(-) Retenciones en la Fuente y Anticipos Practicados</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>-{formatCOP(result.total_anticipos_y_retenciones)}</td>
              </tr>
            </tbody>
          </table>

          {/* CASILLAS CLAVE FORMULARIO 210 */}
          <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', color: '#0f172a' }}>
            Casillas Clave para Diligenciamiento Formulario 210 DIAN
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '11px', marginBottom: '20px' }}>
            <div style={{ padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <div style={{ color: '#64748b' }}>Casilla 29 (Patrimonio Bruto)</div>
              <div style={{ fontWeight: 800, fontSize: '13px' }}>{formatCOP(inputs.patrimonio_bruto)}</div>
            </div>
            <div style={{ padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <div style={{ color: '#64748b' }}>Casilla 32 (Ingresos Trabajo)</div>
              <div style={{ fontWeight: 800, fontSize: '13px' }}>{formatCOP(inputs.rentas_trabajo)}</div>
            </div>
            <div style={{ padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <div style={{ color: '#64748b' }}>Casilla 111 (Renta Líquida Gravable)</div>
              <div style={{ fontWeight: 800, fontSize: '13px' }}>{formatCOP(result.renta_liquida_gravable)}</div>
            </div>
            <div style={{ padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <div style={{ color: '#64748b' }}>Casilla 126 (Impuesto Renta)</div>
              <div style={{ fontWeight: 800, fontSize: '13px' }}>{formatCOP(result.impuesto_neto_renta)}</div>
            </div>
            <div style={{ padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <div style={{ color: '#64748b' }}>Casilla 132 (Retenciones)</div>
              <div style={{ fontWeight: 800, fontSize: '13px' }}>{formatCOP(inputs.retenciones_fuente_practicadas)}</div>
            </div>
            <div style={{ padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <div style={{ color: '#64748b' }}>Casilla 136/137 (Saldo Final)</div>
              <div style={{ fontWeight: 800, fontSize: '13px' }}>{formatCOP(result.saldo_a_pagar > 0 ? result.saldo_a_pagar : result.saldo_a_favor)}</div>
            </div>
          </div>

          {/* NOTA LEGAL */}
          <div style={{ fontSize: '10.5px', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '12px', lineHeight: '1.5' }}>
            ⚠️ <strong>Aviso Legal &amp; Descargo de Responsabilidad:</strong> Este documento es un dictamen preliminar e informativo generado por Fiscol bajo la normativa vigente del Estatuto Tributario. No constituye radicación formal ante la DIAN. La cifra definitiva está sujeta a los soportes fiscales oficiales (Formulario 220, extractos bancarios y certificados de retención).
          </div>
        </div>
      </div>
    </div>
  );
};
