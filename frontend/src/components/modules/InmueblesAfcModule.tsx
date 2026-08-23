import React, { useState, useEffect } from 'react';
import { formatCOP, parseCOP } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { simularInmuebleAfc } from '../../services/api';

export const InmueblesAfcModule: React.FC = () => {
  const { showToast, taxYear, uvtValue } = useApp();

  const [precioVenta, setPrecioVenta] = useState<number>(450000000);
  const [costoHistorico, setCostoHistorico] = useState<number>(150000000);
  const [anoAdquisicion, setAnoAdquisicion] = useState<string>('2011');
  const [tipoInmueble, setTipoInmueble] = useState<string>('bienes_raices_urbanos');
  const [metodoCosto, setMetodoCosto] = useState<string>('art73');
  const [costoPersonalizado, setCostoPersonalizado] = useState<number>(0);
  const [mejoras, setMejoras] = useState<number>(0);
  const [depreciacion, setDepreciacion] = useState<number>(0);
  const [montoAfc, setMontoAfc] = useState<number>(21000000);
  const [isCasaHabitacion, setIsCasaHabitacion] = useState<boolean>(true);
  const [isPosesion2Anos, setIsPosesion2Anos] = useState<boolean>(true);

  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  useEffect(() => {
    // Generar años 1956 a 2024 y 1955 y anteriores
    const years: string[] = [];
    for (let y = 2024; y >= 1956; y--) {
      years.push(String(y));
    }
    years.push('1955 y anteriores');
    setAvailableYears(years);
  }, []);

  useEffect(() => {
    runSimulacion();
  }, [
    precioVenta,
    costoHistorico,
    anoAdquisicion,
    tipoInmueble,
    metodoCosto,
    costoPersonalizado,
    mejoras,
    depreciacion,
    montoAfc,
    isCasaHabitacion,
    isPosesion2Anos,
    taxYear,
    uvtValue,
  ]);

  const runSimulacion = async () => {
    try {
      const res = await simularInmuebleAfc({
        precio_venta_cop: precioVenta,
        costo_adquisicion_historico_cop: costoHistorico,
        costo_historico_cop: costoHistorico,
        costo_fiscal_inmueble_cop: costoHistorico,
        ano_adquisicion: anoAdquisicion,
        tipo_inmueble: tipoInmueble,
        metodo_costo_fiscal: metodoCosto,
        metodo_costo: metodoCosto,
        costo_fiscal_personalizado_cop: costoPersonalizado,
        costo_personalizado_cop: costoPersonalizado,
        mejoras_y_contribuciones_cop: mejoras,
        mejoras_adiciones_cop: mejoras,
        depreciacion_acumulada_deducida_cop: depreciacion,
        depreciacion_acumulada_cop: depreciacion,
        monto_depositado_afc_o_vivienda_cop: montoAfc,
        monto_consignado_afc_cop: montoAfc,
        es_vivienda_habitacion: isCasaHabitacion,
        es_casa_habitacion: isCasaHabitacion,
        posesion_mas_2_anos: isPosesion2Anos,
        posesion_mayor_a_2_anos: isPosesion2Anos,
        tax_year: taxYear || 2025,
        custom_uvt: uvtValue,
      });
      if (res) {
        setSimulationResult(res);
      }
    } catch (err) {
      console.warn('Error simulando Inmuebles AFC:', err);
    }
  };

  const loadPresetEjemplo1 = () => {
    setPrecioVenta(450000000);
    setCostoHistorico(150000000);
    setAnoAdquisicion('2011');
    setTipoInmueble('bienes_raices_urbanos');
    setMetodoCosto('art73');
    setCostoPersonalizado(0);
    setMejoras(0);
    setDepreciacion(0);
    setMontoAfc(21000000);
    setIsCasaHabitacion(true);
    setIsPosesion2Anos(true);
    showToast('✓ Ejemplo 1 cargado: Venta $450M, Compra 2011 por $150M y Cuenta AFC', 'success', 3000);
  };

  const loadPresetPre1987 = () => {
    setPrecioVenta(600000000);
    setCostoHistorico(25000000);
    setAnoAdquisicion('1983');
    setTipoInmueble('bienes_raices_urbanos');
    setMetodoCosto('art73');
    setCostoPersonalizado(0);
    setMejoras(0);
    setDepreciacion(0);
    setMontoAfc(0);
    setIsCasaHabitacion(true);
    setIsPosesion2Anos(true);
    showToast('✓ Ejemplo Pre-1987 cargado: Compra 1983 (Exención directa Art. 44)', 'success', 3000);
  };

  const loadPresetPredialArt72 = () => {
    setPrecioVenta(700000000);
    setCostoHistorico(200000000);
    setAnoAdquisicion('2015');
    setTipoInmueble('bienes_raices_urbanos');
    setMetodoCosto('art72');
    setCostoPersonalizado(550000000);
    setMejoras(0);
    setDepreciacion(0);
    setMontoAfc(50000000);
    setIsCasaHabitacion(true);
    setIsPosesion2Anos(true);
    showToast('✓ Ejemplo Art. 72 cargado: Autoavalúo Predial $550M', 'success', 3000);
  };

  const tablaPre1987 = [
    { ano: 'Antes de 1978', exencion: '100% (Totalmente Exento)', retencion: '0.0%' },
    { ano: '1978', exencion: '90%', retencion: '0.1%' },
    { ano: '1979', exencion: '80%', retencion: '0.2%' },
    { ano: '1980', exencion: '70%', retencion: '0.3%' },
    { ano: '1981', exencion: '60%', retencion: '0.4%' },
    { ano: '1982', exencion: '50%', retencion: '0.5%' },
    { ano: '1983', exencion: '40%', retencion: '0.6%' },
    { ano: '1984', exencion: '30%', retencion: '0.7%' },
    { ano: '1985', exencion: '20%', retencion: '0.8%' },
    { ano: '1986', exencion: '10%', retencion: '0.9%' },
  ];

  return (
    <div id="pane-inmuebles-afc" className="module-pane active">
      {/* HEADER HERO */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '24px' }}>🏡</span>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Planeación y Optimización Tributaria en Bienes Inmuebles, Reajuste Art. 73 &amp; Cuentas AFC
          </h2>
        </div>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
          Aprende y simula paso a paso las <strong>5 estrategias legales</strong> del Estatuto Tributario para optimizar el
          costo fiscal, aplicar la exención de hasta 5.000 UVT (Art. 311-1) y reducir legalmente el impuesto de Ganancia Ocasional (15%).
        </p>
      </div>

      {/* PRESETS BAR */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-sm" onClick={loadPresetEjemplo1}>
          ✨ Cargar Ejemplo 1: Casa Adquirida en 2011 ($450M) + Cuenta AFC
        </button>
        <button className="btn btn-outline btn-sm" onClick={loadPresetPre1987}>
          🏛️ Cargar Ejemplo 2: Inmueble Pre-1987 (Art. 44 y 399)
        </button>
        <button className="btn btn-outline btn-sm" onClick={loadPresetPredialArt72}>
          📑 Cargar Ejemplo 3: Autoavalúo Predial (Art. 72)
        </button>
      </div>

      {/* ========================================================================= */}
      {/* DIAGRAMA DE FLUJO VISUAL (DECISION TREE TRIBUTARIO) */}
      {/* ========================================================================= */}
      <div
        className="card"
        style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="card-header" style={{ background: 'var(--bg-card-header)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div className="card-title" style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
              🗺️ Diagrama de Flujo &amp; Ruta de Decisión Fiscal (Ganancia Ocasional en Inmuebles)
            </div>
            <span
              style={{
                fontSize: '11px',
                background: 'var(--primary)',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: 700,
              }}
            >
              Art. 300, 70, 72, 73, 44 &amp; 311-1 E.T.
            </span>
          </div>
        </div>

        <div className="card-body" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            {/* PASO 1: VENTA INMUEBLE */}
            <div
              style={{
                background: 'var(--primary-dark)',
                color: 'white',
                borderRadius: '10px',
                padding: '12px 20px',
                textAlign: 'center',
                maxWidth: '480px',
                width: '100%',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.85, fontWeight: 700 }}>
                Paso 1: Hecho Generador
              </div>
              <div style={{ fontSize: '14px', fontWeight: 900, marginTop: '2px' }}>
                🏠 Venta de Bien Raíz / Inmueble (Posesión &ge; 2 años)
              </div>
            </div>

            {/* CONECTOR A COSTO FISCAL */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '2px', height: '14px', background: 'var(--border-subtle)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>▼</span>
            </div>

            {/* PASO 2: SELECCIÓN COSTO FISCAL */}
            <div
              style={{
                background: 'var(--primary-light)',
                border: '2px solid var(--primary)',
                borderRadius: '10px',
                padding: '10px 16px',
                textAlign: 'center',
                maxWidth: '460px',
                width: '100%',
              }}
            >
              <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--primary)' }}>
                🤔 ¿Cómo determinar el Costo Fiscal más conveniente?
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--primary)', marginTop: '2px' }}>
                Elige el costo fiscal más alto para reducir legalmente la utilidad gravable
              </div>
            </div>

            {/* 3 RAMAS DE COSTO FISCAL */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px',
                width: '100%',
              }}
            >
              {/* RAMA 1: ART 73 DANE */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '2px solid var(--emerald)',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '10px',
                    background: 'var(--emerald)',
                    color: 'white',
                    fontSize: '9.5px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '8px',
                  }}
                >
                  ⭐ Estrategia Estrella
                </div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--emerald)' }}>
                  Art. 73 E.T. — Multiplicador DANE
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  Factores históricos oficiales (1955-2025).<br />
                  <strong>Ejemplo:</strong> Compra 2011 = <strong>2.86x</strong> ($150M ➔ $429M).
                </div>
              </div>

              {/* RAMA 2: ART 70 */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Art. 70 E.T. — Reajuste Anual
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  Ajuste porcentual decretado año a año acumulado en declaraciones de renta previas.
                </div>
              </div>

              {/* RAMA 3: ART 72 PREDIAL */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Art. 72 E.T. — Autoavalúo Predial
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  Avalúo catastral del Impuesto Predial Unificado del año anterior a la enajenación.
                </div>
              </div>
            </div>

            {/* CONECTOR A UTILIDAD BRUTA */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '2px', height: '14px', background: 'var(--border-subtle)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>▼</span>
            </div>

            {/* PASO 3: GANANCIA OCASIONAL BRUTA */}
            <div
              style={{
                background: 'var(--amber-light)',
                border: '1.5px solid var(--amber-border)',
                borderRadius: '8px',
                padding: '10px 18px',
                textAlign: 'center',
                maxWidth: '460px',
                width: '100%',
              }}
            >
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 700 }}>
                Paso 3: Depuración Inicial
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--amber)' }}>
                ⚖️ Ganancia Ocasional Bruta = Precio Venta &minus; Costo Fiscal Ajustado
              </div>
            </div>

            {/* CONECTOR A EXENCIONES */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '2px', height: '14px', background: 'var(--border-subtle)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>▼</span>
            </div>

            {/* PASO 4: EXENCIONES LEGALES */}
            <div
              style={{
                background: 'var(--rose-light)',
                border: '2px solid var(--rose)',
                borderRadius: '10px',
                padding: '10px 16px',
                textAlign: 'center',
                maxWidth: '460px',
                width: '100%',
              }}
            >
              <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--rose)' }}>
                🎁 ¿Aplica Exenciones Legales del Estatuto Tributario?
              </div>
            </div>

            {/* 2 RAMAS DE EXENCIÓN */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '12px',
                width: '100%',
              }}
            >
              {/* EXENCIÓN PRE-1987 */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--purple, #a855f7)',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--purple, #a855f7)' }}>
                  🏛️ Art. 44 E.T. — Inmuebles Pre-1987
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  Exención escalonada del <strong>10% al 100%</strong> de la utilidad para inmuebles adquiridos antes del 1 de enero de 1987.
                </div>
              </div>

              {/* EXENCIÓN AFC 5000 UVT */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '2px solid var(--sky, #0284c7)',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--sky, #0284c7)' }}>
                  🏦 Art. 311-1 &amp; 126-4 E.T. — Cuentas AFC / Vivienda
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  Exención del 100% de la ganancia hasta <strong>5.000 UVT ({formatCOP(5000 * uvtValue)})</strong> depositando en AFC o adquiriendo nueva vivienda.
                </div>
              </div>
            </div>

            {/* CONECTOR A RESULTADO FINAL */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '2px', height: '14px', background: 'var(--border-subtle)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>▼</span>
            </div>

            {/* PASO 5: BASE GRAVABLE Y TARIFA */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '12px',
                width: '100%',
                maxWidth: '600px',
              }}
            >
              <div
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1.5px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Base Gravable Final (Casilla 83)
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  Utilidad Bruta &minus; Ganancia Exenta
                </div>
              </div>

              <div
                style={{
                  background: 'var(--emerald-light)',
                  border: '2px solid var(--emerald)',
                  borderRadius: '8px',
                  padding: '10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '10.5px', color: 'var(--emerald)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Impuesto Final DIAN (Casilla 87)
                </div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--emerald)', marginTop: '2px' }}>
                  $0 COP a Tarifa Reducida 15%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SIMULADOR INTERACTIVO & RESULTADOS */}
      {/* ========================================================================= */}
      <div className="responsive-grid-split" style={{ marginBottom: '24px' }}>
        {/* PARÁMETROS FORMULARIO */}
        <div className="card" style={{ border: '2px solid var(--primary-border)' }}>
          <div className="card-header" style={{ background: 'var(--primary-light)' }}>
            <div className="card-title" style={{ color: 'var(--primary)', fontSize: '14px' }}>
              1. Parámetros de la Enajenación del Inmueble
            </div>
          </div>
          <div className="card-body">
            {/* PRECIO VENTA */}
            <div className="input-field" style={{ marginBottom: '10px' }}>
              <label className="input-label">Precio de Venta Pactado en Escritura ($ COP)</label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  id="afc-sim-precio-venta"
                  className="currency-input"
                  value={formatCOP(precioVenta, false)}
                  onChange={(e) => setPrecioVenta(parseCOP(e.target.value))}
                />
              </div>
            </div>

            {/* COSTO HISTÓRICO */}
            <div className="input-field" style={{ marginBottom: '10px' }}>
              <label className="input-label">Costo Histórico de Adquisición en Escritura ($ COP)</label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  id="afc-sim-costo-historico"
                  className="currency-input"
                  value={formatCOP(costoHistorico, false)}
                  onChange={(e) => setCostoHistorico(parseCOP(e.target.value))}
                />
              </div>
            </div>

            {/* AÑO ADQUISICIÓN Y TIPO ACTIVO */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div className="input-field">
                <label className="input-label">Año de Adquisición</label>
                <select
                  id="afc-sim-ano-adquisicion"
                  className="select-input"
                  value={anoAdquisicion}
                  onChange={(e) => setAnoAdquisicion(e.target.value)}
                >
                  {availableYears.map((yr) => {
                    const yrNum = parseInt(yr, 10);
                    const pre87 = yrNum < 1987 ? ' (Pre-1987 Art. 44)' : '';
                    return (
                      <option key={yr} value={yr}>
                        {yr}
                        {pre87}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="input-field">
                <label className="input-label">Tipo de Activo Fijo</label>
                <select
                  id="afc-sim-tipo-inmueble"
                  className="select-input"
                  value={tipoInmueble}
                  onChange={(e) => setTipoInmueble(e.target.value)}
                >
                  <option value="bienes_raices_urbanos">Bienes Raíces Urbanos (Casa/Apto)</option>
                  <option value="bienes_raices_rurales_agro">Bienes Raíces Rurales (Finca/Agro)</option>
                  <option value="acciones_o_aportes">Acciones o Aportes Sociales</option>
                </select>
              </div>
            </div>

            {/* MÉTODO DE COSTO FISCAL */}
            <div className="input-field" style={{ marginBottom: '10px' }}>
              <label className="input-label">Método de Determinación de Costo Fiscal</label>
              <select
                id="afc-sim-metodo-costo"
                className="select-input"
                value={metodoCosto}
                onChange={(e) => setMetodoCosto(e.target.value)}
              >
                <option value="art73">⭐ Art. 73 E.T. - Tabla Multiplicadores DANE / IGAC (Recomendado)</option>
                <option value="art72">🏛️ Art. 72 E.T. - Autoavalúo Predial / Catastral</option>
                <option value="art70">📈 Art. 70 E.T. - Reajuste Fiscal Anual Acumulado</option>
                <option value="historico">📄 Costo Histórico de Adquisición sin Ajustes</option>
              </select>
            </div>

            {/* COSTO PERSONALIZADO */}
            {(metodoCosto === 'art72' || metodoCosto === 'art70') && (
              <div id="afc-sim-costo-personalizado-container" className="input-field" style={{ marginBottom: '10px' }}>
                <label className="input-label" id="afc-sim-costo-personalizado-label">
                  {metodoCosto === 'art72'
                    ? 'Valor del Autoavalúo Predial / Catastral Año Anterior ($ COP)'
                    : 'Costo Fiscal Ajustado Acumulado por Art. 70 ($ COP)'}
                </label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    id="afc-sim-costo-personalizado"
                    className="currency-input"
                    value={formatCOP(costoPersonalizado, false)}
                    onChange={(e) => setCostoPersonalizado(parseCOP(e.target.value))}
                  />
                </div>
              </div>
            )}

            {/* MEJORAS Y DEPRECIACIÓN */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div className="input-field">
                <label className="input-label">Mejoras / Contribuciones ($ COP)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    id="afc-sim-mejoras"
                    className="currency-input"
                    value={formatCOP(mejoras, false)}
                    onChange={(e) => setMejoras(parseCOP(e.target.value))}
                  />
                </div>
              </div>
              <div className="input-field">
                <label className="input-label">Depreciación Deducida ($ COP)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    id="afc-sim-depreciacion"
                    className="currency-input"
                    value={formatCOP(depreciacion, false)}
                    onChange={(e) => setDepreciacion(parseCOP(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* MONTO AFC */}
            <div className="input-field" style={{ marginBottom: '12px' }}>
              <label className="input-label">Monto Depositado en Cuenta AFC o Destinado a Vivienda ($ COP)</label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  id="afc-sim-monto-afc"
                  className="currency-input"
                  value={formatCOP(montoAfc, false)}
                  onChange={(e) => setMontoAfc(parseCOP(e.target.value))}
                />
              </div>
              <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                Tope legal máximo de exención Art. 311-1: 5.000 UVT ({formatCOP(5000 * uvtValue)} para 2026).
              </div>
            </div>

            {/* CONDICIONES LEGALES */}
            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '10px' }}>
              <label className="checkbox-group" style={{ marginBottom: '6px' }}>
                <input
                  type="checkbox"
                  id="afc-sim-check-vivienda"
                  checked={isCasaHabitacion}
                  onChange={(e) => setIsCasaHabitacion(e.target.checked)}
                />
                <span style={{ fontSize: '11.5px' }}>
                  El inmueble vendido es la <strong>casa o apartamento de habitación</strong> del declarante.
                </span>
              </label>
              <label className="checkbox-group">
                <input
                  type="checkbox"
                  id="afc-sim-check-posesion"
                  checked={isPosesion2Anos}
                  onChange={(e) => setIsPosesion2Anos(e.target.checked)}
                />
                <span style={{ fontSize: '11.5px' }}>
                  Poseído por <strong>dos (2) años o más</strong> (clasifica como Ganancia Ocasional al 15%).
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* RESULTADO Y AHORRO AFC */}
        <div className="card" style={{ border: '2px solid var(--emerald-border)' }}>
          <div className="card-header" style={{ background: 'var(--emerald-light)' }}>
            <div className="card-title" style={{ color: 'var(--emerald)', fontSize: '14px' }}>
              2. Liquidación Tributaria &amp; Ahorro Fiscal Generado
            </div>
          </div>
          <div className="card-body" id="afc-sim-result-box">
            {simulationResult ? (
              <div>
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--emerald-border)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '12px',
                    borderLeft: '4px solid var(--emerald)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: 'var(--emerald)' }}>AHORRO TRIBUTARIO NETO:</span>
                    <span style={{ fontSize: '22px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--emerald)' }}>
                      {formatCOP(simulationResult.ahorro_total_impuesto_cop ?? 0)} COP ({simulationResult.porcentaje_ahorro_tributario_pct ?? 0}%)
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--emerald)', fontWeight: 600 }}>
                    Impuesto Sin Planeación: {formatCOP(simulationResult.impuesto_go_sin_beneficios_cop ?? simulationResult.impuesto_go_sin_planeacion_cop ?? 0)} ➔ Impuesto Final con Beneficios: {formatCOP(simulationResult.impuesto_go_con_beneficios_cop ?? 0)} COP
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '12px', fontSize: '11.5px' }}>
                  <div style={{ background: 'var(--bg-subtle)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '9.5px', textTransform: 'uppercase' }}>Costo Fiscal Determinado:</div>
                    <div style={{ fontWeight: 800, fontSize: '12.5px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {formatCOP(simulationResult.costo_fiscal_determinado_cop ?? simulationResult.costo_fiscal_cop ?? 0)}
                    </div>
                  </div>
                  <div style={{ background: 'var(--primary-light)', padding: '8px', borderRadius: '6px', border: '1px solid var(--primary-border)' }}>
                    <div style={{ color: 'var(--primary)', fontSize: '9.5px', textTransform: 'uppercase' }}>Utilidad Bruta:</div>
                    <div style={{ fontWeight: 800, fontSize: '12.5px', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                      {formatCOP(simulationResult.ganancia_ocasional_bruta_cop ?? 0)}
                    </div>
                  </div>
                  <div style={{ background: 'var(--emerald-light)', padding: '8px', borderRadius: '6px', border: '1px solid var(--emerald-border)' }}>
                    <div style={{ color: 'var(--emerald)', fontSize: '9.5px', textTransform: 'uppercase' }}>Total Ganancia Exenta:</div>
                    <div style={{ fontWeight: 800, fontSize: '12.5px', color: 'var(--emerald)', fontFamily: 'var(--font-mono)' }}>
                      {formatCOP(simulationResult.total_ganancia_exenta_cop ?? simulationResult.ganancia_ocasional_exenta_total_cop ?? 0)}
                    </div>
                  </div>
                  <div style={{ background: 'var(--amber-light)', padding: '8px', borderRadius: '6px', border: '1px solid var(--amber-border)' }}>
                    <div style={{ color: 'var(--amber)', fontSize: '9.5px', textTransform: 'uppercase' }}>Ganancia Gravada Final:</div>
                    <div style={{ fontWeight: 800, fontSize: '12.5px', color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                      {formatCOP(simulationResult.ganancia_ocasional_gravada_final_cop ?? 0)}
                    </div>
                  </div>
                </div>

                {/* CASILLAS FORMULARIO 210 */}
                <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '10px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--primary)', marginBottom: '6px' }}>
                    📋 Casillas del Formulario 210 DIAN (Cédula de Ganancias Ocasionales):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '6px', fontSize: '11px' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Casilla 80 (Ingresos):</span> <strong>{formatCOP(simulationResult.casilla_80_ingresos_brutos_cop ?? simulationResult.precio_venta_cop ?? 0)}</strong>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Casilla 81 (Costos):</span> <strong>{formatCOP(simulationResult.casilla_81_costos_cop ?? simulationResult.costo_fiscal_determinado_cop ?? 0)}</strong>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Casilla 82 (Exentas):</span> <strong>{formatCOP(simulationResult.casilla_82_exentas_cop ?? simulationResult.ganancia_ocasional_exenta_total_cop ?? 0)}</strong>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Casilla 83 (Gravable):</span> <strong>{formatCOP(simulationResult.casilla_83_gravables_cop ?? simulationResult.ganancia_ocasional_gravada_final_cop ?? 0)}</strong>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Casilla 87 (Impuesto):</span> <strong style={{ color: 'var(--emerald)' }}>{formatCOP(simulationResult.casilla_87_impuesto_go_cop ?? simulationResult.impuesto_go_con_beneficios_cop ?? 0)}</strong>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Casilla 134 (Retención):</span> <strong>{formatCOP(simulationResult.retencion_en_fuente_notarial_cop ?? simulationResult.retefuente_notarial_final_cop ?? 0)}</strong>
                    </div>
                  </div>
                </div>

                {/* MATRIZ COMPARATIVA DE 5 ESCENARIOS */}
                {(simulationResult.matriz_comparativa_escenarios || simulationResult.escenarios) && (
                  <div style={{ marginBottom: '12px', overflowX: 'auto' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      📊 Comparación Lado a Lado de Escenarios de Planeación Fiscal:
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-subtle)', textAlign: 'left' }}>
                          <th style={{ padding: '6px 8px', borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-primary)' }}>Estrategia / Escenario</th>
                          <th style={{ padding: '6px 8px', borderBottom: '2px solid var(--border-subtle)', textAlign: 'right', color: 'var(--text-primary)' }}>Costo Fiscal</th>
                          <th style={{ padding: '6px 8px', borderBottom: '2px solid var(--border-subtle)', textAlign: 'right', color: 'var(--text-primary)' }}>Base Gravable</th>
                          <th style={{ padding: '6px 8px', borderBottom: '2px solid var(--border-subtle)', textAlign: 'right', color: 'var(--text-primary)' }}>Impuesto (15%)</th>
                          <th style={{ padding: '6px 8px', borderBottom: '2px solid var(--border-subtle)', textAlign: 'right', color: 'var(--text-primary)' }}>Ahorro Neto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(simulationResult.matriz_comparativa_escenarios || simulationResult.escenarios || []).map((e: any, idx: number) => {
                          const nombre = e.estrategia_nombre ?? e.nombre ?? `Escenario ${idx + 1}`;
                          const costoFiscal = e.costo_fiscal_cop ?? e.costo_fiscal_aplicado_cop ?? 0;
                          const gananciaGravable = e.ganancia_gravable_cop ?? e.ganancia_ocasional_gravable_cop ?? 0;
                          const impuestoGo = e.impuesto_go_cop ?? e.impuesto_ganancia_ocasional_cop ?? 0;
                          const ahorroVsBase = e.ahorro_vs_base_cop ?? e.ahorro_frente_a_sin_planeacion_cop ?? 0;
                          const esOptimo = e.es_optimo ?? String(nombre).includes('Óptima');
                          return (
                            <tr key={idx} style={{ background: esOptimo ? 'rgba(16, 185, 129, 0.12)' : 'transparent' }}>
                              <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--border-subtle)', fontWeight: esOptimo ? 800 : 600, color: esOptimo ? 'var(--emerald)' : 'var(--text-primary)' }}>
                                {esOptimo ? '⭐ ' : ''}{nombre}
                              </td>
                              <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatCOP(costoFiscal)}</td>
                              <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatCOP(gananciaGravable)}</td>
                              <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', textAlign: 'right', color: impuestoGo > 0 ? 'var(--rose)' : 'var(--emerald)' }}>{formatCOP(impuestoGo)}</td>
                              <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', textAlign: 'right', color: 'var(--emerald)', fontWeight: 800 }}>{formatCOP(ahorroVsBase)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                Calculando simulación de inmuebles y cuentas AFC...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5 ESTRATEGIAS TRIBUTARIAS & NORMATIVA E.T. DETALLADA */}
      {/* ========================================================================= */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to right, #3b82f6, transparent)' }} />
          <span style={{ background: 'var(--primary-dark)', color: 'white', fontSize: '12px', fontWeight: 800, padding: '4px 16px', borderRadius: '20px' }}>
            📚 GUÍA NORMATIVA DE LAS 5 ESTRATEGIAS DEL ESTATUTO TRIBUTARIO
          </span>
          <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to left, #3b82f6, transparent)' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {/* ESTRATEGIA 1: ART 70 */}
          <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
            <div className="card-header" style={{ background: 'var(--primary-light)' }}>
              <div className="card-title" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 800 }}>
                📜 Estrategia 1: Artículo 70 del E.T. &mdash; Reajuste Fiscal Anual Acumulado
              </div>
            </div>
            <div className="card-body" style={{ fontSize: '11.5px', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
              <p style={{ margin: '0 0 8px' }}>
                <strong>&bull; ¿Qué es?</strong> Permite incrementar cada año el costo fiscal del inmueble en el porcentaje que decreta el Gobierno Nacional (según IPC o meta de inflación).
              </p>
              <p style={{ margin: '0 0 8px' }}>
                <strong>&bull; ¿Cómo usarlo?</strong> En cada declaración de renta anual, se multiplica el costo del año anterior por <code>(1 + % de reajuste)</code> y se declara en la casilla patrimonial correspondiente.
              </p>
              <p style={{ margin: 0, color: 'var(--primary)', background: 'var(--primary-light)', padding: '6px 10px', borderRadius: '6px', fontWeight: 600 }}>
                💡 <strong>Efecto al vender:</strong> El costo acumulado es significativamente más alto que el de la escritura original, reduciendo la ganancia gravable.
              </p>
            </div>
          </div>

          {/* ESTRATEGIA 2: ART 73 DANE */}
          <div className="card" style={{ borderTop: '4px solid var(--emerald)' }}>
            <div className="card-header" style={{ background: 'var(--emerald-light)' }}>
              <div className="card-title" style={{ fontSize: '13px', color: 'var(--emerald)', fontWeight: 800 }}>
                📈 Estrategia 2: Artículo 73 del E.T. &mdash; Multiplicador Histórico DANE (Estrella)
              </div>
            </div>
            <div className="card-body" style={{ fontSize: '11.5px', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
              <p style={{ margin: '0 0 6px' }}>
                <strong>&bull; ¿Qué es?</strong> Mecanismo extraordinario para personas naturales que <strong>no requiere haber hecho reajustes anuales previos</strong>.
              </p>
              <p style={{ margin: '0 0 6px' }}>
                <strong>&bull; ¿Cómo usarlo?</strong> Se busca el año de adquisición en la Tabla Oficial del DANE (1955 a 2025) y se multiplica el costo original por el factor certificado.
              </p>
              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '8px', margin: '6px 0', fontSize: '10.5px' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Factores Oficiales DANE:</span> 1955: <strong>36.08x</strong> &bull; 1990: <strong>14.20x</strong> &bull; 2000: <strong>5.61x</strong> &bull; 2011: <strong>2.86x</strong>
              </div>
              <div style={{ background: 'var(--emerald-light)', border: '1px solid var(--emerald-border)', borderRadius: '6px', padding: '6px 10px', fontSize: '10.5px', color: 'var(--emerald)', fontFamily: 'var(--font-mono)' }}>
                Fórmula: Costo Ajustado = (Costo Histórico &times; Factor DANE) + Mejoras &minus; Depreciación
              </div>
            </div>
          </div>

          {/* ESTRATEGIA 3: ART 311-1 CUENTAS AFC */}
          <div className="card" style={{ borderTop: '4px solid var(--sky)' }}>
            <div className="card-header" style={{ background: 'var(--sky-light)' }}>
              <div className="card-title" style={{ fontSize: '13px', color: 'var(--sky)', fontWeight: 800 }}>
                🏦 Estrategia 3: Arts. 311-1 y 126-4 E.T. &mdash; Cuentas AFC y Destino a Vivienda
              </div>
            </div>
            <div className="card-body" style={{ fontSize: '11.5px', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
              <p style={{ margin: '0 0 6px' }}>
                <strong>&bull; ¿Qué es?</strong> Exención del 100% de la ganancia ocasional generada en la venta de la casa o apartamento de habitación, hasta un tope de <strong>5.000 UVT ({formatCOP(5000 * uvtValue)})</strong>.
              </p>
              <div style={{ background: 'var(--sky-light)', border: '1px solid var(--sky-border)', borderRadius: '6px', padding: '8px', margin: '6px 0', fontSize: '11px', color: 'var(--sky)' }}>
                <strong style={{ color: 'var(--sky)' }}>3 Requisitos Obligatorios:</strong>
                <ol style={{ margin: '4px 0 0 16px', padding: 0, color: 'var(--text-secondary)' }}>
                  <li>Debe ser la casa o apartamento de habitación del declarante.</li>
                  <li>Valor catastral/venta no superior a 23.000 UVT ({formatCOP(23000 * uvtValue)}).</li>
                  <li>Consignación en Cuenta AFC o destino a compra de nueva vivienda en &le; 1 año.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* ESTRATEGIA 4: ART 44 PRE-1987 */}
          <div className="card" style={{ borderTop: '4px solid var(--purple)' }}>
            <div className="card-header" style={{ background: 'var(--purple-light)' }}>
              <div className="card-title" style={{ fontSize: '13px', color: 'var(--purple)', fontWeight: 800 }}>
                🏛️ Estrategia 4: Artículo 44 y 399 del E.T. &mdash; Inmuebles Adquiridos Antes de 1987
              </div>
            </div>
            <div className="card-body" style={{ fontSize: '11.5px', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
              <p style={{ margin: '0 0 6px' }}>
                <strong>&bull; ¿Qué es?</strong> Régimen de transición legal para inmuebles de habitación adquiridos antes del 1 de enero de 1987.
              </p>
              <div style={{ overflowX: 'auto', maxHeight: '160px', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', background: 'var(--bg-card)' }}>
                  <thead>
                    <tr style={{ background: 'var(--purple-light)', textAlign: 'left' }}>
                      <th style={{ padding: '4px 6px', borderBottom: '1px solid var(--purple-border)', color: 'var(--purple)' }}>Año Adquisición</th>
                      <th style={{ padding: '4px 6px', borderBottom: '1px solid var(--purple-border)', textAlign: 'right', color: 'var(--purple)' }}>% No Gravada (Exenta)</th>
                      <th style={{ padding: '4px 6px', borderBottom: '1px solid var(--purple-border)', textAlign: 'right', color: 'var(--purple)' }}>Retención Notarial</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tablaPre1987.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '3px 6px', fontWeight: 700, color: 'var(--text-primary)' }}>{row.ano}</td>
                        <td style={{ padding: '3px 6px', textAlign: 'right', color: 'var(--emerald)', fontWeight: 800 }}>{row.exencion}</td>
                        <td style={{ padding: '3px 6px', textAlign: 'right', color: 'var(--text-muted)' }}>{row.retencion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ESTRATEGIA 5: ART 72, 398 Y 400 */}
          <div className="card" style={{ borderTop: '4px solid var(--amber)' }}>
            <div className="card-header" style={{ background: 'var(--amber-light)' }}>
              <div className="card-title" style={{ fontSize: '13px', color: 'var(--amber)', fontWeight: 800 }}>
                📑 Estrategia 5: Arts. 72, 398 y 400 E.T. &mdash; Avalúo Catastral y Retención Notarial
              </div>
            </div>
            <div className="card-body" style={{ fontSize: '11.5px', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
              <p style={{ margin: '0 0 6px' }}>
                <strong>&bull; Artículo 72 E.T.:</strong> Permite fijar como costo fiscal el autoavalúo o avalúo catastral del Impuesto Predial Unificado del año anterior a la enajenación.
              </p>
              <p style={{ margin: '0 0 6px' }}>
                <strong>&bull; Artículo 398 E.T.:</strong> En notaría se retiene el <strong>1% sobre el valor de la venta</strong>. Este monto se descuenta directamente en la <strong>Casilla 134</strong> del Formulario 210.
              </p>
              <p style={{ margin: 0, color: 'var(--amber)', background: 'var(--amber-light)', padding: '6px 10px', borderRadius: '6px' }}>
                🏠 <strong>Artículo 400 E.T.:</strong> Exime totalmente de retención notarial a las Viviendas de Interés Social (VIS y VIP).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EJEMPLO INTEGRAL COMPARATIVO PASO A PASO & FORMULARIO 210 */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* EJEMPLO INTEGRAL COMPARATIVO PASO A PASO & FORMULARIO 210 */}
      {/* ========================================================================= */}
      <div className="card" style={{ border: '2px solid var(--primary-border)', marginBottom: '24px' }}>
        <div className="card-header" style={{ background: 'var(--primary-light)' }}>
          <div className="card-title" style={{ fontSize: '13.5px', color: 'var(--primary)', fontWeight: 800 }}>
            🧮 Ejemplo Práctico Integrado ($450.000.000 Venta / $150.000.000 Compra en 2011)
          </div>
        </div>
        <div className="card-body" style={{ padding: '16px' }}>
          <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-primary)' }}>Concepto Liquidado</th>
                  <th style={{ padding: '8px 10px', borderBottom: '2px solid var(--border-subtle)', textAlign: 'right', color: 'var(--rose)' }}>Sin Planeación</th>
                  <th style={{ padding: '8px 10px', borderBottom: '2px solid var(--border-subtle)', textAlign: 'right', color: 'var(--primary)' }}>Con Art. 73 E.T. (DANE)</th>
                  <th style={{ padding: '8px 10px', borderBottom: '2px solid var(--border-subtle)', textAlign: 'right', color: 'var(--emerald)' }}>Con Art. 73 + Cuenta AFC</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, color: 'var(--text-primary)' }}>Precio de Venta (Escritura)</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>$450.000.000</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>$450.000.000</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>$450.000.000</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, color: 'var(--text-primary)' }}>Costo Fiscal Aplicado</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>$150.000.000 (Histórico 2011)</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 700 }}>$429.000.000 (Factor 2.86x)</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 700 }}>$429.000.000 (Factor 2.86x)</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, color: 'var(--text-primary)' }}>Ganancia Ocasional Bruta</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>$300.000.000</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>$21.000.000</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>$21.000.000</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, color: 'var(--text-primary)' }}>Exención Cuenta AFC (Art. 311-1)</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>$0</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>$0</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--emerald)', fontWeight: 700 }}>-$21.000.000 (Tope 5.000 UVT)</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, color: 'var(--text-primary)' }}>Ganancia Gravable Final</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--rose)' }}>$300.000.000</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>$21.000.000</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--emerald)', fontWeight: 800 }}>$0 COP</td>
                </tr>
                <tr style={{ background: 'var(--bg-subtle)' }}>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 800, color: 'var(--text-primary)' }}>Impuesto Ganancia Ocasional (15%)</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--rose)', fontWeight: 800 }}>$45.000.000</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 800 }}>$3.150.000</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--emerald)', fontWeight: 900, fontSize: '13px' }}>$0 COP</td>
                </tr>
                <tr style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 800, color: 'var(--emerald)' }}>💰 Ahorro Neto Total Obtenido</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>$0</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 800 }}>+$41.850.000 (93%)</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--emerald)', fontWeight: 900, fontSize: '13px' }}>+$45.000.000 (100% Ahorro)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* DILIGENCIAMIENTO FORMULARIO 210 */}
          <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
              📋 Reflejo en el Formulario 210 de la DIAN (Cédula de Ganancias Ocasionales):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '11px' }}>
              <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Casilla 80 (Ingresos):</span> <strong style={{ color: 'var(--text-primary)' }}>$450.000.000 COP</strong>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Casilla 81 (Costos):</span> <strong style={{ color: 'var(--text-primary)' }}>$429.000.000 COP</strong>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Casilla 82 (Exentas):</span> <strong style={{ color: 'var(--text-primary)' }}>$21.000.000 COP</strong>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Casilla 83 (Gravable):</span> <strong style={{ color: 'var(--emerald)' }}>$0 COP</strong>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Casilla 87 (Impuesto):</span> <strong style={{ color: 'var(--emerald)' }}>$0 COP</strong>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Casilla 134 (Retención 1% a favor):</span> <strong style={{ color: 'var(--primary)' }}>$4.500.000 COP</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
