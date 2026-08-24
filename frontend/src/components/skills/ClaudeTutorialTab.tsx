import React, { useState } from 'react';
import { Copy, Check, Download, Monitor, Terminal, CheckCircle2, MessageSquareText } from 'lucide-react';
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
curl -o skills/declaracion-renta-persona-natural/SKILL.md \\
  https://raw.githubusercontent.com/juansebashr/tribut-ia/main/skills/declaracion-renta-persona-natural/SKILL.md

# 3. Invocar al agente en Claude Code
claude "Analiza los extractos bancarios en la carpeta /documentos y liquida la renta de persona natural con la skill de Fiscol"`;

  return (
    <div className="tutorial-tab-content">
      {/* SUB-TABS SEGMENTED SWITCH */}
      <div className="segmented-subtabs-wrapper">
        <div className="segmented-subtabs">
          <button
            className={`subtab-btn ${subTab === 'desktop' ? 'active' : ''}`}
            onClick={() => setSubTab('desktop')}
          >
            <Monitor size={16} />
            <span>Claude Desktop (App de Escritorio)</span>
          </button>

          <button
            className={`subtab-btn ${subTab === 'cli' ? 'active' : ''}`}
            onClick={() => setSubTab('cli')}
          >
            <Terminal size={16} />
            <span>Claude Code (CLI en Terminal)</span>
          </button>
        </div>
      </div>

      {subTab === 'desktop' ? (
        <div className="tutorial-steps-container">
          {/* STEP 1 */}
          <div className="step-card-modern">
            <div className="step-card-header">
              <div className="step-number-circle">1</div>
              <div className="step-title-area">
                <div className="flex items-center gap-2">
                  <h3 className="step-title">Configurar Servidor Local en Claude Desktop</h3>
                  <span className="step-tag-pill">claude_desktop_config.json</span>
                </div>
                <p className="step-subtitle">
                  Permite a la aplicación de escritorio comunicarse con el motor local de Fiscol para validaciones en vivo.
                </p>
              </div>
            </div>

            <div className="step-card-body">
              <div className="config-paths-box">
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">Ruta según tu sistema operativo:</span>
                <div className="path-item">
                  <span className="path-os">macOS:</span>
                  <code className="path-code">{macConfigPath}</code>
                </div>
                <div className="path-item">
                  <span className="path-os">Windows:</span>
                  <code className="path-code">{winConfigPath}</code>
                </div>
              </div>

              <div className="code-window">
                <div className="code-window-header">
                  <div className="code-window-dots">
                    <span className="dot dot-red" />
                    <span className="dot dot-yellow" />
                    <span className="dot dot-green" />
                  </div>
                  <span className="code-window-title">claude_desktop_config.json</span>
                  <button
                    className="code-copy-btn"
                    onClick={() => copyToClipboard(CLAUDE_DESKTOP_CONFIG_JSON, 'claude-json')}
                  >
                    {copiedKey === 'claude-json' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                    <span>{copiedKey === 'claude-json' ? '¡Copiado!' : 'Copiar Configuración'}</span>
                  </button>
                </div>
                <div className="code-window-body">
                  <pre>{CLAUDE_DESKTOP_CONFIG_JSON}</pre>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  className="btn btn-outline btn-sm download-json-btn"
                  onClick={() => downloadFile('claude_desktop_config.json', CLAUDE_DESKTOP_CONFIG_JSON, 'application/json')}
                >
                  <Download size={14} />
                  <span>Descargar claude_desktop_config.json</span>
                </button>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="step-card-modern">
            <div className="step-card-header">
              <div className="step-number-circle">2</div>
              <div className="step-title-area">
                <div className="flex items-center gap-2">
                  <h3 className="step-title">Crear un "Proyecto" en Claude Desktop con las Directivas</h3>
                  <span className="step-tag-pill">Claude Pro / Team</span>
                </div>
                <p className="step-subtitle">
                  Configura un espacio de trabajo con conocimiento tributario especializado.
                </p>
              </div>
            </div>

            <div className="step-card-body">
              <div className="instructions-checklist">
                <div className="checklist-item">
                  <div className="checklist-bullet">1</div>
                  <span>Abre <strong>Claude Desktop</strong> y haz clic en <strong>Projects → Create Project</strong>.</span>
                </div>
                <div className="checklist-item">
                  <div className="checklist-bullet">2</div>
                  <span>Nombra el proyecto: <em>"Fiscol - Contador DIAN Experto"</em>.</span>
                </div>
                <div className="checklist-item">
                  <div className="checklist-bullet">3</div>
                  <span>En <strong>Project Instructions (Instrucciones Personalizadas)</strong>, pega el contenido del archivo <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">SKILL.md</code>.</span>
                </div>
                <div className="checklist-item">
                  <div className="checklist-bullet">4</div>
                  <span>En <strong>Project Knowledge</strong>, adjunta la plantilla <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">transacciones_template.csv</code>.</span>
                </div>
              </div>

              <div className="mt-4">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => copyToClipboard(SKILL_MD_CONTENT, 'claude-skill-md')}
                >
                  {copiedKey === 'claude-skill-md' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                  <span>{copiedKey === 'claude-skill-md' ? '¡Directivas Copiadas!' : 'Copiar Contenido de SKILL.md'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="step-card-modern">
            <div className="step-card-header">
              <div className="step-number-circle">3</div>
              <div className="step-title-area">
                <div className="flex items-center gap-2">
                  <h3 className="step-title">Subir Documentos y Solicitar la Liquidación</h3>
                  <span className="step-tag-pill">Ejecución</span>
                </div>
                <p className="step-subtitle">
                  Arrastra tus extractos bancarios en PDF o el Formulario 220 directamente a la ventana de chat.
                </p>
              </div>
            </div>

            <div className="step-card-body">
              <div className="prompt-sample-container">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquareText size={16} className="text-sky" />
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Escribe en el chat:</span>
                </div>
                <p className="prompt-sample-text">
                  "He adjuntado mi Certificado de Ingresos y Retenciones Formulario 220 y mis extractos bancarios de 2025. Por favor, extrae las partidas, concílialas y genera la liquidación del Formulario 210 aplicando los topes del 40% del Art. 336 E.T."
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="tutorial-steps-container">
          <div className="step-card-modern">
            <div className="step-card-header">
              <div className="step-number-circle">1</div>
              <div className="step-title-area">
                <div className="flex items-center gap-2">
                  <h3 className="step-title">Instalación e Invocación en Claude Code (CLI)</h3>
                  <span className="step-tag-pill">Terminal</span>
                </div>
                <p className="step-subtitle">
                  Ejecuta el asistente directamente desde tu terminal en cualquier proyecto con documentos fiscales.
                </p>
              </div>
            </div>

            <div className="step-card-body">
              <div className="code-window">
                <div className="code-window-header">
                  <div className="code-window-dots">
                    <span className="dot dot-red" />
                    <span className="dot dot-yellow" />
                    <span className="dot dot-green" />
                  </div>
                  <span className="code-window-title">bash / zsh terminal</span>
                  <button
                    className="code-copy-btn"
                    onClick={() => copyToClipboard(claudeCodeInstallCmd, 'claude-cli-cmd')}
                  >
                    {copiedKey === 'claude-cli-cmd' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                    <span>{copiedKey === 'claude-cli-cmd' ? '¡Copiado!' : 'Copiar Comandos'}</span>
                  </button>
                </div>
                <div className="code-window-body">
                  <pre>{claudeCodeInstallCmd}</pre>
                </div>
              </div>

              <div className="info-badge-callout">
                <CheckCircle2 size={18} className="text-emerald shrink-0" />
                <span>
                  Claude Code ejecutará automáticamente los scripts locales (<code className="font-mono">conciliar_exogena.py</code> e <code className="font-mono">inyectar_session.py</code>) sin enviar información confidencial a servidores externos.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
