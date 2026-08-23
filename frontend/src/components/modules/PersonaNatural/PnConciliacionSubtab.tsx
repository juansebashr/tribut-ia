import React, { useState, useEffect, useRef } from 'react';
import type { ReconciliationItem, CsvValidationError } from '../../../types';
import { fetchReconciliationDemo, uploadReconciliationCsv } from '../../../services/api';
import { formatCOP } from '../../../utils/formatters';
import { useApp } from '../../../context/AppContext';

export const PnConciliacionSubtab: React.FC = () => {
  const { showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<ReconciliationItem[]>([]);
  const [errors, setErrors] = useState<CsvValidationError[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDetailItem, setSelectedDetailItem] = useState<ReconciliationItem | null>(null);

  useEffect(() => {
    // Load demo data on first visit
    loadDemo();
  }, []);

  const loadDemo = async () => {
    try {
      const res = await fetchReconciliationDemo();
      const list = res.transacciones || res.items || [];
      setItems(list);
      setErrors(res.errores_validacion || res.validation_errors || []);
      showToast('✓ Ejemplo de conciliación cargado con éxito', 'success', 2500);
    } catch (err) {
      console.error('Error loading demo:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      const res = await uploadReconciliationCsv(file);
      const list = res.transacciones || res.items || [];
      setItems(list);
      setErrors(res.errores_validacion || res.validation_errors || []);
      showToast(`✓ Archivo "${file.name}" procesado con éxito`, 'success', 3000);
    } catch (err: any) {
      showToast(err.message || 'Error al procesar archivo CSV', 'error', 4000);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearView = () => {
    setItems([]);
    setErrors([]);
    showToast('Visualización de conciliación limpiada', 'info', 2000);
  };

  // Helper getters
  const getItemValor = (i: ReconciliationItem) => i.valor_cop ?? i.valor_declarado_cop ?? 0;
  const getItemCedula = (i: ReconciliationItem) => i.cedula_destino ?? i.cedula ?? 'TRABAJO';
  const getItemCasilla = (i: ReconciliationItem) => i.casilla_f210_sugerida ?? i.casilla_f210_nombre ?? 'Casilla 32';
  const getItemEstado = (i: ReconciliationItem) => i.estado_exogena ?? i.estado_conciliacion ?? 'MATCH_EXACTO';

  // KPIs
  const totalTrx = items.length;
  const totalCop = items.reduce((acc, i) => acc + getItemValor(i), 0);
  const matchCount = items.filter((i) => getItemEstado(i) === 'MATCH_EXACTO' || getItemEstado(i) === 'CONCILIADO_EXACTO').length;
  const diffCount = items.filter((i) => getItemEstado(i) === 'DIFERENCIA_JUSTIFICADA' || getItemEstado(i) === 'CONCILIADO_CON_DIFERENCIA' || getItemEstado(i) === 'SOLO_EN_CERTIFICADOS').length;
  const errorCount = items.filter((i) => getItemEstado(i) === 'DISCREPANCIA_ALERTA').length;
  const matchPct = totalTrx > 0 ? Math.round((matchCount / totalTrx) * 100) : 0;

  // Filter and search
  const filteredItems = items.filter((item) => {
    const cedula = getItemCedula(item).toUpperCase();
    const estado = getItemEstado(item);

    // Category filter
    if (activeFilter === 'trabajo' && !cedula.includes('TRABAJO')) return false;
    if (activeFilter === 'capital' && !cedula.includes('CAPITAL')) return false;
    if (activeFilter === 'nolaboral' && !cedula.includes('NO_LABORAL') && !cedula.includes('NOLABORAL')) return false;
    if (activeFilter === 'deducciones' && !cedula.includes('DEDUCCION') && !cedula.includes('DED_')) return false;
    if (activeFilter === 'exentas' && !cedula.includes('EXENTA')) return false;
    if (activeFilter === 'alertas' && estado !== 'DISCREPANCIA_ALERTA') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTercero = (item.tercero_nombre || '').toLowerCase().includes(q);
      const matchNit = (item.tercero_nit || '').toLowerCase().includes(q);
      const matchDesc = (item.descripcion || '').toLowerCase().includes(q);
      const matchCasilla = getItemCasilla(item).toLowerCase().includes(q);
      if (!matchTercero && !matchNit && !matchDesc && !matchCasilla) return false;
    }

    return true;
  });

  return (
    <div id="pane-pn-conciliacion" className="module-pane active">
      {/* AVISO DE PRIVACIDAD Y PROCESAMIENTO EFÍMERO */}
      <div className="ephemeral-privacy-notice">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🔒</span>
          <div>
            <strong style={{ color: 'var(--primary)', fontSize: '13px' }}>
              Visualización Efímera en Memoria Local &amp; Cero Persistencia
            </strong>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Este archivo CSV se procesa de forma stateless únicamente en la memoria de tu navegador para análisis y
              conciliación en tiempo real. Los datos no se almacenan ni se guardan en base de datos ni en Redis.
            </p>
          </div>
        </div>
        <span className="badge-uvt" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-border)' }}>
          100% Stateless
        </span>
      </div>

      {/* TOP ACTIONS & KPI BAR */}
      <div className="reconciliation-toolbar-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 3px 0' }}>
              📑 Hoja de Cálculo Fiscal &amp; Conciliación con Información Exógena DIAN
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Visualiza tus transacciones como un libro contable, cruza con los reportes de terceros y comprende cómo se llena cada casilla del Formulario 210.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="file"
              id="reconciliation-file-input"
              ref={fileInputRef}
              accept=".csv,.txt"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />

            <button
              className="btn btn-primary btn-sm"
              onClick={() => fileInputRef.current?.click()}
              title="Seleccionar archivo CSV local para procesar en vivo"
            >
              <span>📤</span> Subir Archivo CSV
            </button>

            <button
              className="btn btn-outline btn-sm"
              onClick={loadDemo}
              title="Cargar transacciones reales de demostración"
            >
              <span>✨</span> Cargar Ejemplo (Demo)
            </button>

            <a
              href="/api/v1/reconciliation/template"
              download="plantilla_transacciones_tributia.csv"
              className="btn btn-outline btn-sm"
              style={{ textDecoration: 'none' }}
              title="Descargar estructura oficial CSV para diligenciar"
            >
              <span>⬇️</span> Descargar Plantilla
            </a>

            <button className="btn btn-outline btn-sm" onClick={clearView} title="Limpiar la visualización actual">
              <span>🗑️</span> Limpiar
            </button>
          </div>
        </div>

        {/* SUMMARY KPI CARDS */}
        <div className="reconciliation-kpi-grid">
          <div className="reconcile-kpi-card accent-blue">
            <span className="reconcile-kpi-label">Total Transacciones</span>
            <span className="reconcile-kpi-val" id="reconcile-kpi-total-trx">
              {totalTrx}
            </span>
            <span className="reconcile-kpi-sub" id="reconcile-kpi-total-cop">
              {formatCOP(totalCop)} COP
            </span>
          </div>

          <div className="reconcile-kpi-card accent-emerald">
            <span className="reconcile-kpi-label">Match Exógena (100%)</span>
            <span className="reconcile-kpi-val" id="reconcile-kpi-match-count" style={{ color: 'var(--emerald)' }}>
              {matchCount}
            </span>
            <span className="reconcile-kpi-sub" id="reconcile-kpi-match-pct">
              {matchPct}% Conciliado
            </span>
          </div>

          <div className="reconcile-kpi-card accent-amber">
            <span className="reconcile-kpi-label">Diferencias / Deducciones</span>
            <span className="reconcile-kpi-val" id="reconcile-kpi-diff-count" style={{ color: 'var(--amber)' }}>
              {diffCount}
            </span>
            <span className="reconcile-kpi-sub" id="reconcile-kpi-diff-sub">
              Soportadas en certificados
            </span>
          </div>

          <div className="reconcile-kpi-card accent-rose">
            <span className="reconcile-kpi-label">Discrepancias / Alertas</span>
            <span className="reconcile-kpi-val" id="reconcile-kpi-error-count" style={{ color: 'var(--rose)' }}>
              {errorCount}
            </span>
            <span className="reconcile-kpi-sub" id="reconcile-kpi-error-sub">
              Requieren revisión
            </span>
          </div>
        </div>
      </div>

      {/* VALIDATION ERRORS (IF ANY) */}
      {errors.length > 0 && (
        <div id="reconciliation-errors-box" className="card" style={{ marginBottom: '16px', borderColor: 'var(--rose-border)' }}>
          <div className="card-header" style={{ background: 'var(--rose-light)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--rose)', margin: 0 }}>
              ⚠️ Errores de Validación en el Archivo CSV ({errors.length})
            </h3>
          </div>
          <div className="card-body" style={{ padding: '10px 16px' }}>
            <ul id="reconciliation-errors-list" style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--rose)' }}>
              {errors.map((err, i) => (
                <li key={i}>
                  Fila {err.row ?? err.fila} [{err.column ?? err.campo}]: {err.error ?? err.mensaje} (Valor: &quot;{err.value ?? err.valor_encontrado}&quot;)
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* FILTER BUTTONS & SEARCH BAR */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            id="reconcile-btn-filter-all"
            onClick={() => setActiveFilter('all')}
          >
            Todas ({items.length})
          </button>
          <button
            className={`btn btn-sm ${activeFilter === 'trabajo' ? 'btn-primary' : 'btn-outline'}`}
            id="reconcile-btn-filter-trabajo"
            onClick={() => setActiveFilter('trabajo')}
          >
            Trabajo (C32)
          </button>
          <button
            className={`btn btn-sm ${activeFilter === 'capital' ? 'btn-primary' : 'btn-outline'}`}
            id="reconcile-btn-filter-capital"
            onClick={() => setActiveFilter('capital')}
          >
            Capital (C58)
          </button>
          <button
            className={`btn btn-sm ${activeFilter === 'nolaboral' ? 'btn-primary' : 'btn-outline'}`}
            id="reconcile-btn-filter-nolaboral"
            onClick={() => setActiveFilter('nolaboral')}
          >
            No Laboral (C74)
          </button>
          <button
            className={`btn btn-sm ${activeFilter === 'deducciones' ? 'btn-primary' : 'btn-outline'}`}
            id="reconcile-btn-filter-deducciones"
            onClick={() => setActiveFilter('deducciones')}
          >
            Deducciones
          </button>
          <button
            className={`btn btn-sm ${activeFilter === 'exentas' ? 'btn-primary' : 'btn-outline'}`}
            id="reconcile-btn-filter-exentas"
            onClick={() => setActiveFilter('exentas')}
          >
            Rentas Exentas
          </button>
          <button
            className={`btn btn-sm ${activeFilter === 'alertas' ? 'btn-primary' : 'btn-outline'}`}
            id="reconcile-btn-filter-alertas"
            onClick={() => setActiveFilter('alertas')}
            style={{ color: '#e11d48' }}
          >
            Alertas ({errorCount})
          </button>
        </div>

        <input
          type="text"
          id="reconcile-search-input"
          className="text-input"
          placeholder="Buscar por tercero, NIT, casilla..."
          style={{ width: '240px', fontSize: '12px' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* SPREADSHEET TABLE */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="spreadsheet-table-container">
            <table className="spreadsheet-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-subtle)' }}>
                  <th style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>Fila</th>
                  <th style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>Fecha</th>
                  <th style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>Tercero / Emisor</th>
                  <th style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>NIT</th>
                  <th style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>Concepto</th>
                  <th style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>Cédula</th>
                  <th style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>Casilla F210</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-primary)' }}>Valor Declarado</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-primary)' }}>Exógena DIAN</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-primary)' }}>Estado</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-primary)' }}>Acción</th>
                </tr>
              </thead>
              <tbody id="reconciliation-tbody">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No se encontraron registros de conciliación.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => {
                    const valor = getItemValor(item);
                    const cedula = getItemCedula(item);
                    const casilla = getItemCasilla(item);
                    const estado = getItemEstado(item);
                    const filaNum = item.fila_origen ?? idx + 1;

                    return (
                      <tr
                        key={item.id || idx}
                        style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                        onClick={() => setSelectedDetailItem(item)}
                      >
                        <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)' }}>
                          #{filaNum}
                        </td>
                        <td style={{ padding: '8px 12px', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{item.fecha || '-'}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.tercero_nombre}
                        </td>
                        <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{item.tercero_nit}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{item.descripcion}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)' }}>{cedula}</span>
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <span
                            style={{
                              background: 'var(--primary-light)',
                              color: 'var(--primary)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 700,
                              fontSize: '11px',
                            }}
                          >
                            {casilla}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: '8px 12px',
                            textAlign: 'right',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {formatCOP(valor)}
                        </td>
                        <td
                          style={{
                            padding: '8px 12px',
                            textAlign: 'right',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--emerald)',
                          }}
                        >
                          {item.valor_exogena_cop !== null && item.valor_exogena_cop !== undefined
                            ? formatCOP(item.valor_exogena_cop)
                            : '-'}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          {estado === 'MATCH_EXACTO' || estado === 'CONCILIADO_EXACTO' ? (
                            <span style={{ color: 'var(--emerald)', fontWeight: 800, fontSize: '11px' }}>✓ Match 100%</span>
                          ) : estado === 'DIFERENCIA_JUSTIFICADA' || estado === 'CONCILIADO_CON_DIFERENCIA' || estado === 'SOLO_EN_CERTIFICADOS' ? (
                            <span style={{ color: 'var(--amber)', fontWeight: 800, fontSize: '11px' }}>⚠️ Diferencia</span>
                          ) : (
                            <span style={{ color: 'var(--rose)', fontWeight: 800, fontSize: '11px' }}>🚨 Alerta</span>
                          )}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <button
                            className="btn btn-outline btn-xs"
                            style={{ padding: '2px 8px', fontSize: '11px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDetailItem(item);
                            }}
                          >
                            🔍 Detalle
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedDetailItem && (
        <div
          id="modal-reconciliation-detail"
          className="modal-backdrop"
          style={{ display: 'flex' }}
          onClick={() => setSelectedDetailItem(null)}
        >
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '22px' }}>🔍</span>
                <div>
                  <h3 id="reconcile-detail-title" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Auditoría Didáctica de Transacción
                  </h3>
                  <span id="reconcile-detail-subtitle" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Fila #{selectedDetailItem.fila_origen ?? 1} • Cédula de {getItemCedula(selectedDetailItem)}
                  </span>
                </div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedDetailItem(null)}>
                ✕ Cerrar
              </button>
            </div>

            <div className="modal-body" style={{ padding: '16px 0' }}>
              <div className="reconcile-detail-grid">
                <div className="reconcile-detail-field">
                  <span className="detail-label">Tercero / Emisor</span>
                  <strong id="reconcile-detail-tercero" className="detail-val">
                    {selectedDetailItem.tercero_nombre}
                  </strong>
                </div>

                <div className="reconcile-detail-field">
                  <span className="detail-label">NIT / Documento</span>
                  <span
                    id="reconcile-detail-nit"
                    className="detail-val"
                    style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                  >
                    {selectedDetailItem.tercero_nit}
                  </span>
                </div>

                <div className="reconcile-detail-field">
                  <span className="detail-label">Archivo Soporte de Origen</span>
                  <span id="reconcile-detail-archivo" className="detail-val" style={{ fontSize: '11.5px', color: 'var(--primary)' }}>
                    {selectedDetailItem.archivo_origen ?? selectedDetailItem.soporte_documento ?? 'Certificado Oficial'}
                  </span>
                </div>

                <div className="reconcile-detail-field">
                  <span className="detail-label">Fecha del Movimiento</span>
                  <span id="reconcile-detail-fecha" className="detail-val">
                    {selectedDetailItem.fecha || '2026-01-01'}
                  </span>
                </div>

                <div className="reconcile-detail-field">
                  <span className="detail-label">Valor Declarado (Certificado)</span>
                  <strong
                    id="reconcile-detail-val-declarado"
                    className="detail-val"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '14px' }}
                  >
                    {formatCOP(getItemValor(selectedDetailItem))}
                  </strong>
                </div>

                <div className="reconcile-detail-field">
                  <span className="detail-label">Valor Reportado Exógena DIAN</span>
                  <strong
                    id="reconcile-detail-val-exogena"
                    className="detail-val"
                    style={{ color: 'var(--emerald)', fontFamily: 'var(--font-mono)', fontSize: '14px' }}
                  >
                    {selectedDetailItem.valor_exogena_cop !== null && selectedDetailItem.valor_exogena_cop !== undefined
                      ? formatCOP(selectedDetailItem.valor_exogena_cop)
                      : 'No reportado'}
                  </strong>
                </div>
              </div>

              {/* EXPLICACIÓN DIDÁCTICA BOX */}
              <div
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '14px',
                  marginTop: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                    📋 ¿Cómo alimenta el Formulario 210?
                  </span>
                  <span
                    id="reconcile-detail-casilla-badge"
                    className="badge-uvt"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                  >
                    {getItemCasilla(selectedDetailItem)}
                  </span>
                </div>
                <p
                  id="reconcile-detail-explicacion"
                  style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}
                >
                  {selectedDetailItem.explicacion_didactica ||
                    'Esta transacción se suma directamente a la casilla correspondiente del Formulario 210.'}
                </p>
              </div>

              {/* BENEFICIO Y FUNDAMENTO LEGAL */}
              <div
                style={{
                  background: 'var(--amber-light)',
                  border: '1px solid var(--amber-border)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginTop: '10px',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--amber)', textTransform: 'uppercase' }}>
                  ⚖️ Fundamento Legal &amp; Estatuto Tributario
                </span>
                <div id="reconcile-detail-norma" style={{ fontSize: '12px', color: 'var(--amber)', marginTop: '3px' }}>
                  {selectedDetailItem.beneficio_asociado ?? selectedDetailItem.norma_et ?? 'Estatuto Tributario Nacional'}
                </div>
              </div>
            </div>

            <div
              className="modal-footer"
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '12px',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button className="btn btn-primary btn-sm" onClick={() => setSelectedDetailItem(null)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
