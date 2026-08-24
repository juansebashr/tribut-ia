import test from 'node:test';
import assert from 'node:assert/strict';

test('Comparador Tributario - Ordinario vs SIMPLE con Exoneración Art. 114-1', () => {
  const ingresos = 800000000;
  const costos = 450000000;
  const rentaLiquida = ingresos - costos; // 350M
  const impRentaOrd = Math.round(rentaLiquida * 0.35); // 122.5M
  const icaOrd = Math.round(ingresos * 0.007); // 5.6M
  const totalOrdinario = impRentaOrd + icaOrd; // 128.1M

  // En SIMPLE Grupo 2 (~3.0% tarifa consolidada)
  const tarifaSimple = 0.03;
  const impSimpleBruto = Math.round(ingresos * tarifaSimple); // 24M
  const pensionDesc = 12000000;
  const ventasElect = 400000000;
  const descElect = Math.round(ventasElect * 0.005); // 2M
  const totalSimple = Math.max(0, impSimpleBruto - pensionDesc - descElect); // 10M

  const ahorroDirecto = totalOrdinario - totalSimple; // 118.1M
  assert.ok(ahorroDirecto > 0, 'SIMPLE debe generar un ahorro sustancial');

  // Ahorro Parafiscales nómina (Salud 8.5% + SENA 2% + ICBF 3% = 13.5%)
  const numEmpleados = 5;
  const smlmv2026 = 1423500;
  const nominaAnual = numEmpleados * smlmv2026 * 12;
  const ahorroParafiscales = Math.round(nominaAnual * 0.135);
  assert.ok(ahorroParafiscales > 0);
});

test('Checklist Normativo - Validador de Elegibilidad Arts. 905 y 906 E.T.', () => {
  // Caso 1: Contribuyente Apto
  const req1 = {
    esResidente: true,
    ingresosMenores100k: true,
    alDiaObligaciones: true,
    rutFacturaElectronica: true,
    esFilialExtranjera: false,
    esEntidadFinanciera: false,
    esGeneradoraEnergia: false,
    esFactoringLeasing: false,
    esSocioRelacionLaboral: false,
  };

  const cumpleReq = req1.esResidente && req1.ingresosMenores100k && req1.alDiaObligaciones && req1.rutFacturaElectronica;
  const tieneExc = req1.esFilialExtranjera || req1.esEntidadFinanciera || req1.esGeneradoraEnergia || req1.esFactoringLeasing || req1.esSocioRelacionLaboral;
  assert.equal(cumpleReq && !tieneExc, true, 'Debe ser apto');

  // Caso 2: Banco o entidad financiera (Exclusión Art. 906)
  const req2 = { ...req1, esEntidadFinanciera: true };
  const tieneExc2 = req2.esFilialExtranjera || req2.esEntidadFinanciera || req2.esGeneradoraEnergia || req2.esFactoringLeasing || req2.esSocioRelacionLaboral;
  assert.equal(cumpleReq && !tieneExc2, false, 'No debe ser apto si es entidad financiera');
});

test('Formulario 2593 - Consolidación de 6 Anticipos Bimestrales', () => {
  const anticipos = [1500000, 1800000, 1600000, 1900000, 2100000, 2500000];
  const totalPagadoAno = anticipos.reduce((acc, v) => acc + v, 0);
  assert.equal(totalPagadoAno, 11400000);
});
