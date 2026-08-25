import React from 'react';
import type { RetefuenteF350Output } from '../../../types/tax';
import { useApp } from '../../../context/AppContext';
import { formatCOP } from '../../../utils/formatters';

interface RetefuenteF350SubtabProps {
  result: RetefuenteF350Output | null;
  onNavigateToCalc: () => void;
}

export const RetefuenteF350Subtab: React.FC<RetefuenteF350SubtabProps> = ({ result, onNavigateToCalc }) => {
  const { showCasillaPopover, taxYear } = useApp();

  const handleCasillaClick = (num: number | string, e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    showCasillaPopover(num, e.currentTarget, '350');
  };

  const getCasillaValue = (num: number, defaultVal: number | string = 0): string => {
    if (!result || !result.casillas) {
      return typeof defaultVal === 'number' ? formatCOP(defaultVal, false) : String(defaultVal);
    }
    const c = result.casillas;

    const mapping: Record<number, number | string> = {
      1: c.ano || taxYear || 2026,
      2: c.periodo_mes || 1,
      4: c.numero_formulario || '3502026010001',
      5: c.nit || '900123456',
      6: c.dv || '7',
      11: c.razon_social || 'DISTRIBUIDORA COMERCIAL NACIONAL S.A.S.',
      12: c.cod_direccion_seccional || 32,
      24: c.actividad_economica || '4711',
      28: c.c28_base_rentas_trabajo,
      29: c.c29_base_honorarios,
      30: c.c30_base_comisiones,
      31: c.c31_base_servicios,
      32: c.c32_base_arrendamientos,
      33: c.c33_base_rendimientos_financieros,
      34: c.c34_base_enajenacion_activos_fijos,
      35: c.c35_base_compras,
      36: c.c36_base_otros_pagos_sujetos,
      37: c.c37_base_pagos_exterior_renta,
      41: c.c41_total_bases_renta,
      42: c.c42_ret_rentas_trabajo,
      43: c.c43_ret_honorarios,
      44: c.c44_ret_comisiones,
      45: c.c45_ret_servicios,
      46: c.c46_ret_arrendamientos,
      47: c.c47_ret_rendimientos_financieros,
      48: c.c48_ret_enajenacion_activos_fijos,
      49: c.c49_ret_compras,
      50: c.c50_ret_otros_pagos_sujetos,
      51: c.c51_ret_pagos_exterior_renta,
      59: c.c59_total_retenciones_renta_practicadas,
      61: c.c61_base_autorretencion_especial,
      62: c.c62_autorretencion_especial_decreto_2201,
      63: c.c63_base_otras_autorretenciones,
      64: c.c64_otras_autorretenciones,
      65: c.c65_total_autorretenciones_renta,
      67: c.c67_base_iva_responsables,
      68: c.c68_retencion_iva_practicada,
      69: c.c69_retencion_iva_prestadores_exterior,
      74: c.c74_total_retenciones_iva,
      76: c.c76_base_timbre_nacional,
      77: c.c77_retencion_timbre,
      81: c.c77_retencion_timbre,
      82: c.c82_total_retenciones_periodo,
      83: c.c83_sanciones,
      84: c.c84_total_saldo_a_pagar,
      980: c.c84_total_saldo_a_pagar,
      981: '18',
      982: '1',
      983: '228941-T',
    };

    const val = mapping[num];
    if (val === undefined) return '0';
    return typeof val === 'number' ? formatCOP(val, false) : String(val);
  };

  const yearDigits = String(taxYear || 2026).split('');
  const mesDigits = String(result?.periodo_mes || 1).padStart(2, '0').split('');
  const nitDigits = (result?.casillas?.nit || '900123456').replace(/\D/g, '').padEnd(10, ' ').split('').slice(0, 10);

  const renderCasillaRow = (
    concepto: string,
    baseNum?: number,
    retNum?: number,
    isSubtotal: boolean = false
  ) => {
    return (
      <tr key={`${baseNum || 0}-${retNum || 0}`}>
        <td style={{ padding: '3px 6px', fontSize: '9.5px', color: isSubtotal ? '#00594c' : '#1e293b', fontWeight: isSubtotal ? 800 : 500 }}>
          {concepto}
        </td>

        {/* COLUMNA BASE */}
        {baseNum ? (
          <>
            <td
              className="f350-casilla-num casilla-badge-btn"
              data-casilla={String(baseNum)}
              onClick={(e) => handleCasillaClick(baseNum, e)}
              title={`Casilla ${baseNum}: clic para consultar instructivo legal`}
            >
              <span className="f350-info-badge">i</span>
              {baseNum}
            </td>
            <td className={`f350-casilla-val ${isSubtotal ? 'calc-highlight' : ''}`} id={`f350_val_c${baseNum}`}>
              ${getCasillaValue(baseNum)}
            </td>
          </>
        ) : (
          <>
            <td style={{ background: '#f8fafc', borderRight: '1px solid #000' }}></td>
            <td style={{ background: '#f8fafc' }}></td>
          </>
        )}

        {/* COLUMNA RETENCIÓN */}
        {retNum ? (
          <>
            <td
              className="f350-casilla-num casilla-badge-btn"
              data-casilla={String(retNum)}
              onClick={(e) => handleCasillaClick(retNum, e)}
              title={`Casilla ${retNum}: clic para consultar instructivo legal`}
            >
              <span className="f350-info-badge">i</span>
              {retNum}
            </td>
            <td className={`f350-casilla-val ${isSubtotal ? 'calc-highlight' : ''}`} id={`f350_val_c${retNum}`}>
              ${getCasillaValue(retNum)}
            </td>
          </>
        ) : (
          <>
            <td style={{ background: '#f8fafc', borderRight: '1px solid #000' }}></td>
            <td style={{ background: '#f8fafc' }}></td>
          </>
        )}
      </tr>
    );
  };

  return (
    <div id="pane-retefuente-f350" className="module-pane active">
      {/* ACTION BAR */}
      <div className="facsimile-action-bar">
        <div>
          <h2 className="facsimile-title">
            <span>🏛️</span> Formulario 350 Oficial DIAN (Facsímil Idéntico)
          </h2>
          <p className="facsimile-subtitle">
            💡 <em>Facsímil oficial de la Declaración Mensual de Retenciones en la Fuente. Haz clic en cualquier casilla <strong>[ i ]</strong> para ver la cartilla legal DIAN.</em>
          </p>
        </div>
        <div className="facsimile-btn-group">
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
            🖨️ Imprimir Formulario 350
          </button>
          <button className="btn btn-primary btn-sm" onClick={onNavigateToCalc}>
            ✏️ Modificar Parámetros
          </button>
        </div>
      </div>

      {/* FORMULARIO 350 EXACT SHEET */}
      <div className="table-scroll-hint">
        <span>👉</span> Desliza horizontalmente para ver el Formulario 350 completo ➔
      </div>
      <div className="table-responsive">
        <div className="f350-sheet-wrapper">
          <div className="f350-watermark">DIAN 350</div>

          <table className="f350-table">
            <tbody>
              {/* HEADER ROW */}
              <tr>
                <td className="f350-header-cell-logo">
                  <div className="f350-dian-logo-svg">
                    <span style={{ letterSpacing: '-2px', fontWeight: 900, fontSize: '26px' }}>DIAN</span>
                  </div>
                </td>
                <td className="f350-header-title" colSpan={3}>
                  Declaración mensual de retenciones en la fuente
                  <br />
                  <span style={{ fontSize: '9px', fontWeight: 600, textTransform: 'none', color: '#475569' }}>
                    Impuesto sobre la Renta, IVA, Timbre y Autorretenciones
                  </span>
                </td>
                <td className="f350-header-privada">PRIVADA</td>
                <td className="f350-header-form-num">350</td>
              </tr>

              {/* METADATA ROW */}
              <tr>
                <td colSpan={2} className="f350-meta-cell">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700 }}>1. Año</span>
                    <div className="f210-digit-grid">
                      {yearDigits.map((d, idx) => (
                        <div key={idx} className="f210-digit-box">
                          {d}
                        </div>
                      ))}
                    </div>
                    <span style={{ fontWeight: 700, marginLeft: '10px' }}>2. Período (Mes)</span>
                    <div className="f210-digit-grid">
                      {mesDigits.map((d, idx) => (
                        <div key={idx} className="f210-digit-box" style={{ background: '#f0fdfa', color: '#00594c' }}>
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>
                </td>
                <td colSpan={4} className="f350-meta-cell" style={{ textAlign: 'right', paddingRight: '8px' }}>
                  <div style={{ fontSize: '8px', fontWeight: 700 }}>4. Número de formulario:</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 800, color: '#00594c' }}>
                    {getCasillaValue(4)}
                  </div>
                </td>
              </tr>

              {/* BARCODE ROW */}
              <tr>
                <td colSpan={6} style={{ padding: '2px 0' }}>
                  <div className="f210-barcode-container">
                    <div className="f210-barcode-stripes"></div>
                    <div className="f210-barcode-text">(415)7707212489984(8020) 000350999999999 5</div>
                  </div>
                </td>
              </tr>

              {/* DATOS DEL DECLARANTE */}
              <tr>
                <td colSpan={6} className="f350-section-title-cell">
                  Datos del agente retenedor
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
                <td colSpan={3} style={{ padding: '4px' }}>
                  <div style={{ fontSize: '8px', fontWeight: 700 }}>11. Razón social o apellidos y nombres del agente retenedor:</div>
                  <div style={{ fontWeight: 800, fontSize: '10.5px', textTransform: 'uppercase' }}>
                    {getCasillaValue(11)}
                  </div>
                </td>
                <td style={{ padding: '4px', textAlign: 'center' }}>
                  <div style={{ fontSize: '8px', fontWeight: 700 }}>12. Cód. Seccional:</div>
                  <div style={{ fontWeight: 800 }}>{getCasillaValue(12)}</div>
                </td>
              </tr>

              {/* TABLE HEADER COLUMNS */}
              <tr style={{ background: '#00594c', color: '#ffffff', textAlign: 'center', fontWeight: 800 }}>
                <td style={{ width: '44%', padding: '4px' }}>Concepto de Retención</td>
                <td style={{ width: '4%' }}>Cas.</td>
                <td style={{ width: '24%', textAlign: 'right', paddingRight: '6px' }}>Base Sujeta a Retención ($)</td>
                <td style={{ width: '4%' }}>Cas.</td>
                <td style={{ width: '24%', textAlign: 'right', paddingRight: '6px' }} colSpan={2}>Retención Practicada ($)</td>
              </tr>

              {/* SECCIÓN A: RENTA */}
              <tr>
                <td colSpan={6} className="f350-section-title-cell">
                  A. Retenciones en la fuente a título de impuesto sobre la renta (Pagos o abonos en cuenta)
                </td>
              </tr>
              {renderCasillaRow('Rentas de trabajo (Nómina, salarios y prestaciones Art. 383/388 E.T.)', 28, 42)}
              {renderCasillaRow('Honorarios (Art. 392 E.T.)', 29, 43)}
              {renderCasillaRow('Comisiones (Art. 392 E.T.)', 30, 44)}
              {renderCasillaRow('Servicios (Generales y Transporte de carga)', 31, 45)}
              {renderCasillaRow('Arrendamientos (Bienes raíces y muebles)', 32, 46)}
              {renderCasillaRow('Rendimientos financieros e intereses (Art. 395 E.T.)', 33, 47)}
              {renderCasillaRow('Enajenación de activos fijos ante notario (Art. 398 E.T.)', 34, 48)}
              {renderCasillaRow('Compras de bienes corporales muebles (Art. 401 E.T.)', 35, 49)}
              {renderCasillaRow('Otros pagos o abonos sujetos a retención', 36, 50)}
              {renderCasillaRow('Pagos o abonos en cuenta al exterior a título de renta (Art. 406 a 415)', 37, 51)}
              {renderCasillaRow('TOTAL RETENCIONES DE RENTA PRACTICADAS (Suma casillas 42 a 58)', 41, 59, true)}

              {/* SECCIÓN B: AUTORRETENCIONES */}
              <tr>
                <td colSpan={6} className="f350-section-title-cell">
                  B. Autorretenciones a título de impuesto sobre la renta
                </td>
              </tr>
              {renderCasillaRow('Autorretención especial Decreto 2201 de 2016 (Art. 114-1 E.T.)', 61, 62)}
              {renderCasillaRow('Otras autorretenciones', 63, 64)}
              {renderCasillaRow('TOTAL AUTORRETENCIONES DE RENTA (Casilla 62 + Casilla 64)', undefined, 65, true)}

              {/* SECCIÓN C: RETENCIONES IVA */}
              <tr>
                <td colSpan={6} className="f350-section-title-cell">
                  C. Retenciones a título del impuesto sobre las ventas - IVA (Art. 437-1 y 437-2 E.T.)
                </td>
              </tr>
              {renderCasillaRow('A responsables del impuesto sobre las ventas - IVA (ReteIVA 15%)', 67, 68)}
              {renderCasillaRow('A prestadores de servicios desde el exterior (Art. 437-2 num. 8)', undefined, 69)}
              {renderCasillaRow('TOTAL RETENCIONES A TÍTULO DE IVA (Casilla 68 + Casilla 69)', undefined, 74, true)}

              {/* SECCIÓN D: TIMBRE */}
              <tr>
                <td colSpan={6} className="f350-section-title-cell">
                  D. Retenciones a título de timbre nacional
                </td>
              </tr>
              {renderCasillaRow('Retención a título de impuesto de timbre nacional (Art. 519 E.T.)', 76, 77)}
              {renderCasillaRow('TOTAL RETENCIONES DE TIMBRE NACIONAL', undefined, 81, true)}

              {/* SECCIÓN E: TOTALES */}
              <tr>
                <td colSpan={6} className="f350-section-title-cell">
                  E. Totales y liquidación privada
                </td>
              </tr>
              {renderCasillaRow('Total retenciones del período (Casillas 59 + 65 + 74 + 81)', undefined, 82, true)}
              {renderCasillaRow('Sanciones (Extemporaneidad / Corrección)', undefined, 83)}

              {/* SALDO A PAGAR */}
              <tr style={{ background: '#fef08a' }}>
                <td style={{ padding: '6px 8px', fontSize: '11px', fontWeight: 900, color: '#854d0e' }} colSpan={3}>
                  TOTAL SALDO A PAGAR (Casilla 82 + Casilla 83) — RECIBO OFICIAL DE PAGO 490
                </td>
                <td
                  className="f350-casilla-num casilla-badge-btn"
                  data-casilla="84"
                  onClick={(e) => handleCasillaClick(84, e)}
                >
                  <span className="f350-info-badge">i</span>
                  84
                </td>
                <td className="f350-casilla-val total-to-pay" id="f350_val_c84" colSpan={2} style={{ fontSize: '13px !important' }}>
                  ${getCasillaValue(84)}
                </td>
              </tr>

              {/* PAGO TOTAL */}
              <tr style={{ background: '#e6f4f1' }}>
                <td style={{ padding: '6px 8px', fontSize: '11px', fontWeight: 900, color: '#00594c' }} colSpan={3}>
                  980. PAGO TOTAL $ (Efectivo / Bancos)
                </td>
                <td
                  className="f350-casilla-num casilla-badge-btn"
                  data-casilla="980"
                  onClick={(e) => handleCasillaClick('980', e)}
                >
                  <span className="f350-info-badge">i</span>
                  980
                </td>
                <td className="f350-casilla-val calc-highlight" id="f350_val_c980" colSpan={2} style={{ fontSize: '13px !important' }}>
                  ${getCasillaValue(980)}
                </td>
              </tr>

              {/* SIGNATURES SECTION */}
              <tr>
                <td colSpan={6} className="f350-section-title-cell">
                  Signatarios y firmas
                </td>
              </tr>
              <tr>
                <td colSpan={3} style={{ height: '42px', verticalAlign: 'bottom', padding: '4px' }}>
                  <div style={{ borderTop: '1px dotted #000', paddingTop: '2px', fontSize: '8.5px', color: 'var(--text-muted)' }}>
                    981. Firma del declarante o de quien lo representa (Cód. Representación: {getCasillaValue(981)})
                  </div>
                </td>
                <td colSpan={3} style={{ height: '42px', verticalAlign: 'bottom', padding: '4px' }}>
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
