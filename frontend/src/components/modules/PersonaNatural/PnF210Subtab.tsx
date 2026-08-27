import React from 'react';
import type { PersonaNaturalOutput } from '../../../types/tax';
import { useApp } from '../../../context/AppContext';
import { formatCOP } from '../../../utils/formatters';
import { triggerPrint } from '../../../utils/printHelper';

interface PnF210SubtabProps {
  result: PersonaNaturalOutput | null;
  onNavigateToCalc: () => void;
}

export const PnF210Subtab: React.FC<PnF210SubtabProps> = ({ result, onNavigateToCalc }) => {
  const { showCasillaPopover, taxYear } = useApp();

  const handleCasillaClick = (num: number | string, e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    showCasillaPopover(num, e.currentTarget);
  };

  const getCasillaValue = (num: number, defaultVal: number | string = 0): string => {
    if (!result) {
      return typeof defaultVal === 'number' ? formatCOP(defaultVal, false) : String(defaultVal);
    }

    switch (num) {
      case 28:
        return formatCOP(
          result.form_210_casillas?.c28_deduccion_facturas_1pct ??
            (result as any).compras_factura_electronica_deduccion ??
            150000,
          false
        );
      case 29:
        return formatCOP(
          result.patrimonio_bruto ??
            result.form_210_casillas?.c29_patrimonio_bruto ??
            300000000,
          false
        );
      case 30:
        return formatCOP(
          result.deudas ??
            result.form_210_casillas?.c30_deudas ??
            80000000,
          false
        );
      case 31:
        return formatCOP(
          result.patrimonio_liquido ??
            result.form_210_casillas?.c31_patrimonio_liquido ??
            220000000,
          false
        );
      case 32:
        return formatCOP(
          result.form_210_casillas?.c32_ingresos_brutos_trabajo ?? result.total_ingresos_brutos,
          false
        );
      case 33:
        return formatCOP(
          result.form_210_casillas?.c33_incrngo_trabajo ?? result.total_incrngo,
          false
        );
      case 34:
        return formatCOP(
          result.form_210_casillas?.c34_renta_liquida_trabajo ?? result.ingreso_neto,
          false
        );
      case 35:
        return formatCOP(
          result.form_210_casillas?.c35_afc_fvp_trabajo ??
            result.total_rentas_exentas_previas ??
            10000000,
          false
        );
      case 36:
        return formatCOP(
          result.form_210_casillas?.c36_renta_exenta_laboral_25 ?? result.renta_exenta_laboral_25,
          false
        );
      case 37:
        return formatCOP(
          result.form_210_casillas?.c37_total_rentas_exentas_trabajo ??
            result.total_rentas_exentas_aceptadas,
          false
        );
      case 38:
        return formatCOP(
          result.form_210_casillas?.c38_intereses_vivienda_trabajo ??
            result.total_deducciones_solicitadas,
          false
        );
      case 39:
        return formatCOP(0, false);
      case 40:
        return formatCOP(
          result.form_210_casillas?.c40_total_deducciones_trabajo ??
            result.total_deducciones_aceptadas,
          false
        );
      case 41:
        return formatCOP(
          result.form_210_casillas?.c41_rentas_exentas_deducciones_limitadas_trabajo ??
            result.alivios_procedentes_finales,
          false
        );
      case 42:
        return formatCOP(
          result.form_210_casillas?.c42_renta_liquida_ordinaria_trabajo ??
            result.renta_liquida_gravable,
          false
        );
      case 43:
        return formatCOP(0, false);
      case 44:
        return formatCOP(0, false);
      case 45:
        return formatCOP(0, false);
      case 46:
        return formatCOP(0, false);
      case 47:
        return formatCOP(0, false);
      case 48:
        return formatCOP(0, false);
      case 49:
        return formatCOP(0, false);
      case 50:
        return formatCOP(0, false);
      case 51:
        return formatCOP(0, false);
      case 52:
        return formatCOP(0, false);
      case 53:
        return formatCOP(0, false);
      case 54:
        return formatCOP(0, false);
      case 55:
        return formatCOP(0, false);
      case 56:
        return formatCOP(0, false);
      case 57:
        return formatCOP(0, false);
      case 58:
        return formatCOP(result.form_210_casillas?.c58_ingresos_brutos_capital ?? 0, false);
      case 59:
        return formatCOP(result.form_210_casillas?.c59_incrngo_capital ?? 0, false);
      case 60:
        return formatCOP(0, false);
      case 61:
        return formatCOP(result.form_210_casillas?.c61_renta_liquida_capital ?? 0, false);
      case 63:
        return formatCOP(0, false);
      case 64:
        return formatCOP(0, false);
      case 65:
        return formatCOP(0, false);
      case 66:
        return formatCOP(0, false);
      case 67:
        return formatCOP(0, false);
      case 68:
        return formatCOP(0, false);
      case 69:
        return formatCOP(0, false);
      case 70:
        return formatCOP(result.form_210_casillas?.c70_exentas_no_imputables_capital ?? 0, false);
      case 71:
        return formatCOP(result.form_210_casillas?.c71_compensacion_perdidas_capital ?? 0, false);
      case 72:
        return formatCOP(result.form_210_casillas?.c72_renta_liquida_gravable_capital ?? 0, false);
      case 73:
        return formatCOP(result.form_210_casillas?.c73_renta_liquida_ordinaria_capital ?? 0, false);
      case 74:
        return formatCOP(result.form_210_casillas?.c74_ingresos_brutos_nolaborales ?? 0, false);
      case 75:
        return formatCOP(result.form_210_casillas?.c75_devoluciones_nolaborales ?? 0, false);
      case 76:
        return formatCOP(result.form_210_casillas?.c76_incrngo_nolaborales ?? 0, false);
      case 77:
        return formatCOP(result.form_210_casillas?.c77_costos_deducciones_nolaborales ?? 0, false);
      case 78:
        return formatCOP(result.form_210_casillas?.c78_renta_liquida_nolaboral ?? 0, false);
      case 80:
        return formatCOP(0, false);
      case 81:
        return formatCOP(0, false);
      case 82:
        return formatCOP(0, false);
      case 83:
        return formatCOP(0, false);
      case 84:
        return formatCOP(0, false);
      case 85:
        return formatCOP(0, false);
      case 86:
        return formatCOP(0, false);
      case 87:
        return formatCOP(result.form_210_casillas?.c87_exentas_no_imputables_nolaboral ?? 0, false);
      case 88:
        return formatCOP(result.form_210_casillas?.c88_compensacion_perdidas_nolaboral ?? 0, false);
      case 89:
        return formatCOP(result.form_210_casillas?.c89_renta_liquida_gravable_nolaboral ?? 0, false);
      case 90:
        return formatCOP(result.form_210_casillas?.c90_renta_liquida_ordinaria_nolaboral ?? 0, false);
      case 91:
        return formatCOP(
          result.form_210_casillas?.c91_total_renta_liquida_ordinaria_cedula_general ??
            result.ingreso_neto,
          false
        );
      case 92:
        return formatCOP(
          result.form_210_casillas?.c92_total_rentas_exentas_deducciones_limitadas ??
            result.alivios_procedentes_finales,
          false
        );
      case 93:
        return formatCOP(
          result.form_210_casillas?.c93_renta_liquida_ordinaria_cedula_general ??
            result.renta_liquida_gravable,
          false
        );
      case 94:
        return formatCOP(0, false);
      case 95:
        return formatCOP(0, false);
      case 96:
        return formatCOP(0, false);
      case 97:
        return formatCOP(
          result.form_210_casillas?.c97_renta_liquida_gravable_cedula_general ??
            result.renta_liquida_gravable,
          false
        );
      case 98:
        return formatCOP(0, false);
      case 99:
        return formatCOP(0, false);
      case 100:
        return formatCOP(0, false);
      case 103:
        return formatCOP(0, false);
      case 104:
        return formatCOP(0, false);
      case 105:
        return formatCOP(0, false);
      case 107:
        return formatCOP(0, false);
      case 111:
        return formatCOP(
          result.form_210_casillas?.c111_total_rentas_liquidas_gravables ??
            result.renta_liquida_gravable,
          false
        );
      case 112:
        return formatCOP(
          result.total_ganancias_ocasionales_brutas ??
            result.form_210_casillas?.c112_ingresos_ganancias_ocasionales ??
            0,
          false
        );
      case 113:
        return formatCOP(
          result.costos_ganancia_ocasional ??
            result.form_210_casillas?.c113_costos_ganancias_ocasionales ??
            0,
          false
        );
      case 114:
        return formatCOP(
          result.ganancias_ocasionales_exentas_aceptadas ??
            result.form_210_casillas?.c114_ganancias_ocasionales_exentas ??
            0,
          false
        );
      case 115:
        return formatCOP(
          result.ganancia_ocasional_gravable ??
            result.form_210_casillas?.c115_ganancias_ocasionales_gravables ??
            0,
          false
        );
      case 116:
        return formatCOP(
          result.form_210_casillas?.c116_impuesto_rentas_liquidas_gravables ??
            result.impuesto_bruto_renta,
          false
        );
      case 118:
        return formatCOP(0, false);
      case 121:
        return formatCOP(
          result.form_210_casillas?.c108_impuesto_rentas_liquidas_gravables ??
            result.impuesto_bruto_renta,
          false
        );
      case 125:
        return formatCOP(result.descuentos_tributarios ?? 0, false);
      case 126:
        return formatCOP(
          result.form_210_casillas?.c126_impuesto_neto_renta ?? result.impuesto_neto_renta,
          false
        );
      case 127:
        return formatCOP(
          result.impuesto_ganancias_ocasionales ??
            result.form_210_casillas?.c127_impuesto_ganancias_ocasionales ??
            0,
          false
        );
      case 129:
        return formatCOP(
          result.total_impuesto_a_cargo ??
            result.form_210_casillas?.c129_total_impuesto_a_cargo ??
            result.impuesto_neto_renta,
          false
        );
      case 130:
        return formatCOP(result.form_210_casillas?.c130_anticipo_ano_anterior ?? 0, false);
      case 131:
        return formatCOP(result.form_210_casillas?.c131_saldo_a_favor_ano_anterior ?? 0, false);
      case 132:
        return formatCOP(
          result.form_210_casillas?.c132_retenciones_fuente ??
            result.total_anticipos_y_retenciones,
          false
        );
      case 133:
        return formatCOP(0, false);
      case 134:
        return formatCOP(
          result.form_210_casillas?.c136_saldo_a_pagar_por_impuesto ?? result.saldo_a_pagar,
          false
        );
      case 135:
        return formatCOP(0, false);
      case 136:
        return formatCOP(
          result.form_210_casillas?.c136_saldo_a_pagar_por_impuesto ?? result.saldo_a_pagar,
          false
        );
      case 137:
        return formatCOP(
          result.form_210_casillas?.c137_saldo_a_favor ?? result.saldo_a_favor,
          false
        );
      case 138:
        return String((result as any).dependientes_economicos_count || 1);
      case 139:
        return formatCOP((result as any).deduccion_dependientes_adicionales_72uvt || 0, false);
      case 140:
        return '0';
      case 141:
        return '0';
      case 980:
        return `$${formatCOP(result.saldo_a_pagar, false)}`;
      default:
        return typeof defaultVal === 'number' ? formatCOP(defaultVal, false) : String(defaultVal);
    }
  };

  const yearDigits = String(taxYear || 2025).split('');

  return (
    <div id="pane-pn-f210" className="module-pane active">
      {/* ACTION BAR */}
      <div className="facsimile-action-bar">
        <div>
          <h2 className="facsimile-title">
            <span>🏛️</span> Formulario 210 Oficial DIAN (Facsímil Idéntico)
          </h2>
          <p className="facsimile-subtitle">
            💡 <em>Facsímil oficial de la Declaración de Renta Personas Naturales. Haz clic en cualquier casilla <strong>[ i ]</strong> para consultar su instructivo legal y bases normativas del Estatuto Tributario.</em>
          </p>
        </div>
        <div className="facsimile-btn-group">
          <button
            id="btn-pn-print-f210"
            className="btn btn-export-primary btn-sm"
            onClick={() => triggerPrint({ isFacsimile: true })}
            title="Imprimir o guardar en PDF el Formulario 210 oficial DIAN ajustado a hoja completa"
          >
            <span>🖨️</span> Imprimir / Guardar Facsímil DIAN (PDF)
          </button>
          <button className="btn btn-outline btn-sm" onClick={onNavigateToCalc}>
            ✏️ Modificar Parámetros
          </button>
        </div>
      </div>

      {/* FORMULARIO 210 EXACT SHEET */}
      <div className="table-scroll-hint">
        <span>👉</span> Desliza horizontalmente para ver el Formulario 210 completo ➔
      </div>
      <div className="table-responsive">
        <div className="f210-sheet-wrapper">
          <div className="f210-watermark">DIAN 210</div>

          <table className="f210-table">
            <tbody>
              {/* HEADER ROW */}
              <tr>
                <td className="f210-header-cell-logo">
                  <div className="f210-dian-logo-svg">
                    <span style={{ letterSpacing: '-2px', fontWeight: 900, fontSize: '26px' }}>DIAN</span>
                  </div>
                </td>
                <td className="f210-header-title">
                  Declaración de renta y complementario
                  <br />
                  personas naturales y asimiladas residentes
                  <br />y sucesiones ilíquidas de causantes residentes
                </td>
                <td className="f210-header-privada">PRIVADA</td>
                <td className="f210-header-form-num">210</td>
              </tr>

              {/* METADATA ROW */}
              <tr>
                <td colSpan={2} className="f210-meta-cell">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700 }}>1. Año</span>
                    <div className="f210-digit-grid" id="f210-year-digits">
                      {yearDigits.map((d, idx) => (
                        <div key={idx} className="f210-digit-box">
                          {d}
                        </div>
                      ))}
                    </div>
                    <span style={{ fontSize: '8.5px', color: 'var(--text-muted)', marginLeft: '10px' }}>
                      Espacio reservado para la DIAN
                    </span>
                  </div>
                </td>
                <td colSpan={2} className="f210-meta-cell" style={{ textAlign: 'right', paddingRight: '8px' }}>
                  <div style={{ fontSize: '8px', fontWeight: 700 }}>4. Número de formulario:</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 800 }}>
                    2109999999999
                  </div>
                </td>
              </tr>

              {/* BARCODE ROW */}
              <tr>
                <td colSpan={4} style={{ padding: '2px 0' }}>
                  <div className="f210-barcode-container">
                    <div className="f210-barcode-stripes"></div>
                    <div className="f210-barcode-text">(415)7707212489984(8020) 000210999999999 9</div>
                  </div>
                </td>
              </tr>

              {/* DATOS DEL DECLARANTE */}
              <tr>
                <td colSpan={4} className="f210-section-title-cell">
                  Datos del declarante
                </td>
              </tr>
              <tr>
                <td colSpan={4} style={{ padding: '3px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '25%' }}>
                          <div style={{ fontSize: '7.5px', fontWeight: 700 }}>5. Número de Identificación Tributaria (NIT)</div>
                          <div className="f210-digit-grid" style={{ marginTop: '2px' }} id="f210-nit-digits">
                            {['9', '0', '0', '1', '2', '3', '4', '5', '6', '7'].map((d, i) => (
                              <div key={i} className="f210-digit-box">
                                {d}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={{ width: '5%' }}>
                          <div style={{ fontSize: '7.5px', fontWeight: 700 }}>6.DV</div>
                          <div className="f210-digit-box" id="f210-val-dv" style={{ marginTop: '2px' }}>
                            1
                          </div>
                        </td>
                        <td style={{ width: '17%' }}>
                          <div style={{ fontSize: '7.5px', fontWeight: 700 }}>7. Primer apellido</div>
                          <div style={{ fontWeight: 800, fontSize: '10px' }} id="f210-val-papellido">
                            NATURAL
                          </div>
                        </td>
                        <td style={{ width: '17%' }}>
                          <div style={{ fontSize: '7.5px', fontWeight: 700 }}>8. Segundo apellido</div>
                          <div style={{ fontWeight: 800, fontSize: '10px' }} id="f210-val-sapellido">
                            DEMO
                          </div>
                        </td>
                        <td style={{ width: '18%' }}>
                          <div style={{ fontSize: '7.5px', fontWeight: 700 }}>9. Primer nombre</div>
                          <div style={{ fontWeight: 800, fontSize: '10px' }} id="f210-val-pnombre">
                            CONTRIBUYENTE
                          </div>
                        </td>
                        <td style={{ width: '18%' }}>
                          <div style={{ fontSize: '7.5px', fontWeight: 700 }}>10. Otros nombres</div>
                          <div style={{ fontWeight: 800, fontSize: '10px' }} id="f210-val-onombre">
                            PERSONA
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* ACTIVIDAD ECONOMICA Y COMPRAS FE */}
              <tr>
                <td colSpan={4} style={{ padding: '2px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '25%' }}>
                          <span>24. Actividad económica principal: </span>
                          <strong style={{ fontFamily: 'var(--font-mono)' }}>0010</strong>
                        </td>
                        <td style={{ width: '20%' }}>
                          <span>12. Cód. Dirección seccional: </span>
                          <strong style={{ fontFamily: 'var(--font-mono)' }}>32</strong>
                        </td>
                        <td style={{ width: '55%', textAlign: 'right' }}>
                          <span style={{ verticalAlign: 'middle' }}>28. Uno por ciento (1%) de compras con factura electrónica: </span>
                          <span
                            className="f210-casilla-num"
                            data-casilla="28"
                            onClick={(e) => handleCasillaClick(28, e)}
                            style={{ display: 'inline-block', verticalAlign: 'middle', width: '25px', height: '16px', lineHeight: '16px', margin: '0 3px' }}
                          >
                            <span className="f210-info-badge">i</span>28
                          </span>
                          <span
                            className="f210-casilla-val"
                            id="f210_val_c28"
                            style={{ display: 'inline-block', verticalAlign: 'middle', border: '1px solid var(--border-strong)', height: '16px', lineHeight: '16px' }}
                          >
                            {getCasillaValue(28, 150000)}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* PATRIMONIO HEADER & ROW */}
              <tr>
                <td className="f210-section-label">Patrimonio</td>
                <td colSpan={3} style={{ padding: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '2px 4px' }}>Total patrimonio bruto</td>
                        <td className="f210-casilla-num" data-casilla="29" onClick={(e) => handleCasillaClick(29, e)}>
                          <span className="f210-info-badge">i</span>29
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c29">
                          {getCasillaValue(29, 300000000)}
                        </td>
                        <td style={{ padding: '2px 4px' }}>Deudas</td>
                        <td className="f210-casilla-num" data-casilla="30" onClick={(e) => handleCasillaClick(30, e)}>
                          <span className="f210-info-badge">i</span>30
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c30">
                          {getCasillaValue(30, 80000000)}
                        </td>
                        <td style={{ padding: '2px 4px' }}>
                          <strong>Total patrimonio líquido</strong>
                        </td>
                        <td className="f210-casilla-num" data-casilla="31" onClick={(e) => handleCasillaClick(31, e)}>
                          <span className="f210-info-badge">i</span>31
                        </td>
                        <td className="f210-casilla-val calc-highlight" id="f210_val_c31">
                          {getCasillaValue(31, 220000000)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* CÉDULA GENERAL - TABLA MATRIX 4 COLUMNAS */}
              <tr>
                <td colSpan={4} className="f210-section-title-cell" style={{ textAlign: 'center' }}>
                  Cédula General (Art. 330 a 336 E.T.)
                </td>
              </tr>
              <tr>
                <td colSpan={4} style={{ padding: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px' }}>
                    <tbody>
                      <tr className="f210-col-headers">
                        <td style={{ width: '18%' }}>Conceptos / Rentas</td>
                        <td style={{ width: '20%' }} colSpan={2}>
                          Rentas de trabajo
                        </td>
                        <td style={{ width: '20%' }} colSpan={2}>
                          Rentas trabajo no rel. laboral
                        </td>
                        <td style={{ width: '21%' }} colSpan={2}>
                          Rentas de capital
                        </td>
                        <td style={{ width: '21%' }} colSpan={2}>
                          Rentas no laborales
                        </td>
                      </tr>

                      {/* INGRESOS BRUTOS */}
                      <tr>
                        <td>Ingresos brutos</td>
                        <td className="f210-casilla-num" data-casilla="32" onClick={(e) => handleCasillaClick(32, e)}>
                          <span className="f210-info-badge">i</span>32
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c32">
                          {getCasillaValue(32, 120000000)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="43" onClick={(e) => handleCasillaClick(43, e)}>
                          <span className="f210-info-badge">i</span>43
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(43, 0)}</td>
                        <td className="f210-casilla-num" data-casilla="58" onClick={(e) => handleCasillaClick(58, e)}>
                          <span className="f210-info-badge">i</span>58
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c58">
                          {getCasillaValue(58, 0)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="74" onClick={(e) => handleCasillaClick(74, e)}>
                          <span className="f210-info-badge">i</span>74
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c74">
                          {getCasillaValue(74, 0)}
                        </td>
                      </tr>

                      {/* DEVOLUCIONES */}
                      <tr>
                        <td>Devoluciones, rebajas y desc.</td>
                        <td colSpan={2} className="f210-empty-cell"></td>
                        <td colSpan={2} className="f210-empty-cell"></td>
                        <td colSpan={2} className="f210-empty-cell"></td>
                        <td className="f210-casilla-num" data-casilla="75" onClick={(e) => handleCasillaClick(75, e)}>
                          <span className="f210-info-badge">i</span>75
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c75">
                          {getCasillaValue(75, 0)}
                        </td>
                      </tr>

                      {/* INCRNGO */}
                      <tr>
                        <td>Ingresos no constitutivos de renta</td>
                        <td className="f210-casilla-num" data-casilla="33" onClick={(e) => handleCasillaClick(33, e)}>
                          <span className="f210-info-badge">i</span>33
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c33">
                          {getCasillaValue(33, 9600000)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="44" onClick={(e) => handleCasillaClick(44, e)}>
                          <span className="f210-info-badge">i</span>44
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(44, 0)}</td>
                        <td className="f210-casilla-num" data-casilla="59" onClick={(e) => handleCasillaClick(59, e)}>
                          <span className="f210-info-badge">i</span>59
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c59">
                          {getCasillaValue(59, 0)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="76" onClick={(e) => handleCasillaClick(76, e)}>
                          <span className="f210-info-badge">i</span>76
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c76">
                          {getCasillaValue(76, 0)}
                        </td>
                      </tr>

                      {/* COSTOS */}
                      <tr>
                        <td>Costos y deducciones procedentes</td>
                        <td colSpan={2} className="f210-empty-cell"></td>
                        <td className="f210-casilla-num" data-casilla="45" onClick={(e) => handleCasillaClick(45, e)}>
                          <span className="f210-info-badge">i</span>45
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c45">
                          {getCasillaValue(45, 0)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="60" onClick={(e) => handleCasillaClick(60, e)}>
                          <span className="f210-info-badge">i</span>60
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c60">
                          {getCasillaValue(60, 0)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="77" onClick={(e) => handleCasillaClick(77, e)}>
                          <span className="f210-info-badge">i</span>77
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c77">
                          {getCasillaValue(77, 0)}
                        </td>
                      </tr>

                      {/* RENTA LIQUIDA PREVIA */}
                      <tr className="f210-highlight-row">
                        <td>Renta líquida</td>
                        <td className="f210-casilla-num" data-casilla="34" onClick={(e) => handleCasillaClick(34, e)}>
                          <span className="f210-info-badge">i</span>34
                        </td>
                        <td className="f210-casilla-val calc-highlight" id="f210_val_c34">
                          {getCasillaValue(34, 110400000)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="46" onClick={(e) => handleCasillaClick(46, e)}>
                          <span className="f210-info-badge">i</span>46
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(46, 0)}</td>
                        <td className="f210-casilla-num" data-casilla="61" onClick={(e) => handleCasillaClick(61, e)}>
                          <span className="f210-info-badge">i</span>61
                        </td>
                        <td className="f210-casilla-val calc-highlight" id="f210_val_c61">
                          {getCasillaValue(61, 0)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="78" onClick={(e) => handleCasillaClick(78, e)}>
                          <span className="f210-info-badge">i</span>78
                        </td>
                        <td className="f210-casilla-val calc-highlight" id="f210_val_c78">
                          {getCasillaValue(78, 0)}
                        </td>
                      </tr>

                      {/* RENTAS EXENTAS SUB-BLOCK */}
                      <tr>
                        <td>Aportes voluntarios AFC, FVP y AVC</td>
                        <td className="f210-casilla-num" data-casilla="35" onClick={(e) => handleCasillaClick(35, e)}>
                          <span className="f210-info-badge">i</span>35
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c35">
                          {getCasillaValue(35, 10000000)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="47" onClick={(e) => handleCasillaClick(47, e)}>
                          <span className="f210-info-badge">i</span>47
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(47, 0)}</td>
                        <td className="f210-casilla-num" data-casilla="63" onClick={(e) => handleCasillaClick(63, e)}>
                          <span className="f210-info-badge">i</span>63
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c63">
                          {getCasillaValue(63, 0)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="80" onClick={(e) => handleCasillaClick(80, e)}>
                          <span className="f210-info-badge">i</span>80
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c80">
                          {getCasillaValue(80, 0)}
                        </td>
                      </tr>
                      <tr>
                        <td>Otras rentas exentas (25% laboral)</td>
                        <td className="f210-casilla-num" data-casilla="36" onClick={(e) => handleCasillaClick(36, e)}>
                          <span className="f210-info-badge">i</span>36
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c36">
                          {getCasillaValue(36, 19100000)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="48" onClick={(e) => handleCasillaClick(48, e)}>
                          <span className="f210-info-badge">i</span>48
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(48, 0)}</td>
                        <td className="f210-casilla-num" data-casilla="64" onClick={(e) => handleCasillaClick(64, e)}>
                          <span className="f210-info-badge">i</span>64
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c64">
                          {getCasillaValue(64, 0)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="81" onClick={(e) => handleCasillaClick(81, e)}>
                          <span className="f210-info-badge">i</span>81
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c81">
                          {getCasillaValue(81, 0)}
                        </td>
                      </tr>
                      <tr className="f210-highlight-row">
                        <td>Total rentas exentas</td>
                        <td className="f210-casilla-num" data-casilla="37" onClick={(e) => handleCasillaClick(37, e)}>
                          <span className="f210-info-badge">i</span>37
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c37">
                          {getCasillaValue(37, 29100000)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="49" onClick={(e) => handleCasillaClick(49, e)}>
                          <span className="f210-info-badge">i</span>49
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(49, 0)}</td>
                        <td className="f210-casilla-num" data-casilla="65" onClick={(e) => handleCasillaClick(65, e)}>
                          <span className="f210-info-badge">i</span>65
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c65">
                          {getCasillaValue(65, 0)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="82" onClick={(e) => handleCasillaClick(82, e)}>
                          <span className="f210-info-badge">i</span>82
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c82">
                          {getCasillaValue(82, 0)}
                        </td>
                      </tr>

                      {/* DEDUCCIONES SUB-BLOCK */}
                      <tr>
                        <td>Intereses de vivienda</td>
                        <td className="f210-casilla-num" data-casilla="38" onClick={(e) => handleCasillaClick(38, e)}>
                          <span className="f210-info-badge">i</span>38
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c38">
                          {getCasillaValue(38, 12000000)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="50" onClick={(e) => handleCasillaClick(50, e)}>
                          <span className="f210-info-badge">i</span>50
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(50, 0)}</td>
                        <td className="f210-casilla-num" data-casilla="66" onClick={(e) => handleCasillaClick(66, e)}>
                          <span className="f210-info-badge">i</span>66
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c66">
                          {getCasillaValue(66, 0)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="83" onClick={(e) => handleCasillaClick(83, e)}>
                          <span className="f210-info-badge">i</span>83
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c83">
                          {getCasillaValue(83, 0)}
                        </td>
                      </tr>
                      <tr>
                        <td>Otras deducciones imputables</td>
                        <td className="f210-casilla-num" data-casilla="39" onClick={(e) => handleCasillaClick(39, e)}>
                          <span className="f210-info-badge">i</span>39
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c39">
                          {getCasillaValue(39, 0)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="51" onClick={(e) => handleCasillaClick(51, e)}>
                          <span className="f210-info-badge">i</span>51
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(51, 0)}</td>
                        <td className="f210-casilla-num" data-casilla="67" onClick={(e) => handleCasillaClick(67, e)}>
                          <span className="f210-info-badge">i</span>67
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c67">
                          {getCasillaValue(67, 0)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="84" onClick={(e) => handleCasillaClick(84, e)}>
                          <span className="f210-info-badge">i</span>84
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c84">
                          {getCasillaValue(84, 0)}
                        </td>
                      </tr>
                      <tr className="f210-highlight-row">
                        <td>Total deducciones imputables</td>
                        <td className="f210-casilla-num" data-casilla="40" onClick={(e) => handleCasillaClick(40, e)}>
                          <span className="f210-info-badge">i</span>40
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c40">
                          {getCasillaValue(40, 24150000)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="52" onClick={(e) => handleCasillaClick(52, e)}>
                          <span className="f210-info-badge">i</span>52
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(52, 0)}</td>
                        <td className="f210-casilla-num" data-casilla="68" onClick={(e) => handleCasillaClick(68, e)}>
                          <span className="f210-info-badge">i</span>68
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c68">
                          {getCasillaValue(68, 0)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="85" onClick={(e) => handleCasillaClick(85, e)}>
                          <span className="f210-info-badge">i</span>85
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c85">
                          {getCasillaValue(85, 0)}
                        </td>
                      </tr>

                      {/* ALIVIOS LIMITADOS Y CALCULOS INTERMEDIOS */}
                      <tr className="f210-warning-row">
                        <td>Rentas exentas y/o deduc. limitadas</td>
                        <td className="f210-casilla-num" data-casilla="41" onClick={(e) => handleCasillaClick(41, e)}>
                          <span className="f210-info-badge">i</span>41
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c41">
                          {getCasillaValue(41, 44160000)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="53" onClick={(e) => handleCasillaClick(53, e)}>
                          <span className="f210-info-badge">i</span>53
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(53, 0)}</td>
                        <td className="f210-casilla-num" data-casilla="69" onClick={(e) => handleCasillaClick(69, e)}>
                          <span className="f210-info-badge">i</span>69
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c69">
                          {getCasillaValue(69, 0)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="86" onClick={(e) => handleCasillaClick(86, e)}>
                          <span className="f210-info-badge">i</span>86
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c86">
                          {getCasillaValue(86, 0)}
                        </td>
                      </tr>
                      <tr>
                        <td>Rentas exentas y deduc. no imputables</td>
                        <td colSpan={2} className="f210-empty-cell"></td>
                        <td className="f210-casilla-num" data-casilla="54" onClick={(e) => handleCasillaClick(54, e)}>
                          <span className="f210-info-badge">i</span>54
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(54, 0)}</td>
                        <td className="f210-casilla-num" data-casilla="70" onClick={(e) => handleCasillaClick(70, e)}>
                          <span className="f210-info-badge">i</span>70
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c70">
                          {getCasillaValue(70, 0)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="87" onClick={(e) => handleCasillaClick(87, e)}>
                          <span className="f210-info-badge">i</span>87
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c87">
                          {getCasillaValue(87, 0)}
                        </td>
                      </tr>
                      <tr>
                        <td>Compensación por pérdidas</td>
                        <td colSpan={2} className="f210-empty-cell"></td>
                        <td className="f210-casilla-num" data-casilla="55" onClick={(e) => handleCasillaClick(55, e)}>
                          <span className="f210-info-badge">i</span>55
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(55, 0)}</td>
                        <td className="f210-casilla-num" data-casilla="71" onClick={(e) => handleCasillaClick(71, e)}>
                          <span className="f210-info-badge">i</span>71
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c71">
                          {getCasillaValue(71, 0)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="88" onClick={(e) => handleCasillaClick(88, e)}>
                          <span className="f210-info-badge">i</span>88
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c88">
                          {getCasillaValue(88, 0)}
                        </td>
                      </tr>
                      <tr className="f210-highlight-row">
                        <td>Renta líquida gravable de la subcédula</td>
                        <td colSpan={2} className="f210-empty-cell"></td>
                        <td className="f210-casilla-num" data-casilla="56" onClick={(e) => handleCasillaClick(56, e)}>
                          <span className="f210-info-badge">i</span>56
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(56, 0)}</td>
                        <td className="f210-casilla-num" data-casilla="72" onClick={(e) => handleCasillaClick(72, e)}>
                          <span className="f210-info-badge">i</span>72
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c72">
                          {getCasillaValue(72, 0)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="89" onClick={(e) => handleCasillaClick(89, e)}>
                          <span className="f210-info-badge">i</span>89
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c89">
                          {getCasillaValue(89, 0)}
                        </td>
                      </tr>
                      {/* RENTA LIQUIDA ORDINARIA FINAL DE LA SUBCÉDULA */}
                      <tr className="f210-subtotal-row">
                        <td>Renta líquida ordinaria / subcédula</td>
                        <td className="f210-casilla-num" data-casilla="42" onClick={(e) => handleCasillaClick(42, e)}>
                          <span className="f210-info-badge">i</span>42
                        </td>
                        <td className="f210-casilla-val calc-highlight" id="f210_val_c42">
                          {getCasillaValue(42, 66240000)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="57" onClick={(e) => handleCasillaClick(57, e)}>
                          <span className="f210-info-badge">i</span>57
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(57, 0)}</td>
                        <td className="f210-casilla-num" data-casilla="73" onClick={(e) => handleCasillaClick(73, e)}>
                          <span className="f210-info-badge">i</span>73
                        </td>
                        <td className="f210-casilla-val calc-highlight" id="f210_val_c73">
                          {getCasillaValue(73, 0)}
                        </td>
                        <td className="f210-casilla-num" data-casilla="90" onClick={(e) => handleCasillaClick(90, e)}>
                          <span className="f210-info-badge">i</span>90
                        </td>
                        <td className="f210-casilla-val calc-highlight" id="f210_val_c90">
                          {getCasillaValue(90, 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* TOTALES CÉDULA GENERAL (Casillas 91 a 98) */}
              <tr>
                <td colSpan={4} style={{ padding: 0 }}>
                  <table className="f210-totals-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '2px 4px' }}>
                          <strong>Ren. líquida céd. gen.</strong>
                        </td>
                        <td className="f210-casilla-num" data-casilla="91" onClick={(e) => handleCasillaClick(91, e)}>
                          <span className="f210-info-badge">i</span>91
                        </td>
                        <td className="f210-casilla-val" style={{ fontWeight: 800 }} id="f210_val_c91">
                          {getCasillaValue(91, 110400000)}
                        </td>

                        <td style={{ padding: '2px 4px' }}>
                          <strong>Ren. ex. y ded. imp. li.</strong>
                        </td>
                        <td className="f210-casilla-num" data-casilla="92" onClick={(e) => handleCasillaClick(92, e)}>
                          <span className="f210-info-badge">i</span>92
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c92">
                          {getCasillaValue(92, 44160000)}
                        </td>

                        <td style={{ padding: '2px 4px' }}>
                          <strong>R. líq. ord. cédula gen.</strong>
                        </td>
                        <td className="f210-casilla-num" data-casilla="93" onClick={(e) => handleCasillaClick(93, e)}>
                          <span className="f210-info-badge">i</span>93
                        </td>
                        <td className="f210-casilla-val calc-highlight" id="f210_val_c93">
                          {getCasillaValue(93, 66240000)}
                        </td>

                        <td style={{ padding: '2px 4px' }}>Comp. pérdidas año 2018</td>
                        <td className="f210-casilla-num" data-casilla="94" onClick={(e) => handleCasillaClick(94, e)}>
                          <span className="f210-info-badge">i</span>94
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(94, 0)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 4px' }}>Comp. exc. ren. presuntiva</td>
                        <td className="f210-casilla-num" data-casilla="95" onClick={(e) => handleCasillaClick(95, e)}>
                          <span className="f210-info-badge">i</span>95
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(95, 0)}</td>

                        <td style={{ padding: '2px 4px' }}>Rentas gravables</td>
                        <td className="f210-casilla-num" data-casilla="96" onClick={(e) => handleCasillaClick(96, e)}>
                          <span className="f210-info-badge">i</span>96
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(96, 0)}</td>

                        <td style={{ padding: '2px 4px' }}>
                          <strong>R. líq. grav. cédula gen.</strong>
                        </td>
                        <td className="f210-casilla-num" data-casilla="97" onClick={(e) => handleCasillaClick(97, e)}>
                          <span className="f210-info-badge">i</span>97
                        </td>
                        <td className="f210-casilla-val calc-highlight" style={{ fontWeight: 800 }} id="f210_val_c97">
                          {getCasillaValue(97, 66240000)}
                        </td>

                        <td style={{ padding: '2px 4px' }}>Renta presuntiva</td>
                        <td className="f210-casilla-num" data-casilla="98" onClick={(e) => handleCasillaClick(98, e)}>
                          <span className="f210-info-badge">i</span>98
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(98, 0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* 2-COLUMN SPLIT: LEFT (PENSIONES, DIVIDENDOS, GO) vs RIGHT (LIQUIDACIÓN PRIVADA) */}
              <tr>
                {/* COLUMNA IZQUIERDA */}
                <td colSpan={2} style={{ verticalAlign: 'top', padding: 0, width: '50%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px' }}>
                    <tbody>
                      {/* PENSIONES */}
                      <tr>
                        <td colSpan={3} className="f210-section-title-cell">
                          Cédula de Pensiones
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 4px' }}>Ingresos brutos por rentas de pensiones</td>
                        <td className="f210-casilla-num" data-casilla="99" onClick={(e) => handleCasillaClick(99, e)}>
                          <span className="f210-info-badge">i</span>99
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(99, 0)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 4px' }}>Ingresos no constitutivos de renta</td>
                        <td className="f210-casilla-num" data-casilla="100" onClick={(e) => handleCasillaClick(100, e)}>
                          <span className="f210-info-badge">i</span>100
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(100, 0)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 4px' }}>Renta líquida gravable cédula de pensiones</td>
                        <td className="f210-casilla-num" data-casilla="103" onClick={(e) => handleCasillaClick(103, e)}>
                          <span className="f210-info-badge">i</span>103
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(103, 0)}</td>
                      </tr>

                      {/* DIVIDENDOS */}
                      <tr>
                        <td colSpan={3} className="f210-section-title-cell">
                          Cédula de Dividendos y Participaciones
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 4px' }}>Dividendos y participaciones 2016 y anteriores</td>
                        <td className="f210-casilla-num" data-casilla="104" onClick={(e) => handleCasillaClick(104, e)}>
                          <span className="f210-info-badge">i</span>104
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(104, 0)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 4px' }}>Ingresos no constitutivos de renta</td>
                        <td className="f210-casilla-num" data-casilla="105" onClick={(e) => handleCasillaClick(105, e)}>
                          <span className="f210-info-badge">i</span>105
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(105, 0)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 4px' }}>Subcédula año 2017 y siguientes numeral 3 art. 49</td>
                        <td className="f210-casilla-num" data-casilla="107" onClick={(e) => handleCasillaClick(107, e)}>
                          <span className="f210-info-badge">i</span>107
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(107, 0)}</td>
                      </tr>

                      {/* RENTA LIQUIDA GRAVABLE ART 241 */}
                      <tr className="f210-subtotal-row">
                        <td style={{ padding: '2px 4px' }}>Renta líquida gravable (Cédula general + Pensiones, art. 241 E.T.)</td>
                        <td className="f210-casilla-num" data-casilla="111" onClick={(e) => handleCasillaClick(111, e)}>
                          <span className="f210-info-badge">i</span>111
                        </td>
                        <td className="f210-casilla-val calc-highlight" id="f210_val_c111">
                          {getCasillaValue(111, 66240000)}
                        </td>
                      </tr>

                      {/* GANANCIAS OCASIONALES */}
                      <tr>
                        <td colSpan={3} className="f210-section-title-cell">
                          Ganancias Ocasionales (Art. 300 a 317 E.T.)
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 4px' }}>Ingresos por ganancias ocasionales país y exterior</td>
                        <td className="f210-casilla-num" data-casilla="112" onClick={(e) => handleCasillaClick(112, e)}>
                          <span className="f210-info-badge">i</span>112
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c112">
                          {getCasillaValue(112, 0)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 4px' }}>Costos por ganancias ocasionales</td>
                        <td className="f210-casilla-num" data-casilla="113" onClick={(e) => handleCasillaClick(113, e)}>
                          <span className="f210-info-badge">i</span>113
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c113">
                          {getCasillaValue(113, 0)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 4px' }}>Ganancias ocasionales no gravadas y exentas (Art. 307)</td>
                        <td className="f210-casilla-num" data-casilla="114" onClick={(e) => handleCasillaClick(114, e)}>
                          <span className="f210-info-badge">i</span>114
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c114">
                          {getCasillaValue(114, 0)}
                        </td>
                      </tr>
                      <tr className="f210-warning-row">
                        <td style={{ padding: '2px 4px' }}>Ganancias ocasionales gravables (112 &minus; 113 &minus; 114)</td>
                        <td className="f210-casilla-num" data-casilla="115" onClick={(e) => handleCasillaClick(115, e)}>
                          <span className="f210-info-badge">i</span>115
                        </td>
                        <td className="f210-casilla-val calc-highlight" id="f210_val_c115">
                          {getCasillaValue(115, 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>

                {/* COLUMNA DERECHA */}
                <td colSpan={2} style={{ verticalAlign: 'top', padding: 0, width: '50%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px' }}>
                    <tbody>
                      <tr>
                        <td colSpan={3} className="f210-section-title-cell">
                          Liquidación Privada
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 4px' }}>Cédula general, de pensiones y de dividendos</td>
                        <td className="f210-casilla-num" data-casilla="116" onClick={(e) => handleCasillaClick(116, e)}>
                          <span className="f210-info-badge">i</span>116
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c116">
                          {getCasillaValue(116, 1745000)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 4px' }}>Por dividendos y participaciones año 2017 y siguientes</td>
                        <td className="f210-casilla-num" data-casilla="118" onClick={(e) => handleCasillaClick(118, e)}>
                          <span className="f210-info-badge">i</span>118
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(118, 0)}</td>
                      </tr>
                      <tr className="f210-highlight-row">
                        <td style={{ padding: '2px 4px' }}>Total impuesto sobre las rentas líquidas gravables</td>
                        <td className="f210-casilla-num" data-casilla="121" onClick={(e) => handleCasillaClick(121, e)}>
                          <span className="f210-info-badge">i</span>121
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c121">
                          {getCasillaValue(121, 1745000)}
                        </td>
                      </tr>

                      {/* DESCUENTOS */}
                      <tr>
                        <td style={{ padding: '2px 4px' }}>Donaciones y otros descuentos tributarios</td>
                        <td className="f210-casilla-num" data-casilla="125" onClick={(e) => handleCasillaClick(125, e)}>
                          <span className="f210-info-badge">i</span>125
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(125, 0)}</td>
                      </tr>
                      <tr className="f210-highlight-row">
                        <td style={{ padding: '2px 4px' }}>Impuesto neto de renta (121 &minus; 125)</td>
                        <td className="f210-casilla-num" data-casilla="126" onClick={(e) => handleCasillaClick(126, e)}>
                          <span className="f210-info-badge">i</span>126
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c126">
                          {getCasillaValue(126, 1745000)}
                        </td>
                      </tr>

                      {/* IMPUESTO GANANCIA OCASIONAL */}
                      <tr>
                        <td style={{ padding: '2px 4px' }}>Impuesto de ganancias ocasionales (115 * 15%/20%)</td>
                        <td className="f210-casilla-num" data-casilla="127" onClick={(e) => handleCasillaClick(127, e)}>
                          <span className="f210-info-badge">i</span>127
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c127">
                          {getCasillaValue(127, 0)}
                        </td>
                      </tr>
                      <tr className="f210-subtotal-row">
                        <td style={{ padding: '2px 4px' }}>
                          <strong>Total impuesto a cargo (126 + 127)</strong>
                        </td>
                        <td className="f210-casilla-num" data-casilla="129" onClick={(e) => handleCasillaClick(129, e)}>
                          <span className="f210-info-badge">i</span>129
                        </td>
                        <td className="f210-casilla-val calc-highlight" id="f210_val_c129">
                          {getCasillaValue(129, 1745000)}
                        </td>
                      </tr>

                      {/* RETENCIONES Y ANTICIPOS */}
                      <tr>
                        <td style={{ padding: '2px 4px' }}>Anticipo renta liquidado año gravable anterior</td>
                        <td className="f210-casilla-num" data-casilla="130" onClick={(e) => handleCasillaClick(130, e)}>
                          <span className="f210-info-badge">i</span>130
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c130">
                          {getCasillaValue(130, 0)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 4px' }}>Saldo a favor año anterior sin solicitud devolución</td>
                        <td className="f210-casilla-num" data-casilla="131" onClick={(e) => handleCasillaClick(131, e)}>
                          <span className="f210-info-badge">i</span>131
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c131">
                          {getCasillaValue(131, 0)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 4px' }}>Retenciones año gravable a declarar</td>
                        <td className="f210-casilla-num" data-casilla="132" onClick={(e) => handleCasillaClick(132, e)}>
                          <span className="f210-info-badge">i</span>132
                        </td>
                        <td className="f210-casilla-val" id="f210_val_c132">
                          {getCasillaValue(132, 5000000)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 4px' }}>Anticipo renta para el año gravable siguiente</td>
                        <td className="f210-casilla-num" data-casilla="133" onClick={(e) => handleCasillaClick(133, e)}>
                          <span className="f210-info-badge">i</span>133
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(133, 0)}</td>
                      </tr>

                      {/* SALDO A PAGAR / SALDO A FAVOR FINAL */}
                      <tr className="f210-totaltopay-row">
                        <td style={{ padding: '2px 4px' }}>
                          <strong>Saldo a pagar por impuesto</strong>
                        </td>
                        <td className="f210-casilla-num" data-casilla="134" onClick={(e) => handleCasillaClick(134, e)}>
                          <span className="f210-info-badge">i</span>134
                        </td>
                        <td className="f210-casilla-val total-to-pay" id="f210_val_c134">
                          {getCasillaValue(134, 0)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 4px' }}>Sanciones</td>
                        <td className="f210-casilla-num" data-casilla="135" onClick={(e) => handleCasillaClick(135, e)}>
                          <span className="f210-info-badge">i</span>135
                        </td>
                        <td className="f210-casilla-val">{getCasillaValue(135, 0)}</td>
                      </tr>
                      <tr className="f210-totaltopay-row">
                        <td style={{ padding: '2px 4px' }}>
                          <strong>Total saldo a pagar (134 + 135)</strong>
                        </td>
                        <td className="f210-casilla-num" data-casilla="136" onClick={(e) => handleCasillaClick(136, e)}>
                          <span className="f210-info-badge">i</span>136
                        </td>
                        <td className="f210-casilla-val total-to-pay" id="f210_val_c136">
                          {getCasillaValue(136, 0)}
                        </td>
                      </tr>
                      <tr className="f210-favorable-row">
                        <td style={{ padding: '2px 4px' }}>Total saldo a favor</td>
                        <td className="f210-casilla-num" data-casilla="137" onClick={(e) => handleCasillaClick(137, e)}>
                          <span className="f210-info-badge">i</span>137
                        </td>
                        <td className="f210-casilla-val" style={{ color: 'var(--emerald)', fontWeight: 800 }} id="f210_val_c137">
                          {getCasillaValue(137, 3255000)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* DEPENDIENTES BAR (Casillas 138 a 141) */}
              <tr>
                <td colSpan={4} style={{ padding: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '2px 4px' }}>Número de dependientes económicos</td>
                        <td className="f210-casilla-num" data-casilla="138" onClick={(e) => handleCasillaClick(138, e)}>
                          <span className="f210-info-badge">i</span>138
                        </td>
                        <td className="f210-casilla-val" style={{ textAlign: 'center' }} id="f210_val_c138">
                          {getCasillaValue(138, 1)}
                        </td>
                        <td style={{ padding: '2px 4px' }}>Adición por dependientes a la casilla 92</td>
                        <td className="f210-casilla-num" data-casilla="139" onClick={(e) => handleCasillaClick(139, e)}>
                          <span className="f210-info-badge">i</span>139
                        </td>
                        <td className="f210-casilla-val" style={{ textAlign: 'center' }}>
                          {getCasillaValue(139, 0)}
                        </td>
                        <td style={{ padding: '2px 4px' }}>Ud. superó tope indicativo art. 336-1 E.T., marque X</td>
                        <td className="f210-casilla-num" data-casilla="140" onClick={(e) => handleCasillaClick(140, e)}>
                          <span className="f210-info-badge">i</span>140
                        </td>
                        <td className="f210-casilla-val" style={{ textAlign: 'center' }}>
                          0
                        </td>
                        <td style={{ padding: '2px 4px' }}>Aporte voluntario</td>
                        <td className="f210-casilla-num" data-casilla="141" onClick={(e) => handleCasillaClick(141, e)}>
                          <span className="f210-info-badge">i</span>141
                        </td>
                        <td className="f210-casilla-val" style={{ textAlign: 'center' }}>
                          0
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* SIGNATURE & DIGITAL SEAL FOOTER */}
              <tr>
                <td colSpan={4} style={{ padding: '4px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '30%', borderRight: '1px solid var(--border-subtle)', padding: '4px' }}>
                          <div style={{ fontSize: '7.5px', color: 'var(--text-muted)' }}>981. Cód. Representación: [ ]</div>
                          <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center', fontWeight: 700, fontSize: '8px' }}>
                            Firma del declarante o de quien lo representa
                          </div>
                        </td>
                        <td style={{ width: '35%', borderRight: '1px solid var(--border-subtle)', padding: '4px', textAlign: 'center' }}>
                          <div className="f210-digital-stamp">
                            <span>DIAN</span>
                            <span style={{ fontSize: '6px' }}>Fecha Acuse</span>
                            <span style={{ fontSize: '7px', fontWeight: 900 }}>• Firmado •</span>
                          </div>
                          <div style={{ fontSize: '7.5px', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                            2026-08-14 / 08:30:00 AM
                          </div>
                        </td>
                        <td style={{ width: '35%', padding: '4px' }}>
                          <div className="f210-signature-box">
                            <div style={{ fontSize: '8.5px', fontWeight: 800, color: 'var(--primary)' }}>
                              <span
                                className="f210-casilla-num"
                                data-casilla="980"
                                onClick={(e) => handleCasillaClick(980, e)}
                                style={{ display: 'inline-block', width: '28px', height: '16px', marginRight: '4px' }}
                              >
                                <span className="f210-info-badge">i</span>980
                              </span>
                              PAGO TOTAL $
                            </div>
                            <div
                              style={{ fontSize: '16px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}
                              id="f210_val_c980"
                            >
                              {getCasillaValue(980, 0)}
                            </div>
                          </div>
                          <div style={{ fontSize: '7px', textAlign: 'right', marginTop: '4px', color: 'var(--text-muted)' }}>
                            996. Espacio adhesivo DIAN: 9900000000001
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '8px',
              color: '#64748b',
              marginTop: '4px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span>Formulario 210 DIAN - Versión Oficial Certificada</span>
            <span>Serie: 20269999999999</span>
          </div>
        </div>
      </div>
    </div>
  );
};
