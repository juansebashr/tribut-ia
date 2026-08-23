import React, { useState } from 'react';
import { Copy, Check, Download, Monitor, Terminal, CheckCircle2 } from 'lucide-react';
import { CLAUDE_DESKTOP_CONFIG_JSON, SKILL_MD_CONTENT, downloadFile } from '../../utils/skillBundleDownloader';

export const ClaudeTutorialTab: React.FC = () => {
  const [subTab, setSubTab] = useState<'desktop' | 'cli'>('desktop');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const macConfigPath = '~/Library/Application Support/Claude/claude_desktop_config.json';
  const winConfigPath = '%APPDATA%\\Claude\\claude_desktop_config.json';

  const claudeCodeInstallCmd = `# 1. Crear el directorio de la skill en tu proyecto o repositorio
mkdir -p skills/declaracion-renta-persona-natural

# 2. Descargar el archivo de directivas SKILL.md
curl -o skills/declaracion-renta-persona-natural/SKILL.md https://raw.githubusercontent.com/juansebashr/tribut-ia/main/skills/declaracion-renta-persona-natural/SKILL.md

# 3. Invocar al agente en Claude Code
claude "Analiza los extractos bancarios en la carpeta /documentos y liquida la renta de persona natural con la skill de TributIA"`;

  return (
    <div className="tutorial-tab-content">
      {/* SUB-TABS SELECTOR */}
      <div className="flex items-center gap-3 mb-6">
        <button
          className={`btn ${subTab === 'desktop' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setSubTab('desktop')}
        >
          <Monitor size={16} />
          <span>Claude Desktop (App de Escritorio)</span>
        </button>

        <button
          className={`btn ${subTab === 'cli' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setSubTab('cli')}
        >
          <Terminal size={16} />
          <span>Claude Code (CLI en Terminal)</span>
        </button>
      </div>

      {subTab === 'desktop' ? (
        <div className="tutorial-steps-container">
          {/* STEP 1: DESKTOP CONFIG */}
          <div className="tutorial-card">
            <div className="tutorial-step-header">
              <div className="step-number-badge">1</div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Configurar el Servidor Local en Claude Desktop (`claude_desktop_config.json`)
                </h4>
                <p className="text-xs text-muted">
                  Permite a la app de Claude Desktop comunicarse con la API de cálculo y validación de TributIA.
                </p>
              </div>
            </div>

            <div className="bg-subtle p-3 rounded-lg border border-subtle mb-3 text-xs">
              <p className="font-semibold mb-1">Rutas del archivo de configuración según tu sistema operativo:</p>
              <ul className="list-disc list-inside text-secondary space-y-1">
                <li><strong>macOS:</strong> <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">{macConfigPath}</code></li>
                <li><strong>Windows:</strong> <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">{winConfigPath}</code></li>
              </ul>
            </div>

            <div className="code-block-wrapper">
              <pre>{CLAUDE_DESKTOP_CONFIG_JSON}</pre>
              <button
                className="btn-copy-floating"
                onClick={() => copyToClipboard(CLAUDE_DESKTOP_CONFIG_JSON, 'claude-json')}
              >
                {copiedKey === 'claude-json' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                <span>{copiedKey === 'claude-json' ? 'Copiado' : 'Copiar JSON'}</span>
              </button>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => downloadFile('claude_desktop_config.json', CLAUDE_DESKTOP_CONFIG_JSON, 'application/json')}
              >
                <Download size={14} />
                <span>Descargar claude_desktop_config.json</span>
              </button>
            </div>
          </div>

          {/* STEP 2: CLAUDE PROJECTS */}
          <div className="tutorial-card">
            <div className="tutorial-step-header">
              <div className="step-number-badge">2</div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Crear un "Proyecto" en Claude Desktop con las Directivas de la Skill
                </h4>
                <p className="text-xs text-muted">
                  Si utilizas Claude Pro / Team, puedes crear un proyecto dedicado para tus declaraciones de renta.
                </p>
              </div>
            </div>

            <ol className="list-decimal list-inside text-sm text-secondary space-y-2 mb-3">
              <li>Abre <strong>Claude Desktop</strong> y haz clic en <strong>Projects → Create Project</strong>.</li>
              <li>Nombra el proyecto: <em>"TributIA - Contador DIAN Experto"</em>.</li>
              <li>En <strong>Project Instructions (Instrucciones Personalizadas)</strong>, pega el contenido del archivo <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">SKILL.md</code>.</li>
              <li>En <strong>Project Knowledge</strong>, adjunta la plantilla <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">transacciones_template.csv</code>.</li>
            </ol>

            <div className="flex gap-2">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => copyToClipboard(SKILL_MD_CONTENT, 'claude-skill-md')}
              >
                {copiedKey === 'claude-skill-md' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                <span>{copiedKey === 'claude-skill-md' ? 'Copiado al portapapeles' : 'Copiar Instrucciones SKILL.md'}</span>
              </button>
            </div>
          </div>

          {/* STEP 3: RUN PROMPT */}
          <div className="tutorial-card">
            <div className="tutorial-step-header">
              <div className="step-number-badge">3</div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Subir Documentos y Solicitar la Liquidación
                </h4>
                <p className="text-xs text-muted">
                  Arrastra tus extractos bancarios en PDF o el Formulario 220 directamente a la ventana de chat.
                </p>
              </div>
            </div>

            <p className="text-sm text-secondary mb-2">
              Escribe en el chat:
            </p>
            <div className="p-3 bg-sky-light dark:bg-slate-900 border border-sky-border dark:border-slate-800 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200">
              "He adjuntado mi Certificado de Ingresos y Retenciones Formulario 220 y mis extractos bancarios de 2025. Por favor, extrae las partidas, concílialas y genera la liquidación del Formulario 210 aplicando los topes del 40% del Art. 336 E.T."
            </div>
          </div>
        </div>
      ) : (
        <div className="tutorial-steps-container">
          <div className="tutorial-card">
            <div className="tutorial-step-header">
              <div className="step-number-badge">1</div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Instalación e Invocación en Claude Code (CLI)
                </h4>
                <p className="text-xs text-muted">
                  Ejecuta el asistente directamente desde tu terminal en cualquier proyecto con documentos fiscales.
                </p>
              </div>
            </div>

            <div className="code-block-wrapper">
              <pre>{claudeCodeInstallCmd}</pre>
              <button
                className="btn-copy-floating"
                onClick={() => copyToClipboard(claudeCodeInstallCmd, 'claude-cli-cmd')}
              >
                {copiedKey === 'claude-cli-cmd' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                <span>{copiedKey === 'claude-cli-cmd' ? 'Copiado' : 'Copiar Comandos'}</span>
              </button>
            </div>

            <div className="mt-4 p-3 bg-emerald-light dark:bg-emerald-950/30 border border-emerald-border dark:border-emerald-800/50 rounded-lg flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-300">
              <CheckCircle2 size={18} className="text-emerald shrink-0" />
              <span>
                Claude Code ejecutará automáticamente los scripts de Python locales (`conciliar_exogena.py` e `inyectar_tributia.py`) sin enviar información confidencial a servidores externos.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
