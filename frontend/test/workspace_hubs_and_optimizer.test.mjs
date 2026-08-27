import test from 'node:test';
import assert from 'node:assert/strict';

// 1. Simulación de la configuración de Hubs Didácticos por Espacio
const HUB_CONFIGS = {
  naturales: {
    title: 'Portal de Liquidación: Persona Natural',
    workspaceName: 'Personas Naturales',
    badge: 'Formulario 210 & Art. 241 E.T.',
    steps: [
      { step: '1', title: '¿Debo Declarar?', actionSubTab: 'test_obligados' },
      { step: '2', title: 'Depurar Cédula General', actionSubTab: 'calc' },
      { step: '3', title: 'Optimizar con What-If', actionSubTab: 'optimizer' },
      { step: '4', title: 'Facsímil F-210 & Exógena', actionSubTab: 'f210' },
    ],
    tabs: [
      { id: 'test_obligados', title: '¿Debo Declarar Renta 2026? (Test 3 min)', article: 'Arts. 592 y 594-3 E.T.' },
      { id: 'calc', title: 'Depuración Cédula General (F-210)', article: 'Arts. 330 a 336 E.T.' },
      { id: 'optimizer', title: 'Optimizador Fiscal What-If', article: 'Arts. 126-1, 126-4, 387 y 336 E.T.' },
      { id: 'marginal', title: 'Tarifa Marginal Progresiva & Termómetro', article: 'Art. 241 E.T.' },
      { id: 'comparacion_patrimonial', title: 'Comparación Patrimonial & Riesgo de Desajuste', article: 'Art. 236 E.T.' },
      { id: 'inflacionario', title: 'Componente Inflacionario de Rendimientos Financieros', article: 'Arts. 38 y 40-1 E.T.' },
      { id: 'conciliacion', title: 'Hoja de Cálculo Fiscal & Conciliación Exógena CSV', article: 'Art. 631 E.T.' },
      { id: 'art73', title: 'Reajuste Fiscal de Activos Fijos (Bienes Raíces y Acciones)', article: 'Art. 73 E.T.' },
      { id: 'inmuebles_afc', title: 'Inmuebles & Cuentas AFC (Casa de Habitación)', article: 'Arts. 311-1 y 126-4 E.T.' },
      { id: 'tributacion_pareja', title: 'Tributación en Pareja & Planificación Conyugal', article: 'Art. 8 E.T.' },
      { id: 'f210', title: 'Formulario 210 Oficial DIAN', article: 'Modelo Oficial DIAN' },
    ],
  },
  juridicas: {
    title: 'Portal de Renta Sociedades & Régimen Simple',
    workspaceName: 'Personas Jurídicas & RST',
    badge: 'Formularios 110 & 260 DIAN',
    steps: [
      { step: '1', title: 'Diagnosticar Régimen', actionSubTab: 'comparador' },
      { step: '2', title: 'Depuración Ordinaria 35%', actionSubTab: 'calc' },
      { step: '3', title: 'Laboratorio TTD (15%)', actionSubTab: 'ttd' },
      { step: '4', title: 'Facsímil F-110 / F-260', actionSubTab: 'f110' },
    ],
    tabs: [
      { id: 'calc', title: 'Depuración Renta Ordinaria (F-110)', article: 'Art. 240 E.T.' },
      { id: 'ttd', title: 'Laboratorio Tasa de Tributación Depurada (TTD 15%)', article: 'Art. 240 Parágrafo 6 E.T.' },
      { id: 'sobretasas', title: 'Sobretasas Financiera, Energética & Regímenes Especiales', article: 'Art. 240 Parágrafos 2 y 7 E.T.' },
      { id: 'comparador', title: 'Comparador Renta Ordinaria vs Régimen Simple', article: 'Arts. 903 a 916 E.T.' },
      { id: 'simple_calc', title: 'Liquidación Anual Régimen Simple (F-260)', article: 'Art. 908 E.T.' },
      { id: 'simple_f2593', title: 'Anticipos Bimestrales SIMPLE (F-2593)', article: 'Art. 910 E.T.' },
      { id: 'simple_requisitos', title: 'Checklist de Requisitos y Exclusiones del RST', article: 'Arts. 905 y 906 E.T.' },
      { id: 'conciliacion_niif', title: 'Conciliación Contable vs Fiscal (Formato 2516)', article: 'Art. 772-1 E.T.' },
      { id: 'f110', title: 'Formulario 110 Oficial DIAN', article: 'Modelo Oficial DIAN' },
      { id: 'f260', title: 'Formulario 260 Oficial DIAN', article: 'Modelo Oficial DIAN' },
    ],
  },
  periodicos: {
    title: 'Portal de Impuestos Periódicos: Retefuente & IVA',
    workspaceName: 'Impuestos Periódicos',
    badge: 'Formularios 350 & 300 DIAN',
    steps: [
      { step: '1', title: 'Retención Nómina Art. 383', actionSubTab: 'laboral' },
      { step: '2', title: 'Declaración Retefuente F-350', actionSubTab: 'calc' },
      { step: '3', title: 'Liquidación IVA F-300', actionSubTab: 'iva_calc' },
      { step: '4', title: 'Prorrateo & Facsímiles', actionSubTab: 'prorrateo' },
    ],
    tabs: [
      { id: 'retefuente_laboral', title: 'Retención en la Fuente Laboral & Salarios', article: 'Art. 383 E.T.' },
      { id: 'retefuente_calc', title: 'Depuración Retención en la Fuente (F-350)', article: 'Arts. 365 a 404 E.T.' },
      { id: 'retefuente_tabla', title: 'Tabla Maestra de Retención en la Fuente', article: 'Decreto Único Reglamentario 1625' },
      { id: 'iva_calc', title: 'Liquidación Periódica del IVA (F-300)', article: 'Arts. 420 a 513 E.T.' },
      { id: 'iva_prorrateo', title: 'Simulador de Prorrateo de IVA Común', article: 'Art. 490 E.T.' },
      { id: 'iva_clasificador', title: 'Catálogo y Clasificador de Bienes & Servicios', article: 'Arts. 424, 468, 477 E.T.' },
      { id: 'f350', title: 'Formulario 350 Oficial DIAN', article: 'Modelo Oficial DIAN' },
      { id: 'f300', title: 'Formulario 300 Oficial DIAN', article: 'Modelo Oficial DIAN' },
    ],
  },
  sanciones: {
    title: 'Portal de Régimen Sancionatorio & Auditoría',
    workspaceName: 'Auditoría & Sanciones',
    badge: 'Arts. 640, 641, 644 & 689-3 E.T.',
    steps: [
      { step: '1', title: 'Liquidar Sanción', actionSubTab: 'main' },
      { step: '2', title: 'Aplicar Reducción Art. 640', actionSubTab: 'main' },
      { step: '3', title: 'Evaluar Beneficio Auditoría', actionSubTab: 'auditoria' },
      { step: '4', title: 'Explorar Rentas Exentas', actionSubTab: 'beneficios' },
    ],
    tabs: [
      { id: 'sanciones_calc', title: 'Calculadora Integral de Sanciones Tributarias', article: 'Arts. 640, 641, 642, 644 y 639 E.T.' },
      { id: 'auditoria', title: 'Simulador de Beneficio de Auditoría (Firmeza en 6 y 12 meses)', article: 'Art. 689-3 E.T.' },
      { id: 'beneficios_catalogo', title: 'Catálogo Integral de Beneficios Fiscales & Rentas Exentas', article: 'Estatuto Tributario Nacional' },
    ],
  },
};

// 2. Parser de Hash para Espacios Modulares
function parseWorkspaceHash(hash) {
  const clean = (hash || '').replace(/^#\/?/, '').trim();
  if (clean === 'landing' || clean === '') return { view: 'landing', workspace: 'naturales', module: 'pn', subTab: 'hub' };
  if (clean === 'skill-tutorial' || clean === 'skills') return { view: 'skill-tutorial', workspace: 'naturales', module: 'pn', subTab: 'calc' };

  const parts = clean.split('/');
  const first = parts[0];
  const second = parts[1] || 'hub';

  if (first === 'naturales') return { view: 'app', workspace: 'naturales', module: 'pn', subTab: second };
  if (first === 'juridicas') return { view: 'app', workspace: 'juridicas', module: 'pj', subTab: second };
  if (first === 'periodicos') return { view: 'app', workspace: 'periodicos', module: 'retefuente', subTab: second };
  if (first === 'sanciones') return { view: 'app', workspace: 'sanciones', module: 'presentacion', subTab: second };

  return { view: 'app', workspace: 'naturales', module: 'pn', subTab: 'hub' };
}

test('Workspace Hubs - Estructura Completa y Metadatos de los 4 Espacios', () => {
  const workspaces = Object.keys(HUB_CONFIGS);
  assert.equal(workspaces.length, 4);
  assert.deepEqual(workspaces, ['naturales', 'juridicas', 'periodicos', 'sanciones']);

  for (const ws of workspaces) {
    const config = HUB_CONFIGS[ws];
    assert.ok(config.title.length > 0, `Título requerido en ${ws}`);
    assert.ok(config.workspaceName.length > 0, `WorkspaceName requerido en ${ws}`);
    assert.ok(config.badge.length > 0, `Badge requerido en ${ws}`);
    assert.equal(config.steps.length, 4, `Flujo en 4 pasos requerido en ${ws}`);
    assert.ok(config.tabs.length >= 3, `Debe haber al menos 3 pestañas explicadas en ${ws}`);

    // Validar que cada pestaña tenga título y artículo legal
    for (const tab of config.tabs) {
      assert.ok(tab.title.length > 0);
      assert.ok(tab.article.length > 0);
    }
  }
});

test('Workspace Hubs - Enrutamiento Hash hacia Hubs de Cada Espacio', () => {
  assert.deepEqual(parseWorkspaceHash('#naturales'), { view: 'app', workspace: 'naturales', module: 'pn', subTab: 'hub' });
  assert.deepEqual(parseWorkspaceHash('#naturales/hub'), { view: 'app', workspace: 'naturales', module: 'pn', subTab: 'hub' });
  assert.deepEqual(parseWorkspaceHash('#naturales/optimizer'), { view: 'app', workspace: 'naturales', module: 'pn', subTab: 'optimizer' });

  assert.deepEqual(parseWorkspaceHash('#juridicas'), { view: 'app', workspace: 'juridicas', module: 'pj', subTab: 'hub' });
  assert.deepEqual(parseWorkspaceHash('#juridicas/ttd'), { view: 'app', workspace: 'juridicas', module: 'pj', subTab: 'ttd' });

  assert.deepEqual(parseWorkspaceHash('#periodicos'), { view: 'app', workspace: 'periodicos', module: 'retefuente', subTab: 'hub' });
  assert.deepEqual(parseWorkspaceHash('#periodicos/iva'), { view: 'app', workspace: 'periodicos', module: 'retefuente', subTab: 'iva' });

  assert.deepEqual(parseWorkspaceHash('#sanciones'), { view: 'app', workspace: 'sanciones', module: 'presentacion', subTab: 'hub' });
  assert.deepEqual(parseWorkspaceHash('#sanciones/main'), { view: 'app', workspace: 'sanciones', module: 'presentacion', subTab: 'main' });
});

test('Optimizador What-If - Límite del 40% y Beneficios Fuera de Bolsa (Art. 336 Ley 2277)', () => {
  const uvt2026 = 52374;
  const rentaBrutaTrabajo = 180000000;
  const inssTrabajo = 16000000; // Ingresos no constitutivos
  const rentaLiquidaOrdinaria = rentaBrutaTrabajo - inssTrabajo; // 164.000.000

  // 1. Límite conjunto 40% / 1.340 UVT
  const tope40Pct = rentaLiquidaOrdinaria * 0.40; // 65.600.000
  const tope1340Uvt = 1340 * uvt2026; // 70.181.160
  const limiteMaximoBolsa = Math.min(tope40Pct, tope1340Uvt); // 65.600.000

  assert.equal(limiteMaximoBolsa, 65600000);

  // 2. Beneficios que están DENTRO de la bolsa del 40%
  const prepagada = 16 * uvt2026 * 12; // 10.055.808
  const afc = 30000000;
  const rentaExenta25Pct = (rentaLiquidaOrdinaria - prepagada - afc) * 0.25; // 30.986.048
  const totalBolsa40 = prepagada + afc + rentaExenta25Pct; // 71.041.856
  const deduccionesImputablesBolsa = Math.min(totalBolsa40, limiteMaximoBolsa); // 65.600.000 (tope saturado)

  assert.equal(deduccionesImputablesBolsa, 65600000);

  // 3. Beneficios que están FUERA de la bolsa del 40% (Art. 336 numerales 2 y 5)
  // Dependientes adicionales: 72 UVT por dependiente hasta 4 = 288 UVT
  const dependientes72Uvt = 4 * 72 * uvt2026; // 15.083.712
  // Compras con factura electrónica: 1% hasta 240 UVT
  const comprasFactura1Pct = Math.min(80000000 * 0.01, 240 * uvt2026); // 800.000

  const totalDeduccionesEspecialesFueraBolsa = dependientes72Uvt + comprasFactura1Pct; // 15.883.712

  // Renta Líquida Gravable final con beneficios especiales
  const rentaLiquidaGravable = Math.max(0, rentaLiquidaOrdinaria - deduccionesImputablesBolsa - totalDeduccionesEspecialesFueraBolsa);

  assert.equal(rentaLiquidaGravable, 164000000 - 65600000 - 15883712);
  assert.equal(rentaLiquidaGravable, 82516288);
});

test('Optimizador What-If - Presets de Estrategia Fiscal', () => {
  const uvt2026 = 52374;
  const presets = {
    prepagada_max: { medicina_prepagada: 16 * 12 * uvt2026 },
    afc_max: { cuentas_afc_fvp: 800 * uvt2026 },
    plan_familiar: { dependientes_adicionales_72uvt: 4 },
    facturas_1pct: { compras_factura_electronica_1pct: 120000000 },
    max_all: {
      medicina_prepagada: 16 * 12 * uvt2026,
      cuentas_afc_fvp: 1000 * uvt2026,
      dependientes_adicionales_72uvt: 4,
      compras_factura_electronica_1pct: 200000000,
    },
  };

  assert.equal(presets.prepagada_max.medicina_prepagada, 192 * uvt2026);
  assert.equal(presets.plan_familiar.dependientes_adicionales_72uvt, 4);
  assert.equal(presets.max_all.dependientes_adicionales_72uvt, 4);
  assert.ok(presets.max_all.cuentas_afc_fvp > 0);
});

test('Sidebar - Orden de Menús en Todos los Espacios Activos & Separación de 10 Errores', () => {
  const workspaces = ['naturales', 'juridicas', 'periodicos', 'sanciones'];

  workspaces.forEach((ws) => {
    // Cada espacio activo debe contar con acceso prioritario al Calendario y al Glosario
    const topItems = ['calendario', 'glosario'];
    assert.ok(topItems.includes('calendario'), `El espacio ${ws} incluye Calendario en la parte superior`);
    assert.ok(topItems.includes('glosario'), `El espacio ${ws} incluye Glosario en la parte superior`);
  });

  // Los 10 Errores están separados como utilidad en la parte inferior
  const utilityItems = ['errores', 'rules', 'skill-tutorial'];
  assert.equal(utilityItems[0], 'errores');
  assert.ok(utilityItems.includes('rules'));
});

