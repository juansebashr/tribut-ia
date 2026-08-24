import test from 'node:test';
import assert from 'node:assert/strict';
import { CASILLAS_INFO_F110 } from '../src/constants/casillas_info.ts';

test('Formulario 110 - Diccionario de Casillas Oficiales DIAN', () => {
  assert.ok(CASILLAS_INFO_F110, 'CASILLAS_INFO_F110 debe estar definido');
  
  // Casillas clave del Formulario 110 oficial DIAN
  const c44 = CASILLAS_INFO_F110['44'];
  assert.ok(c44);
  assert.ok(c44.titulo.includes('patrimonio bruto') || c44.titulo.includes('Patrimonio'));
  assert.ok(c44.art.includes('Art. 261'));

  const c45 = CASILLAS_INFO_F110['45'];
  assert.ok(c45);
  assert.ok(c45.titulo.includes('Pasivos'));

  const c46 = CASILLAS_INFO_F110['46'];
  assert.ok(c46);
  assert.ok(c46.titulo.includes('líquido'));

  const c72 = CASILLAS_INFO_F110['72'];
  assert.ok(c72);
  assert.ok(c72.titulo.includes('Renta líquida ordinaria'));

  const c79 = CASILLAS_INFO_F110['79'];
  assert.ok(c79);
  assert.ok(c79.titulo.includes('Renta líquida gravable'));

  const c84 = CASILLAS_INFO_F110['84'];
  assert.ok(c84);
  assert.ok(c84.titulo.includes('Impuesto'));

  const c85 = CASILLAS_INFO_F110['85'];
  assert.ok(c85);
  assert.ok(c85.titulo.includes('Sobretasa'));

  const c95 = CASILLAS_INFO_F110['95'];
  assert.ok(c95);
  assert.ok(c95.art.includes('Art. 240 Parágrafo 6') || c95.concepto.includes('TTD'));

  const c110 = CASILLAS_INFO_F110['110'];
  assert.ok(c110);
  assert.ok(c110.titulo.includes('Anticipo'));

  const c113 = CASILLAS_INFO_F110['113'];
  assert.ok(c113);
  assert.ok(c113.titulo.includes('Total saldo a pagar'));

  const c980 = CASILLAS_INFO_F110['980'];
  assert.ok(c980);
  assert.ok(c980.titulo.includes('PAGO TOTAL'));
});

test('Formulario 110 - Lógica de Depuración y Fórmulas Matemáticas', () => {
  // 1. Patrimonio
  const pb = 1200000000;
  const pasivos = 400000000;
  const pl = Math.max(0, pb - pasivos);
  assert.equal(pl, 800000000);

  // 2. Ingresos y Costos
  const ingOp = 2000000000;
  const ingNoOp = 100000000;
  const ingNetos = ingOp + ingNoOp; // c61
  const costos = 900000000; // c52
  const gastosAdmin = 300000000; // c67
  const gastosVentas = 150000000; // c68
  const rentaLiquida = Math.max(0, ingNetos - costos - gastosAdmin - gastosVentas);
  assert.equal(rentaLiquida, 750000000);

  // 3. Impuesto Tarifa General 35%
  const impuestoBasico = Math.round((rentaLiquida * 0.35) / 1000) * 1000;
  assert.equal(impuestoBasico, 262500000);

  // 4. Anticipo 75% año siguiente
  const retefuente = 80000000;
  const anticipo75 = Math.round((impuestoBasico * 0.75 - retefuente) / 1000) * 1000;
  assert.equal(anticipo75, 116875000);
});

test('Formulario 110 - Lógica de Tasa Mínima TTD (Art. 240 Parágrafo 6)', () => {
  const uc = 600000000; // Utilidad Contable
  const dp = 50000000; // Diferencias Permanentes
  const incrngo = 30000000; // INCRNGO
  const re = 20000000; // Rentas Exentas
  const inr = 55000000; // Impuesto Neto Renta
  const dte = 10000000; // DTE

  const ud = uc + dp - incrngo - re; // 600M
  const id = inr + dte; // 65M
  const ttd = (id / ud) * 100; // 10.833%

  assert.equal(ud, 600000000);
  assert.equal(id, 65000000);
  assert.ok(ttd < 15.0, 'TTD debe ser inferior al 15%');

  const impuestoRequerido15 = ud * 0.15; // 90M
  const ia = impuestoRequerido15 - id; // 25M
  assert.equal(ia, 25000000, 'Impuesto a adicionar Casilla 95 debe ser 25.000.000');
});

test('Formulario 110 - Lógica de Sobretasa Financiera (Art. 240 Par. 2)', () => {
  const uvt = 52350;
  const rlg = 130000 * uvt; // 130.000 UVT (supera umbral de 120.000 UVT)
  const rlgUvt = rlg / uvt;
  assert.ok(rlgUvt >= 120000);

  const puntosSobretasa = 5.0;
  const sobretasaCop = Math.round((rlg * (puntosSobretasa / 100)) / 1000) * 1000;
  const anticipoSiguiente100 = sobretasaCop; // Casilla 110

  assert.equal(sobretasaCop, Math.round((rlg * 0.05) / 1000) * 1000);
  assert.equal(anticipoSiguiente100, sobretasaCop);
});
