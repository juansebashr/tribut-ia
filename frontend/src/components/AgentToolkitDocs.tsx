import React, { useState } from 'react';
import { Bot, Copy, Check, Terminal, FileCode2 } from 'lucide-react';

export const AgentToolkitDocs: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const curlExample = `curl -X POST http://localhost:8000/api/v1/calculate/persona-natural/calculate \\
  -H "Content-Type: application/json" \\
  -d '{
    "tax_year": 2026,
    "rentas_trabajo": 120000000,
    "aporte_salud_obligatorio": 4800000,
    "aporte_pension_obligatorio": 4800000,
    "aplica_dependiente_general": true,
    "numero_dependientes_adicionales_72uvt": 1,
    "medicina_prepagada_anual": 8000000,
    "intereses_vivienda_anual": 15000000,
    "aportes_voluntarios_pension_afc": 12000000,
    "retenciones_fuente_practicadas": 6000000
  }'`;

  const agentSkillPrompt = `Eres un Agente Contador Experto en Tributación Colombiana.
Tu misión es procesar documentos contables (Certificado de Ingresos y Retenciones Formulario 220, Extractos Bancarios, Certificados de Salud/Pensión, Balances PyG).

Instrucciones:
1. Extrae los montos de ingresos brutos, aportes a seguridad social, pagos de prepagada, intereses de vivienda y retenciones practicadas.
2. Invoca la herramienta \`calcular_renta_persona_natural\` o \`calcular_renta_persona_juridica\` de la API TributIA.
3. Presenta al usuario el informe de liquidación con el desglose paso a paso y las recomendaciones de optimización fiscal.`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Bot size={18} color="#1e3a8a" />
            Integración con Agentes de Inteligencia Artificial (AI Skill / MCP)
          </div>
        </div>
        <div className="card-body">
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
            TributIA expone una API REST moderna y esquemas estándar de <strong>Function Calling</strong> para que agentes inteligentes puedan analizar automáticamente documentos fiscales (certificados de ingresos y retenciones Formulario 220, extractos bancarios, balances de comprobación, facturas) y ejecutar cálculos auditables.
          </p>

          <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '16px 0 8px' }}>1. Prompt del Agente / Skill Definition</h4>
          <div style={{ position: 'relative' }}>
            <pre style={{ background: '#0f172a', color: '#f8fafc', padding: '14px', borderRadius: '8px', fontSize: '12.5px', overflowX: 'auto', lineHeight: 1.5 }}>
              {agentSkillPrompt}
            </pre>
            <button
              className="btn btn-outline btn-sm"
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
              onClick={() => copyCode(agentSkillPrompt, 1)}
            >
              {copiedIndex === 1 ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              {copiedIndex === 1 ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '20px 0 8px' }}>2. Ejemplo de Invocación cURL / REST</h4>
          <div style={{ position: 'relative' }}>
            <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '14px', borderRadius: '8px', fontSize: '12.5px', overflowX: 'auto', lineHeight: 1.5 }}>
              {curlExample}
            </pre>
            <button
              className="btn btn-outline btn-sm"
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
              onClick={() => copyCode(curlExample, 2)}
            >
              {copiedIndex === 2 ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              {copiedIndex === 2 ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          <div style={{ marginTop: '20px', padding: '14px', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileCode2 size={24} color="#1e3a8a" />
            <div style={{ fontSize: '13px', color: 'var(--primary)' }}>
              <strong>Documentación Swagger / OpenAPI:</strong> Puedes explorar y probar todos los endpoints interactivamente en <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" style={{ fontWeight: 700, textDecoration: 'underline', color: 'var(--primary)' }}>http://localhost:8000/docs</a>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
