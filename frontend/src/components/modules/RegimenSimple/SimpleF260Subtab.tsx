import React from 'react';
import type { RegimenSimpleOutput } from '../../../types/tax';
import { useApp } from '../../../context/AppContext';
import { formatCOP } from '../../../utils/formatters';

interface SimpleF260SubtabProps {
  result: RegimenSimpleOutput | null;
  onNavigateToCalc: () => void;
}

export const SimpleF260Subtab: React.FC<SimpleF260SubtabProps> = ({ result, onNavigateToCalc }) => {
  const { showCasillaPopover, taxYear } = useApp();

  const handleCasillaClick = (num: number | string, e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    showCasillaPopover(num, e.currentTarget, '260');
  };

  const getCasillaValue = (num: number, defaultVal: number | string = 0): string => {
    if (!result || !result.form_260_casillas) {
      return typeof defaultVal === 'number' ? formatCOP(defaultVal, false) : String(defaultVal);
    }
    const c = result.form_260_casillas;

    const mapping: Record<number, number | string> = {
      1: c.ano || taxYear || 2026,
      4: c.numero_formulario || '260202699999',
      5: c.nit || '900123456',
      6: c.dv || '1',
      11: c.razon_social || 'CONTRIBUYENTE REGIMEN SIMPLE S.A.S.',
      24: c.actividad_economica || '4711',
      28: c.c28_patrimonio_bruto,
      29: c.c29_pasivos,
      30: c.c30_patrimonio_liquido,
      31: c.c31_ingresos_grupo1_pais,
      32: c.c32_ingresos_grupo1_exterior,
      33: c.c33_ingresos_grupo2_pais,
      34: c.c34_ingresos_grupo2_exterior,
      35: c.c35_ingresos_grupo3_pais,
      36: c.c36_ingresos_grupo3_exterior,
      37: c.c37_ingresos_grupo4_pais,
      38: c.c38_ingresos_grupo4_exterior,
      39: c.c39_ingresos_grupo5_pais,
      40: c.c40_ingresos_grupo5_exterior,
      41: c.c41_ingresos_grupo6_pais,
      42: c.c42_ingresos_grupo6_exterior,
      43: c.c43_total_ingresos_brutos_sin_go,
      44: c.c44_ingresos_no_constitutivos_renta,
      45: c.c45_total_ingresos_gravables,
      46: c.c46_impuesto_simple,
      47: c.c47_componente_ica_territorial,
      48: c.c48_valor_componente_simple_nacional,
      49: c.c49_descuento_aportes_pension_empleador,
      50: c.c50_descuento_ventas_medios_electronicos,
      51: c.c51_descuento_gmf,
      52: c.c52_total_descuentos,
      53: c.c53_impuesto_neto_simple,
      54: c.c54_retenciones_antes_pertenecer_simple,
      55: c.c55_anticipo_renta_ano_anterior,
      56: c.c56_anticipos_simple_efectivamente_pagados,
      57: c.c57_saldo_favor_simple_ano_anterior,
      58: c.c58_saldo_a_pagar_impuesto_simple,
      59: c.c59_sancion_extemporaneidad_simple,
      60: c.c60_sancion_correccion_simple,
      61: c.c61_otras_sanciones_simple,
      62: c.c62_total_sanciones_simple,
      63: c.c63_total_saldo_a_pagar_simple,
      64: c.c64_total_saldo_a_favor_simple,
      65: c.c65_sancion_extemporaneidad_ica,
      66: c.c66_sancion_correccion_ica,
      67: c.c67_otras_sanciones_ica,
      68: c.c68_total_sanciones_ica,
      69: c.c69_ingresos_gravados_inc,
      70: c.c70_impuesto_nacional_consumo,
      71: c.c71_inc_efectivamente_pagado_anticipos,
      72: c.c72_saldo_favor_inc_ano_anterior,
      73: c.c73_saldo_a_pagar_inc,
      74: c.c74_sancion_extemporaneidad_inc,
      75: c.c75_sancion_correccion_inc,
      76: c.c76_otras_sanciones_inc,
      77: c.c77_total_sanciones_inc,
      78: c.c78_total_saldo_a_pagar_inc,
      79: c.c79_total_saldo_a_favor_inc,
      80: c.c80_ingresos_ganancias_ocasionales,
      81: c.c81_costos_ganancias_ocasionales,
      82: c.c82_ganancias_ocasionales_exentas,
      83: c.c83_ganancias_ocasionales_gravables,
      84: c.c84_impuesto_ganancias_ocasionales,
      85: c.c85_descuento_impuestos_exterior_go,
      86: c.c86_impuesto_neto_ganancias_ocasionales,
      87: c.c87_saldo_favor_go_ano_anterior,
      88: c.c88_retenciones_ganancias_ocasionales,
      89: c.c89_saldo_a_pagar_go,
      90: c.c90_sancion_extemporaneidad_go,
      91: c.c91_sancion_correccion_go,
      92: c.c92_otras_sanciones_go,
      93: c.c93_total_sanciones_go,
      94: c.c94_total_saldo_a_pagar_go,
      980: c.c980_pago_total,
      981: c.c981_cod_representacion || '18',
      982: c.c982_cod_contador_o_revisor || '1',
      983: c.c983_tarjeta_profesional || '654321-T',
    };

    const val = mapping[num];
    if (val === undefined) return '0';
    return typeof val === 'number' ? formatCOP(val, false) : String(val);
  };

  const yearDigits = String(taxYear || 2026).split('');
  const nitDigits = (result?.form_260_casillas?.nit || '900123456').replace(/\D/g, '').padEnd(10, ' ').split('').slice(0, 10);

  const renderCasillaCell = (
    num: number,
    label: string,
    isSubtotal: boolean = false,
    isTotalPay: boolean = false
  ) => {
    return (
      <tr key={num}>
        <td style={{ padding: '3px 6px', fontSize: '9.5px', color: isSubtotal ? '#0d5c3a' : '#1e293b', fontWeight: isSubtotal ? 800 : 500 }}>
          {label}
        </td>
        <td
          className="f260-casilla-num casilla-badge-btn"
          data-casilla={String(num)}
          onClick={(e) => handleCasillaClick(num, e)}
          title={`Casilla ${num}: clic para consultar instructivo legal`}
        >
          <span className="f260-info-badge">i</span>
          {num}
        </td>
        <td
          className={`f260-casilla-val ${isTotalPay ? 'total-to-pay' : isSubtotal ? 'calc-highlight' : ''}`}
          id={`f260_val_c${num}`}
        >
          ${getCasillaValue(num)}
        </td>
      </tr>
    );
  };

  return (
    <div id="pane-simple-f260" className="module-pane active">
      {/* BARRA DE ACCIÓN Y HERRAMIENTAS */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0d5c3a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📋</span> Formulario 260 Oficial DIAN (Facsímil Idéntico)
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
            💡 <em>Copia exacta de la Declaración Anual Consolidada del SIMPLE. Haz clic en el ícono <strong>[ i ]</strong> de cualquier casilla para consultar el instructivo normativo.</em>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
            🖨️ Imprimir Formulario 260
          </button>
          <button className="btn btn-primary btn-sm" onClick={onNavigateToCalc}>
            ✏️ Modificar Parámetros
          </button>
        </div>
      </div>

      {/* FACSIMILE OFICIAL FORMULARIO 260 */}
      <div className="table-scroll-hint">
        <span>👉</span> Desliza horizontalmente para ver el Formulario 260 completo ➔
      </div>
      <div className="table-responsive">
        <div className="f260-sheet-wrapper">
          <div className="f260-watermark">DIAN 260</div>

          <table className="f260-table">
            <tbody>
              {/* ENCABEZADO OFICIAL DIAN */}
              <tr>
                <td className="f260-header-cell-logo">
                  <div className="f260-dian-logo-svg">
                    <span style={{ letterSpacing: '-2px', fontWeight: 900, fontSize: '26px' }}>DIAN</span>
                  </div>
                  <div style={{ fontSize: '7px', textTransform: 'uppercase', fontWeight: 700, color: '#0d5c3a', marginTop: '2px' }}>
                    República de Colombia
                  </div>
                </td>
                <td className="f260-header-title">
                  Declaración Anual Consolidada
                  <br />
                  Régimen Simple de Tributación (SIMPLE)
                </td>
                <td className="f260-header-privada">PRIVADA</td>
                <td className="f260-header-form-num">260</td>
              </tr>

              {/* METADATOS: AÑO Y NÚMERO DE FORMULARIO */}
              <tr>
                <td colSpan={2} style={{ padding: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '9.5px' }}>1. Año</span>
                    <div className="f210-digit-grid" id="f260-year-digits">
                      {yearDigits.map((d, idx) => (
                        <div key={idx} className="f210-digit-box">
                          {d}
                        </div>
                      ))}
                    </div>
                    <span style={{ fontSize: '8.5px', color: 'var(--text-muted)', marginLeft: '12px' }}>
                      Espacio reservado para la Dirección de Impuestos y Aduanas Nacionales
                    </span>
                  </div>
                </td>
                <td colSpan={2} style={{ textAlign: 'right', paddingRight: '8px', padding: '4px' }}>
                  <div style={{ fontSize: '8px', fontWeight: 700 }}>4. Número de formulario:</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 800, color: '#0d5c3a' }}>
                    {getCasillaValue(4, '260202699999')}
                  </div>
                </td>
              </tr>

              {/* DATOS DEL DECLARANTE */}
              <tr>
                <td colSpan={4} className="f260-section-title-cell">
                  Datos del declarante
                </td>
              </tr>
              <tr>
                <td colSpan={4} style={{ padding: '3px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '28%' }}>
                          <div style={{ fontSize: '7.5px', fontWeight: 700 }}>5. Número de Identificación Tributaria (NIT)</div>
                          <div className="f210-digit-grid" style={{ marginTop: '2px' }}>
                            {nitDigits.map((d, i) => (
                              <div key={i} className="f210-digit-box">
                                {d}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={{ width: '6%' }}>
                          <div style={{ fontSize: '7.5px', fontWeight: 700 }}>6. DV</div>
                          <div className="f210-digit-box" style={{ marginTop: '2px' }}>
                            {getCasillaValue(6, '1')}
                          </div>
                        </td>
                        <td style={{ width: '66%' }}>
                          <div style={{ fontSize: '7.5px', fontWeight: 700 }}>11. Razón Social o Nombres y Apellidos del Contribuyente</div>
                          <div style={{ fontWeight: 800, fontSize: '11px', color: '#0d5c3a', marginTop: '2px' }}>
                            {getCasillaValue(11, 'CONTRIBUYENTE REGIMEN SIMPLE S.A.S.')}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ACTIVIDAD ECONOMICA Y CLASIFICACION */}
              <tr>
                <td colSpan={4} style={{ padding: '3px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '35%' }}>
                          <span>24. Actividad Económica Principal (CIIU): </span>
                          <strong style={{ fontFamily: 'var(--font-mono)' }}>{getCasillaValue(24, '4711')}</strong>
                        </td>
                        <td style={{ width: '65%', textAlign: 'right' }}>
                          <span>Grupo de Actividad (Art. 908 E.T.): <strong>Grupo {result?.grupo_actividad || 1}</strong></span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* SECCIÓN PATRIMONIO (CASILLAS 28 A 30) */}
              <tr>
                <td colSpan={4} className="f260-section-title-cell">
                  Patrimonio (Casillas 28 a 30)
                </td>
              </tr>
              <tr>
                <td colSpan={4} style={{ padding: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px', tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '38px' }} />
                      <col style={{ width: '13%' }} />
                      <col style={{ width: '17%' }} />
                      <col style={{ width: '38px' }} />
                      <col style={{ width: '13%' }} />
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '38px' }} />
                      <col style={{ width: '13%' }} />
                    </colgroup>
                    <tbody>
                      <tr>
                        <td style={{ padding: '3px 6px' }}>28. Total patrimonio bruto</td>
                        <td className="f260-casilla-num casilla-badge-btn" onClick={(e) => handleCasillaClick(28, e)}>
                          <span className="f260-info-badge">i</span>28
                        </td>
                        <td className="f260-casilla-val">${getCasillaValue(28)}</td>

                        <td style={{ padding: '3px 6px' }}>29. Total pasivos</td>
                        <td className="f260-casilla-num casilla-badge-btn" onClick={(e) => handleCasillaClick(29, e)}>
                          <span className="f260-info-badge">i</span>29
                        </td>
                        <td className="f260-casilla-val">${getCasillaValue(29)}</td>

                        <td style={{ padding: '3px 6px', fontWeight: 700 }}>30. Total patrimonio líquido</td>
                        <td className="f260-casilla-num casilla-badge-btn" onClick={(e) => handleCasillaClick(30, e)}>
                          <span className="f260-info-badge">i</span>30
                        </td>
                        <td className="f260-casilla-val calc-highlight">${getCasillaValue(30)}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* SECCIÓN INGRESOS POR ACTIVIDAD (CASILLAS 31 A 45) - TABLA UNIFICADA 5 COLUMNAS */}
              <tr>
                <td colSpan={4} className="f260-section-title-cell">
                  Ingresos Brutos del Año por Grupos de Actividad (Casillas 31 a 45)
                </td>
              </tr>
              <tr>
                <td colSpan={4} style={{ padding: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '48%' }} />
                      <col style={{ width: '38px' }} />
                      <col style={{ width: '22%' }} />
                      <col style={{ width: '38px' }} />
                      <col style={{ width: '22%' }} />
                    </colgroup>
                    <tbody>
                      <tr style={{ background: '#f8fafc', fontWeight: 700, fontSize: '9px' }}>
                        <td style={{ padding: '3px 6px', color: '#0d5c3a' }}>Grupos de Actividad Empresarial (Art. 908 E.T.)</td>
                        <td colSpan={2} style={{ textAlign: 'center', padding: '3px', color: '#0d5c3a', borderRight: '1px solid #000' }}>
                          A. Obtenidos en el País
                        </td>
                        <td colSpan={2} style={{ textAlign: 'center', padding: '3px', color: '#0d5c3a' }}>
                          B. Obtenidos en el Exterior
                        </td>
                      </tr>

                      {/* Grupo 1 */}
                      <tr>
                        <td style={{ padding: '3px 6px', fontSize: '9.5px', color: '#1e293b' }}>
                          Grupo 1: Tiendas pequeñas, minimercados y peluquerías
                        </td>
                        <td className="f260-casilla-num casilla-badge-btn" data-casilla="31" onClick={(e) => handleCasillaClick(31, e)}>
                          <span className="f260-info-badge">i</span>31
                        </td>
                        <td className="f260-casilla-val" id="f260_val_c31">${getCasillaValue(31)}</td>
                        <td className="f260-casilla-num casilla-badge-btn" data-casilla="32" onClick={(e) => handleCasillaClick(32, e)}>
                          <span className="f260-info-badge">i</span>32
                        </td>
                        <td className="f260-casilla-val" id="f260_val_c32">${getCasillaValue(32)}</td>
                      </tr>

                      {/* Grupo 2 */}
                      <tr>
                        <td style={{ padding: '3px 6px', fontSize: '9.5px', color: '#1e293b' }}>
                          Grupo 2: Actividades comerciales, industriales y servicios técnicos
                        </td>
                        <td className="f260-casilla-num casilla-badge-btn" data-casilla="33" onClick={(e) => handleCasillaClick(33, e)}>
                          <span className="f260-info-badge">i</span>33
                        </td>
                        <td className="f260-casilla-val" id="f260_val_c33">${getCasillaValue(33)}</td>
                        <td className="f260-casilla-num casilla-badge-btn" data-casilla="34" onClick={(e) => handleCasillaClick(34, e)}>
                          <span className="f260-info-badge">i</span>34
                        </td>
                        <td className="f260-casilla-val" id="f260_val_c34">${getCasillaValue(34)}</td>
                      </tr>

                      {/* Grupo 3 */}
                      <tr>
                        <td style={{ padding: '3px 6px', fontSize: '9.5px', color: '#1e293b' }}>
                          Grupo 3: Servicios de expendio de comidas, bebidas y transporte
                        </td>
                        <td className="f260-casilla-num casilla-badge-btn" data-casilla="35" onClick={(e) => handleCasillaClick(35, e)}>
                          <span className="f260-info-badge">i</span>35
                        </td>
                        <td className="f260-casilla-val" id="f260_val_c35">${getCasillaValue(35)}</td>
                        <td className="f260-casilla-num casilla-badge-btn" data-casilla="36" onClick={(e) => handleCasillaClick(36, e)}>
                          <span className="f260-info-badge">i</span>36
                        </td>
                        <td className="f260-casilla-val" id="f260_val_c36">${getCasillaValue(36)}</td>
                      </tr>

                      {/* Grupo 4 */}
                      <tr>
                        <td style={{ padding: '3px 6px', fontSize: '9.5px', color: '#1e293b' }}>
                          Grupo 4: Servicios de educación, salud humana y asistencia social
                        </td>
                        <td className="f260-casilla-num casilla-badge-btn" data-casilla="37" onClick={(e) => handleCasillaClick(37, e)}>
                          <span className="f260-info-badge">i</span>37
                        </td>
                        <td className="f260-casilla-val" id="f260_val_c37">${getCasillaValue(37)}</td>
                        <td className="f260-casilla-num casilla-badge-btn" data-casilla="38" onClick={(e) => handleCasillaClick(38, e)}>
                          <span className="f260-info-badge">i</span>38
                        </td>
                        <td className="f260-casilla-val" id="f260_val_c38">${getCasillaValue(38)}</td>
                      </tr>

                      {/* Grupo 5 */}
                      <tr>
                        <td style={{ padding: '3px 6px', fontSize: '9.5px', color: '#1e293b' }}>
                          Grupo 5: Servicios profesionales, científicos y de consultoría
                        </td>
                        <td className="f260-casilla-num casilla-badge-btn" data-casilla="39" onClick={(e) => handleCasillaClick(39, e)}>
                          <span className="f260-info-badge">i</span>39
                        </td>
                        <td className="f260-casilla-val" id="f260_val_c39">${getCasillaValue(39)}</td>
                        <td className="f260-casilla-num casilla-badge-btn" data-casilla="40" onClick={(e) => handleCasillaClick(40, e)}>
                          <span className="f260-info-badge">i</span>40
                        </td>
                        <td className="f260-casilla-val" id="f260_val_c40">${getCasillaValue(40)}</td>
                      </tr>

                      {/* Grupo 6 */}
                      <tr>
                        <td style={{ padding: '3px 6px', fontSize: '9.5px', color: '#1e293b' }}>
                          Grupo 6: Reciclaje y recuperación de materiales
                        </td>
                        <td className="f260-casilla-num casilla-badge-btn" data-casilla="41" onClick={(e) => handleCasillaClick(41, e)}>
                          <span className="f260-info-badge">i</span>41
                        </td>
                        <td className="f260-casilla-val" id="f260_val_c41">${getCasillaValue(41)}</td>
                        <td className="f260-casilla-num casilla-badge-btn" data-casilla="42" onClick={(e) => handleCasillaClick(42, e)}>
                          <span className="f260-info-badge">i</span>42
                        </td>
                        <td className="f260-casilla-val" id="f260_val_c42">${getCasillaValue(42)}</td>
                      </tr>

                      {/* Subtotales y Depuración */}
                      <tr>
                        <td style={{ padding: '3px 6px', fontSize: '9.5px', fontWeight: 700, color: '#0d5c3a' }}>
                          43. Total ingresos brutos anuales (31 a 42)
                        </td>
                        <td className="f260-casilla-num casilla-badge-btn" data-casilla="43" onClick={(e) => handleCasillaClick(43, e)}>
                          <span className="f260-info-badge">i</span>43
                        </td>
                        <td className="f260-casilla-val calc-highlight" id="f260_val_c43" style={{ fontWeight: 800 }}>
                          ${getCasillaValue(43)}
                        </td>
                        <td className="f260-casilla-num casilla-badge-btn" data-casilla="44" onClick={(e) => handleCasillaClick(44, e)}>
                          <span className="f260-info-badge">i</span>44
                        </td>
                        <td className="f260-casilla-val" id="f260_val_c44">
                          ${getCasillaValue(44)}
                        </td>
                      </tr>

                      <tr>
                        <td style={{ padding: '3px 6px', fontSize: '9.5px', fontWeight: 800, color: '#0d5c3a' }}>
                          45. Total ingresos gravables SIMPLE (43 - 44)
                        </td>
                        <td className="f260-casilla-num casilla-badge-btn" data-casilla="45" onClick={(e) => handleCasillaClick(45, e)}>
                          <span className="f260-info-badge">i</span>45
                        </td>
                        <td className="f260-casilla-val calc-highlight" id="f260_val_c45" style={{ fontWeight: 800 }}>
                          ${getCasillaValue(45)}
                        </td>
                        <td colSpan={2} style={{ background: '#f8fafc', fontSize: '8.5px', color: 'var(--text-muted)', padding: '3px 6px' }}>
                          44. Ingresos no constitutivos de renta ni GO
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* SECCIÓN 2 COLUMNAS: COMPONENTE NACIONAL & DESCUENTOS / ANTICIPOS */}
              <tr>
                <td colSpan={2} className="f260-section-title-cell" style={{ width: '50%' }}>
                  Liquidación Componente SIMPLE Nacional (Casillas 46 a 64)
                </td>
                <td colSpan={2} className="f260-section-title-cell" style={{ width: '50%' }}>
                  Componente ICA & Impuesto Consumo INC (Casillas 64 a 79)
                </td>
              </tr>
              <tr>
                {/* COMPONENTE NACIONAL (COLUMNA IZQUIERDA 50%) */}
                <td colSpan={2} style={{ width: '50%', verticalAlign: 'top', padding: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '60%' }} />
                      <col style={{ width: '38px' }} />
                      <col style={{ width: '105px' }} />
                    </colgroup>
                    <tbody>
                      {renderCasillaCell(46, 'Impuesto SIMPLE consolidado (Tarifa Art. 908 E.T.)', true)}
                      {renderCasillaCell(47, 'Componente ICA territorial municipal')}
                      {renderCasillaCell(48, 'Componente SIMPLE Nacional (46 - 47)', true)}
                      {renderCasillaCell(49, 'Descuento pensión empleador (100% Art. 903 E.T.)')}
                      {renderCasillaCell(50, 'Descuento ventas electrónicas (0.5% Art. 912 E.T.)')}
                      {renderCasillaCell(51, 'Descuento GMF')}
                      {renderCasillaCell(52, 'Total descuentos tributarios aplicables', true)}
                      {renderCasillaCell(53, 'Impuesto neto SIMPLE (48 - 52)', true)}
                      {renderCasillaCell(54, 'Retenciones practicadas indebidamente')}
                      {renderCasillaCell(55, 'Anticipo renta liquidado año anterior')}
                      {renderCasillaCell(56, 'Anticipos bimestrales SIMPLE pagados (F-2593)')}
                      {renderCasillaCell(57, 'Saldo a favor SIMPLE año gravable anterior')}
                      {renderCasillaCell(58, 'Saldo a pagar impuesto simple')}
                      {renderCasillaCell(62, 'Total sanciones componente simple nacional')}
                      {renderCasillaCell(63, 'Total saldo a pagar SIMPLE Nacional (Casilla 63)', true)}
                      {renderCasillaCell(64, 'Total saldo a favor SIMPLE Nacional (Casilla 64)', true)}
                    </tbody>
                  </table>
                </td>

                {/* COMPONENTE ICA & INC (COLUMNA DERECHA 50%) */}
                <td colSpan={2} style={{ width: '50%', verticalAlign: 'top', padding: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '60%' }} />
                      <col style={{ width: '38px' }} />
                      <col style={{ width: '105px' }} />
                    </colgroup>
                    <tbody>
                      <tr style={{ background: '#f8fafc', fontWeight: 700, fontSize: '8.5px' }}>
                        <td colSpan={3} style={{ padding: '3px 6px', color: '#0d5c3a' }}>A. Componente ICA Municipal y Distrital</td>
                      </tr>
                      {renderCasillaCell(64, 'Total impuesto ICA consolidado')}
                      {renderCasillaCell(65, 'Anticipos bimestrales ICA territorial pagados')}
                      {renderCasillaCell(68, 'Total saldo a pagar ICA territorial (Casilla 68)', true)}

                      <tr style={{ background: '#f8fafc', fontWeight: 700, fontSize: '8.5px' }}>
                        <td colSpan={3} style={{ padding: '3px 6px', color: '#d97706' }}>B. Impuesto Nacional al Consumo (INC 8% - Comidas/Bebidas)</td>
                      </tr>
                      {renderCasillaCell(69, 'Ingresos gravados servicio comidas y bebidas')}
                      {renderCasillaCell(70, 'Impuesto nacional al consumo comidas y bebidas (8%)', true)}
                      {renderCasillaCell(71, 'Anticipos bimestrales INC efectivamente pagados')}
                      {renderCasillaCell(72, 'Saldo a favor INC año anterior')}
                      {renderCasillaCell(73, 'Saldo a pagar INC')}
                      {renderCasillaCell(74, 'Sanción extemporaneidad INC')}
                      {renderCasillaCell(75, 'Sanción corrección INC')}
                      {renderCasillaCell(77, 'Total sanciones INC')}
                      {renderCasillaCell(78, 'Total saldo a pagar INC (Casilla 78)', true)}
                      {renderCasillaCell(79, 'Total saldo a favor INC (Casilla 79)', true)}
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* SECCIÓN GANANCIAS OCASIONALES EN EL SIMPLE */}
              <tr>
                <td colSpan={4} className="f260-section-title-cell">
                  Ganancias Ocasionales en el SIMPLE (Casillas 80 a 94 - Tarifa General 15%)
                </td>
              </tr>
              <tr>
                <td colSpan={4} style={{ padding: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px', tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '38px' }} />
                      <col style={{ width: '13%' }} />
                      <col style={{ width: '17%' }} />
                      <col style={{ width: '38px' }} />
                      <col style={{ width: '13%' }} />
                      <col style={{ width: '18%' }} />
                      <col style={{ width: '38px' }} />
                      <col style={{ width: '13%' }} />
                    </colgroup>
                    <tbody>
                      <tr>
                        <td style={{ padding: '3px 6px' }}>80. Ingresos por ganancias ocasionales</td>
                        <td className="f260-casilla-num casilla-badge-btn" onClick={(e) => handleCasillaClick(80, e)}>
                          <span className="f260-info-badge">i</span>80
                        </td>
                        <td className="f260-casilla-val">${getCasillaValue(80)}</td>

                        <td style={{ padding: '3px 6px' }}>81. Costos ganancias ocasionales</td>
                        <td className="f260-casilla-num casilla-badge-btn" onClick={(e) => handleCasillaClick(81, e)}>
                          <span className="f260-info-badge">i</span>81
                        </td>
                        <td className="f260-casilla-val">${getCasillaValue(81)}</td>

                        <td style={{ padding: '3px 6px' }}>82. Ganancias exentas</td>
                        <td className="f260-casilla-num casilla-badge-btn" onClick={(e) => handleCasillaClick(82, e)}>
                          <span className="f260-info-badge">i</span>82
                        </td>
                        <td className="f260-casilla-val">${getCasillaValue(82)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '3px 6px', fontWeight: 700 }}>84. Impuesto GO (15%)</td>
                        <td className="f260-casilla-num casilla-badge-btn" onClick={(e) => handleCasillaClick(84, e)}>
                          <span className="f260-info-badge">i</span>84
                        </td>
                        <td className="f260-casilla-val calc-highlight">${getCasillaValue(84)}</td>

                        <td colSpan={3}></td>

                        <td style={{ padding: '3px 6px', fontWeight: 800, color: '#0d5c3a' }}>
                          94. Total saldo pagar GO
                        </td>
                        <td className="f260-casilla-num casilla-badge-btn" onClick={(e) => handleCasillaClick(94, e)}>
                          <span className="f260-info-badge">i</span>94
                        </td>
                        <td className="f260-casilla-val calc-highlight" style={{ fontWeight: 800 }}>${getCasillaValue(94)}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* CASILLA 980: PAGO TOTAL */}
              <tr style={{ background: '#fef9c3', borderTop: '2px solid #0d5c3a' }}>
                <td colSpan={2} style={{ padding: '8px 12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#854d0e', textTransform: 'uppercase' }}>
                    980. PAGO TOTAL $ (SIMPLE + ICA + INC + Ganancias Ocasionales)
                  </div>
                  <div style={{ fontSize: '9px', color: '#713f12', marginTop: '2px' }}>
                    Suma consolidada de saldos a pagar (Casilla 63 + Casilla 68 + Casilla 78 + Casilla 94). Traslado al Formulario 490.
                  </div>
                </td>
                <td
                  className="f260-casilla-num casilla-badge-btn"
                  onClick={(e) => handleCasillaClick(980, e)}
                  style={{ width: '42px', background: '#fde047', color: '#713f12' }}
                >
                  <span className="f260-info-badge">i</span>980
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '16px',
                    fontWeight: 900,
                    color: '#854d0e',
                    padding: '8px 12px',
                    background: '#fef08a',
                  }}
                  id="f260_val_c980"
                >
                  ${getCasillaValue(980)}
                </td>
              </tr>

              {/* SECCIÓN SIGNATARIOS Y FIRMAS */}
              <tr>
                <td colSpan={4} style={{ padding: '4px', background: '#f8fafc' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '33%', border: '1px solid #cbd5e1', padding: '4px' }}>
                          <div style={{ fontWeight: 700 }}>981. Cód. Representación: <strong>{getCasillaValue(981, '18')}</strong></div>
                          <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Firma del Contribuyente o Representante Legal</div>
                        </td>
                        <td style={{ width: '33%', border: '1px solid #cbd5e1', padding: '4px' }}>
                          <div style={{ fontWeight: 700 }}>982. Cód. Contador/Revisor: <strong>{getCasillaValue(982, '1')}</strong></div>
                          <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Firma de Contador Público con Dictamen</div>
                        </td>
                        <td style={{ width: '34%', border: '1px solid #cbd5e1', padding: '4px' }}>
                          <div style={{ fontWeight: 700 }}>983. Tarjeta Profesional No.: <strong>{getCasillaValue(983, '654321-T')}</strong></div>
                          <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Junta Central de Contadores de Colombia</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
