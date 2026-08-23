// Estado global
const urlParams = new URLSearchParams(window.location.search);
let currentSessionId = urlParams.get('session_id') || 'default';
let currentYear = 2026;
let currentUvt = 52350;
let lastPnResult = null;
let lastPjResult = null;
let currentRules = null;
let debounceTimer = null;
let allBeneficios = [];
let isPopoverPinned = false;
let isSidebarCollapsed = false;
let currentActiveModule = 'pn';
let currentActiveSubTab = 'calc';
let liveSyncEventSource = null;
let syncDebounceTimer = null;
let isApplyingRemoteState = false;
let pendingConfirmCallback = null;

// =========================================================================
// SISTEMA DE NOTIFICACIONES TOAST & MODAL DE CONFIRMACIÓN (UX RESILIENTE)
// =========================================================================
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('tributia-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? '#065f46' : type === 'warning' ? '#9a3412' : type === 'error' ? '#991b1b' : '#1e3a8a';
  const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠️' : type === 'error' ? '✕' : 'ℹ️';

  toast.style.cssText = `
    background: ${bgColor};
    color: #ffffff;
    padding: 12px 18px;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    pointer-events: auto;
    animation: toastSlideIn 0.3s ease forwards;
    transition: opacity 0.3s ease, transform 0.3s ease;
    border-left: 4px solid #38bdf8;
    max-width: 420px;
  `;
  toast.innerHTML = `<span style="font-size: 16px;">${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function showConfirmModal({ title, msg, icon = '⚠️', confirmText = 'Aceptar', onConfirm }) {
  const modal = document.getElementById('modal-confirm-action');
  if (!modal) {
    if (onConfirm) onConfirm();
    return;
  }
  document.getElementById('confirm-modal-icon').innerText = icon;
  document.getElementById('confirm-modal-title').innerText = title;
  document.getElementById('confirm-modal-msg').innerText = msg;
  const btnAccept = document.getElementById('confirm-modal-btn-accept');
  btnAccept.innerText = confirmText;

  pendingConfirmCallback = onConfirm;
  btnAccept.onclick = () => {
    closeConfirmModal();
    if (pendingConfirmCallback) {
      pendingConfirmCallback();
      pendingConfirmCallback = null;
    }
  };
  modal.style.display = 'flex';
}

function closeConfirmModal() {
  const modal = document.getElementById('modal-confirm-action');
  if (modal) modal.style.display = 'none';
  pendingConfirmCallback = null;
}

function saveLocalDraft() {
  try {
    const state = getCurrentUiState();
    localStorage.setItem(`tributia_draft_${currentSessionId}`, JSON.stringify(state));
  } catch (err) {
    console.warn('No se pudo guardar borrador local:', err);
  }
}

function loadLocalDraft() {
  try {
    const raw = localStorage.getItem(`tributia_draft_${currentSessionId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function hasEnteredUserData() {
  const rt = getNum('pn_rentas_trabajo');
  const rc = getNum('pn_rentas_capital');
  const rnl = getNum('pn_rentas_nolaborales');
  const pat = getNum('pn_patrimonio_bruto');
  return (rt > 0 && rt !== 120000000) || rc > 0 || rnl > 0 || (pat > 0 && pat !== 300000000);
}

function updateSessionBadgeUi() {
  const el = document.getElementById('session-active-id-display');
  if (el) {
    el.innerText = currentSessionId;
    el.title = `Sesión: ${currentSessionId}`;
  }
}

function copySessionIdToClipboard() {
  navigator.clipboard.writeText(currentSessionId).then(() => {
    showToast(`✓ ID de sesión copiado: ${currentSessionId}`, 'success', 2500);
  });
}

function iniciarNuevaSesion() {
  const doNew = () => {
    const newId = `ses_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    window.location.search = `?session_id=${newId}`;
  };

  if (hasEnteredUserData()) {
    showConfirmModal({
      title: '¿Iniciar nueva declaración limpia?',
      msg: 'Se creará un nuevo ID de sesión en blanco. La sesión actual permanecerá guardada en Redis.',
      confirmText: 'Crear nueva sesión',
      onConfirm: doNew
    });
  } else {
    doNew();
  }
}

// Formateador de moneda tradicional colombiano (Separador de millones: ', Separador de miles: .)
function formatCOP(amount, includeSymbol = true) {
  if (amount === undefined || amount === null || isNaN(amount)) return includeSymbol ? '$0' : '0';
  const num = Math.round(Number(amount));
  const isNegative = num < 0;
  const absStr = String(Math.abs(num));

  if (absStr.length <= 3) {
    return (isNegative ? '-' : '') + (includeSymbol ? '$' : '') + absStr;
  }

  const rev = absStr.split('').reverse();
  const parts = [];
  for (let i = 0; i < rev.length; i += 3) {
    parts.push(rev.slice(i, i + 3).reverse().join(''));
  }

  let formatted = parts[parts.length - 1];
  for (let i = parts.length - 2; i >= 0; i--) {
    const sep = (i % 2 === 1) ? "'" : ".";
    formatted += sep + parts[i];
  }

  return (isNegative ? '-' : '') + (includeSymbol ? '$' : '') + formatted;
}

// Estado del Calendario
let currentCalYear = 2026;
let currentCalMonth = 8; // Agosto (1 a 12)
let calTaxFilter = 'all';
let currentTimelineItems = [];

// Configuración de módulos y títulos
const MODULE_METADATA = {
  'calendario': {
    breadcrumb: 'VENCIMIENTOS / CALENDARIO DIAN',
    title: 'Calendario Tributario Nacional & Consulta de Vencimientos por NIT',
    hasSubTabs: false
  },
  'pn-calc': {
    breadcrumb: 'IMPUESTO DE RENTA / PERSONA NATURAL',
    title: 'Depuración Cédula General (Rentas de Trabajo, Capital y No Laborales)',
    hasSubTabs: true
  },
  'pn-f210': {
    breadcrumb: 'IMPUESTO DE RENTA / PERSONA NATURAL',
    title: 'Formulario 210 DIAN - Facsímil Oficial en Vivo',
    hasSubTabs: true
  },
  'pn-marginal': {
    breadcrumb: 'IMPUESTO DE RENTA / PERSONA NATURAL',
    title: 'Tarifa Marginal Progresiva & Termómetro de Brackets (Art. 241 E.T.)',
    hasSubTabs: true
  },
  'pn-conciliacion': {
    breadcrumb: 'RENTA PERSONAS NATURALES / CONCILIACIÓN EXÓGENA',
    title: 'Hoja de Cálculo Fiscal & Conciliación con Información Exógena DIAN (F210)',
    hasSubTabs: true
  },
  'pj': {
    breadcrumb: 'IMPUESTO DE RENTA / PERSONA JURÍDICA',
    title: 'Liquidación Renta Empresarial (F110) & Tasa Mínima TTD (15%)',
    hasSubTabs: false
  },
  'simple': {
    breadcrumb: 'RÉGIMEN ESPECIAL / SIMPLE',
    title: 'Régimen Simple de Tributación - SIMPLE (Formulario 260)',
    hasSubTabs: false
  },
  'iva': {
    breadcrumb: 'IMPUESTOS INDIRECTOS / IVA',
    title: 'Impuesto sobre las Ventas - IVA (Formulario 300 DIAN)',
    hasSubTabs: false
  },
  'retefuente': {
    breadcrumb: 'IMPUESTOS PERIÓDICOS / RETENCIONES',
    title: 'Retención en la Fuente Mensual (Formulario 350 DIAN)',
    hasSubTabs: false
  },
  'art73': {
    breadcrumb: 'OPTIMIZACIÓN / REAJUSTE DE ACTIVOS',
    title: 'Reajuste Fiscal de Bienes Raíces y Acciones (Art. 73 E.T. - DUR 1.2.1.17.21)',
    hasSubTabs: false
  },
  'beneficios': {
    breadcrumb: 'OPTIMIZACIÓN / BENEFICIOS FISCALES',
    title: 'Catálogo de Beneficios y Alivios Tributarios (Estatuto Tributario)',
    hasSubTabs: false
  },
  'presentacion': {
    breadcrumb: 'PROCEDIMIENTO / AUDITORÍA & SANCIONES',
    title: 'Presentación de la Declaración, Beneficio de Auditoría & Régimen Sancionatorio',
    hasSubTabs: false
  },
  'inmuebles-afc': {
    breadcrumb: 'OPTIMIZACIÓN / INMUEBLES & CUENTAS AFC',
    title: 'Beneficios sobre Bienes Inmuebles & Cuentas AFC (Art. 311-1 y 126-4 E.T.)',
    hasSubTabs: false
  },
  'rules': {
    breadcrumb: 'SISTEMA / CONFIGURACIÓN',
    title: 'Reglas Tributarias, UVT & Parámetros Legales Declarativos',
    hasSubTabs: false
  },
  'docs': {
    breadcrumb: 'DESARROLLADORES / AGENTES IA',
    title: 'Integración API REST & Prompts para Agentes Autónomos',
    hasSubTabs: false
  }
};

const NOMBRES_MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Helpers para leer y escribir valores numéricos en campos formateados ($1'280.000)
function getNum(id) {
  const el = typeof id === 'string' ? document.getElementById(id) : id;
  if (!el) return 0;
  // En declaraciones tributarias colombianas, los valores son enteros en pesos (COP).
  // Los separadores visuales son ' (millones) y . (miles). Eliminamos todo lo que no sea dígito o signo menos.
  const str = String(el.value || '').trim();
  const isNeg = str.startsWith('-');
  const digitsOnly = str.replace(/\D/g, '');
  if (!digitsOnly) return 0;
  const val = parseInt(digitsOnly, 10);
  return isNeg ? -val : val;
}

function setNum(id, val) {
  const el = typeof id === 'string' ? document.getElementById(id) : id;
  if (!el) return;
  el.value = formatCOP(val, false);
}

// Máscara interactiva para que el usuario escriba directamente con formato ($1'280.000)
function attachCurrencyInputMasks() {
  document.querySelectorAll('.currency-input').forEach(input => {
    // Formatear valor inicial
    const digits = String(input.value || '').replace(/\D/g, '');
    if (digits) {
      input.value = formatCOP(digits, false);
    }

    input.addEventListener('input', () => {
      const curPos = input.selectionStart;
      const prevLen = input.value.length;
      const rawDigits = input.value.replace(/\D/g, '');
      
      if (!rawDigits) {
        input.value = '0';
      } else {
        input.value = formatCOP(rawDigits, false);
      }

      // Reubicar cursor adecuadamente tras insertar separadores
      const newLen = input.value.length;
      const diff = newLen - prevLen;
      const newPos = Math.max(0, (curPos || 0) + diff);
      try {
        input.setSelectionRange(newPos, newPos);
      } catch (err) {}
    });

    input.addEventListener('focus', () => {
      if (input.value === '0') {
        input.value = '';
      }
    });

    input.addEventListener('blur', () => {
      if (!input.value.trim()) {
        input.value = '0';
      } else {
        const rawDigits = input.value.replace(/\D/g, '');
        input.value = formatCOP(rawDigits, false);
      }
    });
  });
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  attachCurrencyInputMasks();
  initCasillaPopovers();
  renderVisualCalendar();
  loadBeneficiosCatalog();
  loadTablaArticulo73();
  // Defer simulation calls: aunque los panes están en el DOM desde el inicio,
  // los currency-inputs necesitan estar enmascarados antes de leer sus valores.
  setTimeout(() => {
    runSimulacionAuditoria();
    runCalculadoraSanciones();
    runSimulacionInmuebleAfc();
    runSimulacionArticulo73();
  }, 300);

  // Resolver ID de sesión activa (Cookie, Header o URL)
  try {
    const infoRes = await fetch('/api/v1/session/current', {
      headers: currentSessionId && currentSessionId !== 'default' ? { 'X-Session-ID': currentSessionId } : {}
    });
    if (infoRes.ok) {
      const info = await infoRes.json();
      if (info && info.session_id && (!urlParams.get('session_id') || urlParams.get('session_id') === 'default')) {
        currentSessionId = info.session_id;
      }
    }
  } catch (err) {}

  updateSessionBadgeUi();
  initLiveSync();

  // Cargar estado de sesión si existe en backend
  try {
    const res = await fetch(`/api/v1/session/state`, {
      headers: { 'X-Session-ID': currentSessionId }
    });
    if (res.ok) {
      const state = await res.json();
      if (state && state.persona_natural && Object.keys(state.persona_natural).length > 0 && (state.persona_natural.rentas_trabajo > 0 || state.persona_natural.patrimonio_bruto > 0)) {
        applyStateToUi(state, 'api');
        return;
      }
    }
  } catch (err) {
    console.warn('No se pudo precargar sesión remota:', err);
  }

  // Fallback: Recuperar borrador de localStorage si existe
  const localDraft = loadLocalDraft();
  if (localDraft && localDraft.persona_natural && (localDraft.persona_natural.rentas_trabajo > 0 || localDraft.persona_natural.patrimonio_bruto > 0)) {
    applyStateToUi(localDraft, 'api');
    showToast('📂 Borrador local recuperado de la sesión anterior', 'info', 3000);
    return;
  }

  await loadRules(currentYear);
  triggerPnCalc();
  triggerPjCalc();
  consultarVencimientoNit();
});

// SIDEBAR TOGGLE (DESKTOP)
function toggleSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const workspace = document.getElementById('app-workspace');
  const btn = document.getElementById('btn-toggle-sidebar');
  
  isSidebarCollapsed = !isSidebarCollapsed;
  if (isSidebarCollapsed) {
    sidebar.classList.add('collapsed');
    workspace.classList.add('expanded');
    btn.innerText = '▶';
  } else {
    sidebar.classList.remove('collapsed');
    workspace.classList.remove('expanded');
    btn.innerText = '◀';
  }
}

// SIDEBAR MOBILE DRAWER (OFF-CANVAS)
function openMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.add('mobile-open');
  if (backdrop) backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (backdrop) backdrop.classList.remove('active');
  document.body.style.overflow = '';
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  if (sidebar && sidebar.classList.contains('mobile-open')) {
    closeMobileSidebar();
  } else {
    openMobileSidebar();
  }
}

// Window resize listener para limpiar estado de drawer móvil al pasar a desktop
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    closeMobileSidebar();
  }
});

// NAVEGACIÓN MODULAR
function navigateTo(moduleKey, subTab = 'main') {
  hideCasillaPopover();
  currentActiveModule = moduleKey;
  currentActiveSubTab = subTab;

  // Si está en pantalla móvil, cerrar el drawer lateral
  if (window.innerWidth <= 768) {
    closeMobileSidebar();
  }

  // Determinar pane target
  let targetPaneId = `pane-${moduleKey}`;
  if (moduleKey === 'pn') {
    if (subTab === 'f210') targetPaneId = 'pane-pn-f210';
    else if (subTab === 'marginal') targetPaneId = 'pane-pn-marginal';
    else if (subTab === 'conciliacion') targetPaneId = 'pane-pn-conciliacion';
    else targetPaneId = 'pane-pn-calc';
  }

  // Ocultar todos los panes
  document.querySelectorAll('.module-pane').forEach(p => p.classList.remove('active'));

  // Desactivar items del sidebar
  document.querySelectorAll('.sidebar-item-btn').forEach(b => b.classList.remove('active'));

  // Mostrar pane target
  const targetPane = document.getElementById(targetPaneId);
  if (targetPane) {
    targetPane.classList.add('active');
  }

  // Actualizar item activo del sidebar
  if (moduleKey === 'pn') {
    const sideBtn = document.getElementById(`nav-item-pn-${subTab}`);
    if (sideBtn) sideBtn.classList.add('active');
  } else {
    const sideBtn = document.getElementById(`nav-item-${moduleKey}`);
    if (sideBtn) sideBtn.classList.add('active');
  }

  // Actualizar Header Breadcrumbs & Title
  const metaKey = moduleKey === 'pn' ? `pn-${subTab}` : moduleKey;
  const meta = MODULE_METADATA[metaKey] || { breadcrumb: 'TRIBUTIA SUITE', title: 'Módulo Tributario', hasSubTabs: false };
  
  document.getElementById('header-breadcrumbs').innerText = meta.breadcrumb;
  document.getElementById('header-title').innerText = meta.title;

  // Sub tabs bar en el header
  const subTabsBar = document.getElementById('sub-tabs-bar');
  if (moduleKey === 'pn') {
    subTabsBar.style.display = 'flex';
    document.getElementById('sub-tab-btn-pn-calc').className = subTab === 'calc' ? 'sub-tab-btn active' : 'sub-tab-btn';
    document.getElementById('sub-tab-btn-pn-f210').className = subTab === 'f210' ? 'sub-tab-btn active' : 'sub-tab-btn';
    document.getElementById('sub-tab-btn-pn-marginal').className = subTab === 'marginal' ? 'sub-tab-btn active' : 'sub-tab-btn';
    const subConcil = document.getElementById('sub-tab-btn-pn-conciliacion');
    if (subConcil) subConcil.className = subTab === 'conciliacion' ? 'sub-tab-btn active' : 'sub-tab-btn';
  } else {
    subTabsBar.style.display = 'none';
  }

  // Renderizados específicos al navegar
  if (moduleKey === 'calendario') {
    consultarVencimientoNit();
    if (calTaxFilter === 'all') {
      renderVisualCalendar();
    } else {
      filterCalendarTax(calTaxFilter, document.getElementById(`cal-filter-btn-${calTaxFilter}`));
    }
  } else if (moduleKey === 'rules') {
    renderRulesTab();
  } else if (moduleKey === 'pn' && subTab === 'f210' && lastPnResult) {
    renderForm210OfficialSheet(lastPnResult);
  } else if (moduleKey === 'pn' && subTab === 'marginal' && lastPnResult) {
    renderPnMarginalThermometer(lastPnResult);
  } else if (moduleKey === 'pn' && subTab === 'conciliacion') {
    if (!reconciliationData || !reconciliationData.items || reconciliationData.items.length === 0) {
      loadReconciliationDemo();
    }
  } else if (moduleKey === 'art73') {
    loadTablaArticulo73();
    runSimulacionArticulo73();
  } else if (moduleKey === 'beneficios') {
    renderBeneficiosList('all');
  } else if (moduleKey === 'presentacion') {
    runSimulacionAuditoria();
    runCalculadoraSanciones();
  } else if (moduleKey === 'inmuebles-afc') {
    runSimulacionInmuebleAfc();
  }

  // Scroll suave al top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// CALENDARIO - CONSULTA POR NIT
function syncNitToCalendar() {
  const nitPn = document.getElementById('pn_nit_declarante');
  const calNit = document.getElementById('cal-search-nit');
  if (nitPn && calNit) {
    calNit.value = nitPn.value;
  }
}

function consultarVencimientoNit() {
  const nitInput = document.getElementById('cal-search-nit');
  const taxSelect = document.getElementById('cal-search-tax');
  const resultContainer = document.getElementById('cal-search-result-container');
  if (!nitInput || !taxSelect || !resultContainer) return;

  const rawNit = nitInput.value.trim() || '1234567890';
  const taxKey = taxSelect.value;
  const config = CALENDARIO_TRIBUTARIO[taxKey];
  if (!config) return;

  const cleanNit = rawNit.replace(/\D/g, '');
  const last2 = cleanNit.length >= 2 ? cleanNit.slice(-2) : cleanNit;
  const last1 = cleanNit.length >= 1 ? cleanNit.slice(-1) : cleanNit;

  const vencimientos = config.calcularVencimiento(rawNit, currentYear);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  let html = `
    <div class="calendar-result-card">
      <div style="grid-column: 1 / -1; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
        <div>
          <strong style="color: #0b3b60; font-size: 14px;">${config.nombre} (${config.formulario})</strong>
          <div style="font-size: 11.5px; color: #64748b;">
            NIT Consultado: <strong style="font-family: var(--font-mono); color: #0b3b60;">${rawNit}</strong> 
            (Último dígito: <strong style="font-family: var(--font-mono);">${last1}</strong> | 2 Últimos: <strong style="font-family: var(--font-mono);">${last2}</strong>)
          </div>
        </div>
        <span class="badge-uvt" style="background:#eff6ff; color:#1d4ed8;">${config.frecuencia}</span>
      </div>
  `;

  vencimientos.forEach(v => {
    const targetDate = new Date(`${v.fecha}T00:00:00`);
    const diffTime = targetDate.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let countdownBadge = '';
    if (diffDays > 0) {
      countdownBadge = `<span class="calendar-due-badge" style="background:#ecfdf5; color:#059669;">⏳ Faltan ${diffDays} días</span>`;
    } else if (diffDays === 0) {
      countdownBadge = `<span class="calendar-due-badge" style="background:#fef08a; color:#854d0e;">⚠️ ¡VENCE HOY!</span>`;
    } else {
      countdownBadge = `<span class="calendar-due-badge" style="background:#fee2e2; color:#b91c1c;">✓ Vencido hace ${Math.abs(diffDays)} días</span>`;
    }

    html += `
      <div class="calendar-due-item">
        <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">
          ${v.cuota || v.concepto}
        </div>
        <div class="calendar-due-date">${v.fechaTexto}</div>
        <div style="font-size: 11px; color: #64748b;">${v.concepto}</div>
        <div style="margin-top: 4px;">${countdownBadge}</div>
      </div>
    `;
  });

  html += `
      <div style="grid-column: 1 / -1; background: #f8fafc; padding: 8px 12px; border-radius: 6px; font-size: 11px; color: #64748b; margin-top: 4px;">
        📌 <strong>Fundamento Legal:</strong> ${config.base_legal}. ${config.descripcion}
      </div>
    </div>
  `;

  resultContainer.innerHTML = html;
}

// CALENDARIO - SWITCH ENTRE VISTA RESUMEN (TODOS) Y VISTA DÍA POR DÍA (IMPUESTO ESPECÍFICO)
function filterCalendarTax(taxType, btn) {
  calTaxFilter = taxType;

  // Actualizar botones de filtro
  document.querySelectorAll('#pane-calendario button').forEach(b => {
    if (b.id && b.id.startsWith('cal-filter-btn-')) {
      b.className = 'btn btn-outline btn-sm';
    }
  });
  if (btn) btn.className = 'btn btn-primary btn-sm';

  const overviewContainer = document.getElementById('cal-overview-calendar-container');
  const timelineContainer = document.getElementById('cal-detailed-timeline-container');
  const searchInput = document.getElementById('cal-timeline-search-digit');
  if (searchInput) searchInput.value = '';

  if (taxType === 'all') {
    // Modo "Todos": Muestra la vista limpia de cuadrícula de calendario
    overviewContainer.style.display = 'block';
    timelineContainer.style.display = 'none';
    renderVisualCalendar();
  } else {
    // Modo "Impuesto Específico": Muestra el cronograma exhaustivo día a día
    overviewContainer.style.display = 'none';
    timelineContainer.style.display = 'block';
    loadAndRenderDayByDaySchedule(taxType);
  }
}

function loadAndRenderDayByDaySchedule(taxType) {
  const titleEl = document.getElementById('cal-timeline-title');
  const descEl = document.getElementById('cal-timeline-desc');
  let items = [];

  if (taxType === 'renta_pn') {
    titleEl.innerText = '👤 Cronograma Día por Día: Renta Personas Naturales (Formulario 210)';
    descEl.innerText = '50 días hábiles en Agosto, Septiembre y Octubre según los 2 últimos dígitos del NIT (Art. 579-2 E.T.).';
    items = getCronogramaRentaPN(currentCalYear);
  } else if (taxType === 'renta_pj') {
    titleEl.innerText = '🏢 Cronograma Día por Día: Renta Personas Jurídicas (Formulario 110)';
    descEl.innerText = 'Cuota 1 (Mayo) por pares de 2 dígitos y Cuota 2 (Julio) por último dígito.';
    items = getCronogramaRentaPJ(currentCalYear);
  } else if (taxType === 'iva') {
    titleEl.innerText = '🛍️ Cronograma Día por Día: Impuesto sobre las Ventas - IVA (Formulario 300)';
    descEl.innerText = 'Vencimientos bimestrales según el último dígito del NIT en Mar, May, Jul, Sep, Nov y Ene.';
    items = getCronogramaIVA(currentCalYear);
  } else if (taxType === 'retefuente') {
    titleEl.innerText = '💰 Cronograma Día por Día: Retención en la Fuente Mensual (Formulario 350)';
    descEl.innerText = '12 periodos mensuales con vencimientos según el último dígito del NIT.';
    items = getCronogramaRetefuente(currentCalYear);
  } else if (taxType === 'simple') {
    titleEl.innerText = '📑 Cronograma Día por Día: Régimen SIMPLE Consolidado (Formulario 260)';
    descEl.innerText = 'Declaración anual consolidada en Abril según el último dígito del NIT.';
    items = getCronogramaSimple(currentCalYear);
  }

  currentTimelineItems = items;
  renderTimelineGrid(items);
}

function renderTimelineGrid(items) {
  const container = document.getElementById('cal-timeline-grid');
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        No se encontraron vencimientos para el filtro ingresado.
      </div>
    `;
    return;
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  let html = '';

  items.forEach((item, idx) => {
    const targetDate = new Date(`${item.fecha}T00:00:00`);
    const diffTime = targetDate.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let statusPill = '';
    let isToday = false;

    if (diffDays > 0) {
      statusPill = `<span style="font-size: 10px; font-weight: 700; color: #059669; background: #ecfdf5; padding: 2px 6px; border-radius: 4px;">⏳ Faltan ${diffDays} d</span>`;
    } else if (diffDays === 0) {
      statusPill = `<span style="font-size: 10px; font-weight: 900; color: #854d0e; background: #fef08a; padding: 2px 6px; border-radius: 4px;">⚠️ ¡VENCE HOY!</span>`;
      isToday = true;
    } else {
      statusPill = `<span style="font-size: 10px; font-weight: 700; color: #94a3b8; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">✓ Finalizado</span>`;
    }

    html += `
      <div class="day-by-day-card ${isToday ? 'active-today' : ''}">
        <div class="day-by-day-card-header">
          <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #2563eb;">
            ${item.mes} ${item.dia} • ${item.diaSemana}
          </span>
          ${statusPill}
        </div>

        <div class="day-by-day-date">${item.fechaTexto}</div>

        <div class="day-by-day-digits-box">
          <span style="font-size: 10.5px; text-transform: uppercase; font-weight: 700; color: #94a3b8;">Vence NITs:</span>
          <span>${item.digitos}</span>
        </div>

        <div class="day-by-day-footer">
          <span>${item.cuota || item.periodo || 'Declaración y Pago'}</span>
          <span style="font-family: var(--font-mono); font-weight: 800; color: #0b3b60;">${item.formulario}</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function filterTimelineByDigit() {
  const query = (document.getElementById('cal-timeline-search-digit').value || '').trim().toLowerCase();
  if (!query) {
    renderTimelineGrid(currentTimelineItems);
    return;
  }

  const filtered = currentTimelineItems.filter(item => {
    return item.digitos.toLowerCase().includes(query) ||
           item.fechaTexto.toLowerCase().includes(query) ||
           item.mes.toLowerCase().includes(query) ||
           (item.dia && String(item.dia).includes(query));
  });

  renderTimelineGrid(filtered);
}

// CALENDARIO - VISUALIZADOR DE MES RESUMEN
function changeCalendarMonth(delta) {
  currentCalMonth += delta;
  if (currentCalMonth > 12) {
    currentCalMonth = 1;
    currentCalYear++;
  } else if (currentCalMonth < 1) {
    currentCalMonth = 12;
    currentCalYear--;
  }
  renderVisualCalendar();
}

function renderVisualCalendar() {
  const label = document.getElementById('cal-current-month-label');
  const container = document.getElementById('cal-days-grid-container');
  if (!label || !container) return;

  label.innerText = `${NOMBRES_MESES[currentCalMonth - 1]} ${currentCalYear}`;
  container.innerHTML = '';

  const firstDayIndex = new Date(currentCalYear, currentCalMonth - 1, 1).getDay();
  const startDay = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;
  const daysInMonth = new Date(currentCalYear, currentCalMonth, 0).getDate();
  const daysInPrevMonth = new Date(currentCalYear, currentCalMonth - 1, 0).getDate();

  const allEvents = getEventosCalendarioMes(currentCalYear, currentCalMonth);

  // Días del mes previo
  for (let i = startDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const cell = document.createElement('div');
    cell.className = 'calendar-day-cell other-month';
    cell.innerHTML = `<span class="calendar-day-num">${d}</span>`;
    container.appendChild(cell);
  }

  const realToday = new Date();
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    const isToday = (
      currentCalYear === realToday.getFullYear() &&
      currentCalMonth === (realToday.getMonth() + 1) &&
      d === realToday.getDate()
    );
    cell.className = isToday ? 'calendar-day-cell today' : 'calendar-day-cell';
    
    let cellContent = `<span class="calendar-day-num">${d}</span>`;
    
    const dayEvents = allEvents.filter(e => e.dia === d);
    dayEvents.forEach(ev => {
      cellContent += `
        <div class="calendar-event-pill" style="background: ${ev.color};" title="${ev.titulo}" onclick="selectCalendarEvent('${ev.titulo}', '${d} de ${NOMBRES_MESES[currentCalMonth - 1]}')">
          <span style="font-weight:900;">[${ev.badge}]</span> ${ev.titulo}
        </div>
      `;
    });

    cell.innerHTML = cellContent;
    container.appendChild(cell);
  }

  // Días del mes siguiente
  const totalCells = startDay + daysInMonth;
  const remainingCells = (totalCells <= 35) ? (35 - totalCells) : (42 - totalCells);
  for (let d = 1; d <= remainingCells; d++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day-cell other-month';
    cell.innerHTML = `<span class="calendar-day-num">${d}</span>`;
    container.appendChild(cell);
  }
}

function selectCalendarEvent(titulo, fecha) {
  alert(`📅 Vencimiento DIAN:\n\n${titulo}\nFecha límite: ${fecha} de ${currentCalYear}\n\nSelecciona el impuesto correspondiente en los botones superiores para ver la lista completa día por día.`);
}

// CARGA DE REGLAS & UVT
async function loadRules(year, customUvt = null) {
  try {
    const url = customUvt ? `/api/v1/rules/${year}?custom_uvt=${customUvt}` : `/api/v1/rules/${year}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al cargar reglas');
    currentRules = await res.json();
    currentYear = currentRules.tax_year;
    currentUvt = currentRules.uvt_value;
    
    document.getElementById('input-custom-uvt').value = currentUvt;
    renderYearDigits(currentYear);
    
    if (document.getElementById('pane-rules').classList.contains('active')) {
      renderRulesTab();
    }
  } catch (err) {
    console.error(err);
  }
}

function renderYearDigits(year) {
  const container = document.getElementById('f210-year-digits');
  if (!container) return;
  const str = String(year).padStart(4, '0');
  container.innerHTML = `
    <div class="f210-digit-box">${str[0]}</div>
    <div class="f210-digit-box">${str[1]}</div>
    <div class="f210-digit-box">${str[2]}</div>
    <div class="f210-digit-box">${str[3]}</div>
  `;
}

function onYearChange() {
  const sel = document.getElementById('select-year');
  currentYear = parseInt(sel.value) || 2026;
  currentCalYear = currentYear;
  loadRules(currentYear).then(() => {
    triggerPnCalc();
    triggerPjCalc();
    runSimulacionAuditoria();
    consultarVencimientoNit();
    if (calTaxFilter === 'all') {
      renderVisualCalendar();
    } else {
      loadAndRenderDayByDaySchedule(calTaxFilter);
    }
  });
}

function onUvtChange() {
  const input = document.getElementById('input-custom-uvt');
  const val = parseFloat(input.value);
  if (val && val > 0) {
    currentUvt = val;
    triggerPnCalc();
    triggerPjCalc();
    runSimulacionAuditoria();
  }
}

// PERSONA NATURAL - CÁLCULO
function triggerPnCalc() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runPnCalc, 150);
}

async function runPnCalc() {
  const rentasCapital = getNum('pn_rentas_capital');
  const incrngoCapital = getNum('pn_incrngo_capital');
  const rentasNoLaborales = getNum('pn_rentas_nolaborales');
  const incrngoNoLaborales = getNum('pn_incrngo_nolaborales');
  const costosNoLaborales = getNum('pn_costos_nolaborales');
  const otrosIngresos = getNum('pn_otros_ingresos');

  const payload = {
    tax_year: currentYear,
    custom_uvt: currentUvt,
    patrimonio_bruto: getNum('pn_patrimonio_bruto'),
    deudas: getNum('pn_deudas'),
    rentas_trabajo: getNum('pn_rentas_trabajo'),
    viaticos: getNum('pn_viaticos'),
    otros_ingresos_brutos: otrosIngresos,
    rentas_capital: rentasCapital,
    incrngo_capital: incrngoCapital,
    rentas_nolaborales: rentasNoLaborales,
    incrngo_nolaborales: incrngoNoLaborales,
    costos_nolaborales: costosNoLaborales,
    aporte_salud_obligatorio: getNum('pn_salud'),
    aporte_pension_obligatorio: getNum('pn_pension'),
    otros_incrngo: 0,
    aplica_dependiente_general: document.getElementById('pn_dependiente_general') ? document.getElementById('pn_dependiente_general').checked : false,
    numero_dependientes_adicionales_72uvt: 0,
    medicina_prepagada_anual: getNum('pn_prepagada'),
    intereses_vivienda_anual: getNum('pn_vivienda'),
    gmf_4x1000_total: getNum('pn_gmf'),
    compras_factura_electronica: getNum('pn_factura_elec'),
    aportes_voluntarios_pension_afc: getNum('pn_afc'),
    otras_rentas_exentas: getNum('pn_otras_exentas'),
    ganancias_ocasionales_brutas_activos_fijos: getNum('pn_go_activos'),
    costos_ganancia_ocasional: getNum('pn_go_costos'),
    ganancias_ocasionales_brutas_herencias: getNum('pn_go_herencias'),
    ganancias_ocasionales_brutas_loterias: getNum('pn_go_loterias'),
    ganancias_ocasionales_exentas_solicitadas: getNum('pn_go_exentas'),
    descuentos_tributarios: 0,
    retenciones_fuente_practicadas: getNum('pn_retenciones'),
    anticipo_ano_anterior: getNum('pn_anticipo'),
    saldo_a_favor_ano_anterior: getNum('pn_saldo_favor_anterior')
  };

  try {
    const res = await fetch('/api/v1/calculate/persona-natural/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error en el cálculo');
    const data = await res.json();
    lastPnResult = data;
    renderPnResult(data);
    renderForm210OfficialSheet(data);
    renderPnMarginalThermometer(data);
    syncUiStateToBackend();
  } catch (err) {
    console.error(err);
  }
}

function renderPnResult(data) {
  window._lastPnResult = data;
  const kpiBox = document.getElementById('pn-kpi-box');
  const kpiLabel = document.getElementById('pn-kpi-label');
  const kpiValue = document.getElementById('pn-kpi-value');
  const kpiBadge = document.getElementById('pn-kpi-badge');

  if (data.saldo_a_pagar > 0) {
    kpiBox.className = 'kpi-banner to-pay';
    kpiLabel.innerText = 'Saldo Total a Pagar (Casilla 136)';
    kpiValue.innerText = `${formatCOP(data.saldo_a_pagar)} COP`;
    kpiBadge.innerText = `Tarifa Marginal: ${(data.tarifa_marginal_maxima * 100).toFixed(0)}%`;
  } else {
    kpiBox.className = 'kpi-banner favorable';
    kpiLabel.innerText = 'Saldo a Favor del Contribuyente (Casilla 137)';
    kpiValue.innerText = `${formatCOP(data.saldo_a_favor)} COP`;
    kpiBadge.innerText = '✓ Saldo a Favor';
  }

  document.getElementById('res-pn-ingresos-brutos').innerText = formatCOP(data.total_ingresos_brutos);
  document.getElementById('res-pn-incrngo').innerText = `-${formatCOP(data.total_incrngo)}`;
  document.getElementById('res-pn-ingreso-neto').innerText = formatCOP(data.ingreso_neto);
  document.getElementById('res-pn-deducciones').innerText = `-${formatCOP(data.total_deducciones_aceptadas)}`;
  document.getElementById('res-pn-exentas-afc').innerText = `-${formatCOP(data.total_rentas_exentas_previas)}`;
  document.getElementById('res-pn-exenta-25').innerText = `-${formatCOP(data.renta_exenta_laboral_25)}`;
  document.getElementById('res-pn-limite-conjunto').innerText = formatCOP(data.limite_conjunto_aplicable_cop);
  document.getElementById('res-pn-renta-gravable').innerHTML = `${formatCOP(data.renta_liquida_gravable)} <div style="font-size:11px;color:var(--text-muted);">${data.renta_liquida_gravable_uvt.toFixed(2)} UVT</div>`;
  document.getElementById('res-pn-impuesto-bruto').innerText = formatCOP(data.impuesto_bruto_renta);
  
  const rowGo = document.getElementById('res-pn-row-go');
  if (data.impuesto_ganancias_ocasionales > 0) {
    rowGo.style.display = 'table-row';
    document.getElementById('res-pn-impuesto-go').innerText = `+${formatCOP(data.impuesto_ganancias_ocasionales)}`;
  } else {
    rowGo.style.display = 'none';
  }

  document.getElementById('res-pn-total-impuesto-cargo').innerText = formatCOP(data.total_impuesto_a_cargo);
  document.getElementById('res-pn-retenciones').innerText = `-${formatCOP(data.total_anticipos_y_retenciones)}`;
}

// Algoritmo DIAN para cálculo del Dígito de Verificación (DV) según Art. 370 E.T.
function calculateDianDv(nit) {
  if (!nit) return '1';
  const clean = String(nit).replace(/\D/g, '');
  if (!clean) return '1';
  const weights = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3];
  const str = clean.padStart(15, '0');
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    sum += parseInt(str[i], 10) * weights[i];
  }
  const remainder = sum % 11;
  if (remainder === 0 || remainder === 1) return String(remainder);
  return String(11 - remainder);
}

// Parser inteligente de nombres y apellidos colombianos (1, 2, 3, 4 o más palabras con partículas)
function parseColombianFullName(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return { primerNombre: '', otrosNombres: '', primerApellido: '', segundoApellido: '' };
  }

  const raw = fullName.trim().toUpperCase();
  if (!raw) {
    return { primerNombre: '', otrosNombres: '', primerApellido: '', segundoApellido: '' };
  }

  // Tokenizar por espacios
  const words = raw.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return {
      primerNombre: words[0],
      otrosNombres: '',
      primerApellido: '',
      segundoApellido: ''
    };
  }

  if (words.length === 2) {
    // Ej: "CONTRIBUYENTE EJEMPLO" -> 1er Nombre: CONTRIBUYENTE, 1er Apellido: EJEMPLO
    return {
      primerNombre: words[0],
      otrosNombres: '',
      primerApellido: words[1],
      segundoApellido: ''
    };
  }

  if (words.length === 3) {
    // Ej: "CONTRIBUYENTE PERSONA EJEMPLO" -> 1er Nombre: CONTRIBUYENTE, 1er Apellido: PERSONA, 2do Apellido: EJEMPLO
    return {
      primerNombre: words[0],
      otrosNombres: '',
      primerApellido: words[1],
      segundoApellido: words[2]
    };
  }

  if (words.length === 4) {
    // Ej: "CONTRIBUYENTE PERSONA EJEMPLO DEMO" -> 1er Nombre: CONTRIBUYENTE, Otros: PERSONA, 1er Apellido: EJEMPLO, 2do Apellido: DEMO
    return {
      primerNombre: words[0],
      otrosNombres: words[1],
      primerApellido: words[2],
      segundoApellido: words[3]
    };
  }

  // 5 o más palabras: Agrupar partículas compuestas (DE, DEL, LA, LAS, LOS, SAN, SANTA)
  const particles = ['DE', 'DEL', 'LA', 'LAS', 'LOS', 'SAN', 'SANTA', 'Y', 'VON', 'VAN'];
  const merged = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (particles.includes(w) && i + 1 < words.length) {
      let combined = w;
      while (i + 1 < words.length && particles.includes(words[i + 1])) {
        combined += ' ' + words[++i];
      }
      if (i + 1 < words.length) {
        combined += ' ' + words[++i];
      }
      merged.push(combined);
    } else {
      merged.push(w);
    }
  }

  if (merged.length === 2) {
    return { primerNombre: merged[0], otrosNombres: '', primerApellido: merged[1], segundoApellido: '' };
  } else if (merged.length === 3) {
    return { primerNombre: merged[0], otrosNombres: '', primerApellido: merged[1], segundoApellido: merged[2] };
  } else if (merged.length === 4) {
    return { primerNombre: merged[0], otrosNombres: merged[1], primerApellido: merged[2], segundoApellido: merged[3] };
  } else {
    const primerApellido = merged[merged.length - 2] || '';
    const segundoApellido = merged[merged.length - 1] || '';
    const primerNombre = merged[0] || '';
    const otrosNombres = merged.slice(1, merged.length - 2).join(' ') || '';
    return { primerNombre, otrosNombres, primerApellido, segundoApellido };
  }
}

// FORMULARIO 210 FACSÍMIL RENDER
function renderForm210OfficialSheet(data) {
  if (!data) return;

  const nombre = document.getElementById('pn_nombre_declarante') ? document.getElementById('pn_nombre_declarante').value : "CONTRIBUYENTE PERSONA NATURAL DEMO";
  const nit = document.getElementById('pn_nit_declarante') ? document.getElementById('pn_nit_declarante').value : "9001234567";
  
  // Traslado inteligente de nombres y apellidos según casillas 5, 6, 7, 8 del RUT/F210
  const parsed = parseColombianFullName(nombre);
  if (document.getElementById('f210-val-papellido')) document.getElementById('f210-val-papellido').innerText = parsed.primerApellido || '';
  if (document.getElementById('f210-val-sapellido')) document.getElementById('f210-val-sapellido').innerText = parsed.segundoApellido || '';
  if (document.getElementById('f210-val-pnombre')) document.getElementById('f210-val-pnombre').innerText = parsed.primerNombre || '';
  if (document.getElementById('f210-val-onombre')) document.getElementById('f210-val-onombre').innerText = parsed.otrosNombres || '';

  const nitDigitsContainer = document.getElementById('f210-nit-digits');
  if (nitDigitsContainer) {
    const nitClean = nit.replace(/\D/g, '').padStart(10, '0');
    nitDigitsContainer.innerHTML = nitClean.split('').map(d => `<div class="f210-digit-box">${d}</div>`).join('');
  }

  const dvEl = document.getElementById('f210-val-dv');
  if (dvEl) {
    dvEl.innerText = calculateDianDv(nit);
  }

  // 1. Patrimonio
  const patBruto = data.patrimonio_bruto !== undefined ? data.patrimonio_bruto : getNum('pn_patrimonio_bruto');
  const deudas = data.deudas !== undefined ? data.deudas : getNum('pn_deudas');
  const patLiq = data.patrimonio_liquido !== undefined ? data.patrimonio_liquido : (patBruto - deudas);

  if (document.getElementById('f210_val_c29')) document.getElementById('f210_val_c29').innerText = formatCOP(patBruto, false);
  if (document.getElementById('f210_val_c30')) document.getElementById('f210_val_c30').innerText = formatCOP(deudas, false);
  if (document.getElementById('f210_val_c31')) document.getElementById('f210_val_c31').innerText = formatCOP(patLiq, false);

  // 2. Rentas de Trabajo
  const rentasTrabajo = getNum('pn_rentas_trabajo');
  const viaticos = getNum('pn_viaticos');
  const totalTrabajo = rentasTrabajo + viaticos;
  const salud = getNum('pn_salud');
  const pension = getNum('pn_pension');
  const totalIncrngoTrabajo = salud + pension;
  const c34_rentaLiqTrabajo = Math.max(0, totalTrabajo - totalIncrngoTrabajo);

  if (document.getElementById('f210_val_c32')) document.getElementById('f210_val_c32').innerText = formatCOP(totalTrabajo, false);
  if (document.getElementById('f210_val_c33')) document.getElementById('f210_val_c33').innerText = formatCOP(totalIncrngoTrabajo, false);
  if (document.getElementById('f210_val_c34')) document.getElementById('f210_val_c34').innerText = formatCOP(c34_rentaLiqTrabajo, false);

  const afc = getNum('pn_afc');
  const exenta25 = data.renta_exenta_laboral_25 !== undefined ? data.renta_exenta_laboral_25 : (data.renta_exenta_laboral_25pct || 0);
  const totalExentasTrabajo = afc + exenta25 + getNum('pn_otras_exentas');
  const viv = getNum('pn_vivienda');
  const totalDeduccionesTrabajo = data.total_deducciones_aceptadas !== undefined ? data.total_deducciones_aceptadas : (viv + getNum('pn_prepagada'));
  
  // Casilla 41: Menor entre alivios solicitados de trabajo y el tope legal de 1.340 UVT / 40%
  const limiteMaxTrabajo = data.limite_conjunto_aplicable_cop !== undefined ? data.limite_conjunto_aplicable_cop : (c34_rentaLiqTrabajo * 0.4);
  const c41_aliviosLimitados = data.alivios_procedentes_finales !== undefined 
    ? data.alivios_procedentes_finales 
    : Math.min(totalExentasTrabajo + totalDeduccionesTrabajo, limiteMaxTrabajo);
    
  // Casilla 42 = Casilla 34 - Casilla 41 (Renta Líquida Ordinaria de Trabajo)
  const c42_rentaLiqOrdTrabajo = Math.max(0, c34_rentaLiqTrabajo - c41_aliviosLimitados);

  if (document.getElementById('f210_val_c35')) document.getElementById('f210_val_c35').innerText = formatCOP(afc, false);
  if (document.getElementById('f210_val_c36')) document.getElementById('f210_val_c36').innerText = formatCOP(exenta25, false);
  if (document.getElementById('f210_val_c37')) document.getElementById('f210_val_c37').innerText = formatCOP(totalExentasTrabajo, false);
  if (document.getElementById('f210_val_c38')) document.getElementById('f210_val_c38').innerText = formatCOP(viv, false);
  if (document.getElementById('f210_val_c40')) document.getElementById('f210_val_c40').innerText = formatCOP(totalDeduccionesTrabajo, false);
  if (document.getElementById('f210_val_c41')) document.getElementById('f210_val_c41').innerText = formatCOP(c41_aliviosLimitados, false);
  if (document.getElementById('f210_val_c42')) document.getElementById('f210_val_c42').innerText = formatCOP(c42_rentaLiqOrdTrabajo, false);

  // 3. Rentas de Capital
  const rentasCap = getNum('pn_rentas_capital');
  const incrngoCap = getNum('pn_incrngo_capital');
  const c61_rentaLiqCap = Math.max(0, rentasCap - incrngoCap);

  if (document.getElementById('f210_val_c58')) document.getElementById('f210_val_c58').innerText = formatCOP(rentasCap, false);
  if (document.getElementById('f210_val_c59')) document.getElementById('f210_val_c59').innerText = formatCOP(incrngoCap, false);
  if (document.getElementById('f210_val_c61')) document.getElementById('f210_val_c61').innerText = formatCOP(c61_rentaLiqCap, false);
  if (document.getElementById('f210_val_c70')) document.getElementById('f210_val_c70').innerText = formatCOP(0, false);
  if (document.getElementById('f210_val_c71')) document.getElementById('f210_val_c71').innerText = formatCOP(0, false);
  if (document.getElementById('f210_val_c72')) document.getElementById('f210_val_c72').innerText = formatCOP(c61_rentaLiqCap, false);
  if (document.getElementById('f210_val_c73')) document.getElementById('f210_val_c73').innerText = formatCOP(c61_rentaLiqCap, false);

  // 4. Rentas No Laborales
  const rentasNoLab = getNum('pn_rentas_nolaborales');
  const incrngoNoLab = getNum('pn_incrngo_nolaborales');
  const costosNoLab = getNum('pn_costos_nolaborales');
  const c78_rentaLiqNoLab = Math.max(0, rentasNoLab - incrngoNoLab - costosNoLab);

  if (document.getElementById('f210_val_c74')) document.getElementById('f210_val_c74').innerText = formatCOP(rentasNoLab, false);
  if (document.getElementById('f210_val_c76')) document.getElementById('f210_val_c76').innerText = formatCOP(incrngoNoLab, false);
  if (document.getElementById('f210_val_c77')) document.getElementById('f210_val_c77').innerText = formatCOP(costosNoLab, false);
  if (document.getElementById('f210_val_c78')) document.getElementById('f210_val_c78').innerText = formatCOP(c78_rentaLiqNoLab, false);
  if (document.getElementById('f210_val_c87')) document.getElementById('f210_val_c87').innerText = formatCOP(0, false);
  if (document.getElementById('f210_val_c88')) document.getElementById('f210_val_c88').innerText = formatCOP(0, false);
  if (document.getElementById('f210_val_c89')) document.getElementById('f210_val_c89').innerText = formatCOP(c78_rentaLiqNoLab, false);
  if (document.getElementById('f210_val_c90')) document.getElementById('f210_val_c90').innerText = formatCOP(c78_rentaLiqNoLab, false);

  // Honorarios / Rentas de trabajo sin relación laboral (Casillas 54, 55, 56)
  if (document.getElementById('f210_val_c54')) document.getElementById('f210_val_c54').innerText = formatCOP(0, false);
  if (document.getElementById('f210_val_c55')) document.getElementById('f210_val_c55').innerText = formatCOP(0, false);
  if (document.getElementById('f210_val_c56')) document.getElementById('f210_val_c56').innerText = formatCOP(0, false);

  // 5. Deducción 1% Factura Electrónica y Cédula General Consolidada
  const comprasFe = getNum('pn_factura_elec');
  const fe1pct = (data.deduccion_factura_electronica !== undefined && data.deduccion_factura_electronica > 0)
    ? data.deduccion_factura_electronica
    : Math.round(comprasFe * 0.01);
  if (document.getElementById('f210_val_c28')) document.getElementById('f210_val_c28').innerText = formatCOP(fe1pct, false);

  // Casilla 91: Total Renta Líquida Cédula General = C34 (Trabajo) + C61 (Capital) + C78 (No Laboral)
  const c91_totRenLiqGen = c34_rentaLiqTrabajo + c61_rentaLiqCap + c78_rentaLiqNoLab;
  // Casilla 92: Total Rentas Exentas y Deducciones Limitadas Cédula General
  const c92_totAliviosLimitados = c41_aliviosLimitados;
  // Casilla 93: Renta Líquida Ordinaria Cédula General = C91 - C92
  const c93_rentaLiqOrdGen = Math.max(0, c91_totRenLiqGen - c92_totAliviosLimitados);
  // Casilla 97: Renta Líquida Gravable Cédula General = C93 - Casilla 28 (Deducción 1% Facturas)
  const c97_rentaLiqGravGen = data.renta_liquida_gravable !== undefined 
    ? data.renta_liquida_gravable 
    : Math.max(0, c93_rentaLiqOrdGen - fe1pct);

  if (document.getElementById('f210_val_c91')) document.getElementById('f210_val_c91').innerText = formatCOP(c91_totRenLiqGen, false);
  if (document.getElementById('f210_val_c92')) document.getElementById('f210_val_c92').innerText = formatCOP(c92_totAliviosLimitados, false);
  if (document.getElementById('f210_val_c93')) document.getElementById('f210_val_c93').innerText = formatCOP(c93_rentaLiqOrdGen, false);
  if (document.getElementById('f210_val_c97')) document.getElementById('f210_val_c97').innerText = formatCOP(c97_rentaLiqGravGen, false);
  if (document.getElementById('f210_val_c111')) document.getElementById('f210_val_c111').innerText = formatCOP(c97_rentaLiqGravGen, false);

  // 6. Ganancias Ocasionales
  const goBrutas = data.total_ganancias_ocasionales_brutas !== undefined ? data.total_ganancias_ocasionales_brutas : getNum('pn_go_activos');
  const goCostos = data.costos_ganancia_ocasional !== undefined ? data.costos_ganancia_ocasional : getNum('pn_go_costos');
  const goExentas = data.ganancias_ocasionales_exentas_aceptadas !== undefined ? data.ganancias_ocasionales_exentas_aceptadas : getNum('pn_go_exentas');
  const goGravable = data.ganancia_ocasional_gravable !== undefined ? data.ganancia_ocasional_gravable : Math.max(0, goBrutas - goCostos - goExentas);

  if (document.getElementById('f210_val_c112')) document.getElementById('f210_val_c112').innerText = formatCOP(goBrutas, false);
  if (document.getElementById('f210_val_c113')) document.getElementById('f210_val_c113').innerText = formatCOP(goCostos, false);
  if (document.getElementById('f210_val_c114')) document.getElementById('f210_val_c114').innerText = formatCOP(goExentas, false);
  if (document.getElementById('f210_val_c115')) document.getElementById('f210_val_c115').innerText = formatCOP(goGravable, false);

  // 7. Impuesto y Liquidación Privada
  const impRenta = data.impuesto_bruto_renta !== undefined ? data.impuesto_bruto_renta : (data.impuesto_cedula_general || 0);
  const impGo = data.impuesto_ganancias_ocasionales !== undefined ? data.impuesto_ganancias_ocasionales : 0;
  const totImpCargo = data.total_impuesto_a_cargo !== undefined ? data.total_impuesto_a_cargo : (impRenta + impGo);

  if (document.getElementById('f210_val_c116')) document.getElementById('f210_val_c116').innerText = formatCOP(impRenta, false);
  if (document.getElementById('f210_val_c121')) document.getElementById('f210_val_c121').innerText = formatCOP(impRenta, false);
  if (document.getElementById('f210_val_c126')) document.getElementById('f210_val_c126').innerText = formatCOP(impRenta, false);
  if (document.getElementById('f210_val_c127')) document.getElementById('f210_val_c127').innerText = formatCOP(impGo, false);
  if (document.getElementById('f210_val_c129')) document.getElementById('f210_val_c129').innerText = formatCOP(totImpCargo, false);

  const antAnt = getNum('pn_anticipo');
  const salFavAnt = getNum('pn_saldo_favor_anterior');
  const ret = getNum('pn_retenciones');
  const totAntRet = data.total_anticipos_y_retenciones !== undefined ? data.total_anticipos_y_retenciones : (antAnt + salFavAnt + ret);

  if (document.getElementById('f210_val_c130')) document.getElementById('f210_val_c130').innerText = formatCOP(antAnt, false);
  if (document.getElementById('f210_val_c131')) document.getElementById('f210_val_c131').innerText = formatCOP(salFavAnt, false);
  if (document.getElementById('f210_val_c132')) document.getElementById('f210_val_c132').innerText = formatCOP(ret, false);
  if (document.getElementById('f210_val_c134')) document.getElementById('f210_val_c134').innerText = formatCOP(totAntRet, false);

  const saldoPagar = data.saldo_a_pagar !== undefined ? data.saldo_a_pagar : Math.max(0, totImpCargo - totAntRet);
  const saldoFavor = data.saldo_a_favor !== undefined ? data.saldo_a_favor : Math.max(0, totAntRet - totImpCargo);

  if (document.getElementById('f210_val_c136')) document.getElementById('f210_val_c136').innerText = formatCOP(saldoPagar, false);
  if (document.getElementById('f210_val_c137')) document.getElementById('f210_val_c137').innerText = formatCOP(saldoFavor, false);
  if (document.getElementById('f210_val_c980')) document.getElementById('f210_val_c980').innerText = formatCOP(saldoPagar);
}

// =========================================================================
// RENDERIZADO DEL TERMÓMETRO MARGINAL PROGRESIVO (ART. 241 E.T.)
// =========================================================================
function renderPnMarginalThermometer(data) {
  if (!data || !currentRules) return;

  const uvtVal = data.uvt_value || currentUvt || 52350;
  const rentaCop = data.renta_liquida_gravable || 0;
  const rentaUvt = data.renta_liquida_gravable_uvt !== undefined ? data.renta_liquida_gravable_uvt : (rentaCop / uvtVal);
  const impuestoCop = data.impuesto_bruto_renta || 0;
  const impuestoUvt = impuestoCop / uvtVal;
  const tarifaMarginal = data.tarifa_marginal_maxima || 0;
  const tarifaEfectiva = rentaCop > 0 ? (impuestoCop / rentaCop) * 100 : 0;

  const brackets = currentRules.persona_natural.cedula_general.tabla_marginal_art241;

  // Determinar en qué tramo se encuentra el usuario
  let activeBracketIdx = 0;
  for (let i = 0; i < brackets.length; i++) {
    if (rentaUvt >= brackets[i].desde_uvt) {
      activeBracketIdx = i;
    }
  }

  const activeBracket = brackets[activeBracketIdx];

  // 1. Actualizar KPIs
  const kpiRentaCop = document.getElementById('therm-kpi-renta-cop');
  const kpiRentaUvt = document.getElementById('therm-kpi-renta-uvt');
  const kpiMarginalRate = document.getElementById('therm-kpi-marginal-rate');
  const kpiMarginalBracket = document.getElementById('therm-kpi-marginal-bracket');
  const kpiEffectiveRate = document.getElementById('therm-kpi-effective-rate');
  const kpiTaxCop = document.getElementById('therm-kpi-tax-cop');
  const kpiTaxUvt = document.getElementById('therm-kpi-tax-uvt');

  if (kpiRentaCop) kpiRentaCop.innerText = formatCOP(rentaCop);
  if (kpiRentaUvt) kpiRentaUvt.innerText = `${rentaUvt.toLocaleString('es-CO', { maximumFractionDigits: 2 })} UVT`;
  if (kpiMarginalRate) kpiMarginalRate.innerText = `${(tarifaMarginal * 100).toFixed(0)}%`;
  if (kpiMarginalBracket) {
    const hastaTxt = activeBracket.hasta_uvt > 9000000 ? 'En adelante' : `${formatCOP(activeBracket.hasta_uvt, false)} UVT`;
    kpiMarginalBracket.innerText = `Tramo ${activeBracketIdx + 1} (${formatCOP(activeBracket.desde_uvt, false)} a ${hastaTxt})`;
  }
  if (kpiEffectiveRate) kpiEffectiveRate.innerText = `${tarifaEfectiva.toFixed(2)}%`;
  if (kpiTaxCop) kpiTaxCop.innerText = formatCOP(impuestoCop);
  if (kpiTaxUvt) kpiTaxUvt.innerText = `${impuestoUvt.toLocaleString('es-CO', { maximumFractionDigits: 2 })} UVT`;

  // 2. Actualizar Termómetro Gauge Pointer & Bars
  const statusBadge = document.getElementById('therm-current-status-badge');
  if (statusBadge) {
    statusBadge.innerText = `Estás en el Tramo ${activeBracketIdx + 1} (Tarifa Marginal: ${(activeBracket.tarifa * 100).toFixed(0)}%)`;
  }

  // Activar barra correspondiente
  for (let i = 0; i < 7; i++) {
    const bar = document.getElementById(`therm-tier-bar-${i}`);
    if (bar) {
      bar.className = (i === activeBracketIdx) ? `thermometer-bar-tier t${i} active-tier` : `thermometer-bar-tier t${i}`;
    }
  }

  // Calcular posición del pin en la escala
  const pointer = document.getElementById('therm-pointer');
  const pointerLabel = document.getElementById('therm-pointer-label');
  if (pointer && pointerLabel) {
    const range = (activeBracket.hasta_uvt > 9000000 ? 10000 : (activeBracket.hasta_uvt - activeBracket.desde_uvt)) || 1;
    const progressInTier = Math.min(1, Math.max(0, (rentaUvt - activeBracket.desde_uvt) / range));
    const tierWidthPct = 100 / 7;
    const pointerPct = (activeBracketIdx * tierWidthPct) + (progressInTier * tierWidthPct);
    const clampedPct = Math.min(96, Math.max(4, pointerPct));

    pointer.style.left = `${clampedPct.toFixed(1)}%`;
    pointerLabel.innerText = `📍 ${rentaUvt.toLocaleString('es-CO', { maximumFractionDigits: 0 })} UVT (${formatCOP(rentaCop)})`;
  }

  // 3. Generar tabla de rebanadas didácticas
  const slicesTbody = document.getElementById('therm-step-slices-tbody');
  if (slicesTbody) {
    slicesTbody.innerHTML = '';
    brackets.forEach((b, idx) => {
      const tr = document.createElement('tr');
      const desdeCop = b.desde_uvt * uvtVal;
      const hastaCop = b.hasta_uvt <= 9000000 ? b.hasta_uvt * uvtVal : null;
      const hastaTxtUvt = b.hasta_uvt > 9000000 ? 'En adelante' : `${formatCOP(b.hasta_uvt, false)} UVT`;
      const hastaTxtCop = hastaCop ? formatCOP(hastaCop) : 'En adelante';

      // Calcular porción de la renta que cae en este tramo
      let portionUvt = 0;
      if (rentaUvt > b.desde_uvt) {
        portionUvt = Math.min(rentaUvt, b.hasta_uvt) - b.desde_uvt;
      }
      const portionCop = Math.round(portionUvt * uvtVal);
      const taxInSliceCop = Math.round(portionCop * b.tarifa);

      let estadoHtml = '';
      if (idx < activeBracketIdx) {
        tr.className = 'completed-slice-row';
        estadoHtml = `<span style="color:#059669; font-weight:700; font-size:11px;">✓ 100% Lleno</span>`;
      } else if (idx === activeBracketIdx) {
        tr.className = 'active-slice-row';
        estadoHtml = `<span style="color:#2563eb; font-weight:800; font-size:11px; background:#dbeafe; padding:2px 6px; border-radius:4px;">📍 Tramo Activo</span>`;
      } else {
        tr.className = 'unreached-slice-row';
        estadoHtml = `<span style="color:#94a3b8; font-size:11px;">⚪ No alcanzado</span>`;
      }

      tr.innerHTML = `
        <td style="font-weight:700;">Tramo ${idx + 1}</td>
        <td style="font-family:var(--font-mono);">${formatCOP(b.desde_uvt, false)} - ${hastaTxtUvt}</td>
        <td style="font-family:var(--font-mono); color:var(--text-muted); font-size:11px;">${formatCOP(desdeCop)} - ${hastaTxtCop}</td>
        <td style="font-weight:800; color:${b.tarifa === 0 ? '#059669' : '#0b3b60'};">${(b.tarifa * 100).toFixed(0)}%</td>
        <td style="font-weight:700; font-family:var(--font-mono);">${formatCOP(portionCop)} <div style="font-size:10px; color:var(--text-muted);">${portionUvt.toLocaleString('es-CO', { maximumFractionDigits: 1 })} UVT</div></td>
        <td style="font-weight:800; font-family:var(--font-mono); color:${taxInSliceCop > 0 ? '#e11d48' : '#059669'};">${formatCOP(taxInSliceCop)}</td>
        <td>${estadoHtml}</td>
      `;
      slicesTbody.appendChild(tr);
    });
  }

  // 4. Inicializar simulador del mito con $1'000.000
  simulateMarginalIncrease(1000000);
}

function simulateMarginalIncrease(incrementCop) {
  if (!lastPnResult || !currentRules) return;
  const resultDiv = document.getElementById('myth-sim-result');
  if (!resultDiv) return;

  const uvtVal = lastPnResult.uvt_value || currentUvt || 52350;
  const currentRentaCop = lastPnResult.renta_liquida_gravable || 0;
  const newRentaCop = currentRentaCop + incrementCop;
  const newRentaUvt = newRentaCop / uvtVal;

  // Calcular nuevo impuesto
  const brackets = currentRules.persona_natural.cedula_general.tabla_marginal_art241;
  let newTaxCop = 0;

  brackets.forEach(b => {
    if (newRentaUvt > b.desde_uvt) {
      const sliceUvt = Math.min(newRentaUvt, b.hasta_uvt) - b.desde_uvt;
      newTaxCop += sliceUvt * uvtVal * b.tarifa;
    }
  });

  newTaxCop = Math.round(newTaxCop);
  const currentTaxCop = lastPnResult.impuesto_bruto_renta || 0;
  const extraTaxCop = Math.max(0, newTaxCop - currentTaxCop);
  const netPocketCop = incrementCop - extraTaxCop;
  const netPct = ((netPocketCop / incrementCop) * 100).toFixed(1);
  const marginalEffectiveRate = ((extraTaxCop / incrementCop) * 100).toFixed(0);

  resultDiv.innerHTML = `
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:10px; margin-bottom:8px;">
      <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:8px 10px; border-radius:6px;">
        <span style="font-size:10.5px; color:#64748b; font-weight:700;">Incremento Gravable:</span>
        <div style="font-size:14px; font-weight:800; color:#0b3b60; font-family:var(--font-mono);">+${formatCOP(incrementCop)}</div>
      </div>
      <div style="background:#fff1f2; border:1px solid #fecdd3; padding:8px 10px; border-radius:6px;">
        <span style="font-size:10.5px; color:#e11d48; font-weight:700;">Impuesto Adicional (${marginalEffectiveRate}%):</span>
        <div style="font-size:14px; font-weight:800; color:#e11d48; font-family:var(--font-mono);">+${formatCOP(extraTaxCop)}</div>
      </div>
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:8px 10px; border-radius:6px;">
        <span style="font-size:10.5px; color:#15803d; font-weight:700;">💵 En Tu Bolsillo (${netPct}%):</span>
        <div style="font-size:14px; font-weight:800; color:#15803d; font-family:var(--font-mono);">+${formatCOP(netPocketCop)}</div>
      </div>
    </div>
    <div style="font-size:11.5px; color:#334155; line-height:1.5;">
      🎯 <strong>Conclusión didáctica:</strong> De los <strong>${formatCOP(incrementCop)}</strong> que aumentaste, te quedan netos <strong>${formatCOP(netPocketCop)} (${netPct}%)</strong>. Solo pagas impuestos por el dinero nuevo que superó el umbral. ¡Tu dinero anterior no paga más!
    </div>
  `;
}

// CASILLAS POPOVER CONTROLLER
function initCasillaPopovers() {
  const popover = document.getElementById('casilla-popover');
  if (!popover) return;

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('.f210-casilla-num');
    if (target && !isPopoverPinned) {
      const casillaNum = target.getAttribute('data-casilla');
      if (casillaNum) {
        showCasillaPopover(casillaNum, target);
      }
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('.f210-casilla-num');
    if (target && !isPopoverPinned) {
      hideCasillaPopover();
    }
  });

  document.addEventListener('click', (e) => {
    const target = e.target.closest('.f210-casilla-num');
    if (target) {
      const casillaNum = target.getAttribute('data-casilla');
      if (casillaNum) {
        isPopoverPinned = true;
        showCasillaPopover(casillaNum, target);
        e.stopPropagation();
      }
    } else if (!e.target.closest('#casilla-popover')) {
      if (isPopoverPinned) {
        hideCasillaPopover();
      }
    }
  });
}

function showCasillaPopover(casillaNum, targetElement) {
  const popover = document.getElementById('casilla-popover');
  if (!popover) return;

  const info = (typeof CASILLAS_INFO !== 'undefined' && CASILLAS_INFO[casillaNum]) ? CASILLAS_INFO[casillaNum] : {
    titulo: `Casilla ${casillaNum}`,
    art: "Estatuto Tributario DIAN",
    concepto: "Rubro del Formulario 210 para la declaración de renta de personas naturales.",
    como_llenar: "Diligencie según soportes contables y certificados tributarios del año.",
    tope: "Sujeto a normas generales de fiscalización DIAN."
  };

  document.getElementById('popover-num').innerText = `Casilla ${casillaNum}`;
  document.getElementById('popover-title').innerText = info.titulo;
  document.getElementById('popover-art').innerText = info.art || 'E.T. Nacional';
  document.getElementById('popover-concepto').innerText = info.concepto;
  document.getElementById('popover-como-llenar').innerText = info.como_llenar;

  const secTope = document.getElementById('popover-section-tope');
  if (info.tope) {
    secTope.style.display = 'block';
    document.getElementById('popover-tope').innerText = info.tope;
  } else {
    secTope.style.display = 'none';
  }

  popover.style.display = 'block';

  if (window.innerWidth <= 768) {
    popover.style.left = '4vw';
    popover.style.top = 'auto';
    popover.style.bottom = '20px';
    popover.style.width = '92vw';
  } else {
    const rect = targetElement.getBoundingClientRect();
    const popoverWidth = 330;
    const popoverHeight = popover.offsetHeight || 260;
    
    let left = rect.left;
    let top = rect.bottom + 6;

    if (left + popoverWidth > window.innerWidth - 20) {
      left = window.innerWidth - popoverWidth - 20;
    }
    if (top + popoverHeight > window.innerHeight - 20) {
      top = rect.top - popoverHeight - 6;
    }
    if (left < 10) left = 10;
    if (top < 10) top = 10;

    popover.style.bottom = 'auto';
    popover.style.width = '330px';
    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
  }
}

function hideCasillaPopover() {
  const popover = document.getElementById('casilla-popover');
  if (popover) {
    popover.style.display = 'none';
  }
  isPopoverPinned = false;
}

// PRESETS DUMMY PN
function loadPnDefaultDummy() {
  document.getElementById('select-year').value = '2026';
  currentYear = 2026;
  currentUvt = 52350;
  document.getElementById('input-custom-uvt').value = '52350';
  document.getElementById('pn_nombre_declarante').value = 'CONTRIBUYENTE DEMO EJEMPLO UNO';
  document.getElementById('pn_nit_declarante').value = '9001234567';
  document.getElementById('cal-search-nit').value = '9001234567';
  setNum('pn_patrimonio_bruto', 300000000);
  setNum('pn_deudas', 80000000);
  setNum('pn_rentas_trabajo', 120000000);
  setNum('pn_viaticos', 0);
  setNum('pn_otros_ingresos', 0);
  setNum('pn_rentas_capital', 0);
  setNum('pn_incrngo_capital', 0);
  setNum('pn_rentas_nolaborales', 0);
  setNum('pn_incrngo_nolaborales', 0);
  setNum('pn_costos_nolaborales', 0);
  setNum('pn_salud', 4800000);
  setNum('pn_pension', 4800000);
  document.getElementById('pn_dependiente_general').checked = true;
  setNum('pn_prepagada', 0);
  setNum('pn_vivienda', 12000000);
  setNum('pn_gmf', 0);
  setNum('pn_factura_elec', 15000000);
  setNum('pn_afc', 10000000);
  setNum('pn_otras_exentas', 0);
  setNum('pn_go_activos', 0);
  setNum('pn_go_costos', 0);
  setNum('pn_go_herencias', 0);
  setNum('pn_go_loterias', 0);
  setNum('pn_go_exentas', 0);
  setNum('pn_retenciones', 5000000);
  setNum('pn_anticipo', 0);
  if (document.getElementById('pn_saldo_favor_anterior')) setNum('pn_saldo_favor_anterior', 0);
  loadRules(2026, 52350).then(() => {
    runPnCalc();
    consultarVencimientoNit();
  });
}

function loadPn35PercentPreset() {
  document.getElementById('select-year').value = '2026';
  currentYear = 2026;
  currentUvt = 52350;
  document.getElementById('input-custom-uvt').value = '52350';
  document.getElementById('pn_nombre_declarante').value = 'CONTRIBUYENTE DEMO EJEMPLO DOS';
  document.getElementById('pn_nit_declarante').value = '9008765432';
  document.getElementById('cal-search-nit').value = '9008765432';
  setNum('pn_patrimonio_bruto', 1200000000);
  setNum('pn_deudas', 200000000);
  setNum('pn_rentas_trabajo', 700000000);
  setNum('pn_viaticos', 0);
  setNum('pn_otros_ingresos', 0);
  setNum('pn_rentas_capital', 0);
  setNum('pn_incrngo_capital', 0);
  setNum('pn_rentas_nolaborales', 0);
  setNum('pn_incrngo_nolaborales', 0);
  setNum('pn_costos_nolaborales', 0);
  setNum('pn_salud', 28000000);
  setNum('pn_pension', 28000000);
  document.getElementById('pn_dependiente_general').checked = true;
  setNum('pn_prepagada', 10051200);
  setNum('pn_vivienda', 62820000);
  setNum('pn_gmf', 4000000);
  setNum('pn_factura_elec', 20000000);
  setNum('pn_afc', 50000000);
  setNum('pn_otras_exentas', 0);
  setNum('pn_go_activos', 0);
  setNum('pn_go_costos', 0);
  setNum('pn_go_herencias', 0);
  setNum('pn_go_loterias', 0);
  setNum('pn_go_exentas', 0);
  setNum('pn_retenciones', 140000000);
  setNum('pn_anticipo', 0);
  if (document.getElementById('pn_saldo_favor_anterior')) setNum('pn_saldo_favor_anterior', 0);
  loadRules(2026, 52350).then(() => {
    runPnCalc();
    consultarVencimientoNit();
  });
}

function loadPnWithGoDummy() {
  document.getElementById('select-year').value = '2026';
  currentYear = 2026;
  currentUvt = 52350;
  document.getElementById('input-custom-uvt').value = '52350';
  document.getElementById('pn_nombre_declarante').value = 'CONTRIBUYENTE DEMO EJEMPLO TRES';
  document.getElementById('pn_nit_declarante').value = '9876543210';
  document.getElementById('cal-search-nit').value = '9876543210';
  setNum('pn_patrimonio_bruto', 500000000);
  setNum('pn_deudas', 100000000);
  setNum('pn_rentas_trabajo', 150000000);
  setNum('pn_viaticos', 0);
  setNum('pn_otros_ingresos', 0);
  setNum('pn_rentas_capital', 12000000);
  setNum('pn_incrngo_capital', 500000);
  setNum('pn_rentas_nolaborales', 0);
  setNum('pn_incrngo_nolaborales', 0);
  setNum('pn_costos_nolaborales', 0);
  setNum('pn_salud', 6000000);
  setNum('pn_pension', 6000000);
  document.getElementById('pn_dependiente_general').checked = true;
  setNum('pn_prepagada', 6000000);
  setNum('pn_vivienda', 18000000);
  setNum('pn_gmf', 1000000);
  setNum('pn_factura_elec', 20000000);
  setNum('pn_afc', 20000000);
  setNum('pn_otras_exentas', 0);
  setNum('pn_go_activos', 200000000);
  setNum('pn_go_costos', 140000000);
  setNum('pn_go_herencias', 0);
  setNum('pn_go_loterias', 0);
  setNum('pn_go_exentas', 0);
  setNum('pn_retenciones', 12000000);
  setNum('pn_anticipo', 0);
  if (document.getElementById('pn_saldo_favor_anterior')) setNum('pn_saldo_favor_anterior', 0);
  loadRules(2026, 52350).then(() => {
    runPnCalc();
    consultarVencimientoNit();
  });
}

// PERSONA JURIDICA - CÁLCULO
function triggerPjCalc() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runPjCalc, 150);
}

async function runPjCalc() {
  const payload = {
    tax_year: currentYear,
    custom_uvt: currentUvt,
    ingresos_brutos_operacionales: getNum('pj_ingresos_op'),
    ingresos_brutos_no_operacionales: getNum('pj_ingresos_noop'),
    devoluciones_rebajas_descuentos: getNum('pj_devoluciones'),
    ingresos_no_constitutivos_renta: getNum('pj_incrngo'),
    costos_procedentes: getNum('pj_costos'),
    gastos_administracion: getNum('pj_gastos_admin'),
    gastos_ventas: getNum('pj_gastos_ventas'),
    gastos_financieros: getNum('pj_gastos_fin'),
    gastos_no_deducibles: getNum('pj_gastos_no_deducibles'),
    deducciones_especiales: 0,
    rentas_exentas: getNum('pj_rentas_exentas'),
    compensacion_perdidas_fiscales: getNum('pj_compensacion'),
    compensacion_exceso_renta_presuntiva: 0,
    utilidad_contable_antes_impuestos: getNum('pj_utilidad_contable'),
    diferencias_permanentes_ttd: 0,
    ganancia_ocasional_gravable: 0,
    descuento_tributario_ica: getNum('pj_desc_ica'),
    otros_descuentos_tributarios: 0,
    retenciones_en_la_fuente: getNum('pj_retenciones'),
    autorretenciones_practicadas: getNum('pj_autorretenciones'),
    anticipo_ano_anterior: 0,
    saldo_a_favor_ano_anterior: 0
  };

  try {
    const res = await fetch('/api/v1/calculate/persona-juridica/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error en cálculo PJ');
    const data = await res.json();
    lastPjResult = data;
    renderPjResult(data);
    syncUiStateToBackend();
  } catch (err) {
    console.error(err);
  }
}

function renderPjResult(data) {
  window._lastPjResult = data;
  const kpiBox = document.getElementById('pj-kpi-box');
  const kpiLabel = document.getElementById('pj-kpi-label');
  const kpiValue = document.getElementById('pj-kpi-value');
  const kpiBadge = document.getElementById('pj-kpi-badge');

  if (data.saldo_a_pagar > 0) {
    kpiBox.className = 'kpi-banner to-pay';
    kpiLabel.innerText = 'Saldo a Pagar (Formulario 110)';
    kpiValue.innerText = `${formatCOP(data.saldo_a_pagar)} COP`;
    kpiBadge.innerText = `Tarifa: ${(data.tarifa_renta_aplicada * 100).toFixed(0)}%`;
  } else {
    kpiBox.className = 'kpi-banner favorable';
    kpiLabel.innerText = 'Saldo a Favor';
    kpiValue.innerText = `${formatCOP(data.saldo_a_favor)} COP`;
    kpiBadge.innerText = '✓ Saldo a Favor';
  }

  const ttdAlert = document.getElementById('pj-ttd-alert');
  const ttdAlertText = document.getElementById('pj-ttd-alert-text');
  const rowIaTtd = document.getElementById('res-pj-row-ia-ttd');

  if (data.aplica_impuesto_adicional_ttd) {
    ttdAlert.style.display = 'block';
    ttdAlertText.innerText = `La Tasa Depurada (${(data.ttd_calculada_pct * 100).toFixed(2)}%) es inferior al 15%. Se generó un Impuesto Adicional (IA) de ${formatCOP(data.impuesto_adicional_ttd)} COP según Art. 240 Par. 6.`;
    rowIaTtd.style.display = 'table-row';
    document.getElementById('res-pj-ia-ttd').innerText = `+${formatCOP(data.impuesto_adicional_ttd)}`;
  } else {
    ttdAlert.style.display = 'none';
    rowIaTtd.style.display = 'none';
  }

  document.getElementById('res-pj-ingresos-netos').innerText = formatCOP(data.ingresos_netos);
  document.getElementById('res-pj-costos').innerText = `-${formatCOP(getNum('pj_costos'))}`;
  document.getElementById('res-pj-renta-bruta').innerText = formatCOP(data.renta_bruta);
  document.getElementById('res-pj-gastos').innerText = `-${formatCOP(data.total_gastos_deducibles)}`;
  document.getElementById('res-pj-renta-gravable').innerText = formatCOP(data.renta_liquida_gravable);
  document.getElementById('res-pj-impuesto-basico').innerText = formatCOP(data.impuesto_basico_renta);
  document.getElementById('res-pj-descuentos').innerText = `-${formatCOP(data.total_descuentos_tributarios_aplicados)}`;
  document.getElementById('res-pj-impuesto-neto').innerText = formatCOP(data.impuesto_neto_total);
  document.getElementById('res-pj-retenciones').innerText = `-${formatCOP(data.total_retenciones_y_anticipos)}`;
}

function loadPjStandardPreset() {
  setNum('pj_ingresos_op', 1200000000);
  setNum('pj_ingresos_noop', 50000000);
  setNum('pj_devoluciones', 20000000);
  setNum('pj_incrngo', 10000000);
  setNum('pj_costos', 650000000);
  setNum('pj_gastos_admin', 180000000);
  setNum('pj_gastos_ventas', 100000000);
  setNum('pj_gastos_fin', 30000000);
  setNum('pj_gastos_no_deducibles', 15000000);
  setNum('pj_rentas_exentas', 0);
  setNum('pj_compensacion', 0);
  setNum('pj_utilidad_contable', 260000000);
  setNum('pj_desc_ica', 12000000);
  setNum('pj_retenciones', 35000000);
  setNum('pj_autorretenciones', 20000000);
  runPjCalc();
}

function loadPjTtdPreset() {
  setNum('pj_ingresos_op', 800000000);
  setNum('pj_ingresos_noop', 0);
  setNum('pj_devoluciones', 0);
  setNum('pj_incrngo', 0);
  setNum('pj_costos', 500000000);
  setNum('pj_gastos_admin', 220000000);
  setNum('pj_gastos_ventas', 30000000);
  setNum('pj_gastos_fin', 0);
  setNum('pj_gastos_no_deducibles', 0);
  setNum('pj_rentas_exentas', 40000000);
  setNum('pj_compensacion', 0);
  setNum('pj_utilidad_contable', 450000000);
  setNum('pj_desc_ica', 0);
  setNum('pj_retenciones', 5000000);
  setNum('pj_autorretenciones', 3000000);
  runPjCalc();
}

// BENEFICIOS CATALOG & SIMULATORS
async function loadBeneficiosCatalog() {
  try {
    const res = await fetch('/api/v1/beneficios/catalog');
    if (!res.ok) throw new Error('Error al cargar catálogo');
    allBeneficios = await res.json();
    renderBeneficiosList('all');
  } catch (err) {
    console.error(err);
  }
}

let currentBeneficioCategory = 'all';

function filterBeneficios(cat, btn) {
  currentBeneficioCategory = cat;
  document.querySelectorAll('.beneficio-filter-bar button').forEach(b => {
    b.className = 'btn btn-outline btn-sm';
  });
  if (btn) btn.className = 'btn btn-primary btn-sm';
  renderBeneficiosList(cat);
}

function filterBeneficiosByText() {
  const searchInput = document.getElementById('search-beneficios-input');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  renderBeneficiosList(currentBeneficioCategory, query);
}

function renderBeneficiosList(cat, query = '') {
  const container = document.getElementById('beneficios-list-container');
  if (!container) return;
  
  let filtered = cat === 'all' ? allBeneficios : allBeneficios.filter(b => b.categoria === cat);

  if (query) {
    filtered = filtered.filter(b => 
      b.nombre.toLowerCase().includes(query) ||
      b.articulo_et.toLowerCase().includes(query) ||
      b.descripcion.toLowerCase().includes(query) ||
      b.tope_legal_texto.toLowerCase().includes(query)
    );
  }

  container.innerHTML = '';

  if (!filtered || filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #64748b; background: white; border-radius: 8px; border: 1px dashed #cbd5e1;">
        <div style="font-size: 24px; margin-bottom: 8px;">🔍</div>
        <div style="font-weight: 600;">No se encontraron beneficios tributarios que coincidan con la búsqueda.</div>
      </div>
    `;
    return;
  }

  filtered.forEach(b => {
    const div = document.createElement('div');
    div.className = 'beneficio-card';
    div.innerHTML = `
      <div class="beneficio-header">
        <span class="beneficio-title">${b.nombre}</span>
        <span class="beneficio-art">${b.articulo_et}</span>
      </div>
      <p class="beneficio-desc">${b.descripcion}</p>
      <div class="beneficio-meta">
        <span>Tope Legal: <strong>${b.tope_legal_texto}</strong></span>
        <span>Ejemplo: <em>${b.ejemplo_calculo}</em></span>
      </div>
    `;
    container.appendChild(div);
  });
}

// SIMULADOR BENEFICIO DE AUDITORÍA (Art. 689-3 E.T.)
async function runSimulacionAuditoria() {
  const inputVal = getNum('sim-aud-impuesto-ant');
  const resDiv = document.getElementById('sim-aud-result');
  if (!resDiv) return;

  try {
    const res = await fetch('/api/v1/beneficios/simular-auditoria', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tax_year: currentYear,
        impuesto_neto_ano_anterior: inputVal,
        custom_uvt: currentUvt
      })
    });
    const data = await res.json();

    if (data.cumple_impuesto_minimo) {
      resDiv.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:8px;">
          <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:8px; border-radius:6px;">
            <div style="font-weight:800; color:#1e3a8a; font-size:11px;">⚡ FIRMEZA EN 6 MESES (+35%)</div>
            <div style="font-size:15px; font-weight:800; font-family:var(--font-mono); color:#1e3a8a;">${formatCOP(data.impuesto_objetivo_6_meses_cop)}</div>
            <div style="font-size:10px; color:#475569; margin-top:2px;">Incremento requerido: +${formatCOP(data.incremento_requerido_6_meses_cop)}</div>
          </div>
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:8px; border-radius:6px;">
            <div style="font-weight:800; color:#15803d; font-size:11px;">⚡ FIRMEZA EN 12 MESES (+25%)</div>
            <div style="font-size:15px; font-weight:800; font-family:var(--font-mono); color:#15803d;">${formatCOP(data.impuesto_objetivo_12_meses_cop)}</div>
            <div style="font-size:10px; color:#475569; margin-top:2px;">Incremento requerido: +${formatCOP(data.incremento_requerido_12_meses_cop)}</div>
          </div>
        </div>
        <div style="font-size:11px; color:#334155; line-height:1.4;">${data.recomendacion}</div>
      `;
    } else {
      resDiv.innerHTML = `
        <div style="color:#b45309; font-size:11px; background:#fffbeb; padding:8px; border-radius:6px; border:1px solid #fde68a;">
          ⚠️ ${data.recomendacion}
        </div>
      `;
    }
  } catch (err) {
    console.error(err);
  }
}

// CALCULADORA INTEGRAL DE SANCIONES (Art. 640, 641, 642, 644, 647, 648, 634, 635, 639)
function toggleSancionFields() {
  const tipo = document.getElementById('sancion-calc-tipo')?.value || 'correccion';
  const label = document.getElementById('sancion-monto-base-label');
  const mesesContainer = document.getElementById('sancion-meses-container');
  const voluntarioContainer = document.getElementById('sancion-voluntario-container');
  const art640Container = document.getElementById('sancion-art640-container');

  if (tipo === 'extemporaneidad') {
    if (label) label.innerText = 'Impuesto a Cargo Liquidado ($ COP)';
    if (mesesContainer) mesesContainer.style.display = 'block';
    if (voluntarioContainer) voluntarioContainer.style.display = 'block';
    if (art640Container) art640Container.style.display = 'block';
  } else if (tipo === 'correccion') {
    if (label) label.innerText = 'Mayor Valor a Pagar por Corrección ($ COP)';
    if (mesesContainer) mesesContainer.style.display = 'none';
    if (voluntarioContainer) voluntarioContainer.style.display = 'block';
    if (art640Container) art640Container.style.display = 'block';
  } else if (tipo === 'inexactitud_general') {
    if (label) label.innerText = 'Mayor Valor Determinado / Menor Saldo a Favor ($ COP)';
    if (mesesContainer) mesesContainer.style.display = 'none';
    if (voluntarioContainer) voluntarioContainer.style.display = 'none';
    if (art640Container) art640Container.style.display = 'block';
  } else if (tipo === 'inexactitud_facturas_falsas' || tipo === 'inexactitud_abuso') {
    if (label) label.innerText = 'Mayor Valor por Costos/Deducciones Falsas ($ COP)';
    if (mesesContainer) mesesContainer.style.display = 'none';
    if (voluntarioContainer) voluntarioContainer.style.display = 'none';
    if (art640Container) art640Container.style.display = 'none';
  } else if (tipo === 'inexactitud_req_especial' || tipo === 'inexactitud_recurso') {
    if (label) label.innerText = 'Mayor Valor Propuesto en Requerimiento/Liquidación ($ COP)';
    if (mesesContainer) mesesContainer.style.display = 'none';
    if (voluntarioContainer) voluntarioContainer.style.display = 'none';
    if (art640Container) art640Container.style.display = 'none';
  }
}

function toggleMoraFields() {
  const chk = document.getElementById('sancion-calc-check-mora');
  const grid = document.getElementById('sancion-mora-inputs-grid');
  if (grid) {
    grid.style.display = (chk && chk.checked) ? 'grid' : 'none';
  }
}

function toggleSaldoFavor() {
  const chk = document.getElementById('sancion-calc-saldo-favor');
  const moraWrapper = document.getElementById('sancion-mora-wrapper');
  if (chk && chk.checked) {
    if (moraWrapper) moraWrapper.style.opacity = '0.5';
  } else {
    if (moraWrapper) moraWrapper.style.opacity = '1';
  }
}

function cargarSaldoActualParaSanciones() {
  const saldoPn = window._lastPnResult?.saldo_a_pagar || 0;
  const saldoPnFavor = window._lastPnResult?.saldo_a_favor || 0;
  const saldoPj = window._lastPjResult?.saldo_a_pagar || 0;
  const saldoPjFavor = window._lastPjResult?.saldo_a_favor || 0;

  const saldo = saldoPn || saldoPj || 0;
  const esFavor = (saldoPnFavor > 0 && saldoPn === 0) || (saldoPjFavor > 0 && saldoPj === 0);

  const input = document.getElementById('sancion-calc-monto-base');
  const chkFavor = document.getElementById('sancion-calc-saldo-favor');

  if (saldo > 0) {
    if (input) input.value = formatCOP(saldo, false);
    if (chkFavor) chkFavor.checked = false;
    toggleSaldoFavor();
    runCalculadoraSanciones();
  } else if (esFavor) {
    const favorMonto = saldoPnFavor || saldoPjFavor;
    if (input) input.value = formatCOP(favorMonto, false);
    if (chkFavor) chkFavor.checked = true;
    toggleSaldoFavor();
    runCalculadoraSanciones();
  } else {
    // Si aún no se ha liquidado PN o PJ, cargar un valor sugerido de 10.000.000 COP
    if (input) input.value = "10'000.000";
    if (chkFavor) chkFavor.checked = false;
    toggleSaldoFavor();
    runCalculadoraSanciones();
  }
}

function handleSancionHistoryCheck(source) {
  const chk2 = document.getElementById('sancion-calc-check-2anos');
  const chk1 = document.getElementById('sancion-calc-check-1ano');
  if (source === '2anos' && chk2 && chk2.checked && chk1) {
    chk1.checked = true;
  }
}

async function runCalculadoraSanciones() {
  const tipo = document.getElementById('sancion-calc-tipo')?.value || 'correccion';
  const montoBase = getNum('sancion-calc-monto-base');
  const meses = parseInt(document.getElementById('sancion-calc-meses')?.value || '1', 10) || 1;
  const esVoluntario = document.getElementById('sancion-calc-voluntario')?.checked ?? true;
  const sinSanciones2 = document.getElementById('sancion-calc-check-2anos')?.checked ?? true;
  const sinSanciones1 = document.getElementById('sancion-calc-check-1ano')?.checked ?? true;
  const esSaldoFavor = document.getElementById('sancion-calc-saldo-favor')?.checked ?? false;
  const incluirMora = document.getElementById('sancion-calc-check-mora')?.checked ?? true;
  const diasMora = parseInt(document.getElementById('sancion-calc-dias-mora')?.value || '60', 10) || 0;
  const tasaMora = parseFloat(document.getElementById('sancion-calc-tasa-mora')?.value || '23.0') || 0.0;
  const resDiv = document.getElementById('sancion-calc-result-box');
  if (!resDiv) return;

  try {
    const res = await fetch('/api/v1/beneficios/calcular-sancion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo_sancion: tipo,
        monto_base_cop: montoBase,
        meses_fraccion_retraso: meses,
        es_voluntario_sin_emplazamiento: esVoluntario,
        sin_sanciones_ultimos_2_anos: sinSanciones2,
        sin_sanciones_ultimo_1_ano: sinSanciones1,
        es_saldo_a_favor: esSaldoFavor,
        incluir_intereses_mora: incluirMora,
        dias_mora: diasMora,
        tasa_interes_anual_pct: tasaMora,
        tax_year: currentYear,
        custom_uvt: currentUvt
      })
    });
    const data = await res.json();

    const montoCapital = data.monto_base_cop !== undefined ? data.monto_base_cop : montoBase;
    const sancionPagar = data.sancion_final_a_pagar_cop !== undefined ? data.sancion_final_a_pagar_cop : 0;
    const esFavor = data.es_saldo_a_favor ?? esSaldoFavor;

    // Si el backend es de una versión previa o no trae intereses_mora_cop, calcularlos con la fórmula oficial
    let interesesMora = 0;
    if (!esFavor && incluirMora && montoCapital > 0 && diasMora > 0) {
      if (data.intereses_mora_cop !== undefined) {
        interesesMora = data.intereses_mora_cop;
      } else {
        const factor = Math.pow(1.0 + (tasaMora / 100.0), diasMora / 365.0) - 1.0;
        interesesMora = Math.round((montoCapital * factor) / 1000.0) * 1000.0;
      }
    }

    const totalConsolidado = data.total_consolidado_a_pagar_cop !== undefined
      ? data.total_consolidado_a_pagar_cop
      : (esFavor ? sancionPagar : (montoCapital + sancionPagar + interesesMora));

    const tieneMora = !esFavor && incluirMora && interesesMora > 0;
    const diasMoraVal = data.dias_mora !== undefined ? data.dias_mora : diasMora;
    const tasaMoraVal = data.tasa_interes_anual_pct !== undefined ? data.tasa_interes_anual_pct : tasaMora;

    let pasosHtml = Array.isArray(data.pasos_calculo) 
      ? data.pasos_calculo.map(p => `<li>${p}</li>`).join('')
      : `<li>Sanción liquidada: ${formatCOP(sancionPagar)} COP</li><li>Capital base: ${formatCOP(montoCapital)} COP</li>`;

    resDiv.innerHTML = `
      <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
        <!-- GRAN TOTAL CONSOLIDADO -->
        <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 10px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #166534; text-transform: uppercase;">
                ${esFavor ? 'Total Sanción a Pagar (Sin Intereses por Saldo a Favor):' : 'Gran Total Consolidado a Pagar (Capital + Sanción + Mora):'}
              </div>
              <div style="font-size: 20px; font-weight: 900; font-family: var(--font-mono); color: #15803d;">
                ${formatCOP(totalConsolidado)} COP
              </div>
            </div>
            <span class="badge badge-success" style="font-size: 11px;">
              ${esFavor ? '🛡️ Saldo a Favor ($0 Mora)' : (tieneMora ? `Con ${diasMoraVal} días de mora` : 'Sin intereses')}
            </span>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
          <span style="font-weight: 700; color: #0f172a; font-size: 13px;">1. Sanción Liquidada a Pagar:</span>
          <span style="font-size: 16px; font-weight: 900; font-family: var(--font-mono); color: #059669;">
            ${formatCOP(sancionPagar)} COP
          </span>
        </div>

        ${tieneMora ? `
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px dashed #e2e8f0;">
            <span style="font-weight: 700; color: #6b21a8; font-size: 13px;">2. Intereses Moratorios (${diasMoraVal} días @ ${tasaMoraVal.toFixed(1)}% E.A.):</span>
            <span style="font-size: 16px; font-weight: 900; font-family: var(--font-mono); color: #7e22ce;">
              ${formatCOP(interesesMora)} COP
            </span>
          </div>
        ` : ''}

        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
          <span class="badge ${data.aplico_sancion_minima ? 'badge-warning' : 'badge-success'}">
            ${data.aplico_sancion_minima ? '⚠️ Aplica Sanción Mínima (10 UVT)' : `Descuento Art. 640: ${(data.porcentaje_reduccion_art640_pct || 0).toFixed(0)}%`}
          </span>
          <span class="badge badge-info">Tarifa Base: ${(data.tarifa_base_pct || 10).toFixed(0)}%</span>
        </div>

        <div class="responsive-grid-equal" style="gap: 8px; font-size: 11px; background: #f8fafc; padding: 8px; border-radius: 6px;">
          <div>Capital Base Insoluto: <strong>${formatCOP(montoCapital)}</strong></div>
          <div>Sanción Plena (Sin Descuento): <strong>${formatCOP(data.sancion_plena_sin_reduccion_cop || sancionPagar)}</strong></div>
          <div>Ahorro Favorabilidad Art. 640: <strong style="color:#166534;">${formatCOP(data.ahorro_favorabilidad_art640_cop || 0)}</strong></div>
          <div>Ahorro vs Escenario Emplazado: <strong style="color:#166534;">${formatCOP(data.ahorro_por_corregir_antes_de_dian_cop || 0)}</strong></div>
        </div>
      </div>

      <div style="font-size: 11.5px; color: #334155; line-height: 1.45; margin-bottom: 8px;">
        ${data.explicacion_didactica || ''}
      </div>

      <details style="font-size: 11px; color: #475569; cursor: pointer;">
        <summary style="font-weight: 700; color: var(--primary);">Desglose Matemático y Fundamento Legal ▾</summary>
        <ul style="margin: 6px 0 0 16px; padding: 0; line-height: 1.5;">
          ${pasosHtml}
        </ul>
      </details>
    `;
  } catch (err) {
    console.error(err);
  }
}

function runSimulacionSanciones() {
  return runCalculadoraSanciones();
}

// SIMULADOR INMUEBLES & CUENTAS AFC (5 Estrategias Legales: Arts. 70, 72, 73, 44, 311-1, 126-4, 398, 399)
function toggleMetodoCostoAfc() {
  const metodo = document.getElementById('afc-sim-metodo-costo')?.value || 'art73';
  const customContainer = document.getElementById('afc-sim-costo-personalizado-container');
  const customLabel = document.getElementById('afc-sim-costo-personalizado-label');
  if (!customContainer || !customLabel) return;

  if (metodo === 'art72') {
    customContainer.style.display = 'block';
    customLabel.innerText = 'Valor del Autoavalúo Predial / Catastral Año Anterior ($ COP)';
  } else if (metodo === 'art70') {
    customContainer.style.display = 'block';
    customLabel.innerText = 'Costo Fiscal Ajustado Acumulado por Art. 70 ($ COP)';
  } else {
    customContainer.style.display = 'none';
  }
}

function loadPresetAfcEjemplo1() {
  setNum('afc-sim-precio-venta', 450000000);
  setNum('afc-sim-costo-historico', 150000000);
  const anoSel = document.getElementById('afc-sim-ano-adquisicion');
  if (anoSel) anoSel.value = '2011';
  const tipoSel = document.getElementById('afc-sim-tipo-inmueble');
  if (tipoSel) tipoSel.value = 'bienes_raices_urbanos';
  const metodoSel = document.getElementById('afc-sim-metodo-costo');
  if (metodoSel) metodoSel.value = 'art73';
  setNum('afc-sim-costo-personalizado', 0);
  setNum('afc-sim-mejoras', 0);
  setNum('afc-sim-depreciacion', 0);
  setNum('afc-sim-monto-afc', 21000000);
  const chkVivienda = document.getElementById('afc-sim-check-vivienda');
  if (chkVivienda) chkVivienda.checked = true;
  const chkPos = document.getElementById('afc-sim-check-posesion');
  if (chkPos) chkPos.checked = true;
  toggleMetodoCostoAfc();
  runSimulacionInmuebleAfc();
  showToast('✓ Ejemplo 1 cargado: Venta $450M, Compra 2011 por $150M y Cuenta AFC', 'success', 3000);
}

function loadPresetAfcPre1987() {
  setNum('afc-sim-precio-venta', 600000000);
  setNum('afc-sim-costo-historico', 25000000);
  const anoSel = document.getElementById('afc-sim-ano-adquisicion');
  if (anoSel) anoSel.value = '1983';
  const tipoSel = document.getElementById('afc-sim-tipo-inmueble');
  if (tipoSel) tipoSel.value = 'bienes_raices_urbanos';
  const metodoSel = document.getElementById('afc-sim-metodo-costo');
  if (metodoSel) metodoSel.value = 'art73';
  setNum('afc-sim-costo-personalizado', 0);
  setNum('afc-sim-mejoras', 0);
  setNum('afc-sim-depreciacion', 0);
  setNum('afc-sim-monto-afc', 0);
  const chkVivienda = document.getElementById('afc-sim-check-vivienda');
  if (chkVivienda) chkVivienda.checked = true;
  const chkPos = document.getElementById('afc-sim-check-posesion');
  if (chkPos) chkPos.checked = true;
  toggleMetodoCostoAfc();
  runSimulacionInmuebleAfc();
  showToast('✓ Ejemplo Pre-1987 cargado: Vivienda 1983 con 40% exención Art. 44', 'success', 3000);
}

function loadPresetAfcVivienda() {
  setNum('afc-sim-precio-venta', 800000000);
  setNum('afc-sim-costo-historico', 350000000);
  const anoSel = document.getElementById('afc-sim-ano-adquisicion');
  if (anoSel) anoSel.value = '2018';
  const tipoSel = document.getElementById('afc-sim-tipo-inmueble');
  if (tipoSel) tipoSel.value = 'bienes_raices_urbanos';
  const metodoSel = document.getElementById('afc-sim-metodo-costo');
  if (metodoSel) metodoSel.value = 'art73';
  setNum('afc-sim-costo-personalizado', 0);
  setNum('afc-sim-mejoras', 0);
  setNum('afc-sim-depreciacion', 0);
  setNum('afc-sim-monto-afc', 261750000);
  const chkVivienda = document.getElementById('afc-sim-check-vivienda');
  if (chkVivienda) chkVivienda.checked = true;
  const chkPos = document.getElementById('afc-sim-check-posesion');
  if (chkPos) chkPos.checked = true;
  toggleMetodoCostoAfc();
  runSimulacionInmuebleAfc();
  showToast('✓ Ejemplo Vivienda + AFC cargado: Exención 5.000 UVT Art. 311-1', 'success', 3000);
}

function loadPresetAfcRural() {
  setNum('afc-sim-precio-venta', 1200000000);
  setNum('afc-sim-costo-historico', 200000000);
  const anoSel = document.getElementById('afc-sim-ano-adquisicion');
  if (anoSel) anoSel.value = '2008';
  const tipoSel = document.getElementById('afc-sim-tipo-inmueble');
  if (tipoSel) tipoSel.value = 'bienes_raices_rurales_agro';
  const metodoSel = document.getElementById('afc-sim-metodo-costo');
  if (metodoSel) metodoSel.value = 'art73';
  setNum('afc-sim-costo-personalizado', 0);
  setNum('afc-sim-mejoras', 50000000);
  setNum('afc-sim-depreciacion', 0);
  setNum('afc-sim-monto-afc', 0);
  const chkVivienda = document.getElementById('afc-sim-check-vivienda');
  if (chkVivienda) chkVivienda.checked = false;
  const chkPos = document.getElementById('afc-sim-check-posesion');
  if (chkPos) chkPos.checked = true;
  toggleMetodoCostoAfc();
  runSimulacionInmuebleAfc();
  showToast('✓ Ejemplo Finca Rural cargado: Reajuste Art. 73 Rural + Mejoras', 'success', 3000);
}

function setCurrencyVal(elemId, num) {
  setNum(elemId, num);
}

async function runSimulacionInmuebleAfc() {
  const precioVenta = getNum('afc-sim-precio-venta');
  const costoHistorico = getNum('afc-sim-costo-historico');
  const anoAdquisicion = document.getElementById('afc-sim-ano-adquisicion')?.value || '2011';
  const tipoInmueble = document.getElementById('afc-sim-tipo-inmueble')?.value || 'bienes_raices_urbanos';
  const metodoCosto = document.getElementById('afc-sim-metodo-costo')?.value || 'art73';
  const costoPersonalizado = getNum('afc-sim-costo-personalizado');
  const mejoras = getNum('afc-sim-mejoras');
  const depreciacion = getNum('afc-sim-depreciacion');
  const montoAfc = getNum('afc-sim-monto-afc');
  const esVivienda = document.getElementById('afc-sim-check-vivienda')?.checked ?? true;
  const esPosesion = document.getElementById('afc-sim-check-posesion')?.checked ?? true;
  const resDiv = document.getElementById('afc-sim-result-box');
  if (!resDiv) return;

  try {
    const res = await fetch('/api/v1/beneficios/simular-inmueble-afc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        precio_venta_cop: precioVenta,
        costo_adquisicion_historico_cop: costoHistorico,
        ano_adquisicion: anoAdquisicion,
        tipo_inmueble: tipoInmueble,
        metodo_costo_fiscal: metodoCosto,
        costo_fiscal_personalizado_cop: costoPersonalizado,
        mejoras_y_contribuciones_cop: mejoras,
        depreciacion_acumulada_deducida_cop: depreciacion,
        monto_depositado_afc_o_vivienda_cop: montoAfc,
        es_vivienda_habitacion: esVivienda,
        posesion_mas_2_anos: esPosesion,
        tax_year: currentYear,
        custom_uvt: currentUvt
      })
    });
    const data = await res.json();

    let pasosHtml = (data.explicacion_paso_a_paso || []).map(p => `<li>${p}</li>`).join('');

    let escenariosRows = (data.escenarios || []).map(e => `
      <tr style="${e.es_escenario_actual ? 'background: #f0fdf4; font-weight: 700;' : ''}">
        <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0;">
          ${e.es_escenario_actual ? '👉 <strong>' + e.nombre + '</strong>' : e.nombre}
        </td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-family: var(--font-mono); text-align: right;">${formatCOP(e.costo_fiscal_cop)}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-family: var(--font-mono); text-align: right;">${formatCOP(e.ganancia_gravable_cop)}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-family: var(--font-mono); text-align: right; color: ${e.impuesto_go_cop > 0 ? '#991b1b' : '#059669'};">${formatCOP(e.impuesto_go_cop)}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-family: var(--font-mono); text-align: right; color: #059669; font-weight: 800;">${formatCOP(e.ahorro_vs_base_cop)}</td>
      </tr>
    `).join('');

    resDiv.innerHTML = `
      <div style="background: white; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-bottom: 12px; border-left: 4px solid #10b981;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; flex-wrap: wrap;">
          <span style="font-weight: 700; color: #065f46;">AHORRO TRIBUTARIO NETO:</span>
          <span style="font-size: 22px; font-weight: 900; font-family: var(--font-mono); color: #059669;">
            ${formatCOP(data.ahorro_total_impuesto_cop)} COP (${data.porcentaje_ahorro_tributario_pct}%)
          </span>
        </div>
        <div style="font-size: 11px; color: #047857; font-weight: 600;">
          Impuesto Sin Planeación: ${formatCOP(data.impuesto_go_sin_beneficios_cop)} ➔ Impuesto Final con Beneficios: ${formatCOP(data.impuesto_go_con_beneficios_cop)} COP
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; margin-bottom: 12px; font-size: 11.5px;">
        <div style="background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <div style="color: #64748b; font-size: 9.5px; text-transform: uppercase;">Costo Fiscal Determinado:</div>
          <div style="font-weight: 800; font-size: 12.5px; color: #0f172a; font-family: var(--font-mono);">${formatCOP(data.costo_fiscal_determinado_cop)}</div>
        </div>
        <div style="background: #eff6ff; padding: 8px; border-radius: 6px; border: 1px solid #bfdbfe;">
          <div style="color: #1e40af; font-size: 9.5px; text-transform: uppercase;">Utilidad Bruta:</div>
          <div style="font-weight: 800; font-size: 12.5px; color: #1e3a8a; font-family: var(--font-mono);">${formatCOP(data.ganancia_ocasional_bruta_cop)}</div>
        </div>
        <div style="background: #f0fdf4; padding: 8px; border-radius: 6px; border: 1px solid #bbf7d0;">
          <div style="color: #15803d; font-size: 9.5px; text-transform: uppercase;">Total Ganancia Exenta:</div>
          <div style="font-weight: 800; font-size: 12.5px; color: #166534; font-family: var(--font-mono);">${formatCOP(data.total_ganancia_exenta_cop)}</div>
        </div>
        <div style="background: #fffbeb; padding: 8px; border-radius: 6px; border: 1px solid #fde68a;">
          <div style="color: #b45309; font-size: 9.5px; text-transform: uppercase;">Ganancia Gravada Final:</div>
          <div style="font-weight: 800; font-size: 12.5px; color: #92400e; font-family: var(--font-mono);">${formatCOP(data.ganancia_ocasional_gravada_final_cop)}</div>
        </div>
      </div>

      <!-- CASILLAS FORMULARIO 210 -->
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
        <div style="font-size: 11.5px; font-weight: 800; color: #1e3a8a; margin-bottom: 6px;">
          📋 Casillas del Formulario 210 DIAN (Cédula de Ganancias Ocasionales):
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 6px; font-size: 11px;">
          <div style="background: white; padding: 4px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
            <span style="color: #64748b;">Casilla 80 (Ingresos):</span> <strong>${formatCOP(data.casilla_80_ingresos_brutos_cop)}</strong>
          </div>
          <div style="background: white; padding: 4px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
            <span style="color: #64748b;">Casilla 81 (Costos):</span> <strong>${formatCOP(data.casilla_81_costos_cop)}</strong>
          </div>
          <div style="background: white; padding: 4px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
            <span style="color: #64748b;">Casilla 82 (Exentas):</span> <strong>${formatCOP(data.casilla_82_exentas_cop)}</strong>
          </div>
          <div style="background: white; padding: 4px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
            <span style="color: #64748b;">Casilla 83 (Gravable):</span> <strong>${formatCOP(data.casilla_83_gravables_cop)}</strong>
          </div>
          <div style="background: white; padding: 4px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
            <span style="color: #64748b;">Casilla 87 (Impuesto):</span> <strong style="color: #059669;">${formatCOP(data.casilla_87_impuesto_go_cop)}</strong>
          </div>
          <div style="background: white; padding: 4px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
            <span style="color: #64748b;">Casilla 134 (Retención):</span> <strong>${formatCOP(data.retencion_en_fuente_notarial_cop)}</strong>
          </div>
        </div>
      </div>

      <!-- MATRIZ COMPARATIVA DE 5 ESCENARIOS -->
      <div style="margin-bottom: 12px; overflow-x: auto;">
        <div style="font-size: 11.5px; font-weight: 800; color: #334155; margin-bottom: 6px;">
          📊 Comparación Lado a Lado de Escenarios de Planeación Fiscal:
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; background: white; border: 1px solid #e2e8f0; border-radius: 6px;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left;">
              <th style="padding: 6px 8px; border-bottom: 2px solid #cbd5e1;">Estrategia / Escenario</th>
              <th style="padding: 6px 8px; border-bottom: 2px solid #cbd5e1; text-align: right;">Costo Fiscal</th>
              <th style="padding: 6px 8px; border-bottom: 2px solid #cbd5e1; text-align: right;">Base Gravable</th>
              <th style="padding: 6px 8px; border-bottom: 2px solid #cbd5e1; text-align: right;">Impuesto (15%)</th>
              <th style="padding: 6px 8px; border-bottom: 2px solid #cbd5e1; text-align: right;">Ahorro Neto</th>
            </tr>
          </thead>
          <tbody>
            ${escenariosRows}
          </tbody>
        </table>
      </div>

      <details style="font-size: 11px; color: #475569; cursor: pointer;">
        <summary style="font-weight: 700; color: var(--primary);">Desglose Matemático & Citas Normativas ▾</summary>
        <ul style="margin: 6px 0 0 16px; padding: 0; line-height: 1.5;">
          ${pasosHtml}
        </ul>
      </details>
    `;
  } catch (err) {
    console.error(err);
  }
}

// ARTÍCULO 73 E.T. - REAJUSTE FISCAL DE ACTIVOS
let tablaArticulo73Data = [];

async function loadTablaArticulo73() {
  try {
    if (!tablaArticulo73Data || tablaArticulo73Data.length === 0) {
      const res = await fetch('/api/v1/beneficios/articulo-73/tabla');
      if (!res.ok) throw new Error('Error al cargar tabla Art. 73');
      tablaArticulo73Data = await res.json();
    }

    // Poblar selects de años (Art. 73 y Simulador Inmuebles AFC)
    const anoSelect = document.getElementById('sim-art73-ano');
    const anoAfcSelect = document.getElementById('afc-sim-ano-adquisicion');

    if (anoSelect) {
      anoSelect.innerHTML = '';
      tablaArticulo73Data.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.ano_adquisicion;
        opt.innerText = item.ano_adquisicion;
        if (item.ano_adquisicion === '1995') opt.selected = true;
        anoSelect.appendChild(opt);
      });
    }

    if (anoAfcSelect) {
      anoAfcSelect.innerHTML = '';
      tablaArticulo73Data.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.ano_adquisicion;
        const yrNum = parseInt(item.ano_adquisicion);
        const pre87 = yrNum && yrNum < 1987 ? ' (Pre-1987 Art. 44)' : '';
        opt.innerText = `${item.ano_adquisicion}${pre87}`;
        if (item.ano_adquisicion === '2011') opt.selected = true;
        anoAfcSelect.appendChild(opt);
      });
    }

    renderTablaArticulo73(tablaArticulo73Data);
    await runSimulacionArticulo73();
    await runSimulacionInmuebleAfc();
  } catch (err) {
    console.error('Error cargando tabla Art 73:', err);
  }
}

function renderTablaArticulo73(items) {
  const tbody = document.getElementById('tabla-art73-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!items || items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="padding: 24px; text-align: center; color: var(--text-muted); font-style: italic;">
          No se encontraron resultados para la búsqueda.
        </td>
      </tr>
    `;
    return;
  }

  items.forEach(item => {
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.style.borderBottom = '1px solid var(--border-color)';
    tr.className = 'hover-row';
    tr.onclick = () => selectAnoArt73(item.ano_adquisicion);

    tr.innerHTML = `
      <td style="padding: 10px 14px; font-weight: 800; color: var(--primary); font-size: 13px;">${item.ano_adquisicion}</td>
      <td style="padding: 10px 14px; font-family: var(--font-mono); font-weight: 600; color: #1e40af;">${Number(item.acciones_aportes).toLocaleString('es-CO', { minimumFractionDigits: 2 })}x</td>
      <td style="padding: 10px 14px; font-family: var(--font-mono); font-weight: 700; color: #0b3b60;">${Number(item.bienes_raices_urbanos).toLocaleString('es-CO', { minimumFractionDigits: 2 })}x</td>
      <td style="padding: 10px 14px; font-family: var(--font-mono); font-weight: 600; color: #047857;">${Number(item.bienes_raices_rurales_agro).toLocaleString('es-CO', { minimumFractionDigits: 2 })}x</td>
      <td style="padding: 10px 14px; font-family: var(--font-mono); font-weight: 600; color: #0284c7;">${Number(item.bienes_raices_rurales).toLocaleString('es-CO', { minimumFractionDigits: 2 })}x</td>
      <td style="padding: 10px 14px; text-align: center;">
        <button class="btn btn-outline btn-xs" style="padding: 3px 8px; font-size: 11px; border-radius: 4px;" onclick="event.stopPropagation(); selectAnoArt73('${item.ano_adquisicion}')">
          ⚡ Simular
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterTablaArticulo73(query) {
  if (!query || !query.trim()) {
    renderTablaArticulo73(tablaArticulo73Data);
    return;
  }
  const q = query.trim().toLowerCase();
  const filtered = tablaArticulo73Data.filter(i => 
    i.ano_adquisicion.toString().toLowerCase().includes(q)
  );
  renderTablaArticulo73(filtered);
}

function selectAnoArt73(ano) {
  const anoSelect = document.getElementById('sim-art73-ano');
  if (anoSelect) {
    anoSelect.value = String(ano);
    runSimulacionArticulo73();
    showToast(`✓ Año ${ano} cargado al simulador Art. 73`, 'info', 2000);
    const pane = document.getElementById('pane-art73');
    if (pane) pane.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

async function runSimulacionArticulo73() {
  const anoSelect = document.getElementById('sim-art73-ano');
  const tipoSelect = document.getElementById('sim-art73-tipo');
  const costoHist = getNum('sim-art73-costo-hist');
  const precioVenta = getNum('sim-art73-precio-venta');
  const resDiv = document.getElementById('sim-art73-result');
  if (!resDiv || !anoSelect || !tipoSelect) return;

  const ano = anoSelect.value || '1995';
  const tipo = tipoSelect.value || 'bienes_raices_urbanos';

  try {
    const res = await fetch('/api/v1/beneficios/simular-articulo-73', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ano_adquisicion: String(ano),
        tipo_activo: tipo,
        costo_adquisicion_historico_cop: costoHist > 0 ? costoHist : 1000000,
        precio_venta_estimado_cop: precioVenta > 0 ? precioVenta : null
      })
    });
    if (!res.ok) throw new Error('Error al simular Art. 73');
    const data = await res.json();

    const factor = Number(data.factor_multiplicador || 1);
    const costoAjustado = Number(data.costo_fiscal_ajustado_art73_cop || 0);
    const incremento = Number(data.incremento_costo_fiscal_cop || 0);
    const ahorroImpuesto = Number(data.ahorro_impuesto_estimado_cop || 0);

    resDiv.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--text-muted);">FACTOR APLICADO (DANE):</span>
          <span class="badge" style="background: #1e40af; color: #ffffff; font-size: 13px; font-weight: 800; font-family: var(--font-mono); padding: 2px 8px; border-radius: 4px;">
            ${factor.toLocaleString('es-CO', { minimumFractionDigits: 2 })}x
          </span>
        </div>

        <div style="margin-bottom: 10px;">
          <div style="font-size: 10.5px; color: var(--text-muted);">NUEVO COSTO FISCAL AJUSTADO:</div>
          <div style="font-size: 18px; font-weight: 900; font-family: var(--font-mono); color: #1e3a8a;">
            ${formatCOP(costoAjustado)}
          </div>
          <div style="font-size: 10px; color: #059669; font-weight: 600;">
            +${formatCOP(incremento)} COP de costo fiscal legal adicional
          </div>
        </div>

        ${precioVenta > 0 ? `
          <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 8px 10px; margin-bottom: 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #166534; text-transform: uppercase;">Ahorro Tributario Estimado (Ganancia Ocasional 15%):</div>
            <div style="font-size: 16px; font-weight: 900; font-family: var(--font-mono); color: #15803d;">
              ${formatCOP(ahorroImpuesto)}
            </div>
            <div style="font-size: 9.5px; color: #166534; margin-top: 2px;">
              Utilidad sin reajuste: <strong>${formatCOP(data.ganancia_sin_ajuste_cop)}</strong> → Con reajuste: <strong>${formatCOP(data.ganancia_con_ajuste_cop)}</strong>
            </div>
          </div>
        ` : ''}
      </div>

      <div style="font-size: 10px; color: var(--text-muted); line-height: 1.3; border-top: 1px solid var(--border-color); padding-top: 6px;">
        📌 <strong>Fundamento:</strong> Art. 73 E.T. y Decreto reglamentario anual. Venta tras 2+ años de posesión tributa como Ganancia Ocasional al 15%.
      </div>
    `;
  } catch (err) {
    console.error(err);
  }
}

// RULES TAB
function renderRulesTab() {
  if (!currentRules) return;
  const tbody = document.getElementById('rules-marginal-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  const brackets = currentRules.persona_natural.cedula_general.tabla_marginal_art241;
  brackets.forEach(b => {
    const tr = document.createElement('tr');
    const desdeCop = b.desde_uvt * currentUvt;
    const hastaCop = b.hasta_uvt <= 9000000 ? b.hasta_uvt * currentUvt : null;

    tr.innerHTML = `
      <td style="padding:6px;font-family:var(--font-mono);">${formatCOP(b.desde_uvt, false)} UVT <div style="font-size:10px;color:var(--text-muted);">${formatCOP(desdeCop)}</div></td>
      <td style="padding:6px;font-family:var(--font-mono);">${b.hasta_uvt > 9000000 ? 'En adelante' : `${formatCOP(b.hasta_uvt, false)} UVT <div style="font-size:10px;color:var(--text-muted);">${formatCOP(hastaCop)}</div>`}</td>
      <td style="padding:6px;font-weight:700;color:var(--primary);">${(b.tarifa * 100).toFixed(0)}%</td>
      <td style="padding:6px;font-family:var(--font-mono);">${formatCOP(b.uvt_adicional, false)} UVT</td>
      <td style="padding:6px;font-size:11px;color:var(--text-secondary);">${b.tarifa === 0 ? 'Exento (0%)' : `(Renta Gravable UVT - ${formatCOP(b.desde_uvt, false)}) x ${(b.tarifa * 100).toFixed(0)}% + ${formatCOP(b.uvt_adicional, false)} UVT`}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('rules-json-view').innerText = JSON.stringify(currentRules, null, 2);
}

// AUDIT MODAL
async function openAuditModal(type) {
  let result = type === 'pn' ? lastPnResult : lastPjResult;
  if (!result || !result.audit_trace || result.audit_trace.length === 0) {
    if (type === 'pn') {
      await runPnCalc();
      result = lastPnResult;
    } else {
      await runPjCalc();
      result = lastPjResult;
    }
  }
  if (!result || !result.audit_trace || result.audit_trace.length === 0) {
    showToast('Realiza un cálculo primero para ver la trazabilidad legal', 'info');
    return;
  }

  const modal = document.getElementById('audit-modal');
  const title = document.getElementById('audit-modal-title');
  const body = document.getElementById('audit-modal-body');

  title.innerText = type === 'pn' 
    ? `Auditoría Persona Natural (${result.tax_year}) - Cédula General & Ganancias Ocasionales`
    : `Auditoría Persona Jurídica (${result.tax_year}) - Formulario 110 & TTD`;

  body.innerHTML = '';
  result.audit_trace.forEach((step, idx) => {
    const div = document.createElement('div');
    div.className = 'audit-item';
    div.innerHTML = `
      <div class="audit-item-header">
        <span class="audit-item-title">${idx + 1}. ${step.title}</span>
        ${step.statutory_reference ? `<span class="audit-item-ref">${step.statutory_reference}</span>` : ''}
      </div>
      ${step.notes ? `<p class="audit-item-notes">${step.notes}</p>` : ''}
      <div class="audit-item-values">
        <span>Calculado: <strong>${formatCOP(step.calculated_cop)} COP</strong></span>
        ${step.limit_cop ? `<span>Tope Legal: <strong>${formatCOP(step.limit_cop)} COP ${step.limit_uvt ? `(${step.limit_uvt} UVT)` : ''}</strong></span>` : ''}
        ${step.excess_rejected_cop > 0 ? `<span style="color:#e11d48;">Exceso Rechazado: <strong>${formatCOP(step.excess_rejected_cop)} COP</strong></span>` : ''}
        <span>Valor Aceptado: <strong style="color:#059669;">${formatCOP(step.final_allowed_cop)} COP</strong></span>
      </div>
    `;
    body.appendChild(div);
  });

  modal.style.display = 'flex';
}

function closeAuditModal() {
  document.getElementById('audit-modal').style.display = 'none';
}

// =========================================================================
// SINCRONIZACIÓN BIDIRECCIONAL API ↔ UI EN TIEMPO REAL (SSE & REST)
// =========================================================================
function initLiveSync() {
  const badge = document.getElementById('api-sync-badge');
  const badgeText = document.getElementById('api-sync-text');

  if (liveSyncEventSource) {
    liveSyncEventSource.close();
  }

  try {
    liveSyncEventSource = new EventSource(`/api/v1/session/events?session_id=${currentSessionId}`);

    liveSyncEventSource.onopen = () => {
      if (badge) badge.className = 'api-sync-status-badge connected';
      if (badgeText) badgeText.innerText = `API Sync: En Vivo`;
    };

    liveSyncEventSource.addEventListener('connected', (e) => {
      if (badge) badge.className = 'api-sync-status-badge connected';
      if (badgeText) badgeText.innerText = `API Sync: En Vivo`;
    });

    liveSyncEventSource.addEventListener('state_update', (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload && payload.state && payload.source !== 'ui') {
          applyStateToUi(payload.state, 'api');
          const rev = payload.revision ? ` (v${payload.revision})` : '';
          showToast(`⚡ Declaración actualizada desde la API externa${rev}`, 'success', 4000);
        }
      } catch (err) {
        console.error('Error procesando state_update SSE:', err);
      }
    });

    liveSyncEventSource.addEventListener('reset', (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload && payload.state) {
          applyStateToUi(payload.state, 'api');
          showToast('🔄 Sesión restablecida a valores por defecto', 'info', 3000);
        }
      } catch (err) {
        console.error('Error procesando reset SSE:', err);
      }
    });

    liveSyncEventSource.onerror = () => {
      if (badge) badge.className = 'api-sync-status-badge disconnected';
      if (badgeText) badgeText.innerText = `API Sync: Reconectando...`;
    };
  } catch (err) {
    console.error('No se pudo inicializar LiveSync SSE:', err);
    if (badge) badge.className = 'api-sync-status-badge disconnected';
  }
}

// Extrae el estado actual del DOM en un objeto estructurado
function getCurrentUiState() {
  const nombre = document.getElementById('pn_nombre_declarante') ? document.getElementById('pn_nombre_declarante').value : '';
  const nit = document.getElementById('pn_nit_declarante') ? document.getElementById('pn_nit_declarante').value : '';
  const year = parseInt(document.getElementById('select-year') ? document.getElementById('select-year').value : '2026', 10);
  const uvt = parseFloat(document.getElementById('input-custom-uvt') ? document.getElementById('input-custom-uvt').value : '52350');

  const activeModule = currentActiveModule || 'pn';
  const activeSubtab = currentActiveSubTab || 'calc';

  return {
    session_id: currentSessionId,
    metadata: {
      nombre,
      nit,
      tax_year: year,
      custom_uvt: uvt,
      active_module: activeModule,
      active_subtab: activeSubtab
    },
    persona_natural: {
      patrimonio_bruto: getNum('pn_patrimonio_bruto'),
      deudas: getNum('pn_deudas'),
      rentas_trabajo: getNum('pn_rentas_trabajo'),
      viaticos: getNum('pn_viaticos'),
      otros_ingresos_brutos: getNum('pn_otros_ingresos'),
      rentas_capital: getNum('pn_rentas_capital'),
      incrngo_capital: getNum('pn_incrngo_capital'),
      rentas_nolaborales: getNum('pn_rentas_nolaborales'),
      incrngo_nolaborales: getNum('pn_incrngo_nolaborales'),
      costos_nolaborales: getNum('pn_costos_nolaborales'),
      aporte_salud_obligatorio: getNum('pn_salud'),
      aporte_pension_obligatorio: getNum('pn_pension'),
      aplica_dependiente_general: document.getElementById('pn_dependiente_general') ? document.getElementById('pn_dependiente_general').checked : false,
      numero_dependientes_adicionales_72uvt: 0,
      medicina_prepagada_anual: getNum('pn_prepagada'),
      intereses_vivienda_anual: getNum('pn_vivienda'),
      gmf_4x1000_total: getNum('pn_gmf'),
      compras_factura_electronica: getNum('pn_factura_elec'),
      aportes_voluntarios_pension_afc: getNum('pn_afc'),
      otras_rentas_exentas: getNum('pn_otras_exentas'),
      ganancias_ocasionales_brutas_activos_fijos: getNum('pn_go_activos'),
      costos_ganancia_ocasional: getNum('pn_go_costos'),
      ganancias_ocasionales_brutas_herencias: getNum('pn_go_herencias'),
      ganancias_ocasionales_brutas_loterias: getNum('pn_go_loterias'),
      ganancias_ocasionales_exentas_solicitadas: getNum('pn_go_exentas'),
      retenciones_fuente_practicadas: getNum('pn_retenciones'),
      anticipo_ano_anterior: getNum('pn_anticipo'),
      saldo_a_favor_ano_anterior: getNum('pn_saldo_favor_anterior')
    },
    persona_juridica: {
      ingresos_brutos_operacionales: getNum('pj_ing_operacionales'),
      ingresos_no_operacionales: getNum('pj_ing_no_operacionales'),
      ingresos_no_constitutivos_renta: getNum('pj_incrngo'),
      costos_ventas_operacionales: getNum('pj_costos_ventas'),
      gastos_administracion_ventas: getNum('pj_gastos_admin'),
      rentas_exentas: getNum('pj_rentas_exentas'),
      utilidad_contable_antes_impuestos: getNum('pj_utilidad_contable'),
      ingresos_no_constitutivos_utilidad: getNum('pj_incrngo_ttd'),
      costos_gastos_no_deducibles: getNum('pj_gastos_no_deducibles'),
      retenciones_fuente_practicadas: getNum('pj_retenciones'),
      anticipo_ano_anterior: getNum('pj_anticipo')
    },
    calculation_results: {
      persona_natural: lastPnResult,
      persona_juridica: lastPjResult
    }
  };
}

// Envía el estado actual de la UI al backend (debounced) y guarda borrador local
function syncUiStateToBackend() {
  if (isApplyingRemoteState) return;
  saveLocalDraft();
  clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(async () => {
    try {
      const state = getCurrentUiState();
      await fetch(`/api/v1/session/state?session_id=${currentSessionId}&source=ui`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });
    } catch (err) {
      console.warn('Sync a backend falló:', err);
    }
  }, 400);
}

// Aplica un estado recibido (por API o por Importar JSON) directamente a la UI
function applyStateToUi(state, source = 'api') {
  if (!state) return;
  isApplyingRemoteState = true;

  try {
    // 1. Metadatos
    if (state.metadata) {
      if (state.metadata.nombre && document.getElementById('pn_nombre_declarante')) {
        document.getElementById('pn_nombre_declarante').value = state.metadata.nombre;
      }
      if (state.metadata.nit && document.getElementById('pn_nit_declarante')) {
        document.getElementById('pn_nit_declarante').value = state.metadata.nit;
        if (document.getElementById('cal-search-nit')) {
          document.getElementById('cal-search-nit').value = state.metadata.nit;
        }
      }
      if (state.metadata.tax_year && document.getElementById('select-year')) {
        document.getElementById('select-year').value = String(state.metadata.tax_year);
        currentYear = parseInt(state.metadata.tax_year, 10);
      }
      if (state.metadata.custom_uvt && document.getElementById('input-custom-uvt')) {
        document.getElementById('input-custom-uvt').value = String(state.metadata.custom_uvt);
        currentUvt = parseFloat(state.metadata.custom_uvt);
      }
    }

    // 2. Persona Natural
    if (state.persona_natural) {
      const pn = state.persona_natural;
      if (pn.patrimonio_bruto !== undefined) setNum('pn_patrimonio_bruto', pn.patrimonio_bruto);
      if (pn.deudas !== undefined) setNum('pn_deudas', pn.deudas);
      if (pn.rentas_trabajo !== undefined) setNum('pn_rentas_trabajo', pn.rentas_trabajo);
      if (pn.viaticos !== undefined) setNum('pn_viaticos', pn.viaticos);
      if (pn.otros_ingresos_brutos !== undefined) setNum('pn_otros_ingresos', pn.otros_ingresos_brutos);
      if (pn.rentas_capital !== undefined) setNum('pn_rentas_capital', pn.rentas_capital);
      if (pn.incrngo_capital !== undefined) setNum('pn_incrngo_capital', pn.incrngo_capital);
      if (pn.rentas_nolaborales !== undefined) setNum('pn_rentas_nolaborales', pn.rentas_nolaborales);
      if (pn.incrngo_nolaborales !== undefined) setNum('pn_incrngo_nolaborales', pn.incrngo_nolaborales);
      if (pn.costos_nolaborales !== undefined) setNum('pn_costos_nolaborales', pn.costos_nolaborales);
      if (pn.aporte_salud_obligatorio !== undefined) setNum('pn_salud', pn.aporte_salud_obligatorio);
      if (pn.aporte_pension_obligatorio !== undefined) setNum('pn_pension', pn.aporte_pension_obligatorio);
      if (pn.aplica_dependiente_general !== undefined && document.getElementById('pn_dependiente_general')) {
        document.getElementById('pn_dependiente_general').checked = !!pn.aplica_dependiente_general;
      }
      if (pn.medicina_prepagada_anual !== undefined) setNum('pn_prepagada', pn.medicina_prepagada_anual);
      if (pn.intereses_vivienda_anual !== undefined) setNum('pn_vivienda', pn.intereses_vivienda_anual);
      if (pn.gmf_4x1000_total !== undefined) setNum('pn_gmf', pn.gmf_4x1000_total);
      if (pn.compras_factura_electronica !== undefined) setNum('pn_factura_elec', pn.compras_factura_electronica);
      if (pn.aportes_voluntarios_pension_afc !== undefined) setNum('pn_afc', pn.aportes_voluntarios_pension_afc);
      if (pn.otras_rentas_exentas !== undefined) setNum('pn_otras_exentas', pn.otras_rentas_exentas);
      if (pn.ganancias_ocasionales_brutas_activos_fijos !== undefined) setNum('pn_go_activos', pn.ganancias_ocasionales_brutas_activos_fijos);
      if (pn.costos_ganancia_ocasional !== undefined) setNum('pn_go_costos', pn.costos_ganancia_ocasional);
      if (pn.ganancias_ocasionales_brutas_herencias !== undefined) setNum('pn_go_herencias', pn.ganancias_ocasionales_brutas_herencias);
      if (pn.ganancias_ocasionales_brutas_loterias !== undefined) setNum('pn_go_loterias', pn.ganancias_ocasionales_brutas_loterias);
      if (pn.ganancias_ocasionales_exentas_solicitadas !== undefined) setNum('pn_go_exentas', pn.ganancias_ocasionales_exentas_solicitadas);
      if (pn.retenciones_fuente_practicadas !== undefined) setNum('pn_retenciones', pn.retenciones_fuente_practicadas);
      if (pn.anticipo_ano_anterior !== undefined) setNum('pn_anticipo', pn.anticipo_ano_anterior);
      if (pn.saldo_a_favor_ano_anterior !== undefined && document.getElementById('pn_saldo_favor_anterior')) {
        setNum('pn_saldo_favor_anterior', pn.saldo_a_favor_ano_anterior);
      }
    }

    // 3. Persona Jurídica
    if (state.persona_juridica) {
      const pj = state.persona_juridica;
      if (pj.ingresos_brutos_operacionales !== undefined) setNum('pj_ing_operacionales', pj.ingresos_brutos_operacionales);
      if (pj.ingresos_no_operacionales !== undefined) setNum('pj_ing_no_operacionales', pj.ingresos_no_operacionales);
      if (pj.ingresos_no_constitutivos_renta !== undefined) setNum('pj_incrngo', pj.ingresos_no_constitutivos_renta);
      if (pj.costos_ventas_operacionales !== undefined) setNum('pj_costos_ventas', pj.costos_ventas_operacionales);
      if (pj.gastos_administracion_ventas !== undefined) setNum('pj_gastos_admin', pj.gastos_administracion_ventas);
      if (pj.rentas_exentas !== undefined) setNum('pj_rentas_exentas', pj.rentas_exentas);
      if (pj.utilidad_contable_antes_impuestos !== undefined) setNum('pj_utilidad_contable', pj.utilidad_contable_antes_impuestos);
      if (pj.ingresos_no_constitutivos_utilidad !== undefined) setNum('pj_incrngo_ttd', pj.ingresos_no_constitutivos_utilidad);
      if (pj.costos_gastos_no_deducibles !== undefined) setNum('pj_gastos_no_deducibles', pj.costos_gastos_no_deducibles);
      if (pj.retenciones_fuente_practicadas !== undefined) setNum('pj_retenciones', pj.retenciones_fuente_practicadas);
      if (pj.anticipo_ano_anterior !== undefined) setNum('pj_anticipo', pj.anticipo_ano_anterior);
    }

    // Micro-animación flash si vino de la API externa
    if (source === 'api') {
      document.querySelectorAll('.currency-input').forEach(inp => {
        inp.classList.add('api-flash-update');
        setTimeout(() => inp.classList.remove('api-flash-update'), 1200);
      });
    }

    // Recalcular y actualizar vistas
    loadRules(currentYear, currentUvt).then(() => {
      runPnCalc();
      runPjCalc();
      consultarVencimientoNit();
    });

  } finally {
    isApplyingRemoteState = false;
  }
}

// MODAL IMPORT / EXPORT JSON
function openExportJsonModal() {
  const modal = document.getElementById('modal-json-sync');
  if (!modal) return;
  switchJsonModalTab('export');
  const currentState = getCurrentUiState();
  const jsonStr = JSON.stringify(currentState, null, 2);
  document.getElementById('export-json-textarea').value = jsonStr;
  document.getElementById('export-copy-feedback').innerText = '';
  modal.style.display = 'flex';
}

function openImportJsonModal() {
  const modal = document.getElementById('modal-json-sync');
  if (!modal) return;
  switchJsonModalTab('import');
  document.getElementById('import-error-feedback').innerText = '';
  modal.style.display = 'flex';
}

function closeJsonModal() {
  const modal = document.getElementById('modal-json-sync');
  if (modal) modal.style.display = 'none';
}

function closeJsonModalOnBackdrop(e) {
  if (e.target && e.target.id === 'modal-json-sync') {
    closeJsonModal();
  }
}

function switchJsonModalTab(tab) {
  document.getElementById('modal-tab-btn-export').className = tab === 'export' ? 'sub-tab-btn active' : 'sub-tab-btn';
  document.getElementById('modal-tab-btn-import').className = tab === 'import' ? 'sub-tab-btn active' : 'sub-tab-btn';
  document.getElementById('modal-tab-btn-api').className = tab === 'api' ? 'sub-tab-btn active' : 'sub-tab-btn';

  document.getElementById('modal-pane-export').style.display = tab === 'export' ? 'block' : 'none';
  document.getElementById('modal-pane-import').style.display = tab === 'import' ? 'block' : 'none';
  document.getElementById('modal-pane-api').style.display = tab === 'api' ? 'block' : 'none';

  if (tab === 'export') {
    const currentState = getCurrentUiState();
    document.getElementById('export-json-textarea').value = JSON.stringify(currentState, null, 2);
  } else if (tab === 'api') {
    const samplePayload = {
      persona_natural: {
        rentas_trabajo: getNum('pn_rentas_trabajo') || 700000000,
        aporte_salud_obligatorio: getNum('pn_salud') || 28000000,
        aporte_pension_obligatorio: getNum('pn_pension') || 28000000
      }
    };
    document.getElementById('snippet-curl-post').innerText = `curl -X POST http://localhost:8000/api/v1/session/state?source=api \\\n  -H "Content-Type: application/json" \\\n  -H "X-Session-ID: ${currentSessionId}" \\\n  -d '${JSON.stringify(samplePayload, null, 2)}'`;
  }
}

function copyExportJsonToClipboard() {
  const textarea = document.getElementById('export-json-textarea');
  textarea.select();
  navigator.clipboard.writeText(textarea.value).then(() => {
    const feedback = document.getElementById('export-copy-feedback');
    feedback.innerText = '✓ ¡Copiado al portapapeles!';
    setTimeout(() => { feedback.innerText = ''; }, 3000);
  });
}

function downloadCurrentStateJson() {
  const currentState = getCurrentUiState();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentState, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `tributia_estado_${currentYear}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function applyImportedJson() {
  const textarea = document.getElementById('import-json-textarea');
  const errorFeedback = document.getElementById('import-error-feedback');
  errorFeedback.innerText = '';

  let parsed = null;
  try {
    parsed = JSON.parse(textarea.value.trim());
  } catch (err) {
    errorFeedback.innerText = `Error de sintaxis JSON: ${err.message}`;
    return;
  }

  const doApply = () => {
    applyStateToUi(parsed, 'api');
    closeJsonModal();
    showToast('✓ Estado importado y recalculado exitosamente', 'success');
  };

  if (hasEnteredUserData()) {
    showConfirmModal({
      title: '¿Sobreescribir datos actuales?',
      msg: 'Tienes una declaración activa en pantalla. Al importar este JSON, los valores actuales se reemplazarán.',
      confirmText: 'Sí, importar',
      onConfirm: doApply
    });
  } else {
    doApply();
  }
}

function triggerJsonFileInput() {
  document.getElementById('json-file-input').click();
}

function handleJsonFileSelected(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    document.getElementById('import-json-textarea').value = event.target.result;
    applyImportedJson();
  };
  reader.readAsText(file);
}

// =========================================================================
// MÓDULO: SPREADSHEET FISCAL & CONCILIACIÓN EXÓGENA (100% EFÍMERO)
// =========================================================================
let reconciliationData = null;
let reconciliationFilteredItems = [];

function triggerCsvFileUpload() {
  const input = document.getElementById('reconciliation-file-input');
  if (input) {
    input.value = '';
    input.click();
  }
}

async function handleCsvFileInputChange(event) {
  const file = event.target.files ? event.target.files[0] : null;
  if (!file) return;

  hideReconciliationErrors();
  showToast(`⏳ Procesando ${file.name} en memoria...`, 'info', 2000);

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/api/v1/reconciliation/parse-csv', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      reconciliationData = data;
      renderReconciliationSpreadsheet(data);
      showToast(`✓ Archivo procesado: ${data.items.length} transacciones analizadas en memoria`, 'success', 4000);
    } else {
      const err = await res.json();
      if (res.status === 422 && err.detail) {
        displayCsvValidationErrors(err.detail.errors || [], err.detail.message || 'Error de validación');
      } else {
        showToast(`✕ Error al procesar CSV: ${err.detail || 'Formato no soportado'}`, 'error', 5000);
      }
    }
  } catch (err) {
    console.error('Error al subir CSV de conciliación:', err);
    showToast('✕ Error de conexión con el servicio de conciliación', 'error', 4000);
  }
}

async function loadReconciliationDemo() {
  hideReconciliationErrors();
  try {
    const res = await fetch('/api/v1/reconciliation/demo');
    if (res.ok) {
      const data = await res.json();
      reconciliationData = data;
      renderReconciliationSpreadsheet(data);
      showToast('✓ Ejemplo de conciliación cargado en memoria', 'info', 3000);
    }
  } catch (err) {
    console.error('Error al cargar demo de conciliación:', err);
  }
}

function clearReconciliationView() {
  reconciliationData = null;
  reconciliationFilteredItems = [];
  hideReconciliationErrors();

  if (document.getElementById('reconcile-kpi-total-trx')) document.getElementById('reconcile-kpi-total-trx').innerText = '0';
  if (document.getElementById('reconcile-kpi-total-cop')) document.getElementById('reconcile-kpi-total-cop').innerText = '$0 COP';
  if (document.getElementById('reconcile-kpi-match-count')) document.getElementById('reconcile-kpi-match-count').innerText = '0';
  if (document.getElementById('reconcile-kpi-match-pct')) document.getElementById('reconcile-kpi-match-pct').innerText = '0% Conciliado';
  if (document.getElementById('reconcile-kpi-diff-count')) document.getElementById('reconcile-kpi-diff-count').innerText = '0';
  if (document.getElementById('reconcile-kpi-alert-count')) document.getElementById('reconcile-kpi-alert-count').innerText = '0';
  if (document.getElementById('reconcile-rows-count-badge')) document.getElementById('reconcile-rows-count-badge').innerText = '0 filas';

  const tbody = document.getElementById('reconciliation-table-tbody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" style="text-align: center; padding: 50px; color: var(--text-muted);">
          <div style="font-size: 32px; margin-bottom: 8px;">📂</div>
          <div style="font-size: 14px; font-weight: 700; color: #0b3b60;">No hay archivo CSV cargado en este momento</div>
          <p style="font-size: 12px; color: #64748b; margin-top: 4px;">
            Haz clic en <strong>"Cargar Ejemplo (Demo)"</strong> para visualizar una demostración o en <strong>"Subir Archivo CSV"</strong> para analizar tus certificados fiscales.
          </p>
        </td>
      </tr>
    `;
  }
  showToast('Visualización de conciliación reiniciada', 'info', 2000);
}

function renderReconciliationSpreadsheet(data) {
  if (!data || !data.kpis) return;

  const kpis = data.kpis;
  if (document.getElementById('reconcile-kpi-total-trx')) document.getElementById('reconcile-kpi-total-trx').innerText = kpis.total_transacciones;
  if (document.getElementById('reconcile-kpi-total-cop')) document.getElementById('reconcile-kpi-total-cop').innerText = formatCOP(kpis.total_declarado_cop) + ' COP';
  if (document.getElementById('reconcile-kpi-match-count')) document.getElementById('reconcile-kpi-match-count').innerText = kpis.total_conciliado_match;
  if (document.getElementById('reconcile-kpi-match-pct')) document.getElementById('reconcile-kpi-match-pct').innerText = `${kpis.porcentaje_conciliacion}% Conciliado`;
  if (document.getElementById('reconcile-kpi-diff-count')) document.getElementById('reconcile-kpi-diff-count').innerText = kpis.total_solo_certificados + kpis.total_diferencias_justificadas;
  if (document.getElementById('reconcile-kpi-alert-count')) document.getElementById('reconcile-kpi-alert-count').innerText = kpis.total_discrepancias_alerta;

  filterReconciliationGrid();
}

function filterReconciliationGrid() {
  if (!reconciliationData || !reconciliationData.items) return;

  const cedulaFilter = (document.getElementById('reconcile-filter-cedula')?.value || 'ALL').toUpperCase();
  const estadoFilter = (document.getElementById('reconcile-filter-estado')?.value || 'ALL').toUpperCase();
  const searchTerm = (document.getElementById('reconcile-search-input')?.value || '').toLowerCase().trim();

  const filtered = reconciliationData.items.filter(item => {
    // Filtro por Cédula
    if (cedulaFilter !== 'ALL') {
      if (!item.cedula_destino.toUpperCase().includes(cedulaFilter)) return false;
    }
    // Filtro por Estado
    if (estadoFilter !== 'ALL') {
      if (item.estado_exogena.toUpperCase() !== estadoFilter) return false;
    }
    // Filtro por búsqueda
    if (searchTerm) {
      const matchSearch = (
        item.tercero_nombre.toLowerCase().includes(searchTerm) ||
        item.tercero_nit.toLowerCase().includes(searchTerm) ||
        item.descripcion.toLowerCase().includes(searchTerm) ||
        item.concepto_tributario.toLowerCase().includes(searchTerm) ||
        item.casilla_f210_sugerida.toLowerCase().includes(searchTerm)
      );
      if (!matchSearch) return false;
    }
    return true;
  });

  reconciliationFilteredItems = filtered;
  if (document.getElementById('reconcile-rows-count-badge')) {
    document.getElementById('reconcile-rows-count-badge').innerText = `${filtered.length} filas`;
  }

  const tbody = document.getElementById('reconciliation-table-tbody');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" style="text-align: center; padding: 40px; color: var(--text-muted);">
          No se encontraron transacciones con los filtros seleccionados.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  filtered.forEach(item => {
    let rowClass = 'row-match';
    let badgeClass = 'status-match';
    let badgeText = '🟢 Match 100%';

    if (item.estado_exogena === 'SOLO_EN_CERTIFICADOS') {
      rowClass = 'row-solo-cert';
      badgeClass = 'status-solo-cert';
      badgeText = '🟡 Solo Certificado';
    } else if (item.estado_exogena === 'DIFERENCIA_JUSTIFICADA') {
      rowClass = 'row-justified';
      badgeClass = 'status-justified';
      badgeText = '🟡 Justificada';
    } else if (item.estado_exogena === 'DISCREPANCIA_ALERTA') {
      rowClass = 'row-alert';
      badgeClass = 'status-alert';
      badgeText = '🔴 Discrepancia';
    }

    const difText = item.diferencia_exogena_cop > 0 ? `+${formatCOP(item.diferencia_exogena_cop)}` : '$0';

    html += `
      <tr class="${rowClass}" onclick="openReconciliationRowDetail('${item.id}')">
        <td style="text-align: center; font-weight: 700; color: #64748b;">${item.id}</td>
        <td>${item.fecha}</td>
        <td><span class="badge-uvt" style="background:#eff6ff; color:#1e40af; font-size:10px;">${item.cedula_destino}</span></td>
        <td>
          <div style="font-weight: 700; color: #0b3b60;">${item.concepto_tributario}</div>
          <div style="font-size: 10.5px; color: #64748b;">${item.casilla_f210_sugerida}</div>
        </td>
        <td>
          <div style="font-weight: 600;">${item.tercero_nombre}</div>
          <div style="font-size: 10.5px; color: #64748b;">${item.descripcion}</div>
        </td>
        <td style="font-family: var(--font-mono); font-size: 11px;">${item.tercero_nit || '-'}</td>
        <td style="text-align: right; font-family: var(--font-mono); font-weight: 700; color: #0b3b60;">
          ${formatCOP(item.valor_cop)}
        </td>
        <td style="text-align: right; font-family: var(--font-mono); color: #059669; font-weight: 600;">
          ${formatCOP(item.valor_exogena_cop)}
        </td>
        <td style="text-align: right; font-family: var(--font-mono); font-weight: 700; color: ${item.diferencia_exogena_cop > 0 ? '#b91c1c' : '#64748b'};">
          ${difText}
        </td>
        <td style="text-align: center;">
          <span class="reconcile-status-badge ${badgeClass}">${badgeText}</span>
        </td>
        <td style="text-align: center;">
          <button class="btn btn-outline btn-sm" style="padding: 2px 7px; font-size: 11px;" onclick="event.stopPropagation(); openReconciliationRowDetail('${item.id}')">
            🔎 Ver
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function openReconciliationRowDetail(rowId) {
  if (!reconciliationData || !reconciliationData.items) return;
  const item = reconciliationData.items.find(i => String(i.id) === String(rowId));
  if (!item) return;

  if (document.getElementById('reconcile-detail-title')) document.getElementById('reconcile-detail-title').innerText = `Auditoría: ${item.concepto_tributario}`;
  if (document.getElementById('reconcile-detail-subtitle')) document.getElementById('reconcile-detail-subtitle').innerText = `Fila #${item.id} • Cédula ${item.cedula_destino} • ${item.descripcion}`;
  if (document.getElementById('reconcile-detail-tercero')) document.getElementById('reconcile-detail-tercero').innerText = item.tercero_nombre;
  if (document.getElementById('reconcile-detail-nit')) document.getElementById('reconcile-detail-nit').innerText = item.tercero_nit || 'No informado';
  if (document.getElementById('reconcile-detail-archivo')) document.getElementById('reconcile-detail-archivo').innerText = item.archivo_origen || 'No especificado';
  if (document.getElementById('reconcile-detail-fecha')) document.getElementById('reconcile-detail-fecha').innerText = item.fecha || 'N/A';
  if (document.getElementById('reconcile-detail-val-declarado')) document.getElementById('reconcile-detail-val-declarado').innerText = formatCOP(item.valor_cop);
  if (document.getElementById('reconcile-detail-val-exogena')) document.getElementById('reconcile-detail-val-exogena').innerText = formatCOP(item.valor_exogena_cop);
  if (document.getElementById('reconcile-detail-casilla-badge')) document.getElementById('reconcile-detail-casilla-badge').innerText = item.casilla_f210_sugerida;
  if (document.getElementById('reconcile-detail-explicacion')) document.getElementById('reconcile-detail-explicacion').innerText = item.explicacion_didactica;
  if (document.getElementById('reconcile-detail-norma')) document.getElementById('reconcile-detail-norma').innerText = item.beneficio_asociado || 'Estatuto Tributario Nacional';

  const modal = document.getElementById('modal-reconciliation-detail');
  if (modal) modal.style.display = 'flex';
}

function closeReconciliationDetailModal() {
  const modal = document.getElementById('modal-reconciliation-detail');
  if (modal) modal.style.display = 'none';
}

function displayCsvValidationErrors(errors, message) {
  const errorBox = document.getElementById('reconciliation-error-box');
  const errorTitle = document.getElementById('reconciliation-error-title');
  const errorList = document.getElementById('reconciliation-error-list');
  if (!errorBox) return;

  if (errorTitle) errorTitle.innerText = message || 'Errores de Validación en el Archivo CSV';

  if (errorList) {
    if (!errors || errors.length === 0) {
      errorList.innerHTML = `<p style="margin:0;">${message}</p>`;
    } else {
      let html = '<ul style="margin: 4px 0 0 16px; padding: 0;">';
      errors.slice(0, 8).forEach(e => {
        html += `<li><strong>Fila ${e.row || '-'}, Columna "${e.column || '-'}":</strong> ${e.error || 'Dato inválido'} (Valor recibido: <em>"${e.value || ''}"</em>)</li>`;
      });
      if (errors.length > 8) {
        html += `<li>... y ${errors.length - 8} error(es) adicionales.</li>`;
      }
      html += '</ul>';
      errorList.innerHTML = html;
    }
  }

  errorBox.style.display = 'block';
  showToast('✕ Error en el archivo CSV. Revisa los detalles.', 'error', 4000);
}

function hideReconciliationErrors() {
  const errorBox = document.getElementById('reconciliation-error-box');
  if (errorBox) errorBox.style.display = 'none';
}

