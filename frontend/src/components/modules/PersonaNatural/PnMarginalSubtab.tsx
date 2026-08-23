import React, { useState } from 'react';
import type { PersonaNaturalOutput } from '../../../types/tax';
import { formatCOP, formatUVT, formatPercent } from '../../../utils/formatters';

interface PnMarginalSubtabProps {
  result: PersonaNaturalOutput | null;
  uvtValue: number;
  onNavigateToCalc: () => void;
}

interface MarginalSlice {
  tramo: string;
  rangoUvt: string;
  rangoCop: string;
  tarifa: number;
  tarifaLabel: string;
  rentaEnTramo: number;
  impuestoTramo: number;
  estado: 'NO_ALCANZADO' | 'EN_CURSO' | 'COMPLETO';
}

export const PnMarginalSubtab: React.FC<PnMarginalSubtabProps> = ({ result, uvtValue, onNavigateToCalc }) => {
  const [simulatedIncrease, setSimulatedIncrease] = useState<number | null>(null);

  const rentaGravable = result ? result.renta_liquida_gravable : 0;
  const rentaUvt = uvtValue > 0 ? rentaGravable / uvtValue : 0;
  const impuestoRenta = result ? result.impuesto_neto_renta : 0;
  const impuestoUvt = uvtValue > 0 ? impuestoRenta / uvtValue : 0;
  const effectiveRate = rentaGravable > 0 ? (impuestoRenta / rentaGravable) * 100 : 0;
  const maxMarginalRate = result ? result.tarifa_marginal_maxima * 100 : 0;

  // Bracket tiers according to Art. 241 E.T.
  const brackets = [
    { minUvt: 0, maxUvt: 1090, rate: 0, label: 'Tramo 1 (0 a 1.090 UVT)' },
    { minUvt: 1090, maxUvt: 1700, rate: 0.19, label: 'Tramo 2 (1.090 a 1.700 UVT)' },
    { minUvt: 1700, maxUvt: 4100, rate: 0.28, label: 'Tramo 3 (1.700 a 4.100 UVT)' },
    { minUvt: 4100, maxUvt: 8670, rate: 0.33, label: 'Tramo 4 (4.100 a 8.670 UVT)' },
    { minUvt: 8670, maxUvt: 18970, rate: 0.35, label: 'Tramo 5 (8.670 a 18.970 UVT)' },
    { minUvt: 18970, maxUvt: 31000, rate: 0.37, label: 'Tramo 6 (18.970 a 31.000 UVT)' },
    { minUvt: 31000, maxUvt: Infinity, rate: 0.39, label: 'Tramo 7 (> 31.000 UVT)' },
  ];

  const currentBracket =
    brackets.find((b) => rentaUvt >= b.minUvt && rentaUvt < b.maxUvt) || brackets[brackets.length - 1];

  // Calculate slice breakdown
  const slices: MarginalSlice[] = brackets.map((b, idx) => {
    const minCop = b.minUvt * uvtValue;
    const maxCop = b.maxUvt === Infinity ? Infinity : b.maxUvt * uvtValue;

    let rentaEnTramo = 0;
    let estado: 'NO_ALCANZADO' | 'EN_CURSO' | 'COMPLETO' = 'NO_ALCANZADO';

    if (rentaUvt > b.minUvt) {
      if (b.maxUvt !== Infinity && rentaUvt >= b.maxUvt) {
        rentaEnTramo = (b.maxUvt - b.minUvt) * uvtValue;
        estado = 'COMPLETO';
      } else {
        rentaEnTramo = (rentaUvt - b.minUvt) * uvtValue;
        estado = 'EN_CURSO';
      }
    }

    const impuestoTramo = rentaEnTramo * b.rate;

    return {
      tramo: `Tramo ${idx + 1}`,
      rangoUvt: b.maxUvt === Infinity ? `> ${b.minUvt.toLocaleString()} UVT` : `${b.minUvt.toLocaleString()} - ${b.maxUvt.toLocaleString()} UVT`,
      rangoCop:
        maxCop === Infinity
          ? `> ${formatCOP(minCop)}`
          : `${formatCOP(minCop)} - ${formatCOP(maxCop)}`,
      tarifa: b.rate,
      tarifaLabel: `${(b.rate * 100).toFixed(0)}%`,
      rentaEnTramo,
      impuestoTramo,
      estado,
    };
  });

  // Calculate thermometer pointer position (0% to 100%)
  const calculatePointerPercent = () => {
    if (rentaUvt <= 0) return 7.1;
    if (rentaUvt >= 31000) return 96;
    // Map non-linearly across 7 segments
    const segmentWidth = 100 / 7;
    for (let i = 0; i < brackets.length; i++) {
      const b = brackets[i];
      if (rentaUvt >= b.minUvt && rentaUvt < b.maxUvt) {
        const segSpan = b.maxUvt === Infinity ? 10000 : b.maxUvt - b.minUvt;
        const progressInSeg = (rentaUvt - b.minUvt) / segSpan;
        return (i + progressInSeg) * segmentWidth;
      }
    }
    return 50;
  };

  const pointerLeft = calculatePointerPercent();

  const handleSimulateIncrease = (amount: number) => {
    setSimulatedIncrease(amount);
  };

  const calculateSimulatedResult = (increaseCop: number) => {
    const newRenta = rentaGravable + increaseCop;
    const newRentaUvt = uvtValue > 0 ? newRenta / uvtValue : 0;
    const applicableBracket =
      brackets.find((b) => newRentaUvt >= b.minUvt && newRentaUvt < b.maxUvt) || brackets[brackets.length - 1];
    const marginalTaxOnIncrease = increaseCop * applicableBracket.rate;
    const netTakeHome = increaseCop - marginalTaxOnIncrease;
    const pctKept = (netTakeHome / increaseCop) * 100;

    return {
      increaseCop,
      rate: applicableBracket.rate,
      tax: marginalTaxOnIncrease,
      net: netTakeHome,
      pctKept,
    };
  };

  return (
    <div id="pane-pn-marginal" className="module-pane active">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
            🌡️ Termómetro Tributario: Tarifa Marginal y Progresividad (Art. 241 E.T.)
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            Aprende cómo tributa tu renta en Colombia tramo por tramo. Tu impuesto se cobra por porciones, no como un porcentaje plano.
          </p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={onNavigateToCalc}>
          ✏️ Modificar Ingresos en Calculadora
        </button>
      </div>

      {/* TOP KPI CARDS */}
      <div className="marginal-kpi-grid">
        <div className="marginal-kpi-card accent-blue">
          <span className="marginal-kpi-label">Renta Líquida Gravable</span>
          <span className="marginal-kpi-val" id="therm-kpi-renta-cop">
            {formatCOP(rentaGravable)}
          </span>
          <span className="marginal-kpi-sub" id="therm-kpi-renta-uvt">
            {formatUVT(rentaUvt)}
          </span>
        </div>

        <div className="marginal-kpi-card accent-amber">
          <span className="marginal-kpi-label">Tu Tramo Marginal Máximo</span>
          <span className="marginal-kpi-val" id="therm-kpi-marginal-rate" style={{ color: '#d97706' }}>
            {formatPercent(maxMarginalRate, 0)}
          </span>
          <span className="marginal-kpi-sub" id="therm-kpi-marginal-bracket">
            {currentBracket.label}
          </span>
        </div>

        <div className="marginal-kpi-card accent-emerald">
          <span className="marginal-kpi-label">Tarifa Efectiva Real</span>
          <span className="marginal-kpi-val" id="therm-kpi-effective-rate" style={{ color: '#059669' }}>
            {formatPercent(effectiveRate, 1)}
          </span>
          <span className="marginal-kpi-sub">(Impuesto Total / Renta Gravable)</span>
        </div>

        <div className="marginal-kpi-card accent-rose">
          <span className="marginal-kpi-label">Impuesto Básico de Renta</span>
          <span className="marginal-kpi-val" id="therm-kpi-tax-cop" style={{ color: '#e11d48' }}>
            {formatCOP(impuestoRenta)}
          </span>
          <span className="marginal-kpi-sub" id="therm-kpi-tax-uvt">
            {formatUVT(impuestoUvt)}
          </span>
        </div>
      </div>

      {/* TERMÓMETRO VISUAL (GAUGE) */}
      <div className="thermometer-container">
        <div className="thermometer-header">
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0b3b60', margin: '0 0 2px 0' }}>
              📍 Escala de los 7 Tramos del Estatuto Tributario
            </h3>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              El pin marca exactamente en qué escalón de la tarifa marginal se encuentra tu último peso ganado.
            </span>
          </div>
          <div
            id="therm-current-status-badge"
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1e40af',
              fontSize: '11.5px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '20px',
            }}
          >
            Estás en el {currentBracket.label} ({maxMarginalRate.toFixed(0)}%)
          </div>
        </div>

        <div className="thermometer-track-wrap">
          {/* POINTER DINÁMICO */}
          <div id="therm-pointer" className="thermometer-pointer" style={{ left: `${pointerLeft}%` }}>
            <div className="thermometer-pointer-tag" id="therm-pointer-label">
              📍 {rentaUvt.toFixed(0)} UVT ({formatCOP(rentaGravable)})
            </div>
            <div className="thermometer-pointer-arrow" />
          </div>

          {/* BARRA DE GRADIENTE DE 7 TRAMOS */}
          <div className="thermometer-track">
            <div className="thermometer-bar-tier t0" id="therm-tier-bar-0" title="Tramo 1: 0 a 1.090 UVT (0%)">
              0%
            </div>
            <div className="thermometer-bar-tier t1" id="therm-tier-bar-1" title="Tramo 2: 1.090 a 1.700 UVT (19%)">
              19%
            </div>
            <div className="thermometer-bar-tier t2" id="therm-tier-bar-2" title="Tramo 3: 1.700 a 4.100 UVT (28%)">
              28%
            </div>
            <div className="thermometer-bar-tier t3" id="therm-tier-bar-3" title="Tramo 4: 4.100 a 8.670 UVT (33%)">
              33%
            </div>
            <div className="thermometer-bar-tier t4" id="therm-tier-bar-4" title="Tramo 5: 8.670 a 18.970 UVT (35%)">
              35%
            </div>
            <div className="thermometer-bar-tier t5" id="therm-tier-bar-5" title="Tramo 6: 18.970 a 31.000 UVT (37%)">
              37%
            </div>
            <div className="thermometer-bar-tier t6" id="therm-tier-bar-6" title="Tramo 7: > 31.000 UVT (39%)">
              39%
            </div>
          </div>

          <div className="thermometer-labels-row">
            <span>0 UVT</span>
            <span>1.090</span>
            <span>1.700</span>
            <span>4.100</span>
            <span>8.670</span>
            <span>18.970</span>
            <span>31.000+</span>
          </div>
        </div>
      </div>

      {/* DESGLOSE DIDÁCTICO TRAMO POR TRAMO */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h3 className="card-title">🍰 Desglose Didáctico de tu Renta &quot;Rebanada por Rebanada&quot;</h3>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Comprueba cómo cada porción de tu ingreso tributa de forma independiente
          </span>
        </div>
        <div className="card-body">
          <div style={{ overflowX: 'auto' }}>
            <table className="step-slice-table">
              <thead>
                <tr>
                  <th>Tramo Legal</th>
                  <th>Rango UVT</th>
                  <th>Rango en Pesos (COP)</th>
                  <th>Tarifa</th>
                  <th>Tu Renta en Este Tramo</th>
                  <th>Impuesto de la Porción</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody id="therm-step-slices-tbody">
                {slices.map((sl, i) => (
                  <tr
                    key={i}
                    style={{
                      background:
                        sl.estado === 'EN_CURSO'
                          ? '#fefce8'
                          : sl.estado === 'COMPLETO'
                          ? '#f0fdf4'
                          : 'transparent',
                      fontWeight: sl.estado !== 'NO_ALCANZADO' ? 600 : 400,
                    }}
                  >
                    <td>{sl.tramo}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{sl.rangoUvt}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{sl.rangoCop}</td>
                    <td style={{ fontWeight: 800, color: sl.tarifa > 0 ? '#1e40af' : '#059669' }}>
                      {sl.tarifaLabel}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                      {formatCOP(sl.rentaEnTramo)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: sl.impuestoTramo > 0 ? '#e11d48' : '#059669' }}>
                      {formatCOP(sl.impuestoTramo)}
                    </td>
                    <td>
                      {sl.estado === 'COMPLETO' ? (
                        <span style={{ color: '#059669', fontSize: '11px', fontWeight: 800 }}>✓ Lleno</span>
                      ) : sl.estado === 'EN_CURSO' ? (
                        <span style={{ color: '#d97706', fontSize: '11px', fontWeight: 800 }}>👉 En curso</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '11px' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SIMULADOR DIDÁCTICO: EL MITO DE SUBIR DE TRAMO */}
      <div className="myth-buster-box">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
          <span style={{ fontSize: '26px' }}>💡</span>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0b3b60', margin: '0 0 4px 0' }}>
              El Gran Mito Tributario: &quot;¿Si me suben el sueldo o paso de tramo, perderé dinero?&quot;
            </h3>
            <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5, margin: 0 }}>
              <strong>¡Rotundamente NO!</strong> El impuesto en Colombia es <em>marginal</em>. Esto significa que cuando
              entras a un tramo superior, <strong>la tarifa más alta SOLO se aplica a los pesos que sobrepasen el límite</strong>. Todo tu dinero anterior sigue pagando las tarifas bajas o el 0% exento.
            </p>
          </div>
        </div>

        {/* SIMULADOR INTERACTIVO DE INCREMENTO */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '14px',
            marginTop: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '10px',
            }}
          >
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a' }}>
              ⚡ Simula un Aumento de Ingresos Gravables:
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="btn btn-outline btn-sm" onClick={() => handleSimulateIncrease(1000000)}>
                +$1&apos;000.000
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => handleSimulateIncrease(5000000)}>
                +$5&apos;000.000
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => handleSimulateIncrease(10000000)}>
                +$10&apos;000.000
              </button>
            </div>
          </div>

          <div id="myth-sim-result" style={{ fontSize: '12px', lineHeight: 1.5, color: '#1e293b' }}>
            {simulatedIncrease ? (
              (() => {
                const sim = calculateSimulatedResult(simulatedIncrease);
                return (
                  <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                    Si recibes un ingreso gravable extra de <strong>{formatCOP(sim.increaseCop)}</strong>:
                    <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                      <li>Tarifa marginal aplicable al incremento: <strong>{(sim.rate * 100).toFixed(0)}%</strong></li>
                      <li>Impuesto adicional a pagar: <strong>{formatCOP(sim.tax)}</strong></li>
                      <li>
                        Dinero neto en tu bolsillo:{' '}
                        <strong style={{ color: '#059669', fontSize: '13px' }}>{formatCOP(sim.net)}</strong> (conservas el{' '}
                        {sim.pctKept.toFixed(1)}% de tu aumento).
                      </li>
                    </ul>
                  </div>
                );
              })()
            ) : (
              <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                Haz clic en uno de los botones para ver cuánto dinero neto te queda en el bolsillo tras impuestos si aumenta tu salario.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
