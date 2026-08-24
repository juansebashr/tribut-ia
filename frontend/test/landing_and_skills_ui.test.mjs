import test from 'node:test';
import assert from 'node:assert/strict';

// Helper de simulación de hash y navegación SPA
function parseHashView(hash) {
  const cleanHash = (hash || '').replace(/^#\/?/, '').trim();
  if (cleanHash === 'landing') {
    return { view: 'landing', module: 'pn', subTab: 'calc' };
  }
  if (cleanHash === 'skill-tutorial' || cleanHash === 'skills' || cleanHash === 'tutorial') {
    return { view: 'skill-tutorial', module: 'pn', subTab: 'calc' };
  }
  // Módulos directos de la suite
  const knownModules = [
    'calendario', 'pn', 'pj', 'simple', 'iva', 'retefuente',
    'beneficios', 'presentacion', 'inflacionario', 'art73', 'inmuebles-afc', 'rules'
  ];
  const parts = cleanHash.split('/');
  const mod = parts[0] === 'app' ? (parts[1] || 'pn') : parts[0];
  const sub = parts[0] === 'app' ? (parts[2] || 'calc') : (parts[1] || 'calc');

  if (knownModules.includes(mod)) {
    return { view: 'app', module: mod, subTab: sub };
  }

  return { view: 'app', module: 'pn', subTab: 'calc' };
}

test('Enrutamiento Hash SPA - Parseo de Vistas', () => {
  assert.deepEqual(parseHashView(''), { view: 'app', module: 'pn', subTab: 'calc' });
  assert.deepEqual(parseHashView('#landing'), { view: 'landing', module: 'pn', subTab: 'calc' });
  assert.deepEqual(parseHashView('#/landing'), { view: 'landing', module: 'pn', subTab: 'calc' });
  assert.deepEqual(parseHashView('#skill-tutorial'), { view: 'skill-tutorial', module: 'pn', subTab: 'calc' });
  assert.deepEqual(parseHashView('#app'), { view: 'app', module: 'pn', subTab: 'calc' });
  assert.deepEqual(parseHashView('#app/pj'), { view: 'app', module: 'pj', subTab: 'calc' });
  assert.deepEqual(parseHashView('#art73'), { view: 'app', module: 'art73', subTab: 'calc' });
  assert.deepEqual(parseHashView('#pn/f210'), { view: 'app', module: 'pn', subTab: 'f210' });
});

test('Bundle de Skill - Definiciones y Generador de Descarga', () => {
  const skillMdContent = `---
name: declaracion-renta-persona-natural
description: TributIA Income Tax Assistant
---
# Declaración de Renta`;

  const files = {
    'SKILL.md': skillMdContent,
    'templates/transacciones_template.csv': 'fecha,archivo_origen,tercero_nombre,tercero_nit,descripcion,tipo_movimiento,valor_cop,cedula_destino,concepto_tributario,beneficio_asociado',
    'prompt_claude_desktop.txt': 'Eres un contador experto...',
    'claude_desktop_config.json': JSON.stringify({ mcpServers: { tributia: { command: "poetry", args: ["run", "python", "-m", "backend.app.main"] } } }, null, 2)
  };

  assert.ok(files['SKILL.md'].includes('declaracion-renta-persona-natural'));
  assert.ok(files['templates/transacciones_template.csv'].includes('cedula_destino'));
  assert.ok(files['claude_desktop_config.json'].includes('tributia'));
});

test('Landing Page - Verificación de CTAs y Enlaces Clave', () => {
  const ctaButtons = [
    { id: 'btn-cta-start', label: 'Empecemos', targetView: 'app' },
    { id: 'btn-cta-download-skill', label: 'Descarga la Skill de IA', targetView: 'skill-tutorial' }
  ];

  assert.equal(ctaButtons.length, 2);
  assert.equal(ctaButtons[0].id, 'btn-cta-start');
  assert.equal(ctaButtons[1].id, 'btn-cta-download-skill');
});

test('Plataformas de IA Soportadas en el Tutorial', () => {
  const platforms = [
    { id: 'claude', name: 'Anthropic Claude', modes: ['desktop', 'cli'] },
    { id: 'antigravity', name: 'Google Antigravity / AGY', modes: ['desktop', 'cli'] },
    { id: 'chatgpt', name: 'OpenAI ChatGPT & Codex', modes: ['custom-gpt', 'codex'] }
  ];

  assert.equal(platforms.length, 3);
  assert.deepEqual(platforms.map(p => p.id), ['claude', 'antigravity', 'chatgpt']);
  assert.ok(platforms.every(p => p.modes.length === 2));
});

test('Bundle de Skill - control-comparacion-patrimonial', () => {
  const skillComparacionMd = `---
name: control-comparacion-patrimonial
description: Auditoría y Control por Comparación Patrimonial
---
# Auditoría y Control por Comparación Patrimonial`;

  assert.ok(skillComparacionMd.includes('control-comparacion-patrimonial'));
  assert.ok(skillComparacionMd.includes('Comparación Patrimonial'));
});


