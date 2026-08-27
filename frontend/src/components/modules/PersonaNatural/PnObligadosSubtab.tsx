import React, { useState } from 'react';
import type { PersonaNaturalInput } from '../../../types/tax';
import { formatCOP, parseCOP } from '../../../utils/formatters';

interface PnObligadosSubtabProps {
  uvtValue: number;
  taxYear: number;
  onTransferToCalc: (datos: Partial<PersonaNaturalInput>) => void;
  onNavigateToCalc: () => void;
}

export const PnObligadosSubtab: React.FC<PnObligadosSubtabProps> = ({
  uvtValue,
  taxYear,
  onTransferToCalc,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [tipoPersona, setTipoPersona] = useState<string>('asalariado');
  const [ingSalario, setIngSalario] = useState<number>(0);
  const [ingHonorarios, setIngHonorarios] = useState<number>(0);
  const [ingPension, setIngPension] = useState<number>(0);
  const [ingArriendos, setIngArriendos] = useState<number>(0);
  const [ingDividendos, setIngDividendos] = useState<number>(0);
  const [ingOtros, setIngOtros] = useState<number>(0);

  const [patrimonioBruto, setPatrimonioBruto] = useState<number>(0);
  const [tarjetaCredito, setTarjetaCredito] = useState<number>(0);
  const [comprasTotales, setComprasTotales] = useState<number>(0);
  const [consignaciones, setConsignaciones] = useState<number>(0);

  const [esResponsableIva, setEsResponsableIva] = useState<boolean>(false);
  const [tieneIngresosExterior, setTieneIngresosExterior] = useState<boolean>(false);
  const [esSocioSociedad, setEsSocioSociedad] = useState<boolean>(false);

  // Statutory thresholds
  const topeIngresosUvt = 1400;
  const topePatrimonioUvt = 4500;
  const topeTarjetaUvt = 1400;
  const topeComprasUvt = 1400;
  const topeConsignacionesUvt = 1400;

  const topeIngresosCop = topeIngresosUvt * uvtValue;
  const topePatrimonioCop = topePatrimonioUvt * uvtValue;
  const topeTarjetaCop = topeTarjetaUvt * uvtValue;
  const topeComprasCop = topeComprasUvt * uvtValue;
  const topeConsignacionesCop = topeConsignacionesUvt * uvtValue;

  const totalIngresos =
    ingSalario + ingHonorarios + ingPension + ingArriendos + ingDividendos + ingOtros;

  // Evaluation of obligations
  const superaIngresos = totalIngresos >= topeIngresosCop;
  const superaPatrimonio = patrimonioBruto >= topePatrimonioCop;
  const superaTarjeta = tarjetaCredito >= topeTarjetaCop;
  const superaCompras = comprasTotales >= topeComprasCop;
  const superaConsignaciones = consignaciones >= topeConsignacionesCop;

  const razones: { titulo: string; desc: string; norma: string; superado: boolean }[] = [
    {
      titulo: `Ingresos Brutos (${formatCOP(totalIngresos)})`,
      desc: `Supera el tope de 1.400 UVT (${formatCOP(topeIngresosCop)})`,
      norma: 'Art. 592 y 593 E.T.',
      superado: superaIngresos,
    },
    {
      titulo: `Patrimonio Bruto a 31 de Dic (${formatCOP(patrimonioBruto)})`,
      desc: `Supera el tope de 4.500 UVT (${formatCOP(topePatrimonioCop)})`,
      norma: 'Art. 592 Numeral 1 E.T.',
      superado: superaPatrimonio,
    },
    {
      titulo: `Consumos Tarjeta de Crédito (${formatCOP(tarjetaCredito)})`,
      desc: `Supera el tope de 1.400 UVT (${formatCOP(topeTarjetaCop)})`,
      norma: 'Art. 594-3 Literal a E.T.',
      superado: superaTarjeta,
    },
    {
      titulo: `Compras y Consumos Totales (${formatCOP(comprasTotales)})`,
      desc: `Supera el tope de 1.400 UVT (${formatCOP(topeComprasCop)})`,
      norma: 'Art. 594-3 Literal b E.T.',
      superado: superaCompras,
    },
    {
      titulo: `Consignaciones y Depósitos Bancarios (${formatCOP(consignaciones)})`,
      desc: `Supera el tope de 1.400 UVT (${formatCOP(topeConsignacionesCop)}) - Incluye Nequi, Daviplata y billeteras`,
      norma: 'Art. 594-3 Literal c E.T.',
      superado: superaConsignaciones,
    },
    {
      titulo: 'Responsabilidad frente al IVA',
      desc: 'Inscrito en el RUT como Responsable de IVA durante el año',
      norma: 'Art. 592 Numeral 2 E.T.',
      superado: esResponsableIva,
    },
    {
      titulo: 'Ingresos Provenientes del Exterior',
      desc: 'Pagos recibidos de fuente extranjera sin retención en la fuente',
      norma: 'Art. 9 y 10 E.T.',
      superado: tieneIngresosExterior,
    },
  ];

  const razonesObligado = razones.filter((r) => r.superado);
  const estaObligado = razonesObligado.length > 0;

  const handleTransfer = () => {
    onTransferToCalc({
      tax_year: taxYear,
      custom_uvt: uvtValue,
      patrimonio_bruto: patrimonioBruto,
      rentas_trabajo: ingSalario,
      rentas_capital: ingArriendos,
      rentas_nolaborales: ingHonorarios,
      otros_ingresos_brutos: ingOtros,
    });
  };

  return (
    <div className="module-pane active" id="pane-pn-obligados">
      {/* HEADER BANNER */}
      <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #0e2147 0%, #1b3a6b 50%, #2a5298 100%)', color: 'white' }}>
        <div className="card-body" style={{ padding: '24px' }}>
          <div style={{ display: 'inline-block', background: 'rgba(240,165,0,0.2)', color: '#fcd26b', border: '1px solid rgba(240,165,0,0.4)', borderRadius: '20px', fontSize: '11px', fontWeight: 800, padding: '4px 12px', marginBottom: '10px' }}>
            📊 SIMULADOR DE OBLIGATORIEDAD · AÑO GRAVABLE {taxYear} (UVT = {formatCOP(uvtValue)})
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '4px 0 8px 0', color: '#ffffff' }}>
            ¿Debo declarar renta en Colombia en el año {taxYear}?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', maxWidth: '720px', margin: 0 }}>
            Descubre en 3 sencillos pasos si la DIAN te exige presentar el Formulario 210 según tus ingresos, patrimonio, consumos o consignaciones bancarias.
          </p>
        </div>
      </div>

      {/* STEPPER PROGRESS */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                opacity: currentStep === 1 ? 1 : 0.6,
                fontWeight: currentStep === 1 ? 800 : 500,
              }}
              onClick={() => setCurrentStep(1)}
            >
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: currentStep >= 1 ? '#1b3a6b' : '#e2e8f0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                1
              </span>
              <span style={{ fontSize: '13px' }}>1. Tus Ingresos</span>
            </div>

            <div style={{ flex: 1, height: '2px', background: currentStep >= 2 ? '#1b3a6b' : '#e2e8f0', margin: '0 12px' }} />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                opacity: currentStep === 2 ? 1 : 0.6,
                fontWeight: currentStep === 2 ? 800 : 500,
              }}
              onClick={() => setCurrentStep(2)}
            >
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: currentStep >= 2 ? '#1b3a6b' : '#e2e8f0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                2
              </span>
              <span style={{ fontSize: '13px' }}>2. Patrimonio &amp; Consignaciones</span>
            </div>

            <div style={{ flex: 1, height: '2px', background: currentStep >= 3 ? '#1b3a6b' : '#e2e8f0', margin: '0 12px' }} />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                opacity: currentStep === 3 ? 1 : 0.6,
                fontWeight: currentStep === 3 ? 800 : 500,
              }}
              onClick={() => setCurrentStep(3)}
            >
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: currentStep >= 3 ? '#1b3a6b' : '#e2e8f0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                3
              </span>
              <span style={{ fontSize: '13px' }}>3. Situaciones Especiales</span>
            </div>

            <div style={{ flex: 1, height: '2px', background: currentStep === 4 ? '#16a34a' : '#e2e8f0', margin: '0 12px' }} />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                opacity: currentStep === 4 ? 1 : 0.6,
                fontWeight: currentStep === 4 ? 800 : 500,
              }}
              onClick={() => setCurrentStep(4)}
            >
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: currentStep === 4 ? '#16a34a' : '#e2e8f0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                ✓
              </span>
              <span style={{ fontSize: '13px' }}>Resultado</span>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 1: INGRESOS */}
      {currentStep === 1 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Paso 1: Ingresos Brutos del Año Gravable {taxYear}</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Tope Legal: 1.400 UVT = <strong>{formatCOP(topeIngresosCop)}</strong>
            </span>
          </div>
          <div className="card-body">
            <div className="form-section">
              <div className="input-field" style={{ marginBottom: '16px' }}>
                <label className="input-label">Perfil o Actividad Principal</label>
                <select
                  className="select-input"
                  value={tipoPersona}
                  onChange={(e) => setTipoPersona(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="asalariado">Empleado Asalariado (Contrato Laboral)</option>
                  <option value="independiente">Independiente / Prestación de Servicios</option>
                  <option value="pensionado">Pensionado</option>
                  <option value="arrendador">Arrendador (Alquiler de Inmuebles)</option>
                  <option value="comerciante">Comerciante / Empresario Persona Natural</option>
                  <option value="mixto">Mixto (Salario + Otros Ingresos)</option>
                </select>
              </div>

              <div className="calc-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div className="input-field">
                  <label className="input-label">Salarios, Primas y Cesantías</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      className="currency-input"
                      value={formatCOP(ingSalario, false)}
                      onChange={(e) => setIngSalario(parseCOP(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <span className="input-helper">Total recibido de la empresa</span>
                </div>

                <div className="input-field">
                  <label className="input-label">Honorarios y Servicios Independientes</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      className="currency-input"
                      value={formatCOP(ingHonorarios, false)}
                      onChange={(e) => setIngHonorarios(parseCOP(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <span className="input-helper">Total facturado por cuenta propia</span>
                </div>

                <div className="input-field">
                  <label className="input-label">Mesadas Pensionales</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      className="currency-input"
                      value={formatCOP(ingPension, false)}
                      onChange={(e) => setIngPension(parseCOP(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <span className="input-helper">Colpensiones o Fondos Privados</span>
                </div>

                <div className="input-field">
                  <label className="input-label">Arrendamientos de Inmuebles o Vehículos</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      className="currency-input"
                      value={formatCOP(ingArriendos, false)}
                      onChange={(e) => setIngArriendos(parseCOP(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <span className="input-helper">Cánones de arrendamiento cobrados</span>
                </div>

                <div className="input-field">
                  <label className="input-label">Dividendos y Rendimientos Financieros</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      className="currency-input"
                      value={formatCOP(ingDividendos, false)}
                      onChange={(e) => setIngDividendos(parseCOP(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <span className="input-helper">Reparto de utilidades e intereses</span>
                </div>

                <div className="input-field">
                  <label className="input-label">Otros Ingresos (Comercio, Ventas, etc.)</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      className="currency-input"
                      value={formatCOP(ingOtros, false)}
                      onChange={(e) => setIngOtros(parseCOP(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <span className="input-helper">Cualquier otro ingreso en dinero o especie</span>
                </div>
              </div>

              {/* BARRA DE TOTAL INGRESOS */}
              <div
                style={{
                  marginTop: '20px',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  background: superaIngresos ? '#fee2e2' : '#f0fdf4',
                  border: `1.5px solid ${superaIngresos ? '#f87171' : '#86efac'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-muted)' }}>
                    Total Ingresos Brutos Acumulados
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: superaIngresos ? '#dc2626' : '#16a34a' }}>
                    {formatCOP(totalIngresos)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 800,
                      background: superaIngresos ? '#dc2626' : '#16a34a',
                      color: 'white',
                    }}
                  >
                    {superaIngresos ? '🚨 SUPERAS EL TOPE DE 1.400 UVT' : '✓ DENTRO DEL TOPE'}
                  </span>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Tope: {formatCOP(topeIngresosCop)}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn btn-primary" onClick={() => setCurrentStep(2)}>
                Continuar al Paso 2: Patrimonio y Movimientos →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PATRIMONIO Y MOVIMIENTOS */}
      {currentStep === 2 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Paso 2: Patrimonio Bruto y Movimientos Bancarios</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Basta superar <strong>UNO</strong> solo de estos topes para estar obligado
            </span>
          </div>
          <div className="card-body">
            <div className="form-section">
              <div className="calc-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div className="input-field">
                  <label className="input-label">
                    <span>Patrimonio Bruto a 31 de Diciembre</span>
                    <span className="input-helper">Tope: 4.500 UVT ({formatCOP(topePatrimonioCop)})</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      className="currency-input"
                      value={formatCOP(patrimonioBruto, false)}
                      onChange={(e) => setPatrimonioBruto(parseCOP(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <span className="input-helper">Suma de bienes raíces, vehículos, cuentas, acciones y derechos</span>
                  {superaPatrimonio && (
                    <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>
                      🚨 Supera el tope de 4.500 UVT
                    </span>
                  )}
                </div>

                <div className="input-field">
                  <label className="input-label">
                    <span>Consumos con Tarjeta de Crédito</span>
                    <span className="input-helper">Tope: 1.400 UVT ({formatCOP(topeTarjetaCop)})</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      className="currency-input"
                      value={formatCOP(tarjetaCredito, false)}
                      onChange={(e) => setTarjetaCredito(parseCOP(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <span className="input-helper">Total compras con tarjeta en todo el año</span>
                  {superaTarjeta && (
                    <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>
                      🚨 Supera el tope de 1.400 UVT
                    </span>
                  )}
                </div>

                <div className="input-field">
                  <label className="input-label">
                    <span>Compras y Consumos Totales</span>
                    <span className="input-helper">Tope: 1.400 UVT ({formatCOP(topeComprasCop)})</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      className="currency-input"
                      value={formatCOP(comprasTotales, false)}
                      onChange={(e) => setComprasTotales(parseCOP(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <span className="input-helper">Compras en débito, efectivo o transferencias</span>
                  {superaCompras && (
                    <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>
                      🚨 Supera el tope de 1.400 UVT
                    </span>
                  )}
                </div>

                <div className="input-field">
                  <label className="input-label">
                    <span>Consignaciones y Depósitos Bancarios</span>
                    <span className="input-helper">Tope: 1.400 UVT ({formatCOP(topeConsignacionesCop)})</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      className="currency-input"
                      value={formatCOP(consignaciones, false)}
                      onChange={(e) => setConsignaciones(parseCOP(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <span className="input-helper">Total abonos a cuentas de ahorro, corriente, Nequi y Daviplata</span>
                  {superaConsignaciones && (
                    <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>
                      🚨 Supera el tope de 1.400 UVT
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button className="btn btn-outline" onClick={() => setCurrentStep(1)}>
                ← Volver al Paso 1
              </button>
              <button className="btn btn-primary" onClick={() => setCurrentStep(3)}>
                Continuar al Paso 3: Situaciones Especiales →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SITUACIONES ESPECIALES */}
      {currentStep === 3 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Paso 3: Situaciones Jurídicas y Especiales</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Criterios adicionales según el Estatuto Tributario</span>
          </div>
          <div className="card-body">
            <div className="form-section">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-card-alt, #f8fafc)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>¿Fuiste responsable del Impuesto sobre las Ventas (IVA) en el año {taxYear}?</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Apareces inscrito en el RUT con la responsabilidad 48 o régimen común de IVA</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={esResponsableIva}
                    onChange={(e) => setEsResponsableIva(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-card-alt, #f8fafc)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>¿Recibiste ingresos de fuente extranjera / exterior?</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pagos recibidos de empresas extranjeras, plataformas del exterior o exportación de servicios</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={tieneIngresosExterior}
                    onChange={(e) => setTieneIngresosExterior(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-card-alt, #f8fafc)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>¿Eres socio, accionista o directivo de una sociedad colombiana?</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Titular de acciones o cuotas sociales en SAS, Ltda o S.A.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={esSocioSociedad}
                    onChange={(e) => setEsSocioSociedad(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button className="btn btn-outline" onClick={() => setCurrentStep(2)}>
                ← Volver al Paso 2
              </button>
              <button className="btn btn-primary" onClick={() => setCurrentStep(4)}>
                ⚡ Ver Dictamen y Resultado →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: VEREDICTO FINAL */}
      {currentStep === 4 && (
        <div>
          {/* BANNER RESULTADO */}
          <div
            className="card"
            style={{
              marginBottom: '20px',
              background: estaObligado
                ? 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #14532d 0%, #16a34a 100%)',
              color: 'white',
              textAlign: 'center',
              padding: '32px 24px',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>{estaObligado ? '🚨' : '🎉'}</div>
            <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 10px 0', color: 'white' }}>
              {estaObligado ? 'ESTÁS OBLIGADO A DECLARAR RENTA' : 'NO ESTÁS OBLIGADO A DECLARAR RENTA'}
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)', maxWidth: '650px', margin: '0 auto' }}>
              {estaObligado
                ? `Cumples con ${razonesObligado.length} de los criterios de obligatoriedad establecidos por el Estatuto Tributario para el año gravable ${taxYear}. Debes presentar el Formulario 210 ante la DIAN.`
                : `Tus ingresos, patrimonio, consumos y consignaciones están por debajo de los topes legales de la DIAN para el año gravable ${taxYear}. No estás obligado a presentar el Formulario 210.`}
            </p>
          </div>

          {/* RAZONES */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <h3 className="card-title">Desglose Normativo de Topes Evaluados</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {razones.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      background: item.superado ? '#fee2e2' : '#f0fdf4',
                      border: `1px solid ${item.superado ? '#fca5a5' : '#bbf7d0'}`,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: item.superado ? '#991b1b' : '#166534' }}>
                        {item.superado ? '❌ ' : '✓ '}
                        {item.titulo}
                      </div>
                      <div style={{ fontSize: '12px', color: item.superado ? '#b91c1c' : '#15803d' }}>
                        {item.desc}
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: item.superado ? '#dc2626' : '#16a34a', color: 'white' }}>
                      {item.norma}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ACCIONES Y TRANSFERENCIA */}
          <div className="card" style={{ background: '#f8fafc', border: '2px dashed #cbd5e1' }}>
            <div className="card-body" style={{ textAlign: 'center', padding: '24px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 8px 0' }}>
                ¿Deseas liquidar tu declaración o proyectar tus impuestos?
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '580px', margin: '0 auto 20px auto' }}>
                Transfiere automáticamente los valores que acabas de ingresar al liquidador avanzado de la Cédula General para ver la depuración completa, tus deducciones y el Formulario 210 oficial.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-outline" onClick={() => setCurrentStep(1)}>
                  ↺ Repetir Test
                </button>
                <button className="btn btn-primary" onClick={handleTransfer}>
                  🚀 Transferir al Liquidador Completo F-210 →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
