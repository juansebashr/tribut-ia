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
          breadcrumb: '1. PERSONAS NATURALES / RENTA',
          title:
            activeSubTab === 'hub' || activeSubTab === 'overview'
              ? 'Inicio & Guía del Espacio: Personas Naturales (Formulario 210)'
              : activeSubTab === 'test_obligados'
              ? '¿Debo Declarar Renta 2026? - Diagnóstico Rápido de Topes'
              : activeSubTab === 'optimizer'
              ? 'Optimizador Fiscal What-If (Ahorro AFC, FPV & Dependientes)'
              : activeSubTab === 'inflacionario'
              ? 'Componente Inflacionario de Rendimientos Financieros (Arts. 38 y 40-1 E.T.)'
              : activeSubTab === 'f210'
              ? 'Formulario 210 DIAN - Facsímil Oficial & Dictamen PDF'
              : activeSubTab === 'marginal'
              ? 'Tarifa Marginal Progresiva & Termómetro (Art. 241 E.T.)'
              : activeSubTab === 'comparacion_patrimonial'
              ? 'Comparación Patrimonial & Riesgo de Desajuste (Art. 236 E.T.)'
              : activeSubTab === 'conciliacion'
              ? 'Hoja de Cálculo Fiscal & Conciliación Exógena DIAN'
              : 'Depuración Cédula General (Waterfall & Tacómetro)',
          hasSubTabs: true,
        };
      case 'pj':
        return {
          breadcrumb: '2. PERSONAS JURÍDICAS / RENTA EMPRESARIAL',
          title:
            activeSubTab === 'hub' || activeSubTab === 'overview'
              ? 'Inicio & Guía del Espacio: Sociedades & Régimen Simple (F-110 & F-260)'
              : activeSubTab === 'f110'
              ? 'Formulario 110 DIAN - Facsímil Oficial'
              : activeSubTab === 'ttd'
              ? 'Laboratorio Tasa de Tributación Depurada TTD (15%)'
              : activeSubTab === 'sobretasas'
              ? 'Sobretasas Financiera, Energética & Regímenes Especiales'
              : activeSubTab === 'conciliacion'
              ? 'Conciliación Fiscal Exógena (PJ)'
              : 'Liquidación Renta Empresarial (F110)',
          hasSubTabs: true,
        };
      case 'simple':
        return {
          breadcrumb: '2. PERSONAS JURÍDICAS / RÉGIMEN SIMPLE (RST)',
          title:
            activeSubTab === 'hub' || activeSubTab === 'overview'
              ? 'Inicio & Guía del Espacio: Régimen Simple de Tributación (F-260)'
              : activeSubTab === 'f260'
              ? 'Formulario 260 DIAN - Facsímil Oficial'
              : activeSubTab === 'comparador'
              ? 'Comparador Ordinario vs SIMPLE (Art. 908 E.T.)'
              : activeSubTab === 'f2593'
              ? 'Anticipos Bimestrales SIMPLE (Formulario 2593)'
              : activeSubTab === 'requisitos'
              ? 'Checklist de Requisitos y Exclusiones del SIMPLE'
              : 'Declaración Consolidada Anual SIMPLE (F-260)',
          hasSubTabs: true,
        };
      case 'iva':
        return {
          breadcrumb: '3. IMPUESTOS PERIÓDICOS / IVA',
          title:
            activeSubTab === 'hub' || activeSubTab === 'overview'
              ? 'Inicio & Guía del Espacio: Impuestos Periódicos (IVA & Retefuente)'
              : activeSubTab === 'f300'
              ? 'Formulario 300 DIAN - Facsímil Oficial'
              : activeSubTab === 'prorrateo'
              ? 'Simulador de Prorrateo de IVA Común (Art. 490 E.T.)'
              : activeSubTab === 'clasificador'
              ? 'Catálogo y Clasificador de Bienes & Servicios IVA'
              : 'Liquidación Periódica IVA (Formulario 300)',
          hasSubTabs: true,
        };
      case 'retefuente':
        return {
          breadcrumb: '3. IMPUESTOS PERIÓDICOS / RETENCIÓN EN LA FUENTE',
          title:
            activeSubTab === 'hub' || activeSubTab === 'overview'
              ? 'Inicio & Guía del Espacio: Impuestos Periódicos (Retefuente & IVA)'
              : activeSubTab === 'f350'
              ? 'Formulario 350 DIAN - Facsímil Oficial'
              : activeSubTab === 'laboral'
              ? 'Liquidador Nómina & Retención Salarios (Art. 383 E.T.)'
              : activeSubTab === 'tabla'
              ? 'Tabla Maestra de Retención en la Fuente'
              : 'Declaración Mensual de Retenciones (F-350)',
          hasSubTabs: true,
        };
      case 'beneficios':
        return {
          breadcrumb: 'OPTIMIZACIÓN TRIBUTARIA / BENEFICIOS',
          title: 'Catálogo Integral de Beneficios, Deducciones & Rentas Exentas (E.T.)',
          hasSubTabs: false,
        };
      case 'presentacion':
        return {
          breadcrumb: '4. AUDITORÍA & SANCIONES',
          title:
            activeSubTab === 'hub' || activeSubTab === 'overview'
              ? 'Inicio & Guía del Espacio: Régimen Sancionatorio & Auditoría'
              : 'Beneficio de Auditoría (Art. 689-3) & Calculadora Integral de Sanciones (Arts. 640, 641, 644)',
          hasSubTabs: true,
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
      case 'calendario':
        return {
          breadcrumb: 'CALENDARIO TRIBUTARIO DIAN / VENCIMIENTOS',
          title: 'Calendario Tributario 2026 - Vencimientos por Últimos Dígitos del NIT',
          hasSubTabs: false,
        };
      case 'glosario':
        return {
          breadcrumb: 'EDUCACIÓN TRIBUTARIA & CONCEPTOS',
          title:
            activeSubTab === 'errores'
              ? '⚠️ 10 Errores Frecuentes al Declarar Impuestos ante la DIAN'
              : '📚 Glosario Tributario & Diccionario de Conceptos Fiscales A-Z',
          hasSubTabs: true,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="workspace-breadcrumbs" id="header-breadcrumbs">
              {meta.breadcrumb}
            </span>
            <button
              id="btn-switch-workspace-header"
              onClick={() => navigateToView('landing')}
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#0284c7',
                background: 'rgba(2, 132, 199, 0.08)',
                border: '1px solid rgba(2, 132, 199, 0.2)',
                borderRadius: '4px',
                padding: '1px 6px',
                cursor: 'pointer',
              }}
              title="Volver al Portal Principal para cambiar de espacio de trabajo"
            >
              ⇄ Cambiar Espacio
            </button>
          </div>
          <h1 className="workspace-title" id="header-title">
            {meta.title}
          </h1>
        </div>
      </div>

      {/* SUB TABS CONTEXTUALES */}
      {meta.hasSubTabs && (
        <div className="sub-tabs-container" id="sub-tabs-bar" style={{ display: 'flex' }}>
          {activeModule === 'pn' && (
            <>
              <button
                className={`sub-tab-btn ${activeSubTab === 'hub' || activeSubTab === 'overview' ? 'active' : ''}`}
                id="sub-tab-btn-pn-hub"
                onClick={() => navigateTo('pn', 'hub')}
                style={{ fontWeight: 700 }}
              >
                <span>🏠</span> Inicio &amp; Guía
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'test_obligados' ? 'active' : ''}`}
                id="sub-tab-btn-pn-obligados"
                onClick={() => navigateTo('pn', 'test_obligados')}
              >
                <span>🚦</span> ¿Debo Declarar?
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'calc' ? 'active' : ''}`}
                id="sub-tab-btn-pn-calc"
                onClick={() => navigateTo('pn', 'calc')}
              >
                <span>✏️</span> Cédula General
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'optimizer' ? 'active' : ''}`}
                id="sub-tab-btn-pn-optimizer"
                onClick={() => navigateTo('pn', 'optimizer')}
              >
                <span>💡</span> Optimizador What-If
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'marginal' ? 'active' : ''}`}
                id="sub-tab-btn-pn-marginal"
                onClick={() => navigateTo('pn', 'marginal')}
              >
                <span>🌡️</span> Tarifa Marginal
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'comparacion_patrimonial' ? 'active' : ''}`}
                id="sub-tab-btn-pn-comparacion"
                onClick={() => navigateTo('pn', 'comparacion_patrimonial')}
              >
                <span>⚖️</span> Comparación Patrimonial
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'inflacionario' ? 'active' : ''}`}
                id="sub-tab-btn-pn-inflacionario"
                onClick={() => navigateTo('pn', 'inflacionario')}
              >
                <span>📊</span> Comp. Inflacionario
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'conciliacion' ? 'active' : ''}`}
                id="sub-tab-btn-pn-conciliacion"
                onClick={() => navigateTo('pn', 'conciliacion')}
              >
                <span>📑</span> Conciliación CSV
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'f210' ? 'active' : ''}`}
                id="sub-tab-btn-pn-f210"
                onClick={() => navigateTo('pn', 'f210')}
              >
                <span>📋</span> Formulario 210
              </button>
            </>
          )}

          {activeModule === 'pj' && (
            <>
              <button
                className={`sub-tab-btn ${activeSubTab === 'hub' || activeSubTab === 'overview' ? 'active' : ''}`}
                id="sub-tab-btn-pj-hub"
                onClick={() => navigateTo('pj', 'hub')}
                style={{ fontWeight: 700 }}
              >
                <span>🏠</span> Inicio &amp; Guía
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'calc' ? 'active' : ''}`}
                id="sub-tab-btn-pj-calc"
                onClick={() => navigateTo('pj', 'calc')}
              >
                <span>✏️</span> Captura &amp; Depuración F-110
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'f110' ? 'active' : ''}`}
                id="sub-tab-btn-pj-f110"
                onClick={() => navigateTo('pj', 'f110')}
              >
                <span>📋</span> Formulario 110 DIAN
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'ttd' ? 'active' : ''}`}
                id="sub-tab-btn-pj-ttd"
                onClick={() => navigateTo('pj', 'ttd')}
              >
                <span>⚖️</span> Laboratorio TTD 15%
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'sobretasas' ? 'active' : ''}`}
                id="sub-tab-btn-pj-sobretasas"
                onClick={() => navigateTo('pj', 'sobretasas')}
              >
                <span>⚡</span> Sobretasas
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'conciliacion' ? 'active' : ''}`}
                id="sub-tab-btn-pj-conciliacion"
                onClick={() => navigateTo('pj', 'conciliacion')}
              >
                <span>📑</span> Conciliación Fiscal
              </button>
            </>
          )}

          {activeModule === 'simple' && (
            <>
              <button
                className={`sub-tab-btn ${activeSubTab === 'hub' || activeSubTab === 'overview' ? 'active' : ''}`}
                id="sub-tab-btn-simple-hub"
                onClick={() => navigateTo('simple', 'hub')}
                style={{ fontWeight: 700 }}
              >
                <span>🏠</span> Inicio &amp; Guía
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'calc' ? 'active' : ''}`}
                id="sub-tab-btn-simple-calc"
                onClick={() => navigateTo('simple', 'calc')}
              >
                <span>⚡</span> Calculadora F-260
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'f260' ? 'active' : ''}`}
                id="sub-tab-btn-simple-f260"
                onClick={() => navigateTo('simple', 'f260')}
              >
                <span>📋</span> Formulario 260 DIAN
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'comparador' ? 'active' : ''}`}
                id="sub-tab-btn-simple-comparador"
                onClick={() => navigateTo('simple', 'comparador')}
              >
                <span>⚖️</span> Comparador Ordinario vs SIMPLE
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'f2593' ? 'active' : ''}`}
                id="sub-tab-btn-simple-f2593"
                onClick={() => navigateTo('simple', 'f2593')}
              >
                <span>📅</span> Anticipos F-2593
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'requisitos' ? 'active' : ''}`}
                id="sub-tab-btn-simple-requisitos"
                onClick={() => navigateTo('simple', 'requisitos')}
              >
                <span>✅</span> Checklist Requisitos
              </button>
            </>
          )}

          {activeModule === 'retefuente' && (
            <>
              <button
                className={`sub-tab-btn ${activeSubTab === 'hub' || activeSubTab === 'overview' ? 'active' : ''}`}
                id="sub-tab-btn-retefuente-hub"
                onClick={() => navigateTo('retefuente', 'hub')}
                style={{ fontWeight: 700 }}
              >
                <span>🏠</span> Inicio &amp; Guía
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'calc' ? 'active' : ''}`}
                id="sub-tab-btn-retefuente-calc"
                onClick={() => navigateTo('retefuente', 'calc')}
              >
                <span>⚡</span> Depurador F-350
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'f350' ? 'active' : ''}`}
                id="sub-tab-btn-retefuente-f350"
                onClick={() => navigateTo('retefuente', 'f350')}
              >
                <span>📋</span> Formulario 350 DIAN
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'laboral' ? 'active' : ''}`}
                id="sub-tab-btn-retefuente-laboral"
                onClick={() => navigateTo('retefuente', 'laboral')}
              >
                <span>👤</span> Nómina Art. 383
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'tabla' ? 'active' : ''}`}
                id="sub-tab-btn-retefuente-tabla"
                onClick={() => navigateTo('retefuente', 'tabla')}
              >
                <span>📊</span> Tabla de Retenciones
              </button>
            </>
          )}

          {activeModule === 'iva' && (
            <>
              <button
                className={`sub-tab-btn ${activeSubTab === 'hub' || activeSubTab === 'overview' ? 'active' : ''}`}
                id="sub-tab-btn-iva-hub"
                onClick={() => navigateTo('iva', 'hub')}
                style={{ fontWeight: 700 }}
              >
                <span>🏠</span> Inicio &amp; Guía
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'calc' ? 'active' : ''}`}
                id="sub-tab-btn-iva-calc"
                onClick={() => navigateTo('iva', 'calc')}
              >
                <span>⚡</span> Liquidación F-300
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'f300' ? 'active' : ''}`}
                id="sub-tab-btn-iva-f300"
                onClick={() => navigateTo('iva', 'f300')}
              >
                <span>📋</span> Formulario 300 DIAN
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'prorrateo' ? 'active' : ''}`}
                id="sub-tab-btn-iva-prorrateo"
                onClick={() => navigateTo('iva', 'prorrateo')}
              >
                <span>⚖️</span> Prorrateo Art. 490
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'clasificador' ? 'active' : ''}`}
                id="sub-tab-btn-iva-clasificador"
                onClick={() => navigateTo('iva', 'clasificador')}
              >
                <span>🔍</span> Catálogo de Bienes &amp; Servicios
              </button>
            </>
          )}

          {activeModule === 'presentacion' && (
            <>
              <button
                className={`sub-tab-btn ${activeSubTab === 'hub' || activeSubTab === 'overview' ? 'active' : ''}`}
                id="sub-tab-btn-presentacion-hub"
                onClick={() => navigateTo('presentacion', 'hub')}
                style={{ fontWeight: 700 }}
              >
                <span>🏠</span> Inicio &amp; Guía
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'main' || !activeSubTab ? 'active' : ''}`}
                id="sub-tab-btn-presentacion-main"
                onClick={() => navigateTo('presentacion', 'main')}
              >
                <span>⚖️</span> Sanciones &amp; Auditoría
              </button>
            </>
          )}

          {activeModule === 'glosario' && (
            <>
              <button
                className={`sub-tab-btn ${activeSubTab === 'glosario' || activeSubTab === 'main' || !activeSubTab ? 'active' : ''}`}
                id="sub-tab-btn-glosario-main"
                onClick={() => navigateTo('glosario', 'glosario')}
                style={{ fontWeight: 700 }}
              >
                <span>📖</span> Glosario A-Z
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'errores' ? 'active' : ''}`}
                id="sub-tab-btn-glosario-errores"
                onClick={() => navigateTo('glosario', 'errores')}
              >
                <span>⚠️</span> 10 Errores
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'aprende' ? 'active' : ''}`}
                id="sub-tab-btn-glosario-aprende"
                onClick={() => navigateTo('glosario', 'aprende')}
              >
                <span>🎓</span> Aprende
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'calculadora_topes' ? 'active' : ''}`}
                id="sub-tab-btn-glosario-topes"
                onClick={() => navigateTo('glosario', 'calculadora_topes')}
              >
                <span>🚦</span> Topes
              </button>
              <button
                className={`sub-tab-btn ${activeSubTab === 'faq' ? 'active' : ''}`}
                id="sub-tab-btn-glosario-faq"
                onClick={() => navigateTo('glosario', 'faq')}
              >
                <span>❓</span> FAQ
              </button>
            </>
          )}
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
      </div>
    </header>
  );
};
