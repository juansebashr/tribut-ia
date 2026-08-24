import React, { useState } from 'react';
import { Copy, Check, Monitor, Terminal, CheckCircle2 } from 'lucide-react';
import { SKILL_MD_CONTENT } from '../../utils/skillBundleDownloader';

export const AntigravityTutorialTab: React.FC = () => {
  const [subTab, setSubTab] = useState<'desktop' | 'cli'>('desktop');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const agySkillSetupCmd = `# 1. Crear la carpeta del skill en la configuración de Antigravity
mkdir -p ~/.gemini/skills/declaracion-renta-persona-natural

# 2. Descargar el archivo SKILL.md oficial
curl -o ~/.gemini/skills/declaracion-renta-persona-natural/SKILL.md \\
  https://raw.githubusercontent.com/juansebashr/tribut-ia/main/skills/declaracion-renta-persona-natural/SKILL.md

# 3. Invocar al agente en Antigravity CLI
antigravity "Analiza los soportes contables en ./documentos_renta y liquida la declaración de renta con Fiscol"`;

  const agySubagentPrompt = `Eres un Contador Tributario especializado en la legislación colombiana (Estatuto Tributario y Ley 2277 de 2022).
Tu rol es analizar documentos contables, conciliar transacciones bancarias contra la información exógena de la DIAN y generar la liquidación en Fiscol.

Reglas:
- Utiliza la UVT oficial según el año fiscal ($49.799 para 2025).
- Aplica el límite del 40% y 1.340 UVT en Rentas Exentas y Deducciones (Art. 336 E.T.).
- Redondea todos los valores finales a múltiplos de $1.000 COP.`;

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
            <span>Antigravity IDE & Subagentes</span>
          </button>

          <button
            className={`subtab-btn ${subTab === 'cli' ? 'active' : ''}`}
            onClick={() => setSubTab('cli')}
          >
            <Terminal size={16} />
            <span>Antigravity CLI (AGY)</span>
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
                  <h3 className="step-title">Registrar la Skill en el Workspace de Antigravity</h3>
                  <span className="step-tag-pill">.gemini/skills</span>
                </div>
                <p className="step-subtitle">
                  Antigravity detecta y carga dinámicamente cualquier carpeta con directivas <code className="font-mono text-xs">SKILL.md</code>.
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
                  <span className="code-window-title">SKILL.md (declaracion-renta-persona-natural)</span>
                  <button
                    className="code-copy-btn"
                    onClick={() => copyToClipboard(SKILL_MD_CONTENT, 'agy-skill-md')}
                  >
                    {copiedKey === 'agy-skill-md' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                    <span>{copiedKey === 'agy-skill-md' ? '¡Copiado!' : 'Copiar SKILL.md'}</span>
                  </button>
                </div>
                <div className="code-window-body">
                  <pre>{SKILL_MD_CONTENT.slice(0, 480) + '\n# (... resto de las directivas y fases de liquidación)'}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="step-card-modern">
            <div className="step-card-header">
              <div className="step-number-circle">2</div>
              <div className="step-title-area">
                <div className="flex items-center gap-2">
                  <h3 className="step-title">Definir un Subagente Dedicado</h3>
                  <span className="step-tag-pill">define_subagent</span>
                </div>
                <p className="step-subtitle">
                  Prompt del sistema para configurar agentes autónomos de liquidación documental.
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
                  <span className="code-window-title">System Prompt / Directivas</span>
                  <button
                    className="code-copy-btn"
                    onClick={() => copyToClipboard(agySubagentPrompt, 'agy-prompt')}
                  >
                    {copiedKey === 'agy-prompt' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                    <span>{copiedKey === 'agy-prompt' ? '¡Copiado!' : 'Copiar Prompt'}</span>
                  </button>
                </div>
                <div className="code-window-body">
                  <pre>{agySubagentPrompt}</pre>
                </div>
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
                  <h3 className="step-title">Instalación y Ejecución en Antigravity CLI</h3>
                  <span className="step-tag-pill">CLI / Shell</span>
                </div>
                <p className="step-subtitle">
                  Comandos para clonar y ejecutar el skill con soporte para extracción de AST y conciliación de datos.
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
                    onClick={() => copyToClipboard(agySkillSetupCmd, 'agy-cli-cmd')}
                  >
                    {copiedKey === 'agy-cli-cmd' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                    <span>{copiedKey === 'agy-cli-cmd' ? '¡Copiado!' : 'Copiar Comandos'}</span>
                  </button>
                </div>
                <div className="code-window-body">
                  <pre>{agySkillSetupCmd}</pre>
                </div>
              </div>

              <div className="info-badge-callout">
                <CheckCircle2 size={18} className="text-sky shrink-0" />
                <span>
                  Antigravity mantendrá sincronizado el grafo de conocimiento arquitectónico y auditará cada paso de la liquidación fiscal.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
