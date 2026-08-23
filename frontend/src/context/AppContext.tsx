import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { fetchAvailableYears, fetchRulesForYear } from '../services/api';
import { CASILLAS_INFO, type CasillaInfo } from '../constants/casillas_info';

export type ViewType = 'landing' | 'app' | 'skill-tutorial';

export type ModuleType =
  | 'calendario'
  | 'pn'
  | 'pj'
  | 'simple'
  | 'iva'
  | 'retefuente'
  | 'beneficios'
  | 'presentacion'
  | 'inflacionario'
  | 'art73'
  | 'inmuebles-afc'
  | 'rules'
  | 'session-sync';

export type PnSubTab = 'calc' | 'f210' | 'marginal' | 'conciliacion';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

export interface ConfirmModalOptions {
  title: string;
  msg: string;
  icon?: string;
  confirmText?: string;
  onConfirm: () => void;
}

export interface PopoverState {
  visible: boolean;
  casillaNum: string | number;
  info: CasillaInfo | null;
  position: { top: number; left: number };
  isPinned: boolean;
}

interface AppContextType {
  // Navigation
  currentView: ViewType;
  navigateToView: (view: ViewType, module?: ModuleType, subTab?: string) => void;
  activeModule: ModuleType;
  activeSubTab: string;
  navigateTo: (module: ModuleType, subTab?: string) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileSidebarOpen: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;

  // Fiscal Context
  taxYear: number;
  setTaxYear: (year: number) => void;
  availableYears: number[];
  uvtValue: number;
  setUvtValue: (uvt: number) => void;
  customUvtInput: string;
  setCustomUvtInput: (val: string) => void;
  handleUvtBlur: () => void;

  // Session State
  sessionId: string;
  copySessionId: () => void;
  createNewSession: () => void;

  // UI Modals, Popovers & Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error', duration?: number) => void;
  confirmModal: ConfirmModalOptions | null;
  showConfirmModal: (options: ConfirmModalOptions) => void;
  closeConfirmModal: () => void;

  popoverState: PopoverState;
  showCasillaPopover: (casillaNum: string | number, targetEl?: HTMLElement | null) => void;
  hideCasillaPopover: () => void;
  togglePinPopover: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state with localStorage and media query fallback
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('tributia-theme') : null;
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('tributia-theme', theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  // Session resolution from URL query or default
  const urlParams = new URLSearchParams(window.location.search);
  const initialSessionId = urlParams.get('session_id') || 'default';
  const [sessionId, setSessionId] = useState<string>(initialSessionId);

  // Helper to parse view & module from hash URL
  const parseInitialViewFromHash = (): { view: ViewType; module?: ModuleType; subTab?: string } => {
    if (typeof window === 'undefined') return { view: 'landing', module: 'pn', subTab: 'calc' };
    const hash = window.location.hash.replace(/^#\/?/, '').trim();
    if (!hash || hash === 'landing') {
      return { view: 'landing', module: 'pn', subTab: 'calc' };
    }
    if (hash === 'skill-tutorial' || hash === 'skills' || hash === 'tutorial') {
      return { view: 'skill-tutorial', module: 'pn', subTab: 'calc' };
    }
    const knownModules: ModuleType[] = [
      'calendario', 'pn', 'pj', 'simple', 'iva', 'retefuente',
      'beneficios', 'presentacion', 'inflacionario', 'art73', 'inmuebles-afc', 'rules', 'session-sync'
    ];
    const parts = hash.split('/');
    const modCandidate = parts[0] === 'app' ? (parts[1] as ModuleType) : (parts[0] as ModuleType);
    const subCandidate = parts[0] === 'app' ? parts[2] : parts[1];

    if (knownModules.includes(modCandidate)) {
      return { view: 'app', module: modCandidate, subTab: subCandidate || 'calc' };
    }
    return { view: 'app', module: 'pn', subTab: 'calc' };
  };

  const initialRoute = parseInitialViewFromHash();

  // Navigation
  const [currentView, setCurrentView] = useState<ViewType>(initialRoute.view);
  const [activeModule, setActiveModule] = useState<ModuleType>(initialRoute.module || 'pn');
  const [activeSubTab, setActiveSubTab] = useState<string>(initialRoute.subTab || 'calc');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Sync hash changes on browser back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseInitialViewFromHash();
      setCurrentView(parsed.view);
      if (parsed.module) setActiveModule(parsed.module);
      if (parsed.subTab) setActiveSubTab(parsed.subTab);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fiscal (Por defecto 2025 - UVT oficial $49.799 COP)
  const [taxYear, setTaxYearState] = useState<number>(2025);
  const [availableYears, setAvailableYears] = useState<number[]>([2025, 2026, 2024, 2022]);
  const [uvtValue, setUvtValue] = useState<number>(49799);
  const [customUvtInput, setCustomUvtInput] = useState<string>('49799');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalOptions | null>(null);

  // Popover
  const [popoverState, setPopoverState] = useState<PopoverState>({
    visible: false,
    casillaNum: '',
    info: null,
    position: { top: 0, left: 0 },
    isPinned: false,
  });

  useEffect(() => {
    loadInitialFiscalRules();
  }, []);

  const loadInitialFiscalRules = async () => {
    try {
      const years = await fetchAvailableYears();
      if (years && years.length > 0) {
        setAvailableYears(years);
        const defaultYear = years.includes(2025) ? 2025 : years[0];
        setTaxYearState(defaultYear);
        const rules = await fetchRulesForYear(defaultYear);
        if (rules && rules.uvt_value) {
          setUvtValue(rules.uvt_value);
          setCustomUvtInput(rules.uvt_value.toString());
        }
      }
    } catch (err) {
      console.warn('Error loading initial fiscal rules:', err);
    }
  };

  const setTaxYear = async (year: number) => {
    setTaxYearState(year);
    try {
      const rules = await fetchRulesForYear(year);
      if (rules && rules.uvt_value) {
        setUvtValue(rules.uvt_value);
        setCustomUvtInput(rules.uvt_value.toString());
      }
      showToast(`Año fiscal actualizado a ${year}`, 'info', 2000);
    } catch (err) {
      console.warn('Error updating tax year rules:', err);
    }
  };

  const handleUvtBlur = () => {
    const val = parseFloat(customUvtInput.replace(/\D/g, ''));
    if (val && val > 0) {
      setUvtValue(val);
      showToast(`UVT actualizada a $${val.toLocaleString('es-CO')}`, 'info', 2000);
    }
  };

  const navigateToView = (view: ViewType, module?: ModuleType, subTab?: string) => {
    setCurrentView(view);
    if (module) {
      setActiveModule(module);
    }
    if (subTab) {
      setActiveSubTab(subTab);
    }
    if (typeof window !== 'undefined') {
      if (view === 'landing') {
        window.location.hash = 'landing';
      } else if (view === 'skill-tutorial') {
        window.location.hash = 'skill-tutorial';
      } else if (view === 'app') {
        const mod = module || activeModule;
        const sub = subTab || (mod === activeModule ? activeSubTab : 'calc');
        window.location.hash = `app/${mod}${sub ? `/${sub}` : ''}`;
      }
    }
    setIsMobileSidebarOpen(false);
  };

  const navigateTo = (module: ModuleType, subTab?: string) => {
    setCurrentView('app');
    setActiveModule(module);
    if (subTab) {
      setActiveSubTab(subTab);
    }
    if (typeof window !== 'undefined') {
      window.location.hash = `app/${module}${subTab ? `/${subTab}` : ''}`;
    }
    // Close mobile drawer if open
    setIsMobileSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const openMobileSidebar = () => {
    setIsMobileSidebarOpen(true);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration: number = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const showConfirmModal = (options: ConfirmModalOptions) => {
    setConfirmModal(options);
  };

  const closeConfirmModal = () => {
    setConfirmModal(null);
  };

  const copySessionId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(sessionId).then(() => {
        showToast(`✓ ID de sesión copiado: ${sessionId}`, 'success', 2500);
      });
    }
  };

  const createNewSession = () => {
    const doNew = () => {
      const newId = `ses_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      setSessionId(newId);
      const url = new URL(window.location.href);
      url.searchParams.set('session_id', newId);
      window.history.pushState({}, '', url.toString());
      showToast(`✓ Nueva sesión creada: ${newId}`, 'success', 3000);
    };

    showConfirmModal({
      title: '¿Iniciar nueva declaración limpia?',
      msg: 'Se creará un nuevo ID de sesión en blanco. Podrás volver a tus datos anteriores usando su ID.',
      confirmText: 'Crear nueva sesión',
      onConfirm: doNew,
    });
  };

  const showCasillaPopover = (casillaNum: string | number, targetEl?: HTMLElement | null) => {
    const numStr = String(casillaNum);
    const info = CASILLAS_INFO[numStr] || {
      titulo: `Casilla ${numStr}`,
      art: 'Estatuto Tributario Nacional',
      concepto: 'Información y depuración tributaria oficial.',
      como_llenar: 'Diligencia el valor de acuerdo con tus soportes contables y normatividad vigente.',
      tope: 'Según topes de ley.',
    };

    let top = 100;
    let left = 100;
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      top = rect.bottom + window.scrollY + 8;
      left = Math.max(10, Math.min(window.innerWidth - 360, rect.left + window.scrollX - 100));
    }

    setPopoverState({
      visible: true,
      casillaNum: numStr,
      info,
      position: { top, left },
      isPinned: false,
    });
  };

  const hideCasillaPopover = () => {
    if (!popoverState.isPinned) {
      setPopoverState((prev) => ({ ...prev, visible: false }));
    }
  };

  const togglePinPopover = () => {
    setPopoverState((prev) => ({ ...prev, isPinned: !prev.isPinned }));
  };

  // Global window helpers for E2E tests and backwards compatibility
  useEffect(() => {
    (window as any).navigateTo = (mod: string, sub?: string) => {
      // Map module name aliases
      const mapMod: Record<string, ModuleType> = {
        'calendario': 'calendario',
        'pn': 'pn',
        'pj': 'pj',
        'simple': 'simple',
        'iva': 'iva',
        'retefuente': 'retefuente',
        'beneficios': 'beneficios',
        'presentacion': 'presentacion',
        'art73': 'art73',
        'inmuebles-afc': 'inmuebles-afc',
        'rules': 'rules',
      };
      const resolvedMod = mapMod[mod] || (mod as ModuleType);
      setActiveModule(resolvedMod);
      if (sub && resolvedMod === 'pn') {
        setActiveSubTab(sub as PnSubTab);
      }
    };

    (window as any).showCasillaPopover = (num: string | number, el?: any) => {
      showCasillaPopover(num, el);
    };

    (window as any).hideCasillaPopover = () => {
      setPopoverState((prev) => ({ ...prev, visible: false, isPinned: false }));
    };

    (window as any).toggleSidebar = () => {
      setIsSidebarCollapsed((prev) => !prev);
    };

    (window as any).closeMobileSidebar = () => {
      setIsMobileSidebarOpen(false);
    };

    (window as any).loadReconciliationDemo = () => {
      const demoBtn = document.querySelector('button[title*="demostración"]') as HTMLButtonElement | null;
      if (demoBtn) demoBtn.click();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentView,
        navigateToView,
        activeModule,
        activeSubTab,
        navigateTo,
        isSidebarCollapsed,
        toggleSidebar,
        isMobileSidebarOpen,
        openMobileSidebar,
        closeMobileSidebar,
        taxYear,
        setTaxYear,
        availableYears,
        uvtValue,
        setUvtValue,
        customUvtInput,
        setCustomUvtInput,
        handleUvtBlur,
        sessionId,
        copySessionId,
        createNewSession,
        theme,
        toggleTheme,
        setTheme,
        toasts,
        showToast,
        confirmModal,
        showConfirmModal,
        closeConfirmModal,
        popoverState,
        showCasillaPopover,
        hideCasillaPopover,
        togglePinPopover,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
