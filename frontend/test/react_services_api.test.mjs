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
