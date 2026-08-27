import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

test('PDF Export Suite - Verificación de Componentes de Exportación Estandarizados', async (t) => {
  await t.test('TaxPdfReportModal existe y define la interfaz TaxReportData', () => {
    const modalPath = path.join(srcDir, 'components/common/TaxPdfReportModal.tsx');
    assert.ok(fs.existsSync(modalPath), 'TaxPdfReportModal.tsx debe existir');
    const content = fs.readFileSync(modalPath, 'utf8');
    assert.ok(content.includes('export interface TaxReportData'), 'Debe exportar la interfaz TaxReportData');
    assert.ok(content.includes('moduleType:'), 'Debe soportar moduleType');
    assert.ok(content.includes('depurationRows:'), 'Debe incluir depurationRows');
    assert.ok(content.includes('keyBoxes:'), 'Debe incluir keyBoxes');
    assert.ok(content.includes('triggerPrint'), 'Debe usar el helper triggerPrint');
  });

  await t.test('printHelper existe y maneja clases de impresión temporal para móviles y modales', () => {
    const helperPath = path.join(srcDir, 'utils/printHelper.ts');
    assert.ok(fs.existsSync(helperPath), 'printHelper.ts debe existir');
    const content = fs.readFileSync(helperPath, 'utf8');
    assert.ok(content.includes('export const triggerPrint'), 'Debe exportar triggerPrint');
    assert.ok(content.includes('is-printing-facsimile'), 'Debe soportar is-printing-facsimile');
    assert.ok(content.includes('is-printing-modal'), 'Debe soportar is-printing-modal');
    assert.ok(content.includes('window.print()'), 'Debe llamar a window.print()');
  });
});

test('PDF Export Suite - Verificación de Botones Primarios y CTAs en Calculadoras', async (t) => {
  const calculators = [
    {
      name: 'Persona Natural (PnCalcSubtab)',
      file: 'components/modules/PersonaNatural/PnCalcSubtab.tsx',
      ctaId: 'btn-pn-export-pdf',
    },
    {
      name: 'Persona Jurídica (PjCalcSubtab)',
      file: 'components/modules/PersonaJuridica/PjCalcSubtab.tsx',
      ctaId: 'btn-pj-export-pdf',
    },
    {
      name: 'Régimen Simple (SimpleCalcSubtab)',
      file: 'components/modules/RegimenSimple/SimpleCalcSubtab.tsx',
      ctaId: 'btn-simple-export-pdf',
    },
    {
      name: 'Retención en la Fuente (RetefuenteCalcSubtab)',
      file: 'components/modules/Retefuente/RetefuenteCalcSubtab.tsx',
      ctaId: 'btn-retefuente-export-pdf',
    },
    {
      name: 'IVA (IvaCalcSubtab)',
      file: 'components/modules/Iva/IvaCalcSubtab.tsx',
      ctaId: 'btn-iva-export-pdf',
    },
  ];

  for (const calc of calculators) {
    await t.test(`${calc.name} contiene botón primario de exportación en results-card`, () => {
      const filePath = path.join(srcDir, calc.file);
      assert.ok(fs.existsSync(filePath), `Archivo ${calc.file} debe existir`);
      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(content.includes(calc.ctaId), `Debe contener ID ${calc.ctaId}`);
      assert.ok(content.includes('btn-export-primary'), 'Debe usar clase btn-export-primary');
      assert.ok(content.includes('results-export-cta'), 'Debe estar envuelto en results-export-cta');
      assert.ok(content.includes('btn-export-outline'), 'Debe tener botón de dictamen en toolbar superior');
    });
  }
});

test('PDF Export Suite - Verificación de Botones de Impresión en Facsímiles Oficiales DIAN', async (t) => {
  const facsimiles = [
    {
      name: 'Formulario 210 (PnF210Subtab)',
      file: 'components/modules/PersonaNatural/PnF210Subtab.tsx',
      btnId: 'btn-pn-print-f210',
    },
    {
      name: 'Formulario 110 (PjF110Subtab)',
      file: 'components/modules/PersonaJuridica/PjF110Subtab.tsx',
      btnId: 'btn-pj-print-f110',
    },
    {
      name: 'Formulario 260 (SimpleF260Subtab)',
      file: 'components/modules/RegimenSimple/SimpleF260Subtab.tsx',
      btnId: 'btn-simple-print-f260',
    },
    {
      name: 'Formulario 350 (RetefuenteF350Subtab)',
      file: 'components/modules/Retefuente/RetefuenteF350Subtab.tsx',
      btnId: 'btn-retefuente-print-f350',
    },
    {
      name: 'Formulario 300 (IvaF300Subtab)',
      file: 'components/modules/Iva/IvaF300Subtab.tsx',
      btnId: 'btn-iva-print-f300',
    },
  ];

  for (const fac of facsimiles) {
    await t.test(`${fac.name} contiene botón de exportación con triggerPrint({ isFacsimile: true })`, () => {
      const filePath = path.join(srcDir, fac.file);
      assert.ok(fs.existsSync(filePath), `Archivo ${fac.file} debe existir`);
      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(content.includes(fac.btnId), `Debe contener ID ${fac.btnId}`);
      assert.ok(content.includes('triggerPrint'), 'Debe importar y usar triggerPrint');
      assert.ok(content.includes('isFacsimile: true'), 'Debe pasar opción isFacsimile: true');
    });
  }
});

test('Responsive Print CSS - Verificación de Reglas Anti-Recorte en Móviles y Estándares de Impresión', async (t) => {
  const cssPath = path.join(srcDir, 'index.css');
  assert.ok(fs.existsSync(cssPath), 'index.css debe existir');
  const css = fs.readFileSync(cssPath, 'utf8');

  await t.test('Contiene @page con orientación portrait y márgenes controlados', () => {
    assert.ok(css.includes('@page'), 'Debe incluir @page');
    assert.ok(css.includes('size: portrait;'), 'Debe especificar tamaño portrait');
    assert.ok(css.includes('margin: 6mm 5mm 6mm 5mm;'), 'Debe configurar márgenes de impresión compactos');
  });

  await t.test('Resetea overflow, min-width y fuerza 100% de ancho en todos los facsímiles para evitar cortes en móvil', () => {
    assert.ok(css.includes('.f210-sheet-wrapper,'), 'Debe incluir reset para f210');
    assert.ok(css.includes('.f110-sheet-wrapper,'), 'Debe incluir reset para f110');
    assert.ok(css.includes('.f260-sheet-wrapper,'), 'Debe incluir reset para f260');
    assert.ok(css.includes('.f350-sheet-wrapper,'), 'Debe incluir reset para f350');
    assert.ok(css.includes('.f300-sheet-wrapper'), 'Debe incluir reset para f300');
    assert.ok(css.includes('overflow: visible !important;'), 'Debe forzar overflow visible');
    assert.ok(css.includes('width: 100% !important;'), 'Debe forzar width 100%');
    assert.ok(css.includes('min-width: 0 !important;'), 'Debe forzar min-width: 0');
  });

  await t.test('Ajusta el tamaño de fuente y padding en tablas DIAN para garantizar encaje perfecto en hoja de papel', () => {
    assert.ok(css.includes('table-layout: fixed !important;'), 'Debe usar table-layout fixed en tablas de facsímil');
    assert.ok(css.includes('word-break: break-word !important;'), 'Debe permitir word-break en celdas');
    assert.ok(css.includes('page-break-inside: avoid !important;'), 'Debe evitar partición de filas en saltos de página');
  });

  await t.test('Define clases de estilo para botones de exportación (.btn-export-primary, .btn-export-outline, .export-badge)', () => {
    assert.ok(css.includes('.btn-export-primary {'), 'Debe definir clase .btn-export-primary');
    assert.ok(css.includes('.btn-export-outline {'), 'Debe definir clase .btn-export-outline');
    assert.ok(css.includes('.export-badge {'), 'Debe definir clase .export-badge');
    assert.ok(css.includes('.results-export-cta {'), 'Debe definir clase .results-export-cta');
  });
});
