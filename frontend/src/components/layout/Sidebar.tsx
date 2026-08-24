import React from 'react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
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
    if (mod === 'pn' || mod === 'pj' || mod === 'simple') {
      if (activeModule !== mod) return false;
      if (sub && activeSubTab !== sub) return false;
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
            title="Ir a la página principal de bienvenida"
          >
            <div className="sidebar-logo-badge">
              <span className="logo-full">Fiscol</span>
              <span className="logo-short">F</span>
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

        <nav className="sidebar-nav">
          {/* GRUPO: INICIO & IA SKILLS */}
          <div>
            <div className="sidebar-group-title">Inicio & Asistente IA</div>
            <ul className="sidebar-menu">
              <li>
                <button
                  className="sidebar-item-btn"
                  id="nav-item-landing"
                  onClick={() => navigateToView('landing')}
                >
                  <span className="sidebar-item-icon">🏠</span>
                  <span className="sidebar-item-label">Inicio / Bienvenida</span>
                  <span className="sidebar-item-tag" style={{ background: '#0284c7', color: 'white' }}>
                    Hero
                  </span>
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

          {/* GRUPO: CALENDARIO & VENCIMIENTOS */}
          <div>
            <div className="sidebar-group-title">Calendario & Vencimientos</div>
            <ul className="sidebar-menu">
              <li>
                <button
                  className={`sidebar-item-btn ${isNavActive('calendario') ? 'active' : ''}`}
                  id="nav-item-calendario"
                  onClick={() => navigateTo('calendario', 'main')}
                >
                  <span className="sidebar-item-icon">📅</span>
                  <span className="sidebar-item-label">Calendario & Consulta NIT</span>
                  <span className="sidebar-item-tag" style={{ background: '#2563eb', color: 'white' }}>
                    DIAN
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* GRUPO: RENTA PERSONAS NATURALES */}
          <div>
            <div className="sidebar-group-title">Renta Personas Naturales</div>
            <ul className="sidebar-menu">
              <li>
                <button
                  className={`sidebar-item-btn ${isNavActive('pn', 'calc') ? 'active' : ''}`}
                  id="nav-item-pn-calc"
                  onClick={() => navigateTo('pn', 'calc')}
                >
                  <span className="sidebar-item-icon">👤</span>
                  <span className="sidebar-item-label">Depuración Cédula General</span>
                  <span className="sidebar-item-tag">F-210</span>
                </button>
              </li>
              <li>
                <button
                  className={`sidebar-item-btn ${isNavActive('pn', 'f210') ? 'active' : ''}`}
                  id="nav-item-pn-f210"
                  onClick={() => navigateTo('pn', 'f210')}
                >
                  <span className="sidebar-item-icon">📋</span>
                  <span className="sidebar-item-label">Formulario 210 (Copia Real)</span>
                  <span className="sidebar-item-tag">Facsímil</span>
                </button>
              </li>
              <li>
                <button
                  className={`sidebar-item-btn ${isNavActive('pn', 'marginal') ? 'active' : ''}`}
                  id="nav-item-pn-marginal"
                  onClick={() => navigateTo('pn', 'marginal')}
                >
                  <span className="sidebar-item-icon">🌡️</span>
                  <span className="sidebar-item-label">Tarifa Progresiva & Termómetro</span>
                  <span className="sidebar-item-tag">Art. 241</span>
                </button>
              </li>
              <li>
                <button
                  className={`sidebar-item-btn ${isNavActive('pn', 'conciliacion') ? 'active' : ''}`}
                  id="nav-item-pn-conciliacion"
                  onClick={() => navigateTo('pn', 'conciliacion')}
                >
                  <span className="sidebar-item-icon">📑</span>
                  <span className="sidebar-item-label">Conciliación Exógena & CSV</span>
                  <span className="sidebar-item-tag">Spreadsheet</span>
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
            </ul>
          </div>

          {/* GRUPO: RENTA EMPRESARIAL & JURÍDICAS */}
          <div>
            <div className="sidebar-group-title">Renta Empresarial & PJ</div>
            <ul className="sidebar-menu">
              <li>
                <button
                  className={`sidebar-item-btn ${isNavActive('pj', 'calc') ? 'active' : ''}`}
                  id="nav-item-pj-calc"
                  onClick={() => navigateTo('pj', 'calc')}
                >
                  <span className="sidebar-item-icon">🏢</span>
                  <span className="sidebar-item-label">Depuración Persona Jurídica</span>
                  <span className="sidebar-item-tag">35%</span>
                </button>
              </li>
              <li>
                <button
                  className={`sidebar-item-btn ${isNavActive('pj', 'f110') ? 'active' : ''}`}
                  id="nav-item-pj-f110"
                  onClick={() => navigateTo('pj', 'f110')}
                >
                  <span className="sidebar-item-icon">📋</span>
                  <span className="sidebar-item-label">Formulario 110 (Copia Real)</span>
                  <span className="sidebar-item-tag">Facsímil</span>
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
                  <span className="sidebar-item-label">Sobretasas & Regímenes</span>
                  <span className="sidebar-item-tag">Art. 240</span>
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
            </ul>
          </div>

          {/* GRUPO: RÉGIMEN SIMPLE DE TRIBUTACIÓN */}
          <div>
            <div className="sidebar-group-title">Régimen SIMPLE (RST)</div>
            <ul className="sidebar-menu">
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
                  className={`sidebar-item-btn ${isNavActive('simple', 'f260') ? 'active' : ''}`}
                  id="nav-item-simple-f260"
                  onClick={() => navigateTo('simple', 'f260')}
                >
                  <span className="sidebar-item-icon">📋</span>
                  <span className="sidebar-item-label">Formulario 260 (Copia Real)</span>
                  <span className="sidebar-item-tag">Facsímil</span>
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
                  <span className="sidebar-item-label">Checklist Requisitos & Exclusiones</span>
                  <span className="sidebar-item-tag">Art. 905</span>
                </button>
              </li>
            </ul>
          </div>

          {/* GRUPO: IMPUESTOS PERIÓDICOS */}
          <div>
            <div className="sidebar-group-title">Impuestos Periódicos</div>
            <ul className="sidebar-menu">
              <li>
                <button
                  className={`sidebar-item-btn ${isNavActive('iva') ? 'active' : ''}`}
                  id="nav-item-iva"
                  onClick={() => navigateTo('iva', 'main')}
                >
                  <span className="sidebar-item-icon">🛍️</span>
                  <span className="sidebar-item-label">Impuesto a las Ventas (IVA)</span>
                  <span className="sidebar-item-tag">F-300</span>
                </button>
              </li>
              <li>
                <button
                  className={`sidebar-item-btn ${isNavActive('retefuente') ? 'active' : ''}`}
                  id="nav-item-retefuente"
                  onClick={() => navigateTo('retefuente', 'main')}
                >
                  <span className="sidebar-item-icon">💰</span>
                  <span className="sidebar-item-label">Retención en la Fuente</span>
                  <span className="sidebar-item-tag">F-350</span>
                </button>
              </li>
            </ul>
          </div>

          {/* GRUPO: OPTIMIZACIÓN & AUDITORÍA */}
          <div>
            <div className="sidebar-group-title">Optimización & Auditoría</div>
            <ul className="sidebar-menu">
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
              <li>
                <button
                  className={`sidebar-item-btn ${isNavActive('presentacion') ? 'active' : ''}`}
                  id="nav-item-presentacion"
                  onClick={() => navigateTo('presentacion', 'main')}
                >
                  <span className="sidebar-item-icon">⚖️</span>
                  <span className="sidebar-item-label">Presentación, Auditoría & Sanciones</span>
                  <span className="sidebar-item-tag">DIAN</span>
                </button>
              </li>
              <li>
                <button
                  className={`sidebar-item-btn ${isNavActive('inflacionario') ? 'active' : ''}`}
                  id="nav-item-inflacionario"
                  onClick={() => navigateTo('inflacionario', 'main')}
                >
                  <span className="sidebar-item-icon">📊</span>
                  <span className="sidebar-item-label">Ajuste por Inflación & Rendimientos</span>
                  <span className="sidebar-item-tag" style={{ background: '#0284c7', color: 'white' }}>
                    Art. 38 & 40-1
                  </span>
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
                  <span className="sidebar-item-label">Inmuebles & Cuentas AFC</span>
                  <span className="sidebar-item-tag" style={{ background: '#10b981', color: 'white' }}>
                    5 Estrategias
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
                    Art. 8 & 236
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* GRUPO: APRENDE & FUNDAMENTOS */}
          <div>
            <div className="sidebar-group-title">Aprende &amp; Fundamentos</div>
            <ul className="sidebar-menu">
              <li>
                <button
                  className={`sidebar-item-btn ${isNavActive('glosario') ? 'active' : ''}`}
                  id="nav-item-glosario"
                  onClick={() => navigateTo('glosario', 'main')}
                >
                  <span className="sidebar-item-icon">📚</span>
                  <span className="sidebar-item-label">Glosario &amp; Guía Básica</span>
                  <span className="sidebar-item-tag" style={{ background: '#0284c7', color: 'white' }}>
                    Aprende
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* GRUPO: CONFIGURACIÓN & SISTEMA */}
          <div>
            <div className="sidebar-group-title">Configuración & Motor</div>
            <ul className="sidebar-menu">
              <li>
                <button
                  className={`sidebar-item-btn ${isNavActive('rules') ? 'active' : ''}`}
                  id="nav-item-rules"
                  onClick={() => navigateTo('rules', 'main')}
                >
                  <span className="sidebar-item-icon">⚙️</span>
                  <span className="sidebar-item-label">Motor de Reglas & UVT</span>
                  <span className="sidebar-item-tag">JSON</span>
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
