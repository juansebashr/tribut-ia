import test from 'node:test';
import assert from 'node:assert/strict';

import { CASILLAS_INFO_F350, CASILLAS_INFO_F300 } from '../src/constants/casillas_info.ts';
import { formatCOP, parseCOP } from '../src/utils/formatters.ts';

test('Formulario 350 - Diccionario de Casillas Oficiales DIAN', () => {
  assert.ok(CASILLAS_INFO_F350['28'], 'Casilla 28 de rentas de trabajo debe existir');
  assert.ok(CASILLAS_INFO_F350['42'], 'Casilla 42 de retención rentas de trabajo debe existir');
  assert.ok(CASILLAS_INFO_F350['61'], 'Casilla 61 de base autorretención especial debe existir');
  assert.ok(CASILLAS_INFO_F350['62'], 'Casilla 62 de autorretención especial D. 2201 debe existir');
  assert.ok(CASILLAS_INFO_F350['68'], 'Casilla 68 de ReteIVA 15% debe existir');
  assert.ok(CASILLAS_INFO_F350['84'], 'Casilla 84 de total saldo a pagar debe existir');
  assert.match(CASILLAS_INFO_F350['84'].art, /580-1/);
});

test('Formulario 300 - Diccionario de Casillas Oficiales DIAN', () => {
  assert.ok(CASILLAS_INFO_F300['27'], 'Casilla 27 bienes al 5% debe existir');
  assert.ok(CASILLAS_INFO_F300['28'], 'Casilla 28 bienes al 19% debe existir');
  assert.ok(CASILLAS_INFO_F300['37'], 'Casilla 37 excluidos debe existir');
  assert.ok(CASILLAS_INFO_F300['58'], 'Casilla 58 total IVA generado debe existir');
  assert.ok(CASILLAS_INFO_F300['90'], 'Casilla 90 prorrateo Art. 490 debe existir');
  assert.ok(CASILLAS_INFO_F300['96'], 'Casilla 96 total IVA descontable debe existir');
  assert.ok(CASILLAS_INFO_F300['105'], 'Casilla 105 total saldo a pagar debe existir');
  assert.ok(CASILLAS_INFO_F300['106'], 'Casilla 106 total saldo a favor debe existir');
});

test('Retención en la Fuente - Depuración Laboral Art. 383', () => {
  const salario = 10000000;
  const salud = 400000;
  const pension = 400000;
  const ingresoNeto = salario - (salud + pension);
  assert.equal(ingresoNeto, 9200000);

  // 25% exenta antes de topes
  const exenta25 = ingresoNeto * 0.25;
  assert.equal(exenta25, 2300000);

  // Formato COP
  assert.equal(formatCOP(ingresoNeto), "$9'200.000");
  assert.equal(parseCOP("$9'200.000"), 9200000);
});

test('IVA - Cálculo Prorrateo Art. 490 E.T.', () => {
  const gravadas = 60000000;
  const exentas = 20000000;
  const excluidas = 20000000;
  const total = gravadas + exentas + excluidas;
  assert.equal(total, 100000000);

  const conDerecho = gravadas + exentas;
  const factor = conDerecho / total; // 80%
  assert.equal(factor, 0.8);

  const ivaComun = 10000000;
  const ivaDescontable = Math.round(ivaComun * factor); // 8.000.000
  const ivaMayorCostoRenta = Math.round(ivaComun * (1 - factor)); // 2.000.000

  assert.equal(ivaDescontable, 8000000);
  assert.equal(ivaMayorCostoRenta, 2000000);
});
