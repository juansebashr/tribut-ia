import React from 'react';
import type { PersonaNaturalOutput } from '../../../types/tax';
import { formatCOP } from '../../../utils/formatters';

interface PnWaterfallChartProps {
  result: PersonaNaturalOutput | null;
  anticipoAnoSiguiente?: number;
}

export const PnWaterfallChart: React.FC<PnWaterfallChartProps> = ({ result, anticipoAnoSiguiente }) => {
  if (!result) return null;

  const ingresosBrutos = result.total_ingresos_brutos || 0;
  const incrnGo = result.total_incrngo || 0;
  const deducciones = result.total_deducciones_aceptadas || 0;
  const exentasAfc = result.total_rentas_exentas_previas || 0;
  const exenta25 = result.renta_exenta_laboral_25 || 0;
  const rentaGravable = result.renta_liquida_gravable || 0;
  const impuestoNeto = result.impuesto_neto_renta || 0;
  const retenciones = result.total_anticipos_y_retenciones || 0;

  const anticipoSiguiente =
    (anticipoAnoSiguiente !== undefined && anticipoAnoSiguiente > 0)
      ? anticipoAnoSiguiente
      : (result.anticipo_ano_siguiente ||
         result.form_210_casillas?.c133_anticipo_ano_siguiente ||
         result.form_210_casillas?.c135_anticipo_ano_siguiente ||
         0);

  const saldoImpuesto = result.saldo_a_pagar || 0;
  const saldoFavor = result.saldo_a_favor || 0;
  const totalAPagar =
    result.total_a_pagar !== undefined && result.total_a_pagar > 0
      ? result.total_a_pagar
      : saldoImpuesto > 0
      ? saldoImpuesto + anticipoSiguiente
      : Math.max(0, anticipoSiguiente - saldoFavor);

  const saldoFinal = result.saldo_a_pagar > 0 ? result.saldo_a_pagar : -result.saldo_a_favor;

  // Maximum value for scaling (default to ingresosBrutos or 1)
  const maxVal = Math.max(ingresosBrutos, totalAPagar, 1);

  const steps = [
    {
      label: 'Ingresos Brutos',
      value: ingresosBrutos,
      type: 'base',
      color: '#1b3a6b',
      isNegative: false,
      desc: 'Rentas de trabajo, capital y no laborales',
    },
    {
      label: '(-) INCRNGO',
      value: incrnGo,
      type: 'subtraction',
      color: '#ef4444',
      isNegative: true,
      desc: 'Salud y pensión obligatoria (Arts. 55-56 E.T.)',
    },
    {
      label: '(-) Deducciones',
      value: deducciones,
      type: 'subtraction',
      color: '#f97316',
      isNegative: true,
      desc: 'Vivienda, dependientes, prepagada, 1% compras',
    },
    {
      label: '(-) Rentas Exentas',
      value: exentasAfc + exenta25,
      type: 'subtraction',
      color: '#eab308',
      isNegative: true,
      desc: 'Exenta 25% laboral + Cuentas AFC / FPV',
    },
    {
      label: '(=) Renta Líquida',
      value: rentaGravable,
      type: 'subtotal',
      color: '#0284c7',
      isNegative: false,
      desc: 'Base gravable sujeta a la tabla Art. 241',
    },
    {
      label: '(=) Impuesto a Cargo',
      value: impuestoNeto,
      type: 'tax',
      color: '#8b5cf6',
      isNegative: false,
      desc: 'Liquidado según rangos progresivos UVT (Casilla 129)',
    },
    {
      label: '(-) Retenciones Previas',
      value: retenciones,
      type: 'subtraction',
      color: '#10b981',
      isNegative: true,
      desc: 'Retenciones en la fuente y anticipos pagados año anterior',
    },
  ];

  if (anticipoSiguiente > 0) {
    steps.push({
      label: '(=) Saldo por Impuesto',
      value: saldoImpuesto,
      type: 'subtotal',
      color: '#0284c7',
      isNegative: false,
      desc: 'Impuesto neto del año menos retenciones previas (Casilla 136)',
    });
    steps.push({
      label: '(+) Anticipo Año Siguiente',
      value: anticipoSiguiente,
      type: 'addition',
      color: '#2563eb',
      isNegative: false,
      desc: 'Anticipo obligatorio Art. 807 E.T. (Casilla 133 / 135)',
    });
    steps.push({
      label: '(=) Total Saldo a Pagar',
      value: totalAPagar,
      type: 'to_pay',
      color: '#dc2626',
      isNegative: false,
      desc: 'Monto definitivo a cancelar a la DIAN (Casilla 980 / 140)',
    });
  } else {
    steps.push({
      label: saldoFinal >= 0 ? '(=) Saldo a Pagar' : '(=) Saldo a Favor',
      value: Math.abs(saldoFinal),
      type: saldoFinal >= 0 ? 'to_pay' : 'to_favor',
      color: saldoFinal >= 0 ? '#dc2626' : '#16a34a',
      isNegative: false,
      desc: saldoFinal >= 0 ? 'Valor final a cancelar a la DIAN (Casilla 980)' : 'Saldo a favor recuperable o imputable (Casilla 137)',
    });
  }

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📉</span> Cascada Visual de Depuración Tributaria (Waterfall)
          </h3>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Cómo se reduce tu ingreso bruto hasta determinar el impuesto definitivo
          </span>
        </div>
      </div>

      <div className="card-body" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {steps.map((s, idx) => {
            const pct = Math.min(100, Math.max(2, (s.value / maxVal) * 100));

            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                  <span style={{ fontWeight: s.type.startsWith('subtotal') || s.type === 'base' || s.type.startsWith('to_') ? 800 : 600, color: 'var(--text-primary)' }}>
                    {s.label}
                  </span>
                  <span style={{ fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)' }}>
                    {s.isNegative ? `-${formatCOP(s.value)}` : formatCOP(s.value)}
                  </span>
                </div>

                {/* BAR CONTAINER */}
                <div
                  style={{
                    height: '14px',
                    width: '100%',
                    background: 'var(--bg-input, #e2e8f0)',
                    borderRadius: '7px',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                  title={`${s.label}: ${formatCOP(s.value)} (${s.desc})`}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: s.color,
                      borderRadius: '7px',
                      transition: 'width 0.4s ease-in-out',
                    }}
                  />
                </div>

                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                  {s.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
