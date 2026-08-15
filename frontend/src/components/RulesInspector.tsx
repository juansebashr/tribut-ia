import React, { useState, useEffect } from 'react';
import { Sliders, Code2, ShieldCheck, FileCheck } from 'lucide-react';
import { TaxYearRules } from '../types/tax';
import { fetchRulesForYear } from '../services/api';

interface RulesInspectorProps {
  taxYear: number;
  uvtValue: number;
}

export const RulesInspector: React.FC<RulesInspectorProps> = ({ taxYear, uvtValue }) => {
  const [rules, setRules] = useState<TaxYearRules | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'cards' | 'yaml'>('cards');

  useEffect(() => {
    loadRules();
  }, [taxYear, uvtValue]);

  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await fetchRulesForYear(taxYear, uvtValue);
      setRules(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !rules) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando parámetros tributarios...</div>;
  }

  const pn = rules.persona_natural.cedula_general;
  const pj = rules.persona_juridica;

  return (
    <div className="rules-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Parámetros y Reglas Tributarias ({taxYear})</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Estatuto Tributario parametrizado de forma declarativa (UVT Base: ${rules.uvt_value.toLocaleString('es-CO')} COP)
          </p>
        </div>

        <div className="nav-tabs" style={{ width: 'fit-content' }}>
          <button
            className={`nav-tab ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
          >
            <ShieldCheck size={15} /> Vista Tablas
          </button>
          <button
            className={`nav-tab ${viewMode === 'yaml' ? 'active' : ''}`}
            onClick={() => setViewMode('yaml')}
          >
            <Code2 size={15} /> Vista JSON / YAML
          </button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* TABLA MARGINAL ART 241 */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <FileCheck size={17} color="#1e3a8a" />
                Tabla Progresiva Marginal Personas Naturales (Art. 241 E.T.)
              </div>
            </div>
            <div className="card-body">
              <table className="breakdown-table">
                <thead>
                  <tr style={{ background: 'var(--bg-card-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>Rango Desde (UVT)</th>
                    <th style={{ padding: '8px' }}>Rango Hasta (UVT)</th>
                    <th style={{ padding: '8px' }}>Tarifa Marginal</th>
                    <th style={{ padding: '8px' }}>Impuesto Base</th>
                    <th style={{ padding: '8px' }}>Fórmula Legal</th>
                  </tr>
                </thead>
                <tbody>
                  {pn.tabla_marginal_art241.map((bracket, i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{bracket.desde_uvt.toLocaleString('es-CO')} UVT</td>
                      <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{bracket.hasta_uvt > 9000000 ? 'En adelante' : `${bracket.hasta_uvt.toLocaleString('es-CO')} UVT`}</td>
                      <td style={{ padding: '8px', fontWeight: 700, color: 'var(--primary)' }}>{(bracket.tarifa * 100).toFixed(0)}%</td>
                      <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{bracket.uvt_adicional} UVT</td>
                      <td style={{ padding: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {bracket.tarifa === 0
                          ? '0%'
                          : `(Renta Gravable UVT - ${bracket.desde_uvt}) x ${(bracket.tarifa * 100).toFixed(0)}% + ${bracket.uvt_adicional} UVT`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TOPES DEDUCCIONES Y RENTAS EXENTAS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">Topes Deducciones PN</div>
              </div>
              <div className="card-body">
                <table className="breakdown-table">
                  <tbody>
                    <tr>
                      <td>Límite Conjunto (Art. 336)</td>
                      <td className="amount">{pn.limite_conjunto_rentas_exentas_deducciones.tope_uvt} UVT ({(pn.limite_conjunto_rentas_exentas_deducciones.porcentaje_max_ingreso_neto * 100).toFixed(0)}%)</td>
                    </tr>
                    <tr>
                      <td>Dependiente General (Art. 387)</td>
                      <td className="amount">{pn.deducciones.dependiente_general.tope_uvt} UVT (10%)</td>
                    </tr>
                    <tr>
                      <td>Dependientes Adicionales (72 UVT c/u)</td>
                      <td className="amount">Hasta {pn.deducciones.dependientes_adicionales_72uvt.max_dependientes} dependientes</td>
                    </tr>
                    <tr>
                      <td>Medicina Prepagada (Art. 387)</td>
                      <td className="amount">{pn.deducciones.medicina_prepagada.tope_uvt_anual} UVT/año</td>
                    </tr>
                    <tr>
                      <td>Intereses Vivienda (Art. 119)</td>
                      <td className="amount">{pn.deducciones.intereses_vivienda.tope_uvt_anual} UVT/año</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Parámetros Persona Jurídica</div>
              </div>
              <div className="card-body">
                <table className="breakdown-table">
                  <tbody>
                    <tr>
                      <td>Tarifa General de Renta (Art. 240)</td>
                      <td className="amount">{(pj.tarifa_general * 100).toFixed(0)}%</td>
                    </tr>
                    <tr>
                      <td>Tasa Mínima TTD (Art. 240 Par. 6)</td>
                      <td className="amount">{(pj.tasa_minima_ttd.tarifa_minima * 100).toFixed(0)}%</td>
                    </tr>
                    <tr>
                      <td>Ganancia Ocasional Sociedades</td>
                      <td className="amount">{(pj.ganancia_ocasional * 100).toFixed(0)}%</td>
                    </tr>
                    <tr>
                      <td>Descuento ICA Pagado (Art. 115)</td>
                      <td className="amount">{(pj.descuentos.ica_descuento_porcentaje * 100).toFixed(0)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Schema Declarativo (JSON)</div>
          </div>
          <div className="card-body">
            <pre style={{ background: '#0f172a', color: '#f8fafc', padding: '16px', borderRadius: '8px', fontSize: '13px', overflowX: 'auto', fontFamily: 'var(--font-mono)' }}>
              {JSON.stringify(rules, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
