import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchRulesForYear } from '../../services/api';
import { formatCOP } from '../../utils/formatters';

export const RulesInspectorModule: React.FC = () => {
  const { taxYear, uvtValue } = useApp();
  const [rules, setRules] = useState<any | null>(null);

  useEffect(() => {
    loadRules();
  }, [taxYear]);

  const loadRules = async () => {
    try {
      const data = await fetchRulesForYear(taxYear);
      setRules(data);
    } catch (err) {
      console.warn('Error loading rules:', err);
    }
  };

  const brackets = rules?.persona_natural?.cedula_general?.tabla_marginal_art241 || [
    { desde_uvt: 0, hasta_uvt: 1090, tarifa: 0, uvt_adicional: 0 },
    { desde_uvt: 1090, hasta_uvt: 1700, tarifa: 0.19, uvt_adicional: 0 },
    { desde_uvt: 1700, hasta_uvt: 4100, tarifa: 0.28, uvt_adicional: 116 },
    { desde_uvt: 4100, hasta_uvt: 8670, tarifa: 0.33, uvt_adicional: 788 },
    { desde_uvt: 8670, hasta_uvt: 18970, tarifa: 0.35, uvt_adicional: 2296 },
    { desde_uvt: 18970, hasta_uvt: 31000, tarifa: 0.37, uvt_adicional: 5901 },
    { desde_uvt: 31000, hasta_uvt: 999999999, tarifa: 0.39, uvt_adicional: 10352 },
  ];

  return (
    <div id="pane-rules" className="module-pane active">
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2 className="card-title">Tabla Marginal Progresiva Personas Naturales (Art. 241 E.T. - {taxYear})</h2>
        </div>
        <div className="card-body">
          <table className="breakdown-table">
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>Rango Desde (UVT)</th>
                <th style={{ padding: '8px' }}>Rango Hasta (UVT)</th>
                <th style={{ padding: '8px' }}>Tarifa Marginal</th>
                <th style={{ padding: '8px' }}>Impuesto Fijo UVT</th>
                <th style={{ padding: '8px' }}>Fórmula Legal Aplicable</th>
              </tr>
            </thead>
            <tbody id="rules-marginal-tbody">
              {brackets.map((b: any, idx: number) => {
                const desdeCop = b.desde_uvt * uvtValue;
                const hastaCop = b.hasta_uvt <= 9000000 ? b.hasta_uvt * uvtValue : null;

                return (
                  <tr key={idx}>
                    <td style={{ padding: '6px', fontFamily: 'var(--font-mono)' }}>
                      {formatCOP(b.desde_uvt, false)} UVT
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{formatCOP(desdeCop)}</div>
                    </td>
                    <td style={{ padding: '6px', fontFamily: 'var(--font-mono)' }}>
                      {b.hasta_uvt > 9000000
                        ? 'En adelante'
                        : `${formatCOP(b.hasta_uvt, false)} UVT`}
                      {hastaCop && <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{formatCOP(hastaCop)}</div>}
                    </td>
                    <td style={{ padding: '6px', fontWeight: 700, color: 'var(--primary)' }}>
                      {(b.tarifa * 100).toFixed(0)}%
                    </td>
                    <td style={{ padding: '6px', fontFamily: 'var(--font-mono)' }}>
                      {formatCOP(b.uvt_adicional, false)} UVT
                    </td>
                    <td style={{ padding: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {b.tarifa === 0
                        ? 'Exento (0%)'
                        : `(Renta Gravable UVT - ${formatCOP(b.desde_uvt, false)}) x ${(b.tarifa * 100).toFixed(0)}% + ${formatCOP(b.uvt_adicional, false)} UVT`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Configuración Declarativa JSON ({taxYear})</h2>
        </div>
        <div className="card-body">
          <pre
            id="rules-json-view"
            style={{
              background: '#0f172a',
              color: '#38bdf8',
              padding: '16px',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              overflowX: 'auto',
              maxHeight: '400px',
            }}
          >
            {rules ? JSON.stringify(rules, null, 2) : 'Cargando reglas JSON...'}
          </pre>
        </div>
      </div>
    </div>
  );
};
