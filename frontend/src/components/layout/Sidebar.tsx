import React from 'react';
import { useApp } from '../../context/AppContext';
import { FiscolLogoIcon } from '../common/FiscolLogo';

export const Sidebar: React.FC = () => {
  const {
    activeWorkspace,
    activeModule,
    activeSubTab,
    navigateTo,
    navigateToView,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    closeMobileSidebar,
    theme,
    toggleTheme,
  } = useApp();

  const isNavActive = (mod: string, sub?: string) => {
    if (mod === 'pn' || mod === 'pj' || mod === 'simple' || mod === 'iva' || mod === 'retefuente') {
      if (activeModule !== mod) return false;
      if (sub && activeSubTab !== sub) return false;
      return true;
    }
    if (mod === 'glosario') {
      if (activeModule !== 'glosario') return false;
      if (sub === 'errores') return activeSubTab === 'errores';
      if (sub === 'glosario') return activeSubTab !== 'errores';
      return true;
    }
    return activeModule === mod;
  };

  return (
    <>
      {/* BACKDROP PARA MÓVIL (CIERRA EL DRAWER AL TOCAR AFUERA) */}
      <div
        className={`sidebar-backdrop ${isMobileSidebarOpen ? 'active' : ''}`}
        id="sidebar-backdrop"
        onClick={closeMobileSidebar}
      />

      {/* SIDEBAR LATERAL COLAPSABLE & OFF-CANVAS MOBILE */}
      <aside
        className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileSidebarOpen ? 'mobile-open' : ''}`}
        id="app-sidebar"
      >
        <div className="sidebar-header">
          <a
            href="#"
            className="sidebar-logo"
            onClick={(e) => {
              e.preventDefault();
              navigateToView('landing');
            }}
            title="Ir al Portal Principal para cambiar de espacio"
          >
            <div className="sidebar-logo-badge">
              <FiscolLogoIcon size={28} />
            </div>
            <div className="sidebar-logo-text">
              <span className="sidebar-logo-title">Fiscol</span>
              <span className="sidebar-logo-subtitle">Suite Tributaria DIAN</span>
            </div>
          </a>
          <button
            className="sidebar-toggle-btn"
            id="btn-toggle-sidebar"
            onClick={toggleSidebar}
            title="Colapsar / Expandir barra lateral"
          >
            {isSidebarCollapsed ? '▶' : '◀'}
          </button>
          <button
            className="sidebar-close-mobile-btn"
            id="btn-close-sidebar-mobile"
            onClick={closeMobileSidebar}
            title="Cerrar barra lateral"
          >
            ✕
          </button>
        </div>

        {/* WORKSPACE SWITCHER BANNER */}
        <div
          style={{
            margin: '8px 10px 10px 10px',
            padding: '8px 10px',
            borderRadius: '8px',
            background: 'var(--bg-subtle, #f1f5f9)',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            display: isSidebarCollapsed ? 'none' : 'block',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Espacio Activo
            </span>
            <button
              className="btn btn-outline btn-xs"
              onClick={() => navigateToView('landing')}
              style={{ fontSize: '10px', padding: '1px 6px', height: '20px' }}
              title="Volver al Portal Principal para cambiar de espacio"
            >
              ⇄ Cambiar
            </button>
          </div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)' }}>
            {activeWorkspace === 'naturales' && '🟢 1. Personas Naturales'}
            {activeWorkspace === 'juridicas' && '🏢 2. Personas Jurídicas'}
            {activeWorkspace === 'periodicos' && '🛍️ 3. Impuestos Periódicos'}
            {activeWorkspace === 'sanciones' && '⚖️ 4. Auditoría & Sanciones'}
            {activeWorkspace === 'globales' && '🌐 Herramientas Globales'}
          </div>
        </div>

        <nav className="sidebar-nav">
          {/* RENDERIZADO EXCLUSIVO: ESPACIO PERSONAS NATURALES */}
          {activeWorkspace === 'naturales' && (
            <div>
              <div className="sidebar-group-title">🟢 Personas Naturales</div>
              <ul className="sidebar-menu">
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('pn', 'hub') ? 'active' : ''}`}
                    id="nav-item-pn-hub"
                    onClick={() => navigateTo('pn', 'hub')}
                    style={{
                      fontWeight: 700,
                      background: isNavActive('pn', 'hub') ? undefined : 'rgba(37, 99, 235, 0.06)',
                    }}
                  >
                    <span className="sidebar-item-icon">🏠</span>
                    <span className="sidebar-item-label">Inicio &amp; Guía del Espacio</span>
                    <span className="sidebar-item-tag" style={{ background: '#2563eb', color: 'white' }}>
                      Guía
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('calendario') ? 'active' : ''}`}
                    id="nav-item-pn-calendario"
                    onClick={() => navigateTo('calendario', 'main')}
                  >
                    <span className="sidebar-item-icon">📅</span>
                    <span className="sidebar-item-label">Calendario DIAN &amp; NIT</span>
                    <span className="sidebar-item-tag" style={{ background: '#0284c7', color: 'white' }}>
                      2026
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('glosario', 'glosario') ? 'active' : ''}`}
                    id="nav-item-pn-glosario"
                    onClick={() => navigateTo('glosario', 'glosario')}
                  >
                    <span className="sidebar-item-icon">📚</span>
                    <span className="sidebar-item-label">Glosario Tributario A-Z</span>
                    <span className="sidebar-item-tag" style={{ background: '#0369a1', color: 'white' }}>
                      Guía
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('pn', 'test_obligados') ? 'active' : ''}`}
                    id="nav-item-pn-obligados"
                    onClick={() => navigateTo('pn', 'test_obligados')}
                  >
                    <span className="sidebar-item-icon">🚦</span>
                    <span className="sidebar-item-label">¿Debo Declarar Renta?</span>
                    <span className="sidebar-item-tag" style={{ background: '#16a34a', color: 'white' }}>
                      Test 3 min
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('pn', 'calc') ? 'active' : ''}`}
                    id="nav-item-pn-calc"
                    onClick={() => navigateTo('pn', 'calc')}
                  >
                    <span className="sidebar-item-icon">👤</span>
                    <span className="sidebar-item-label">Cédula General (F-210)</span>
                    <span className="sidebar-item-tag">Depuración</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('pn', 'optimizer') ? 'active' : ''}`}
                    id="nav-item-pn-optimizer"
                    onClick={() => navigateTo('pn', 'optimizer')}
                  >
                    <span className="sidebar-item-icon">💡</span>
                    <span className="sidebar-item-label">Optimizador What-If</span>
                    <span className="sidebar-item-tag" style={{ background: '#f59e0b', color: 'white' }}>
                      Ahorro
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('pn', 'marginal') ? 'active' : ''}`}
                    id="nav-item-pn-marginal"
                    onClick={() => navigateTo('pn', 'marginal')}
                  >
                    <span className="sidebar-item-icon">🌡️</span>
                    <span className="sidebar-item-label">Tarifa Progresiva &amp; Termómetro</span>
                    <span className="sidebar-item-tag">Art. 241</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('pn', 'comparacion_patrimonial') ? 'active' : ''}`}
                    id="nav-item-pn-comparacion"
                    onClick={() => navigateTo('pn', 'comparacion_patrimonial')}
                  >
                    <span className="sidebar-item-icon">⚖️</span>
                    <span className="sidebar-item-label">Comparación Patrimonial</span>
                    <span className="sidebar-item-tag">Art. 236</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('pn', 'inflacionario') || activeModule === 'inflacionario' ? 'active' : ''}`}
                    id="nav-item-pn-inflacionario"
                    onClick={() => navigateTo('pn', 'inflacionario')}
                  >
                    <span className="sidebar-item-icon">📊</span>
                    <span className="sidebar-item-label">Componente Inflacionario</span>
                    <span className="sidebar-item-tag">Art. 38/40-1</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('pn', 'conciliacion') ? 'active' : ''}`}
                    id="nav-item-pn-conciliacion"
                    onClick={() => navigateTo('pn', 'conciliacion')}
                  >
                    <span className="sidebar-item-icon">📑</span>
                    <span className="sidebar-item-label">Conciliación Exógena &amp; CSV</span>
                    <span className="sidebar-item-tag">Spreadsheet</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('art73') ? 'active' : ''}`}
                    id="nav-item-art73"
                    onClick={() => navigateTo('art73', 'main')}
                  >
                    <span className="sidebar-item-icon">📈</span>
                    <span className="sidebar-item-label">Reajuste Fiscal de Activos</span>
                    <span className="sidebar-item-tag" style={{ background: '#059669', color: 'white' }}>
                      Art. 73
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('inmuebles-afc') ? 'active' : ''}`}
                    id="nav-item-inmuebles-afc"
                    onClick={() => navigateTo('inmuebles-afc', 'main')}
                  >
                    <span className="sidebar-item-icon">🏡</span>
                    <span className="sidebar-item-label">Inmuebles &amp; Cuentas AFC</span>
                    <span className="sidebar-item-tag" style={{ background: '#10b981', color: 'white' }}>
                      Art. 311-1
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('tributacion-pareja') ? 'active' : ''}`}
                    id="nav-item-tributacion-pareja"
                    onClick={() => navigateTo('tributacion-pareja', 'main')}
                  >
                    <span className="sidebar-item-icon">👫</span>
                    <span className="sidebar-item-label">Tributación en Pareja</span>
                    <span className="sidebar-item-tag" style={{ background: '#8b5cf6', color: 'white' }}>
                      Art. 8
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('pn', 'f210') ? 'active' : ''}`}
                    id="nav-item-pn-f210"
                    onClick={() => navigateTo('pn', 'f210')}
                  >
                    <span className="sidebar-item-icon">📋</span>
                    <span className="sidebar-item-label">Formulario 210 Oficial</span>
                    <span className="sidebar-item-tag">Facsímil</span>
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* RENDERIZADO EXCLUSIVO: ESPACIO PERSONAS JURÍDICAS */}
          {activeWorkspace === 'juridicas' && (
            <div>
              <div className="sidebar-group-title">🏢 Personas Jurídicas &amp; RST</div>
              <ul className="sidebar-menu">
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('pj', 'hub') ? 'active' : ''}`}
                    id="nav-item-pj-hub"
                    onClick={() => navigateTo('pj', 'hub')}
                    style={{
                      fontWeight: 700,
                      background: isNavActive('pj', 'hub') ? undefined : 'rgba(37, 99, 235, 0.06)',
                    }}
                  >
                    <span className="sidebar-item-icon">🏠</span>
                    <span className="sidebar-item-label">Inicio &amp; Guía del Espacio</span>
                    <span className="sidebar-item-tag" style={{ background: '#2563eb', color: 'white' }}>
                      Guía
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('calendario') ? 'active' : ''}`}
                    id="nav-item-pj-calendario"
                    onClick={() => navigateTo('calendario', 'main')}
                  >
                    <span className="sidebar-item-icon">📅</span>
                    <span className="sidebar-item-label">Calendario DIAN &amp; NIT</span>
                    <span className="sidebar-item-tag" style={{ background: '#0284c7', color: 'white' }}>
                      2026
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('glosario', 'glosario') ? 'active' : ''}`}
                    id="nav-item-pj-glosario"
                    onClick={() => navigateTo('glosario', 'glosario')}
                  >
                    <span className="sidebar-item-icon">📚</span>
                    <span className="sidebar-item-label">Glosario Tributario A-Z</span>
                    <span className="sidebar-item-tag" style={{ background: '#0369a1', color: 'white' }}>
                      Guía
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('pj', 'calc') ? 'active' : ''}`}
                    id="nav-item-pj-calc"
                    onClick={() => navigateTo('pj', 'calc')}
                  >
                    <span className="sidebar-item-icon">🏢</span>
                    <span className="sidebar-item-label">Depuración Renta Ordinaria</span>
                    <span className="sidebar-item-tag">35%</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('pj', 'ttd') ? 'active' : ''}`}
                    id="nav-item-pj-ttd"
                    onClick={() => navigateTo('pj', 'ttd')}
                  >
                    <span className="sidebar-item-icon">⚖️</span>
                    <span className="sidebar-item-label">Laboratorio Tasa Mínima TTD</span>
                    <span className="sidebar-item-tag">15%</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('pj', 'sobretasas') ? 'active' : ''}`}
                    id="nav-item-pj-sobretasas"
                    onClick={() => navigateTo('pj', 'sobretasas')}
                  >
                    <span className="sidebar-item-icon">⚡</span>
                    <span className="sidebar-item-label">Sobretasas Financiera &amp; Energía</span>
                    <span className="sidebar-item-tag">Art. 240</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('simple', 'comparador') ? 'active' : ''}`}
                    id="nav-item-simple-comparador"
                    onClick={() => navigateTo('simple', 'comparador')}
                  >
                    <span className="sidebar-item-icon">⚖️</span>
                    <span className="sidebar-item-label">Comparador Ordinario vs SIMPLE</span>
                    <span className="sidebar-item-tag">Decisión</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('simple', 'calc') ? 'active' : ''}`}
                    id="nav-item-simple-calc"
                    onClick={() => navigateTo('simple', 'calc')}
                  >
                    <span className="sidebar-item-icon">⚡</span>
                    <span className="sidebar-item-label">Liquidación Anual SIMPLE</span>
                    <span className="sidebar-item-tag">F-260</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('simple', 'f2593') ? 'active' : ''}`}
                    id="nav-item-simple-f2593"
                    onClick={() => navigateTo('simple', 'f2593')}
                  >
                    <span className="sidebar-item-icon">📅</span>
                    <span className="sidebar-item-label">Anticipos Bimestrales F-2593</span>
                    <span className="sidebar-item-tag">Bimestres</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('simple', 'requisitos') ? 'active' : ''}`}
                    id="nav-item-simple-requisitos"
                    onClick={() => navigateTo('simple', 'requisitos')}
                  >
                    <span className="sidebar-item-icon">✅</span>
                    <span className="sidebar-item-label">Checklist Requisitos RST</span>
                    <span className="sidebar-item-tag">Art. 905</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('pj', 'conciliacion') ? 'active' : ''}`}
                    id="nav-item-pj-conciliacion"
                    onClick={() => navigateTo('pj', 'conciliacion')}
                  >
                    <span className="sidebar-item-icon">📑</span>
                    <span className="sidebar-item-label">Conciliación NIIF vs Fiscal</span>
                    <span className="sidebar-item-tag">F-2516</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('pj', 'f110') ? 'active' : ''}`}
                    id="nav-item-pj-f110"
                    onClick={() => navigateTo('pj', 'f110')}
                  >
                    <span className="sidebar-item-icon">📋</span>
                    <span className="sidebar-item-label">Formulario 110 Oficial</span>
                    <span className="sidebar-item-tag">Facsímil</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('simple', 'f260') ? 'active' : ''}`}
                    id="nav-item-simple-f260"
                    onClick={() => navigateTo('simple', 'f260')}
                  >
                    <span className="sidebar-item-icon">📋</span>
                    <span className="sidebar-item-label">Formulario 260 Oficial</span>
                    <span className="sidebar-item-tag">Facsímil</span>
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* RENDERIZADO EXCLUSIVO: ESPACIO IMPUESTOS PERIÓDICOS */}
          {activeWorkspace === 'periodicos' && (
            <div>
              <div className="sidebar-group-title">🛍️ Impuestos Periódicos</div>
              <ul className="sidebar-menu">
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('retefuente', 'hub') || isNavActive('iva', 'hub') ? 'active' : ''}`}
                    id="nav-item-periodicos-hub"
                    onClick={() => navigateTo('retefuente', 'hub')}
                    style={{
                      fontWeight: 700,
                      background: isNavActive('retefuente', 'hub') || isNavActive('iva', 'hub') ? undefined : 'rgba(37, 99, 235, 0.06)',
                    }}
                  >
                    <span className="sidebar-item-icon">🏠</span>
                    <span className="sidebar-item-label">Inicio &amp; Guía del Espacio</span>
                    <span className="sidebar-item-tag" style={{ background: '#2563eb', color: 'white' }}>
                      Guía
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('calendario') ? 'active' : ''}`}
                    id="nav-item-periodicos-calendario"
                    onClick={() => navigateTo('calendario', 'main')}
                  >
                    <span className="sidebar-item-icon">📅</span>
                    <span className="sidebar-item-label">Calendario DIAN &amp; NIT</span>
                    <span className="sidebar-item-tag" style={{ background: '#0284c7', color: 'white' }}>
                      2026
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('glosario', 'glosario') ? 'active' : ''}`}
                    id="nav-item-periodicos-glosario"
                    onClick={() => navigateTo('glosario', 'glosario')}
                  >
                    <span className="sidebar-item-icon">📚</span>
                    <span className="sidebar-item-label">Glosario Tributario A-Z</span>
                    <span className="sidebar-item-tag" style={{ background: '#0369a1', color: 'white' }}>
                      Guía
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('retefuente', 'laboral') ? 'active' : ''}`}
                    id="nav-item-retefuente-laboral"
                    onClick={() => navigateTo('retefuente', 'laboral')}
                  >
                    <span className="sidebar-item-icon">👤</span>
                    <span className="sidebar-item-label">Retención Nómina &amp; Salarios</span>
                    <span className="sidebar-item-tag">Art. 383</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('retefuente', 'calc') ? 'active' : ''}`}
                    id="nav-item-retefuente-calc"
                    onClick={() => navigateTo('retefuente', 'calc')}
                  >
                    <span className="sidebar-item-icon">💰</span>
                    <span className="sidebar-item-label">Depuración Retención Fuente</span>
                    <span className="sidebar-item-tag">F-350</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('retefuente', 'tabla') ? 'active' : ''}`}
                    id="nav-item-retefuente-tabla"
                    onClick={() => navigateTo('retefuente', 'tabla')}
                  >
                    <span className="sidebar-item-icon">📚</span>
                    <span className="sidebar-item-label">Tabla Maestra de Retenciones</span>
                    <span className="sidebar-item-tag">UVT</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('iva', 'calc') ? 'active' : ''}`}
                    id="nav-item-iva-calc"
                    onClick={() => navigateTo('iva', 'calc')}
                  >
                    <span className="sidebar-item-icon">🛍️</span>
                    <span className="sidebar-item-label">Liquidación Periódica IVA</span>
                    <span className="sidebar-item-tag">F-300</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('iva', 'prorrateo') ? 'active' : ''}`}
                    id="nav-item-iva-prorrateo"
                    onClick={() => navigateTo('iva', 'prorrateo')}
                  >
                    <span className="sidebar-item-icon">⚖️</span>
                    <span className="sidebar-item-label">Prorrateo IVA Común</span>
                    <span className="sidebar-item-tag">Art. 490</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('iva', 'clasificador') ? 'active' : ''}`}
                    id="nav-item-iva-clasificador"
                    onClick={() => navigateTo('iva', 'clasificador')}
                  >
                    <span className="sidebar-item-icon">🔍</span>
                    <span className="sidebar-item-label">Clasificador Bienes &amp; IVA</span>
                    <span className="sidebar-item-tag">Tarifas</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('retefuente', 'f350') ? 'active' : ''}`}
                    id="nav-item-retefuente-f350"
                    onClick={() => navigateTo('retefuente', 'f350')}
                  >
                    <span className="sidebar-item-icon">📋</span>
                    <span className="sidebar-item-label">Formulario 350 Oficial</span>
                    <span className="sidebar-item-tag">Facsímil</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('iva', 'f300') ? 'active' : ''}`}
                    id="nav-item-iva-f300"
                    onClick={() => navigateTo('iva', 'f300')}
                  >
                    <span className="sidebar-item-icon">📋</span>
                    <span className="sidebar-item-label">Formulario 300 Oficial</span>
                    <span className="sidebar-item-tag">Facsímil</span>
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* RENDERIZADO EXCLUSIVO: ESPACIO AUDITORÍA & SANCIONES */}
          {activeWorkspace === 'sanciones' && (
            <div>
              <div className="sidebar-group-title">⚖️ Auditoría &amp; Sanciones</div>
              <ul className="sidebar-menu">
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('presentacion', 'hub') ? 'active' : ''}`}
                    id="nav-item-sanciones-hub"
                    onClick={() => navigateTo('presentacion', 'hub')}
                    style={{
                      fontWeight: 700,
                      background: isNavActive('presentacion', 'hub') ? undefined : 'rgba(37, 99, 235, 0.06)',
                    }}
                  >
                    <span className="sidebar-item-icon">🏠</span>
                    <span className="sidebar-item-label">Inicio &amp; Guía del Espacio</span>
                    <span className="sidebar-item-tag" style={{ background: '#2563eb', color: 'white' }}>
                      Guía
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('calendario') ? 'active' : ''}`}
                    id="nav-item-sanciones-calendario"
                    onClick={() => navigateTo('calendario', 'main')}
                  >
                    <span className="sidebar-item-icon">📅</span>
                    <span className="sidebar-item-label">Calendario DIAN &amp; NIT</span>
                    <span className="sidebar-item-tag" style={{ background: '#0284c7', color: 'white' }}>
                      2026
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('glosario', 'glosario') ? 'active' : ''}`}
                    id="nav-item-sanciones-glosario"
                    onClick={() => navigateTo('glosario', 'glosario')}
                  >
                    <span className="sidebar-item-icon">📚</span>
                    <span className="sidebar-item-label">Glosario Tributario A-Z</span>
                    <span className="sidebar-item-tag" style={{ background: '#0369a1', color: 'white' }}>
                      Guía
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('presentacion', 'main') ? 'active' : ''}`}
                    id="nav-item-presentacion"
                    onClick={() => navigateTo('presentacion', 'main')}
                  >
                    <span className="sidebar-item-icon">⚖️</span>
                    <span className="sidebar-item-label">Calculadora de Sanciones</span>
                    <span className="sidebar-item-tag">Arts. 640/641</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`sidebar-item-btn ${isNavActive('beneficios') ? 'active' : ''}`}
                    id="nav-item-beneficios"
                    onClick={() => navigateTo('beneficios', 'all')}
                  >
                    <span className="sidebar-item-icon">🎁</span>
                    <span className="sidebar-item-label">Catálogo de Beneficios</span>
                    <span className="sidebar-item-tag">E.T.</span>
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* HERRAMIENTAS GLOBALES & UTILIDADES */}
          <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-subtle, #e2e8f0)', paddingTop: '10px' }}>
            <div className="sidebar-group-title">🛠️ Utilidades &amp; Asistentes</div>
            <ul className="sidebar-menu">
              <li>
                <button
                  className={`sidebar-item-btn ${isNavActive('glosario', 'errores') ? 'active' : ''}`}
                  id="nav-item-errores"
                  onClick={() => navigateTo('glosario', 'errores')}
                >
                  <span className="sidebar-item-icon">⚠️</span>
                  <span className="sidebar-item-label">10 Errores Comunes</span>
                  <span className="sidebar-item-tag" style={{ background: '#dc2626', color: 'white' }}>
                    Alerta
                  </span>
                </button>
              </li>
              <li>
                <button
                  className={`sidebar-item-btn ${isNavActive('rules') ? 'active' : ''}`}
                  id="nav-item-rules"
                  onClick={() => navigateTo('rules', 'main')}
                >
                  <span className="sidebar-item-icon">⚙️</span>
                  <span className="sidebar-item-label">Motor de Reglas &amp; UVT</span>
                  <span className="sidebar-item-tag">JSON</span>
                </button>
              </li>
              <li>
                <button
                  className="sidebar-item-btn"
                  id="nav-item-skill-tutorial"
                  onClick={() => navigateToView('skill-tutorial')}
                >
                  <span className="sidebar-item-icon">🤖</span>
                  <span className="sidebar-item-label">Instalar Skill de IA</span>
                  <span className="sidebar-item-tag" style={{ background: '#7c3aed', color: 'white' }}>
                    Skills
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* SIDEBAR FOOTER CON SWITCH DE TEMA */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-inner">
            <button
              className="sidebar-theme-toggle-btn"
              id="sidebar-btn-theme-toggle"
              onClick={toggleTheme}
              title={theme === 'dark' ? '☀️ Cambiar a Modo Claro' : '🌙 Cambiar a Modo Oscuro'}
            >
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
              <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
            </button>
            <div style={{ fontSize: '9.5px', color: '#64748b', textAlign: 'center', marginTop: '4px' }}>
              Fiscol v2.5 • Colombia
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
