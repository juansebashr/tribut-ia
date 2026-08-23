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
  Check,
  FileCode2,
  FileSpreadsheet,
  ExternalLink
} from 'lucide-react';

export const SkillTutorialPage: React.FC = () => {
  const { navigateToView, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'claude' | 'antigravity' | 'chatgpt'>('claude');
  const [copiedPromptId, setCopiedPromptId] = useState<number | null>(null);

  const handleDownloadPack = () => {
    downloadSkillPack();
    showToast('Descargando paquete de archivos de la Skill (SKILL.md, plantilla CSV, configuración)...', 'success', 3000);
  };

  const copyPrompt = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    showToast('Prompt copiado al portapapeles', 'info', 2000);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const samplePrompts = [
    {
      id: 1,
      title: 'Caso 1: Liquidar Renta Persona Natural desde Certificado 220 y Extractos',
      badge: 'F-210 Cédula General',
      prompt: `Actúa como Contador Tributario de TributIA. He adjuntado mi Formulario 220 de ingresos y retenciones laborales y mis extractos bancarios de 2025.
Por favor:
1. Extrae los ingresos brutos, aportes a salud/pensión, pagos de medicina prepagada y retenciones practicadas.
2. Aplica el límite conjunto de Rentas Exentas y Deducciones del 40% (Tope 1.340 UVT) y la renta exenta laboral del 25% (Tope 790 UVT).
3. Calcula el impuesto sobre la renta usando la tabla progresiva del Art. 241 E.T. y entrega el desglose paso a paso en pesos colombianos ($ COP).`
    },
    {
      id: 2,
      title: 'Caso 2: Conciliación Automática contra Información Exógena DIAN',
      badge: 'Cruce Exógena CSV',
      prompt: `Analiza el archivo "transacciones_depuradas.csv" con mis movimientos contables y crúzalo contra el archivo "DIAN - Informacion exogena 2025.xlsx".
Identifica:
- Partidas con coincidencia exacta (MATCH_EXACTO).
- Diferencias de valor reportadas por terceros (DIFERENCIA_VALOR).
- Omisiones o partidas que solo aparecen en la exógena DIAN (SOLO_EN_EXOGENA).
Genera un informe didáctico de auditoría indicando qué partidas tienen riesgo de requerimiento por la DIAN.`
    },
    {
      id: 3,
      title: 'Caso 3: Simulación de Venta de Casa y Ahorro en Cuenta AFC (Art. 311-1)',
      badge: 'Ganancia Ocasional Exenta',
      prompt: `Vendí mi casa de habitación en 2025 por $650.000.000 COP, adquirida en 2018 por $320.000.000 COP.
Quiero depositar $200.000.000 COP en una cuenta de Ahorro para el Fomento de la Construcción (AFC) para adquirir una nueva vivienda.
Calcula la Ganancia Ocasional bruta, la exención de hasta 5.000 UVT según el Artículo 311-1 del Estatuto Tributario y el impuesto neto a pagar.`
    }
  ];

  return (
    <div className="skill-tutorial-wrapper">
      {/* NAVBAR */}
      <LandingNavbar />

      {/* HEADER SECTION */}
      <section className="skill-tutorial-header-section">
        <div className="landing-container">
          <div className="flex items-center justify-between mb-4">
            <button
              className="btn btn-outline btn-sm flex items-center gap-2"
              onClick={() => navigateToView('landing')}
            >
              <ArrowLeft size={14} />
              <span>Volver a la Página Principal</span>
            </button>

            <button
              className="btn btn-primary btn-sm flex items-center gap-2"
              onClick={() => navigateToView('app', 'pn')}
            >
              <Sparkles size={14} />
              <span>Ir a la Suite Tributaria</span>
            </button>
          </div>

          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-light text-purple text-xs font-semibold mb-3 border border-purple-border">
              <Bot size={14} />
              <span>TributIA AI Skills Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
              Descarga e Instala la Skill de TributIA en tu IA Favorita
            </h1>
            <p className="text-sm text-secondary">
              Aprende a integrar el asistente tributario en aplicaciones de escritorio (Desktop) o terminales (CLI) para automatizar la lectura de extractos bancarios y certificados DIAN.
            </p>
          </div>

          {/* QUICK DOWNLOAD CALLOUT */}
          <div className="bg-card border border-primary-border rounded-xl p-5 shadow-md flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center text-primary">
                <FileCode2 size={26} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Paquete Completo de la Skill de IA
                </h3>
                <p className="text-xs text-muted">
                  Incluye directivas <code className="font-mono">SKILL.md</code>, plantilla de transacciones <code className="font-mono">transacciones_template.csv</code> y configuración para Claude Desktop.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => downloadFile('transacciones_template.csv', CSV_TEMPLATE_CONTENT, 'text/csv')}
              >
                <FileSpreadsheet size={14} />
                <span>Plantilla CSV</span>
              </button>

              <button
                className="btn btn-primary btn-sm flex items-center gap-2"
                onClick={handleDownloadPack}
                id="btn-download-skill-pack"
              >
                <Download size={14} />
                <span>Descargar Paquete</span>
              </button>
            </div>
          </div>

          {/* PLATFORM TABS */}
          <div className="skill-tabs-nav">
            <button
              className={`skill-tab-button ${activeTab === 'claude' ? 'active' : ''}`}
              onClick={() => setActiveTab('claude')}
              id="tab-btn-claude"
            >
              <span>🟣</span>
              <span>Anthropic Claude (Desktop & Code)</span>
            </button>

            <button
              className={`skill-tab-button ${activeTab === 'antigravity' ? 'active' : ''}`}
              onClick={() => setActiveTab('antigravity')}
              id="tab-btn-antigravity"
            >
              <span>🔵</span>
              <span>Google Antigravity / AGY</span>
            </button>

            <button
              className={`skill-tab-button ${activeTab === 'chatgpt' ? 'active' : ''}`}
              onClick={() => setActiveTab('chatgpt')}
              id="tab-btn-chatgpt"
            >
              <span>🟢</span>
              <span>OpenAI ChatGPT & Codex</span>
            </button>
          </div>

          {/* TAB BODY */}
          <div className="mb-12">
            {activeTab === 'claude' && <ClaudeTutorialTab />}
            {activeTab === 'antigravity' && <AntigravityTutorialTab />}
            {activeTab === 'chatgpt' && <ChatGptTutorialTab />}
          </div>

          {/* PROMPT BANK SECTION */}
          <div className="mt-12 pt-8 border-t border-subtle">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={20} className="text-amber" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Banco de Prompts y Casos de Prueba Listos para Usar
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
              {samplePrompts.map((item) => (
                <div key={item.id} className="tutorial-card flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-sky bg-sky-light dark:bg-sky-950/40 px-2 py-0.5 rounded">
                        {item.badge}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                      {item.title}
                    </h4>
                    <p className="text-xs text-secondary bg-subtle p-3 rounded font-mono leading-relaxed mb-4">
                      {item.prompt.slice(0, 160)}...
                    </p>
                  </div>

                  <button
                    className="btn btn-outline btn-sm w-full flex items-center justify-center gap-2"
                    onClick={() => copyPrompt(item.prompt, item.id)}
                  >
                    {copiedPromptId === item.id ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                    <span>{copiedPromptId === item.id ? '¡Copiado!' : 'Copiar Prompt Completo'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer mt-auto">
        <div className="landing-container flex items-center justify-between text-xs text-muted">
          <span>TributIA AI Skills Portal · Soporte para Claude, Antigravity y ChatGPT</span>
          <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
            <span>Explorar API Swagger</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </footer>
    </div>
  );
};
