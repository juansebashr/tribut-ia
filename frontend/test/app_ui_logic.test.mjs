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
  'cal-selected-day-details': createMockElement('div', 'cal-selected-day-details'),
  'reconciliation-table-tbody': createMockElement('tbody', 'reconciliation-table-tbody'),
  'reconciliation-error-box': createMockElement('div', 'reconciliation-error-box'),
  'reconciliation-error-title': createMockElement('h4', 'reconciliation-error-title'),
  'reconciliation-error-list': createMockElement('div', 'reconciliation-error-list'),
  'reconcile-filter-cedula': createMockElement('select', 'reconcile-filter-cedula'),
  'reconcile-filter-estado': createMockElement('select', 'reconcile-filter-estado'),
  'reconcile-search-input': createMockElement('input', 'reconcile-search-input'),
  'reconcile-rows-count-badge': createMockElement('span', 'reconcile-rows-count-badge'),
  'reconcile-kpi-total-trx': createMockElement('span', 'reconcile-kpi-total-trx'),
  'reconcile-kpi-total-cop': createMockElement('span', 'reconcile-kpi-total-cop'),
  'reconcile-kpi-match-count': createMockElement('span', 'reconcile-kpi-match-count'),
  'reconcile-kpi-match-pct': createMockElement('span', 'reconcile-kpi-match-pct'),
  'reconcile-kpi-diff-count': createMockElement('span', 'reconcile-kpi-diff-count'),
  'reconcile-kpi-alert-count': createMockElement('span', 'reconcile-kpi-alert-count'),
  'modal-reconciliation-detail': createMockElement('div', 'modal-reconciliation-detail'),
  'reconcile-detail-title': createMockElement('h3', 'reconcile-detail-title'),
  'reconcile-detail-subtitle': createMockElement('span', 'reconcile-detail-subtitle'),
  'reconcile-detail-tercero': createMockElement('strong', 'reconcile-detail-tercero'),
  'reconcile-detail-nit': createMockElement('span', 'reconcile-detail-nit'),
  'reconcile-detail-archivo': createMockElement('span', 'reconcile-detail-archivo'),
  'reconcile-detail-fecha': createMockElement('span', 'reconcile-detail-fecha'),
  'reconcile-detail-val-declarado': createMockElement('strong', 'reconcile-detail-val-declarado'),
  'reconcile-detail-val-exogena': createMockElement('strong', 'reconcile-detail-val-exogena'),
  'reconcile-detail-casilla-badge': createMockElement('span', 'reconcile-detail-casilla-badge'),
  'reconcile-detail-explicacion': createMockElement('p', 'reconcile-detail-explicacion'),
  'reconcile-detail-norma': createMockElement('div', 'reconcile-detail-norma')
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
    navigator: mockNavigator,
    addEventListener: () => {},
    innerWidth: 1200
  },
  document: {
    documentElement: createMockElement('html'),
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
  fetch: async () => ({
    ok: true,
    json: async () => ({
      valid: true,
      kpis: {
        total_transacciones: 2,
        total_declarado_cop: 25000000,
        total_exogena_cop: 25000000,
        total_conciliado_match: 2,
        total_diferencias_justificadas: 0,
        total_solo_certificados: 0,
        total_discrepancias_alerta: 0,
        porcentaje_conciliacion: 100.0
      },
      items: [
        {
          id: '1',
          fecha: '2026-01-30',
          archivo_origen: 'Cert_220.pdf',
          tercero_nombre: 'EMPRESA SAS',
          tercero_nit: '900123456-1',
          descripcion: 'Salarios devengados',
          tipo_movimiento: 'INGRESO',
          valor_cop: 20000000,
          cedula_destino: 'TRABAJO',
          concepto_tributario: 'SALARIO',
          beneficio_asociado: 'Art. 103 E.T.',
          estado_exogena: 'MATCH_EXACTO',
          valor_exogena_cop: 20000000,
          diferencia_exogena_cop: 0,
          casilla_f210_sugerida: 'Casilla 32 (Ingresos Brutos de Trabajo)',
          explicacion_didactica: 'Conciliado al 100%'
        },
        {
          id: '2',
          fecha: '2026-02-15',
          archivo_origen: 'Cert_Salud.pdf',
          tercero_nombre: 'ENTIDAD PROMOTORA DE SALUD DEMO EPS',
          tercero_nit: '800111222-3',
          descripcion: 'Aportes salud',
          tipo_movimiento: 'EGRESO',
          valor_cop: 5000000,
          cedula_destino: 'TRABAJO',
          concepto_tributario: 'INCRNGO_SALUD',
          beneficio_asociado: 'Art. 56 E.T.',
          estado_exogena: 'MATCH_EXACTO',
          valor_exogena_cop: 5000000,
          diferencia_exogena_cop: 0,
          casilla_f210_sugerida: 'Casilla 34 (INCRNGO Trabajo)',
          explicacion_didactica: 'Conciliado al 100%'
        }
      ]
    })
  }),
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
globalThis.renderReconciliationSpreadsheet = renderReconciliationSpreadsheet;
globalThis.loadReconciliationDemo = loadReconciliationDemo;
globalThis.filterReconciliationGrid = filterReconciliationGrid;
globalThis.openReconciliationRowDetail = openReconciliationRowDetail;
globalThis.closeReconciliationDetailModal = closeReconciliationDetailModal;
globalThis.clearReconciliationView = clearReconciliationView;
globalThis.displayCsvValidationErrors = displayCsvValidationErrors;
globalThis.hideReconciliationErrors = hideReconciliationErrors;
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

test('Reconciliación CSV - Carga de Demo y Renderizado Spreadsheet', async () => {
  await sandbox.loadReconciliationDemo();
  assert.equal(elementsMap['reconcile-kpi-total-trx'].innerText, 2);
  assert.ok(elementsMap['reconciliation-table-tbody'].innerHTML.includes('EMPRESA'));
});

test('Reconciliación CSV - Filtrado y Búsqueda en Grid', async () => {
  await sandbox.loadReconciliationDemo();
  elementsMap['reconcile-search-input'].value = 'SALUD';
  sandbox.filterReconciliationGrid();
  assert.ok(elementsMap['reconciliation-table-tbody'].innerHTML.includes('SALUD'));
});

test('Reconciliación CSV - Auditoría Didáctica por Fila (Modal)', async () => {
  await sandbox.loadReconciliationDemo();
  sandbox.openReconciliationRowDetail('1');
  assert.equal(elementsMap['modal-reconciliation-detail'].style.display, 'flex');
  assert.ok(elementsMap['reconcile-detail-tercero'].innerText.includes('EMPRESA'));
  
  sandbox.closeReconciliationDetailModal();
  assert.equal(elementsMap['modal-reconciliation-detail'].style.display, 'none');
});

test('Reconciliación CSV - Visualización de Errores de Validación', () => {
  sandbox.displayCsvValidationErrors([
    { row: 3, column: 'valor_cop', error: 'Valor numérico inválido', value: 'cien' }
  ], 'Errores de validación');
  assert.equal(elementsMap['reconciliation-error-box'].style.display, 'block');
  assert.ok(elementsMap['reconciliation-error-list'].innerHTML.includes('Fila 3'));

  sandbox.hideReconciliationErrors();
  assert.equal(elementsMap['reconciliation-error-box'].style.display, 'none');
});

test('Reconciliación CSV - Limpiar Visualización', () => {
  sandbox.clearReconciliationView();
  assert.equal(elementsMap['reconcile-kpi-total-trx'].innerText, '0');
  assert.ok(elementsMap['reconciliation-table-tbody'].innerHTML.includes('No hay archivo CSV cargado'));
});
