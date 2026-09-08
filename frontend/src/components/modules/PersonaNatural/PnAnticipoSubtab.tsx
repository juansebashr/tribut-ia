import React, { useState } from 'react';
import type { PersonaNaturalInput, PersonaNaturalOutput } from '../../../types/tax';
import { formatCOP, parseCOP } from '../../../utils/formatters';

interface PnAnticipoSubtabProps {
  inputs: PersonaNaturalInput;
  setInputs: React.Dispatch<React.SetStateAction<PersonaNaturalInput>>;
  result: PersonaNaturalOutput | null;
  onNavigateToCalc: () => void;
  onNavigateToF210: () => void;
  showToast: (msg: string, type: 'info' | 'success' | 'warning' | 'error', duration?: number) => void;
}

export const PnAnticipoSubtab: React.FC<PnAnticipoSubtabProps> = ({
  inputs,
  setInputs,
  result,
  onNavigateToCalc,
  onNavigateToF210,
  showToast,
}) => {
  // Impuesto neto actual (Casilla 126)
  const impuestoActualDefault = result?.impuesto_neto_renta ?? 22316000;
  const [impuestoActual, setImpuestoActual] = useState<number>(impuestoActualDefault);

  // Impuesto neto año anterior (Casilla 126 del año previo - ej. 2024 para Juan Pablo: $31.540.000)
  const [impuestoAnterior, setImpuestoAnterior] = useState<number>(31540000);

  // Retenciones en la fuente practicadas en el año (Casilla 132)
  const retencionesDefault = inputs.retenciones_fuente_practicadas > 0 ? inputs.retenciones_fuente_practicadas : 10722300;
  const [retenciones, setRetenciones] = useState<number>(retencionesDefault);

  // Antigüedad como declarante: 25% (1er año), 50% (2do año), 75% (3er año o posterior)
  const [porcentajeAnticipo, setPorcentajeAnticipo] = useState<number>(0.75);

  // Cálculos Art. 807 E.T.
  // Método 1: Basado en el año gravable corriente
  const baseMetodo1 = impuestoActual;
  const anticipoBrutoMetodo1 = baseMetodo1 * porcentajeAnticipo;
  const anticipoNetoMetodo1 = Math.max(0, Math.round((anticipoBrutoMetodo1 - retenciones) / 1000) * 1000);

  // Método 2: Basado en el promedio de los 2 últimos años
  const baseMetodo2 = (impuestoActual + impuestoAnterior) / 2;
  const anticipoBrutoMetodo2 = baseMetodo2 * porcentajeAnticipo;
  const anticipoNetoMetodo2 = Math.max(0, Math.round((anticipoBrutoMetodo2 - retenciones) / 1000) * 1000);

  // Análisis de conveniencia de liquidez
  const metodoRecomendado = anticipoNetoMetodo1 <= anticipoNetoMetodo2 ? 1 : 2;
  const ahorroLiquidez = Math.abs(anticipoNetoMetodo1 - anticipoNetoMetodo2);

  const handleApplyAnticipo = (valor: number, metodo: number) => {
    setInputs((prev) => ({
      ...prev,
      anticipo_ano_siguiente: valor,
    }));
    showToast(
      `✓ Anticipo de $${valor.toLocaleString('es-CO')} COP (Método ${metodo}) aplicado en Casilla 133/135`,
      'success',
      3500
    );
  };

  return (
    <div id="subtab-anticipo" className="space-y-6 animate-fade-in" style={{ padding: '0 4px' }}>
      {/* HEADER BANNER */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '28px' }}>⚡</span>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Optimizador de Anticipo de Renta para el Año Siguiente
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
                  Liquidación estratégica según el Artículo 807 del Estatuto Tributario (Casilla 133 / 135 Formulario 210)
                </p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-outline"
              style={{ color: '#ffffff', borderColor: '#475569', fontSize: '12px' }}
              onClick={onNavigateToCalc}
            >
              ⬅ Volver al Liquidador
            </button>
            <button
              className="btn btn-primary"
              style={{ fontSize: '12px' }}
              onClick={onNavigateToF210}
            >
              📋 Ver Formulario 210
            </button>
          </div>
        </div>

        {/* STATUS BAR */}
        <div
          style={{
            marginTop: '20px',
            padding: '12px 16px',
            backgroundColor: 'rgba(255,255,255,0.06)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '13px',
          }}
        >
          <div>
            <span style={{ color: '#94a3b8' }}>Anticipo cargado actualmente en la declaración: </span>
            <strong style={{ color: '#38bdf8', fontSize: '15px' }}>
              ${(inputs.anticipo_ano_siguiente ?? 0).toLocaleString('es-CO')} COP
            </strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Saldo a Pagar Total resultante (Casilla 980): </span>
            <strong style={{ color: '#4ade80', fontSize: '15px' }}>
              ${((result?.total_a_pagar ?? result?.saldo_a_pagar ?? 0)).toLocaleString('es-CO')} COP
            </strong>
          </div>
        </div>
      </div>

      {/* PARAMETERS FORM & ANTIGÜEDAD */}
      <div className="card" style={{ padding: '20px', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>
          1. Parámetros de Liquidación (Art. 807 E.T.)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {/* IMPUESTO NETO AÑO DECLARADO */}
          <div className="input-field">
            <label className="input-label" style={{ fontWeight: 600 }}>
              Impuesto Neto de Renta Año Actual ({inputs.tax_year || 2025}) (Casilla 126)
            </label>
            <div className="input-wrapper">
              <span className="input-prefix">$</span>
              <input
                type="text"
                className="currency-input"
                value={formatCOP(impuestoActual, false)}
                onChange={(e) => setImpuestoActual(parseCOP(e.target.value))}
              />
            </div>
            <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
              Tomado del cálculo automático de Cédula General y Pensiones.
            </small>
          </div>

          {/* IMPUESTO NETO AÑO ANTERIOR */}
          <div className="input-field">
            <label className="input-label" style={{ fontWeight: 600 }}>
              Impuesto Neto de Renta Año Anterior ({((inputs.tax_year || 2025) - 1)}) (Casilla 126 previa)
            </label>
            <div className="input-wrapper">
              <span className="input-prefix">$</span>
              <input
                type="text"
                className="currency-input"
                value={formatCOP(impuestoAnterior, false)}
                onChange={(e) => setImpuestoAnterior(parseCOP(e.target.value))}
              />
            </div>
            <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
              Declaración 2024 de Juan Pablo Hernández Gómez: $31.540.000 COP.
            </small>
          </div>

          {/* RETENCIONES DEL AÑO */}
          <div className="input-field">
            <label className="input-label" style={{ fontWeight: 600 }}>
              Retenciones en la Fuente Practicadas en el Año (Casilla 132)
            </label>
            <div className="input-wrapper">
              <span className="input-prefix">$</span>
              <input
                type="text"
                className="currency-input"
                value={formatCOP(retenciones, false)}
                onChange={(e) => setRetenciones(parseCOP(e.target.value))}
              />
            </div>
            <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
              Se restan íntegramente del anticipo bruto calculado.
            </small>
          </div>
        </div>

        {/* SELECTOR DE ANTIGÜEDAD */}
        <div>
          <label className="input-label" style={{ fontWeight: 700, marginBottom: '8px', display: 'block' }}>
            Porcentaje Aplicable según Antigüedad como Declarante (Inciso 1 Art. 807 E.T.):
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div
              onClick={() => setPorcentajeAnticipo(0.25)}
              style={{
                border: `2px solid ${porcentajeAnticipo === 0.25 ? 'var(--primary)' : 'var(--border)'}`,
                backgroundColor: porcentajeAnticipo === 0.25 ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>1er Año Declarando</span>
                <span className="badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 800 }}>25%</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                Primera declaración de renta presentada ante la DIAN en toda la historia.
              </p>
            </div>

            <div
              onClick={() => setPorcentajeAnticipo(0.50)}
              style={{
                border: `2px solid ${porcentajeAnticipo === 0.50 ? 'var(--primary)' : 'var(--border)'}`,
                backgroundColor: porcentajeAnticipo === 0.50 ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>2do Año Declarando</span>
                <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309', fontWeight: 800 }}>50%</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                Segunda declaración de renta consecutiva o discontinua.
              </p>
            </div>

            <div
              onClick={() => setPorcentajeAnticipo(0.75)}
              style={{
                border: `2px solid ${porcentajeAnticipo === 0.75 ? 'var(--primary)' : 'var(--border)'}`,
                backgroundColor: porcentajeAnticipo === 0.75 ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>3er Año en Adelante</span>
                <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 800 }}>75%</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                Tercer año o más declarando (caso habitual para contribuyentes recurrentes).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* COMPARATIVE CARDS: METODO 1 VS METODO 2 */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>
          2. Comparativo Legal: Método 1 vs. Método 2 (Elige libremente el más favorable)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* CARD METODO 1 */}
          <div
            className="card"
            style={{
              borderRadius: '12px',
              border: metodoRecomendado === 1 ? '2px solid #2563eb' : '1px solid var(--border)',
              boxShadow: metodoRecomendado === 1 ? '0 6px 16px rgba(37,99,235,0.12)' : 'none',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                backgroundColor: metodoRecomendado === 1 ? '#eff6ff' : '#f8fafc',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                  Método 1: Año Corriente
                </h4>
                <small style={{ color: '#64748b' }}>Basado únicamente en el año gravable actual ({inputs.tax_year || 2025})</small>
              </div>
              {metodoRecomendado === 1 && (
                <span className="badge" style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 700 }}>
                  ★ Menor Anticipo
                </span>
              )}
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px', fontSize: '13px', lineHeight: '1.6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Base (Impuesto Neto {inputs.tax_year || 2025}):</span>
                  <strong>${baseMetodo1.toLocaleString('es-CO')} COP</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Porcentaje legal aplicado:</span>
                  <strong>{(porcentajeAnticipo * 100).toFixed(0)}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Anticipo Bruto:</span>
                  <strong>${anticipoBrutoMetodo1.toLocaleString('es-CO')} COP</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#dc2626' }}>
                  <span>(-) Menos Retenciones en la fuente:</span>
                  <strong>-${retenciones.toLocaleString('es-CO')} COP</strong>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#f1f5f9',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center',
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Anticipo a Registrar en Casilla 133 / 135
                </div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
                  ${anticipoNetoMetodo1.toLocaleString('es-CO')} COP
                </div>
              </div>

              <button
                className={`btn ${inputs.anticipo_ano_siguiente === anticipoNetoMetodo1 ? 'btn-success' : 'btn-primary'}`}
                style={{ width: '100%', padding: '10px 16px', fontWeight: 700 }}
                onClick={() => handleApplyAnticipo(anticipoNetoMetodo1, 1)}
              >
                {inputs.anticipo_ano_siguiente === anticipoNetoMetodo1
                  ? '✓ Método 1 Aplicado en la Declaración'
                  : '⚡ Aplicar Método 1 a la Declaración'}
              </button>
            </div>
          </div>

          {/* CARD METODO 2 */}
          <div
            className="card"
            style={{
              borderRadius: '12px',
              border: metodoRecomendado === 2 ? '2px solid #2563eb' : '1px solid var(--border)',
              boxShadow: metodoRecomendado === 2 ? '0 6px 16px rgba(37,99,235,0.12)' : 'none',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                backgroundColor: metodoRecomendado === 2 ? '#eff6ff' : '#f8fafc',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                  Método 2: Promedio 2 Últimos Años
                </h4>
                <small style={{ color: '#64748b' }}>Promedio simple de los impuestos netos {inputs.tax_year || 2025} y {((inputs.tax_year || 2025) - 1)}</small>
              </div>
              {metodoRecomendado === 2 && (
                <span className="badge" style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 700 }}>
                  ★ Menor Anticipo
                </span>
              )}
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px', fontSize: '13px', lineHeight: '1.6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Promedio 2 Años:</span>
                  <strong>${baseMetodo2.toLocaleString('es-CO')} COP</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Porcentaje legal aplicado:</span>
                  <strong>{(porcentajeAnticipo * 100).toFixed(0)}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Anticipo Bruto:</span>
                  <strong>${anticipoBrutoMetodo2.toLocaleString('es-CO')} COP</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#dc2626' }}>
                  <span>(-) Menos Retenciones en la fuente:</span>
                  <strong>-${retenciones.toLocaleString('es-CO')} COP</strong>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#f1f5f9',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center',
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Anticipo a Registrar en Casilla 133 / 135
                </div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
                  ${anticipoNetoMetodo2.toLocaleString('es-CO')} COP
                </div>
              </div>

              <button
                className={`btn ${inputs.anticipo_ano_siguiente === anticipoNetoMetodo2 ? 'btn-success' : 'btn-primary'}`}
                style={{ width: '100%', padding: '10px 16px', fontWeight: 700 }}
                onClick={() => handleApplyAnticipo(anticipoNetoMetodo2, 2)}
              >
                {inputs.anticipo_ano_siguiente === anticipoNetoMetodo2
                  ? '✓ Método 2 Aplicado en la Declaración'
                  : '⚡ Aplicar Método 2 a la Declaración'}
              </button>
            </div>
          </div>
        </div>

        {/* AHORRO DE CAJA CALLOUT */}
        {ahorroLiquidez > 0 && (
          <div
            style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #6ee7b7',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '24px' }}>💡</span>
            <div>
              <strong style={{ color: '#065f46', fontSize: '14px', display: 'block' }}>
                Recomendación de Flujo de Caja: El Método {metodoRecomendado} te permite pagar menos hoy
              </strong>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#047857' }}>
                Al elegir el Método {metodoRecomendado}, el contribuyente ahorra{' '}
                <strong>${ahorroLiquidez.toLocaleString('es-CO')} COP en desembolso inmediato</strong> de impuestos frente al otro método. El Artículo 807 del E.T. permite legalmente seleccionar cualquiera de los dos métodos a entera conveniencia del declarante.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* PEDAGOGICAL & LEGAL FOUNDATIONS */}
      <div className="card" style={{ padding: '24px', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>
          3. Fundamento Normativo, Exenciones y Reducción del Anticipo
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', fontSize: '13px', lineHeight: '1.6' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              ⚖️ ¿Quiénes NO están obligados a liquidar anticipo?
            </h4>
            <ul style={{ paddingLeft: '18px', margin: 0, color: 'var(--text-muted)' }}>
              <li>
                <strong>Pensionados puros:</strong> Personas naturales cuyos únicos ingresos provienen de pensiones de jubilación o invalidez exentas (Concepto DIAN 012200 de 1987).
              </li>
              <li>
                <strong>Contribuyentes del SIMPLE:</strong> Quienes tributan bajo el Régimen Simple de Tributación (Art. 903 y ss. E.T.) pagan bimestralmente mediante recibo 260.
              </li>
              <li>
                <strong>Cese definitivo de actividades:</strong> Personas que liquidaron su negocio o fallecieron durante el año gravable.
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              📉 ¿Se puede reducir el anticipo ante la DIAN?
            </h4>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Sí. De conformidad con el <strong>Artículo 809 del Estatuto Tributario</strong> y la Circular DIAN 044 de 2009, si el contribuyente prevé que en el año siguiente sus ingresos van a disminuir sustancialmente (por ejemplo, pérdida de empleo o terminación de contrato), puede radicar ante la DIAN una solicitud formal de reducción de anticipo con mínimo 2 meses de anticipación al vencimiento.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              🔄 ¿Qué ocurre con este valor en la declaración de 2026?
            </h4>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              El monto pagado como anticipo en esta declaración ({inputs.tax_year || 2025}) se traslada automáticamente a la <strong>Casilla 130 ("Anticipo renta liquidado año gravable anterior")</strong> en la declaración del año gravable 2026, restándose íntegramente del impuesto que se genere ese año.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
