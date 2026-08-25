import React, { useState, useEffect } from 'react';
import type { TablaRetefuenteItem } from '../../../types/tax';
import { useApp } from '../../../context/AppContext';
import { fetchTablaRetefuente } from '../../../services/api';
import { formatCOP } from '../../../utils/formatters';

export const RetefuenteTablaSubtab: React.FC = () => {
  const { taxYear, uvtValue } = useApp();
  const [items, setItems] = useState<TablaRetefuenteItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('TODAS');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadTabla();
  }, [taxYear, uvtValue]);

  const loadTabla = async () => {
    try {
      setLoading(true);
      const res = await fetchTablaRetefuente(taxYear, uvtValue);
      setItems(res);
    } catch (err) {
      console.error('Error cargando tabla de retenciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const categorias = ['TODAS', ...Array.from(new Set(items.map((it) => it.categoria)))];

  const filteredItems = items.filter((it) => {
    const matchesSearch =
      it.concepto.toLowerCase().includes(search.toLowerCase()) ||
      it.articulo_et.toLowerCase().includes(search.toLowerCase()) ||
      it.observaciones.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategoria === 'TODAS' || it.categoria === selectedCategoria;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="module-pane active" id="pane-retefuente-tabla">
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 className="card-title">📚 Tabla Maestra de Retención en la Fuente ({taxYear})</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Valores calculados con UVT oficial de <strong>${uvtValue.toLocaleString('es-CO')}</strong>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              className="text-input"
              placeholder="🔍 Buscar por concepto, artículo o palabra clave..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '280px', fontSize: '12.5px' }}
            />
          </div>
        </div>

        {/* FILTROS POR CATEGORÍA */}
        <div style={{ display: 'flex', gap: '6px', padding: '10px 16px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
          {categorias.map((cat) => (
            <button
              key={cat}
              className={`btn btn-sm ${selectedCategoria === cat ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedCategoria(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Cargando tabla de retención en la fuente...
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12.5px', margin: 0 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)' }}>
                    <th style={{ padding: '10px 14px' }}>Concepto & Norma</th>
                    <th style={{ padding: '10px 14px', width: '120px' }}>Categoría</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', width: '150px' }}>Base Mínima (UVT y COP)</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', width: '120px' }}>Tarifa Declarante</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', width: '120px' }}>Tarifa No Declarante</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td style={{ padding: '12px 14px' }}>
                        <strong style={{ display: 'block', marginBottom: '2px', color: 'var(--text-primary)' }}>
                          {item.concepto}
                        </strong>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '1px 6px',
                              background: 'rgba(2, 132, 199, 0.1)',
                              color: '#0284c7',
                              borderRadius: '4px',
                              fontWeight: 700,
                            }}
                          >
                            {item.articulo_et}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {item.observaciones}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className="badge-uvt" style={{ fontSize: '11px' }}>
                          {item.categoria}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        {item.base_minima_uvt > 0 ? (
                          <>
                            <strong>{item.base_minima_uvt} UVT</strong>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {formatCOP(item.base_minima_cop)}
                            </div>
                          </>
                        ) : (
                          <span style={{ color: '#059669', fontWeight: 600 }}>100% (Desde $1)</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>
                        {item.tarifa_declarante}%
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: '#d97706' }}>
                        {item.tarifa_no_declarante}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
