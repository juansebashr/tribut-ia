import React, { useState, useMemo } from 'react';
import {
  DIAN_2026_RENTA_PN,
  DIAN_2026_RENTA_PJ,
  DIAN_2026_IVA_BIMESTRES,
  DIAN_2026_SIMPLE_ANUAL,
  getEventosCalendarioMes,
  getCronogramaRentaPN,
  getCronogramaRentaPJ,
  getCronogramaIVA,
  getCronogramaRetefuente,
  getCronogramaSimple,
} from '../../constants/calendario_data';
import { calculateDianDv } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const CalendarioModule: React.FC = () => {
  const { showToast } = useApp();

  const [searchNit, setSearchNit] = useState<string>('900123456');
  const [searchTax, setSearchTax] = useState<string>('renta_pn');
  const [nitResult, setNitResult] = useState<any | null>(null);

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [currentMonth, setCurrentMonth] = useState<number>(8); // Agosto (1-12)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [timelineDigitFilter, setTimelineDigitFilter] = useState<string>('');

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const handleSearchNit = (nitVal = searchNit, taxVal = searchTax) => {
    const raw = nitVal.replace(/\D/g, '');
    if (!raw) {
      setNitResult(null);
      return;
    }
    const dv = calculateDianDv(raw);
    const last1 = parseInt(raw.slice(-1), 10);
    const last2 = parseInt(raw.slice(-2), 10);

    let info: any = null;

    if (taxVal === 'renta_pn') {
      const match = DIAN_2026_RENTA_PN.find((item: any) => {
        const p1 = item.p1;
        const p2 = item.p2;
        return last2 === p1 || last2 === p2 || (last2 === 0 && p2 === 100);
      });
      if (match) {
        info = {
          impuesto: 'Impuesto de Renta Persona Natural (F210)',
          formulario: 'Formulario 210',
          parDigitos: match.digitos,
          fechaTexto: match.fechaTexto,
          norma: 'Art. 1.6.1.13.2.15 del Decreto 1625 de 2016 y Calendario DIAN 2026',
        };
      }
    } else if (taxVal === 'renta_pj') {
      const matchCuota1 = DIAN_2026_RENTA_PJ.find((i: any) => i.cuotaNum === 1 && i.digito === last1);
      const matchCuota2 = DIAN_2026_RENTA_PJ.find((i: any) => i.cuotaNum === 2 && i.digito === last1);
      info = {
        impuesto: 'Impuesto de Renta Persona Jurídica (F110)',
        formulario: 'Formulario 110',
        parDigitos: `Último dígito: ${last1}`,
        cuota1: matchCuota1?.fechaTexto || 'Mayo de 2026',
        cuota2: matchCuota2?.fechaTexto || 'Julio de 2026',
        fechaTexto: `1a Cuota: ${matchCuota1?.fechaTexto} | 2a Cuota: ${matchCuota2?.fechaTexto}`,
        norma: 'Art. 1.6.1.13.2.11 del Decreto 1625 de 2016 y Calendario DIAN 2026',
      };
    } else if (taxVal === 'iva_bimestral') {
      info = {
        impuesto: 'Impuesto sobre las Ventas - IVA Bimestral',
        formulario: 'Formulario 300',
        parDigitos: `Último dígito: ${last1}`,
        bimestres: DIAN_2026_IVA_BIMESTRES.map((b: any) => ({
          nombre: b.nombre,
          mes: b.mesNombre,
          dia: b.dias[last1 === 0 ? 9 : last1 - 1],
        })),
        fechaTexto: 'Vence bimestralmente según el último dígito del NIT',
        norma: 'Art. 1.6.1.13.2.30 del Decreto 1625 de 2016',
      };
    } else if (taxVal === 'retefuente_mensual') {
      info = {
        impuesto: 'Retención en la Fuente Mensual',
        formulario: 'Formulario 350',
        parDigitos: `Último dígito: ${last1}`,
        fechaTexto: 'Vence mensualmente entre los días 7 y 22 hábiles de cada mes',
        norma: 'Art. 1.6.1.13.2.33 del Decreto 1625 de 2016',
      };
    } else if (taxVal === 'simple_anual') {
      info = {
        impuesto: 'Régimen SIMPLE Anual Consolidado',
        formulario: 'Formulario 260',
        parDigitos: `Último dígito: ${last1}`,
        fechaTexto: DIAN_2026_SIMPLE_ANUAL?.[0]?.fechaTexto || 'Abril de 2026',
        norma: 'Art. 910 del Estatuto Tributario',
      };
    }

    setNitResult({
      nit: raw,
      dv,
      last1,
      last2,
      info,
    });
  };

  const changeMonth = (delta: number) => {
    let nextMonth = currentMonth + delta;
    let nextYear = currentYear;
    if (nextMonth < 1) {
      nextMonth = 12;
      nextYear--;
    } else if (nextMonth > 12) {
      nextMonth = 1;
      nextYear++;
    }
    setCurrentMonth(nextMonth);
    setCurrentYear(nextYear);
  };

  const handleEventClick = (titulo: string, dia: number) => {
    showToast(`📅 Vencimiento DIAN: ${titulo} (Día ${dia} de ${monthNames[currentMonth - 1]} de ${currentYear})`, 'info', 4000);
  };

  // Generate calendar grid cells (Monday-Sunday 7 columns format)
  const calendarGridCells = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay();
    // Monday is 0, Sunday is 6
    const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth - 1, 0).getDate();

    const monthEvents = getEventosCalendarioMes(currentYear, currentMonth);

    const cells: React.ReactNode[] = [];

    // Previous month trailing days
    for (let i = startDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const colIdx = startDay - 1 - i;
      const isWeekend = colIdx === 5 || colIdx === 6;
      cells.push(
        <div key={`prev-${d}`} className={`calendar-day-cell other-month ${isWeekend ? 'weekend' : ''}`}>
          <span className="calendar-day-num">{d}</span>
        </div>
      );
    }

    // Current month days
    const realToday = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday =
        currentYear === realToday.getFullYear() &&
        currentMonth === realToday.getMonth() + 1 &&
        d === realToday.getDate();

      const dayCol = (startDay + (d - 1)) % 7;
      const isWeekend = dayCol === 5 || dayCol === 6;
      const dayEvents = monthEvents.filter((e: any) => e.dia === d);

      cells.push(
        <div key={`curr-${d}`} className={`calendar-day-cell ${isToday ? 'today' : ''} ${isWeekend ? 'weekend' : ''}`}>
          <span className="calendar-day-num">{d}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto', maxHeight: '76px' }}>
            {dayEvents.map((ev: any, idx: number) => (
              <div
                key={idx}
                className="calendar-event-pill"
                style={{ background: ev.color }}
                title={ev.titulo}
                onClick={() => handleEventClick(ev.titulo, d)}
              >
                <span style={{ fontWeight: 900 }}>[{ev.badge}]</span> {ev.titulo}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Next month trailing days
    const totalCells = startDay + daysInMonth;
    const remainingCells = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
    for (let d = 1; d <= remainingCells; d++) {
      const nextCol = (totalCells + (d - 1)) % 7;
      const isWeekend = nextCol === 5 || nextCol === 6;
      cells.push(
        <div key={`next-${d}`} className={`calendar-day-cell other-month ${isWeekend ? 'weekend' : ''}`}>
          <span className="calendar-day-num">{d}</span>
        </div>
      );
    }

    return cells;
  }, [currentYear, currentMonth]);

  // Specific Day-by-Day timeline items based on selected tax filter
  const timelineData = useMemo(() => {
    let title = '';
    let desc = '';
    let items: any[] = [];

    if (activeFilter === 'renta_pn') {
      title = '👤 Cronograma Día por Día: Renta Personas Naturales (Formulario 210)';
      desc = '50 días hábiles en Agosto, Septiembre y Octubre según los 2 últimos dígitos del NIT (Art. 579-2 E.T.).';
      items = getCronogramaRentaPN(currentYear);
    } else if (activeFilter === 'renta_pj') {
      title = '🏢 Cronograma Día por Día: Renta Personas Jurídicas (Formulario 110)';
      desc = 'Cuota 1 (Mayo) por pares de 2 dígitos y Cuota 2 (Julio) por último dígito.';
      items = getCronogramaRentaPJ(currentYear);
    } else if (activeFilter === 'iva') {
      title = '🛍️ Cronograma Día por Día: Impuesto sobre las Ventas - IVA (Formulario 300)';
      desc = 'Vencimientos bimestrales según el último dígito del NIT en Mar, May, Jul, Sep, Nov y Ene.';
      items = getCronogramaIVA(currentYear);
    } else if (activeFilter === 'retefuente') {
      title = '💰 Cronograma Día por Día: Retención en la Fuente Mensual (Formulario 350)';
      desc = '12 periodos mensuales con vencimientos según el último dígito del NIT.';
      items = getCronogramaRetefuente(currentYear);
    } else if (activeFilter === 'simple') {
      title = '📑 Cronograma Día por Día: Régimen SIMPLE Consolidado (Formulario 260)';
      desc = 'Declaración anual consolidada en Abril según el último dígito del NIT.';
      items = getCronogramaSimple(currentYear);
    }

    const query = timelineDigitFilter.trim().toLowerCase();
    const filteredItems = query
      ? items.filter(
          (item) =>
            item.digitos.toLowerCase().includes(query) ||
            item.fechaTexto.toLowerCase().includes(query) ||
            item.mes.toLowerCase().includes(query) ||
            (item.dia && String(item.dia).includes(query))
        )
      : items;

    return { title, desc, items: filteredItems };
  }, [activeFilter, currentYear, timelineDigitFilter]);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return (
    <div id="pane-calendario" className="module-pane active">
      {/* SEARCH BY NIT WIDGET */}
      <div className="calendar-search-box">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '14px',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              🔍 Consulta de Vencimientos Tributarios por NIT
            </h2>
            <p style={{ fontSize: '12.5px', color: '#cbd5e1', marginTop: '2px', marginBottom: 0 }}>
              Digita tu número de identificación para calcular el día exacto límite de presentación y pago según el
              calendario oficial de la DIAN.
            </p>
          </div>
          <span
            className="badge-uvt"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
            }}
          >
            Decreto de Plazos DIAN
          </span>
        </div>

        <div className="calendar-search-grid">
          <div className="input-field">
            <label style={{ color: '#e2e8f0', fontSize: '11.5px', fontWeight: 700 }}>
              Número de NIT / Cédula (sin DV):
            </label>
            <input
              type="text"
              id="cal-search-nit"
              className="text-input"
              style={{
                width: '100%',
                fontSize: '14px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                background: '#ffffff',
                color: '#0b3b60',
              }}
              value={searchNit}
              onChange={(e) => {
                setSearchNit(e.target.value);
                handleSearchNit(e.target.value, searchTax);
              }}
            />
          </div>

          <div className="input-field">
            <label style={{ color: '#e2e8f0', fontSize: '11.5px', fontWeight: 700 }}>
              Tipo de Impuesto u Obligación:
            </label>
            <select
              id="cal-search-tax"
              className="select-input"
              style={{
                width: '100%',
                fontSize: '13.5px',
                fontWeight: 700,
                background: '#ffffff',
                color: '#0b3b60',
              }}
              value={searchTax}
              onChange={(e) => {
                setSearchTax(e.target.value);
                handleSearchNit(searchNit, e.target.value);
              }}
            >
              <option value="renta_pn">👤 Renta Personas Naturales (Formulario 210)</option>
              <option value="renta_pj">🏢 Renta Personas Jurídicas (Formulario 110)</option>
              <option value="iva_bimestral">🛍️ IVA Bimestral (Formulario 300)</option>
              <option value="retefuente_mensual">💰 Retención en la Fuente (Formulario 350)</option>
              <option value="simple_anual">📑 Régimen SIMPLE Anual (Formulario 260)</option>
            </select>
          </div>

          <button
            className="btn btn-primary"
            style={{ background: '#10b981', color: '#ffffff', height: '36px', padding: '0 18px' }}
            onClick={() => handleSearchNit()}
          >
            ⚡ Consultar Fechas
          </button>
        </div>

        {/* RESULT DISPLAY */}
        <div id="cal-search-result-container" style={{ marginTop: '14px' }}>
          {nitResult && nitResult.info && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.96)',
                borderRadius: '8px',
                padding: '16px',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '10px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                    {nitResult.info.formulario} • {nitResult.info.impuesto}
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0b3b60', margin: '2px 0 0 0' }}>
                    NIT: {nitResult.nit} - <span style={{ color: '#059669' }}>DV {nitResult.dv}</span>
                  </h3>
                </div>
                <span
                  style={{
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                >
                  {nitResult.info.parDigitos}
                </span>
              </div>

              <div
                style={{
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '6px',
                  borderLeft: '4px solid #10b981',
                  marginBottom: '8px',
                }}
              >
                <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Fecha límite oficial:</div>
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#065f46',
                    fontFamily: 'var(--font-sans)',
                    marginTop: '2px',
                  }}
                >
                  📅 {nitResult.info.fechaTexto}
                </div>
                {nitResult.info.cuota1 && (
                  <div style={{ fontSize: '12px', color: '#1e3a8a', marginTop: '4px' }}>
                    • 1a Cuota y Declaración (50%): <strong>{nitResult.info.cuota1}</strong>
                    <br />• 2a Cuota (50%): <strong>{nitResult.info.cuota2}</strong>
                  </div>
                )}
              </div>

              <div style={{ fontSize: '11px', color: '#64748b' }}>📜 {nitResult.info.norma}</div>
            </div>
          )}
        </div>
      </div>

      {/* BARRA DE FILTROS POR IMPUESTO */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            id="cal-filter-btn-all"
            onClick={() => setActiveFilter('all')}
          >
            🌐 Todos (Vista Calendario)
          </button>
          <button
            className={`btn btn-sm ${activeFilter === 'renta_pn' ? 'btn-primary' : 'btn-outline'}`}
            id="cal-filter-btn-renta_pn"
            onClick={() => setActiveFilter('renta_pn')}
          >
            👤 Renta Natural (Día por Día)
          </button>
          <button
            className={`btn btn-sm ${activeFilter === 'renta_pj' ? 'btn-primary' : 'btn-outline'}`}
            id="cal-filter-btn-renta_pj"
            onClick={() => setActiveFilter('renta_pj')}
          >
            🏢 Renta Jurídica (Día por Día)
          </button>
          <button
            className={`btn btn-sm ${activeFilter === 'iva' ? 'btn-primary' : 'btn-outline'}`}
            id="cal-filter-btn-iva"
            onClick={() => setActiveFilter('iva')}
          >
            🛍️ IVA (Día por Día)
          </button>
          <button
            className={`btn btn-sm ${activeFilter === 'retefuente' ? 'btn-primary' : 'btn-outline'}`}
            id="cal-filter-btn-retefuente"
            onClick={() => setActiveFilter('retefuente')}
          >
            💰 Retención en la Fuente (Día por Día)
          </button>
          <button
            className={`btn btn-sm ${activeFilter === 'simple' ? 'btn-primary' : 'btn-outline'}`}
            id="cal-filter-btn-simple"
            onClick={() => setActiveFilter('simple')}
          >
            📑 SIMPLE (Día por Día)
          </button>
        </div>
      </div>

      {/* 1. VISTA GENERAL: CALENDARIO MENSUAL (SE MUESTRA EN 'TODOS') */}
      {activeFilter === 'all' && (
        <div id="cal-overview-calendar-container" className="card">
          <div className="card-header">
            <div className="calendar-nav-bar" style={{ width: '100%', margin: 0 }}>
              <div className="calendar-month-selector">
                <button className="btn btn-outline btn-sm" onClick={() => changeMonth(-1)}>
                  ◀ Mes Anterior
                </button>
                <span
                  id="cal-current-month-label"
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#0b3b60',
                    minWidth: '160px',
                    textAlign: 'center',
                  }}
                >
                  {monthNames[currentMonth - 1]} {currentYear}
                </span>
                <button className="btn btn-outline btn-sm" onClick={() => changeMonth(1)}>
                  Mes Siguiente ▶
                </button>
              </div>

              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                💡 Selecciona un impuesto arriba para ver el <strong>desglose exacto día por día</strong> según cada
                par o último dígito de NIT.
              </span>
            </div>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            <div className="calendar-scroll-wrapper">
              <div className="calendar-grid-wrapper">
                <div className="calendar-weekdays-row">
                  <div>Lun</div>
                  <div>Mar</div>
                  <div>Mié</div>
                  <div>Jue</div>
                  <div>Vie</div>
                  <div>Sáb</div>
                  <div>Dom</div>
                </div>
                <div className="calendar-days-grid" id="cal-days-grid-container">
                  {calendarGridCells}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. VISTA ESPECÍFICA: CRONOGRAMA DETALLADO DÍA POR DÍA */}
      {activeFilter !== 'all' && (
        <div id="cal-detailed-timeline-container" className="card">
          <div className="day-by-day-header-bar">
            <div>
              <h3 id="cal-timeline-title" style={{ fontSize: '15px', fontWeight: 800, color: '#0b3b60', margin: 0 }}>
                {timelineData.title}
              </h3>
              <p id="cal-timeline-desc" style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {timelineData.desc}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                id="cal-timeline-search-digit"
                className="text-input"
                placeholder="Filtrar por dígito (ej: 32)..."
                style={{ width: '190px', fontSize: '12px' }}
                value={timelineDigitFilter}
                onChange={(e) => setTimelineDigitFilter(e.target.value)}
              />
              <button className="btn btn-outline btn-sm" onClick={() => setActiveFilter('all')}>
                ⬅ Volver a Calendario General
              </button>
            </div>
          </div>

          <div className="card-body" style={{ padding: '16px' }}>
            {timelineData.items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No se encontraron vencimientos para el filtro ingresado.
              </div>
            ) : (
              <div className="day-by-day-grid" id="cal-timeline-grid">
                {timelineData.items.map((item: any, idx: number) => {
                  const targetDate = new Date(`${item.fecha}T00:00:00`);
                  const diffTime = targetDate.getTime() - hoy.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  let statusPill = null;
                  let isToday = false;

                  if (diffDays > 0) {
                    statusPill = (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#059669',
                          background: '#ecfdf5',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        ⏳ Faltan {diffDays} d
                      </span>
                    );
                  } else if (diffDays === 0) {
                    statusPill = (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 900,
                          color: '#854d0e',
                          background: '#fef08a',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        ⚠️ ¡VENCE HOY!
                      </span>
                    );
                    isToday = true;
                  } else {
                    statusPill = (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#94a3b8',
                          background: '#f1f5f9',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        ✓ Finalizado
                      </span>
                    );
                  }

                  return (
                    <div key={idx} className={`day-by-day-card ${isToday ? 'active-today' : ''}`}>
                      <div className="day-by-day-card-header">
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            color: '#2563eb',
                          }}
                        >
                          {item.mes} {item.dia} • {item.diaSemana}
                        </span>
                        {statusPill}
                      </div>

                      <div className="day-by-day-date">{item.fechaTexto}</div>

                      <div className="day-by-day-digits-box">
                        <span
                          style={{
                            fontSize: '10.5px',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            color: '#94a3b8',
                          }}
                        >
                          Vence NITs:
                        </span>
                        <span>{item.digitos}</span>
                      </div>

                      <div className="day-by-day-footer">
                        <span>{item.cuota || item.periodo || 'Declaración y Pago'}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0b3b60' }}>
                          {item.formulario}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
