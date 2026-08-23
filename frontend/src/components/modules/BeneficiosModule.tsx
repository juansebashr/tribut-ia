import React, { useState } from 'react';

interface BeneficioItem {
  id: string;
  categoria: string;
  categoriaLabel: string;
  articulo: string;
  titulo: string;
  concepto: string;
  aplicacion: string;
  tope: string;
  beneficio: string;
}

const BENEFICIOS_LIST: BeneficioItem[] = [
  {
    id: 'art73',
    categoria: 'ajustes_patrimonio',
    categoriaLabel: 'Ajuste de Activos & Bienes',
    articulo: 'Art. 73 E.T. & DUR 1.2.1.17.21',
    titulo: 'Reajuste Fiscal Multiplicador DANE para Personas Naturales',
    concepto: 'Permite actualizar el costo de adquisición de bienes raíces y acciones multiplicando por los factores históricos del DANE (1955-2024).',
    aplicacion: 'Venta de casas, apartamentos, lotes, fincas o acciones con posesión superior a 2 años.',
    tope: 'Factor oficial DANE publicado anualmente por el Ministerio de Hacienda.',
    beneficio: 'Incrementa legalmente el costo fiscal hasta en 36x, reduciendo drásticamente la Ganancia Ocasional al 15%.',
  },
  {
    id: 'afc_vivienda',
    categoria: 'rentas_exentas',
    categoriaLabel: 'Rentas Exentas',
    articulo: 'Art. 311-1 y 126-4 E.T.',
    titulo: 'Exención de 5.000 UVT en Venta de Casa de Habitación',
    concepto: 'Exención directa sobre las primeras 5.000 UVT de ganancia ocasional obtenida en la venta de la casa o apartamento de habitación.',
    aplicacion: 'La totalidad o parte de la utilidad se consigna en Cuentas AFC o se destina a la adquisición de otra vivienda.',
    tope: '5.000 UVT ($261.750.000 COP en 2026). El valor del inmueble no debe superar 23.000 UVT ($1.204.050.000 COP).',
    beneficio: 'Impuesto de Ganancia Ocasional del 0% sobre las primeras 5.000 UVT de ganancia neta.',
  },
  {
    id: 'ganancias_exentas_herencias_art307',
    categoria: 'rentas_exentas',
    categoriaLabel: 'Rentas Exentas & Ganancias Ocasionales',
    articulo: 'Art. 307 E.T.',
    titulo: 'Ganancias Ocasionales Exentas en Herencias, Legados y Donaciones',
    concepto: 'Exención directa en asignaciones por causa de muerte y donaciones: hasta 13.000 UVT en la vivienda del causante, hasta 6.500 UVT en otros inmuebles por heredero, y las primeras 3.250 UVT en herencia general o porción conyugal.',
    aplicacion: 'Sucesiones ilíquidas, herencias, legados y donaciones recibidas por personas naturales.',
    tope: '13.000 UVT ($680.550.000 COP en 2026) en vivienda del causante; 6.500 UVT ($340.275.000) en otros inmuebles; 3.250 UVT ($170.137.500) en herencia general; 20% en donaciones (máx 1.625 UVT).',
    beneficio: 'Impuesto del 0% de Ganancia Ocasional sobre los montos exentos, tributando únicamente el excedente al 15%.',
  },
  {
    id: 'indemnizaciones_seguros_vida_art303_1',
    categoria: 'rentas_exentas',
    categoriaLabel: 'Rentas Exentas & Ganancias Ocasionales',
    articulo: 'Art. 303-1 y 223 E.T.',
    titulo: 'Indemnizaciones por Seguros de Vida (Exención de 3.250 UVT)',
    concepto: 'Las indemnizaciones pagadas por compañías de seguros por pólizas de seguro de vida están exentas del impuesto de ganancia ocasional hasta por 3.250 UVT. Las indemnizaciones por daño emergente o invalidez son 100% INCRNGO.',
    aplicacion: 'Beneficiarios de pólizas de seguro de vida o indemnizaciones por daño emergente / incapacidad.',
    tope: 'Hasta 3.250 UVT ($170.137.500 COP en 2026) de ganancia ocasional exenta. Solo el exceso tributa al 15%.',
    beneficio: 'Impuesto del 0% sobre las primeras 3.250 UVT de la indemnización percibida.',
  },
  {
    id: 'seguros_pension_voluntaria_fpv',
    categoria: 'rentas_exentas',
    categoriaLabel: 'Rentas Exentas',
    articulo: 'Art. 126-1 y 126-4 E.T.',
    titulo: 'Seguros de Vida con Pensión Voluntaria y Ahorro Previsional (FPV)',
    concepto: 'Las primas y aportes pagados a seguros de vida estructurados como planes de pensión voluntaria o capitalización previsional administrados por aseguradoras de vida gozan del tratamiento de Renta Exenta.',
    aplicacion: 'Aportes voluntarios por nómina o directos a seguros de vida con pensión voluntaria o fondos FPV.',
    tope: 'Hasta el 30% del ingreso laboral o tributario del año, máximo 3.800 UVT anuales ($198.930.000 COP en 2026).',
    beneficio: 'Disminución directa de la base de retención en la fuente mensual y renta exenta en la declaración anual.',
  },
  {
    id: 'componente_inflacionario',
    categoria: 'incrngo',
    categoriaLabel: 'INCRNGO',
    articulo: 'Art. 38, 39, 40-1 y 41 E.T.',
    titulo: 'Componente Inflacionario de Rendimientos Financieros para Personas Naturales',
    concepto: 'La porción de los rendimientos financieros percibidos por personas naturales no obligadas a llevar contabilidad que corresponde a la inflación del año no constituye renta ni ganancia ocasional (INCRNGO).',
    aplicacion: 'Cuentas de ahorro, CDTs, pagarés en entidades financieras vigiladas por SFC, FICs y fondos mutuos.',
    tope: 'Porcentaje oficial fijado anualmente por Decreto Reglamentario (ej. 55,43% en 2023, 60,32% en 2024).',
    beneficio: 'Se resta directamente en la Casilla 59 del Formulario 210 sin estar sujeto al límite del 40% ni de las 1.340 UVT.',
  },
  {
    id: 'salud_pension',
    categoria: 'incrngo',
    categoriaLabel: 'INCRNGO',
    articulo: 'Art. 55 y 56 E.T.',
    titulo: 'Aportes Obligatorios a Salud y Pensión',
    concepto: 'Los aportes obligatorios que realiza el trabajador o independiente al Sistema General de Seguridad Social en Salud y Pensiones no constituyen renta ni ganancia ocasional.',
    aplicacion: 'Aportes a EPS, AFP obligatoria y Fondo de Solidaridad Pensional (FSP).',
    tope: '100% de los aportes obligatorios legales efectuados durante el año fiscal.',
    beneficio: 'Se restan directamente del ingreso bruto sin estar sujetos al límite del 40% ni de las 1.340 UVT.',
  },
  {
    id: 'dependientes',
    categoria: 'deducciones',
    categoriaLabel: 'Deducciones',
    articulo: 'Art. 387 E.T. y Art. 336 Numeral 2',
    titulo: 'Deducción por Dependientes Económicos (General y Adicional 72 UVT)',
    concepto: 'Deducción del 10% del ingreso bruto laboral hasta 384 UVT por dependiente general, más deducción adicional de hasta 72 UVT por cada dependiente adicional (máx 4).',
    aplicacion: 'Hijos menores de 18 años, hijos entre 18 y 23 años que estudien, cónyuge o padres en situación de dependencia económica.',
    tope: 'General: 384 UVT. Adicional: 72 UVT por dependiente (hasta 4 dependientes = 288 UVT adicionales no sujetas al 40%).',
    beneficio: 'Disminución directa de la base gravable de la Cédula General.',
  },
  {
    id: 'intereses_vivienda',
    categoria: 'deducciones',
    categoriaLabel: 'Deducciones',
    articulo: 'Art. 119 E.T.',
    titulo: 'Deducción por Intereses y Corrección Monetaria en Préstamos de Vivienda',
    concepto: 'Deducción de los intereses pagados en créditos hipotecarios o leasing habitacional destinados a la adquisición de vivienda del contribuyente.',
    aplicacion: 'Certificado anual expedido por la entidad financiera o banco acreedor.',
    tope: 'Hasta 1.200 UVT anuales ($62.820.000 COP en 2026).',
    beneficio: 'Deducción aplicable dentro del límite global del 40% / 1.340 UVT.',
  },
  {
    id: 'medicina_prepagada',
    categoria: 'deducciones',
    categoriaLabel: 'Deducciones',
    articulo: 'Art. 387 E.T.',
    titulo: 'Deducción por Medicina Prepagada y Planes Complementarios',
    concepto: 'Deducción mensual de hasta 16 UVT por pagos de medicina prepagada, planes complementarios o seguros de salud para el contribuyente, cónyuge o dependientes.',
    aplicacion: 'Certificado anual expedido por la entidad de medicina prepagada o aseguradora.',
    tope: 'Hasta 192 UVT anuales ($10.051.200 COP en 2026). Sujeto al límite del 40% / 1.340 UVT.',
    beneficio: 'Disminución directa de la base gravable laboral de la Cédula General.',
  },
  {
    id: 'intereses_icetex',
    categoria: 'deducciones',
    categoriaLabel: 'Deducciones',
    articulo: 'Art. 119 Parágrafo 2 E.T.',
    titulo: 'Deducción de Intereses en Créditos Educativos ICETEX',
    concepto: 'Los intereses pagados por préstamos educativos otorgados por el ICETEX para la educación superior propia o de dependientes económicos son deducibles en la Cédula General.',
    aplicacion: 'Créditos educativos de pregrado o posgrado certificados anualmente por el ICETEX.',
    tope: 'Hasta 100 UVT anuales ($5.235.000 COP en 2026). Sujeto al límite global del 40% / 1.340 UVT.',
    beneficio: 'Deducción directa de la base gravable de la Cédula General.',
  },
  {
    id: 'exenta_25',
    categoria: 'rentas_exentas',
    categoriaLabel: 'Rentas Exentas',
    articulo: 'Art. 206 Numeral 10 E.T.',
    titulo: 'Renta Exenta Laboral del 25%',
    concepto: 'El 25% de los pagos laborales netos está exento del impuesto sobre la renta.',
    aplicacion: 'Aplica a todos los trabajadores asalariados y prestadores de servicios que no hayan vinculado 2 o más trabajadores.',
    tope: '790 UVT anuales ($41.356.500 COP en 2026). Sujeto al límite conjunto del 40% / 1.340 UVT.',
    beneficio: 'Exención automática tras restar INCRNGO y demás deducciones imputables.',
  },
  {
    id: 'factura_electronica',
    categoria: 'deducciones',
    categoriaLabel: 'Deducciones',
    articulo: 'Art. 336 Numeral 5 E.T.',
    titulo: 'Deducción del 1% por Compras con Factura Electrónica',
    concepto: 'Deducción especial del 1% sobre el valor total de las compras de bienes o servicios soportadas con factura electrónica de venta y pagadas por medios electrónicos.',
    aplicacion: 'Compras cotidianas de bienes y servicios sin necesidad de que tengan relación de causalidad.',
    tope: 'Hasta 240 UVT anuales ($12.564.000 COP en 2026). No está sujeta al límite conjunto del 40% / 1.340 UVT.',
    beneficio: 'Deducción directa adicional fuera del límite del 40%.',
  },
  {
    id: 'descuento_donaciones_esal',
    categoria: 'descuentos',
    categoriaLabel: 'Descuentos Tributarios',
    articulo: 'Art. 257 y 258 E.T.',
    titulo: 'Descuento Tributario del 25% por Donaciones a ESAL (Régimen Especial)',
    concepto: 'Las donaciones a fundaciones y entidades sin ánimo de lucro del Régimen Tributario Especial (RTE) otorgan un descuento directo en el impuesto a pagar del 25% del valor donado.',
    aplicacion: 'Personas naturales (Casilla 129 Formulario 210) y jurídicas (Formulario 110) con certificado de donación.',
    tope: 'Hasta el 25% del impuesto básico de renta a cargo en el año gravable (Art. 258 E.T.).',
    beneficio: 'Resta directa $1 por cada $4 donados sobre el valor final del impuesto a pagar.',
  },
  {
    id: 'primer_empleo_jovenes',
    categoria: 'deducciones',
    categoriaLabel: 'Deducciones Laborales',
    articulo: 'Art. 108-5 E.T.',
    titulo: 'Deducción del 120% de Salarios por Primer Empleo (Jóvenes < 28 años)',
    concepto: 'Los empleadores pueden deducir el 120% de los pagos salariales a empleados menores de 28 años en su primer empleo formal.',
    aplicacion: 'Personas naturales con establecimiento comercial o negocios y personas jurídicas.',
    tope: 'Hasta 115 UVT mensuales por empleado ($6.020.250 COP/mes en 2026) por un periodo de hasta 2 años.',
    beneficio: 'Deducción fiscal adicional del 20% sobre el gasto real de nómina pagado.',
  },
  {
    id: 'trabajadores_discapacidad',
    categoria: 'deducciones',
    categoriaLabel: 'Deducciones Laborales',
    articulo: 'Ley 361 de 1997 Art. 31',
    titulo: 'Deducción del 200% de Salarios y Prestaciones a Personas con Discapacidad',
    concepto: 'Los empleadores que contraten trabajadores con discapacidad no inferior al 25% pueden deducir de su renta el 200% de los salarios y prestaciones sociales pagadas.',
    aplicacion: 'Empleadores personas naturales y jurídicas con certificado de discapacidad del empleado.',
    tope: '200% de los salarios y prestaciones pagados en el año gravable.',
    beneficio: 'Duplica el gasto fiscal deducible de nómina (por cada $10M pagados deduce $20M).',
  },
  {
    id: 'energias_renovables_fnce',
    categoria: 'deducciones',
    categoriaLabel: 'Inversiones Ambientales & FNCE',
    articulo: 'Ley 1715 de 2014 & Ley 2099 de 2021',
    titulo: 'Deducción del 50% de Inversión en Energía Solar y Fuentes Renovables (FNCE)',
    concepto: 'Inversionistas en proyectos de generación solar, eólica o biomasa pueden deducir hasta el 50% del valor total invertido en un plazo de hasta 15 años, junto con depreciación acelerada en 3 años.',
    aplicacion: 'Personas naturales y jurídicas con proyectos de generación o autogeneración certificados por la UPME.',
    tope: 'Hasta el 50% de la renta líquida del contribuyente en cada año gravable.',
    beneficio: 'Deducción del 50% de la inversión + depreciación del 33,33% anual + exención de aranceles e IVA.',
  },
  {
    id: 'auditoria',
    categoria: 'auditoria_sanciones',
    categoriaLabel: 'Auditoría & Procedimiento',
    articulo: 'Art. 689-3 E.T.',
    titulo: 'Beneficio de Auditoría (Firmeza en 6 o 12 Meses)',
    concepto: 'Firmeza definitiva anticipada de la declaración de renta aumentando el impuesto neto respecto al año anterior.',
    aplicacion: 'Declaraciones presentadas oportunamente con pago total e incremento >= 35% (6 meses) o >= 25% (12 meses).',
    tope: 'Impuesto del año anterior mínimo de 71 UVT ($3.716.850 COP en 2026).',
    beneficio: 'Certeza jurídica total y pérdida de facultades de revisión por parte de la DIAN en tiempo récord.',
  },
];

export const BeneficiosModule: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredBeneficios = BENEFICIOS_LIST.filter((item) => {
    if (activeCategory !== 'all' && item.categoria !== activeCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.titulo.toLowerCase().includes(q) ||
        item.articulo.toLowerCase().includes(q) ||
        item.concepto.toLowerCase().includes(q) ||
        item.beneficio.toLowerCase().includes(q) ||
        item.categoriaLabel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div id="pane-beneficios" className="module-pane active" style={{ paddingBottom: '30px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          🎁 Catálogo Completo de Beneficios y Alivios Tributarios
        </h2>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
          Guía legal exhaustiva con todos los beneficios tributarios del Estatuto Tributario colombiano (INCRNGO,
          Deducciones, Rentas Exentas, Descuentos Tributarios y Ajustes Patrimoniales).
        </p>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <input
            type="text"
            id="search-beneficios-input"
            className="text-input"
            placeholder="🔍 Buscar beneficio por nombre, artículo o palabra clave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', fontSize: '12.5px' }}
          />
        </div>
        <div className="beneficio-filter-bar" style={{ marginBottom: 0, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${activeCategory === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveCategory('all')}
          >
            Todos ({BENEFICIOS_LIST.length})
          </button>
          <button
            className={`btn btn-sm ${activeCategory === 'ajustes_patrimonio' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveCategory('ajustes_patrimonio')}
          >
            🏢 Ajuste Activos &amp; Bienes
          </button>
          <button
            className={`btn btn-sm ${activeCategory === 'incrngo' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveCategory('incrngo')}
          >
            INCRNGO
          </button>
          <button
            className={`btn btn-sm ${activeCategory === 'deducciones' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveCategory('deducciones')}
          >
            Deducciones
          </button>
          <button
            className={`btn btn-sm ${activeCategory === 'rentas_exentas' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveCategory('rentas_exentas')}
          >
            Rentas Exentas &amp; GO
          </button>
          <button
            className={`btn btn-sm ${activeCategory === 'descuentos' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveCategory('descuentos')}
          >
            💳 Descuentos
          </button>
          <button
            className={`btn btn-sm ${activeCategory === 'auditoria_sanciones' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveCategory('auditoria_sanciones')}
          >
            ⚖️ Auditoría &amp; Sanciones
          </button>
        </div>
      </div>

      {/* LIST OF BENEFITS */}
      <div
        id="beneficios-list-container"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}
      >
        {filteredBeneficios.map((b) => (
          <div
            key={b.id}
            className="beneficio-card card"
            style={{
              padding: '16px',
              borderLeft: '4px solid var(--primary)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'var(--card-bg)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <span
                  style={{
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {b.categoriaLabel}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>{b.articulo}</span>
              </div>

              <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                {b.titulo}
              </h3>

              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 10px 0' }}>
                {b.concepto}
              </p>

              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <strong>📌 Aplicación:</strong> {b.aplicacion}
              </div>

              <div style={{ fontSize: '11.5px', color: '#b45309', marginBottom: '10px' }}>
                <strong>⚠️ Tope / Límite:</strong> {b.tope}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '11.5px',
                color: '#059669',
                fontWeight: 600,
              }}
            >
              🎉 <strong>Beneficio:</strong> {b.beneficio}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
