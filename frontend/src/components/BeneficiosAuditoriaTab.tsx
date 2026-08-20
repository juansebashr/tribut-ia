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
  TreePine,
  Briefcase,
  HelpCircle,
  Calculator,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  AjusteArticulo73Item,
  SimulacionAjusteArticulo73Response,
  BeneficioItem,
  BeneficioAuditoriaResponse,
  ReduccionSancionResponse,
} from '../types/tax';
import {
  fetchTablaArticulo73,
  simularArticulo73,
  fetchBeneficiosCatalog,
  simularAuditoria,
  simularSancion,
} from '../services/api';

interface BeneficiosAuditoriaTabProps {
  taxYear: number;
  uvtValue: number;
}

export const BeneficiosAuditoriaTab: React.FC<BeneficiosAuditoriaTabProps> = ({
  taxYear,
  uvtValue,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'art73' | 'auditoria' | 'sanciones' | 'catalogo'>('art73');

  // --- Estado Art. 73 ---
  const [tablaArt73, setTablaArt73] = useState<AjusteArticulo73Item[]>([]);
  const [selectedTipoActivo, setSelectedTipoActivo] = useState<string>('bienes_raices_urbanos');
  const [selectedAnoAdquisicion, setSelectedAnoAdquisicion] = useState<string>('1995');
  const [costoHistoricoInput, setCostoHistoricoInput] = useState<string>('20000000');
  const [precioVentaInput, setPrecioVentaInput] = useState<string>('500000000');
  const [simulacionArt73, setSimulacionArt73] = useState<SimulacionAjusteArticulo73Response | null>(null);
  const [searchTableYear, setSearchTableYear] = useState<string>('');
  const [loadingArt73, setLoadingArt73] = useState<boolean>(false);

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

  // Recalcular Art. 73 en vivo
  useEffect(() => {
    const costo = parseFloat(costoHistoricoInput);
    const venta = parseFloat(precioVentaInput);
    if (!costo || costo <= 0) return;

    const timer = setTimeout(async () => {
      setLoadingArt73(true);
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
      } finally {
        setLoadingArt73(false);
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
