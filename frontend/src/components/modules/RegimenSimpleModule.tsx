import React from 'react';

export const RegimenSimpleModule: React.FC = () => {
  return (
    <div id="pane-simple" className="module-pane active">
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2 className="card-title">📑 Régimen Simple de Tributación - SIMPLE (Formulario 260 DIAN)</h2>
          <span className="badge-uvt">Art. 903 a 916 E.T.</span>
        </div>
        <div className="card-body" style={{ fontSize: '13px', lineHeight: 1.6 }}>
          <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
            El Régimen Simple sustituye el impuesto sobre la renta e integra el Impuesto Nacional al Consumo y el ICA consolidado territorial.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', margin: '16px 0' }}>
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', padding: '14px', borderRadius: '8px' }}>
              <h4 style={{ color: '#0b3b60', fontWeight: 700, marginBottom: '6px' }}>Grupo 1: Tiendas y Minimercados</h4>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Tarifas desde 1.2% hasta 5.6% sobre ingresos brutos.</p>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', padding: '14px', borderRadius: '8px' }}>
              <h4 style={{ color: '#0b3b60', fontWeight: 700, marginBottom: '6px' }}>Grupo 2: Comercio & Servicios Técnicos</h4>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Tarifas desde 1.6% hasta 4.5% sobre ingresos brutos.</p>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', padding: '14px', borderRadius: '8px' }}>
              <h4 style={{ color: '#0b3b60', fontWeight: 700, marginBottom: '6px' }}>Grupo 3: Profesiones Liberales</h4>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Consultorías y servicios profesionales (Tope 12.000 UVT).</p>
            </div>
          </div>

          <div style={{ background: '#eff6ff', borderLeft: '4px solid #2563eb', padding: '12px 16px', borderRadius: '0 8px 8px 0', marginTop: '16px' }}>
            <strong>💡 Módulo Listo para Extensión:</strong> Este calculador cuenta con el motor de reglas preparado en el backend para liquidar los anticipos bimestrales (F2593) y la declaración anual consolidada (F260).
          </div>
        </div>
      </div>
    </div>
  );
};
