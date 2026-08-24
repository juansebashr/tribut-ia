import React, { useState } from 'react';
import { formatCOP, parseCOP } from '../../../utils/formatters';

interface BimestreData {
  bimestre: number;
  periodo: string;
  mesVencimiento: string;
  ingresosBrutos: number;
  pensionEmpleador: number;
  ventasElectronicas: number;
  incComidas: number;
}

export const SimpleF2593Subtab: React.FC = () => {
  const [tarifaPct, setTarifaPct] = useState<number>(2.0); // Tarifa estimada del grupo
  const [tarifaIcaMil, setTarifaIcaMil] = useState<number>(7.0);

  const [bimestres, setBimestres] = useState<BimestreData[]>([
    { bimestre: 1, periodo: 'Enero - Febrero', mesVencimiento: 'Mayo', ingresosBrutos: 80000000, pensionEmpleador: 1800000, ventasElectronicas: 40000000, incComidas: 0 },
    { bimestre: 2, periodo: 'Marzo - Abril', mesVencimiento: 'Mayo', ingresosBrutos: 90000000, pensionEmpleador: 1800000, ventasElectronicas: 45000000, incComidas: 0 },
    { bimestre: 3, periodo: 'Mayo - Junio', mesVencimiento: 'Julio', ingresosBrutos: 85000000, pensionEmpleador: 1800000, ventasElectronicas: 50000000, incComidas: 0 },
    { bimestre: 4, periodo: 'Julio - Agosto', mesVencimiento: 'Septiembre', ingresosBrutos: 95000000, pensionEmpleador: 1800000, ventasElectronicas: 60000000, incComidas: 0 },
    { bimestre: 5, periodo: 'Septiembre - Octubre', mesVencimiento: 'Noviembre', ingresosBrutos: 110000000, pensionEmpleador: 1800000, ventasElectronicas: 70000000, incComidas: 0 },
    { bimestre: 6, periodo: 'Noviembre - Diciembre', mesVencimiento: 'Enero (siguiente)', ingresosBrutos: 140000000, pensionEmpleador: 1800000, ventasElectronicas: 85000000, incComidas: 0 },
  ]);

  const handleValChange = (index: number, field: keyof BimestreData, valStr: string) => {
    const num = parseCOP(valStr);
    setBimestres((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: num };
      return updated;
    });
  };

  const calcularBimestre = (b: BimestreData) => {
    const impConsolidado = Math.round((b.ingresosBrutos * (tarifaPct / 100)) / 1000) * 1000;
    const icaBim = Math.round((b.ingresosBrutos * (tarifaIcaMil / 1000)) / 1000) * 1000;
    const nacBim = Math.max(0, impConsolidado - icaBim);

    const descElect = Math.round((b.ventasElectronicas * 0.005) / 1000) * 1000;
    const totalDesc = Math.min(nacBim, b.pensionEmpleador + descElect);
    const netoSimple = Math.max(0, nacBim - totalDesc);

    const incBim = Math.round((b.incComidas * 0.08) / 1000) * 1000;
    const totalPagarF2593 = netoSimple + icaBim + incBim;

    return {
      impConsolidado,
      icaBim,
      nacBim,
      totalDesc,
      netoSimple,
      incBim,
      totalPagarF2593,
    };
  };

  const totales = bimestres.reduce(
    (acc, b) => {
      const calc = calcularBimestre(b);
      acc.ingresos += b.ingresosBrutos;
      acc.simpleNac += calc.netoSimple;
      acc.ica += calc.icaBim;
      acc.inc += calc.incBim;
      acc.totalPagar += calc.totalPagarF2593;
      return acc;
    },
    { ingresos: 0, simpleNac: 0, ica: 0, inc: 0, totalPagar: 0 }
  );

  return (
    <div id="pane-simple-f2593" className="module-pane active">
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          📅 Desglose de Anticipos Bimestrales (Recibo Electrónico Formulario 2593)
        </h2>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
          Simulador oficial de los 6 recibos electrónicos bimestrales F-2593 (Art. 910 E.T.). Los anticipos pagados
          se descuentan automáticamente en la declaración anual consolidada (Formulario 260).
        </p>
      </div>

      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <h3 className="card-title">Parámetros Tarifarios Bimestrales</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Tarifa SIMPLE Bimestral:</span>
              <input
                type="number"
                step="0.1"
                className="text-input"
                style={{ width: '80px', padding: '4px 8px' }}
                value={tarifaPct}
                onChange={(e) => setTarifaPct(parseFloat(e.target.value) || 0)}
              />
              <span style={{ fontSize: '12px' }}>%</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Tarifa ICA Unificada:</span>
              <input
                type="number"
                step="0.5"
                className="text-input"
                style={{ width: '80px', padding: '4px 8px' }}
                value={tarifaIcaMil}
                onChange={(e) => setTarifaIcaMil(parseFloat(e.target.value) || 0)}
              />
              <span style={{ fontSize: '12px' }}>‰</span>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Bimestre / Periodo</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Mes Vence</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Ingresos Brutos ($)</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Pensión Empleador ($)</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Ventas Electrónicas ($)</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>SIMPLE Nac ($)</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>ICA Munic ($)</th>
                <th style={{ padding: '8px', textAlign: 'right', background: 'rgba(16, 185, 129, 0.1)' }}>Total F-2593 ($)</th>
              </tr>
            </thead>
            <tbody>
              {bimestres.map((b, idx) => {
                const calc = calcularBimestre(b);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '8px', fontWeight: 700 }}>
                      Bim {b.bimestre}: {b.periodo}
                    </td>
                    <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{b.mesVencimiento}</td>
                    <td style={{ padding: '4px' }}>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="currency-input"
                        style={{ width: '100%', textAlign: 'right', padding: '4px 6px' }}
                        value={formatCOP(b.ingresosBrutos, false)}
                        onChange={(e) => handleValChange(idx, 'ingresosBrutos', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '4px' }}>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="currency-input"
                        style={{ width: '100%', textAlign: 'right', padding: '4px 6px' }}
                        value={formatCOP(b.pensionEmpleador, false)}
                        onChange={(e) => handleValChange(idx, 'pensionEmpleador', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '4px' }}>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="currency-input"
                        style={{ width: '100%', textAlign: 'right', padding: '4px 6px' }}
                        value={formatCOP(b.ventasElectronicas, false)}
                        onChange={(e) => handleValChange(idx, 'ventasElectronicas', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>
                      ${formatCOP(calc.netoSimple, false)}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>
                      ${formatCOP(calc.icaBim, false)}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 900, color: '#059669', background: 'rgba(16, 185, 129, 0.08)' }}>
                      ${formatCOP(calc.totalPagarF2593, false)}
                    </td>
                  </tr>
                );
              })}

              {/* FILA DE TOTALES */}
              <tr style={{ background: 'var(--bg-tertiary)', fontWeight: 800, borderTop: '2px solid var(--border-color)' }}>
                <td colSpan={2} style={{ padding: '10px 8px' }}>
                  TOTAL CONSOLIDADO ANUAL (Imputable a F-260 Casilla 56)
                </td>
                <td style={{ padding: '10px 8px', textAlign: 'right' }}>${formatCOP(totales.ingresos, false)}</td>
                <td colSpan={2} style={{ padding: '10px 8px', textAlign: 'center', color: 'var(--text-muted)' }}>—</td>
                <td style={{ padding: '10px 8px', textAlign: 'right' }}>${formatCOP(totales.simpleNac, false)}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right' }}>${formatCOP(totales.ica, false)}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', color: '#059669', fontSize: '13px' }}>
                  ${formatCOP(totales.totalPagar, false)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
