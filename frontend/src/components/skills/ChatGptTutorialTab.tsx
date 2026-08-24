import React, { useState } from 'react';
import { Copy, Check, Bot, ExternalLink, Code2 } from 'lucide-react';
import { CUSTOM_GPT_INSTRUCTIONS } from '../../utils/skillBundleDownloader';

export const ChatGptTutorialTab: React.FC = () => {
  const [subTab, setSubTab] = useState<'custom-gpt' | 'codex'>('custom-gpt');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const openApiActionSchema = `{
  "openapi": "3.1.0",
  "info": {
    "title": "Fiscol API",
    "version": "2.5.0"
  },
  "servers": [
    {
      "url": "http://localhost:8000"
    }
  ],
  "paths": {
    "/api/v1/calculate/persona-natural/calculate": {
      "post": {
        "summary": "Liquidar Impuesto Persona Natural F-210",
        "operationId": "calcularPersonaNatural",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "tax_year": { "type": "integer", "default": 2025 },
                  "rentas_trabajo": { "type": "number", "default": 0 },
                  "aporte_salud_obligatorio": { "type": "number", "default": 0 },
                  "aporte_pension_obligatorio": { "type": "number", "default": 0 },
                  "intereses_vivienda_anual": { "type": "number", "default": 0 },
                  "medicina_prepagada_anual": { "type": "number", "default": 0 }
                }
              }
            }
          }
        }
      }
    }
  }
}`;

  return (
    <div className="tutorial-tab-content">
      {/* SUB-TABS SEGMENTED SWITCH */}
      <div className="segmented-subtabs-wrapper">
        <div className="segmented-subtabs">
          <button
            className={`subtab-btn ${subTab === 'custom-gpt' ? 'active' : ''}`}
            onClick={() => setSubTab('custom-gpt')}
          >
            <Bot size={16} />
            <span>ChatGPT Desktop & Custom GPTs</span>
          </button>

          <button
            className={`subtab-btn ${subTab === 'codex' ? 'active' : ''}`}
            onClick={() => setSubTab('codex')}
          >
            <Code2 size={16} />
            <span>OpenAI Codex & Plugins</span>
          </button>
        </div>
      </div>

      {subTab === 'custom-gpt' ? (
        <div className="tutorial-steps-container">
          {/* STEP 1 */}
          <div className="step-card-modern">
            <div className="step-card-header">
              <div className="step-number-circle">1</div>
              <div className="step-title-area">
                <div className="flex items-center gap-2">
                  <h3 className="step-title">Crear un "Custom GPT" en OpenAI</h3>
                  <span className="step-tag-pill">GPT Builder</span>
                </div>
                <p className="step-subtitle">
                  Entra al editor en <a href="https://chatgpt.com/gpts/editor" target="_blank" rel="noreferrer" className="text-sky underline font-semibold">chatgpt.com/gpts/editor <ExternalLink size={11} className="inline" /></a> y crea tu agente <strong>Fiscol Contador DIAN</strong>.
                </p>
              </div>
            </div>

            <div className="step-card-body">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Pega estas directivas oficiales en el campo <strong>Instructions (Instrucciones)</strong>:
              </p>

              <div className="code-window">
                <div className="code-window-header">
                  <div className="code-window-dots">
                    <span className="dot dot-red" />
                    <span className="dot dot-yellow" />
                    <span className="dot dot-green" />
                  </div>
                  <span className="code-window-title">Instructions (Custom GPT)</span>
                  <button
                    className="code-copy-btn"
                    onClick={() => copyToClipboard(CUSTOM_GPT_INSTRUCTIONS, 'gpt-instructions')}
                  >
                    {copiedKey === 'gpt-instructions' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                    <span>{copiedKey === 'gpt-instructions' ? '¡Copiado!' : 'Copiar Instrucciones'}</span>
                  </button>
                </div>
                <div className="code-window-body">
                  <pre>{CUSTOM_GPT_INSTRUCTIONS}</pre>
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
                  <h3 className="step-title">Conectar Acciones OpenAPI (Function Calling)</h3>
                  <span className="step-tag-pill">Actions</span>
                </div>
                <p className="step-subtitle">
                  En la pestaña <em>Configure</em> del GPT Builder, haz clic en <strong>Create new action</strong> para conectar la API local.
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
                  <span className="code-window-title">OpenAPI Schema</span>
                  <button
                    className="code-copy-btn"
                    onClick={() => copyToClipboard(openApiActionSchema, 'gpt-openapi')}
                  >
                    {copiedKey === 'gpt-openapi' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                    <span>{copiedKey === 'gpt-openapi' ? '¡Copiado!' : 'Copiar Esquema'}</span>
                  </button>
                </div>
                <div className="code-window-body">
                  <pre>{openApiActionSchema}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="step-card-modern">
            <div className="step-card-header">
              <div className="step-number-circle">3</div>
              <div className="step-title-area">
                <div className="flex items-center gap-2">
                  <h3 className="step-title">Uso en la App de Escritorio de ChatGPT (macOS / Windows)</h3>
                  <span className="step-tag-pill">Desktop App</span>
                </div>
                <p className="step-subtitle">
                  Configura tus instrucciones en <strong>Settings → Personalization → Custom Instructions</strong>.
                </p>
              </div>
            </div>

            <div className="step-card-body">
              <p className="text-xs text-secondary leading-relaxed">
                Cada vez que inicies un chat y adjuntes tus extractos bancarios o un archivo CSV con movimientos del año, ChatGPT procesará automáticamente los topes tributarios según la normativa colombiana sin requerir configuraciones adicionales.
              </p>
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
                  <h3 className="step-title">Configuración en OpenAI Codex Runtime</h3>
                  <span className="step-tag-pill">CLI / Plugins</span>
                </div>
                <p className="step-subtitle">
                  Ejecuta scripts de conciliación y procesamiento de hojas de cálculo usando el plugin oficial.
                </p>
              </div>
            </div>

            <div className="step-card-body">
              <div className="instructions-checklist">
                <div className="checklist-item">
                  <div className="checklist-bullet">1</div>
                  <span>Clona o abre el repositorio de Fiscol en tu entorno local.</span>
                </div>
                <div className="checklist-item">
                  <div className="checklist-bullet">2</div>
                  <span>Verifica que el entorno virtual contenga las dependencias (<code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">poetry install</code>).</span>
                </div>
                <div className="checklist-item">
                  <div className="checklist-bullet">3</div>
                  <span>Invoca el análisis de datos fiscales ejecutando: <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">poetry run python skills/declaracion-renta-persona-natural/scripts/consolidar_transacciones.py</code>.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
