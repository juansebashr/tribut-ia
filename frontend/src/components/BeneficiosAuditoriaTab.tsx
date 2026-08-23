import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Percent,
  BookOpen,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building,
  Home,
  Sparkles,
  TreePine,
  Calculator,
  Info,
  Layers,
  FileCheck,
  Bookmark,
  PlayCircle,
  Award,
} from 'lucide-react';
import type {
  AjusteArticulo73Item,
  SimulacionAjusteArticulo73Response,
  BeneficioItem,
  BeneficioAuditoriaResponse,
  ReduccionSancionResponse,
  SimulacionInmuebleAfcResponse,
} from '../types/tax';
import {
  fetchTablaArticulo73,
  simularArticulo73,
  fetchBeneficiosCatalog,
  simularAuditoria,
  simularSancion,
  simularInmuebleAfc,
} from '../services/api';

interface BeneficiosAuditoriaTabProps {
  taxYear: number;
  uvtValue: number;
}

const ALL_HISTORIC_YEARS = Array.from({ length: 2026 - 1955 + 1 }, (_, i) => (2026 - i).toString());

export const BeneficiosAuditoriaTab: React.FC<BeneficiosAuditoriaTabProps> = ({
  taxYear,
  uvtValue,
}) => {
  // Subpestañas
  const [activeSubTab, setActiveSubTab] = useState<
    'inmuebles_afc' | 'art73' | 'auditoria' | 'sanciones' | 'catalogo'
  >('inmuebles_afc');

  // --- Estado Inmuebles & Cuentas AFC (5 Estrategias) ---
  const [afcPrecioVenta, setAfcPrecioVenta] = useState<string>('450000000');
  const [afcCostoHistorico, setAfcCostoHistorico] = useState<string>('150000000');
  const [afcAnoAdquisicion, setAfcAnoAdquisicion] = useState<string>('2011');
  const [afcTipoInmueble, setAfcTipoInmueble] = useState<string>('bienes_raices_urbanos');
  const [afcMetodoCosto, setAfcMetodoCosto] = useState<string>('art73');
  const [afcCostoPersonalizado, setAfcCostoPersonalizado] = useState<string>('0');
  const [afcMejoras, setAfcMejoras] = useState<string>('0');
  const [afcDepreciacion, setAfcDepreciacion] = useState<string>('0');
  const [afcMontoAfc, setAfcMontoAfc] = useState<string>('21000000');
  const [afcEsVivienda, setAfcEsVivienda] = useState<boolean>(true);
  const [afcPosesion2Anos, setAfcPosesion2Anos] = useState<boolean>(true);
  const [simulacionInmuebleAfc, setSimulacionInmuebleAfc] = useState<SimulacionInmuebleAfcResponse | null>(null);
  const [selectedStrategyExplainer, setSelectedStrategyExplainer] = useState<string>('art73');

  // --- Estado Art. 73 ---
  const [tablaArt73, setTablaArt73] = useState<AjusteArticulo73Item[]>([]);
  const [selectedTipoActivo, setSelectedTipoActivo] = useState<string>('bienes_raices_urbanos');
  const [selectedAnoAdquisicion, setSelectedAnoAdquisicion] = useState<string>('1995');
  const [costoHistoricoInput, setCostoHistoricoInput] = useState<string>('20000000');
  const [precioVentaInput, setPrecioVentaInput] = useState<string>('500000000');
  const [simulacionArt73, setSimulacionArt73] = useState<SimulacionAjusteArticulo73Response | null>(null);
  const [searchTableYear, setSearchTableYear] = useState<string>('');

  // --- Estado Auditoria ---
  const [impuestoAnoAntInput, setImpuestoAnoAntInput] = useState<string>('10000000');
  const [auditoriaResult, setAuditoriaResult] = useState<BeneficioAuditoriaResponse | null>(null);

  // --- Estado Sanciones ---
  const [sancionBaseInput, setSancionBaseInput] = useState<string>('5000000');
  const [sinSanciones2Anos, setSinSanciones2Anos] = useState<boolean>(true);
  const [sinSanciones1Ano, setSinSanciones1Ano] = useState<boolean>(true);
  const [sancionResult, setSancionResult] = useState<ReduccionSancionResponse | null>(null);

  // --- Estado Catálogo ---
  const [catalogo, setCatalogo] = useState<BeneficioItem[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [busquedaCatalogo, setBusquedaCatalogo] = useState<string>('');

  // Carga inicial
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tabla, cats] = await Promise.all([
        fetchTablaArticulo73().catch(() => []),
        fetchBeneficiosCatalog().catch(() => []),
      ]);
      setTablaArt73(tabla);
      setCatalogo(cats);
    } catch (e) {
      console.error('Error cargando datos de beneficios', e);
    }
  };

  const [toastFeedback, setToastFeedback] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastFeedback(msg);
    setTimeout(() => setToastFeedback(null), 3500);
  };

  // Recalcular Inmuebles & AFC en vivo
  const calcularInmuebleAfcNow = async (customParams?: Partial<{
    precio: number;
    costo: number;
    ano: string;
    tipo: string;
    metodo: string;
    costoPersonalizado: number;
    mejoras: number;
    depreciacion: number;
    montoAfc: number;
    esVivienda: boolean;
    posesion2Anos: boolean;
  }>) => {
    const precio = customParams?.precio !== undefined ? customParams.precio : (parseFloat(afcPrecioVenta) || 0);
    const costo = customParams?.costo !== undefined ? customParams.costo : (parseFloat(afcCostoHistorico) || 0);
    if (precio <= 0) return;

    try {
      const res = await simularInmuebleAfc({
        precio_venta_cop: precio,
        costo_adquisicion_historico_cop: costo,
        ano_adquisicion: customParams?.ano || afcAnoAdquisicion,
        tipo_inmueble: customParams?.tipo || afcTipoInmueble,
        metodo_costo_fiscal: customParams?.metodo || afcMetodoCosto,
        costo_fiscal_personalizado_cop: customParams?.costoPersonalizado !== undefined ? customParams.costoPersonalizado : (parseFloat(afcCostoPersonalizado) || 0),
        mejoras_y_contribuciones_cop: customParams?.mejoras !== undefined ? customParams.mejoras : (parseFloat(afcMejoras) || 0),
        depreciacion_acumulada_deducida_cop: customParams?.depreciacion !== undefined ? customParams.depreciacion : (parseFloat(afcDepreciacion) || 0),
        monto_depositado_afc_o_vivienda_cop: customParams?.montoAfc !== undefined ? customParams.montoAfc : (parseFloat(afcMontoAfc) || 0),
        es_vivienda_habitacion: customParams?.esVivienda !== undefined ? customParams.esVivienda : afcEsVivienda,
        posesion_mas_2_anos: customParams?.posesion2Anos !== undefined ? customParams.posesion2Anos : afcPosesion2Anos,
        tax_year: taxYear,
        custom_uvt: uvtValue,
      });
      setSimulacionInmuebleAfc(res);
    } catch (err) {
      console.error('Error calculando simulacion inmueble afc', err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      calcularInmuebleAfcNow();
    }, 150);

    return () => clearTimeout(timer);
  }, [
    afcPrecioVenta,
    afcCostoHistorico,
    afcAnoAdquisicion,
    afcTipoInmueble,
    afcMetodoCosto,
    afcCostoPersonalizado,
    afcMejoras,
    afcDepreciacion,
    afcMontoAfc,
    afcEsVivienda,
    afcPosesion2Anos,
    taxYear,
    uvtValue,
  ]);

  // Presets rápidos para Inmuebles & AFC
  const loadPresetEjemplo1 = () => {
    setAfcPrecioVenta('450000000');
    setAfcCostoHistorico('150000000');
    setAfcAnoAdquisicion('2011');
    setAfcTipoInmueble('bienes_raices_urbanos');
    setAfcMetodoCosto('art73');
    setAfcCostoPersonalizado('0');
    setAfcMejoras('0');
    setAfcDepreciacion('0');
    setAfcMontoAfc('21000000');
    setAfcEsVivienda(true);
    setAfcPosesion2Anos(true);
    calcularInmuebleAfcNow({
      precio: 450000000,
      costo: 150000000,
      ano: '2011',
      tipo: 'bienes_raices_urbanos',
      metodo: 'art73',
      costoPersonalizado: 0,
      mejoras: 0,
      depreciacion: 0,
      montoAfc: 21000000,
      esVivienda: true,
      posesion2Anos: true,
    });
    triggerToast('✓ Ejemplo 1 cargado: Venta $450M, Compra 2011 por $150M y Cuenta AFC');
  };

  const loadPresetPre1987 = () => {
    setAfcPrecioVenta('600000000');
    setAfcCostoHistorico('25000000');
    setAfcAnoAdquisicion('1983');
    setAfcTipoInmueble('bienes_raices_urbanos');
    setAfcMetodoCosto('art73');
    setAfcCostoPersonalizado('0');
    setAfcMejoras('0');
    setAfcDepreciacion('0');
    setAfcMontoAfc('0');
    setAfcEsVivienda(true);
    setAfcPosesion2Anos(true);
    calcularInmuebleAfcNow({
      precio: 600000000,
      costo: 25000000,
      ano: '1983',
      tipo: 'bienes_raices_urbanos',
      metodo: 'art73',
      costoPersonalizado: 0,
      mejoras: 0,
      depreciacion: 0,
      montoAfc: 0,
      esVivienda: true,
      posesion2Anos: true,
    });
    triggerToast('✓ Ejemplo Pre-1987 cargado: Vivienda 1983 con 40% exención Art. 44');
  };

  const loadPresetViviendaAfc = () => {
    setAfcPrecioVenta('800000000');
    setAfcCostoHistorico('350000000');
    setAfcAnoAdquisicion('2018');
    setAfcTipoInmueble('bienes_raices_urbanos');
    setAfcMetodoCosto('art73');
    setAfcCostoPersonalizado('0');
    setAfcMejoras('0');
    setAfcDepreciacion('0');
    setAfcMontoAfc('261750000');
    setAfcEsVivienda(true);
    setAfcPosesion2Anos(true);
    calcularInmuebleAfcNow({
      precio: 800000000,
      costo: 350000000,
      ano: '2018',
      tipo: 'bienes_raices_urbanos',
      metodo: 'art73',
      costoPersonalizado: 0,
      mejoras: 0,
      depreciacion: 0,
      montoAfc: 261750000,
      esVivienda: true,
      posesion2Anos: true,
    });
    triggerToast('✓ Ejemplo Vivienda + AFC cargado: Exención 5.000 UVT Art. 311-1');
  };

  const loadPresetFincaRural = () => {
    setAfcPrecioVenta('1200000000');
    setAfcCostoHistorico('200000000');
    setAfcAnoAdquisicion('2008');
    setAfcTipoInmueble('bienes_raices_rurales_agro');
    setAfcMetodoCosto('art73');
    setAfcCostoPersonalizado('0');
    setAfcMejoras('50000000');
    setAfcDepreciacion('0');
    setAfcMontoAfc('0');
    setAfcEsVivienda(false);
    setAfcPosesion2Anos(true);
    calcularInmuebleAfcNow({
      precio: 1200000000,
      costo: 200000000,
      ano: '2008',
      tipo: 'bienes_raices_rurales_agro',
      metodo: 'art73',
      costoPersonalizado: 0,
      mejoras: 50000000,
      depreciacion: 0,
      montoAfc: 0,
      esVivienda: false,
      posesion2Anos: true,
    });
    triggerToast('✓ Ejemplo Finca Rural cargado: Reajuste Art. 73 Rural + Mejoras');
  };

  // Recalcular Art. 73 en vivo
  useEffect(() => {
    const costo = parseFloat(costoHistoricoInput);
    const venta = parseFloat(precioVentaInput);
    if (!costo || costo <= 0) return;

    const timer = setTimeout(async () => {
      try {
        const res = await simularArticulo73({
          ano_adquisicion: selectedAnoAdquisicion,
          tipo_activo: selectedTipoActivo,
          costo_adquisicion_historico_cop: costo,
          precio_venta_estimado_cop: venta > 0 ? venta : undefined,
          ano_gravable_enajenacion: taxYear,
        });
        setSimulacionArt73(res);
      } catch (err) {
        console.error(err);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedAnoAdquisicion, selectedTipoActivo, costoHistoricoInput, precioVentaInput, taxYear]);

  // Recalcular Auditoría
  useEffect(() => {
    const impAnt = parseFloat(impuestoAnoAntInput);
    if (isNaN(impAnt) || impAnt < 0) return;
    simularAuditoria({
      tax_year: taxYear,
      impuesto_neto_ano_anterior: impAnt,
      custom_uvt: uvtValue,
    })
      .then((res) => setAuditoriaResult(res))
      .catch(console.error);
  }, [impuestoAnoAntInput, taxYear, uvtValue]);

  // Recalcular Sanciones
  useEffect(() => {
    const sBase = parseFloat(sancionBaseInput);
    if (isNaN(sBase) || sBase < 0) return;
    simularSancion({
      monto_sancion_base_cop: sBase,
      sin_sanciones_ultimos_2_anos: sinSanciones2Anos,
      sin_sanciones_ultimo_1_ano: sinSanciones1Ano,
    })
      .then((res) => setSancionResult(res))
      .catch(console.error);
  }, [sancionBaseInput, sinSanciones2Anos, sinSanciones1Ano]);

  const formatCOP = (val?: number | null) => {
    if (val === undefined || val === null) return '$0 COP';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredTabla = tablaArt73.filter((r) =>
    r.ano_adquisicion.toLowerCase().includes(searchTableYear.toLowerCase())
  );

  const filteredCatalogo = catalogo.filter((item) => {
    const matchCat = filtroCategoria === 'todos' || item.categoria === filtroCategoria;
    const matchText =
      item.nombre.toLowerCase().includes(busquedaCatalogo.toLowerCase()) ||
      item.articulo_et.toLowerCase().includes(busquedaCatalogo.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(busquedaCatalogo.toLowerCase());
    return matchCat && matchText;
  });

  return (
    <div className="section-container animate-fade-in" style={{ marginTop: '16px' }}>
      {/* HEADER PRINCIPAL */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp color="var(--primary)" size={24} />
              Beneficios Tributarios, Reajustes & Firmeza
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Herramientas didácticas de planeación fiscal bajo el Estatuto Tributario Nacional (Art. 73, Art. 689-3 y Art. 640).
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge-uvt" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
              UVT {taxYear}: {formatCOP(uvtValue)}
            </span>
          </div>
        </div>

        {/* SUBTABS */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button
            className={`btn-subtab ${activeSubTab === 'inmuebles_afc' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('inmuebles_afc')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Home size={16} />
            Inmuebles & Cuentas AFC (5 Estrategias)
            <span style={{ fontSize: '10px', background: 'var(--success)', color: '#fff', padding: '2px 6px', borderRadius: '10px', fontWeight: 700 }}>
              E.T. 5.000 UVT
            </span>
          </button>
          <button
            className={`btn-subtab ${activeSubTab === 'art73' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('art73')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Building size={16} />
            Reajuste de Activos (Art. 73 E.T.)
            <span style={{ fontSize: '10px', background: 'var(--primary)', color: '#fff', padding: '2px 6px', borderRadius: '10px', fontWeight: 700 }}>
              Oficial DANE
            </span>
          </button>
          <button
            className={`btn-subtab ${activeSubTab === 'auditoria' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('auditoria')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldCheck size={16} />
            Beneficio de Auditoría (Art. 689-3)
          </button>
          <button
            className={`btn-subtab ${activeSubTab === 'sanciones' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('sanciones')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Percent size={16} />
            Reducción Sanciones (Art. 640)
          </button>
          <button
            className={`btn-subtab ${activeSubTab === 'catalogo' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('catalogo')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <BookOpen size={16} />
            Catálogo Completo ({catalogo.length})
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* --- SUBTAB 0: INMUEBLES & CUENTAS AFC (5 ESTRATEGIAS LEGALES E.T.) --- */}
      {/* ========================================================================= */}
      {activeSubTab === 'inmuebles_afc' && (
        <div className="space-y-6">
          {/* BANNER DIDACTICO PRINCIPAL */}
          <div
            style={{
              padding: '20px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  background: 'var(--success)',
                  color: '#fff',
                  padding: '10px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '17px', color: 'var(--text-main)', margin: 0 }}>
                    5 Estrategias Legales para Pagar Menos o Cero Impuestos al Vender Inmuebles en Colombia
                  </h3>
                  <span className="badge-uvt" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)' }}>
                    Planeación Tributaria & Estatuto Tributario
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginTop: '6px' }}>
                  Al vender un inmueble poseído por 2 o más años, la tarifa general de <strong>Ganancia Ocasional es del 15% (Ley 2277 de 2022)</strong>.
                  La ley colombiana contempla mecanismos 100% legales y oficiales para elevar el costo fiscal o exentar la ganancia, pudiendo reducir el impuesto hasta <strong>$0 COP</strong>.
                </p>
              </div>
            </div>

            {/* TARJETAS RESUMEN DE LAS 5 ESTRATEGIAS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '6px' }}>
              <div
                onClick={() => setSelectedStrategyExplainer('art70')}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: selectedStrategyExplainer === 'art70' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-main)',
                  border: `1px solid ${selectedStrategyExplainer === 'art70' ? 'var(--primary)' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                  1. Art. 70 E.T.
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Ajuste porcentual anual al costo histórico en cada declaración.
                </div>
              </div>

              <div
                onClick={() => setSelectedStrategyExplainer('art73')}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: selectedStrategyExplainer === 'art73' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-main)',
                  border: `1px solid ${selectedStrategyExplainer === 'art73' ? 'var(--primary)' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                  2. Art. 73 E.T. (DANE)
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Multiplicador oficial por año de compra (hasta 36x).
                </div>
              </div>

              <div
                onClick={() => setSelectedStrategyExplainer('art311')}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: selectedStrategyExplainer === 'art311' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-main)',
                  border: `1px solid ${selectedStrategyExplainer === 'art311' ? 'var(--success)' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--success)', marginBottom: '4px' }}>
                  3. Art. 311-1 (AFC)
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Hasta 5.000 UVT ({formatCOP(5000 * uvtValue)}) 100% exentas en vivienda.
                </div>
              </div>

              <div
                onClick={() => setSelectedStrategyExplainer('art44')}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: selectedStrategyExplainer === 'art44' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-main)',
                  border: `1px solid ${selectedStrategyExplainer === 'art44' ? 'var(--warning)' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#d97706', marginBottom: '4px' }}>
                  4. Art. 44 (Pre-1987)
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  10% al 100% de utilidad exenta si se compró antes de 1987.
                </div>
              </div>

              <div
                onClick={() => setSelectedStrategyExplainer('art72')}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: selectedStrategyExplainer === 'art72' ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-main)',
                  border: `1px solid ${selectedStrategyExplainer === 'art72' ? '#8b5cf6' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#8b5cf6', marginBottom: '4px' }}>
                  5. Art. 72 & Retención
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Autoavalúo catastral y reducción de retención notarial (Art. 399).
                </div>
              </div>
            </div>

            {/* DETALLE EXPLICATIVO DE LA ESTRATEGIA SELECCIONADA */}
            <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.6' }}>
              {selectedStrategyExplainer === 'art70' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '16px' }}>📜</span>
                    <strong style={{ color: 'var(--primary)', fontSize: '14px' }}>Estrategia 1 — Artículo 70 del Estatuto Tributario (Ajuste Fiscal Anual Porcentual)</strong>
                  </div>
                  <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>
                    <strong>¿Qué es?</strong> Es el mecanismo ordinario mediante el cual el contribuyente puede incrementar anualmente el costo fiscal de sus activos fijos (inmuebles, acciones, maquinaria) en el porcentaje que fije anualmente el Gobierno Nacional mediante decreto (habitualmente basado en la meta de inflación o IPC).
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', background: 'var(--bg-secondary)', padding: '10px', borderRadius: '6px', fontSize: '12px' }}>
                    <div><strong>📌 ¿Cómo se usa?</strong> Al presentar la declaración de renta de cada año gravable, se multiplica el costo fiscal del año anterior por (1 + % de reajuste decretado) y se declara en el renglón de patrimonio.</div>
                    <div><strong>💡 Beneficio al vender:</strong> Al acumular reajustes por varios años, el costo fiscal se eleva paulatinamente. La ganancia ocasional (Precio de venta - Costo acumulado) se reduce drásticamente.</div>
                  </div>
                </div>
              )}
              {selectedStrategyExplainer === 'art73' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '16px' }}>📈</span>
                    <strong style={{ color: 'var(--primary)', fontSize: '14px' }}>Estrategia 2 — Artículo 73 del Estatuto Tributario (Multiplicador Histórico DANE/DIAN)</strong>
                  </div>
                  <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>
                    <strong>¿Qué es?</strong> Es el beneficio tributario más potente para personas naturales. No requiere haber realizado reajustes anuales previos en declaraciones anteriores.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', background: 'rgba(59, 130, 246, 0.08)', padding: '10px', borderRadius: '6px', fontSize: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <div><strong>📌 ¿Cómo se usa?</strong> Se ubica el año de compra del inmueble en la tabla oficial del DANE/DIAN (70 años: 1955-2025). Se toma el valor que costó en la escritura original y se multiplica por el factor de ese año (ej. <strong>2.86x para el año 2011</strong>; <strong>36.08x para 1955</strong>).</div>
                    <div><strong>💡 Fórmula oficial:</strong> <code>Costo Ajustado = Costo Adquisición × Factor DANE + Mejoras - Depreciaciones</code>. Se declara directamente en la Casilla 81 (Costos por Ganancias Ocasionales) del Formulario 210.</div>
                  </div>
                </div>
              )}
              {selectedStrategyExplainer === 'art311' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '16px' }}>🏦</span>
                    <strong style={{ color: 'var(--success)', fontSize: '14px' }}>Estrategia 3 — Artículos 311-1 y 126-4 del E.T. (Cuentas AFC y Destino a Nueva Vivienda)</strong>
                  </div>
                  <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>
                    <strong>¿Qué es?</strong> Exención directa de hasta <strong>5.000 UVT ({formatCOP(5000 * uvtValue)} en {taxYear})</strong> sobre la utilidad o ganancia ocasional obtenida en la venta de la casa o apartamento de habitación del contribuyente.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', background: 'rgba(16, 185, 129, 0.08)', padding: '10px', borderRadius: '6px', fontSize: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div><strong>📌 Requisitos legales (Art. 311-1 E.T.):</strong> (1) Que el bien enajenado sea la casa de habitación del declarante. (2) Que el dinero se deposite en una Cuenta de Ahorro para el Fomento de la Construcción (AFC) o se destine a comprar otra vivienda o pagar crédito hipotecario del inmueble vendido. (3) Que el valor de la vivienda vendida no supere 23.000 UVT ({formatCOP(23000 * uvtValue)}).</div>
                    <div><strong>💡 Efecto en el impuesto:</strong> Si la ganancia neta depurada tras el reajuste del Art. 73 es menor o igual a 5.000 UVT y se destina a AFC, la ganancia ocasional gravable final es <strong>$0 COP</strong> (100% de ahorro).</div>
                  </div>
                </div>
              )}
              {selectedStrategyExplainer === 'art44' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '16px' }}>🏛️</span>
                    <strong style={{ color: '#d97706', fontSize: '14px' }}>Estrategia 4 — Artículo 44 y Artículo 399 del E.T. (Inmuebles Adquiridos Antes de 1987)</strong>
                  </div>
                  <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>
                    <strong>¿Qué es?</strong> Régimen de transición legal para casas o apartamentos de habitación adquiridos antes del 1 de enero de 1987. Otorga una exención porcentual directa sobre la utilidad en la venta.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', background: 'rgba(245, 158, 11, 0.08)', padding: '10px', borderRadius: '6px', fontSize: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <div><strong>📌 Tabla oficial de exención (Art. 44 E.T.):</strong> 1986: 10% | 1985: 20% | 1984: 30% | 1983: 40% | 1982: 50% | 1981: 60% | 1980: 70% | 1979: 80% | 1978: 90% | <strong>Antes de 1978: 100% EXENTO</strong>.</div>
                    <div><strong>💡 Retención Notarial (Art. 399 E.T.):</strong> En la notaría, el Notario debe disminuir la retención en la fuente del 1% en la misma proporción de la exención que acredite el vendedor.</div>
                  </div>
                </div>
              )}
              {selectedStrategyExplainer === 'art72' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '16px' }}>📑</span>
                    <strong style={{ color: '#8b5cf6', fontSize: '14px' }}>Estrategia 5 — Artículos 72, 398 y 400 del E.T. (Avalúo Catastral y Retención Notarial)</strong>
                  </div>
                  <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>
                    <strong>¿Qué es?</strong> El Artículo 72 faculta al contribuyente a adoptar como costo fiscal el avalúo catastral o autoavalúo fijado en la declaración del Impuesto Predial Unificado del año anterior.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', background: 'rgba(139, 92, 246, 0.08)', padding: '10px', borderRadius: '6px', fontSize: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <div><strong>📌 Retención Notarial (Art. 398 E.T.):</strong> En el momento de la firma de la escritura de venta, el Notario practica una retención del 1% sobre el precio de venta. Este valor se imputa como anticipo en la <strong>Casilla 134</strong> del Formulario 210.</div>
                    <div><strong>💡 Vivienda de Interés Social (Art. 400 E.T.):</strong> Si la vivienda vendida califica como VIS o VIP, la retención en la notaría no se practica o está exenta según los topes legales.</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* NOTIFICACION / FEEDBACK VISUAL DE PRESETS */}
          {toastFeedback && (
            <div style={{ padding: '10px 16px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} />
              {toastFeedback}
            </div>
          )}

          {/* BOTONES DE PRESETS RAPIDOS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
              ⚡ Cargar Casos Didácticos Predefinidos:
            </span>
            <button
              onClick={loadPresetEjemplo1}
              className="btn"
              style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(59, 130, 246, 0.12)', color: 'var(--primary)', border: '1px solid rgba(59, 130, 246, 0.3)' }}
            >
              <PlayCircle size={14} /> Ejemplo 1: Venta Vivienda con Art. 73 y AFC ($450M / Compra 2011)
            </button>
            <button
              onClick={loadPresetPre1987}
              className="btn"
              style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.3)' }}
            >
              <Building size={14} /> Vivienda Pre-1987 (Art. 44 - 1983)
            </button>
            <button
              onClick={loadPresetViviendaAfc}
              className="btn"
              style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
            >
              <Home size={14} /> Vivienda con Cuenta AFC (Tope 5.000 UVT)
            </button>
            <button
              onClick={loadPresetFincaRural}
              className="btn"
              style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.3)' }}
            >
              <TreePine size={14} /> Finca Rural Agropecuaria (Art. 73)
            </button>
            <button
              onClick={() => { calcularInmuebleAfcNow(); triggerToast('✓ Simulación actualizada con éxito'); }}
              className="btn btn-primary"
              style={{ padding: '6px 14px', fontSize: '12px', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={14} /> Recalcular Simulación
            </button>
          </div>

          {/* SIMULADOR INTERACTIVO A 2 COLUMNAS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
            {/* COLUMNA 1: FORMULARIO DE PARAMETROS */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                <Calculator size={18} color="var(--primary)" />
                Parámetros de la Enajenación del Inmueble
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* PRECIO DE VENTA */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                    1. Precio de Venta Pactado en Escritura Pública ($ COP):
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>$</span>
                    <input
                      type="number"
                      className="text-input"
                      style={{ paddingLeft: '24px', width: '100%', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                      value={afcPrecioVenta}
                      onChange={(e) => setAfcPrecioVenta(e.target.value)}
                      placeholder="Ej. 450000000"
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                    {formatCOP(parseFloat(afcPrecioVenta) || 0)}
                  </span>
                </div>

                {/* COSTO HISTORICO */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                    2. Costo Histórico de Adquisición Original (Valor Escritura Compra):
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>$</span>
                    <input
                      type="number"
                      className="text-input"
                      style={{ paddingLeft: '24px', width: '100%', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                      value={afcCostoHistorico}
                      onChange={(e) => setAfcCostoHistorico(e.target.value)}
                      placeholder="Ej. 150000000"
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                    {formatCOP(parseFloat(afcCostoHistorico) || 0)}
                  </span>
                </div>

                {/* AÑO DE ADQUISICION Y TIPO DE INMUEBLE */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                      3. Año de Compra:
                    </label>
                    <select
                      className="select-input"
                      style={{ width: '100%' }}
                      value={afcAnoAdquisicion}
                      onChange={(e) => setAfcAnoAdquisicion(e.target.value)}
                    >
                      {(tablaArt73 && tablaArt73.length > 0
                        ? tablaArt73.map((r) => r.ano_adquisicion)
                        : ALL_HISTORIC_YEARS
                      ).map((yr) => (
                        <option key={yr} value={yr}>
                          {yr} {parseInt(yr) < 1987 ? '🏛️ Pre-1987 (Art. 44)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                      4. Tipo de Inmueble:
                    </label>
                    <select
                      className="select-input"
                      style={{ width: '100%' }}
                      value={afcTipoInmueble}
                      onChange={(e) => setAfcTipoInmueble(e.target.value)}
                    >
                      <option value="bienes_raices_urbanos">🏢 Urbano (Casa/Apto)</option>
                      <option value="bienes_raices_rurales">🌳 Rural General</option>
                      <option value="bienes_raices_rurales_agro">🌾 Rural Agropecuario</option>
                    </select>
                  </div>
                </div>

                {/* METODO DE DETERMINACION DE COSTO FISCAL */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                    5. Método de Determinación del Costo Fiscal:
                  </label>
                  <select
                    className="select-input"
                    style={{ width: '100%' }}
                    value={afcMetodoCosto}
                    onChange={(e) => setAfcMetodoCosto(e.target.value)}
                  >
                    <option value="art73">⭐ Ajuste Art. 73 E.T. (Multiplicador Oficial DANE / DIAN)</option>
                    <option value="art72">📑 Autoavalúo Catastral Predial Año Anterior (Art. 72 E.T.)</option>
                    <option value="art70">📜 Reajuste Fiscal Anual Acumulado (Art. 70 E.T.)</option>
                    <option value="historico">💵 Costo Histórico Simple (Sin Reajuste)</option>
                  </select>
                </div>

                {(afcMetodoCosto === 'art72' || afcMetodoCosto === 'art70') && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                      Valor del Autoavalúo o Costo Ajustado Acumulado ($ COP):
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>$</span>
                      <input
                        type="number"
                        className="text-input"
                        style={{ paddingLeft: '24px', width: '100%', fontFamily: 'var(--font-mono)' }}
                        value={afcCostoPersonalizado}
                        onChange={(e) => setAfcCostoPersonalizado(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* MEJORAS Y DEPRECIACIONES */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                      + Mejoras y Valorizaciones ($):
                    </label>
                    <input
                      type="number"
                      className="text-input"
                      style={{ width: '100%', fontSize: '12px' }}
                      value={afcMejoras}
                      onChange={(e) => setAfcMejoras(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                      - Depreciación Deducida ($):
                    </label>
                    <input
                      type="number"
                      className="text-input"
                      style={{ width: '100%', fontSize: '12px' }}
                      value={afcDepreciacion}
                      onChange={(e) => setAfcDepreciacion(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* MONTO DEPOSITADO EN AFC O DESTINADO A VIVIENDA */}
                <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--success)', marginBottom: '6px', display: 'block' }}>
                    🏦 Monto Depositado en Cuenta AFC o Destinado a Compra de Vivienda ($ COP):
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>$</span>
                    <input
                      type="number"
                      className="text-input"
                      style={{ paddingLeft: '24px', width: '100%', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                      value={afcMontoAfc}
                      onChange={(e) => setAfcMontoAfc(e.target.value)}
                      placeholder="Ej. 21000000"
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Tope legal exento: 5.000 UVT = <strong>{formatCOP(5000 * uvtValue)}</strong> (Art. 311-1 E.T.)
                  </span>
                </div>

                {/* CHECKBOXES DE CONDICIONES LEGALES */}
                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={afcEsVivienda}
                      onChange={(e) => setAfcEsVivienda(e.target.checked)}
                    />
                    <span>El inmueble enajenado es la <strong>casa o apartamento de habitación</strong> del contribuyente.</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={afcPosesion2Anos}
                      onChange={(e) => setAfcPosesion2Anos(e.target.checked)}
                    />
                    <span>Poseído por <strong>dos (2) años o más</strong> (tributa a tarifa del 15% como Ganancia Ocasional).</span>
                  </label>
                </div>
              </div>
            </div>

            {/* COLUMNA 2: RESULTADOS DE LIQUIDACION & AHORRO TRIBUTARIO */}
            {simulacionInmuebleAfc && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* TARJETA DE AHORRO Y METRICAS */}
                <div
                  className="card"
                  style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
                    border: '2px solid var(--success)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--success)' }}>
                      🎉 Liquidación & Ahorro Tributario
                    </span>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 800,
                        backgroundColor: 'var(--success)',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: '20px',
                      }}
                    >
                      Ahorro: {simulacionInmuebleAfc.porcentaje_ahorro_tributario_pct.toFixed(1)}%
                    </span>
                  </div>

                  {/* GRID PRINCIPAL DE CIFRAS */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ padding: '12px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Impuesto Sin Planeación:</span>
                      <strong style={{ fontSize: '16px', color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>
                        {formatCOP(simulacionInmuebleAfc.impuesto_go_sin_planeacion_cop)}
                      </strong>
                    </div>

                    <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 700, display: 'block' }}>
                        Impuesto Final con Beneficios:
                      </span>
                      <strong style={{ fontSize: '18px', color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                        {formatCOP(simulacionInmuebleAfc.impuesto_go_con_beneficios_cop)}
                      </strong>
                    </div>
                  </div>

                  {/* BANNER DE AHORRO NETO */}
                  <div style={{ padding: '12px 16px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ahorro Neto en Ganancia Ocasional:</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                        +{formatCOP(simulacionInmuebleAfc.ahorro_total_impuesto_cop)}
                      </div>
                    </div>
                    <Award size={28} color="var(--success)" />
                  </div>

                  {/* DESGLOSE DE BASES */}
                  <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '8px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Costo Fiscal Determinado:</span>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatCOP(simulacionInmuebleAfc.costo_fiscal_determinado_cop)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Ganancia Ocasional Bruta:</span>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatCOP(simulacionInmuebleAfc.ganancia_ocasional_bruta_cop)}</strong>
                    </div>
                    {simulacionInmuebleAfc.aplica_art44_pre1987 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d97706' }}>
                        <span>Exención Art. 44 ({simulacionInmuebleAfc.porcentaje_exencion_art44_pct}%):</span>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>-{formatCOP(simulacionInmuebleAfc.ganancia_exenta_art44_cop)}</strong>
                      </div>
                    )}
                    {simulacionInmuebleAfc.ganancia_exenta_afc_art311_1_cop > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                        <span>Exención Cuenta AFC (Art. 311-1):</span>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>-{formatCOP(simulacionInmuebleAfc.ganancia_exenta_afc_art311_1_cop)}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '6px', fontWeight: 700 }}>
                      <span>Ganancia Gravable Final (15%):</span>
                      <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{formatCOP(simulacionInmuebleAfc.ganancia_ocasional_gravada_final_cop)}</span>
                    </div>
                  </div>

                  {/* RETENCION EN LA FUENTE NOTARIAL */}
                  <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.25)', fontSize: '11.5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Retención Notaría (1% Art. 398/399):</span>
                      <strong style={{ display: 'block', color: 'var(--primary)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                        {formatCOP(simulacionInmuebleAfc.retefuente_notarial_final_cop)}
                      </strong>
                    </div>
                    {simulacionInmuebleAfc.ahorro_retefuente_notarial_cop > 0 && (
                      <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
                        Ahorro Notarial: {formatCOP(simulacionInmuebleAfc.ahorro_retefuente_notarial_cop)}
                      </span>
                    )}
                  </div>
                </div>

                {/* GUIA FORMULARIO 210 DIAN */}
                <div className="card" style={{ padding: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileCheck size={16} color="var(--primary)" />
                    Casillas Exactas Formulario 210 DIAN
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', fontSize: '11.5px' }}>
                    <div style={{ padding: '8px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Casilla 80 (Ingresos):</span>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatCOP(simulacionInmuebleAfc.precio_venta_cop)}</strong>
                    </div>
                    <div style={{ padding: '8px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Casilla 81 (Costos):</span>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatCOP(simulacionInmuebleAfc.costo_fiscal_determinado_cop)}</strong>
                    </div>
                    <div style={{ padding: '8px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Casilla 82 (Exentas):</span>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>{formatCOP(simulacionInmuebleAfc.ganancia_ocasional_exenta_total_cop)}</strong>
                    </div>
                    <div style={{ padding: '8px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Casilla 83 (Gravables):</span>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{formatCOP(simulacionInmuebleAfc.ganancia_ocasional_gravada_final_cop)}</strong>
                    </div>
                    <div style={{ padding: '8px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Casilla 87 (Impuesto):</span>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>{formatCOP(simulacionInmuebleAfc.impuesto_go_con_beneficios_cop)}</strong>
                    </div>
                    <div style={{ padding: '8px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Casilla 134 (Retención):</span>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatCOP(simulacionInmuebleAfc.retefuente_notarial_final_cop)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MATRIZ COMPARATIVA DE LOS 5 ESCENARIOS */}
          {simulacionInmuebleAfc && (
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                <Layers size={18} color="var(--primary)" />
                Matriz Comparativa Multi-Estrategia (Impacto y Ahorro Lado a Lado)
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table className="breakdown-table" style={{ width: '100%', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', textAlign: 'left' }}>
                      <th style={{ padding: '10px' }}>Escenario</th>
                      <th style={{ padding: '10px' }}>Costo Fiscal</th>
                      <th style={{ padding: '10px' }}>Ganancia Bruta</th>
                      <th style={{ padding: '10px' }}>Exención Art. 44</th>
                      <th style={{ padding: '10px' }}>Exención AFC</th>
                      <th style={{ padding: '10px' }}>Base Gravable</th>
                      <th style={{ padding: '10px' }}>Impuesto (15%)</th>
                      <th style={{ padding: '10px' }}>Retención Notaría</th>
                      <th style={{ padding: '10px', color: 'var(--success)' }}>Ahorro Neto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulacionInmuebleAfc.escenarios.map((esc, idx) => {
                      const isOptimo = idx === 4;
                      return (
                        <tr
                          key={esc.nombre}
                          style={{
                            background: isOptimo ? 'rgba(16, 185, 129, 0.08)' : idx % 2 === 0 ? 'var(--bg-main)' : 'var(--bg-secondary)',
                            fontWeight: isOptimo ? 700 : 400,
                            borderLeft: isOptimo ? '4px solid var(--success)' : 'none',
                          }}
                        >
                          <td style={{ padding: '10px' }}>
                            <div style={{ fontWeight: 700, color: isOptimo ? 'var(--success)' : 'var(--text-main)' }}>{esc.nombre}</div>
                            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{esc.descripcion}</div>
                          </td>
                          <td style={{ padding: '10px', fontFamily: 'var(--font-mono)' }}>{formatCOP(esc.costo_fiscal_aplicado_cop)}</td>
                          <td style={{ padding: '10px', fontFamily: 'var(--font-mono)' }}>{formatCOP(esc.ganancia_ocasional_bruta_cop)}</td>
                          <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: esc.exencion_art44_cop > 0 ? '#d97706' : 'var(--text-muted)' }}>
                            {formatCOP(esc.exencion_art44_cop)}
                          </td>
                          <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: esc.exencion_afc_cop > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                            {formatCOP(esc.exencion_afc_cop)}
                          </td>
                          <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{formatCOP(esc.ganancia_ocasional_gravable_cop)}</td>
                          <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: isOptimo ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                            {formatCOP(esc.impuesto_ganancia_ocasional_cop)}
                          </td>
                          <td style={{ padding: '10px', fontFamily: 'var(--font-mono)' }}>{formatCOP(esc.retefuente_notarial_cop)}</td>
                          <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: 'var(--success)', fontWeight: 800 }}>
                            {esc.ahorro_frente_a_sin_planeacion_cop > 0 ? `+${formatCOP(esc.ahorro_frente_a_sin_planeacion_cop)}` : '$0 COP'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PASOS DE CALCULO Y REQUISITOS */}
          {simulacionInmuebleAfc && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              <div className="card" style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bookmark size={15} color="var(--primary)" />
                  Memoria de Cálculo Paso a Paso
                </h4>
                <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {simulacionInmuebleAfc.explicacion_paso_a_paso.map((p, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="card" style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={15} color="var(--warning)" />
                  Requisitos Legales & Advertencias DIAN
                </h4>
                <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {simulacionInmuebleAfc.requisitos_estatuto.map((req, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>✅ {req}</li>
                  ))}
                  {simulacionInmuebleAfc.advertencias_legales.map((adv, i) => (
                    <li key={i} style={{ marginBottom: '4px', color: 'var(--danger)' }}>⚠️ {adv}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- SUBTAB 1: REAJUSTE DE ACTIVOS (ART. 73 E.T.) --- */}
      {activeSubTab === 'art73' && (
        <div className="space-y-6">
          {/* BANNER DIDACTICO EXPLICATIVO */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
            }}
          >
            <Info color="var(--primary)" size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary)', marginBottom: '4px' }}>
                ¿Cómo funciona el Reajuste Fiscal del Artículo 73 del Estatuto Tributario?
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Al vender un bien inmueble o acciones poseídas como activo fijo, la ganancia gravable se calcula como{' '}
                <strong>Precio de Venta − Costo Fiscal</strong>. El Artículo 73 permite a las personas naturales multiplicar el
                costo histórico de compra por los factores oficiales de inflación y avalúo certificados por el DANE/DIAN. Al
                elevar legalmente el costo fiscal, la utilidad gravable disminuye drásticamente,{' '}
                <strong>reduciendo de forma masiva el impuesto a pagar (tarifa del 15% en ganancia ocasional)</strong>.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {/* PANEL DE CONFIGURACION / SIMULADOR */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calculator size={18} color="var(--primary)" />
                Simulador Interactivo de Reajuste
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* TIPO DE ACTIVO */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                    1. Tipo de Activo Fijo:
                  </label>
                  <select
                    className="select-input"
                    style={{ width: '100%' }}
                    value={selectedTipoActivo}
                    onChange={(e) => setSelectedTipoActivo(e.target.value)}
                  >
                    <option value="bienes_raices_urbanos">🏢 Bienes Raíces Urbanos (Casas, Aptos, Locales)</option>
                    <option value="bienes_raices_rurales">🌳 Bienes Raíces Rurales Generales</option>
                    <option value="bienes_raices_rurales_agro">🌾 Bienes Raíces Rurales (Actividad Agropecuaria)</option>
                    <option value="acciones_aportes">📈 Acciones o Aportes en Sociedades</option>
                  </select>
                </div>

                {/* AÑO DE ADQUISICION */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                    2. Año de Adquisición o Compra:
                  </label>
                  <select
                    className="select-input"
                    style={{ width: '100%' }}
                    value={selectedAnoAdquisicion}
                    onChange={(e) => setSelectedAnoAdquisicion(e.target.value)}
                  >
                    {tablaArt73.map((row) => (
                      <option key={row.ano_adquisicion} value={row.ano_adquisicion}>
                        Año {row.ano_adquisicion}
                      </option>
                    ))}
                  </select>
                </div>

                {/* COSTO HISTORICO */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                    3. Costo Histórico de Adquisición (Escritura/Soporte):
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>$</span>
                    <input
                      type="number"
                      className="text-input"
                      style={{ paddingLeft: '24px', width: '100%', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                      value={costoHistoricoInput}
                      onChange={(e) => setCostoHistoricoInput(e.target.value)}
                      placeholder="Ej. 20000000"
                    />
                  </div>
                </div>

                {/* PRECIO DE VENTA */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                    4. Precio de Venta Estimado o Real (Opcional):
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>$</span>
                    <input
                      type="number"
                      className="text-input"
                      style={{ paddingLeft: '24px', width: '100%', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                      value={precioVentaInput}
                      onChange={(e) => setPrecioVentaInput(e.target.value)}
                      placeholder="Ej. 500000000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD DE RESULTADOS DE SIMULACION */}
            {simulacionArt73 && (
              <div
                className="card"
                style={{
                  padding: '20px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Resultado del Reajuste Fiscal
                    </span>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 800,
                        backgroundColor: 'var(--primary)',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '20px',
                      }}
                    >
                      Factor: {simulacionArt73.factor_multiplicador.toLocaleString('es-CO', { minimumFractionDigits: 2 })}x
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ padding: '10px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Costo Histórico:</span>
                      <strong style={{ fontSize: '15px', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                        {formatCOP(simulacionArt73.costo_adquisicion_historico_cop)}
                      </strong>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600, display: 'block' }}>
                        Costo Fiscal Art. 73:
                      </span>
                      <strong style={{ fontSize: '15px', color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                        {formatCOP(simulacionArt73.costo_fiscal_ajustado_art73_cop)}
                      </strong>
                    </div>
                  </div>

                  {simulacionArt73.precio_venta_cop && (
                    <div style={{ padding: '14px', background: 'var(--bg-main)', borderRadius: '10px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Ganancia gravable SIN ajuste:</span>
                        <span style={{ color: 'var(--danger)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                          {formatCOP(simulacionArt73.ganancia_sin_ajuste_cop)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Ganancia gravable CON ajuste Art. 73:</span>
                        <span style={{ color: 'var(--success)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                          {formatCOP(simulacionArt73.ganancia_con_ajuste_cop)}
                        </span>
                      </div>

                      <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                          💰 Ahorro Estimado en Impuestos:
                        </span>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                          {formatCOP(simulacionArt73.ahorro_impuesto_estimado_cop)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', background: 'rgba(0,0,0,0.03)', padding: '10px', borderRadius: '6px' }}>
                  <strong>Régimen:</strong>{' '}
                  {simulacionArt73.es_ganancia_ocasional
                    ? 'Ganancia Ocasional a tarifa fija del 15% (Posesión ≥ 2 años).'
                    : 'Renta Ordinaria (Posesión menor a 2 años).'}{' '}
                  {simulacionArt73.fundamento_legal}
                </div>
              </div>
            )}
          </div>

          {/* PASOS DE CALCULO AUDITABLES */}
          {simulacionArt73 && (
            <div className="card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--success)" />
                Desglose Paso a Paso del Cálculo Legal
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {simulacionArt73.pasos_calculo.map((paso, idx) => (
                  <div
                    key={idx}
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-main)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-secondary)',
                      borderLeft: '3px solid var(--primary)',
                    }}
                  >
                    {paso}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TABLA COMPLETA OFICIAL DEL ARTICULO 73 (1955-2024) */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
                  Tabla Oficial Completa de Factores de Ajuste (DUR 1.2.1.17.21 / DANE)
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Factores multiplicadores vigentes para el año gravable 2024 / 2025 (Certificación DANE e IPC clase media)
                </p>
              </div>

              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar año (ej. 1995)..."
                  className="text-input"
                  style={{ paddingLeft: '32px', width: '100%', fontSize: '12px' }}
                  value={searchTableYear}
                  onChange={(e) => setSearchTableYear(e.target.value)}
                />
              </div>
            </div>

            <div style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)', zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: '10px 14px' }}>Año Adquisición</th>
                    <th style={{ padding: '10px 14px' }}>Acciones o Aportes</th>
                    <th style={{ padding: '10px 14px' }}>Bienes Raíces Urbanos</th>
                    <th style={{ padding: '10px 14px' }}>Rurales Agropecuarios</th>
                    <th style={{ padding: '10px 14px' }}>Rurales Generales</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTabla.map((row) => {
                    const isSelected = row.ano_adquisicion === selectedAnoAdquisicion;
                    return (
                      <tr
                        key={row.ano_adquisicion}
                        style={{
                          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                          borderBottom: '1px solid var(--border-color)',
                          cursor: 'pointer',
                        }}
                        onClick={() => setSelectedAnoAdquisicion(row.ano_adquisicion)}
                        title="Haz clic para seleccionar este año en el simulador"
                      >
                        <td style={{ padding: '8px 14px', fontWeight: isSelected ? 800 : 500 }}>
                          {row.ano_adquisicion} {isSelected && <span style={{ color: 'var(--primary)', fontSize: '11px' }}>● Seleccionado</span>}
                        </td>
                        <td style={{ padding: '8px 14px', fontFamily: 'var(--font-mono)' }}>
                          {row.acciones_aportes.toLocaleString('es-CO', { minimumFractionDigits: 2 })}x
                        </td>
                        <td style={{ padding: '8px 14px', fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 600 }}>
                          {row.bienes_raices_urbanos.toLocaleString('es-CO', { minimumFractionDigits: 2 })}x
                        </td>
                        <td style={{ padding: '8px 14px', fontFamily: 'var(--font-mono)' }}>
                          {row.bienes_raices_rurales_agro.toLocaleString('es-CO', { minimumFractionDigits: 2 })}x
                        </td>
                        <td style={{ padding: '8px 14px', fontFamily: 'var(--font-mono)' }}>
                          {row.bienes_raices_rurales.toLocaleString('es-CO', { minimumFractionDigits: 2 })}x
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 2: BENEFICIO DE AUDITORIA (ART. 689-3) --- */}
      {activeSubTab === 'auditoria' && (
        <div className="space-y-6">
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              gap: '14px',
            }}
          >
            <ShieldCheck color="var(--success)" size={26} style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--success)', marginBottom: '4px' }}>
                Firmeza Acelerada en 6 o 12 Meses (Art. 689-3 E.T.)
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                La DIAN concede firmeza definitiva (la declaración no puede ser auditada ni modificada) en solo 6 meses si se
                incrementa el impuesto neto al menos en un 35%, o en 12 meses si se incrementa en un 25%, respecto al impuesto
                del año anterior (siempre que este último sea mayor o igual a 71 UVT).
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Simular Incremento Requerido</h3>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Impuesto Neto de Renta del Año Anterior (Casilla 112 F210):
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ position: 'absolute', left: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>$</span>
                <input
                  type="number"
                  className="text-input"
                  style={{ paddingLeft: '24px', width: '100%', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                  value={impuestoAnoAntInput}
                  onChange={(e) => setImpuestoAnoAntInput(e.target.value)}
                />
              </div>

              {auditoriaResult && (
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: auditoriaResult.cumple_impuesto_minimo ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${auditoriaResult.cumple_impuesto_minimo ? 'var(--success)' : 'var(--danger)'}`,
                    fontSize: '12px',
                  }}
                >
                  <strong>Mínimo Legal (71 UVT):</strong> {formatCOP(auditoriaResult.impuesto_minimo_requerido_cop)}
                  <div style={{ marginTop: '4px', fontWeight: 600 }}>
                    {auditoriaResult.cumple_impuesto_minimo
                      ? '✅ Cumple el umbral mínimo para acogerse al beneficio.'
                      : '❌ No alcanza el umbral de 71 UVT requerido por ley.'}
                  </div>
                </div>
              )}
            </div>

            {auditoriaResult && auditoriaResult.cumple_impuesto_minimo && (
              <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Objetivo Firmeza en 6 MESES (+35%):</span>
                  <strong style={{ fontSize: '18px', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                    {formatCOP(auditoriaResult.impuesto_objetivo_6_meses_cop)}
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                    Incremento requerido: +{formatCOP(auditoriaResult.incremento_requerido_6_meses_cop)}
                  </span>
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '4px solid var(--success)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Objetivo Firmeza en 12 MESES (+25%):</span>
                  <strong style={{ fontSize: '18px', color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                    {formatCOP(auditoriaResult.impuesto_objetivo_12_meses_cop)}
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                    Incremento requerido: +{formatCOP(auditoriaResult.incremento_requerido_12_meses_cop)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- SUBTAB 3: REDUCCION DE SANCIONES (ART. 640/644) --- */}
      {activeSubTab === 'sanciones' && (
        <div className="space-y-6">
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Percent size={18} color="var(--primary)" />
              Simulador de Reducción de Sanciones (Principio de Favorabilidad / Gradualidad)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Monto de la Sanción Plena Calculada (COP):
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ position: 'absolute', left: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>$</span>
                  <input
                    type="number"
                    className="text-input"
                    style={{ paddingLeft: '24px', width: '100%', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                    value={sancionBaseInput}
                    onChange={(e) => setSancionBaseInput(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={sinSanciones2Anos}
                      onChange={(e) => setSinSanciones2Anos(e.target.checked)}
                    />
                    <span>¿Sin sanciones por la DIAN en los últimos 2 años? (Rebaja al 50%)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={sinSanciones1Ano}
                      onChange={(e) => setSinSanciones1Ano(e.target.checked)}
                    />
                    <span>¿Sin sanciones en el último año? (Rebaja al 75%)</span>
                  </label>
                </div>
              </div>

              {sancionResult && (
                <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sanción Plena: {formatCOP(sancionResult.monto_sancion_plena_cop)}</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--danger)', margin: '6px 0', fontFamily: 'var(--font-mono)' }}>
                    Sanción Reducida: {formatCOP(sancionResult.sancion_final_reducida_cop)}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--success)', marginBottom: '8px' }}>
                    🎉 Ahorro por Gradualidad: {formatCOP(sancionResult.ahorro_sancion_cop)} ({sancionResult.porcentaje_reduccion_aplicado}% de descuento)
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{sancionResult.explicacion}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 4: CATALOGO COMPLETO --- */}
      {activeSubTab === 'catalogo' && (
        <div className="space-y-6">
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['todos', 'ajustes_patrimonio', 'incrngo', 'deducciones', 'rentas_exentas', 'auditoria_sanciones'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFiltroCategoria(cat)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid var(--border-color)',
                    backgroundColor: filtroCategoria === cat ? 'var(--primary)' : 'var(--bg-secondary)',
                    color: filtroCategoria === cat ? '#fff' : 'var(--text-main)',
                  }}
                >
                  {cat === 'todos'
                    ? 'Todos'
                    : cat === 'ajustes_patrimonio'
                    ? 'Ajustes de Activos'
                    : cat === 'incrngo'
                    ? 'INCRNGO'
                    : cat === 'deducciones'
                    ? 'Deducciones'
                    : cat === 'rentas_exentas'
                    ? 'Rentas Exentas'
                    : 'Auditoría y Sanciones'}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Buscar beneficio o artículo..."
                className="text-input"
                style={{ paddingLeft: '32px', width: '100%', fontSize: '12px' }}
                value={busquedaCatalogo}
                onChange={(e) => setBusquedaCatalogo(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredCatalogo.map((item) => (
              <div key={item.id} className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{item.nombre}</h4>
                    <span style={{ fontSize: '11px', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, flexShrink: 0 }}>
                      {item.articulo_et}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '10px' }}>{item.descripcion}</p>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '12px' }}>
                  <div style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '4px' }}>
                    🎯 Tope: {item.tope_legal_texto}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                    💡 <em>Ejemplo: {item.ejemplo_calculo}</em>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
