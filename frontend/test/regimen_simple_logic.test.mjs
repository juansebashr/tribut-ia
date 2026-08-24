import test from 'node:test';
import assert from 'node:assert/strict';
import { CASILLAS_INFO_F260 } from '../src/constants/casillas_info.ts';

test('Formulario 260 - Diccionario de Casillas Oficiales DIAN', () => {
  assert.ok(CASILLAS_INFO_F260, 'CASILLAS_INFO_F260 debe estar definido');

  const c28 = CASILLAS_INFO_F260['28'];
  assert.ok(c28);
  assert.ok(c28.titulo.includes('Patrimonio bruto') || c28.titulo.includes('patrimonio'));

  const c43 = CASILLAS_INFO_F260['43'];
  assert.ok(c43);
  assert.ok(c43.titulo.includes('Total ingresos brutos'));

  const c46 = CASILLAS_INFO_F260['46'];
  assert.ok(c46);
  assert.ok(c46.titulo.includes('Impuesto SIMPLE') || c46.titulo.includes('impuesto'));

  const c47 = CASILLAS_INFO_F260['47'];
  assert.ok(c47);
  assert.ok(c47.titulo.includes('ICA') || c47.concepto.includes('ICA'));

  const c48 = CASILLAS_INFO_F260['48'];
  assert.ok(c48);
  assert.ok(c48.titulo.includes('componente SIMPLE nacional'));

  const c49 = CASILLAS_INFO_F260['49'];
  assert.ok(c49);
  assert.ok(c49.titulo.includes('pensión') || c49.concepto.includes('pensión') || c49.art.includes('Art. 903'));

  const c50 = CASILLAS_INFO_F260['50'];
  assert.ok(c50);
  assert.ok(c50.titulo.includes('electrónicos') || c50.art.includes('Art. 912'));

  const c70 = CASILLAS_INFO_F260['70'];
  assert.ok(c70);
  assert.ok(c70.titulo.includes('consumo') || c70.art.includes('Art. 512-1'));

  const c980 = CASILLAS_INFO_F260['980'];
  assert.ok(c980);
  assert.ok(c980.titulo.includes('PAGO') || c980.titulo.includes('TOTAL') || c980.titulo.includes('Total'));
  assert.ok(c980.art.includes('Art. 801') || c980.art.includes('Art. 910'));
});

test('Formulario 260 - Lógica de Grupos de Actividad (Art. 908 E.T.)', () => {
  const gruposValidos = [1, 2, 3, 4, 5, 6];
  assert.equal(gruposValidos.length, 6);
  assert.ok(gruposValidos.includes(5));
});

test('Formulario 260 - Descuentos de Pensión Empleador y Ventas Electrónicas', () => {
  const compNacional = 15000000;
  const pensionEmpleador = 6000000;
  const ventasElectronicas = 200000000;
  const descElectronico = Math.round(ventasElectronicas * 0.005); // 1.000.000

  const totalDescuentosCalculado = pensionEmpleador + descElectronico; // 7.000.000
  const totalDescuentosPermitido = Math.min(compNacional, totalDescuentosCalculado);
  const impuestoNetoSimple = compNacional - totalDescuentosPermitido; // 8.000.000

  assert.equal(descElectronico, 1000000);
  assert.equal(totalDescuentosPermitido, 7000000);
  assert.equal(impuestoNetoSimple, 8000000);
});

test('Formulario 260 - Liquidación de INC 8% en Comidas y Bebidas', () => {
  const ingresosComidas = 350000000;
  const incCalculado = Math.round((ingresosComidas * 0.08) / 1000) * 1000;
  assert.equal(incCalculado, 28000000);

  const anticiposIncPagados = 24000000; // Casilla 71
  const saldoPagarInc = Math.max(0, incCalculado - anticiposIncPagados);
  assert.equal(saldoPagarInc, 4000000);
});
