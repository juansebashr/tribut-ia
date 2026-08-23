import React from 'react';
import { ShieldCheck, CheckCircle2, Terminal, Cpu, TrendingDown, Scale } from 'lucide-react';

export const LandingHeroPreview: React.FC = () => {
  return (
    <div className="hero-preview-container">
      <div className="hero-preview-glow" />
      <div className="hero-preview-card">
        {/* TOP BAR / WINDOW HEADER */}
        <div className="hero-preview-header">
          <div className="hero-preview-dots">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <div className="hero-preview-title">
            <ShieldCheck size={15} className="hero-preview-icon" />
            <span>TributIA Core Engine — Liquidación Auditada en Vivo (2025/2026)</span>
          </div>
          <div className="hero-preview-badge">
            <span className="live-indicator" />
            DIAN 100% Determinista
          </div>
        </div>

        <div className="hero-preview-grid">
          {/* LEFT: FISCAL BREAKDOWN */}
          <div className="hero-preview-left">
            <div className="preview-kpi-row">
              <div className="preview-kpi">
                <span className="preview-kpi-label">Ingresos Brutos Cédula General</span>
                <span className="preview-kpi-value text-primary">$ 120.000.000</span>
                <span className="preview-kpi-sub">F-210 Casilla 32</span>
              </div>
              <div className="preview-kpi">
                <span className="preview-kpi-label">Rentas Exentas y Deducciones (40%)</span>
                <span className="preview-kpi-value text-emerald">-$ 45.600.000</span>
                <span className="preview-kpi-sub">Art. 336 E.T. (Tope 1.340 UVT)</span>
              </div>
            </div>

            {/* MARGINAL THERMOMETER */}
            <div className="preview-thermometer-box">
              <div className="preview-thermometer-header">
                <div className="flex items-center gap-1">
                  <Scale size={14} color="#0284c7" />
                  <span className="font-semibold text-xs">Tabla Marginal Progresiva (Art. 241 E.T.)</span>
                </div>
                <span className="preview-tax-rate-badge">Tarifa Efectiva: 4.35%</span>
              </div>
              <div className="preview-bracket-bar">
                <div className="bracket-slice slice-0" style={{ width: '35%' }} title="0 - 1.090 UVT: 0%">
                  <span>0%</span>
                </div>
                <div className="bracket-slice slice-19" style={{ width: '40%' }} title="1.090 - 1.700 UVT: 19%">
                  <span>19%</span>
                </div>
                <div className="bracket-slice slice-28" style={{ width: '25%' }} title="1.700 - 4.100 UVT: 28%">
                  <span>28%</span>
                </div>
              </div>
              <div className="preview-thermometer-labels">
                <span>0 UVT ($0)</span>
                <span>1.090 UVT ($54.2M)</span>
                <span>1.700 UVT ($84.6M)</span>
              </div>
            </div>

            <div className="preview-total-row">
              <div>
                <span className="text-xs text-muted block">Impuesto Neto de Renta Calculado:</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">$ 5.230.000 COP</span>
              </div>
              <div className="preview-saving-pill">
                <TrendingDown size={14} />
                <span>Ahorro fiscal optimizado</span>
              </div>
            </div>
          </div>

          {/* RIGHT: AI AGENT TERMINAL INTEGRATION */}
          <div className="hero-preview-right">
            <div className="preview-terminal">
              <div className="terminal-header">
                <div className="flex items-center gap-2">
                  <Terminal size={14} color="#38bdf8" />
                  <span className="terminal-title">Asistente IA (Claude / AGY / Codex)</span>
                </div>
                <span className="terminal-tag">
                  <Cpu size={12} />
                  Skill Activa
                </span>
              </div>
              <div className="terminal-body">
                <div className="terminal-line prompt">
                  <span className="terminal-prompt">$</span>
                  <span className="terminal-cmd">tributia conciliar --docs ./renta2025</span>
                </div>
                <div className="terminal-line info">
                  <CheckCircle2 size={13} className="text-emerald shrink-0" />
                  <span>5 Extractos Bancarios y Formulario 220 leídos</span>
                </div>
                <div className="terminal-line info">
                  <CheckCircle2 size={13} className="text-emerald shrink-0" />
                  <span>Cruce contra Información Exógena DIAN: <strong>100% Match</strong></span>
                </div>
                <div className="terminal-line highlight">
                  <span className="terminal-indicator">✔</span>
                  <span>Deducción 1% Facturación Electrónica aplicada</span>
                </div>
                <div className="terminal-line success">
                  <span className="terminal-pulse">●</span>
                  <span>Formulario 210 y Trazabilidad listos para declarar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
