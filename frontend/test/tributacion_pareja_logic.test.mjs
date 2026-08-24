import test from 'node:test';
import assert from 'node:assert/strict';

test('Tributación en Pareja - Principio de Individualidad Fiscal (Art. 8 E.T.)', () => {
  // En Colombia no existen declaraciones conjuntas
  const conyuges = [
    { nombre: 'Cónyuge A', esDeclaranteIndependiente: true },
    { nombre: 'Cónyuge B', esDeclaranteIndependiente: true },
  ];
  assert.equal(conyuges.length, 2);
  assert.ok(conyuges[0].esDeclaranteIndependiente);
  assert.ok(conyuges[1].esDeclaranteIndependiente);
});

test('Tributación en Pareja - Distribución 50/50 y Tramos del 0% (Art. 241 E.T.)', () => {
  const uvt = 52350;
  const tramoCeroUvt = 1090;
  const tramoCeroCopIndividual = tramoCeroUvt * uvt; // 57.061.500 COP

  // Dos cónyuges con rentas distribuidas aprovechan el doble de tramo exento
  const tramoCeroFamiliarCombinado = tramoCeroCopIndividual * 2;
  assert.equal(tramoCeroFamiliarCombinado, 114123000);
});

test('Tributación en Pareja - Reglas de Mutuo y Comparación Patrimonial (Art. 236 y 283 E.T.)', () => {
  const valorInmueble = 400000000;
  const ingresoConyugeB = 20000000;

  // Si no hay mutuo ni copropiedad -> Riesgo de desajuste
  const desajusteSinFondos = valorInmueble - ingresoConyugeB;
  assert.equal(desajusteSinFondos, 380000000);

  // Con contrato de mutuo con fecha cierta: Pasivo respalda el activo
  const pasivoMutuo = valorInmueble;
  const patrimonioLiquidoConyugeB = valorInmueble - pasivoMutuo; // PL = 0 (Sin variación no justificada)
  assert.equal(patrimonioLiquidoConyugeB, 0);
});

test('Tributación en Pareja - Gananciales en Liquidación de Sociedad Conyugal (Art. 47 E.T.)', () => {
  // Los gananciales son 100% INCRNGO
  const ganancialesRecibidos = 500000000;
  const esIncRngo = true;
  const impuestoRentaGananciales = esIncRngo ? 0 : ganancialesRecibidos * 0.15;
  assert.equal(impuestoRentaGananciales, 0);
});
