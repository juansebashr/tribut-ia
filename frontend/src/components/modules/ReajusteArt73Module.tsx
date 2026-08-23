import React, { useState, useEffect } from 'react';
import { formatCOP, parseCOP } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

interface TablaArt73Item {
  ano_adquisicion: string;
  acciones_aportes: number;
  bienes_raices_urbanos: number;
  bienes_raices_rurales_agro: number;
  bienes_raices_rurales: number;
}

export const ReajusteArt73Module: React.FC = () => {
  const { showToast } = useApp();

  const [tableData, setTableData] = useState<TablaArt73Item[]>([]);
  const [selectedAno, setSelectedAno] = useState<string>('1995');
  const [tipoActivo, setTipoActivo] = useState<string>('bienes_raices_urbanos');
  const [costoHistorico, setCostoHistorico] = useState<number>(20000000);
  const [precioVenta, setPrecioVenta] = useState<number>(500000000);
  const [searchTable, setSearchTable] = useState<string>('');

  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  useEffect(() => {
    loadTable();
  }, []);

  const loadTable = async () => {
    try {
      const res = await fetch('/api/v1/beneficios/articulo-73/tabla');
      if (res.ok) {
        const data = await res.json();
        setTableData(data);
      }
    } catch (err) {
      console.warn('Error loading Art. 73 table:', err);
    }
  };

  useEffect(() => {
    runSimulacion();
  }, [selectedAno, tipoActivo, costoHistorico, precioVenta, tableData]);

  const runSimulacion = async () => {
    try {
      const res = await fetch('/api/v1/beneficios/simular-articulo-73', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ano_adquisicion: String(selectedAno),
          tipo_activo: tipoActivo,
          costo_adquisicion_historico_cop: costoHistorico > 0 ? costoHistorico : 1000000,
          precio_venta_estimado_cop: precioVenta > 0 ? precioVenta : null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSimulationResult(data);
      }
    } catch (err) {
      console.warn('Error simulando Art. 73:', err);
    }
  };

  const handleSelectAno = (ano: string) => {
    setSelectedAno(ano);
    showToast(`✓ Año ${ano} cargado al simulador Art. 73`, 'info', 2000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredData = tableData.filter((i) =>
    searchTable.trim() ? i.ano_adquisicion.includes(searchTable.trim()) : true
  );

  return (
    <div id="pane-art73" className="module-pane active">
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2
            style={{
              fontSize: '17px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>🏢</span> Reajuste Fiscal de Bienes Raíces y Acciones (Art. 73 E.T.)
          </h2>
          <span
            className="badge"
            style={{
              background: '#1e40af',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
            }}
          >
            Decreto Reglamentario DUR 1.2.1.17.21
          </span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Herramienta didáctica para personas naturales: multiplica el costo histórico por los factores del DANE para
          incrementar el costo fiscal y reducir legalmente el impuesto de Ganancia Ocasional (15%).
        </p>
      </div>

      {/* SIMULADOR INTERACTIVO ART 73 */}
      <div
        className="card"
        style={{ border: '2px solid var(--primary-border)', marginBottom: '20px' }}
      >
        <div
          className="card-header"
          style={{ background: 'var(--primary-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div
            className="card-title"
            style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>⚡</span> Simulador de Reajuste Fiscal &amp; Beneficio Tributario (Art. 73 E.T.)
          </div>
          <span
            className="badge"
            style={{ background: 'var(--primary)', color: '#ffffff', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '4px' }}
          >
            Cálculo Automático en Vivo
          </span>
        </div>

        <div className="card-body" style={{ padding: '18px' }}>
          <div className="responsive-grid-2">
            {/* COLUMNA 1: FORMULARIO ART 73 */}
            <div
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>📝</span> <strong>1. Datos de Adquisición &amp; Venta</strong>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  AÑO DE ADQUISICIÓN / COMPRA (1955 - 2024):
                </label>
                <select
                  id="sim-art73-ano"
                  style={{ width: '100%', padding: '7px 10px', fontSize: '12px', border: '1px solid var(--border-subtle)', borderRadius: '6px', outline: 'none', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  value={selectedAno}
                  onChange={(e) => setSelectedAno(e.target.value)}
                >
                  {tableData.map((item) => (
                    <option key={item.ano_adquisicion} value={item.ano_adquisicion}>
                      {item.ano_adquisicion} {item.ano_adquisicion === '1995' ? '(Ejemplo Común 30 años)' : item.ano_adquisicion === '2024' ? '(Año Gravable Anterior)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  TIPO DE ACTIVO FIJO (ART. 73):
                </label>
                <select
                  id="sim-art73-tipo"
                  style={{ width: '100%', padding: '7px 10px', fontSize: '12px', border: '1px solid var(--border-subtle)', borderRadius: '6px', outline: 'none', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  value={tipoActivo}
                  onChange={(e) => setTipoActivo(e.target.value)}
                >
                  <option value="bienes_raices_urbanos">🏢 Bienes Raíces Urbanos (Casas, Aptos, Locales)</option>
                  <option value="bienes_raices_rurales_agro">🌾 Inmuebles Rurales Agropecuarios (Fincas, Predios)</option>
                  <option value="bienes_raices_rurales">🌲 Inmuebles Rurales Restantes</option>
                  <option value="acciones_aportes">📈 Acciones y Aportes en Sociedades</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    COSTO DE ADQUISICIÓN ($):
                  </label>
                  <input
                    type="text"
                    id="sim-art73-costo-hist"
                    style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', fontWeight: 700, fontFamily: 'var(--font-mono)', border: '1px solid var(--border-subtle)', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                    value={formatCOP(costoHistorico, false)}
                    onChange={(e) => setCostoHistorico(parseCOP(e.target.value))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    PRECIO VENTA ESTIMADO ($):
                  </label>
                  <input
                    type="text"
                    id="sim-art73-precio-venta"
                    style={{ width: '100%', padding: '7px 10px', fontSize: '12.5px', fontWeight: 700, fontFamily: 'var(--font-mono)', border: '1px solid var(--border-subtle)', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                    value={formatCOP(precioVenta, false)}
                    onChange={(e) => setPrecioVenta(parseCOP(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* COLUMNA 2: RESULTADO EN VIVO ART 73 */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📊</span> <strong>2. Liquidación del Reajuste &amp; Ahorro Estimado</strong>
                </span>
                <span
                  className="badge"
                  style={{ background: 'var(--emerald)', color: '#ffffff', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}
                >
                  DUR 1.2.1.17.21
                </span>
              </div>

              <div id="sim-art73-result" style={{ marginTop: '10px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {simulationResult ? (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                        borderBottom: '1px dashed var(--border-subtle)',
                        paddingBottom: '6px',
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>FACTOR APLICADO (DANE):</span>
                      <span
                        className="badge"
                        style={{
                          background: 'var(--primary)',
                          color: '#ffffff',
                          fontSize: '13px',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        {Number(simulationResult.factor_multiplicador || 1).toLocaleString('es-CO', { minimumFractionDigits: 2 })}x
                      </span>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>NUEVO COSTO FISCAL AJUSTADO:</div>
                      <div style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                        {formatCOP(simulationResult.costo_fiscal_ajustado_art73_cop)}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--emerald)', fontWeight: 600 }}>
                        +{formatCOP(simulationResult.incremento_costo_fiscal_cop)} COP de costo fiscal legal adicional
                      </div>
                    </div>

                    {precioVenta > 0 && (
                      <div style={{ background: 'var(--emerald-light)', border: '1px solid var(--emerald-border)', borderRadius: '6px', padding: '8px 10px', marginBottom: '8px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--emerald)', textTransform: 'uppercase' }}>
                          Ahorro Tributario Estimado (Ganancia Ocasional 15%):
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--emerald)' }}>
                          {formatCOP(simulationResult.ahorro_impuesto_estimado_cop)}
                        </div>
                        <div style={{ fontSize: '9.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Utilidad sin reajuste: <strong>{formatCOP(simulationResult.ganancia_sin_ajuste_cop)}</strong> → Con reajuste: <strong>{formatCOP(simulationResult.ganancia_con_ajuste_cop)}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                    Calculando reajuste fiscal...
                  </div>
                )}
              </div>

              <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.3, borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                📌 <strong>Fundamento:</strong> Art. 73 E.T. y Decreto reglamentario anual. Venta tras 2+ años de posesión tributa como Ganancia Ocasional al 15%.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA COMPLETA OFICIAL DANE (70 AÑOS) */}
      <div className="card" style={{ border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
        <div
          className="card-header"
          style={{ background: 'var(--bg-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}
        >
          <div>
            <div className="card-title" style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
              📋 Tabla Oficial de Factores Multiplicadores DANE (1955 - 2024)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Haz clic en cualquier fila para simular instantáneamente con ese año.
            </div>
          </div>
          <div>
            <input
              type="text"
              id="search-tabla-art73"
              placeholder="🔍 Buscar año (ej. 1995, 1980)..."
              style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid var(--border-subtle)', borderRadius: '6px', width: '220px', outline: 'none', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
            />
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-scroll-hint" style={{ margin: '8px 12px 4px' }}>
            <span>👉</span> Desliza horizontalmente para ver todos los factores ➔
          </div>
          <div className="table-responsive" style={{ maxHeight: '480px', overflowY: 'auto', marginBottom: 0 }}>
            <table id="tabla-art73" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '600px' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card-header)', borderBottom: '2px solid var(--border-subtle)', zIndex: 2 }}>
                <tr>
                  <th style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--text-primary)' }}>Año de Compra</th>
                  <th style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--primary)' }}>Acciones / Aportes</th>
                  <th style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--primary)' }}>Inmuebles Urbanos</th>
                  <th style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--emerald)' }}>Rural Agropecuario</th>
                  <th style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--sky)' }}>Rural General</th>
                  <th style={{ padding: '10px 14px', fontWeight: 800, textAlign: 'center', color: 'var(--text-muted)' }}>Acción</th>
                </tr>
              </thead>
              <tbody id="tabla-art73-tbody">
                {filteredData.map((item) => (
                  <tr
                    key={item.ano_adquisicion}
                    className="hover-row"
                    style={{ cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}
                    onClick={() => handleSelectAno(item.ano_adquisicion)}
                  >
                    <td style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--primary)', fontSize: '13px' }}>
                      {item.ano_adquisicion}
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#1e40af' }}>
                      {Number(item.acciones_aportes).toLocaleString('es-CO', { minimumFractionDigits: 2 })}x
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0b3b60' }}>
                      {Number(item.bienes_raices_urbanos).toLocaleString('es-CO', { minimumFractionDigits: 2 })}x
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#047857' }}>
                      {Number(item.bienes_raices_rurales_agro).toLocaleString('es-CO', { minimumFractionDigits: 2 })}x
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#0284c7' }}>
                      {Number(item.bienes_raices_rurales).toLocaleString('es-CO', { minimumFractionDigits: 2 })}x
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <button
                        className="btn btn-outline btn-xs"
                        style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '4px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAno(item.ano_adquisicion);
                        }}
                      >
                        ⚡ Simular
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
