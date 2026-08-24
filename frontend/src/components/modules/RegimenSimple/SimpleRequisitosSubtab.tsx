import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { formatCOP } from '../../../utils/formatters';

export const SimpleRequisitosSubtab: React.FC = () => {
  const { uvtValue } = useApp();

  // Requisitos obligatorios (Art. 905)
  const [esResidente, setEsResidente] = useState<boolean>(true);
  const [ingresosMenores100k, setIngresosMenores100k] = useState<boolean>(true);
  const [alDiaObligaciones, setAlDiaObligaciones] = useState<boolean>(true);
  const [rutFacturaElectronica, setRutFacturaElectronica] = useState<boolean>(true);

  // Causales de exclusión taxativas (Art. 906)
  const [esFilialExtranjera, setEsFilialExtranjera] = useState<boolean>(false);
  const [esEntidadFinanciera, setEsEntidadFinanciera] = useState<boolean>(false);
  const [esGeneradoraEnergia, setEsGeneradoraEnergia] = useState<boolean>(false);
  const [esFactoringLeasing, setEsFactoringLeasing] = useState<boolean>(false);
  const [esSocioRelacionLaboral, setEsSocioRelacionLaboral] = useState<boolean>(false);

  const cumpleRequisitos = esResidente && ingresosMenores100k && alDiaObligaciones && rutFacturaElectronica;
  const tieneExclusion =
    esFilialExtranjera || esEntidadFinanciera || esGeneradoraEnergia || esFactoringLeasing || esSocioRelacionLaboral;
  const esApto = cumpleRequisitos && !tieneExclusion;

  return (
    <div id="pane-simple-requisitos" className="module-pane active">
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          ✅ Checklist Normativo: Requisitos de Entrada y Causales de Exclusión
        </h2>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
          Validador legal interactivo basado en los <strong>Artículos 905 y 906 del Estatuto Tributario</strong>.
          Verifica si un contribuyente cumple las condiciones para optar o permanecer en el Régimen Simple de Tributación.
        </p>
      </div>

      {/* BANNER DE ESTADO LEGAL */}
      <div
        style={{
          padding: '16px',
          borderRadius: '8px',
          background: esApto ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `2px solid ${esApto ? '#10b981' : '#ef4444'}`,
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>DICTAMEN DE ELEGIBILIDAD</div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: esApto ? '#059669' : '#dc2626' }}>
            {esApto ? '✅ APTO PARA OPTAR POR EL RÉGIMEN SIMPLE (F-260)' : '❌ NO CUMPLE CONDICIONES O INCURRE EN EXCLUSIÓN'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {esApto
              ? 'Cumple con los topes de ingresos y condiciones del Art. 905 y no incurre en prohibiciones del Art. 906.'
              : 'Verifique los requisitos no marcados o desactive las causales de exclusión taxativas.'}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tope 100.000 UVT:</span>
          <div style={{ fontSize: '16px', fontWeight: 800 }}>${formatCOP(100000 * uvtValue, false)}</div>
        </div>
      </div>

      <div className="responsive-grid-split">
        {/* REQUISITOS OBLIGATORIOS (ART. 905) */}
        <div className="card">
          <div className="card-header" style={{ background: 'rgba(16, 185, 129, 0.08)' }}>
            <h3 className="card-title" style={{ color: '#059669' }}>
              1. Requisitos Obligatorios de Entrada (Art. 905 E.T.)
            </h3>
          </div>

          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', gap: '10px', alignItems: 'start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: '3px' }}
                  checked={esResidente}
                  onChange={(e) => setEsResidente(e.target.checked)}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>Residencia fiscal en Colombia</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    Persona natural residente o persona jurídica cuyos socios sean personas naturales residentes nacionales o extranjeras.
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', gap: '10px', alignItems: 'start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: '3px' }}
                  checked={ingresosMenores100k}
                  onChange={(e) => setIngresosMenores100k(e.target.checked)}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>
                    Ingresos brutos anuales ≤ 100.000 UVT (${formatCOP(100000 * uvtValue, false)})
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    Para servicios profesionales y consultoría (Grupo 5), el tope de permanencia es de <strong>12.000 UVT</strong> (${formatCOP(12000 * uvtValue, false)}).
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', gap: '10px', alignItems: 'start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: '3px' }}
                  checked={alDiaObligaciones}
                  onChange={(e) => setAlDiaObligaciones(e.target.checked)}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>Al día con obligaciones tributarias y de seguridad social</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    No tener deudas pendientes en DIAN, municipios (ICA) ni mora en la planilla PILA de seguridad social.
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', gap: '10px', alignItems: 'start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: '3px' }}
                  checked={rutFacturaElectronica}
                  onChange={(e) => setRutFacturaElectronica(e.target.checked)}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>Facturación electrónica y firma digital activa</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    Contar con RUT actualizado, mecanismo de firma electrónica e implementar factura electrónica de venta obligatoria.
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* CAUSALES DE EXCLUSIÓN TAXATIVAS (ART. 906) */}
        <div className="card">
          <div className="card-header" style={{ background: 'rgba(239, 68, 68, 0.08)' }}>
            <h3 className="card-title" style={{ color: '#dc2626' }}>
              2. Exclusiones y Prohibiciones Taxativas (Art. 906 E.T.)
            </h3>
          </div>

          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', gap: '10px', alignItems: 'start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: '3px' }}
                  checked={esFilialExtranjera}
                  onChange={(e) => setEsFilialExtranjera(e.target.checked)}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>Filial o subsidiaria de sociedad extranjera</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    Personas jurídicas extranjeras o establecimientos permanentes no pueden optar por el SIMPLE.
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', gap: '10px', alignItems: 'start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: '3px' }}
                  checked={esEntidadFinanciera}
                  onChange={(e) => setEsEntidadFinanciera(e.target.checked)}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>Entidad financiera, aseguradora o comisionista</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    Bancos, compañías de seguros y comisionistas de bolsa están expresamente excluidos.
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', gap: '10px', alignItems: 'start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: '3px' }}
                  checked={esGeneradoraEnergia}
                  onChange={(e) => setEsGeneradoraEnergia(e.target.checked)}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>Generación, transmisión o distribución de energía eléctrica</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    Empresas de servicios públicos de energía o comercializadoras de hidrocarburos.
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', gap: '10px', alignItems: 'start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: '3px' }}
                  checked={esFactoringLeasing}
                  onChange={(e) => setEsFactoringLeasing(e.target.checked)}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>Actividades de Factoring, Leasing o Microcrédito</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    Entidades dedicadas a la compra de cartera comercial, arrendamiento financiero o créditos.
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', gap: '10px', alignItems: 'start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: '3px' }}
                  checked={esSocioRelacionLaboral}
                  onChange={(e) => setEsSocioRelacionLaboral(e.target.checked)}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>Socio con relación laboral simultánea con el contratante</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    Cuando los socios tengan una relación laboral sustancial y subordinada con la entidad contratante.
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
