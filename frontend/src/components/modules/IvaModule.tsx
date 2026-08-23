import React from 'react';

export const IvaModule: React.FC = () => {
  return (
    <div id="pane-iva" className="module-pane active">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🛍️ Impuesto sobre las Ventas - IVA (Formulario 300 DIAN)</h2>
          <span className="badge-uvt">Bimestral / Cuatrimestral</span>
        </div>
        <div className="card-body" style={{ fontSize: '13px', lineHeight: 1.6 }}>
          <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
            Declaración y pago del IVA generado en ventas de bienes y servicios gravados (19%, 5%, exentos 0% y excluidos) versus IVA descontable en compras, importaciones y servicios.
          </p>

          <div className="responsive-grid-equal" style={{ margin: '16px 0' }}>
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', padding: '14px', borderRadius: '8px' }}>
              <h4 style={{ color: '#0b3b60', fontWeight: 700, marginBottom: '6px' }}>IVA Generado (Ventas)</h4>
              <ul style={{ paddingLeft: '18px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <li>Operaciones gravadas a la tarifa general (19%)</li>
                <li>Operaciones gravadas a la tarifa especial (5%)</li>
                <li>Exportaciones y bienes exentos (0%)</li>
              </ul>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', padding: '14px', borderRadius: '8px' }}>
              <h4 style={{ color: '#059669', fontWeight: 700, marginBottom: '6px' }}>IVA Descontable (Compras)</h4>
              <ul style={{ paddingLeft: '18px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <li>IVA pagado en adquisición de inventarios</li>
                <li>IVA en gastos y servicios operativos con FE</li>
                <li>Retención de IVA practicada (ReteIVA 15%)</li>
              </ul>
            </div>
          </div>

          <div style={{ background: '#ecfdf5', borderLeft: '4px solid #059669', padding: '12px 16px', borderRadius: '0 8px 8px 0', marginTop: '14px' }}>
            <strong>⚡ Arquitectura Lista:</strong> Puedes integrar el calculador detallado de IVA casilla por casilla sin alterar los demás módulos de renta.
          </div>
        </div>
      </div>
    </div>
  );
};
