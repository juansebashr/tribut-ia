import React from 'react';
import { useApp } from '../../context/AppContext';
import type { WorkspaceType, ModuleType } from '../../context/AppContext';
import { formatCOP } from '../../utils/formatters';

interface ToolItem {
  id: string;
  icon: string;
  title: string;
  tag: string;
  tagColor?: string;
  module: ModuleType;
  subTab?: string;
  whatItDoes: string;
  howToUse: string;
  articleRef: string;
}

interface WorkflowStep {
  stepNumber: number;
  title: string;
  description: string;
  targetModule: ModuleType;
  targetSubTab?: string;
  icon: string;
}

interface WorkspaceHubData {
  title: string;
  subtitle: string;
  badge: string;
  gradient: string;
  primaryAction: {
    label: string;
    module: ModuleType;
    subTab: string;
  };
  workflow: WorkflowStep[];
  tools: ToolItem[];
  keyRules: Array<{ label: string; value: string; note: string }>;
}

export const WorkspaceHubLanding: React.FC<{ workspace: WorkspaceType }> = ({ workspace }) => {
  const { navigateTo, taxYear, uvtValue, navigateToWorkspace } = useApp();

  const getWorkspaceData = (): WorkspaceHubData => {
    switch (workspace) {
      case 'naturales':
        return {
          title: 'Portal de Liquidación: Persona Natural (Formulario 210)',
          subtitle:
            'Guía completa del flujo de trabajo, microcalculadoras, optimizadores y herramientas especializadas para declarantes colombianos.',
          badge: '🟢 Espacio 1 • Personas Naturales',
          gradient: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
          primaryAction: {
            label: 'Comenzar con el Test de Obligados (3 min) →',
            module: 'pn',
            subTab: 'test_obligados',
          },
          workflow: [
            {
              stepNumber: 1,
              title: 'Diagnóstico Obligados',
              description: 'Verifica en 3 minutos si superas los 6 topes de la DIAN para estar obligado a declarar.',
              icon: '🚦',
              targetModule: 'pn',
              targetSubTab: 'test_obligados',
            },
            {
              stepNumber: 2,
              title: 'Depuración Cédula General',
              description: 'Ingresa ingresos laborales, capital, no laborales y aplica deducciones con límite del 40%.',
              icon: '👤',
              targetModule: 'pn',
              targetSubTab: 'calc',
            },
            {
              stepNumber: 3,
              title: 'Optimización What-If',
              description: 'Simula ahorros tributarios con AFC, Medicina Prepagada, Dependientes 72 UVT y Facturas 1%.',
              icon: '💡',
              targetModule: 'pn',
              targetSubTab: 'optimizer',
            },
            {
              stepNumber: 4,
              title: 'Conciliación & Formulario 210',
              description: 'Cruza con exógena DIAN, valida consistencia patrimonial y visualiza el facsímil oficial.',
              icon: '📋',
              targetModule: 'pn',
              targetSubTab: 'f210',
            },
          ],
          tools: [
            {
              id: 'pn-test-obligados',
              icon: '🚦',
              title: '¿Debo Declarar Renta?',
              tag: 'Test 3 min',
              tagColor: '#16a34a',
              module: 'pn',
              subTab: 'test_obligados',
              whatItDoes:
                'Evalúa interactivamente los 6 topes legales fijados por la DIAN (Patrimonio > 4.500 UVT, Ingresos > 1.400 UVT, Consumos Tarjeta > 1.400 UVT, Compras > 1.400 UVT y Consignaciones > 1.400 UVT).',
              howToUse:
                'Úsala al inicio para saber si el declarante está obligado ante la DIAN antes de solicitar extractos bancarios. Si resulta obligado, transfiere los datos con 1 clic al liquidador.',
              articleRef: 'Art. 592 y 594-3 E.T.',
            },
            {
              id: 'pn-calc',
              icon: '👤',
              title: 'Cédula General (F-210)',
              tag: 'Depuración',
              module: 'pn',
              subTab: 'calc',
              whatItDoes:
                'Liquidador integral con depuración de rentas de trabajo, capital y no laborales, control del límite del 40% (1.340 UVT) y liquidación de renta líquida gravable.',
              howToUse:
                'Ingresa los valores del Certificado de Ingresos y Retenciones (Formulario 220), extractos bancarios y certificados de aportes para obtener el saldo a pagar o a favor.',
              articleRef: 'Arts. 330 a 336 E.T.',
            },
            {
              id: 'pn-optimizer',
              icon: '💡',
              title: 'Optimizador What-If (Planeación Tributaria)',
              tag: 'Ahorro Real',
              tagColor: '#f59e0b',
              module: 'pn',
              subTab: 'optimizer',
              whatItDoes:
                'Simula en vivo el impacto fiscal exacto de aportar a Cuentas AFC, Pensiones Voluntarias (FPV), Medicina Prepagada, Dependientes de 72 UVT y Facturas Electrónicas (1%).',
              howToUse:
                'Úsala para asesorar clientes sobre cómo reducir legalmente su impuesto antes del cierre del año o simular deducciones adicionales aplicables.',
              articleRef: 'Arts. 126-1, 126-4, 387, 336 E.T.',
            },
            {
              id: 'pn-marginal',
              icon: '🌡️',
              title: 'Tarifa Progresiva & Termómetro Marginal',
              tag: 'Art. 241',
              module: 'pn',
              subTab: 'marginal',
              whatItDoes:
                'Desglosa los 7 tramos marginales de la tabla del Art. 241 (0% al 39%), mostrando cuánto impuesto se paga en cada intervalo y calculando la tasa efectiva real.',
              howToUse:
                'Úsala como herramienta pedagógica para explicarle al declarante por qué un ingreso adicional tributa solo en el tramo marginal y no sobre la totalidad.',
              articleRef: 'Art. 241 E.T.',
            },
            {
              id: 'pn-comparacion',
              icon: '⚖️',
              title: 'Comparación Patrimonial',
              tag: 'Art. 236',
              module: 'pn',
              subTab: 'comparacion_patrimonial',
              whatItDoes:
                'Verifica si el incremento en el patrimonio líquido entre el año anterior y el año actual está justificado por las rentas líquidas y ganancias ocasionales obtenidas.',
              howToUse:
                'Diligencia el patrimonio líquido del año anterior y el actual para prevenir investigaciones de la DIAN por renta por comparación patrimonial no justificada.',
              articleRef: 'Arts. 236 a 239 E.T.',
            },
            {
              id: 'pn-inflacionario',
              icon: '📊',
              title: 'Componente Inflacionario',
              tag: 'Art. 38/40-1',
              module: 'pn',
              subTab: 'inflacionario',
              whatItDoes:
                'Calcula el porcentaje de rendimientos financieros no gravados (ingresos no constitutivos) y la parte no deducible de los costos financieros de acuerdo con los decretos anuales.',
              howToUse:
                'Ingresa los rendimientos financieros certificados por entidades bancarias (CDTs, cuentas de ahorro) para separar la porción exenta de inflación.',
              articleRef: 'Arts. 38, 40-1, 41 E.T.',
            },
            {
              id: 'pn-conciliacion',
              icon: '📑',
              title: 'Conciliación Exógena & CSV',
              tag: 'Spreadsheet',
              module: 'pn',
              subTab: 'conciliacion',
              whatItDoes:
                'Procesa en memoria efímera y segura el archivo de Información Exógena DIAN o extractos bancarios para conciliar retenciones en la fuente y pagos de terceros.',
              howToUse:
                'Sube el archivo CSV o copia y pega el texto de la información exógena de la DIAN para auditar renglón por renglón qué casillas del F-210 alimentar.',
              articleRef: 'Art. 631 E.T.',
            },
            {
              id: 'art73',
              icon: '📈',
              title: 'Reajuste Fiscal de Activos Fijos',
              tag: 'Art. 73',
              tagColor: '#059669',
              module: 'art73',
              subTab: 'main',
              whatItDoes:
                'Calcula el nuevo costo fiscal ajustado para bienes raíces y acciones utilizando la tabla histórica oficial DANE de 70 años (1955-2025).',
              howToUse:
                'Selecciona el año de adquisición del inmueble o acción para calcular el costo fiscal ajustado y reducir la ganancia ocasional antes de una venta.',
              articleRef: 'Art. 73 E.T.',
            },
            {
              id: 'inmuebles-afc',
              icon: '🏡',
              title: 'Inmuebles & Cuentas AFC',
              tag: 'Art. 311-1',
              tagColor: '#10b981',
              module: 'inmuebles-afc',
              subTab: 'main',
              whatItDoes:
                'Liquida la exención especial de hasta 5.000 UVT en Ganancia Ocasional por venta de casa o apartamento de habitación depositada en cuenta AFC o destinada a nueva vivienda.',
              howToUse:
                'Diligencia el valor de venta, costo fiscal y monto depositado en AFC para calcular la ganancia exenta y el ahorro tributario en ganancia ocasional.',
              articleRef: 'Art. 311-1 y 126-4 E.T.',
            },
            {
              id: 'tributacion-pareja',
              icon: '👫',
              title: 'Tributación en Pareja',
              tag: 'Art. 8',
              tagColor: '#8b5cf6',
              module: 'tributacion-pareja',
              subTab: 'main',
              whatItDoes:
                'Simula la optimización de rentas y patrimonio entre cónyuges o compañeros permanentes, aprovechando el tramo exento del 0% de ambos declarantes.',
              howToUse:
                'Ingresa los ingresos de ambos cónyuges y los bienes comunes para evaluar si es más eficiente declarar en copropiedad 50/50 o por separado.',
              articleRef: 'Art. 8 y 241 E.T.',
            },
            {
              id: 'pn-f210',
              icon: '📋',
              title: 'Formulario 210 Oficial (Facsímil)',
              tag: 'Facsímil DIAN',
              module: 'pn',
              subTab: 'f210',
              whatItDoes:
                'Presenta el formulario oficial idéntico al documento DIAN con todas las casillas calculadas y popovers explicativos paso a paso.',
              howToUse:
                'Úsalo para verificar el borrador final y transcribir con total seguridad los números a la plataforma Muisca de la DIAN.',
              articleRef: 'Resolución DIAN Formulario 210',
            },
          ],
          keyRules: [
            {
              label: 'Límite Conjunto 40% (Art. 336)',
              value: `Tope: 1.340 UVT (${formatCOP(1340 * uvtValue)})`,
              note: 'Aplica a deducciones generales (Prepagada, AFC, Intereses Vivienda, Dependiente 10%) y Renta Exenta 25%.',
            },
            {
              label: 'Dependientes Adicionales (Ley 2277)',
              value: `72 UVT c/u (${formatCOP(72 * uvtValue)})`,
              note: 'Hasta 4 dependientes adicionales (288 UVT). ¡No suma al límite del 40%!',
            },
            {
              label: 'Factura Electrónica 1%',
              value: `Tope: 240 UVT (${formatCOP(240 * uvtValue)})`,
              note: 'Deducción del 1% del valor de las compras con medios bancarios. ¡No suma al límite del 40%!',
            },
            {
              label: 'Exención Venta Vivienda (Art. 311-1)',
              value: `Tope: 5.000 UVT (${formatCOP(5000 * uvtValue)})`,
              note: 'En ganancia ocasional si se destina a cuenta AFC o compra de nueva casa de habitación.',
            },
          ],
        };

      case 'juridicas':
        return {
          title: 'Portal de Renta Sociedades & Régimen SIMPLE (F-110 & F-260)',
          subtitle:
            'Suite para empresas y personas jurídicas: Depuración Renta 35%, Tasa Mínima TTD (15%), Sobretasas, Comparador Ordinario vs SIMPLE y Anticipos F-2593.',
          badge: '🏢 Espacio 2 • Personas Jurídicas & RST',
          gradient: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
          primaryAction: {
            label: 'Comenzar Depuración Renta Ordinaria (35%) →',
            module: 'pj',
            subTab: 'calc',
          },
          workflow: [
            {
              stepNumber: 1,
              title: 'Evaluación de Régimen',
              description: 'Compara si a la empresa le conviene Renta Ordinaria (35%) o el Régimen SIMPLE (RST).',
              icon: '⚖️',
              targetModule: 'simple',
              targetSubTab: 'comparador',
            },
            {
              stepNumber: 2,
              title: 'Depuración Renta 35%',
              description: 'Registra ingresos contables, costos, gastos deducibles y descuentos tributarios.',
              icon: '🏢',
              targetModule: 'pj',
              targetSubTab: 'calc',
            },
            {
              stepNumber: 3,
              title: 'Laboratorio TTD (15%)',
              description: 'Verifica si la Utilidad e Impuesto Depurado cumplen la Tasa Mínima de Tributación.',
              icon: '⚖️',
              targetModule: 'pj',
              targetSubTab: 'ttd',
            },
            {
              stepNumber: 4,
              title: 'Facsímil F-110 / F-260 & NIIF',
              description: 'Visualiza el formulario oficial y prepara la conciliación fiscal (Formato 2516).',
              icon: '📋',
              targetModule: 'pj',
              targetSubTab: 'f110',
            },
          ],
          tools: [
            {
              id: 'pj-calc',
              icon: '🏢',
              title: 'Depuración Renta Ordinaria',
              tag: 'Tarifa 35%',
              module: 'pj',
              subTab: 'calc',
              whatItDoes:
                'Calcula la renta bruta, renta líquida gravable y el impuesto a tarifa general del 35% (Art. 240 E.T.), descontando retenciones y anticipos.',
              howToUse:
                'Digita los ingresos operacionales, no operacionales, costos de ventas y gastos de administración/ventas del estado de resultados fiscal.',
              articleRef: 'Art. 240 E.T.',
            },
            {
              id: 'pj-ttd',
              icon: '⚖️',
              title: 'Laboratorio Tasa Mínima TTD (15%)',
              tag: 'Art. 240 Par. 6',
              tagColor: '#dc2626',
              module: 'pj',
              subTab: 'ttd',
              whatItDoes:
                'Calcula la Tasa de Tributación Depurada (TTD = Impuesto Depurado / Utilidad Depurada) y determina el Impuesto a Adicionar si la TTD es inferior al 15%.',
              howToUse:
                'Indispensable para empresas con rentas exentas o deducciones especiales para auditar el cumplimiento del piso mínimo legal del 15%.',
              articleRef: 'Art. 240 Parágrafo 6 E.T.',
            },
            {
              id: 'pj-sobretasas',
              icon: '⚡',
              title: 'Sobretasas Financiera & Energía',
              tag: 'Art. 240 Par. 2/7',
              module: 'pj',
              subTab: 'sobretasas',
              whatItDoes:
                'Liquida puntos porcentuales adicionales de impuesto (3% a 5%) para entidades del sector financiero y generación de energía eléctrica.',
              howToUse:
                'Aplica a sociedades con renta gravable igual o superior a 120.000 UVT en los sectores regulados por los parágrafos 2 y 7 del Art. 240.',
              articleRef: 'Art. 240 Parágrafos 2 y 7 E.T.',
            },
            {
              id: 'simple-comparador',
              icon: '⚖️',
              title: 'Comparador Ordinario vs SIMPLE',
              tag: 'Decisión Estratégica',
              tagColor: '#2563eb',
              module: 'simple',
              subTab: 'comparador',
              whatItDoes:
                'Compara lado a lado el impuesto neto a pagar en Renta Ordinaria (con exoneración de aportes Art. 114-1) vs el impuesto unificado del Régimen SIMPLE sobre ingresos brutos.',
              howToUse:
                'Úsala en la planeación tributaria societaria para recomendarle a socios o gerentes el régimen fiscal más rentable.',
              articleRef: 'Arts. 903 a 916 E.T.',
            },
            {
              id: 'simple-calc',
              icon: '⚡',
              title: 'Liquidación Anual SIMPLE (F-260)',
              tag: 'RST Anual',
              module: 'simple',
              subTab: 'calc',
              whatItDoes:
                'Liquida el impuesto consolidado según las 4 tablas de tarifas del Art. 908 E.T., con INC en comidas y bebidas y descuento de pensión empleador.',
              howToUse:
                'Selecciona el grupo de actividad económica y digita los ingresos brutos anuales para liquidar el impuesto unificado.',
              articleRef: 'Art. 908 E.T.',
            },
            {
              id: 'simple-f2593',
              icon: '📅',
              title: 'Anticipos Bimestrales F-2593',
              tag: 'Bimestres',
              module: 'simple',
              subTab: 'f2593',
              whatItDoes:
                'Consolida los 6 recibos electrónicos bimestrales F-2593 del SIMPLE, con sus retenciones en compras practicadas y pagos por ventas electrónicas.',
              howToUse:
                'Cada dos meses para calcular el anticipo bimestral y al final de año para conciliar los anticipos pagados contra el Formulario 260.',
              articleRef: 'Art. 910 E.T.',
            },
            {
              id: 'simple-requisitos',
              icon: '✅',
              title: 'Checklist Requisitos RST',
              tag: 'Art. 905/906',
              module: 'simple',
              subTab: 'requisitos',
              whatItDoes:
                'Validador interactivo de elegibilidad para el RST: verifica tope de 100.000 UVT, calidad de socios, tipo de actividad y causas de exclusión.',
              howToUse:
                'Verifica el checklist antes de presentar el formulario de inscripción o traslado al Régimen Simple ante la DIAN.',
              articleRef: 'Arts. 905 y 906 E.T.',
            },
            {
              id: 'pj-conciliacion',
              icon: '📑',
              title: 'Conciliación NIIF vs Fiscal (F-2516)',
              tag: 'F-2516',
              module: 'pj',
              subTab: 'conciliacion',
              whatItDoes:
                'Mapea y clasifica las diferencias temporarias y permanentes entre la utilidad contable bajo NIIF y la renta líquida fiscal.',
              howToUse:
                'Úsala al preparar el Formato 2516 de conciliación fiscal anexo a la declaración de renta de personas jurídicas.',
              articleRef: 'Art. 772-1 E.T.',
            },
            {
              id: 'pj-f110',
              icon: '📋',
              title: 'Formulario 110 Oficial (Facsímil)',
              tag: 'Facsímil F-110',
              module: 'pj',
              subTab: 'f110',
              whatItDoes:
                'Facsímil oficial del Formulario 110 para personas jurídicas y sociedades con todas las casillas numeradas y ayuda conceptual.',
              howToUse: 'Para revisar y transcribir el borrador final a la plataforma Muisca de la DIAN.',
              articleRef: 'Resolución DIAN F-110',
            },
            {
              id: 'simple-f260',
              icon: '📋',
              title: 'Formulario 260 Oficial (Facsímil)',
              tag: 'Facsímil F-260',
              module: 'simple',
              subTab: 'f260',
              whatItDoes:
                'Facsímil oficial del Formulario 260 de la declaración consolidada anual del Régimen Simple.',
              howToUse: 'Para revisar el cálculo consolidado del año antes de radicar ante la DIAN.',
              articleRef: 'Resolución DIAN F-260',
            },
          ],
          keyRules: [
            {
              label: 'Tarifa General Renta PJ (Art. 240)',
              value: '35% de la Renta Líquida',
              note: 'Aplica a sociedades nacionales y extranjeras sobre renta ordinaria.',
            },
            {
              label: 'Tasa de Tributación Depurada (TTD)',
              value: 'Mínimo 15% (Art. 240 Par. 6)',
              note: 'Si el Impuesto Depurado / Utilidad Depurada < 15%, debe adicionarse impuesto.',
            },
            {
              label: 'Exoneración de Parafiscales (Art. 114-1)',
              value: 'Exoneración SENA, ICBF y Salud',
              note: 'Para trabajadores que devenguen menos de 10 SMLMV en Renta Ordinaria.',
            },
            {
              label: 'Tope Ingresos SIMPLE (Art. 905)',
              value: `100.000 UVT (${formatCOP(100000 * uvtValue)})`,
              note: 'Límite máximo de ingresos brutos fiscales del año anterior para pertenecer al RST.',
            },
          ],
        };

      case 'periodicos':
        return {
          title: 'Portal de Impuestos Periódicos: IVA & Retención (F-300 & F-350)',
          subtitle:
            'Herramientas operativas mensuales y bimestrales: Nómina laboral Art. 383, Retefuente F-350, Tabla Maestra UVT, Liquidación IVA F-300 y Prorrateo Art. 490.',
          badge: '🛍️ Espacio 3 • Impuestos Periódicos',
          gradient: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
          primaryAction: {
            label: 'Comenzar Depuración Retención Nómina (Art. 383) →',
            module: 'retefuente',
            subTab: 'laboral',
          },
          workflow: [
            {
              stepNumber: 1,
              title: 'Retención Nómina & Pagos',
              description: 'Depura salarios mensuales aplicando deducciones, aportes obligatorios y tabla del Art. 383.',
              icon: '👤',
              targetModule: 'retefuente',
              targetSubTab: 'laboral',
            },
            {
              stepNumber: 2,
              title: 'Tabla Maestra & F-350',
              description: 'Consulta bases mínimas en UVT y consolida la declaración mensual de retención en la fuente.',
              icon: '💰',
              targetModule: 'retefuente',
              targetSubTab: 'calc',
            },
            {
              stepNumber: 3,
              title: 'Liquidación IVA F-300',
              description: 'Determina el IVA generado al 19%/5%, compras descontables y clasificador de tarifas.',
              icon: '🛍️',
              targetModule: 'iva',
              targetSubTab: 'calc',
            },
            {
              stepNumber: 4,
              title: 'Prorrateo IVA & Facsímiles',
              description: 'Calcula el prorrateo de IVA común (Art. 490) y visualiza los facsímiles oficiales F-350 y F-300.',
              icon: '⚖️',
              targetModule: 'iva',
              targetSubTab: 'prorrateo',
            },
          ],
          tools: [
            {
              id: 'retefuente-laboral',
              icon: '👤',
              title: 'Retención Nómina & Salarios (Art. 383)',
              tag: 'Mensual',
              tagColor: '#2563eb',
              module: 'retefuente',
              subTab: 'laboral',
              whatItDoes:
                'Depura pagos laborales mensuales: descuenta salud y pensión obligatoria, dependientes (hasta 32 UVT/mes), prepagada (hasta 16 UVT/mes), intereses de vivienda (hasta 100 UVT/mes), y 25% exento (hasta 65.83 UVT/mes), aplicando los 7 tramos del Art. 383.',
              howToUse:
                'Úsala al liquidar la nómina mensual o pagos a contratistas para calcular la retención exacta a retener en la quincena/mes.',
              articleRef: 'Arts. 383, 387 y 206 Num. 10 E.T.',
            },
            {
              id: 'retefuente-calc',
              icon: '💰',
              title: 'Depuración Retención en la Fuente (F-350)',
              tag: 'F-350 Mensual',
              module: 'retefuente',
              subTab: 'calc',
              whatItDoes:
                'Consolida las bases gravables y retenciones practicadas por honorarios, servicios, compras, arrendamientos, dividendos, pagos al exterior y autorretenciones.',
              howToUse:
                'Al cierre de cada mes contable para preparar y auditar la declaración mensual de retención en la fuente (Formulario 350).',
              articleRef: 'Arts. 365 a 404-1 E.T.',
            },
            {
              id: 'retefuente-tabla',
              icon: '📚',
              title: 'Tabla Maestra de Retenciones',
              tag: 'Buscador UVT',
              module: 'retefuente',
              subTab: 'tabla',
              whatItDoes:
                'Buscador instantáneo de conceptos de retención con bases mínimas en UVT y pesos, tarifas para declarantes y no declarantes, y bases jurídicas.',
              howToUse:
                'Consúltala al recibir facturas de proveedores para verificar si la compra supera la base mínima y qué porcentaje retener.',
              articleRef: 'Decreto Único Reglamentario 1625',
            },
            {
              id: 'iva-calc',
              icon: '🛍️',
              title: 'Liquidación Periódica IVA (F-300)',
              tag: 'Bimestral / Cuatrimestral',
              module: 'iva',
              subTab: 'calc',
              whatItDoes:
                'Liquida el IVA generado sobre ventas al 19% y 5%, compras descontables, devoluciones, retenciones de IVA practicadas y saldo a pagar o a favor.',
              howToUse:
                'Cada bimestre o cuatrimestre para determinar el impuesto neto de IVA a pagar a la DIAN.',
              articleRef: 'Arts. 420 a 498 E.T.',
            },
            {
              id: 'iva-prorrateo',
              icon: '⚖️',
              title: 'Prorrateo IVA Común (Art. 490)',
              tag: 'Art. 490',
              tagColor: '#7c3aed',
              module: 'iva',
              subTab: 'prorrateo',
              whatItDoes:
                'Calcula la proporción de IVA descontable procedente cuando la empresa realiza simultáneamente operaciones gravadas, exentas (0%) y excluidas.',
              howToUse:
                'Indispensable cuando la empresa tiene compras de gastos generales (arrendamiento, servicios públicos) que aplican a toda la operación mixta.',
              articleRef: 'Art. 490 E.T.',
            },
            {
              id: 'iva-clasificador',
              icon: '🔍',
              title: 'Clasificador Bienes & IVA',
              tag: 'Tarifas & Exclusiones',
              module: 'iva',
              subTab: 'clasificador',
              whatItDoes:
                'Catálogo normativo interactivo de bienes y servicios clasificados en: Gravados (19% y 5%), Exentos con derecho a devolución (0%) y Excluidos.',
              howToUse:
                'Úsala para verificar el tratamiento tributario de nuevos productos o servicios que la empresa planee facturar.',
              articleRef: 'Arts. 424, 468-1, 477 E.T.',
            },
            {
              id: 'retefuente-f350',
              icon: '📋',
              title: 'Formulario 350 Oficial (Facsímil)',
              tag: 'Facsímil F-350',
              module: 'retefuente',
              subTab: 'f350',
              whatItDoes: 'Facsímil oficial del Formulario 350 de Retención en la Fuente con casillas interactivas.',
              howToUse: 'Para transcribir las retenciones del mes a la DIAN sin inconsistencias de casillas.',
              articleRef: 'Resolución DIAN F-350',
            },
            {
              id: 'iva-f300',
              icon: '📋',
              title: 'Formulario 300 Oficial (Facsímil)',
              tag: 'Facsímil F-300',
              module: 'iva',
              subTab: 'f300',
              whatItDoes: 'Facsímil oficial del Formulario 300 de IVA para declaraciones bimestrales o cuatrimestrales.',
              howToUse: 'Para verificar el resultado del IVA antes de radicar en el sistema Muisca.',
              articleRef: 'Resolución DIAN F-300',
            },
          ],
          keyRules: [
            {
              label: 'Base Mínima Retefuente Compras (2.5% / 3.5%)',
              value: `27 UVT (${formatCOP(27 * uvtValue)})`,
              note: 'A partir de 27 UVT aplica retención por compras generales.',
            },
            {
              label: 'Base Mínima Retefuente Servicios (4% / 6%)',
              value: `4 UVT (${formatCOP(4 * uvtValue)})`,
              note: 'A partir de 4 UVT aplica retención por prestación de servicios generales.',
            },
            {
              label: 'Tope Renta Exenta Laboral 25% Mensual',
              value: `65.83 UVT/mes (${formatCOP(65.83 * uvtValue)})`,
              note: 'Límite mensual del 25% exento en depuración de salarios bajo Art. 383.',
            },
            {
              label: 'Periodicidad del IVA (Art. 600)',
              value: 'Bimestral (> 92.000 UVT) o Cuatrimestral (< 92.000 UVT)',
              note: 'Definido según los ingresos brutos del año gravable anterior.',
            },
          ],
        };

      case 'sanciones':
      default:
        return {
          title: 'Portal de Régimen Sancionatorio, Firmeza & Beneficios',
          subtitle:
            'Calculadora didáctica de sanciones tributarias (Arts. 640, 641, 644 E.T.), Beneficio de Auditoría (Art. 689-3) y Catálogo Integral de Beneficios Fiscales.',
          badge: '⚖️ Espacio 4 • Auditoría & Sanciones',
          gradient: 'linear-gradient(135deg, #7c2d12 0%, #991b1b 100%)',
          primaryAction: {
            label: 'Comenzar con la Calculadora de Sanciones →',
            module: 'presentacion',
            subTab: 'main',
          },
          workflow: [
            {
              stepNumber: 1,
              title: 'Cálculo de Sanción',
              description: 'Liquida sanciones por extemporaneidad o corrección con control de sanción mínima (10 UVT).',
              icon: '⚖️',
              targetModule: 'presentacion',
              targetSubTab: 'main',
            },
            {
              stepNumber: 2,
              title: 'Reducciones Art. 640',
              description: 'Aplica el principio de favorabilidad y proporcionalidad (reducción al 50% o 75%).',
              icon: '📉',
              targetModule: 'presentacion',
              targetSubTab: 'main',
            },
            {
              stepNumber: 3,
              title: 'Beneficio de Auditoría',
              description: 'Evalúa la firmeza de la declaración en 6 meses (35% incremento) o 12 meses (25% incremento).',
              icon: '⚡',
              targetModule: 'presentacion',
              targetSubTab: 'main',
            },
            {
              stepNumber: 4,
              title: 'Catálogo de Beneficios',
              description: 'Explora deducciones especiales, rentas exentas y descuentos tributarios del Estatuto.',
              icon: '🎁',
              targetModule: 'beneficios',
              targetSubTab: 'all',
            },
          ],
          tools: [
            {
              id: 'sanciones-calc',
              icon: '⚖️',
              title: 'Calculadora Integral de Sanciones',
              tag: 'Arts. 640/641/644',
              tagColor: '#dc2626',
              module: 'presentacion',
              subTab: 'main',
              whatItDoes:
                'Calcula la sanción por extemporaneidad (5% por mes o fracción de mes) y corrección, aplicando la sanción mínima legal de 10 UVT y las reducciones del Art. 640 (al 50% o 75%).',
              howToUse:
                'Ingresa la fecha de vencimiento oficial, fecha de presentación extemporánea y el impuesto a cargo para liquidar la sanción exacta con reducciones de ley.',
              articleRef: 'Arts. 639, 640, 641 y 644 E.T.',
            },
            {
              id: 'sanciones-auditoria',
              icon: '⚡',
              title: 'Simulador Beneficio de Auditoría',
              tag: 'Art. 689-3',
              tagColor: '#f59e0b',
              module: 'presentacion',
              subTab: 'main',
              whatItDoes:
                'Evalúa si la declaración de renta adquiere firmeza acelerada en 6 meses (incrementando el impuesto neto en ≥ 35%) o en 12 meses (incremento ≥ 25%), con control del piso de 71 UVT.',
              howToUse:
                'Digita el impuesto neto de renta del año anterior para conocer el valor exacto a liquidar este año que garantiza la firmeza de la declaración.',
              articleRef: 'Art. 689-3 E.T.',
            },
            {
              id: 'beneficios-catalogo',
              icon: '🎁',
              title: 'Catálogo Integral de Beneficios Fiscales',
              tag: 'Estatuto Tributario',
              tagColor: '#16a34a',
              module: 'beneficios',
              subTab: 'all',
              whatItDoes:
                'Directorio interactivo de incentivos fiscales vigentes en Colombia con buscador inteligente y filtros por categoría (Renta, Descuentos, Beneficios Inmobiliarios, Donaciones y Medio Ambiente).',
              howToUse:
                'Consúltalo durante la planeación fiscal para identificar beneficios tributarios aplicables a personas naturales o jurídicas.',
              articleRef: 'Estatuto Tributario Nacional',
            },
          ],
          keyRules: [
            {
              label: 'Sanción Mínima Legal (Art. 639)',
              value: `10 UVT (${formatCOP(10 * uvtValue)})`,
              note: 'Ninguna sanción tributaria en Colombia puede ser inferior a 10 UVT.',
            },
            {
              label: 'Principio de Lesividad (Art. 640)',
              value: 'Reducción al 50% o 75%',
              note: 'Si en los años anteriores el contribuyente no ha cometido la misma infracción.',
            },
            {
              label: 'Piso Mínimo Beneficio Auditoría',
              value: `71 UVT (${formatCOP(71 * uvtValue)})`,
              note: 'El impuesto neto del año anterior debe ser igual o superior a 71 UVT para acceder al beneficio.',
            },
            {
              label: 'Firmeza Acelerada (Art. 689-3)',
              value: '6 meses (+35%) o 12 meses (+25%)',
              note: 'Firmeza definitiva sin posibilidad de emplazamiento por parte de la DIAN.',
            },
          ],
        };
    }
  };

  const data = getWorkspaceData();

  return (
    <div id={`workspace-hub-${workspace}`} className="module-pane active" style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
      {/* HERO BANNER */}
      <div
        className="card"
        style={{
          marginBottom: '24px',
          background: data.gradient,
          color: 'white',
          border: 'none',
          borderRadius: '14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <span
              style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.2)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11.5px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {data.badge}
            </span>
            <span style={{ fontSize: '12px', opacity: 0.9 }}>
              Año Gravable: <strong>{taxYear}</strong> • UVT: <strong>${uvtValue.toLocaleString('es-CO')} COP</strong>
            </span>
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 900, margin: 0, color: 'white', lineHeight: 1.25 }}>
            {data.title}
          </h1>

          <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.92)', margin: 0, maxWidth: '850px', lineHeight: 1.5 }}>
            {data.subtitle}
          </p>

          <div style={{ marginTop: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => navigateTo(data.primaryAction.module, data.primaryAction.subTab)}
              style={{
                background: 'white',
                color: '#0f172a',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                border: 'none',
              }}
            >
              {data.primaryAction.label}
            </button>
            <button
              className="btn btn-outline"
              onClick={() => navigateToWorkspace('naturales')}
              style={{
                borderColor: 'rgba(255,255,255,0.6)',
                color: 'white',
                fontWeight: 600,
              }}
            >
              ⇄ Ver Otros Espacios
            </button>
          </div>
        </div>
      </div>

      {/* FLUJO RECOMENDADO EN 4 PASOS */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle, #e2e8f0)' }}>
          <h2 className="card-title" style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <span>🗺️</span> Flujo de Trabajo Recomendado Paso a Paso
          </h2>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Secuencia lógica sugerida para completar la liquidación sin omisiones
          </span>
        </div>

        <div className="card-body" style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {data.workflow.map((wf) => (
              <div
                key={wf.stepNumber}
                id={`hub-step-${wf.stepNumber}`}
                data-testid={`hub-step-${wf.stepNumber}`}
                onClick={() => navigateTo(wf.targetModule, wf.targetSubTab)}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: 'var(--bg-card, #ffffff)',
                  border: '1.5px solid var(--border-subtle, #e2e8f0)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle, #e2e8f0)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '20px' }}>{wf.icon}</span>
                  <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '10px' }}>
                    Paso {wf.stepNumber}
                  </span>
                </div>
                <div style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                  {wf.title}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4, flex: 1 }}>
                  {wf.description}
                </div>
                <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700, marginTop: '4px' }}>
                  Ir al Paso {wf.stepNumber} →
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GUÍA DETALLADA: QUÉ HACE Y CÓMO USAR CADA PESTAÑA */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle, #e2e8f0)' }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 2px 0' }}>
              <span>📚</span> Catálogo de Pestañas &amp; Cómo Usar Cada Herramienta
            </h2>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Detalle conceptual, base jurídica y momentos recomendados de uso para cada microcalculadora
            </span>
          </div>
        </div>

        <div className="card-body" style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {data.tools.map((tool) => (
              <div
                key={tool.id}
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border-subtle, #e2e8f0)',
                  background: 'var(--bg-card, #ffffff)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* CABECERA DE HERRAMIENTA */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '22px' }}>{tool.icon}</span>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                        {tool.title}
                      </h3>
                      <span style={{ fontSize: '10.5px', color: '#2563eb', fontWeight: 600 }}>
                        {tool.articleRef}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '6px',
                      background: tool.tagColor ? `${tool.tagColor}15` : '#f1f5f9',
                      color: tool.tagColor || '#475569',
                      border: tool.tagColor ? `1px solid ${tool.tagColor}30` : '1px solid #cbd5e1',
                    }}
                  >
                    {tool.tag}
                  </span>
                </div>

                {/* QUÉ HACE */}
                <div style={{ fontSize: '12px', lineHeight: 1.45, color: 'var(--text-primary)' }}>
                  <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>
                    🔍 ¿Qué hace?
                  </strong>
                  {tool.whatItDoes}
                </div>

                {/* CÓMO USARLA */}
                <div style={{ fontSize: '12px', lineHeight: 1.45, color: 'var(--text-muted)', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#334155', display: 'block', marginBottom: '2px' }}>
                    💡 ¿Cómo y cuándo deberías usarla?
                  </strong>
                  {tool.howToUse}
                </div>

                {/* BOTÓN DE ACCIÓN DIRECTO */}
                <div style={{ marginTop: 'auto', paddingTop: '6px' }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigateTo(tool.module, tool.subTab)}
                    style={{ width: '100%', justifyContent: 'center', fontWeight: 700 }}
                  >
                    Abrir {tool.title} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* REGLAS CLAVE & TOPES DEL AÑO */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle, #e2e8f0)' }}>
          <h2 className="card-title" style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <span>📌</span> Parámetros y Topes Normativos Clave (Año Gravable {taxYear})
          </h2>
        </div>

        <div className="card-body" style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {data.keyRules.map((rule, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {rule.label}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0' }}>
                  {rule.value}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{rule.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
