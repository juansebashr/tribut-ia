import React from 'react';
import type { PersonaJuridicaOutput } from '../../../types/tax';
import { useApp } from '../../../context/AppContext';
import { formatCOP } from '../../../utils/formatters';

interface PjF110SubtabProps {
  result: PersonaJuridicaOutput | null;
  onNavigateToCalc: () => void;
}

export const PjF110Subtab: React.FC<PjF110SubtabProps> = ({ result, onNavigateToCalc }) => {
  const { showCasillaPopover, taxYear } = useApp();

  const handleCasillaClick = (num: number | string, e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    showCasillaPopover(num, e.currentTarget, '110');
  };

  const getCasillaValue = (num: number, defaultVal: number | string = 0): string => {
    if (!result || !result.form_110_casillas) {
      return typeof defaultVal === 'number' ? formatCOP(defaultVal, false) : String(defaultVal);
    }
    const c = result.form_110_casillas;

    const mapping: Record<number, number | string> = {
      1: c.ano || taxYear || 2026,
      4: c.numero_formulario || '110202699999',
      5: c.nit || '900123456',
      6: c.dv || '1',
      11: c.razon_social || 'EMPRESA NACIONAL S.A.S.',
      12: c.cod_direccion_seccional || 32,
      24: c.actividad_economica || '6201',
      33: c.c33_total_costos_gastos_nomina,
      34: c.c34_aportes_seguridad_social,
      35: c.c35_aportes_sena_icbf_cajas,
      36: c.c36_efectivo_y_equivalentes,
      37: c.c37_inversiones_derivados,
      38: c.c38_cuentas_por_cobrar,
      39: c.c39_inventarios,
      40: c.c40_activos_intangibles,
      41: c.c41_activos_biologicos,
      42: c.c42_propiedades_planta_equipo,
      43: c.c43_otros_activos,
      44: c.c44_total_patrimonio_bruto,
      45: c.c45_pasivos,
      46: c.c46_total_patrimonio_liquido,
      47: c.c47_ingresos_brutos_ordinarios,
      48: c.c48_ingresos_financieros,
      49: c.c49_dividendos_no_constitutivos,
      50: c.c50_dividendos_chc,
      51: c.c51_dividendos_gravados_tarifa_general,
      52: c.c52_dividendos_no_residentes_2016,
      53: c.c53_dividendos_no_residentes_2017,
      54: c.c54_dividendos_art245_246,
      55: c.c55_dividendos_ep_extranjeras_2017,
      56: c.c56_dividendos_megainversion_27,
      57: c.c57_otros_ingresos,
      58: c.c58_total_ingresos_brutos,
      59: c.c59_devoluciones_rebajas_descuentos,
      60: c.c60_ingresos_no_constitutivos_renta,
      61: c.c61_total_ingresos_netos,
      62: c.c62_costos,
      63: c.c63_gastos_administracion,
      64: c.c64_gastos_distribucion_ventas,
      65: c.c65_gastos_financieros,
      66: c.c66_otros_gastos_deducciones,
      67: c.c67_total_costos_gastos_deducibles,
      68: c.c68_inversiones_efectuadas_ano,
      69: c.c69_inversiones_liquidadas_periodos_anteriores,
      70: c.c70_renta_recuperacion_deducciones,
      71: c.c71_renta_pasiva_ece,
      72: c.c72_renta_liquida_ordinaria,
      73: c.c73_perdida_liquida_ejercicio,
      74: c.c74_compensaciones,
      75: c.c75_renta_liquida,
      76: c.c76_renta_presuntiva,
      77: c.c77_renta_exenta,
      78: c.c78_rentas_gravables,
      79: c.c79_renta_liquida_gravable,
      80: c.c80_ingresos_ganancias_ocasionales,
      81: c.c81_costos_ganancias_ocasionales,
      82: c.c82_ganancias_ocasionales_exentas,
      83: c.c83_ganancias_ocasionales_gravables,
      84: c.c84_impuesto_renta_liquida_gravable,
      85: c.c85_puntos_adicionales_sobretasa,
      86: c.c86_impuesto_dividendos_art245_246,
      87: c.c87_impuesto_dividendos_art240,
      88: c.c88_impuesto_dividendos_megainversion,
      89: c.c89_impuesto_dividendos_no_residentes_2017,
      90: c.c90_impuesto_dividendos_no_residentes_2016,
      91: c.c91_total_impuesto_rentas_liquidas,
      92: c.c92_valor_a_adicionar_vaa,
      93: c.c93_descuentos_tributarios,
      94: c.c94_impuesto_neto_renta_sin_adicion,
      95: c.c95_impuesto_a_adicionar_ttd,
      96: c.c96_impuesto_neto_renta_con_adicion,
      97: c.c97_impuesto_ganancias_ocasionales,
      98: c.c98_descuento_impuestos_exterior_go,
      99: c.c99_total_impuesto_a_cargo,
      100: c.c100_obras_por_impuestos_mod1,
      101: c.c101_descuento_obras_por_impuestos_mod2,
      102: c.c102_credito_fiscal_256_1,
      103: c.c103_anticipo_renta_ano_anterior,
      104: c.c104_saldo_a_favor_ano_anterior,
      105: c.c105_autorretenciones,
      106: c.c106_otras_retenciones,
      107: c.c107_total_retenciones_ano_declarar,
      108: c.c108_anticipo_renta_ano_siguiente,
      109: c.c109_anticipo_sobretasa_ano_anterior,
      110: c.c110_anticipo_sobretasa_ano_siguiente,
      111: c.c111_saldo_a_pagar_por_impuesto,
      112: c.c112_sanciones,
      113: c.c113_total_saldo_a_pagar,
      114: c.c114_total_saldo_a_favor,
      115: c.c115_obras_impuestos_exigible_mod1,
      116: c.c116_total_proyecto_obras_mod2,
      117: c.c117_aporte_voluntario_art244_1,
      980: c.c980_pago_total || c.c113_total_saldo_a_pagar,
      981: c.c981_cod_representacion || '18',
      982: c.c982_cod_contador_o_revisor || '1',
      983: c.c983_tarjeta_profesional || '123456-T',
    };

    const val = mapping[num];
    if (val === undefined) return '0';
    return typeof val === 'number' ? formatCOP(val, false) : String(val);
  };

  const yearDigits = String(taxYear || 2026).split('');
  const nitDigits = (result?.form_110_casillas?.nit || '900123456').replace(/\D/g, '').padEnd(10, ' ').split('').slice(0, 10);

  const renderCasillaCell = (
    num: number,
    label: string,
    isSubtotal: boolean = false,
    isTotalPay: boolean = false
  ) => {
    return (
      <tr key={num}>
        <td style={{ padding: '2px 4px', fontSize: '9px', color: isSubtotal ? '#004034' : '#1e293b', fontWeight: isSubtotal ? 800 : 500 }}>
          {label}
        </td>
        <td
          className="f110-casilla-num casilla-badge-btn"
          data-casilla={String(num)}
          onClick={(e) => handleCasillaClick(num, e)}
          title={`Casilla ${num}: clic para consultar instructivo legal`}
        >
          <span className="f110-info-badge">i</span>
          {num}
        </td>
        <td
          className={`f110-casilla-val ${isTotalPay ? 'total-to-pay' : isSubtotal ? 'calc-highlight' : ''}`}
          id={`f110_val_c${num}`}
        >
          ${getCasillaValue(num)}
        </td>
      </tr>
    );
  };

  return (
    <div id="pane-pj-f110" className="module-pane active">
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
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#00594c', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏛️</span> Formulario 110 Oficial DIAN (Facsímil Idéntico)
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
            💡 <em>Copia exacta del formulario oficial de Renta para Personas Jurídicas. Haz clic en cualquier casilla <strong>[ i ]</strong> para ver la cartilla y fundamentos del Estatuto Tributario.</em>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
            🖨️ Imprimir Formulario 110
          </button>
          <button className="btn btn-primary btn-sm" onClick={onNavigateToCalc}>
            ✏️ Modificar Parámetros
          </button>
        </div>
      </div>

      {/* FACSIMILE OFICIAL FORMULARIO 110 */}
      <div className="table-scroll-hint">
        <span>👉</span> Desliza horizontalmente para ver el Formulario 110 completo ➔
      </div>
      <div className="table-responsive">
        <div className="f110-sheet-wrapper">
          <div className="f110-watermark">DIAN 110</div>

          <table className="f110-table">
            <tbody>
              {/* ENCABEZADO OFICIAL */}
              <tr>
                <td className="f110-header-cell-logo">
                  <div className="f110-dian-logo-svg">
                    <span style={{ letterSpacing: '-2px', fontWeight: 900, fontSize: '26px' }}>DIAN</span>
                  </div>
                  <div style={{ fontSize: '7px', textTransform: 'uppercase', fontWeight: 700, color: '#00594c', marginTop: '2px' }}>
                    República de Colombia
                  </div>
                </td>
                <td className="f110-header-title">
                  Declaración de Renta y Complementario para Personas Jurídicas y Asimiladas y Personas Naturales y Asimiladas no Residentes
                </td>
                <td className="f110-header-privada">PRIVADA</td>
                <td className="f110-header-form-num">110</td>
              </tr>

              {/* METADATOS: AÑO Y NÚMERO DE FORMULARIO */}
              <tr>
                <td colSpan={2} style={{ padding: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '9.5px' }}>1. Año</span>
                    <div className="f210-digit-grid" id="f110-year-digits">
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
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 800, color: '#00594c' }}>
                    {getCasillaValue(4, '110202699999')}
                  </div>
                </td>
              </tr>

              {/* DATOS DEL DECLARANTE */}
              <tr>
                <td colSpan={4} className="f110-section-title-cell">
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
                          <div style={{ fontSize: '7.5px', fontWeight: 700 }}>11. Razón Social o Denominación Social</div>
                          <div style={{ fontWeight: 800, fontSize: '11px', color: '#004034', marginTop: '2px' }}>
                            {getCasillaValue(11, 'EMPRESA EJEMPLO S.A.S.')}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* CLASIFICACIÓN SECCIONAL Y ACTIVIDAD */}
              <tr>
                <td colSpan={4} style={{ padding: '3px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '25%' }}>
                          <span>12. Cód. Dirección Seccional: </span>
                          <strong style={{ fontFamily: 'var(--font-mono)' }}>{getCasillaValue(12, '32')}</strong>
                        </td>
                        <td style={{ width: '35%' }}>
                          <span>24. Actividad Económica Principal (CIIU): </span>
                          <strong style={{ fontFamily: 'var(--font-mono)' }}>{getCasillaValue(24, '6201')}</strong>
                        </td>
                        <td style={{ width: '40%', textAlign: 'right' }}>
                          <span>Si es una corrección indique: 25. Cód: <strong>00</strong> | 26. No. Anterior: <strong>-</strong></span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* DATOS INFORMATIVOS */}
              <tr>
                <td colSpan={4} className="f110-section-title-cell">
                  Datos informativos (Nómina y Seguridad Social)
                </td>
              </tr>
              <tr>
                <td colSpan={4} style={{ padding: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '2px 4px', width: '22%' }}>33. Total costos y gastos de nómina</td>
                        <td className="f110-casilla-num casilla-badge-btn" onClick={(e) => handleCasillaClick(33, e)}>
                          <span className="f110-info-badge">i</span>33
                        </td>
                        <td className="f110-casilla-val" style={{ width: '11%' }}>${getCasillaValue(33)}</td>

                        <td style={{ padding: '2px 4px', width: '22%' }}>34. Aportes a seguridad social</td>
                        <td className="f110-casilla-num casilla-badge-btn" onClick={(e) => handleCasillaClick(34, e)}>
                          <span className="f110-info-badge">i</span>34
                        </td>
                        <td className="f110-casilla-val" style={{ width: '11%' }}>${getCasillaValue(34)}</td>

                        <td style={{ padding: '2px 4px', width: '22%' }}>35. Aportes SENA, ICBF, Cajas</td>
                        <td className="f110-casilla-num casilla-badge-btn" onClick={(e) => handleCasillaClick(35, e)}>
                          <span className="f110-info-badge">i</span>35
                        </td>
                        <td className="f110-casilla-val" style={{ width: '11%' }}>${getCasillaValue(35)}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* SECCIÓN 2 COLUMNAS: PATRIMONIO E INGRESOS */}
              <tr>
                <td colSpan={2} className="f110-section-title-cell" style={{ width: '50%' }}>
                  Patrimonio (Casillas 36 a 46)
                </td>
                <td colSpan={2} className="f110-section-title-cell" style={{ width: '50%' }}>
                  Ingresos (Casillas 47 a 61)
                </td>
              </tr>
              <tr>
                {/* COLUMNA IZQUIERDA: PATRIMONIO */}
                <td colSpan={2} style={{ width: '50%', verticalAlign: 'top', padding: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '60%' }} />
                      <col style={{ width: '38px' }} />
                      <col style={{ width: '105px' }} />
                    </colgroup>
                    <tbody>
                      {renderCasillaCell(36, 'Efectivo y equivalentes de efectivo')}
                      {renderCasillaCell(37, 'Inversiones e instrumentos derivados')}
                      {renderCasillaCell(38, 'Cuentas y documentos por cobrar')}
                      {renderCasillaCell(39, 'Inventarios')}
                      {renderCasillaCell(40, 'Activos intangibles')}
                      {renderCasillaCell(41, 'Activos biológicos')}
                      {renderCasillaCell(42, 'Propiedad, planta, equipo e inversión')}
                      {renderCasillaCell(43, 'Otros activos')}
                      {renderCasillaCell(44, 'Total patrimonio bruto (36 a 43)', true)}
                      {renderCasillaCell(45, 'Pasivos')}
                      {renderCasillaCell(46, 'Total patrimonio líquido (44 - 45)', true)}
                    </tbody>
                  </table>
                </td>

                {/* COLUMNA DERECHA: INGRESOS */}
                <td colSpan={2} style={{ width: '50%', verticalAlign: 'top', padding: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '60%' }} />
                      <col style={{ width: '38px' }} />
                      <col style={{ width: '105px' }} />
                    </colgroup>
                    <tbody>
                      {renderCasillaCell(47, 'Ingresos brutos de actividades ordinarias')}
                      {renderCasillaCell(48, 'Ingresos financieros')}
                      {renderCasillaCell(49, 'Dividendos no constitutivos de renta ni GO')}
                      {renderCasillaCell(50, 'Dividendos distribuidos por entidades no residentes (CHC)')}
                      {renderCasillaCell(51, 'Dividendos gravados tarifa general')}
                      {renderCasillaCell(52, 'Dividendos no residentes 2016 y anteriores')}
                      {renderCasillaCell(53, 'Dividendos no residentes 2017+')}
                      {renderCasillaCell(54, 'Dividendos PN residentes (Art. 245 y 246)')}
                      {renderCasillaCell(55, 'Dividendos EP sociedades extranjeras 2017+')}
                      {renderCasillaCell(56, 'Dividendos megainversión (27%)')}
                      {renderCasillaCell(57, 'Otros ingresos')}
                      {renderCasillaCell(58, 'Total ingresos brutos (47 a 57)', true)}
                      {renderCasillaCell(59, 'Devoluciones, rebajas y descuentos')}
                      {renderCasillaCell(60, 'Ingresos no constitutivos de renta')}
                      {renderCasillaCell(61, 'Total ingresos netos (58 - 59 - 60)', true)}
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* SECCIÓN 2 COLUMNAS: COSTOS & RENTA */}
              <tr>
                <td colSpan={2} className="f110-section-title-cell" style={{ width: '50%' }}>
                  Costos y Gastos Deducibles (Casillas 62 a 69)
                </td>
                <td colSpan={2} className="f110-section-title-cell" style={{ width: '50%' }}>
                  Renta y Depuración Ordinaria (Casillas 70 a 79)
                </td>
              </tr>
              <tr>
                {/* COSTOS */}
                <td colSpan={2} style={{ width: '50%', verticalAlign: 'top', padding: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '60%' }} />
                      <col style={{ width: '38px' }} />
                      <col style={{ width: '105px' }} />
                    </colgroup>
                    <tbody>
                      {renderCasillaCell(62, 'Costos de ventas y prestación de servicios')}
                      {renderCasillaCell(63, 'Gastos operacionales de administración')}
                      {renderCasillaCell(64, 'Gastos de distribución y ventas')}
                      {renderCasillaCell(65, 'Gastos financieros')}
                      {renderCasillaCell(66, 'Otros gastos y deducciones procedentes')}
                      {renderCasillaCell(67, 'Total costos y gastos deducibles (62 a 66)', true)}
                      {renderCasillaCell(68, 'Inversiones efectuadas en el año')}
                      {renderCasillaCell(69, 'Inversiones liquidadas periodos anteriores')}
                    </tbody>
                  </table>
                </td>

                {/* RENTA */}
                <td colSpan={2} style={{ width: '50%', verticalAlign: 'top', padding: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '60%' }} />
                      <col style={{ width: '38px' }} />
                      <col style={{ width: '105px' }} />
                    </colgroup>
                    <tbody>
                      {renderCasillaCell(70, 'Renta por recuperación de deducciones')}
                      {renderCasillaCell(71, 'Renta pasiva - ECE sin residencia fiscal')}
                      {renderCasillaCell(72, 'Renta líquida ordinaria del ejercicio', true)}
                      {renderCasillaCell(73, 'Pérdida líquida del ejercicio')}
                      {renderCasillaCell(74, 'Compensaciones (Pérdidas y Renta Presuntiva)')}
                      {renderCasillaCell(75, 'Renta líquida')}
                      {renderCasillaCell(76, 'Renta presuntiva')}
                      {renderCasillaCell(77, 'Rentas exentas')}
                      {renderCasillaCell(78, 'Rentas gravables')}
                      {renderCasillaCell(79, 'Renta líquida gravable (Casilla 79)', true)}
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* SECCIÓN GANANCIAS OCASIONALES */}
              <tr>
                <td colSpan={4} className="f110-section-title-cell">
                  Ganancias Ocasionales (Casillas 80 a 83 - Tarifa General 15%)
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
                        <td className="f110-casilla-num casilla-badge-btn" onClick={(e) => handleCasillaClick(80, e)}>
                          <span className="f110-info-badge">i</span>80
                        </td>
                        <td className="f110-casilla-val">${getCasillaValue(80)}</td>

                        <td style={{ padding: '3px 6px' }}>81. Costos ganancias ocasionales</td>
                        <td className="f110-casilla-num casilla-badge-btn" onClick={(e) => handleCasillaClick(81, e)}>
                          <span className="f110-info-badge">i</span>81
                        </td>
                        <td className="f110-casilla-val">${getCasillaValue(81)}</td>

                        <td style={{ padding: '3px 6px' }}>82. Ganancias no gravadas / exentas</td>
                        <td className="f110-casilla-num casilla-badge-btn" onClick={(e) => handleCasillaClick(82, e)}>
                          <span className="f110-info-badge">i</span>82
                        </td>
                        <td className="f110-casilla-val">${getCasillaValue(82)}</td>
                      </tr>
                      <tr>
                        <td colSpan={6}></td>
                        <td style={{ padding: '3px 6px', fontWeight: 700 }}>83. Ganancias gravables</td>
                        <td className="f110-casilla-num casilla-badge-btn" onClick={(e) => handleCasillaClick(83, e)}>
                          <span className="f110-info-badge">i</span>83
                        </td>
                        <td className="f110-casilla-val calc-highlight" style={{ fontWeight: 800 }}>${getCasillaValue(83)}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* LIQUIDACIÓN PRIVADA Y SALDOS FINALES */}
              <tr>
                <td colSpan={4} className="f110-section-title-cell" style={{ textAlign: 'center' }}>
                  Liquidación Privada, TTD, Descuentos y Saldo Final (Casillas 84 a 117)
                </td>
              </tr>
              <tr>
                {/* COLUMNA IZQUIERDA: LIQUIDACIÓN IMPUESTOS */}
                <td colSpan={2} style={{ width: '50%', verticalAlign: 'top', padding: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '60%' }} />
                      <col style={{ width: '38px' }} />
                      <col style={{ width: '105px' }} />
                    </colgroup>
                    <tbody>
                      {renderCasillaCell(84, 'Impuesto sobre la renta líquida gravable (35%)')}
                      {renderCasillaCell(85, 'Puntos adicionales sobretasa (Financiera/Hidro/Minera)')}
                      {renderCasillaCell(86, 'De dividendos gravados tarifa 20%')}
                      {renderCasillaCell(87, 'De dividendos gravados tarifa general')}
                      {renderCasillaCell(88, 'De dividendos megainversiones (27%)')}
                      {renderCasillaCell(89, 'De dividendos no residentes 2017+')}
                      {renderCasillaCell(90, 'De dividendos no residentes 2016 y anteriores')}
                      {renderCasillaCell(91, 'Total impuesto rentas líquidas (84 a 90)', true)}
                      {renderCasillaCell(92, 'Valor a adicionar (VAA Art. 259-1)')}
                      {renderCasillaCell(93, 'Descuentos tributarios (ICA, Donaciones, Exterior)')}
                      {renderCasillaCell(94, 'Impuesto neto de renta sin adición (91 + 92 - 93)', true)}
                      {renderCasillaCell(95, 'Impuesto a adicionar Tasa Mínima TTD (15% Art. 240 Par. 6)')}
                      {renderCasillaCell(96, 'Impuesto neto de renta con adición (94 + 95)', true)}
                      {renderCasillaCell(97, 'Impuesto de ganancias ocasionales (15%)')}
                      {renderCasillaCell(98, 'Descuento impuestos pagados exterior por GO')}
                      {renderCasillaCell(99, 'Total impuesto a cargo (96 + 97 - 98)', true)}
                    </tbody>
                  </table>
                </td>

                {/* COLUMNA DERECHA: RETENCIONES, ANTICIPOS Y SALDO A PAGAR */}
                <td colSpan={2} style={{ width: '50%', verticalAlign: 'top', padding: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '60%' }} />
                      <col style={{ width: '38px' }} />
                      <col style={{ width: '105px' }} />
                    </colgroup>
                    <tbody>
                      {renderCasillaCell(100, 'Inversión Obras por Impuestos (Modalidad 1)')}
                      {renderCasillaCell(101, 'Descuento Obras por Impuestos (Modalidad 2)')}
                      {renderCasillaCell(102, 'Crédito fiscal Art. 256-1 E.T.')}
                      {renderCasillaCell(103, 'Anticipo renta liquidado año gravable anterior')}
                      {renderCasillaCell(104, 'Saldo a favor año gravable anterior')}
                      {renderCasillaCell(105, 'Autorretenciones en la fuente')}
                      {renderCasillaCell(106, 'Otras retenciones en la fuente')}
                      {renderCasillaCell(107, 'Total retenciones año gravable a declarar (105 + 106)', true)}
                      {renderCasillaCell(108, 'Anticipo renta para el año gravable siguiente')}
                      {renderCasillaCell(109, 'Anticipo puntos adicionales sobretasa año anterior')}
                      {renderCasillaCell(110, 'Anticipo sobretasa financiera año siguiente (100%)')}
                      {renderCasillaCell(111, 'Saldo a pagar por impuesto')}
                      {renderCasillaCell(112, 'Sanciones (Extemporaneidad / Corrección)')}
                      {renderCasillaCell(113, 'Total saldo a pagar (Casilla 113)', true, true)}
                      {renderCasillaCell(114, 'Total saldo a favor (Casilla 114)', true)}
                      {renderCasillaCell(117, 'Aporte voluntario (Art. 244-1)')}
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* CASILLA 980: PAGO TOTAL */}
              <tr style={{ background: '#fef9c3', borderTop: '2px solid #00594c' }}>
                <td colSpan={2} style={{ padding: '6px 10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#854d0e', textTransform: 'uppercase' }}>
                    980. PAGO TOTAL $ (Traslado al Recibo Oficial Formulario 490)
                  </div>
                  <div style={{ fontSize: '8.5px', color: '#713f12' }}>
                    Monto final a cancelar en bancos o PSE simultáneamente con la presentación del Formulario 110.
                  </div>
                </td>
                <td
                  className="f110-casilla-num casilla-badge-btn"
                  onClick={(e) => handleCasillaClick(980, e)}
                  style={{ width: '40px', background: '#fde047', color: '#713f12' }}
                >
                  <span className="f110-info-badge">i</span>980
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '15px',
                    fontWeight: 900,
                    color: '#854d0e',
                    padding: '6px 12px',
                    background: '#fef08a',
                  }}
                  id="f110_val_c980"
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
                          <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Firma del Representante Legal o Agente Oficioso</div>
                        </td>
                        <td style={{ width: '33%', border: '1px solid #cbd5e1', padding: '4px' }}>
                          <div style={{ fontWeight: 700 }}>982. Cód. Contador/Revisor: <strong>{getCasillaValue(982, '1')}</strong></div>
                          <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Firma de Contador Público con Dictamen</div>
                        </td>
                        <td style={{ width: '34%', border: '1px solid #cbd5e1', padding: '4px' }}>
                          <div style={{ fontWeight: 700 }}>983. Tarjeta Profesional No.: <strong>{getCasillaValue(983, '123456-T')}</strong></div>
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
