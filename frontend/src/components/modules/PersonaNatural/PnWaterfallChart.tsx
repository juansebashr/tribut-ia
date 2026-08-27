import React from 'react';
import type { PersonaNaturalOutput } from '../../../types/tax';
import { formatCOP } from '../../../utils/formatters';

interface PnWaterfallChartProps {
  result: PersonaNaturalOutput | null;
}

export const PnWaterfallChart: React.FC<PnWaterfallChartProps> = ({ result }) => {
  if (!result) return null;

  const ingresosBrutos = result.total_ingresos_brutos || 0;
  const incrnGo = result.total_incrngo || 0;
  const deducciones = result.total_deducciones_aceptadas || 0;
  const exentasAfc = result.total_rentas_exentas_previas || 0;
  const exenta25 = result.renta_exenta_laboral_25 || 0;
  const rentaGravable = result.renta_liquida_gravable || 0;
  const impuestoNeto = result.impuesto_neto_renta || 0;
  const retenciones = result.total_anticipos_y_retenciones || 0;
  const saldoFinal = result.saldo_a_pagar > 0 ? result.saldo_a_pagar : -result.saldo_a_favor;

  // Maximum value for scaling (default to ingresosBrutos or 1)
  const maxVal = Math.max(ingresosBrutos, 1);

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
      desc: 'Liquidado según rangos progresivos UVT',
    },
    {
      label: '(-) Retenciones Previas',
      value: retenciones,
      type: 'subtraction',
      color: '#10b981',
      isNegative: true,
      desc: 'Retenciones en la fuente y anticipos pagados',
    },
    {
      label: saldoFinal >= 0 ? '(=) Saldo a Pagar' : '(=) Saldo a Favor',
      value: Math.abs(saldoFinal),
      type: saldoFinal >= 0 ? 'to_pay' : 'to_favor',
      color: saldoFinal >= 0 ? '#dc2626' : '#16a34a',
      isNegative: false,
      desc: saldoFinal >= 0 ? 'Valor final a cancelar a la DIAN' : 'Saldo a favor recuperable o imputable',
    },
  ];

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
