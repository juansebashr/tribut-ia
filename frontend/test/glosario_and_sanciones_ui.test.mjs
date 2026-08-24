import test from 'node:test';
import assert from 'node:assert/strict';

test('Glosario Tributario - Validación de Topes de Declaración (4.500 UVT y 1.400 UVT)', () => {
  const uvt2026 = 52350;
  const topePatrimonioCop = 4500 * uvt2026; // 235.575.000 COP
  const topeFlujosCop = 1400 * uvt2026;     // 73.290.000 COP

  assert.equal(topePatrimonioCop, 235575000);
  assert.equal(topeFlujosCop, 73290000);

  // Contribuyente con 80M de ingresos -> Obligado a declarar
  const ingresosPrueba = 80000000;
  const obligadoPorIngresos = ingresosPrueba >= topeFlujosCop;
  assert.ok(obligadoPorIngresos);
});

test('Régimen Sancionatorio - Sanción Mínima de 10 UVT (Art. 639 E.T.)', () => {
  const uvt2026 = 52350;
  const sancionMinima = 10 * uvt2026; // 523.500 COP
  assert.equal(sancionMinima, 523500);

  // Si la fórmula da 150.000 COP, se debe cobrar la mínima
  const calculoPequeno = 150000;
  const sancionFinal = Math.max(calculoPequeno, sancionMinima);
  assert.equal(sancionFinal, 523500);
});

test('Régimen Sancionatorio - Principio de Favorabilidad (Art. 640 E.T.)', () => {
  const sancionPlena = 2000000;

  // Reducción al 50% (2 años sin sanciones)
  const sancion50 = sancionPlena * 0.5;
  assert.equal(sancion50, 1000000);

  // Reducción al 75% (1 año sin sanciones)
  const sancion75 = sancionPlena * 0.75;
  assert.equal(sancion75, 1500000);
});

test('Beneficio de Auditoría - Metas de Incremento y Filtro 71 UVT (Art. 689-3 E.T.)', () => {
  const uvt2026 = 52350;
  const piso71UvtCop = 71 * uvt2026; // 3.716.850 COP
  assert.equal(piso71UvtCop, 3716850);

  const impuestoAnoAnterior = 10000000; // 10M (> 71 UVT)
  assert.ok(impuestoAnoAnterior >= piso71UvtCop);

  const meta6Meses = impuestoAnoAnterior * 1.35; // +35% -> 13.5M
  const meta12Meses = impuestoAnoAnterior * 1.25; // +25% -> 12.5M

  assert.equal(meta6Meses, 13500000);
  assert.equal(meta12Meses, 12500000);
});
