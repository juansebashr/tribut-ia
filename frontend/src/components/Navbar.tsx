import React from 'react';
import { Calculator, Building2, TrendingUp, Sliders, FileText } from 'lucide-react';
import { FiscolLogoIcon } from './common/FiscolLogo';

interface NavbarProps {
  activeTab: 'pn' | 'pj' | 'beneficios' | 'rules' | 'docs';
  setActiveTab: (tab: 'pn' | 'pj' | 'beneficios' | 'rules' | 'docs') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="logo-group">
          <div className="logo-badge" style={{ padding: 0, background: 'transparent' }}>
            <FiscolLogoIcon size={32} />
          </div>
          <div>
            <h1 className="logo-title">Fiscol Colombia</h1>
            <p className="logo-subtitle">Motor Tributario & Liquidación de Renta 2026</p>
          </div>
        </div>

        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'pn' ? 'active' : ''}`}
            onClick={() => setActiveTab('pn')}
          >
            <Calculator size={17} />
            Persona Natural
          </button>
          <button
            className={`nav-tab ${activeTab === 'pj' ? 'active' : ''}`}
            onClick={() => setActiveTab('pj')}
          >
            <Building2 size={17} />
            Persona Jurídica (F110)
          </button>
          <button
            className={`nav-tab ${activeTab === 'beneficios' ? 'active' : ''}`}
            onClick={() => setActiveTab('beneficios')}
          >
            <TrendingUp size={17} />
            Beneficios & Auditoría
          </button>
          <button
            className={`nav-tab ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            <Sliders size={17} />
            Reglas & UVT
          </button>
          <button
            className={`nav-tab ${activeTab === 'docs' ? 'active' : ''}`}
            onClick={() => setActiveTab('docs')}
          >
            <FileText size={17} />
            API & Agentes AI
          </button>
        </nav>
      </div>
    </header>
  );
};
