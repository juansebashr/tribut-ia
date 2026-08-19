import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const calendarioPath = path.resolve(import.meta.dirname, '../../backend/app/static/calendario_data.js');
const casillasPath = path.resolve(import.meta.dirname, '../../backend/app/static/casillas_info.js');

const sandbox = {
  console,
  URLSearchParams: globalThis.URLSearchParams
};
vm.createContext(sandbox);

const calendarioCode = fs.readFileSync(calendarioPath, 'utf8') + `
globalThis.DIAN_2026_RENTA_PN = DIAN_2026_RENTA_PN;
globalThis.DIAN_2026_RENTA_PJ = DIAN_2026_RENTA_PJ;
globalThis.DIAN_2026_IVA_BIMESTRES = DIAN_2026_IVA_BIMESTRES;
globalThis.DIAN_2026_RETEFUENTE_PERIODOS = DIAN_2026_RETEFUENTE_PERIODOS;
globalThis.DIAN_2026_SIMPLE_ANUAL = DIAN_2026_SIMPLE_ANUAL;
globalThis.getEventosCalendarioMes = getEventosCalendarioMes;
`;
vm.runInContext(calendarioCode, sandbox);

const casillasCode = fs.readFileSync(casillasPath, 'utf8') + `
globalThis.CASILLAS_INFO = CASILLAS_INFO;
`;
vm.runInContext(casillasCode, sandbox);

test('Calendario Tributario 2026 - Tablas Oficiales DIAN', () => {
  assert.ok(Array.isArray(sandbox.DIAN_2026_RENTA_PN));
  assert.equal(sandbox.DIAN_2026_RENTA_PN.length, 50, 'Renta PN debe tener exactamente 50 plazos');
  
  // Primer plazo: 12 Agosto (01-02)
  assert.equal(sandbox.DIAN_2026_RENTA_PN[0].fecha, '2026-08-12');
  assert.equal(sandbox.DIAN_2026_RENTA_PN[0].digitos, '01 - 02');

  // Último plazo: 26 Octubre (99-00)
  assert.equal(sandbox.DIAN_2026_RENTA_PN[49].fecha, '2026-10-26');
  assert.equal(sandbox.DIAN_2026_RENTA_PN[49].digitos, '99 - 00');
});

test('Calendario Tributario 2026 - Renta PJ Cuotas (20 plazos)', () => {
  assert.ok(Array.isArray(sandbox.DIAN_2026_RENTA_PJ));
  assert.equal(sandbox.DIAN_2026_RENTA_PJ.length, 20);
});

test('Calendario Tributario 2026 - Retefuente y Bimestres IVA', () => {
  assert.ok(Array.isArray(sandbox.DIAN_2026_RETEFUENTE_PERIODOS));
  assert.ok(Array.isArray(sandbox.DIAN_2026_IVA_BIMESTRES));
  assert.ok(Array.isArray(sandbox.DIAN_2026_SIMPLE_ANUAL));
});

test('Calendario Tributario 2026 - Función getEventosCalendarioMes para todos los meses', () => {
  for (let m = 1; m <= 12; m++) {
    const eventos = sandbox.getEventosCalendarioMes(2026, m);
    assert.ok(Array.isArray(eventos), `Mes ${m} debe retornar un array`);
  }
  // Agosto debe tener eventos de Renta PN
  const evAgosto = sandbox.getEventosCalendarioMes(2026, 8);
  assert.ok(evAgosto.some(e => e.tipo === 'renta_pn'));
});

test('Casillas F210 & F110 - Diccionario de Información Tributaria', () => {
  assert.ok(sandbox.CASILLAS_INFO);
  const casillasEsperadas = ['1', '4', '5', '6', '7', '28', '29', '30', '32', '42', '56', '72', '78', '89', '97', '112', '134'];
  for (const c of casillasEsperadas) {
    assert.ok(sandbox.CASILLAS_INFO[c], `Casilla ${c} debe existir en CASILLAS_INFO`);
    assert.ok(sandbox.CASILLAS_INFO[c].titulo, `Casilla ${c} debe tener título`);
    assert.ok(sandbox.CASILLAS_INFO[c].art, `Casilla ${c} debe tener artículo estatutario`);
    assert.ok(sandbox.CASILLAS_INFO[c].concepto, `Casilla ${c} debe tener concepto`);
  }
});
