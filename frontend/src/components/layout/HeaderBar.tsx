import React from 'react';
import { useApp } from '../../context/AppContext';

export const HeaderBar: React.FC = () => {
  const {
    activeModule,
    activeSubTab,
    navigateTo,
    navigateToView,
    openMobileSidebar,
    taxYear,
    setTaxYear,
    availableYears,
    customUvtInput,
    setCustomUvtInput,
    handleUvtBlur,
    sessionId,
    copySessionId,
    createNewSession,
    theme,
    toggleTheme,
  } = useApp();

  const getModuleMeta = () => {
    switch (activeModule) {
      case 'calendario':
        return {
          breadcrumb: 'VENCIMIENTOS / CALENDARIO DIAN',
          title: 'Calendario Tributario Nacional & Consulta de Vencimientos por NIT',
          hasSubTabs: false,
        };
      case 'pn':
        return {
          breadcrumb: 'IMPUESTO DE RENTA / PERSONA NATURAL',
          title:
            activeSubTab === 'f210'
              ? 'Formulario 210 DIAN - Facsímil Oficial'
              : activeSubTab === 'marginal'
              ? 'Tarifa Marginal Progresiva & Termómetro (Art. 241 E.T.)'
              : activeSubTab === 'conciliacion'
              ? 'Hoja de Cálculo Fiscal & Conciliación Exógena DIAN'
              : 'Depuración Cédula General',
          hasSubTabs: true,
        };
      case 'pj':
        return {
          breadcrumb: 'IMPUESTO DE RENTA / PERSONA JURÍDICA',
          title: 'Liquidación Renta Empresarial (F110) & Tasa Mínima TTD (15%)',
          hasSubTabs: false,
        };
      case 'simple':
        return {
          breadcrumb: 'RÉGIMEN ESPECIAL / SIMPLE',
          title: 'Régimen Simple de Tributación - SIMPLE (Formulario 260)',
          hasSubTabs: false,
        };
      case 'iva':
        return {
          breadcrumb: 'IMPUESTOS INDIRECTOS / IVA',
          title: 'Impuesto sobre las Ventas - IVA (Formulario 300 DIAN)',
          hasSubTabs: false,
        };
      case 'retefuente':
        return {
          breadcrumb: 'IMPUESTOS PERIÓDICOS / RETENCIONES',
          title: 'Retención en la Fuente - Declaración Mensual (Formulario 350)',
          hasSubTabs: false,
        };
      case 'beneficios':
        return {
          breadcrumb: 'OPTIMIZACIÓN TRIBUTARIA / BENEFICIOS',
          title: 'Catálogo Integral de Beneficios, Deducciones & Rentas Exentas (E.T.)',
          hasSubTabs: false,
        };
      case 'presentacion':
        return {
          breadcrumb: 'DECLARACIÓN / AUDITORÍA & SANCIONES',
          title: 'Beneficio de Auditoría (Art. 689-3) & Calculadora Integral de Sanciones (Arts. 640, 641, 644)',
          hasSubTabs: false,
        };
      case 'art73':
        return {
          breadcrumb: 'OPTIMIZACIÓN / GANANCIAS OCASIONALES',
          title: 'Reajuste Fiscal de Activos Fijos - Multiplicador Histórico DANE (Art. 73 E.T.)',
          hasSubTabs: false,
        };
      case 'inmuebles-afc':
        return {
          breadcrumb: 'OPTIMIZACIÓN / INMUEBLES & VIVIENDA',
          title: 'Bienes Inmuebles, Reajuste Art. 73, Régimen Pre-1987 & Cuentas AFC (Art. 311-1 E.T.)',
          hasSubTabs: false,
        };
      case 'rules':
        return {
          breadcrumb: 'SISTEMA / PARÁMETROS TRIBUTARIOS',
          title: 'Inspector de Reglas Fiscales JSON & Convertidor de UVT',
          hasSubTabs: false,
        };
      default:
        return {
          breadcrumb: 'FISCOL / COLOMBIA',
          title: 'Suite Tributaria Profesional DIAN',
          hasSubTabs: false,
        };
    }
  };

  const meta = getModuleMeta();

  return (
    <header className="workspace-header">
      <div className="workspace-title-area">
        <button
          className="mobile-menu-btn"
          id="btn-mobile-menu"
          onClick={openMobileSidebar}
          aria-label="Abrir menú"
          title="Abrir navegación"
        >
          ☰
        </button>
        <div className="workspace-title-text">
          <span className="workspace-breadcrumbs" id="header-breadcrumbs">
            {meta.breadcrumb}
          </span>
          <h1 className="workspace-title" id="header-title">
            {meta.title}
          </h1>
        </div>
      </div>

      {/* SUB TABS CONTEXTUALES PARA PERSONA NATURAL */}
      {meta.hasSubTabs && activeModule === 'pn' && (
        <div className="sub-tabs-container" id="sub-tabs-bar" style={{ display: 'flex' }}>
          <button
            className={`sub-tab-btn ${activeSubTab === 'calc' ? 'active' : ''}`}
            id="sub-tab-btn-pn-calc"
            onClick={() => navigateTo('pn', 'calc')}
          >
            <span>✏️</span> Captura & Depuración
          </button>
          <button
            className={`sub-tab-btn ${activeSubTab === 'f210' ? 'active' : ''}`}
            id="sub-tab-btn-pn-f210"
            onClick={() => navigateTo('pn', 'f210')}
          >
            <span>📋</span> Formulario 210 DIAN Real
          </button>
          <button
            className={`sub-tab-btn ${activeSubTab === 'marginal' ? 'active' : ''}`}
            id="sub-tab-btn-pn-marginal"
            onClick={() => navigateTo('pn', 'marginal')}
          >
            <span>🌡️</span> Tarifa Progresiva & Termómetro
          </button>
          <button
            className={`sub-tab-btn ${activeSubTab === 'conciliacion' ? 'active' : ''}`}
            id="sub-tab-btn-pn-conciliacion"
            onClick={() => navigateTo('pn', 'conciliacion')}
          >
            <span>📑</span> Conciliación Exógena & CSV
          </button>
          <button
            className={`sub-tab-btn ${activeSubTab === 'comparacion_patrimonial' ? 'active' : ''}`}
            id="sub-tab-btn-pn-comparacion"
            onClick={() => navigateTo('pn', 'comparacion_patrimonial')}
          >
            <span>⚖️</span> Comparación Patrimonial (Art. 236)
          </button>
        </div>
      )}

      {/* CONTROLES GLOBALES */}
      <div className="workspace-controls">
        <div className="selector-group">
          <label>Año:</label>
          <select
            id="select-year"
            className="select-input"
            value={taxYear}
            onChange={(e) => setTaxYear(parseInt(e.target.value, 10))}
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        <div className="selector-group">
          <label>UVT:</label>
          <input
            type="text"
            id="input-custom-uvt"
            className="text-input"
            style={{ width: '105px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
            value={customUvtInput}
            onChange={(e) => setCustomUvtInput(e.target.value)}
            onBlur={handleUvtBlur}
          />
        </div>

        {/* SESSION BADGE & CONTROLS */}
        <div
          id="session-badge-container"
          className="header-session-badge"
          title="ID de sesión activa"
        >
          <span className="header-session-label">Sesión:</span>
          <span
            id="session-active-id-display"
            className="header-session-id"
          >
            {sessionId}
          </span>
          <button
            onClick={copySessionId}
            className="header-session-btn"
            title="Copiar ID de sesión"
          >
            📋
          </button>
          <button
            onClick={createNewSession}
            className="header-session-btn btn-new-session"
            title="Iniciar nueva sesión limpia"
          >
            ✨ Nueva
          </button>
        </div>

        {/* ACCESO RÁPIDO A SKILL DE IA */}
        <button
          id="header-btn-skill-tutorial"
          className="btn btn-outline btn-sm header-skill-btn"
          onClick={() => navigateToView('skill-tutorial')}
          title="Ver tutorial e instalar Skill de IA"
        >
          <span>🤖</span>
          <span className="header-skill-text">Skill IA</span>
        </button>

        {/* BOTÓN MODO OSCURO / CLARO */}
        <button
          id="btn-theme-toggle"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={theme === 'dark' ? '☀️ Cambiar a Modo Claro' : '🌙 Cambiar a Modo Oscuro'}
        >
          <span className="theme-toggle-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span className="theme-toggle-text">{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
        </button>
      </div>
    </header>
  );
};
