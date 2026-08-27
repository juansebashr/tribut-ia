import React from 'react';
import type { PersonaNaturalOutput } from '../../../types/tax';
import { formatCOP } from '../../../utils/formatters';

interface PnTaxGaugeProps {
  result: PersonaNaturalOutput | null;
}

export const PnTaxGauge: React.FC<PnTaxGaugeProps> = ({ result }) => {
  if (!result) return null;

  const ingresosBrutos = result.total_ingresos_brutos || 0;
  const impuestoNeto = result.impuesto_neto_renta || 0;
  const rentaGravable = result.renta_liquida_gravable || 0;

  // Real effective rate on gross income
  const effectiveGrossRate =
    ingresosBrutos > 0 ? (impuestoNeto / ingresosBrutos) * 100 : 0;

  // Real effective rate on taxable liquid income
  const effectiveTaxableRate =
    rentaGravable > 0 ? (impuestoNeto / rentaGravable) * 100 : 0;

  // Maximum marginal rate
  const marginalRate = (result.tarifa_marginal_maxima || 0) * 100;

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <div className="card-header">
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🌡️</span> Tasa Efectiva Real vs. Tarifa Marginal (Art. 241 E.T.)
        </h3>
      </div>
      <div className="card-body" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>
              Tasa Efectiva / Ingreso Bruto
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#1d4ed8', marginTop: '2px' }}>
              {effectiveGrossRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: '10px', color: '#60a5fa' }}>Impuesto / Total Ingresos</div>
          </div>

          <div style={{ padding: '12px', borderRadius: '8px', background: '#f5f3ff', border: '1px solid #ddd6fe', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase' }}>
              Tasa Efectiva / Renta Líquida
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#7c3aed', marginTop: '2px' }}>
              {effectiveTaxableRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: '10px', color: '#a78bfa' }}>Impuesto / Base Gravable</div>
          </div>

          <div style={{ padding: '12px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>
              Tarifa Marginal Máxima
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#dc2626', marginTop: '2px' }}>
              {marginalRate.toFixed(0)}%
            </div>
            <div style={{ fontSize: '10px', color: '#f87171' }}>Último tramo alcanzado</div>
          </div>
        </div>

        {/* COMPARATIVE BARS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '2px' }}>
              <span style={{ fontWeight: 600 }}>Tasa Efectiva Real sobre Ingresos ({effectiveGrossRate.toFixed(1)}%)</span>
              <span style={{ color: '#1d4ed8', fontWeight: 800 }}>{formatCOP(impuestoNeto)} de {formatCOP(ingresosBrutos)}</span>
            </div>
            <div style={{ height: '10px', width: '100%', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, effectiveGrossRate)}%`, background: '#2563eb', borderRadius: '5px' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '2px' }}>
              <span style={{ fontWeight: 600 }}>Tarifa Marginal del Tramo ({marginalRate.toFixed(0)}%)</span>
              <span style={{ color: '#dc2626', fontWeight: 800 }}>Art. 241 E.T.</span>
            </div>
            <div style={{ height: '10px', width: '100%', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, marginalRate)}%`, background: '#dc2626', borderRadius: '5px' }} />
            </div>
          </div>
        </div>

        {/* PEDAGOGICAL CALLOUT */}
        <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-card-alt, #f8fafc)', border: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          💡 <strong>Mito tributario frecuente:</strong> Estar en la tarifa marginal del {marginalRate.toFixed(0)}% no significa que pagas ese porcentaje sobre todo tu sueldo. Tu tasa efectiva real es de tan solo <strong>{effectiveGrossRate.toFixed(1)}%</strong>, porque los primeros tramos tributan al 0% y 19%.
        </div>
      </div>
    </div>
  );
};
