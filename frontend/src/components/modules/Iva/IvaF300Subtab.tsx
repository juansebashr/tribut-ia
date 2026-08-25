import React from 'react';
import type { IvaF300Output } from '../../../types/tax';
import { useApp } from '../../../context/AppContext';
import { formatCOP } from '../../../utils/formatters';

interface IvaF300SubtabProps {
  result: IvaF300Output | null;
  onNavigateToCalc: () => void;
}

export const IvaF300Subtab: React.FC<IvaF300SubtabProps> = ({ result, onNavigateToCalc }) => {
  const { showCasillaPopover, taxYear } = useApp();

  const handleCasillaClick = (num: number | string, e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    showCasillaPopover(num, e.currentTarget, '300');
  };

  const getCasillaValue = (num: number, defaultVal: number | string = 0): string => {
    if (!result || !result.casillas) {
      return typeof defaultVal === 'number' ? formatCOP(defaultVal, false) : String(defaultVal);
    }
    const c = result.casillas;

    const mapping: Record<number, number | string> = {
      1: c.ano || taxYear || 2026,
      2: c.periodo || 1,
      4: c.numero_formulario || '3002026010001',
      5: c.nit || '900123456',
      6: c.dv || '7',
      11: c.razon_social || 'DISTRIBUIDORA Y SERVICIOS INTEGRALES S.A.S.',
      12: c.cod_direccion_seccional || 32,
      24: c.actividad_economica || '4711',
      27: c.c27_ingresos_bienes_gravados_5,
      28: c.c28_ingresos_bienes_gravados_19,
      29: c.c29_ingresos_servicios_gravados_5,
      30: c.c30_ingresos_servicios_gravados_19,
      31: 0,
      32: 0,
      33: 0,
      34: c.c34_operaciones_exentas_art477,
      35: c.c35_exportaciones_bienes,
      36: c.c36_exportaciones_servicios,
      37: c.c37_operaciones_excluidas,
      38: c.c38_operaciones_no_gravadas,
      41: c.c41_total_ingresos_brutos,
      42: c.c42_devoluciones_en_ventas,
      43: c.c43_total_ingresos_netos,
      45: c.c45_iva_gravados_5,
      46: c.c46_iva_gravados_19,
      47: 0,
      56: c.c56_total_iva_generado_operaciones,
      57: c.c57_iva_devoluciones_en_compras,
      58: c.c58_total_iva_generado,
      66: c.c66_compras_bienes_gravados_5,
      67: c.c67_compras_bienes_gravados_19,
      68: c.c68_servicios_gravados_5,
      69: c.c69_servicios_gravados_19,
      72: c.c72_importaciones_gravadas_5,
      73: c.c73_importaciones_gravadas_19,
      74: c.c74_compras_bienes_excluidos_exentos,
      75: c.c75_servicios_excluidos_exentos,
      79: c.c79_total_compras_importaciones_brutas,
      80: c.c80_devoluciones_en_compras,
      81: c.c81_descontable_compras_5,
      82: c.c82_descontable_compras_19,
      83: c.c83_descontable_servicios_5,
      84: c.c84_descontable_servicios_19,
      87: c.c87_descontable_importaciones_5,
      88: c.c88_descontable_importaciones_19,
      90: c.c90_descontable_iva_comun_prorrateado,
      95: c.c95_iva_devoluciones_en_ventas,
      96: c.c96_total_iva_descontable,
      98: c.c98_saldo_a_pagar_periodo,
      99: c.c99_saldo_a_favor_periodo,
      100: c.c100_saldo_a_favor_periodo_anterior,
      101: c.c101_retenciones_iva_que_le_practicaron,
      104: c.c104_sanciones,
      105: c.c105_total_saldo_a_pagar,
      106: c.c106_total_saldo_a_favor,
      980: c.c105_total_saldo_a_pagar,
      981: '18',
      982: '1',
      983: '228941-T',
    };

    const val = mapping[num];
    if (val === undefined) return '0';
    return typeof val === 'number' ? formatCOP(val, false) : String(val);
  };

  const yearDigits = String(taxYear || 2026).split('');
  const periodoDigits = String(result?.periodo || 1).split('');
  const nitDigits = (result?.casillas?.nit || '900123456').replace(/\D/g, '').padEnd(10, ' ').split('').slice(0, 10);

  const renderCasillaRow = (
    num: number,
    concepto: string,
    isSubtotal: boolean = false,
    isFavor: boolean = false,
    isTotalPay: boolean = false
  ) => {
    return (
      <tr key={num}>
        <td style={{ padding: '3px 6px', fontSize: '9.5px', color: isTotalPay ? '#854d0e' : isFavor ? '#166534' : isSubtotal ? '#1d4ed8' : '#1e293b', fontWeight: (isSubtotal || isFavor || isTotalPay) ? 800 : 500 }}>
          {concepto}
        </td>
        <td
          className="f300-casilla-num casilla-badge-btn"
          data-casilla={String(num)}
          onClick={(e) => handleCasillaClick(num, e)}
          title={`Casilla ${num}: clic para consultar instructivo legal`}
        >
          <span className="f300-info-badge">i</span>
          {num}
        </td>
        <td
          className={`f300-casilla-val ${isTotalPay ? 'total-to-pay' : isFavor ? 'favor-highlight' : isSubtotal ? 'calc-highlight' : ''}`}
          id={`f300_val_c${num}`}
        >
          ${getCasillaValue(num)}
        </td>
      </tr>
    );
  };

  return (
    <div id="pane-iva-f300" className="module-pane active">
      {/* ACTION BAR */}
      <div className="facsimile-action-bar">
        <div>
          <h2 className="facsimile-title">
            <span>🏛️</span> Formulario 300 Oficial DIAN (Facsímil Idéntico)
          </h2>
          <p className="facsimile-subtitle">
            💡 <em>Facsímil oficial de la Declaración del Impuesto sobre las Ventas - IVA. Haz clic en cualquier casilla <strong>[ i ]</strong> para consultar su instructivo legal y bases normativas.</em>
          </p>
        </div>
        <div className="facsimile-btn-group">
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
            🖨️ Imprimir Formulario 300
          </button>
          <button className="btn btn-primary btn-sm" onClick={onNavigateToCalc}>
            ✏️ Modificar Parámetros
          </button>
        </div>
      </div>

      {/* FORMULARIO 300 EXACT SHEET */}
      <div className="table-scroll-hint">
        <span>👉</span> Desliza horizontalmente para ver el Formulario 300 completo ➔
      </div>
      <div className="table-responsive">
        <div className="f300-sheet-wrapper">
          <div className="f300-watermark">DIAN 300</div>

          <table className="f300-table">
            <tbody>
              {/* HEADER ROW */}
              <tr>
                <td className="f300-header-cell-logo" style={{ width: '190px' }}>
                  <div className="f300-dian-logo-svg">
                    <span style={{ letterSpacing: '-2px', fontWeight: 900, fontSize: '26px' }}>DIAN</span>
                  </div>
                </td>
                <td className="f300-header-title">
                  Declaración del impuesto sobre las ventas - IVA
                  <br />
                  <span style={{ fontSize: '9px', fontWeight: 600, textTransform: 'none', color: '#475569' }}>
                    Bimestral / Cuatrimestral • Estatuto Tributario Nacional
                  </span>
                </td>
                <td className="f300-header-privada" style={{ width: '90px' }}>PRIVADA</td>
                <td className="f300-header-form-num" style={{ width: '160px' }}>300</td>
              </tr>

              {/* METADATA ROW */}
              <tr>
                <td colSpan={2} className="f300-meta-cell">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700 }}>1. Año</span>
                    <div className="f210-digit-grid">
                      {yearDigits.map((d, idx) => (
                        <div key={idx} className="f210-digit-box">
                          {d}
                        </div>
                      ))}
                    </div>
                    <span style={{ fontWeight: 700, marginLeft: '10px' }}>2. Período</span>
                    <div className="f210-digit-grid">
                      {periodoDigits.map((d, idx) => (
                        <div key={idx} className="f210-digit-box" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                          {d}
                        </div>
                      ))}
                    </div>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                      ({result?.tipo_periodicidad || 'BIMESTRAL'})
                    </span>
                  </div>
                </td>
                <td colSpan={2} className="f300-meta-cell" style={{ textAlign: 'right', paddingRight: '8px' }}>
                  <div style={{ fontSize: '8px', fontWeight: 700 }}>4. Número de formulario:</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 800, color: '#1d4ed8' }}>
                    {getCasillaValue(4)}
                  </div>
                </td>
              </tr>

              {/* BARCODE ROW */}
              <tr>
                <td colSpan={4} style={{ padding: '2px 0' }}>
                  <div className="f210-barcode-container">
                    <div className="f210-barcode-stripes"></div>
                    <div className="f210-barcode-text">(415)7707212489984(8020) 000300999999999 2</div>
                  </div>
                </td>
              </tr>

              {/* DATOS DEL DECLARANTE */}
              <tr>
                <td colSpan={4} className="f300-section-title-cell">
                  Datos del declarante
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ padding: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '8px', fontWeight: 700 }}>5. Número de Identificación Tributaria (NIT):</span>
                    <div className="f210-digit-grid">
                      {nitDigits.map((d, idx) => (
                        <div key={idx} className="f210-digit-box">
                          {d.trim()}
                        </div>
                      ))}
                    </div>
                    <span style={{ fontSize: '8px', fontWeight: 700, marginLeft: '4px' }}>6. DV:</span>
                    <div className="f210-digit-box" style={{ fontWeight: 900 }}>
                      {getCasillaValue(6)}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '4px' }}>
                  <div style={{ fontSize: '8px', fontWeight: 700 }}>11. Razón social o apellidos y nombres:</div>
                  <div style={{ fontWeight: 800, fontSize: '10.5px', textTransform: 'uppercase' }}>
                    {getCasillaValue(11)}
                  </div>
                </td>
                <td style={{ padding: '4px', textAlign: 'center' }}>
                  <div style={{ fontSize: '8px', fontWeight: 700 }}>12. Cód. Seccional:</div>
                  <div style={{ fontWeight: 800 }}>{getCasillaValue(12)}</div>
                </td>
              </tr>

              {/* SECTION A: INGRESOS */}
              <tr>
                <td colSpan={4} className="f300-section-title-cell">
                  Sección Ingresos (Ventas y operaciones del período)
                </td>
              </tr>
              {renderCasillaRow(27, 'Por operaciones gravadas a la tarifa del 5%')}
              {renderCasillaRow(28, 'Por operaciones gravadas a la tarifa general (19%)')}
              {renderCasillaRow(29, 'Por servicios gravados a la tarifa del 5%')}
              {renderCasillaRow(30, 'Por servicios gravados a la tarifa general (19%)')}
              {renderCasillaRow(34, 'Operaciones exentas (Art. 477 E.T.)')}
              {renderCasillaRow(35, 'Por exportación de bienes')}
              {renderCasillaRow(36, 'Por exportación de servicios')}
              {renderCasillaRow(37, 'Por operaciones excluidas (Art. 424 y 476 E.T.)')}
              {renderCasillaRow(38, 'Por operaciones no gravadas')}
              {renderCasillaRow(41, 'TOTAL INGRESOS BRUTOS (Suma casillas 27 a 40)', true)}
              {renderCasillaRow(42, '(-) Devoluciones en ventas anuladas, rescindidas o resueltas')}
              {renderCasillaRow(43, 'TOTAL INGRESOS NETOS (Casilla 41 menos Casilla 42)', true)}

              {/* SECTION B: COMPRAS */}
              <tr>
                <td colSpan={4} className="f300-section-title-cell">
                  Sección Compras e importaciones del período
                </td>
              </tr>
              {renderCasillaRow(66, 'De bienes gravados a la tarifa del 5%')}
              {renderCasillaRow(67, 'De bienes gravados a la tarifa general (19%)')}
              {renderCasillaRow(68, 'De servicios gravados a la tarifa del 5%')}
              {renderCasillaRow(69, 'De servicios gravados a la tarifa general (19%)')}
              {renderCasillaRow(72, 'Importaciones gravadas a la tarifa del 5%')}
              {renderCasillaRow(73, 'Importaciones gravadas a la tarifa general (19%)')}
              {renderCasillaRow(74, 'De bienes y servicios excluidos o exentos')}
              {renderCasillaRow(79, 'TOTAL COMPRAS E IMPORTACIONES BRUTAS (Suma casillas 66 a 78)', true)}
              {renderCasillaRow(80, '(-) Devoluciones en compras anuladas, rescindidas o resueltas')}

              {/* SECTION C: LIQUIDACIÓN PRIVADA - IVA GENERADO */}
              <tr>
                <td colSpan={4} className="f300-section-title-cell">
                  Liquidación privada — Impuesto generado
                </td>
              </tr>
              {renderCasillaRow(45, 'A la tarifa del 5%')}
              {renderCasillaRow(46, 'A la tarifa general (19%)')}
              {renderCasillaRow(57, 'En compras devueltas, rescindidas o resueltas')}
              {renderCasillaRow(58, 'TOTAL IMPUESTO GENERADO (Suma casillas 45 a 57)', true)}

              {/* SECTION D: LIQUIDACIÓN PRIVADA - IVA DESCONTABLE */}
              <tr>
                <td colSpan={4} className="f300-section-title-cell">
                  Liquidación privada — Impuesto descontable
                </td>
              </tr>
              {renderCasillaRow(81, 'Por compras de bienes gravados al 5%')}
              {renderCasillaRow(82, 'Por compras de bienes gravados al 19%')}
              {renderCasillaRow(83, 'Por servicios gravados al 5%')}
              {renderCasillaRow(84, 'Por servicios gravados al 19%')}
              {renderCasillaRow(87, 'Por importaciones gravadas al 5%')}
              {renderCasillaRow(88, 'Por importaciones gravadas al 19%')}
              {renderCasillaRow(90, 'Por IVA común en compras y gastos indivisibles (Prorrateo Art. 490 E.T.)')}
              {renderCasillaRow(95, '(-) IVA en devoluciones en ventas anuladas')}
              {renderCasillaRow(96, 'TOTAL IMPUESTO DESCONTABLE (Suma casillas 81 a 94 menos 95)', true)}

              {/* SECTION E: CONTROL DE SALDOS */}
              <tr>
                <td colSpan={4} className="f300-section-title-cell">
                  Control de saldos y totales de la liquidación privada
                </td>
              </tr>
              {renderCasillaRow(98, 'Saldo a pagar por el período fiscal (Casilla 58 menos Casilla 96)', true)}
              {renderCasillaRow(99, 'Saldo a favor por el período fiscal (Casilla 96 menos Casilla 58)', true, true)}
              {renderCasillaRow(100, '(-) Saldo a favor del período fiscal anterior')}
              {renderCasillaRow(101, '(-) Retenciones en la fuente de IVA que le practicaron (ReteIVA 15%)')}
              {renderCasillaRow(104, '(+) Sanciones')}

              {/* SALDO A PAGAR */}
              <tr style={{ background: '#fef08a' }}>
                <td style={{ padding: '6px 8px', fontSize: '11px', fontWeight: 900, color: '#854d0e' }}>
                  105. TOTAL SALDO A PAGAR POR ESTE PERÍODO
                </td>
                <td
                  className="f300-casilla-num casilla-badge-btn"
                  data-casilla="105"
                  onClick={(e) => handleCasillaClick(105, e)}
                >
                  <span className="f300-info-badge">i</span>
                  105
                </td>
                <td className="f300-casilla-val total-to-pay" id="f300_val_c105" colSpan={2} style={{ fontSize: '13px !important' }}>
                  ${getCasillaValue(105)}
                </td>
              </tr>

              {/* SALDO A FAVOR */}
              <tr style={{ background: '#dcfce7' }}>
                <td style={{ padding: '6px 8px', fontSize: '11px', fontWeight: 900, color: '#166534' }}>
                  106. TOTAL SALDO A FAVOR POR ESTE PERÍODO
                </td>
                <td
                  className="f300-casilla-num casilla-badge-btn"
                  data-casilla="106"
                  onClick={(e) => handleCasillaClick(106, e)}
                >
                  <span className="f300-info-badge">i</span>
                  106
                </td>
                <td className="f300-casilla-val favor-highlight" id="f300_val_c106" colSpan={2} style={{ fontSize: '13px !important' }}>
                  ${getCasillaValue(106)}
                </td>
              </tr>

              {/* PAGO TOTAL */}
              <tr style={{ background: '#eff6ff' }}>
                <td style={{ padding: '6px 8px', fontSize: '11px', fontWeight: 900, color: '#1d4ed8' }}>
                  980. PAGO TOTAL $ (Recibo Oficial de Pago 490)
                </td>
                <td
                  className="f300-casilla-num casilla-badge-btn"
                  data-casilla="980"
                  onClick={(e) => handleCasillaClick('980', e)}
                >
                  <span className="f300-info-badge">i</span>
                  980
                </td>
                <td className="f300-casilla-val calc-highlight" id="f300_val_c980" colSpan={2} style={{ fontSize: '13px !important' }}>
                  ${getCasillaValue(980)}
                </td>
              </tr>

              {/* SIGNATURES SECTION */}
              <tr>
                <td colSpan={4} className="f300-section-title-cell">
                  Signatarios y firmas
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ height: '42px', verticalAlign: 'bottom', padding: '4px' }}>
                  <div style={{ borderTop: '1px dotted #000', paddingTop: '2px', fontSize: '8.5px', color: 'var(--text-muted)' }}>
                    981. Firma del declarante o de quien lo representa (Cód. Representación: {getCasillaValue(981)})
                  </div>
                </td>
                <td colSpan={2} style={{ height: '42px', verticalAlign: 'bottom', padding: '4px' }}>
                  <div style={{ borderTop: '1px dotted #000', paddingTop: '2px', fontSize: '8.5px', color: 'var(--text-muted)' }}>
                    982. Firma Contador o Revisor Fiscal (Cód: {getCasillaValue(982)}) • 983. Tarjeta Profesional: {getCasillaValue(983)}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
