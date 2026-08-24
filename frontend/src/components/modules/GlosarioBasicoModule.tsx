import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCOP, parseCOP } from '../../utils/formatters';

interface TerminoGlosario {
  termino: string;
  categoria: 'patrimonio' | 'ingresos' | 'beneficios' | 'procedimiento' | 'sanciones';
  articulos: string;
  definicionSencilla: string;
  analogiaOEjemplo: string;
  loQueDebesSaber: string;
}

const GLOSARIO_DATA: TerminoGlosario[] = [
  {
    termino: 'UVT (Unidad de Valor Tributario)',
    categoria: 'procedimiento',
    articulos: 'Art. 868 E.T.',
    definicionSencilla: 'Es la "moneda de medida" que usa la DIAN para que las normas, topes y sanciones no queden desactualizados con la inflación.',
    analogiaOEjemplo: 'En lugar de decir en la ley "la sanción mínima es de $523.500 pesos", la ley dice "la sanción mínima es de 10 UVT". Cada año la DIAN actualiza el valor en pesos de 1 UVT.',
    loQueDebesSaber: 'En 2026, 1 UVT equivale a $52.350 COP (en 2025 fue de $49.799 COP y en 2024 de $47.065 COP). Multiplica cualquier tope en UVT por el valor del año correspondiente.',
  },
  {
    termino: 'Patrimonio Bruto',
    categoria: 'patrimonio',
    articulos: 'Art. 261 E.T.',
    definicionSencilla: 'Es la suma del valor fiscal de TODO lo que tienes a tu nombre al 31 de diciembre, sin importar cuánto debes de eso.',
    analogiaOEjemplo: 'Si compraste un apartamento de $400 millones pero le debes $300 millones al banco, tu Patrimonio Bruto ante la DIAN son los $400 millones completos.',
    loQueDebesSaber: 'Incluye cuentas bancarias, inmuebles, vehículos, acciones, saldos en billeteras digitales (Nequi/Daviplata) y efectivo.',
  },
  {
    termino: 'Patrimonio Líquido',
    categoria: 'patrimonio',
    articulos: 'Art. 282 E.T.',
    definicionSencilla: 'Es tu riqueza real y neta: lo que tienes (Patrimonio Bruto) menos lo que debes formalmente (Deudas/Pasivos).',
    analogiaOEjemplo: 'En el apartamento de $400M con deuda de $300M, tu Patrimonio Líquido es de $100 millones ($400M - $300M).',
    loQueDebesSaber: 'La fórmula legal es: Patrimonio Líquido = Patrimonio Bruto - Deudas. Sobre la variación de este valor la DIAN vigila la comparación patrimonial.',
  },
  {
    termino: 'Deudas o Pasivos con Soporte',
    categoria: 'patrimonio',
    articulos: 'Art. 283 E.T.',
    definicionSencilla: 'Obligaciones financieras o préstamos reales que tienes pendientes de pago al 31 de diciembre.',
    analogiaOEjemplo: 'El saldo del crédito hipotecario, tarjeta de crédito, o un préstamo que te hizo un familiar respaldado con un pagaré o contrato con fecha cierta en notaría.',
    loQueDebesSaber: '⚠️ Para que la DIAN acepte una deuda con una persona natural (amigo, familiar), el documento debe tener FECHA CIERTA (autenticación notarial en el año gravable). De lo contrario, no te descuentan la deuda.',
  },
  {
    termino: 'Cédula General',
    categoria: 'ingresos',
    articulos: 'Arts. 330 a 336 E.T.',
    definicionSencilla: 'Es la bolsa principal donde se agrupan tus ingresos por trabajo (sueldos), honorarios, arriendos, rendimientos y negocios comerciales.',
    analogiaOEjemplo: 'Es como la cuenta madre de tus ingresos ordinarios. Se divide en 3 subcédulas: Rentas de Trabajo, Rentas de Capital y Rentas No Laborales.',
    loQueDebesSaber: 'Todos los ingresos de esta bolsa se suman para calcular tu base gravable y aplicar la tabla de tarifas progresivas del 0% al 39%.',
  },
  {
    termino: 'INCRNGO (Ingresos No Constitutivos de Renta)',
    categoria: 'ingresos',
    articulos: 'Arts. 36 a 57 E.T.',
    definicionSencilla: 'Son dineros que recibiste pero que la ley prohíbe taxativamente que paguen impuesto de renta.',
    analogiaOEjemplo: 'Los aportes obligatorios que te descuentan de tu nómina para salud (4%) y pensión (4%) entran a tu bolsillo teóricamente pero salen directo a la seguridad social; por ley son 100% INCRNGO.',
    loQueDebesSaber: 'Se restan directamente del ingreso bruto antes de cualquier límite. ¡Son el mejor alivio tributario de ley!',
  },
  {
    termino: 'Renta Líquida Gravable',
    categoria: 'ingresos',
    articulos: 'Art. 26 y 241 E.T.',
    definicionSencilla: 'Es la cifra final y depurada sobre la cual se calcula realmente el impuesto a pagar.',
    analogiaOEjemplo: 'Si ganaste $100M, pero restaste $10M de salud/pensión (INCRNGO) y $35M de deducciones/exentas, tu Renta Líquida Gravable son $55 millones.',
    loQueDebesSaber: 'Sobre este valor se busca en qué rango de la tabla del Artículo 241 caes (si estás en el tramo de 0%, 19%, 28%, 35%, etc.).',
  },
  {
    termino: 'Ganancia Ocasional',
    categoria: 'ingresos',
    articulos: 'Arts. 300 a 317 E.T.',
    definicionSencilla: 'Ingresos extraordinarios que no ocurren en tu día a día, como vender un inmueble que tuviste por más de 2 años, ganar la lotería o recibir una herencia.',
    analogiaOEjemplo: 'Si vendiste tu casa que compraste hace 5 años y tuviste una utilidad neta, esa utilidad no entra al sueldo ordinario sino como Ganancia Ocasional con tarifa fija del 15%.',
    loQueDebesSaber: 'La tarifa general es del 15% (20% para loterías y rifas). Además, la venta de casa de habitación tiene hasta 5.000 UVT exentas (Art. 311-1).',
  },
  {
    termino: 'Límite Conjunto del 40% o 1.340 UVT',
    categoria: 'beneficios',
    articulos: 'Art. 336 Num. 3 E.T.',
    definicionSencilla: 'Es el "techo legal" que la DIAN impone para que nadie reste demasiadas deducciones y rentas exentas.',
    analogiaOEjemplo: 'Aunque tengas certificados de medicina prepagada, intereses de vivienda, cuentas AFC y el 25% laboral que sumen $80 millones, la ley solo te permite restar como máximo el 40% de tu ingreso neto o $70.149.000 COP (1.340 UVT en 2026), lo que sea menor.',
    loQueDebesSaber: 'Las deducciones de 72 UVT por dependiente adicional y el 1% de compras con factura electrónica van FUERA de este límite (no se recortan).',
  },
  {
    termino: 'Deducción por Dependientes Económicos',
    categoria: 'beneficios',
    articulos: 'Art. 387 y Art. 336 Num. 2 E.T.',
    definicionSencilla: 'Descuentos que te otorga la ley por tener hijos menores o estudiantes, cónyuge dependiente, o padres que dependan de ti.',
    analogiaOEjemplo: 'Tienes dos beneficios: 1) Deducción general del 10% de tus ingresos brutos (máximo 384 UVT), y 2) Hasta 72 UVT adicionales por cada dependiente (máx. 4 dependientes = 288 UVT extra).',
    loQueDebesSaber: 'Ambos padres pueden tomar a los mismos hijos si demuestran la manutención. Si tu pareja no tiene ingresos, también puedes incluirla.',
  },
  {
    termino: 'Deducción del 1% por Facturas Electrónicas',
    categoria: 'beneficios',
    articulos: 'Art. 336 Num. 5 E.T.',
    definicionSencilla: 'Premio tributario por pedir factura electrónica a tu nombre y con tu cédula en todas tus compras personales pagadas por medios electrónicos.',
    analogiaOEjemplo: 'Si durante el año compraste mercado, ropa, electrodomésticos y viajes por $50 millones y pediste factura electrónica pagando con tarjeta o transferencia, puedes restar $500.000 COP (1%) de tu renta.',
    loQueDebesSaber: 'Tope máximo: 240 UVT anuales ($12.564.000 COP en 2026). No importa si la compra no tiene relación con tu trabajo.',
  },
  {
    termino: 'Retención en la Fuente',
    categoria: 'procedimiento',
    articulos: 'Arts. 365 a 404-1 E.T.',
    definicionSencilla: 'NO es un impuesto nuevo; es un pago anticipado de tu impuesto de renta que te descuentan mes a mes en tus pagos o nómina.',
    analogiaOEjemplo: 'Es como abonar a tu alcancía del impuesto a lo largo del año. Si en el año tu impuesto calculado es de $10 millones, pero tu empresa te retuvo $8 millones, al presentar la declaración solo pagas la diferencia: $2 millones.',
    loQueDebesSaber: 'Si tus retenciones fueron mayores al impuesto final, te queda un "Saldo a Favor" que puedes pedir en devolución o imputar al año siguiente.',
  },
  {
    termino: 'Información Exógena DIAN',
    categoria: 'procedimiento',
    articulos: 'Art. 631 E.T.',
    definicionSencilla: 'Es la base de datos donde todos los bancos, empresas, notarías y comercios le informan a la DIAN cuánto dinero moviste en el año.',
    analogiaOEjemplo: 'Tu banco le reporta a la DIAN cada centavo que te consignaron, tu empleador le reporta tu sueldo, y la notaría le reporta si compraste un lote. ¡La DIAN ya sabe el 95% de tus movimientos antes de que declares!',
    loQueDebesSaber: 'Puedes descargar tu archivo de Consulta de Información Exógena directamente desde la web de la DIAN para no olvidar ninguna cuenta o ingreso.',
  },
  {
    termino: 'Comparación Patrimonial',
    categoria: 'sanciones',
    articulos: 'Arts. 236 y 237 E.T.',
    definicionSencilla: 'Mecanismo donde la DIAN compara cuánto creció tu patrimonio neto frente a los ingresos que declaraste.',
    analogiaOEjemplo: 'Si tu patrimonio creció en $300 millones pero solo declaraste ingresos de $50 millones y no pediste préstamos, la DIAN te preguntará: "¿De dónde salió la plata para comprar eso?". Si no lo justificas, te cobran impuesto sobre los $250M de diferencia.',
    loQueDebesSaber: 'Se justifica con deudas reales registradas (Art. 283), desahorro de cuentas anteriores, reajustes Art. 73 o herencias.',
  },
  {
    termino: 'Tarifa Marginal vs. Tarifa Efectiva',
    categoria: 'procedimiento',
    articulos: 'Art. 241 E.T.',
    definicionSencilla: 'La tarifa marginal es el porcentaje que paga tu "último peso ganado"; la tarifa efectiva es el porcentaje real que pagas sobre todo tu dinero.',
    analogiaOEjemplo: 'Estar en el rango del 28% de la tabla no significa que pagues el 28% de todo tu sueldo, porque tus primeros $57 millones pagan 0%, el siguiente tramo paga 19%, y solo el exceso paga 28%. Tu tarifa efectiva suele ser del 5% al 12%.',
    loQueDebesSaber: 'Nunca rechaces un aumento o ingreso extra por miedo a "subir de rango"; en el sistema tributario colombiano siempre te queda más dinero neto en el bolsillo.',
  },
  {
    termino: 'Beneficio de Auditoría',
    categoria: 'beneficios',
    articulos: 'Art. 689-3 E.T.',
    definicionSencilla: 'Garantía legal que congela las facultades de revisión de la DIAN en solo 6 o 12 meses si aumentas voluntariamente tu impuesto neto frente al año anterior.',
    analogiaOEjemplo: 'En vez de esperar 3 años con la incertidumbre de si la DIAN te auditará, incrementas tu impuesto en $\\ge 35\\%$ y a los 6 meses tu declaración queda blindada e intocable (en firme).',
    loQueDebesSaber: 'Requiere que el impuesto del año anterior sea $\\ge 71$ UVT ($3.716.850 COP en 2026) y presentar y pagar oportunamente.',
  },
  {
    termino: 'Término de Firmeza',
    categoria: 'procedimiento',
    articulos: 'Art. 714 E.T.',
    definicionSencilla: 'Es el plazo máximo legal que tiene la DIAN para investigar, objetar o modificar tu declaración de renta.',
    analogiaOEjemplo: 'La regla general es de 3 años contados desde el vencimiento del plazo. Pasados los 3 años sin que la DIAN te envíe una notificación formal, tu declaración queda "en firme" (cerrada para siempre).',
    loQueDebesSaber: 'Si presentas extemporáneamente, los 3 años se cuentan desde el día en que la presentaste, no desde el vencimiento original.',
  },
  {
    termino: 'Sanción Mínima',
    categoria: 'sanciones',
    articulos: 'Art. 639 E.T.',
    definicionSencilla: 'El valor más bajo que la ley permite cobrar por cualquier sanción tributaria en Colombia.',
    analogiaOEjemplo: 'Equivale a 10 UVT ($523.500 COP en 2026). Incluso si por fórmula de extemporaneidad te daba $80.000 COP, debes pagar como mínimo $523.500 COP.',
    loQueDebesSaber: 'Aplica a extemporaneidad y corrección. Los intereses de mora son lo único que no tiene sanción mínima (se cobran por días exactos).',
  },
];

export const GlosarioBasicoModule: React.FC = () => {
  const { taxYear, uvtValue } = useApp();

  const [activeTab, setActiveTab] = useState<'glosario' | 'aprende' | 'faq' | 'calculadora_topes'>('glosario');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  // Topes Calculator State
  const [calcPatrimonio, setCalcPatrimonio] = useState<number>(230000000);
  const [calcIngresos, setCalcIngresos] = useState<number>(75000000);
  const [calcTarjetas, setCalcTarjetas] = useState<number>(25000000);
  const [calcConsumos, setCalcConsumos] = useState<number>(18000000);
  const [calcConsignaciones, setCalcConsignaciones] = useState<number>(68000000);

  // Topes Oficiales 1.400 UVT y 4.500 UVT
  const topePatrimonioUvt = 4500;
  const topePatrimonioCop = topePatrimonioUvt * uvtValue;
  const topeFlujosUvt = 1400;
  const topeFlujosCop = topeFlujosUvt * uvtValue;

  const superaPatrimonio = calcPatrimonio >= topePatrimonioCop;
  const superaIngresos = calcIngresos >= topeFlujosCop;
  const superaTarjetas = calcTarjetas >= topeFlujosCop;
  const superaConsumos = calcConsumos >= topeFlujosCop;
  const superaConsignaciones = calcConsignaciones >= topeFlujosCop;

  const obligadoADeclarar =
    superaPatrimonio || superaIngresos || superaTarjetas || superaConsumos || superaConsignaciones;

  // Filtrado de glosario
  const filteredTerms = GLOSARIO_DATA.filter((item) => {
    const matchesSearch =
      item.termino.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definicionSencilla.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.articulos.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'todos' || item.categoria === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div id="pane-glosario" className="module-pane active" style={{ paddingBottom: '30px' }}>
      {/* HEADER */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              📚 Conocimientos Básicos &amp; Glosario Tributario
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Aprende el sistema fiscal colombiano sin enredos: conceptos clave explicados con analogías cotidianas, reglas del Estatuto Tributario y preguntas frecuentes.
            </p>
          </div>

          <div className="tab-pill-group" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${activeTab === 'glosario' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('glosario')}
            >
              📖 Diccionario A-Z ({GLOSARIO_DATA.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'aprende' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('aprende')}
            >
              🎓 Aprende desde Cero
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'calculadora_topes' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('calculadora_topes')}
            >
              🚦 ¿Debo Declarar Renta?
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'faq' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('faq')}
            >
              ❓ Preguntas Frecuentes
            </button>
          </div>
        </div>

        {/* BANNER UVT INFORMATIVO */}
        <div
          style={{
            marginTop: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(2, 132, 199, 0.08)',
            border: '1px solid rgba(2, 132, 199, 0.25)',
            fontSize: '12px',
            lineHeight: '1.55',
            color: 'var(--text-secondary)',
          }}
        >
          <strong style={{ color: '#0284c7' }}>💡 Regla Base de Conversión:</strong>
          <span style={{ marginLeft: '6px' }}>
            Año Gravable <strong>{taxYear}</strong> — Valor de 1 UVT = <strong>{formatCOP(uvtValue)} COP</strong>.
          </span>
          <span style={{ marginLeft: '12px', color: 'var(--text-muted)' }}>
            Tope de 1.400 UVT = <strong>{formatCOP(1400 * uvtValue)} COP</strong> | Tope de 4.500 UVT = <strong>{formatCOP(4500 * uvtValue)} COP</strong>.
          </span>
        </div>
      </div>

      {/* PESTAÑA 1: GLOSARIO INTERACTIVO */}
      {activeTab === 'glosario' && (
        <div>
          {/* BUSCADOR Y FILTROS */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div style={{ flex: '1 1 260px' }}>
              <input
                type="text"
                className="text-input"
                placeholder="🔍 Buscar término, concepto o artículo (ej. UVT, patrimonio, cesantías, 241...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                className={`btn btn-xs ${selectedCategory === 'todos' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedCategory('todos')}
              >
                Todos ({GLOSARIO_DATA.length})
              </button>
              <button
                className={`btn btn-xs ${selectedCategory === 'patrimonio' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedCategory('patrimonio')}
              >
                🏢 Patrimonio &amp; Deudas
              </button>
              <button
                className={`btn btn-xs ${selectedCategory === 'ingresos' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedCategory('ingresos')}
              >
                💼 Cédulas &amp; Ingresos
              </button>
              <button
                className={`btn btn-xs ${selectedCategory === 'beneficios' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedCategory('beneficios')}
              >
                🎁 Beneficios &amp; Deducciones
              </button>
              <button
                className={`btn btn-xs ${selectedCategory === 'procedimiento' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedCategory('procedimiento')}
              >
                📜 DIAN &amp; Procedimiento
              </button>
              <button
                className={`btn btn-xs ${selectedCategory === 'sanciones' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedCategory('sanciones')}
              >
                ⚖️ Sanciones &amp; Firmeza
              </button>
            </div>
          </div>

          {/* LISTA DE TÉRMINOS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredTerms.map((item, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  className="card-header"
                  style={{
                    background:
                      item.categoria === 'patrimonio'
                        ? 'rgba(59, 130, 246, 0.08)'
                        : item.categoria === 'ingresos'
                        ? 'rgba(16, 185, 129, 0.08)'
                        : item.categoria === 'beneficios'
                        ? 'rgba(139, 92, 246, 0.08)'
                        : item.categoria === 'sanciones'
                        ? 'rgba(239, 68, 68, 0.08)'
                        : 'rgba(245, 158, 11, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div className="card-title" style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {item.termino}
                  </div>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.articulos}
                  </span>
                </div>

                <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', lineHeight: '1.6' }}>
                  <div>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
                      Definición Clara:
                    </strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.definicionSencilla}</span>
                  </div>

                  <div style={{ background: 'var(--bg-subtle)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid var(--primary)' }}>
                    <strong style={{ color: 'var(--primary)', display: 'block', fontSize: '11px', marginBottom: '2px' }}>
                      💡 Analogía o Ejemplo Cotidiano:
                    </strong>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{item.analogiaOEjemplo}</span>
                  </div>

                  <div style={{ marginTop: 'auto', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-subtle)', paddingTop: '8px' }}>
                    📌 <strong>Dato clave:</strong> {item.loQueDebesSaber}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTerms.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              🔍 No se encontraron términos que coincidan con <strong>"{searchTerm}"</strong> en la categoría seleccionada.
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 2: APRENDE DESDE CERO */}
      {activeTab === 'aprende' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* LECCIÓN 1: ¿QUIÉN ESTÁ OBLIGADO? */}
          <div className="card">
            <div className="card-header" style={{ background: 'rgba(59, 130, 246, 0.08)' }}>
              <div className="card-title" style={{ color: 'var(--primary)', fontSize: '14px' }}>
                🎓 Lección 1: Los 5 Topes para Saber si Debes Declarar Renta (Año Gravable {taxYear})
              </div>
            </div>
            <div className="card-body" style={{ fontSize: '12.5px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
              <p>
                En Colombia, si cumples <strong>al menos UNO solo</strong> de estos 5 topes fijados por el Estatuto Tributario (Art. 592 y 594-3), estás obligado por ley a presentar tu declaración de renta ante la DIAN:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', margin: '14px 0' }}>
                <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                  <strong>1. Patrimonio Bruto (4.500 UVT):</strong>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)', margin: '4px 0' }}>
                    &ge; {formatCOP(topePatrimonioCop)} COP
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Suma total de tus casas, carros, cuentas y activos a dic 31 (sin restar deudas).
                  </span>
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                  <strong>2. Ingresos Brutos (1.400 UVT):</strong>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--emerald)', margin: '4px 0' }}>
                    &ge; {formatCOP(topeFlujosCop)} COP
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Total de sueldos, honorarios, ventas o arriendos recibidos en todo el año.
                  </span>
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                  <strong>3. Consumos con Tarjetas (1.400 UVT):</strong>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#d97706', margin: '4px 0' }}>
                    &ge; {formatCOP(topeFlujosCop)} COP
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Compras realizadas con tarjetas de crédito durante el año.
                  </span>
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px', borderLeft: '4px solid #8b5cf6' }}>
                  <strong>4. Compras y Consumos Totales (1.400 UVT):</strong>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#7c3aed', margin: '4px 0' }}>
                    &ge; {formatCOP(topeFlujosCop)} COP
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Compras acumuladas en el año (facturadas con tu cédula o medios electrónicos).
                  </span>
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px', borderLeft: '4px solid #ec4899' }}>
                  <strong>5. Consignaciones Bancarias (1.400 UVT):</strong>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#db2777', margin: '4px 0' }}>
                    &ge; {formatCOP(topeFlujosCop)} COP
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Total acumulado de dineros que entraron a tus cuentas bancarias, Nequi o Daviplata.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* LECCIÓN 2: ¿DECLARAR ES PAGAR? */}
          <div className="card">
            <div className="card-header" style={{ background: 'rgba(16, 185, 129, 0.08)' }}>
              <div className="card-title" style={{ color: 'var(--emerald)', fontSize: '14px' }}>
                🎓 Lección 2: ¿Estar Obligado a Declarar Significa Tener que Pagar?
              </div>
            </div>
            <div className="card-body" style={{ fontSize: '12.5px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--rose)', margin: '0 0 6px 0' }}>
                    ❌ El Mito Común:
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px' }}>
                    "Si superé el tope de consignaciones porque presté mi cuenta para que mi mamá recibiera un dinero, ¡voy a tener que pagar una millonada de impuesto!"
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--emerald)', margin: '0 0 6px 0' }}>
                    ✅ La Realidad Jurídica:
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px' }}>
                    <strong>NO.</strong> Declarar es únicamente un <em>deber formal</em> de contarle a la DIAN tu situación financiera. El impuesto a pagar se calcula solo sobre tu <strong>Renta Líquida (utilidad real)</strong>. Si tus ingresos son bajos o tus retenciones en la fuente fueron altas, el impuesto a pagar puede ser <strong>$0 COP</strong> o incluso arrojar un <strong>Saldo a Favor</strong> a tu favor.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* LECCIÓN 3: EL EMBUDO DE LA DEPURACIÓN */}
          <div className="card">
            <div className="card-header" style={{ background: 'rgba(139, 92, 246, 0.08)' }}>
              <div className="card-title" style={{ color: '#7c3aed', fontSize: '14px' }}>
                🎓 Lección 3: El Embudo de la Depuración Cedular (Cómo se Llega al Impuesto)
              </div>
            </div>
            <div className="card-body" style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: '6px', borderLeft: '4px solid #3b82f6' }}>
                  <strong>1. Ingresos Brutos Totales:</strong> Todo lo que recibiste en el año (sueldo, honorarios, arriendos).
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: '6px', borderLeft: '4px solid #10b981' }}>
                  <strong>2. Menos INCRNGO:</strong> Restas salud y pensión obligatoria (sin ningún límite).
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: '6px', borderLeft: '4px solid #f59e0b' }}>
                  <strong>3. Menos Costos y Gastos Procedentes:</strong> Si eres independiente o arriendas inmuebles.
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: '6px', borderLeft: '4px solid #8b5cf6' }}>
                  <strong>4. Menos Rentas Exentas y Deducciones (Topadas al 40% o 1.340 UVT):</strong> 25% laboral, medicina prepagada, intereses de vivienda, AFC.
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: '6px', borderLeft: '4px solid #ec4899' }}>
                  <strong>5. Menos Deducciones Extra-Cupo:</strong> 72 UVT por dependiente adicional (hasta 4) + 1% de compras con factura electrónica.
                </div>
                <div style={{ padding: '12px 14px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', border: '2px solid var(--emerald)', fontWeight: 700, color: 'var(--emerald)' }}>
                  🎯 = Renta Líquida Gravable: Se busca en la tabla del Art. 241 (¡Los primeros 1.090 UVT pagan $0 COP!). Al impuesto resultante le restas tus retenciones en la fuente.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: CALCULADORA RÁPIDA DE TOPES */}
      {activeTab === 'calculadora_topes' && (
        <div className="card" style={{ border: '2px solid var(--primary-border)' }}>
          <div className="card-header" style={{ background: 'var(--primary-light)' }}>
            <div className="card-title" style={{ color: 'var(--primary)', fontSize: '14px' }}>
              🚦 Semáforo de Obligación de Declarar Renta (Año Gravable {taxYear})
            </div>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Ingresa tus cifras anuales estimadas. Si superas <strong>al menos uno de los topes</strong>, el semáforo cambiará a rojo indicando tu obligación legal de presentar el Formulario 210.
            </p>

            <div className="responsive-grid-split" style={{ gap: '16px', marginBottom: '20px' }}>
              <div>
                <div className="input-field" style={{ marginBottom: '10px' }}>
                  <label className="input-label">1. Patrimonio Bruto a 31 de Diciembre (Tope: {formatCOP(topePatrimonioCop)})</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(calcPatrimonio, false)}
                      onChange={(e) => setCalcPatrimonio(parseCOP(e.target.value))}
                    />
                  </div>
                </div>

                <div className="input-field" style={{ marginBottom: '10px' }}>
                  <label className="input-label">2. Total Ingresos Brutos en el Año (Tope: {formatCOP(topeFlujosCop)})</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(calcIngresos, false)}
                      onChange={(e) => setCalcIngresos(parseCOP(e.target.value))}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">3. Consumos con Tarjeta de Crédito (Tope: {formatCOP(topeFlujosCop)})</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(calcTarjetas, false)}
                      onChange={(e) => setCalcTarjetas(parseCOP(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="input-field" style={{ marginBottom: '10px' }}>
                  <label className="input-label">4. Compras y Consumos Totales (Tope: {formatCOP(topeFlujosCop)})</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(calcConsumos, false)}
                      onChange={(e) => setCalcConsumos(parseCOP(e.target.value))}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label className="input-label">5. Consignaciones / Billeteras Digitales (Tope: {formatCOP(topeFlujosCop)})</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="currency-input"
                      value={formatCOP(calcConsignaciones, false)}
                      onChange={(e) => setCalcConsignaciones(parseCOP(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RESULTADO DEL SEMÁFORO */}
            <div
              style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: obligadoADeclarar ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                border: `2px solid ${obligadoADeclarar ? 'var(--rose)' : 'var(--emerald)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>{obligadoADeclarar ? '🔴' : '🟢'}</span>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: obligadoADeclarar ? 'var(--rose)' : 'var(--emerald)' }}>
                    {obligadoADeclarar
                      ? 'ESTÁS OBLIGADO A DECLARAR RENTA ANTE LA DIAN'
                      : 'NO ESTÁS OBLIGADO A DECLARAR RENTA POR ESTE AÑO'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    {obligadoADeclarar
                      ? 'Superaste al menos uno de los topes fijados en el Estatuto Tributario.'
                      : 'Todas tus cifras se encuentran por debajo de los topes legales.'}
                  </div>
                </div>
              </div>

              {obligadoADeclarar && (
                <div style={{ marginTop: '10px', fontSize: '11.5px', lineHeight: '1.6' }}>
                  <strong>Topes superados:</strong>
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                    {superaPatrimonio && <li>Patrimonio Bruto: {formatCOP(calcPatrimonio)} &ge; {formatCOP(topePatrimonioCop)}</li>}
                    {superaIngresos && <li>Ingresos Brutos: {formatCOP(calcIngresos)} &ge; {formatCOP(topeFlujosCop)}</li>}
                    {superaTarjetas && <li>Consumos con Tarjetas: {formatCOP(calcTarjetas)} &ge; {formatCOP(topeFlujosCop)}</li>}
                    {superaConsumos && <li>Compras Totales: {formatCOP(calcConsumos)} &ge; {formatCOP(topeFlujosCop)}</li>}
                    {superaConsignaciones && <li>Consignaciones Bancarias: {formatCOP(calcConsignaciones)} &ge; {formatCOP(topeFlujosCop)}</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 4: PREGUNTAS FRECUENTES (FAQ) */}
      {activeTab === 'faq' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            {
              q: '¿Si le presté mi cuenta bancaria a un amigo para una transferencia, debo pagar impuesto?',
              a: 'No necesariamente pagas impuesto por el monto total, pero esa consignación SUMA para el tope de las 1.400 UVT de consignaciones bancarias. Si superas el tope, quedarás obligado a declarar. En tu declaración debes poder demostrar el origen de los recursos para que no te lo clasifiquen como ingreso propio gravable.',
            },
            {
              q: '¿Las transferencias entre mis propias cuentas (ej. de Bancolombia a Nequi) pagan impuesto?',
              a: 'No pagan impuesto de renta porque es tu propio dinero moviéndose entre tus bolsillos. Sin embargo, en el reporte de información exógena puede aparecer el movimiento. Por eso es vital clasificarlo correctamente como transferencia entre cuentas propias y no como nuevo ingreso.',
            },
            {
              q: '¿Cómo demuestro la venta de un carro usado?',
              a: 'Debes conservar el contrato de compraventa y el certificado de tradición del RUNT donde conste el traspaso formal. Si poseíste el vehículo por menos de 2 años, la utilidad (si la hubo) es renta ordinaria; si fue por 2 años o más, es ganancia ocasional. Si lo vendiste con pérdida frente al costo fiscal, no hay impuesto.',
            },
            {
              q: '¿Qué pasa si presento mi declaración pero no tengo dinero para pagar en ese momento?',
              a: 'En personas naturales (Formulario 210), la declaración presentada dentro del plazo es 100% válida incluso si no pagas el mismo día. No te cobrarán sanción por extemporaneidad. Lo que sí se generará son intereses moratorios diarios sobre el saldo adeudado hasta el día en que realices el pago.',
            },
            {
              q: '¿Puedo deducir los gastos de estudio de mis hijos?',
              a: 'Sí. A través de la deducción por dependientes económicos (Art. 387 E.T.), puedes deducir el 10% de tus ingresos brutos si tus hijos tienen hasta 23 años y están estudiando en instituciones de educación superior formal o de bachillerato.',
            },
          ].map((faq, idx) => (
            <div key={idx} className="card">
              <div className="card-header" style={{ background: 'var(--bg-subtle)' }}>
                <div className="card-title" style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                  ❓ {faq.q}
                </div>
              </div>
              <div className="card-body" style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
