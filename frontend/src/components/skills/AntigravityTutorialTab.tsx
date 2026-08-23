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
antigravity "Analiza los soportes contables en ./documentos_renta y liquida la declaración de renta con TributIA"`;

  const agySubagentPrompt = `Eres un Contador Tributario especializado en la legislación colombiana (Estatuto Tributario y Ley 2277 de 2022).
Tu rol es analizar documentos contables, conciliar transacciones bancarias contra la información exógena de la DIAN y generar la liquidación en TributIA.

Reglas:
- Utiliza la UVT oficial según el año fiscal ($49.799 para 2025).
- Aplica el límite del 40% y 1.340 UVT en Rentas Exentas y Deducciones (Art. 336 E.T.).
- Redondea todos los valores finales a múltiplos de $1.000 COP.`;

  return (
    <div className="tutorial-tab-content">
      {/* SUB-TABS SELECTOR */}
      <div className="flex items-center gap-3 mb-6">
        <button
          className={`btn ${subTab === 'desktop' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setSubTab('desktop')}
        >
          <Monitor size={16} />
          <span>Antigravity IDE & Subagentes</span>
        </button>

        <button
          className={`btn ${subTab === 'cli' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setSubTab('cli')}
        >
          <Terminal size={16} />
          <span>Antigravity CLI (AGY)</span>
        </button>
      </div>

      {subTab === 'desktop' ? (
        <div className="tutorial-steps-container">
          {/* STEP 1 */}
          <div className="tutorial-card">
            <div className="tutorial-step-header">
              <div className="step-number-badge">1</div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Registrar la Skill en el Workspace de Antigravity
                </h4>
                <p className="text-xs text-muted">
                  Coloca las directivas en la carpeta <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">.gemini/skills/declaracion-renta-persona-natural/SKILL.md</code>.
                </p>
              </div>
            </div>

            <p className="text-sm text-secondary mb-3">
              Antigravity detecta automáticamente los archivos <code className="font-mono text-xs">SKILL.md</code> en el directorio raíz o en las rutas globales de habilidades del usuario.
            </p>

            <div className="code-block-wrapper">
              <pre>{SKILL_MD_CONTENT.slice(0, 450) + '\n# (... resto de las directivas de liquidación)'}</pre>
              <button
                className="btn-copy-floating"
                onClick={() => copyToClipboard(SKILL_MD_CONTENT, 'agy-skill-md')}
              >
                {copiedKey === 'agy-skill-md' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                <span>{copiedKey === 'agy-skill-md' ? 'Copiado' : 'Copiar SKILL.md'}</span>
              </button>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="tutorial-card">
            <div className="tutorial-step-header">
              <div className="step-number-badge">2</div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Configurar Subagente Especializado (Opcional)
                </h4>
                <p className="text-xs text-muted">
                  Puedes definir un subagente dedicado para liquidación documental mediante la herramienta <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">define_subagent</code>.
                </p>
              </div>
            </div>

            <div className="code-block-wrapper">
              <pre>{agySubagentPrompt}</pre>
              <button
                className="btn-copy-floating"
                onClick={() => copyToClipboard(agySubagentPrompt, 'agy-prompt')}
              >
                {copiedKey === 'agy-prompt' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                <span>{copiedKey === 'agy-prompt' ? 'Copiado' : 'Copiar Prompt'}</span>
              </button>
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
                  Instalación y Ejecución en Antigravity CLI
                </h4>
                <p className="text-xs text-muted">
                  Comandos para clonar y ejecutar el skill con soporte para extracción de AST y conciliación de datos.
                </p>
              </div>
            </div>

            <div className="code-block-wrapper">
              <pre>{agySkillSetupCmd}</pre>
              <button
                className="btn-copy-floating"
                onClick={() => copyToClipboard(agySkillSetupCmd, 'agy-cli-cmd')}
              >
                {copiedKey === 'agy-cli-cmd' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                <span>{copiedKey === 'agy-cli-cmd' ? 'Copiado' : 'Copiar Comandos'}</span>
              </button>
            </div>

            <div className="mt-4 p-3 bg-sky-light dark:bg-sky-950/30 border border-sky-border dark:border-sky-800/50 rounded-lg flex items-center gap-3 text-xs text-sky-900 dark:text-sky-300">
              <CheckCircle2 size={18} className="text-sky shrink-0" />
              <span>
                Antigravity mantendrá sincronizado el grafo de conocimiento arquitectónico y auditará cada paso de la liquidación fiscal.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
