import React from 'react';

export const RetefuenteModule: React.FC = () => {
  return (
    <div id="pane-retefuente" className="module-pane active">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">💰 Retenciones en la Fuente (Formulario 350 DIAN)</h2>
          <span className="badge-uvt">Declaración Mensual</span>
        </div>
        <div className="card-body" style={{ fontSize: '13px', lineHeight: 1.6 }}>
          <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
            Módulo para la liquidación mensual de retenciones a título de Renta (Laborales Art. 383, Compras 2.5%,
            Servicios 4%/6%, Honorarios 10%/11%), IVA (15%) y Timbre.
          </p>

          <div style={{ background: '#fffbeb', borderLeft: '4px solid #d97706', padding: '12px 16px', borderRadius: '0 8px 8px 0', marginTop: '14px' }}>
            <strong>📅 Declaración Mensual:</strong> Permite consolidar las retenciones practicadas y autorretenciones especiales del periodo.
          </div>
        </div>
      </div>
    </div>
  );
};
