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
    "title": "TributIA API",
    "version": "1.0.0"
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
      {/* SUB-TABS SELECTOR */}
      <div className="flex items-center gap-3 mb-6">
        <button
          className={`btn ${subTab === 'custom-gpt' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setSubTab('custom-gpt')}
        >
          <Bot size={16} />
          <span>ChatGPT Desktop & Custom GPTs</span>
        </button>

        <button
          className={`btn ${subTab === 'codex' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setSubTab('codex')}
        >
          <Code2 size={16} />
          <span>OpenAI Codex & Plugins</span>
        </button>
      </div>

      {subTab === 'custom-gpt' ? (
        <div className="tutorial-steps-container">
          {/* STEP 1: CREATE CUSTOM GPT */}
          <div className="tutorial-card">
            <div className="tutorial-step-header">
              <div className="step-number-badge">1</div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Crear un "Custom GPT" en OpenAI (o configurar en ChatGPT Desktop)
                </h4>
                <p className="text-xs text-muted">
                  Ve a <a href="https://chatgpt.com/gpts/editor" target="_blank" rel="noreferrer" className="text-sky underline font-semibold">chatgpt.com/gpts/editor <ExternalLink size={11} className="inline" /></a> y crea un nuevo GPT llamado <strong>TributIA Contador DIAN</strong>.
                </p>
              </div>
            </div>

            <p className="text-sm text-secondary mb-2">
              Pega estas directivas oficiales en el campo <strong>Instructions (Instrucciones)</strong>:
            </p>

            <div className="code-block-wrapper">
              <pre>{CUSTOM_GPT_INSTRUCTIONS}</pre>
              <button
                className="btn-copy-floating"
                onClick={() => copyToClipboard(CUSTOM_GPT_INSTRUCTIONS, 'gpt-instructions')}
              >
                {copiedKey === 'gpt-instructions' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                <span>{copiedKey === 'gpt-instructions' ? 'Copiado' : 'Copiar Instrucciones'}</span>
              </button>
            </div>
          </div>

          {/* STEP 2: OPENAPI ACTION */}
          <div className="tutorial-card">
            <div className="tutorial-step-header">
              <div className="step-number-badge">2</div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Conectar Acciones OpenAPI (Function Calling)
                </h4>
                <p className="text-xs text-muted">
                  En la pestaña <em>Configure</em> del GPT Builder, haz clic en <strong>Create new action</strong> para conectar la API local de TributIA.
                </p>
              </div>
            </div>

            <p className="text-sm text-secondary mb-2">
              Pega el esquema OpenAPI simplificado o importa <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">http://localhost:8000/openapi.json</code>:
            </p>

            <div className="code-block-wrapper">
              <pre>{openApiActionSchema}</pre>
              <button
                className="btn-copy-floating"
                onClick={() => copyToClipboard(openApiActionSchema, 'gpt-openapi')}
              >
                {copiedKey === 'gpt-openapi' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                <span>{copiedKey === 'gpt-openapi' ? 'Copiado' : 'Copiar Esquema OpenAPI'}</span>
              </button>
            </div>
          </div>

          {/* STEP 3: DESKTOP INSTRUCTIONS */}
          <div className="tutorial-card">
            <div className="tutorial-step-header">
              <div className="step-number-badge">3</div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Uso en la App de Escritorio de ChatGPT (macOS / Windows)
                </h4>
                <p className="text-xs text-muted">
                  Si usas la app nativa de ChatGPT, puedes agregar estas instrucciones en <strong>Settings → Personalization → Custom Instructions</strong>.
                </p>
              </div>
            </div>

            <p className="text-sm text-secondary">
              Cada vez que inicies un chat y adjuntes tus extractos bancarios o un archivo CSV con movimientos del año, ChatGPT procesará automáticamente los topes tributarios según la normativa colombiana.
            </p>
          </div>
        </div>
      ) : (
        <div className="tutorial-steps-container">
          <div className="tutorial-card">
            <div className="tutorial-step-header">
              <div className="step-number-badge">1</div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Configuración en OpenAI Codex Runtime
                </h4>
                <p className="text-xs text-muted">
                  Ejecuta scripts de conciliación y procesamiento de hojas de cálculo usando el plugin oficial.
                </p>
              </div>
            </div>

            <div className="p-4 bg-subtle rounded-lg border border-subtle text-sm text-secondary">
              <p className="font-semibold mb-2">Instrucciones para entornos Codex:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Clona o abre el repositorio de TributIA.</li>
                <li>Verifica que el entorno virtual contenga las dependencias (<code className="font-mono">poetry install</code>).</li>
                <li>Invoca el análisis de datos fiscales ejecutando: <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">poetry run python skills/declaracion-renta-persona-natural/scripts/consolidar_transacciones.py</code>.</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
