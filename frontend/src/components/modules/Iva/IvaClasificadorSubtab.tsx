import React, { useState, useEffect } from 'react';
import type { BienServicioIvaItem } from '../../../types/tax';
import { fetchClasificadorIva } from '../../../services/api';

export const IvaClasificadorSubtab: React.FC = () => {
  const [items, setItems] = useState<BienServicioIvaItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedTratamiento, setSelectedTratamiento] = useState<string>('TODOS');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('TODAS');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadClasificador();
  }, []);

  const loadClasificador = async () => {
    try {
      setLoading(true);
      const res = await fetchClasificadorIva();
      setItems(res);
    } catch (err) {
      console.error('Error cargando clasificador de IVA:', err);
    } finally {
      setLoading(false);
    }
  };

  const categorias = ['TODAS', ...Array.from(new Set(items.map((it) => it.categoria)))];

  const filteredItems = items.filter((it) => {
    const matchesSearch =
      it.nombre.toLowerCase().includes(search.toLowerCase()) ||
      it.descripcion_tecnica.toLowerCase().includes(search.toLowerCase()) ||
      it.articulo_et.toLowerCase().includes(search.toLowerCase());
    const matchesTratamiento = selectedTratamiento === 'TODOS' || it.tratamiento === selectedTratamiento;
    const matchesCategoria = selectedCategoria === 'TODAS' || it.categoria === selectedCategoria;
    return matchesSearch && matchesTratamiento && matchesCategoria;
  });

  const getTratamientoBadge = (tratamiento: string, tarifa: number) => {
    if (tratamiento === 'GRAVADO') {
      return (
        <span
          style={{
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 800,
            background: tarifa === 19 ? 'rgba(37, 99, 235, 0.15)' : 'rgba(2, 132, 199, 0.15)',
            color: tarifa === 19 ? '#2563eb' : '#0284c7',
          }}
        >
          GRAVADO ({tarifa}%)
        </span>
      );
    }
    if (tratamiento === 'EXENTO') {
      return (
        <span
          style={{
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 800,
            background: 'rgba(22, 163, 74, 0.15)',
            color: '#16a34a',
          }}
        >
          EXENTO (0% Con Devolución)
        </span>
      );
    }
    return (
      <span
        style={{
          padding: '3px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 800,
          background: 'rgba(100, 116, 139, 0.15)',
          color: '#475569',
        }}
      >
        EXCLUIDO (Sin IVA)
      </span>
    );
  };

  return (
    <div className="module-pane active" id="pane-iva-clasificador">
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 className="card-title">🔍 Clasificador Tributario de Bienes &amp; Servicios (IVA)</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Guía didáctica sobre tarifas (19%, 5%, 0% Exento y Excluido) según el Estatuto Tributario
            </span>
          </div>
          <input
            type="text"
            className="text-input"
            placeholder="🔍 Buscar producto, servicio o artículo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '280px', fontSize: '12.5px' }}
          />
        </div>

        {/* FILTROS POR TRATAMIENTO Y CATEGORÍA */}
        <div style={{ display: 'flex', gap: '12px', padding: '10px 16px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, alignSelf: 'center', marginRight: '4px' }}>Tratamiento:</span>
            {['TODOS', 'GRAVADO', 'EXENTO', 'EXCLUIDO'].map((trat) => (
              <button
                key={trat}
                className={`btn btn-sm ${selectedTratamiento === trat ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedTratamiento(trat)}
              >
                {trat}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, alignSelf: 'center', marginRight: '4px' }}>Categoría:</span>
            <select
              className="select-input"
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              style={{ fontSize: '11.5px', padding: '2px 8px', height: '30px' }}
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Cargando catálogo de bienes y servicios...
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table" style={{ width: '100%', fontSize: '12.5px', margin: 0 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)' }}>
                    <th style={{ padding: '10px 14px' }}>Bien o Servicio</th>
                    <th style={{ padding: '10px 14px', width: '130px' }}>Categoría</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', width: '190px' }}>Tratamiento & Tarifa</th>
                    <th style={{ padding: '10px 14px', width: '130px' }}>Artículo E.T.</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', width: '130px' }}>Derecho a Devolución/Descuento</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td style={{ padding: '12px 14px' }}>
                        <strong style={{ display: 'block', marginBottom: '3px', color: 'var(--text-primary)' }}>
                          {item.nombre}
                        </strong>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                          {item.descripcion_tecnica}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className="badge-uvt" style={{ fontSize: '11px' }}>
                          {item.categoria}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        {getTratamientoBadge(item.tratamiento, item.tarifa_pct)}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#2563eb' }}>
                          {item.articulo_et}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        {item.derecho_devolucion_iva ? (
                          <span style={{ color: '#16a34a', fontWeight: 800, fontSize: '12px' }}>✓ Sí</span>
                        ) : (
                          <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '12px' }}>✗ No</span>
                        )}
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
