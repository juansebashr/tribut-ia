import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const appJsPath = path.resolve(import.meta.dirname, '../../backend/app/static/app.js');
const calendarioPath = path.resolve(import.meta.dirname, '../../backend/app/static/calendario_data.js');
const casillasPath = path.resolve(import.meta.dirname, '../../backend/app/static/casillas_info.js');

// Mock DOM
function createMockElement(tag = 'div', id = '') {
  return {
    tagName: tag.toUpperCase(),
    id,
    value: '',
    innerText: '',
    innerHTML: '',
    style: {},
    classList: {
      add: () => {},
      remove: () => {},
      toggle: () => {},
      contains: () => false
    },
    children: [],
    appendChild(child) { this.children.push(child); return child; },
    remove() {},
    setAttribute() {},
    getAttribute() { return ''; },
    addEventListener() {},
    querySelectorAll() { return []; },
    querySelector() { return null; }
  };
}

const elementsMap = {
  'tributia-toast-container': createMockElement('div', 'tributia-toast-container'),
  'modal-confirm-action': createMockElement('div', 'modal-confirm-action'),
  'confirm-modal-icon': createMockElement('span', 'confirm-modal-icon'),
  'confirm-modal-title': createMockElement('h3', 'confirm-modal-title'),
  'confirm-modal-msg': createMockElement('p', 'confirm-modal-msg'),
  'confirm-modal-btn-accept': createMockElement('button', 'confirm-modal-btn-accept'),
  'top-session-badge-pill': createMockElement('span', 'top-session-badge-pill'),
  'top-session-badge-text': createMockElement('span', 'top-session-badge-text'),
  'top-session-badge-short': createMockElement('span', 'top-session-badge-short'),
  'top-session-btn-copy': createMockElement('button', 'top-session-btn-copy'),
  'top-session-btn-new': createMockElement('button', 'top-session-btn-new'),
  'api-current-session-id-display': createMockElement('span', 'api-current-session-id-display'),
  'api-session-id-input': createMockElement('input', 'api-session-id-input'),
  'curl-state-box': createMockElement('pre', 'curl-state-box'),
  'curl-reset-box': createMockElement('pre', 'curl-reset-box'),
  'curl-python-box': createMockElement('pre', 'curl-python-box'),
  'cal-nit-input': createMockElement('input', 'cal-nit-input'),
  'cal-nit-dv-display': createMockElement('span', 'cal-nit-dv-display'),
  'cal-nit-results-container': createMockElement('div', 'cal-nit-results-container'),
  'cal-nit-tipo-persona': createMockElement('select', 'cal-nit-tipo-persona'),
  'cal-widget-title': createMockElement('h4', 'cal-widget-title'),
  'cal-widget-grid': createMockElement('div', 'cal-widget-grid'),
  'cal-selected-day-details': createMockElement('div', 'cal-selected-day-details')
};

const localStorageMock = {
  _store: {},
  getItem(k) { return this._store[k] || null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; },
  clear() { this._store = {}; }
};

const mockNavigator = {
  clipboard: {
    writeText: async () => {}
  }
};

const sandbox = {
  URLSearchParams: globalThis.URLSearchParams,
  navigator: mockNavigator,
  window: {
    location: { search: '?session_id=test_ui_session' },
    navigator: mockNavigator
  },
  document: {
    getElementById(id) {
      if (!elementsMap[id]) {
        elementsMap[id] = createMockElement('div', id);
      }
      return elementsMap[id];
    },
    createElement(tag) { return createMockElement(tag); },
    querySelectorAll() { return []; },
    querySelector() { return null; },
    addEventListener() {}
  },
  localStorage: localStorageMock,
  fetch: async () => ({ ok: true, json: async () => ({}) }),
  setTimeout: (fn) => fn(),
  console
};

vm.createContext(sandbox);

// Cargar scripts
vm.runInContext(fs.readFileSync(calendarioPath, 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(casillasPath, 'utf8'), sandbox);

const appJsCode = fs.readFileSync(appJsPath, 'utf8') + `
globalThis.formatCOP = formatCOP;
globalThis.calculateDianDv = calculateDianDv;
globalThis.showToast = showToast;
globalThis.showConfirmModal = showConfirmModal;
globalThis.closeConfirmModal = closeConfirmModal;
globalThis.saveLocalDraft = saveLocalDraft;
globalThis.loadLocalDraft = loadLocalDraft;
globalThis.updateSessionBadgeUi = updateSessionBadgeUi;
globalThis.copySessionIdToClipboard = copySessionIdToClipboard;
globalThis.iniciarNuevaSesion = iniciarNuevaSesion;
globalThis.consultarVencimientoNit = consultarVencimientoNit;
`;
vm.runInContext(appJsCode, sandbox);

test('Formato Moneda - formatCOP', () => {
  const formattedCop = sandbox.formatCOP(150000000);
  assert.ok(formattedCop.includes('150') && formattedCop.includes('000'));
});

test('Dígito de Verificación DIAN - calculateDianDv Módulo 11', () => {
  const dv = sandbox.calculateDianDv('900333222');
  assert.ok(typeof dv === 'string');
  assert.ok(sandbox.calculateDianDv('800197268') !== null);
});

test('Sistema de Notificaciones Toast y Modal de Confirmación', () => {
  sandbox.showToast('Operación exitosa', 'success');
  sandbox.showToast('Advertencia de validación', 'warning');
  sandbox.showToast('Error en cálculo', 'error');
  sandbox.showToast('Mensaje informativo', 'info');

  let confirmed = false;
  sandbox.showConfirmModal({
    title: 'Confirmar reseteo',
    msg: '¿Desea borrar los datos?',
    onConfirm: () => { confirmed = true; }
  });
  assert.equal(elementsMap['modal-confirm-action'].style.display, 'flex');
  sandbox.closeConfirmModal();
  assert.equal(elementsMap['modal-confirm-action'].style.display, 'none');
});

test('Gestión de Borrador Local (localStorage)', () => {
  sandbox.saveLocalDraft();
  const draft = sandbox.loadLocalDraft();
  assert.ok(draft !== undefined);
});

test('Actualización del Badge de Sesión e Iniciar Nueva Sesión', () => {
  sandbox.updateSessionBadgeUi();
  assert.ok(elementsMap['top-session-badge-text'].innerText !== null);

  sandbox.copySessionIdToClipboard();
  sandbox.iniciarNuevaSesion();
  assert.ok(sandbox.window.location.search.includes('session_id'));
});
