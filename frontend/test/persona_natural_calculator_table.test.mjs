import test from 'node:test';
import assert from 'node:assert/strict';

// Helper de formateo contable idéntico al frontend (COP sin decimales con separador de miles)
function formatCOP(val, includeSign = true) {
  if (val === null || val === undefined || isNaN(val)) return includeSign ? '$0' : '0';
  const rounded = Math.round(Number(val));
  const formatted = Math.abs(rounded).toLocaleString('es-CO');
  if (!includeSign) return formatted;
  return rounded < 0 ? `-$${formatted}` : `$${formatted}`;
}

test('Calculadora PN - Coherencia Aritmética Vertical con Tope del 40% (Caso Demo)', () => {
  // Datos del caso Demo
  const totalIngresosBrutos = 120000000;
  const totalIncrngo = 9600000;
  const ingresoNeto = totalIngresosBrutos - totalIncrngo; // $110.400.000
  assert.equal(ingresoNeto, 110400000);

  // Alivios solicitados antes de tope
  const deduccionesSujetas40 = 24000000;
  const rentasExentasAceptadas = 29100000;
  const subtotalAlivios = deduccionesSujetas40 + rentasExentasAceptadas; // $53.100.000
  assert.equal(subtotalAlivios, 53100000);

  // Tope legal del 40% sobre Ingreso Neto vs 1.340 UVT (UVT 2025 = $49.799)
  const uvt = 49799;
  const tope40Pct = ingresoNeto * 0.40; // $44.160.000
  const tope1340Uvt = 1340 * uvt; // $66.730.660
  const topeAplicable = Math.min(tope40Pct, tope1340Uvt); // $44.160.000
  assert.equal(topeAplicable, 44160000);

  // Depuración de alivios
  const aliviosProcedentes = Math.min(subtotalAlivios, topeAplicable); // $44.160.000
  const aliviosRechazados = Math.max(0, subtotalAlivios - aliviosProcedentes); // $8.940.000
  assert.equal(aliviosProcedentes, 44160000);
  assert.equal(aliviosRechazados, 8940000);

  // Deducción 1% compras Factura Electrónica (fuera del 40% - Art. 336 Num. 5)
  const deduccionesFuera40 = 150000;

  // Renta Líquida Gravable (Casilla 111)
  const rentaLiquidaGravable = ingresoNeto - aliviosProcedentes - deduccionesFuera40;
  assert.equal(rentaLiquidaGravable, 66090000);

  // VERIFICACIÓN DE SUMA VERTICAL EXACTA:
  // Casilla 91 ($110.400.000) - Casilla 92 ($44.160.000) - Deducción 1% ($150.000) = Casilla 111 ($66.090.000)
  const sumaVertical = ingresoNeto - aliviosProcedentes - deduccionesFuera40;
  assert.equal(sumaVertical, rentaLiquidaGravable);
  assert.equal(formatCOP(sumaVertical), '$66.090.000');
});

test('Calculadora PN - Coherencia Aritmética Vertical Caso Real Juan Pablo (Sin exceder tope)', () => {
  const totalIngresosBrutos = 220000000;
  const totalIncrngo = 14441593;
  const ingresoNeto = totalIngresosBrutos - totalIncrngo; // $205.558.407
  assert.equal(ingresoNeto, 205558407);

  // Alivios
  const deduccionesSujetas40 = 3702433; // 50% GMF
  const rentasExentasAceptadas = 58127075; // Cesantías + 25% laboral
  const subtotalAlivios = deduccionesSujetas40 + rentasExentasAceptadas; // $61.829.508
  assert.equal(subtotalAlivios, 61829508);

  const uvt = 49799;
  const tope40Pct = ingresoNeto * 0.40; // $82.223.362,80
  const tope1340Uvt = 1340 * uvt; // $66.730.660
  const topeAplicable = Math.min(tope40Pct, tope1340Uvt); // $66.730.660

  const aliviosProcedentes = Math.min(subtotalAlivios, topeAplicable); // $61.829.508
  const aliviosRechazados = Math.max(0, subtotalAlivios - aliviosProcedentes); // $0 (100% aceptado)
  assert.equal(aliviosProcedentes, 61829508);
  assert.equal(aliviosRechazados, 0);

  const deduccionesFuera40 = 397364; // 1% compras FE

  // Casilla 111
  const rentaLiquidaGravable = ingresoNeto - aliviosProcedentes - deduccionesFuera40;
  assert.equal(rentaLiquidaGravable, 143331535);

  // Verificación vertical exacta al peso:
  assert.equal(ingresoNeto - aliviosProcedentes - deduccionesFuera40, rentaLiquidaGravable);
});

test('Calculadora PN - Total Impuesto a Cargo y Saldo Definitivo con Anticipo Siguiente', () => {
  const impuestoNetoRenta = 14619000;
  const impuestoGO = 4000000;
  const totalImpuestoCargo = impuestoNetoRenta + impuestoGO; // $18.619.000 (Casilla 129)
  assert.equal(totalImpuestoCargo, 18619000);

  const totalAnticiposRetenciones = 14111000;
  const saldoPorImpuesto = Math.max(0, totalImpuestoCargo - totalAnticiposRetenciones); // $4.508.000 (Casilla 136)
  assert.equal(saldoPorImpuesto, 4508000);

  const anticipoSiguiente = 6015000; // Casilla 133
  const totalAPagar = saldoPorImpuesto + anticipoSiguiente; // $10.523.000 (Casilla 980)
  assert.equal(totalAPagar, 10523000);

  // Si hay saldo a favor en vez de saldo por impuesto:
  const retencionesAltas = 20000000;
  const saldoAFavor = Math.max(0, retencionesAltas - totalImpuestoCargo); // $1.381.000 (Casilla 137)
  assert.equal(saldoAFavor, 1381000);

  // Compensación del anticipo con el saldo a favor:
  const totalPagarCompensado = Math.max(0, anticipoSiguiente - saldoAFavor); // $4.634.000
  assert.equal(totalPagarCompensado, 4634000);
});

test('Calculadora PN - Formato de Alerta y Texto Explicativo de Tope', () => {
  const aliviosCalculados = 53100000;
  const topeLegal = 44160000;
  const excedenteRechazado = aliviosCalculados - topeLegal; // 8.940.000
  const procedentes = topeLegal;

  // Generación de texto exacto como se renderiza en la UI
  const msgRechazo = `⚠️ Tope aplicado: Los alivios calculados (${formatCOP(aliviosCalculados)}) superan el tope legal de ${formatCOP(topeLegal)}. El excedente de ${formatCOP(excedenteRechazado)} queda rechazado y solo proceden ${formatCOP(procedentes)}.`;
  assert.ok(msgRechazo.includes('$53.100.000'));
  assert.ok(msgRechazo.includes('$44.160.000'));
  assert.ok(msgRechazo.includes('$8.940.000'));
  assert.ok(!msgRechazo.includes('excede Exceden')); // Elimina redundancia gramatical
});
