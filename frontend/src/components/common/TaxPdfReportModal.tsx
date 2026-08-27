import React from 'react';
import { formatCOP } from '../../utils/formatters';
import { triggerPrint } from '../../utils/printHelper';

export interface TaxReportData {
  moduleType: 'pn' | 'pj' | 'simple' | 'retefuente' | 'iva';
  title: string;
  formName: string; // e.g. "Formulario 210", "Formulario 110", "Formulario 260", "Formulario 350", "Formulario 300"
  taxYear: number;
  uvtValue: number;
  contributorName?: string;
  contributorId?: string;
  regimeType?: string;
  mainKpiLabel: string;
  mainKpiValue: number;
  isPayable: boolean;
  metrics: Array<{ label: string; value: string }>;
  depurationRows: Array<{
    label: string;
    value: string;
    isBold?: boolean;
    isNegative?: boolean;
    isHeader?: boolean;
    bg?: string;
  }>;
  keyBoxes: Array<{ box: string; label: string; value: string }>;
  legalNote?: string;
}

interface TaxPdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: TaxReportData | null;
}

export const TaxPdfReportModal: React.FC<TaxPdfReportModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  if (!isOpen || !report) return null;

  const handlePrint = () => {
    triggerPrint({ modalId: 'printable-tax-report' });
  };

  const currentDate = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="modal-backdrop" style={{ display: 'flex' }} onClick={onClose}>
      <div
        className="modal-content tax-report-modal-content"
        style={{ maxWidth: '840px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER DE CONTROL DEL MODAL (No imprimible) */}
        <div className="modal-header no-print">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
              📄 Dictamen &amp; Resumen Ejecutivo Tributario
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {report.formName} DIAN • Año Gravable {report.taxYear}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              🖨️ Imprimir / Guardar en PDF
            </button>
            <button className="btn btn-outline btn-sm" onClick={onClose}>
              ✕ Cerrar
            </button>
          </div>
        </div>

        {/* CUERPO DEL DICTAMEN IMPRIMIBLE */}
        <div className="modal-body printable-report-body" id="printable-tax-report" style={{ padding: '24px', color: '#1e293b' }}>
          {/* ENCABEZADO FORMAL FISCOL */}
          <div style={{ borderBottom: '2.5px solid #002e5b', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '22px', fontWeight: 900, color: '#002e5b', letterSpacing: '-0.5px' }}>
                  FISCOL
                </span>
                <span style={{ fontSize: '10px', background: '#002e5b', color: '#ffffff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                  Dictamen Oficial
                </span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {report.title}
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                Liquidación preliminar y conciliación fiscal conforme a la normativa DIAN vigente ({report.formName})
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#002e5b' }}>Año Gravable: {report.taxYear}</div>
              <div style={{ fontSize: '11px', color: '#475569' }}>UVT Oficial: {formatCOP(report.uvtValue)}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Fecha de Emisión: {currentDate}</div>
            </div>
          </div>

          {/* METADATOS DEL CONTRIBUYENTE */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '11.5px' }}>
            <div>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Contribuyente:</span>{' '}
              <strong>{report.contributorName || 'DECLARANTE FISCAL'}</strong>
            </div>
            {report.contributorId && (
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>NIT / Identificación:</span>{' '}
                <strong>{report.contributorId}</strong>
              </div>
            )}
            <div>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Régimen Tributario:</span>{' '}
              <strong>{report.regimeType || 'Régimen Ordinario Nacional'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Estado de Liquidación:</span>{' '}
              <strong style={{ color: '#16a34a' }}>Auditado y Cuadrado 100%</strong>
            </div>
          </div>

          {/* HIGHLIGHT KPI RESULTADO */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '8px',
              background: report.isPayable ? '#fee2e2' : '#f0fdf4',
              border: `1.5px solid ${report.isPayable ? '#fca5a5' : '#86efac'}`,
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: report.isPayable ? '#991b1b' : '#166534' }}>
                {report.mainKpiLabel}
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: report.isPayable ? '#dc2626' : '#16a34a' }}>
                {formatCOP(report.mainKpiValue)} COP
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {report.metrics.map((m, idx) => (
                <div key={idx}>
                  <span style={{ color: '#64748b' }}>{m.label}:</span>{' '}
                  <strong style={{ color: '#0f172a' }}>{m.value}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* TABLA DE DEPURACIÓN Y CASCADA */}
          <h4 style={{ fontSize: '12.5px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', color: '#0f172a', letterSpacing: '0.3px' }}>
            Desglose y Cascada de Liquidación Fiscal
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', marginBottom: '20px' }}>
            <tbody>
              {report.depurationRows.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    background: row.bg || (row.isHeader ? '#f1f5f9' : idx % 2 === 0 ? '#ffffff' : '#f8fafc'),
                  }}
                >
                  <td
                    style={{
                      padding: '6px 8px',
                      fontWeight: row.isBold || row.isHeader ? 800 : 500,
                      color: row.isHeader ? '#0f172a' : row.isNegative ? '#dc2626' : '#334155',
                    }}
                  >
                    {row.label}
                  </td>
                  <td
                    style={{
                      padding: '6px 8px',
                      textAlign: 'right',
                      fontWeight: row.isBold || row.isHeader ? 800 : 600,
                      color: row.isNegative ? '#dc2626' : '#0f172a',
                    }}
                  >
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* CASILLAS CLAVE PARA DILIGENCIAR EL FORMULARIO DIAN */}
          {report.keyBoxes.length > 0 && (
            <>
              <h4 style={{ fontSize: '12.5px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', color: '#0f172a', letterSpacing: '0.3px' }}>
                Casillas Principales para Traslado al Formulario Oficial DIAN
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px', fontSize: '11px', marginBottom: '20px' }}>
                {report.keyBoxes.map((box, idx) => (
                  <div key={idx} style={{ padding: '8px 10px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                    <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 700 }}>
                      Casilla {box.box} ({box.label})
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', marginTop: '2px' }}>
                      {box.value}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* DESCARGO DE RESPONSABILIDAD LEGAL */}
          <div style={{ fontSize: '10px', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '12px', lineHeight: '1.45' }}>
            ⚠️ <strong>Aviso Legal &amp; Descargo de Responsabilidad:</strong> {report.legalNote || 'Este documento es un dictamen preliminar informativo generado por Fiscol bajo los preceptos del Estatuto Tributario colombiano y leyes modificatorias vigentes. No constituye radicación formal ante la DIAN ni reemplaza la firma de contador/revisor fiscal cuando sea requerida por ley.'}
          </div>
        </div>
      </div>
    </div>
  );
};
