import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LandingNavbar } from '../landing/LandingNavbar';
import { ClaudeTutorialTab } from './ClaudeTutorialTab';
import { AntigravityTutorialTab } from './AntigravityTutorialTab';
import { ChatGptTutorialTab } from './ChatGptTutorialTab';
import { downloadSkillPack, downloadFile, CSV_TEMPLATE_CONTENT } from '../../utils/skillBundleDownloader';
import {
  Download,
  Bot,
  ArrowLeft,
  Sparkles,
  Copy,
  FileCode2,
  FileSpreadsheet,
  ExternalLink,
  Zap,
  CheckCircle2
} from 'lucide-react';

export const SkillTutorialPage: React.FC = () => {
  const { navigateToView, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'claude' | 'antigravity' | 'chatgpt'>('claude');
  const [copiedPromptId, setCopiedPromptId] = useState<number | null>(null);

  const handleDownloadPack = () => {
    downloadSkillPack();
    showToast('Descargando paquete completo de la Skill (SKILL.md, plantilla CSV, config)...', 'success', 3500);
  };

  const copyPrompt = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    showToast('Prompt copiado al portapapeles con éxito', 'info', 2500);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const samplePrompts = [
    {
      id: 1,
      title: 'Caso 1: Liquidar Renta F-210 desde Soportes',
      badge: 'F-210 Cédula General',
      badgeColor: 'sky',
      prompt: `Actúa como Contador Tributario de TributIA. He adjuntado mi Formulario 220 de ingresos y retenciones laborales y mis extractos bancarios de 2025.
Por favor:
1. Extrae los ingresos brutos, aportes a salud/pensión, pagos de medicina prepagada y retenciones practicadas.
2. Aplica el límite conjunto de Rentas Exentas y Deducciones del 40% (Tope 1.340 UVT) y la renta exenta laboral del 25% (Tope 790 UVT).
3. Calcula el impuesto sobre la renta usando la tabla progresiva del Art. 241 E.T. y entrega el desglose paso a paso en pesos colombianos ($ COP).`
    },
    {
      id: 2,
      title: 'Caso 2: Conciliación contra Exógena DIAN',
      badge: 'Cruce Exógena CSV',
      badgeColor: 'amber',
      prompt: `Analiza el archivo "transacciones_depuradas.csv" con mis movimientos contables y crúzalo contra el archivo "DIAN - Informacion exogena 2025.xlsx".
Identifica:
- Partidas con coincidencia exacta (MATCH_EXACTO).
- Diferencias de valor reportadas por terceros (DIFERENCIA_VALOR).
- Omisiones o partidas que solo aparecen en la exógena DIAN (SOLO_EN_EXOGENA).
Genera un informe didáctico de auditoría indicando qué partidas tienen riesgo de requerimiento por la DIAN.`
    },
    {
      id: 3,
      title: 'Caso 3: Venta de Casa y Ahorro AFC',
      badge: 'Art. 311-1 Ganancia Ocasional',
      badgeColor: 'emerald',
      prompt: `Vendí mi casa de habitación en 2025 por $650.000.000 COP, adquirida en 2018 por $320.000.000 COP.
Quiero depositar $200.000.000 COP en una cuenta de Ahorro para el Fomento de la Construcción (AFC) para adquirir una nueva vivienda.
Calcula la Ganancia Ocasional bruta, la exención de hasta 5.000 UVT según el Artículo 311-1 del Estatuto Tributario y el impuesto neto a pagar.`
    }
  ];

  return (
    <div className="skill-tutorial-wrapper">
      {/* NAVBAR */}
      <LandingNavbar />

      {/* HERO / TOP BANNER */}
      <section className="tutorial-hero-banner">
        <div className="landing-container">
          {/* NAVIGATION BAR ACTIONS */}
          <div className="tutorial-top-nav">
            <button
              className="btn btn-outline btn-sm tutorial-nav-back-btn"
              onClick={() => navigateToView('landing')}
              id="btn-back-landing"
            >
              <ArrowLeft size={15} />
              <span>Volver a la Página Principal</span>
            </button>

            <button
              className="btn btn-primary btn-sm tutorial-nav-app-btn"
              onClick={() => navigateToView('app', 'pn')}
              id="btn-open-suite-top"
            >
              <Sparkles size={15} />
              <span>Abrir Suite Tributaria</span>
            </button>
          </div>

          {/* MAIN HEADER TITLE */}
          <div className="tutorial-header-hero-content">
            <div className="tutorial-hero-badge">
              <Bot size={15} className="text-purple" />
              <span>Centro Oficial de Asistentes & AI Skills</span>
            </div>
            <h1 className="tutorial-main-title">
              Instala la Skill de TributIA en tu <span className="gradient-text">IA Favorita</span>
            </h1>
            <p className="tutorial-main-subtitle">
              Configura tu modelo inteligente para automatizar la extracción de extractos bancarios, cruzar información exógena DIAN y liquidar impuestos con 100% de determinismo.
            </p>
          </div>

          {/* DOWNLOAD HUB CARD */}
          <div className="skill-download-hub-card">
            <div className="download-hub-left">
              <div className="download-hub-icon-wrapper">
                <FileCode2 size={28} className="text-primary" />
              </div>
              <div className="download-hub-text">
                <div className="flex items-center gap-2">
                  <h3 className="download-hub-title">Paquete de Integración Oficial TributIA</h3>
                  <span className="hub-version-tag">v2.4 Ready</span>
                </div>
                <p className="download-hub-desc">
                  Contiene directivas <code className="font-mono">SKILL.md</code>, plantilla estructurada <code className="font-mono">transacciones_template.csv</code> y archivo de conexión <code className="font-mono">claude_desktop_config.json</code>.
                </p>
              </div>
            </div>

            <div className="download-hub-actions">
              <button
                className="btn btn-outline btn-sm download-sub-btn"
                onClick={() => downloadFile('transacciones_template.csv', CSV_TEMPLATE_CONTENT, 'text/csv')}
                title="Descargar solo la plantilla CSV de transacciones"
              >
                <FileSpreadsheet size={15} className="text-emerald" />
                <span>Plantilla CSV</span>
              </button>

              <button
                className="btn btn-hero-primary download-main-btn"
                onClick={handleDownloadPack}
                id="btn-download-skill-pack"
              >
                <Download size={16} />
                <span>Descargar Paquete (.zip / files)</span>
              </button>
            </div>
          </div>

          {/* PLATFORM TABS (CLAUDE, ANTIGRAVITY, CHATGPT) */}
          <div className="platform-tabs-container">
            <div className="platform-tabs-segmented">
              <button
                className={`platform-tab-btn tab-claude ${activeTab === 'claude' ? 'active' : ''}`}
                onClick={() => setActiveTab('claude')}
                id="tab-btn-claude"
              >
                <span className="platform-tab-icon">🟣</span>
                <div className="platform-tab-info">
                  <span className="platform-name">Anthropic Claude</span>
                  <span className="platform-sub">Desktop App & Claude Code CLI</span>
                </div>
              </button>

              <button
                className={`platform-tab-btn tab-antigravity ${activeTab === 'antigravity' ? 'active' : ''}`}
                onClick={() => setActiveTab('antigravity')}
                id="tab-btn-antigravity"
              >
                <span className="platform-tab-icon">🔵</span>
                <div className="platform-tab-info">
                  <span className="platform-name">Google Antigravity</span>
                  <span className="platform-sub">AGY CLI, Gemini & Subagentes</span>
                </div>
              </button>

              <button
                className={`platform-tab-btn tab-chatgpt ${activeTab === 'chatgpt' ? 'active' : ''}`}
                onClick={() => setActiveTab('chatgpt')}
                id="tab-btn-chatgpt"
              >
                <span className="platform-tab-icon">🟢</span>
                <div className="platform-tab-info">
                  <span className="platform-name">OpenAI ChatGPT</span>
                  <span className="platform-sub">Custom GPT, Desktop & Codex</span>
                </div>
              </button>
            </div>
          </div>

          {/* ACTIVE TAB CONTENT */}
          <div className="tutorial-body-area">
            {activeTab === 'claude' && <ClaudeTutorialTab />}
            {activeTab === 'antigravity' && <AntigravityTutorialTab />}
            {activeTab === 'chatgpt' && <ChatGptTutorialTab />}
          </div>

          {/* PROMPTS BANK SECTION */}
          <div className="prompts-bank-section">
            <div className="prompts-bank-header">
              <div className="prompts-bank-title-row">
                <div className="prompts-bank-icon">
                  <Zap size={20} className="text-amber" />
                </div>
                <div>
                  <h2 className="prompts-bank-title">Banco de Prompts y Casos de Prueba</h2>
                  <p className="prompts-bank-subtitle">
                    Copia estos prompts de ejemplo y pruébalos directamente con tu asistente de IA configurado:
                  </p>
                </div>
              </div>
            </div>

            <div className="prompt-cards-grid">
              {samplePrompts.map((item) => (
                <div key={item.id} className="prompt-card-modern">
                  <div className="prompt-card-top">
                    <span className={`prompt-category-badge badge-${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    <h3 className="prompt-card-title">{item.title}</h3>
                  </div>

                  <div className="prompt-content-box">
                    <pre className="prompt-text-preview">{item.prompt}</pre>
                  </div>

                  <button
                    className="btn btn-outline btn-sm prompt-copy-action-btn"
                    onClick={() => copyPrompt(item.prompt, item.id)}
                  >
                    {copiedPromptId === item.id ? (
                      <>
                        <CheckCircle2 size={15} className="text-emerald" />
                        <span className="text-emerald font-bold">¡Prompt Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={15} />
                        <span>Copiar Prompt Completo</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer mt-auto">
        <div className="landing-container">
          <div className="tutorial-footer-bottom">
            <span>TributIA AI Skills Portal · Compatible con Claude Desktop/Code, Google Antigravity y ChatGPT</span>
            <div className="flex items-center gap-4">
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="footer-doc-link"
              >
                <span>Documentación OpenAPI / Swagger</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
