import React from 'react';
import { useApp } from '../../context/AppContext';
import { LandingNavbar } from './LandingNavbar';
import { LandingHeroPreview } from './LandingHeroPreview';
import {
  ArrowRight,
  Bot,
  Sparkles,
  Building2,
  UserCheck,
  ShieldAlert,
  Percent,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigateToView, navigateToWorkspace } = useApp();

  return (
    <div className="landing-wrapper">
      {/* NAVBAR */}
      <LandingNavbar />

      {/* HERO SECTION */}
      <section className="landing-hero-section">
        <div className="landing-container">
          <div className="landing-hero-content">
            {/* COMPLIANCE BADGE */}
            <div className="landing-hero-badge">
              <span className="badge-pulse" />
              <Sparkles size={14} className="text-sky" />
              <span>Suite Tributaria DIAN 2025-2026 | 100% Determinista | UVT Dinámico</span>
            </div>

            {/* HEADLINE */}
            <h1 className="landing-hero-title">
              La Suite Tributaria Inteligente y <span className="gradient-text">Asistente de IA</span> para Colombia
            </h1>

            {/* SUBTITLE */}
            <p className="landing-hero-subtitle">
              Calcula, concilia y audita declaraciones de renta para Persona Natural (F-210) y Persona Jurídica (F-110) en segundos con exactitud matemática, o delega todo el análisis documental en tu IA favorita con nuestra Skill oficial.
            </p>

            {/* 2 CALL TO ACTIONS */}
            <div className="landing-hero-ctas">
              <button
                className="btn btn-hero-primary"
                id="btn-cta-start"
                onClick={() => navigateToView('app', 'pn')}
              >
                <span>Empecemos</span>
                <ArrowRight size={18} />
              </button>

              <button
                className="btn btn-hero-secondary"
                id="btn-cta-download-skill"
                onClick={() => navigateToView('skill-tutorial')}
              >
                <Bot size={18} className="text-sky" />
                <span>Descarga la Skill de IA</span>
              </button>
            </div>

            {/* QUICK FEATURES PILLS */}
            <div className="landing-hero-pills">
              <div className="hero-pill">
                <CheckCircle size={14} className="text-emerald" />
                <span>Sin alucinaciones (Cálculo auditable)</span>
              </div>
              <div className="hero-pill">
                <CheckCircle size={14} className="text-emerald" />
                <span>Privacidad Stateless en memoria</span>
              </div>
              <div className="hero-pill">
                <CheckCircle size={14} className="text-emerald" />
                <span>Claude · Antigravity · ChatGPT</span>
              </div>
            </div>
          </div>

          {/* GRAPHIC MOCKUP PREVIEW */}
          <LandingHeroPreview />
        </div>
      </section>

      {/* METRICS & SOCIAL PROOF */}
      <section className="landing-metrics-section">
        <div className="landing-container">
          <div className="landing-metrics-grid">
            <div className="metric-card">
              <span className="metric-number">4 Cédulas</span>
              <span className="metric-title">Formulario 210 Completo</span>
              <span className="metric-desc">Trabajo, Capital, No Laborales, Pensiones y Dividendos con topes del Art. 336 E.T.</span>
            </div>

            <div className="metric-card">
              <span className="metric-number">70 Años</span>
              <span className="metric-title">Tabla Histórica DANE</span>
              <span className="metric-desc">Reajuste fiscal oficial del Art. 73 E.T. (1955-2025) para bienes raíces y acciones.</span>
            </div>

            <div className="metric-card">
              <span className="metric-number">100% Match</span>
              <span className="metric-title">Conciliación de Exógena</span>
              <span className="metric-desc">Cruce automatizado de extractos bancarios y facturas vs reportes de terceros en la DIAN.</span>
            </div>

            <div className="metric-card">
              <span className="metric-number">3 IAs</span>
              <span className="metric-title">Integración Multi-Agente</span>
              <span className="metric-desc">Compatible con Claude Desktop/Code, Google Antigravity y ChatGPT/Codex.</span>
            </div>
          </div>
        </div>
      </section>

      {/* SUITE WORKSPACE PORTALS SELECTOR */}
      <section className="landing-modules-section" id="portales-tributarios">
        <div className="landing-container">
          <div className="landing-section-header text-center">
            <div style={{ display: 'inline-block', background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', border: '1px solid rgba(2, 132, 199, 0.25)', borderRadius: '20px', fontSize: '11px', fontWeight: 800, padding: '4px 14px', marginBottom: '12px' }}>
              🎯 SELECCIONA TU ESPACIO DE TRABAJO
            </div>
            <h2 className="landing-section-title">Elige tu Portal de Liquidación</h2>
            <p className="landing-section-subtitle" style={{ maxWidth: '680px', margin: '0 auto' }}>
              Ingresa a un entorno limpio y enfocado exclusivamente en las obligaciones y formularios que necesitas liquidar, sin sobrecarga ni distracciones:
            </p>
          </div>

          <div className="landing-modules-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* PORTAL 1: PERSONAS NATURALES */}
            <div
              className="module-card"
              style={{ borderTop: '4px solid #16a34a' }}
              onClick={() => navigateToWorkspace('naturales', 'pn', 'hub')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div className="module-card-icon bg-emerald" style={{ background: '#dcfce7' }}>
                  <UserCheck size={24} color="#16a34a" />
                </div>
                <span style={{ fontSize: '10.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: '#dcfce7', color: '#15803d' }}>
                  FORMULARIO 210
                </span>
              </div>
              <h3 className="module-card-title" style={{ fontSize: '17px', color: '#14532d' }}>
                1. Personas Naturales
              </h3>
              <p className="module-card-desc">
                Diagnóstico de obligatoriedad, depuración de Cédula General, optimizador What-If (AFC/FPV), comparación patrimonial, reajuste fiscal (Art. 73) y conciliación exógena CSV.
              </p>
              <div style={{ fontSize: '11px', color: '#64748b', margin: '10px 0 14px 0', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                🚦 Test 3 min • 💡 What-If Ahorro • ⚖️ Art. 236 • 📈 Art. 73
              </div>
              <div className="module-card-footer" style={{ color: '#16a34a', fontWeight: 800 }}>
                <span>Ingresar al Espacio Naturales</span>
                <ArrowRight size={16} />
              </div>
            </div>

            {/* PORTAL 2: PERSONAS JURÍDICAS */}
            <div
              className="module-card"
              style={{ borderTop: '4px solid #2563eb' }}
              onClick={() => navigateToWorkspace('juridicas', 'pj', 'hub')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div className="module-card-icon bg-blue" style={{ background: '#dbeafe' }}>
                  <Building2 size={24} color="#2563eb" />
                </div>
                <span style={{ fontSize: '10.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: '#dbeafe', color: '#1e40af' }}>
                  F-110 &amp; RST F-260
                </span>
              </div>
              <h3 className="module-card-title" style={{ fontSize: '17px', color: '#1e3a8a' }}>
                2. Personas Jurídicas &amp; RST
              </h3>
              <p className="module-card-desc">
                Renta societaria al 35%, laboratorio de Tasa Mínima TTD (15%), sobretasas financiera/energética, comparador Ordinario vs SIMPLE, anticipos bimestrales F-2593 y conciliación NIIF F-2516.
              </p>
              <div style={{ fontSize: '11px', color: '#64748b', margin: '10px 0 14px 0', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                🏢 Renta 35% • ⚖️ TTD 15% • ⚡ SIMPLE F-260 • 📑 F-2516
              </div>
              <div className="module-card-footer" style={{ color: '#2563eb', fontWeight: 800 }}>
                <span>Ingresar al Espacio Jurídicas</span>
                <ArrowRight size={16} />
              </div>
            </div>

            {/* PORTAL 3: IMPUESTOS PERIÓDICOS */}
            <div
              className="module-card"
              style={{ borderTop: '4px solid #f59e0b' }}
              onClick={() => navigateToWorkspace('periodicos', 'retefuente', 'hub')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div className="module-card-icon bg-amber" style={{ background: '#fef3c7' }}>
                  <Percent size={24} color="#d97706" />
                </div>
                <span style={{ fontSize: '10.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: '#fef3c7', color: '#b45309' }}>
                  IVA F-300 &amp; RETE F-350
                </span>
              </div>
              <h3 className="module-card-title" style={{ fontSize: '17px', color: '#78350f' }}>
                3. Impuestos Periódicos
              </h3>
              <p className="module-card-desc">
                Retención de nómina y salarios (Art. 383 E.T.), liquidación F-350, tabla maestra UVT, liquidación de IVA F-300, prorrateo de IVA común (Art. 490 E.T.) y clasificador de tarifas.
              </p>
              <div style={{ fontSize: '11px', color: '#64748b', margin: '10px 0 14px 0', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                👤 Nómina Art. 383 • 💰 Retefuente F-350 • 🛍️ IVA F-300 • ⚖️ Prorrateo
              </div>
              <div className="module-card-footer" style={{ color: '#d97706', fontWeight: 800 }}>
                <span>Ingresar a Impuestos Periódicos</span>
                <ArrowRight size={16} />
              </div>
            </div>

            {/* PORTAL 4: AUDITORÍA Y SANCIONES */}
            <div
              className="module-card"
              style={{ borderTop: '4px solid #dc2626' }}
              onClick={() => navigateToWorkspace('sanciones', 'presentacion', 'hub')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div className="module-card-icon bg-rose" style={{ background: '#fee2e2' }}>
                  <ShieldAlert size={24} color="#dc2626" />
                </div>
                <span style={{ fontSize: '10.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: '#fee2e2', color: '#991b1b' }}>
                  ARTS. 640/641 &amp; 689-3
                </span>
              </div>
              <h3 className="module-card-title" style={{ fontSize: '17px', color: '#7f1d1d' }}>
                4. Auditoría &amp; Sanciones
              </h3>
              <p className="module-card-desc">
                Calculadora de sanciones por extemporaneidad y corrección, reducción de sanciones del Art. 640 E.T., firmeza del Beneficio de Auditoría (6 y 12 meses) y catálogo de beneficios.
              </p>
              <div style={{ fontSize: '11px', color: '#64748b', margin: '10px 0 14px 0', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                ⚖️ Sanción Extemporaneidad • 📉 Art. 640 • ⏱️ Firmeza 6 Meses
              </div>
              <div className="module-card-footer" style={{ color: '#dc2626', fontWeight: 800 }}>
                <span>Ingresar a Auditoría &amp; Sanciones</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI SKILL PROMOTION BANNER */}
      <section className="landing-skill-banner-section">
        <div className="landing-container">
          <div className="landing-skill-banner">
            <div className="skill-banner-text">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-light text-sky text-xs font-semibold mb-3">
                <Bot size={14} />
                <span>Extensión para Asistentes de IA</span>
              </div>
              <h2 className="skill-banner-title">
                ¿Prefieres que tu Inteligencia Artificial haga el trabajo pesado?
              </h2>
              <p className="skill-banner-subtitle">
                Instala nuestra Skill oficial en Claude Desktop / Code, Google Antigravity o ChatGPT. Tu IA podrá leer tus extractos bancarios en PDF/Excel, conciliar con la exógena DIAN y generar la liquidación lista para presentar.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <button
                  className="btn btn-hero-primary"
                  onClick={() => navigateToView('skill-tutorial')}
                >
                  <Bot size={16} />
                  <span>Ver Tutorial de Instalación</span>
                </button>
              </div>
            </div>
            <div className="skill-banner-logos">
              <div className="ai-logo-badge">
                <span className="ai-logo-icon">🟣</span>
                <span className="ai-logo-name">Claude</span>
                <span className="ai-logo-sub">Desktop & CLI</span>
              </div>
              <div className="ai-logo-badge">
                <span className="ai-logo-icon">🔵</span>
                <span className="ai-logo-name">Antigravity</span>
                <span className="ai-logo-sub">AGY & Gemini</span>
              </div>
              <div className="ai-logo-badge">
                <span className="ai-logo-icon">🟢</span>
                <span className="ai-logo-name">ChatGPT</span>
                <span className="ai-logo-sub">Custom GPT & Codex</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-grid">
            <div className="footer-col-main">
              <div className="landing-brand">
                <div className="landing-brand-badge">
                  <span>Fiscol</span>
                </div>
                <span className="landing-brand-name">Fiscol</span>
              </div>
              <p className="footer-desc">
                Plataforma de liquidación de impuestos en Colombia, diseñada bajo estricto determinismo fiscal conforme al Estatuto Tributario y la Ley 2277 de 2022.
              </p>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">Módulos</h4>
              <ul className="footer-links">
                <li><button onClick={() => navigateToView('app', 'pn')}>Persona Natural (F-210)</button></li>
                <li><button onClick={() => navigateToView('app', 'pj')}>Persona Jurídica (F-110)</button></li>
                <li><button onClick={() => navigateToView('app', 'art73')}>Reajuste Fiscal Art. 73</button></li>
                <li><button onClick={() => navigateToView('app', 'calendario')}>Calendario Tributario</button></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">Desarrollo & IA</h4>
              <ul className="footer-links">
                <li><button onClick={() => navigateToView('skill-tutorial')}>Tutorial de Skill IA</button></li>
                <li><a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">Swagger OpenAPI <ExternalLink size={12} /></a></li>
                <li><a href="http://localhost:8000/redoc" target="_blank" rel="noreferrer">Redoc Reference <ExternalLink size={12} /></a></li>
              </ul>
            </div>
          </div>

          <div className="landing-footer-bottom">
            <span>© 2025-2026 Fiscol · Colombia. Liquidación fiscal determinista y auditable.</span>
            <div className="flex items-center gap-4">
              <span className="footer-norma-tag">Estatuto Tributario Nacional</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
