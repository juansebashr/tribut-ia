import React from 'react';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AuditTraceItem } from '../types/tax';

interface AuditTraceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  auditTrace: AuditTraceItem[];
}

export const AuditTraceModal: React.FC<AuditTraceModalProps> = ({
  isOpen,
  onClose,
  title,
  auditTrace,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} color="#1e3a8a" />
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{title} - Trazabilidad & Auditoría Fiscal</h3>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="audit-list">
            {auditTrace.map((step, idx) => (
              <div key={idx} className="audit-item">
                <div className="audit-item-header">
                  <span className="audit-item-title">{idx + 1}. {step.title}</span>
                  {step.statutory_reference && (
                    <span className="audit-item-ref">{step.statutory_reference}</span>
                  )}
                </div>

                {step.notes && <p className="audit-item-notes">{step.notes}</p>}

                <div className="audit-item-values">
                  <span>Calculado: <strong>${step.calculated_cop.toLocaleString('es-CO')} COP</strong></span>
                  {step.limit_cop !== undefined && step.limit_cop !== null && (
                    <span>Tope Legal: <strong>${step.limit_cop.toLocaleString('es-CO')} COP {step.limit_uvt ? `(${step.limit_uvt} UVT)` : ''}</strong></span>
                  )}
                  {step.excess_rejected_cop && step.excess_rejected_cop > 0 ? (
                    <span style={{ color: '#e11d48', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={13} />
                      Exceso Rechazado: <strong>${step.excess_rejected_cop.toLocaleString('es-CO')} COP</strong>
                    </span>
                  ) : null}
                  <span>Valor Aceptado: <strong style={{ color: '#059669' }}>${step.final_allowed_cop.toLocaleString('es-CO')} COP</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
