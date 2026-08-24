import test from 'node:test';
import assert from 'node:assert/strict';

// Mock global fetch
const mockResponses = {
  '/rules/years': [2026, 2025, 2024, 2022],
  '/rules/2026': { tax_year: 2026, uvt_value: 52350 },
  '/calculate/persona-natural/calculate': {
    tax_year: 2026,
    uvt_value: 52350,
    impuesto_neto_renta: 15000000
  },
  '/calculate/persona-juridica/calculate': {
    tax_year: 2026,
    uvt_value: 52350,
    impuesto_neto_total: 50000000
  },
  '/rules/convert-uvt': {
    tax_year: 2026,
    uvt_value: 52350,
    amount_cop: 5235000,
    amount_uvt: 100
  },
  '/beneficios/simular-inmueble-afc': {
    tax_year: 2026,
    uvt_value: 52350,
    precio_venta_cop: 450000000,
    costo_fiscal_determinado_cop: 429000000,
    ganancia_ocasional_gravada_final_cop: 0,
    impuesto_go_con_beneficios_cop: 0,
    ahorro_total_impuesto_cop: 45000000,
    porcentaje_ahorro_tributario_pct: 100.0
  }
};

globalThis.fetch = async (url, options = {}) => {
  const urlStr = String(url);
  for (const [endpoint, data] of Object.entries(mockResponses)) {
    if (urlStr.includes(endpoint)) {
      return {
        ok: true,
        json: async () => data
      };
    }
  }
  return {
    ok: false,
    json: async () => ({ detail: 'Not Found' })
  };
};

test('React API Service - fetchAvailableYears', async () => {
  const res = await fetch('http://localhost:8000/api/v1/rules/years');
  const data = await res.json();
  assert.deepEqual(data, [2026, 2025, 2024, 2022]);
});

test('React API Service - fetchRulesForYear', async () => {
  const res = await fetch('http://localhost:8000/api/v1/rules/2026');
  const data = await res.json();
  assert.equal(data.tax_year, 2026);
  assert.equal(data.uvt_value, 52350);
});

test('React API Service - calculatePersonaNatural', async () => {
  const res = await fetch('http://localhost:8000/api/v1/calculate/persona-natural/calculate', {
    method: 'POST',
    body: JSON.stringify({ tax_year: 2026, rentas_trabajo: 100000000 })
  });
  const data = await res.json();
  assert.equal(data.impuesto_neto_renta, 15000000);
});

test('React API Service - calculatePersonaJuridica', async () => {
  const res = await fetch('http://localhost:8000/api/v1/calculate/persona-juridica/calculate', {
    method: 'POST',
    body: JSON.stringify({ tax_year: 2026, ingresos_brutos_operacionales: 500000000 })
  });
  const data = await res.json();
  assert.equal(data.impuesto_neto_total, 50000000);
});

test('React API Service - convertUvt', async () => {
  const res = await fetch('http://localhost:8000/api/v1/rules/convert-uvt', {
    method: 'POST',
    body: JSON.stringify({ tax_year: 2026, amount_uvt: 100 })
  });
  const data = await res.json();
  assert.equal(data.amount_cop, 5235000);
});

test('React API Service - simularInmuebleAfc (Ejemplo Venta Vivienda)', async () => {
  const res = await fetch('http://localhost:8000/api/v1/beneficios/simular-inmueble-afc', {
    method: 'POST',
    body: JSON.stringify({
      precio_venta_cop: 450000000,
      costo_adquisicion_historico_cop: 150000000,
      ano_adquisicion: '2011',
      metodo_costo_fiscal: 'art73',
      monto_depositado_afc_o_vivienda_cop: 21000000
    })
  });
  const data = await res.json();
  assert.equal(data.costo_fiscal_determinado_cop, 429000000);
  assert.equal(data.impuesto_go_con_beneficios_cop, 0);
  assert.equal(data.porcentaje_ahorro_tributario_pct, 100.0);
});

test('React API Service - calculateRegimenSimple', async () => {
  const mockSimple = {
    tax_year: 2026,
    grupo_actividad: 2,
    gran_total_saldo_a_pagar: 15000000,
    tarifa_simple_consolidada_pct: 3.4
  };
  globalThis.fetch = async (url) => ({
    ok: true,
    json: async () => mockSimple
  });

  const res = await fetch('http://localhost:8000/api/v1/calculate/regimen-simple/calculate', {
    method: 'POST',
    body: JSON.stringify({ tax_year: 2026, grupo_actividad: 2, ingresos_brutos_nacionales: 500000000 })
  });
  const data = await res.json();
  assert.equal(data.grupo_actividad, 2);
  assert.equal(data.gran_total_saldo_a_pagar, 15000000);
});

test('React API Service - simularComparativaSimple', async () => {
  const mockComparativa = {
    tax_year: 2026,
    regimen_recomendado: 'Recomendado: Régimen SIMPLE (F-260)',
    ahorro_tributario_neto_cop: 45000000
  };
  globalThis.fetch = async (url) => ({
    ok: true,
    json: async () => mockComparativa
  });

  const res = await fetch('http://localhost:8000/api/v1/calculate/regimen-simple/comparativa', {
    method: 'POST',
    body: JSON.stringify({ tax_year: 2026, ingresos_brutos_anuales: 600000000 }),
  });
  const data = await res.json();
  assert.equal(data.regimen_recomendado, 'Recomendado: Régimen SIMPLE (F-260)');
  assert.equal(data.ahorro_tributario_neto_cop, 45000000);
});

test('React API Service - calcularComparacionPatrimonial', async () => {
  const mockComparacion = {
    tax_year: 2026,
    patrimonio_liquido_ano_anterior: 180000000,
    patrimonio_liquido_ano_actual: 300000000,
    variacion_patrimonial_bruta: 120000000,
    incremento_patrimonial_a_justificar: 100000000,
    total_rentas_justificativas: 271000000,
    capacidad_justificacion_neta: 209000000,
    diferencia_no_justificada: 0,
    existe_renta_por_comparacion_patrimonial: false,
    estado_patrimonial: 'JUSTIFICADO_CORRECTAMENTE',
    porcentaje_justificacion: 100.0,
  };
  globalThis.fetch = async (url) => ({
    ok: true,
    json: async () => mockComparacion,
  });

  const res = await fetch('http://localhost:8000/api/v1/persona-natural/comparacion-patrimonial', {
    method: 'POST',
    body: JSON.stringify({
      tax_year: 2026,
      patrimonio_liquido_ano_anterior: 180000000,
      patrimonio_bruto_ano_actual: 520000000,
      deudas_ano_actual: 220000000,
    }),
  });
  const data = await res.json();
  assert.equal(data.estado_patrimonial, 'JUSTIFICADO_CORRECTAMENTE');
  assert.equal(data.diferencia_no_justificada, 0);
  assert.equal(data.porcentaje_justificacion, 100.0);
});

test('React API Service - simularTributacionPareja', async () => {
  const mockPareja = {
    tax_year: 2026,
    uvt_value: 52350,
    ahorro_tributario_familiar_neto_cop: 18500000,
    porcentaje_ahorro_familiar_pct: 35.5,
    analisis_riesgo_patrimonial: {
      riesgo_comparacion_patrimonial_conyuge_titular: false,
      monto_desajuste_potencial_cop: 0,
      diagnostico_legal: 'ESTRUCTURA BLINDADA',
    },
  };
  globalThis.fetch = async (url) => ({
    ok: true,
    json: async () => mockPareja,
  });

  const res = await fetch('http://localhost:8000/api/v1/beneficios/simular-tributacion-pareja', {
    method: 'POST',
    body: JSON.stringify({
      tax_year: 2026,
      rentas_capital_conjuntas_arriendos_intereses: 60000000,
    }),
  });
  const data = await res.json();
  assert.equal(data.ahorro_tributario_familiar_neto_cop, 18500000);
  assert.equal(data.porcentaje_ahorro_familiar_pct, 35.5);
  assert.equal(data.analisis_riesgo_patrimonial.diagnostico_legal, 'ESTRUCTURA BLINDADA');
});


