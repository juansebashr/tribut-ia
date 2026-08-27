import React from 'react';
import { useApp } from '../../context/AppContext';
import { FiscolLogoIcon } from '../common/FiscolLogo';
import { Sun, Moon, ArrowRight, Bot, Sparkles, BookOpen } from 'lucide-react';

export const LandingNavbar: React.FC = () => {
  const { theme, toggleTheme, navigateToView } = useApp();

  return (
    <header className="landing-navbar">
      <div className="landing-navbar-container">
        <div className="landing-brand" onClick={() => navigateToView('landing')} style={{ cursor: 'pointer' }}>
          <div className="landing-brand-badge">
            <FiscolLogoIcon size={32} />
          </div>
          <div className="landing-brand-info">
            <span className="landing-brand-name">Fiscol</span>
            <span className="landing-brand-tag">Suite Fiscal & AI Skills</span>
          </div>
        </div>

        <nav className="landing-nav-links">
          <button
            className="landing-nav-link"
            onClick={() => navigateToView('app', 'pn')}
          >
            <Sparkles size={16} />
            <span>Suite Tributaria</span>
          </button>

          <button
            className="landing-nav-link"
            onClick={() => navigateToView('skill-tutorial')}
          >
            <Bot size={16} />
            <span>Tutorial de Skill IA</span>
          </button>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-nav-link"
          >
            <BookOpen size={16} />
            <span>API Docs</span>
          </a>
        </nav>

        <div className="landing-nav-actions">
          <button
            className="btn btn-icon theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            aria-label="Cambiar tema"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            className="btn btn-primary landing-nav-cta"
            onClick={() => navigateToView('app', 'pn')}
            id="btn-navbar-start"
          >
            <span>Empezar</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
