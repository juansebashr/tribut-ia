import React from 'react';
import { useApp } from '../../context/AppContext';
import { LandingNavbar } from './LandingNavbar';
import { LandingHeroPreview } from './LandingHeroPreview';
import {
  ArrowRight,
  Bot,
  Sparkles,
  FileSpreadsheet,
  Building2,
  UserCheck,
  Calendar,
  ShieldAlert,
  Percent,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigateToView } = useApp();

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

      {/* SUITE MODULES GRID */}
      <section className="landing-modules-section">
        <div className="landing-container">
          <div className="landing-section-header text-center">
            <h2 className="landing-section-title">Módulos Especializados de la Suite</h2>
            <p className="landing-section-subtitle">
              Accede directamente al liquidador o simulador que necesitas con un solo clic:
            </p>
          </div>

          <div className="landing-modules-grid">
            {/* PN MODULE */}
            <div
              className="module-card"
              onClick={() => navigateToView('app', 'pn', 'calc')}
            >
              <div className="module-card-icon bg-blue">
                <UserCheck size={22} color="#2563eb" />
              </div>
              <h3 className="module-card-title">Persona Natural (F-210)</h3>
              <p className="module-card-desc">
                Depuración de rentas de trabajo, capital, no laborales, dependientes económicos (72 UVT) y deducción del 1% en compras electrónicas.
              </p>
              <div className="module-card-footer">
                <span>Abrir liquidador</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* PJ MODULE */}
            <div
              className="module-card"
              onClick={() => navigateToView('app', 'pj')}
            >
              <div className="module-card-icon bg-emerald">
                <Building2 size={22} color="#059669" />
              </div>
              <h3 className="module-card-title">Persona Jurídica (F-110)</h3>
              <p className="module-card-desc">
                Renta ordinaria al 35%, sobretasa financiera/energética y control de la Tasa de Tributación Depurada (TTD mínima 15%).
              </p>
              <div className="module-card-footer">
                <span>Abrir Formulario 110</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* ART 73 MODULE */}
            <div
              className="module-card"
              onClick={() => navigateToView('app', 'art73')}
            >
              <div className="module-card-icon bg-purple">
                <Percent size={22} color="#7c3aed" />
              </div>
              <h3 className="module-card-title">Reajuste Fiscal (Art. 73 E.T.)</h3>
              <p className="module-card-desc">
                Simulador del costo fiscal ajustado para venta de inmuebles y acciones con la serie histórica oficial DANE de 70 años.
              </p>
              <div className="module-card-footer">
                <span>Calcular costo fiscal</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* EXOGENA CONCILIATION */}
            <div
              className="module-card"
              onClick={() => navigateToView('app', 'pn', 'conciliacion')}
            >
              <div className="module-card-icon bg-amber">
                <FileSpreadsheet size={22} color="#d97706" />
              </div>
              <h3 className="module-card-title">Conciliación Exógena CSV</h3>
              <p className="module-card-desc">
                Hoja de cálculo interactiva para cruzar soportes bancarios con la exógena DIAN, detectando discrepancias y partidas no soportadas.
              </p>
              <div className="module-card-footer">
                <span>Ver hoja de conciliación</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* SANCIONES & AUDITORIA */}
            <div
              className="module-card"
              onClick={() => navigateToView('app', 'presentacion')}
            >
              <div className="module-card-icon bg-rose">
                <ShieldAlert size={22} color="#e11d48" />
              </div>
              <h3 className="module-card-title">Beneficio de Auditoría & Sanciones</h3>
              <p className="module-card-desc">
                Firmeza especial en 6 y 12 meses (Art. 689-3 E.T.) y calculadora de extemporaneidad con reducciones del Art. 640.
              </p>
              <div className="module-card-footer">
                <span>Evaluar firmeza y sanciones</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* CALENDARIO */}
            <div
              className="module-card"
              onClick={() => navigateToView('app', 'calendario')}
            >
              <div className="module-card-icon bg-sky">
                <Calendar size={22} color="#0284c7" />
              </div>
              <h3 className="module-card-title">Calendario & Consulta NIT</h3>
              <p className="module-card-desc">
                Consulta instantánea de vencimientos DIAN por los 2 últimos dígitos del NIT con cálculo del Dígito de Verificación (DV).
              </p>
              <div className="module-card-footer">
                <span>Consultar vencimientos</span>
                <ArrowRight size={14} />
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
                  <span>TributIA</span>
                </div>
                <span className="landing-brand-name">TributIA</span>
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
            <span>© 2025-2026 TributIA · Colombia. Liquidación fiscal determinista y auditable.</span>
            <div className="flex items-center gap-4">
              <span className="footer-norma-tag">Estatuto Tributario Nacional</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
