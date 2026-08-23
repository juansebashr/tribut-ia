# Plan de Implementación: Landing Page de Entrada y Hub de Instalación de Skills de IA

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Diseñar e integrar una Landing Page de entrada de alto impacto visual con 2 Call to Actions ("Empecemos" y "Descargar Skill de IA") y un Hub interactivo de tutoriales y descarga para instalar la Skill en Claude (Desktop y CLI), Antigravity (AGY) y ChatGPT/Codex.

**Architecture:** Enrutamiento SPA modular basado en estado y hash URL (`#landing`, `#app`, `#skill-tutorial`) dentro de `AppContext`, componentes dedicados con diseño responsive y soporte para temas claro/oscuro, descargador de paquete de skill en el cliente (`zip` y snippets), e integración de navegación bidireccional desde el Sidebar y Header del workspace.

**Tech Stack:** React 19, TypeScript, Vite, CSS Variables (Dark/Light mode), Lucide Icons, Node Test Runner (`node --test`), Pytest.

## Global Constraints

- Cumplimiento normativo y estricta calidad de código según `AGENTS.md`.
- No romper ni alterar el estado de los módulos de liquidación existentes (`pn`, `pj`, etc.).
- TypeScript estricto sin `any`.
- Sincronización de hash URL limpia (`#landing`, `#app`, `#skill-tutorial`).
- Soporte completo para temas claro y oscuro (`[data-theme="dark"]`).

---

### Task 1: Estado Global de Vistas y Enrutamiento SPA (`AppContext.tsx` & `App.tsx`)

**Files:**
- Modify: `frontend/src/context/AppContext.tsx`
- Modify: `frontend/src/App.tsx`
- Test: `frontend/test/landing_and_skills_ui.test.mjs`

**Interfaces:**
- Consumes: Tipos de módulos y estados de `AppContext`.
- Produces:
  - `ViewType = 'landing' | 'app' | 'skill-tutorial'`
  - `currentView: ViewType`
  - `navigateToView: (view: ViewType, module?: ModuleType, subTab?: string) => void`
  - Manejador de eventos `hashchange` para sincronizar `window.location.hash`.

- [ ] **Step 1: Crear archivo de pruebas unitarias para enrutamiento y estado**

Crear `frontend/test/landing_and_skills_ui.test.mjs` con tests que verifiquen el parseo del hash, la selección de vista inicial y las transiciones entre `#landing`, `#app` y `#skill-tutorial`.

- [ ] **Step 2: Ejecutar test para verificar que falla**

Run: `cd frontend && node --test test/landing_and_skills_ui.test.mjs`  
Expected: FAIL (módulos o funciones no exportadas todavía).

- [ ] **Step 3: Implementar `currentView` y `navigateToView` en `AppContext.tsx`**

Actualizar `AppContext.tsx` para incorporar:
- Tipos `ViewType = 'landing' | 'app' | 'skill-tutorial'`.
- Inicialización de `currentView` basada en `window.location.hash` (por defecto `'landing'` si está vacío).
- Función `navigateToView(view, module, subTab)` que actualiza el estado y el hash en la URL.
- Event listener para `window.addEventListener('hashchange', ...)` que actualice la vista al usar los botones de navegación del explorador.

- [ ] **Step 4: Ejecutar test para verificar que pasa**

Run: `cd frontend && node --test test/landing_and_skills_ui.test.mjs`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
PRE_COMMIT_ALLOW_NO_CONFIG=1 git add frontend/src/context/AppContext.tsx frontend/test/landing_and_skills_ui.test.mjs
PRE_COMMIT_ALLOW_NO_CONFIG=1 git commit -m "feat(nav): add currentView state and hash routing to AppContext"
```

---

### Task 2: Componentes de la Landing Page (`LandingNavbar`, `LandingHeroPreview`, `LandingPage`)

**Files:**
- Create: `frontend/src/components/landing/LandingNavbar.tsx`
- Create: `frontend/src/components/landing/LandingHeroPreview.tsx`
- Create: `frontend/src/components/landing/LandingPage.tsx`
- Modify: `frontend/src/index.css`
- Test: `frontend/test/landing_and_skills_ui.test.mjs`

**Interfaces:**
- Consumes: `useApp()` (`navigateToView`, `theme`, `toggleTheme`).
- Produces:
  - `<LandingPage />`: Componente principal que renderiza el Navbar, Hero con los 2 CTAs, Mockup visual de liquidación + IA, métricas clave, cuadrícula de módulos con acceso rápido en 1-clic y Footer.

- [ ] **Step 1: Escribir tests de estructura y renderizado para la Landing Page**

Agregar aserciones en `frontend/test/landing_and_skills_ui.test.mjs` que validen la presencia de los CTAs (`btn-cta-start`, `btn-cta-download-skill`), el badge normativo y las secciones clave.

- [ ] **Step 2: Crear `LandingNavbar.tsx`**

Implementar la barra de navegación superior con:
- Logo de TributIA con badge de suite.
- Enlaces rápidos: "Suite Tributaria", "Tutorial de Skill IA", "Documentación API".
- Conmutador de tema oscuro/claro (icono Sol/Luna).
- Botón directo "Abrir Suite".

- [ ] **Step 3: Crear `LandingHeroPreview.tsx`**

Implementar el mockup gráfico interactivo con:
- Tarjeta de simulación de liquidación F-210 en tiempo real con cédula general.
- Termómetro progresivo de tarifas marginales (Art. 241 E.T.).
- Mini-terminal interactiva que muestra cómo un agente de IA procesa documentos y genera la respuesta auditable.

- [ ] **Step 4: Crear `LandingPage.tsx` y agregar estilos en `index.css`**

Ensamblar la Landing Page completa con:
- Hero Section con el titular de impacto y los dos botones de Call To Action:
  1. `🚀 Empecemos`: Llama a `navigateToView('app', 'pn')`.
  2. `🤖 Descargar Skill de IA`: Llama a `navigateToView('skill-tutorial')`.
- Barra de métricas (4 Cédulas, 70 Años Art. 73, Conciliación Exógena, 3 Plataformas IA).
- Parrilla de 6 tarjetas interactivas de módulos con acceso directo.
- Footer con links útiles (Estatuto Tributario, Swagger, GitHub).
- Estilos CSS elegantes con gradientes, sombras suaves, bordes refinados y compatibilidad total con tema claro y oscuro.

- [ ] **Step 5: Ejecutar pruebas y verificar build**

Run: `cd frontend && npm test && npm run build`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
PRE_COMMIT_ALLOW_NO_CONFIG=1 git add frontend/src/components/landing/ frontend/src/index.css frontend/test/landing_and_skills_ui.test.mjs
PRE_COMMIT_ALLOW_NO_CONFIG=1 git commit -m "feat(landing): implement high-impact landing page with dual CTAs and live preview"
```

---

### Task 3: Centro de Descarga y Tutoriales de Skills (`SkillTutorialPage` y Pestañas)

**Files:**
- Create: `frontend/src/utils/skillBundleDownloader.ts`
- Create: `frontend/src/components/skills/ClaudeTutorialTab.tsx`
- Create: `frontend/src/components/skills/AntigravityTutorialTab.tsx`
- Create: `frontend/src/components/skills/ChatGptTutorialTab.tsx`
- Create: `frontend/src/components/skills/SkillTutorialPage.tsx`
- Modify: `frontend/src/index.css`
- Test: `frontend/test/landing_and_skills_ui.test.mjs`

**Interfaces:**
- Consumes: `useApp()` (`navigateToView`, `showToast`).
- Produces:
  - `<SkillTutorialPage />`: Centro interactivo con selector de pestañas (Claude, Antigravity, ChatGPT/Codex), botón de descarga del paquete de skill, instrucciones detalladas para Aplicaciones Desktop y CLI, y banco de prompts listos para copiar.

- [ ] **Step 1: Crear utilidad `skillBundleDownloader.ts`**

Crear función `downloadSkillBundle()` y `downloadSingleFile(filename, content)` que empaqueta y descarga `SKILL.md`, los scripts de Python de conciliación e inyección y las plantillas CSV para que cualquier usuario pueda descargarlos localmente en un solo clic.

- [ ] **Step 2: Implementar pestañas de tutorial (`ClaudeTutorialTab`, `AntigravityTutorialTab`, `ChatGptTutorialTab`)**

- `ClaudeTutorialTab.tsx`:
  - **Claude Desktop:** Guía paso a paso para `claude_desktop_config.json` en macOS y Windows, configuración de proyectos y adjunto de extractos.
  - **Claude Code CLI:** Instrucciones de instalación con `claude skills add` y flujo en 4 fases.
- `AntigravityTutorialTab.tsx`:
  - **Antigravity Desktop / Extension:** Registro en `.gemini/skills/` y configuración de subagentes.
  - **Antigravity CLI:** Comandos de ejecución con AST y Graphify.
- `ChatGptTutorialTab.tsx`:
  - **ChatGPT Desktop / Custom GPTs:** Creación de Custom GPT con `SKILL.md` como conocimiento, configuración de acciones OpenAPI conectadas a `http://localhost:8000/openapi.json`.
  - **OpenAI Codex:** Configuración de plugins y ejecución local.

- [ ] **Step 3: Implementar `SkillTutorialPage.tsx`**

Integrar:
- Cabecera con botón de descarga del paquete completo (.zip / archivos).
- Selector interactivo de IA con badges visuales.
- Sección "Banco de Prompts y Casos de Prueba" con botones de copiado y feedback toast.
- Botones de navegación para regresar a la Landing o ir a la Suite.

- [ ] **Step 4: Ejecutar tests y build**

Run: `cd frontend && npm test && npm run build`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
PRE_COMMIT_ALLOW_NO_CONFIG=1 git add frontend/src/utils/skillBundleDownloader.ts frontend/src/components/skills/ frontend/src/index.css frontend/test/landing_and_skills_ui.test.mjs
PRE_COMMIT_ALLOW_NO_CONFIG=1 git commit -m "feat(skills): implement interactive skill tutorial hub for Claude, AGY and ChatGPT"
```

---

### Task 4: Integración Bidireccional en el Workspace (`App.tsx`, `Sidebar.tsx`, `HeaderBar.tsx`)

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/layout/Sidebar.tsx`
- Modify: `frontend/src/components/layout/HeaderBar.tsx`
- Test: `frontend/test/landing_and_skills_ui.test.mjs`

**Interfaces:**
- Consumes: `currentView`, `navigateToView`, `activeModule`.
- Produces:
  - Enrutamiento principal en `App.tsx` que muestra `<LandingPage />`, `<SkillTutorialPage />` o `<AppShell />` según corresponda.
  - Botones en `Sidebar.tsx` para "Inicio / Landing" y "Tutorial Skill IA".
  - Botón en `HeaderBar.tsx` para acceso rápido al tutorial de la skill.

- [ ] **Step 1: Actualizar `App.tsx`**

Renderizar condicionalmente según `currentView`:

```tsx
export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
};
```

Donde `MainRouter` muestra `LandingPage`, `SkillTutorialPage` o `AppShell`.

- [ ] **Step 2: Actualizar `Sidebar.tsx` y `HeaderBar.tsx`**

- Agregar en el Sidebar un enlace superior "🏠 Inicio / Bienvenida" y un item especial "🤖 Instalar Skill IA" en la sección de agentes.
- Agregar en el HeaderBar un botón rápido con icono de robot "Skill IA" que lleve al tutorial.

- [ ] **Step 3: Ejecutar pruebas de regresión y build**

Run: `cd frontend && npm test && npm run build`  
Expected: PASS

- [ ] **Step 4: Commit**

```bash
PRE_COMMIT_ALLOW_NO_CONFIG=1 git add frontend/src/App.tsx frontend/src/components/layout/Sidebar.tsx frontend/src/components/layout/HeaderBar.tsx
PRE_COMMIT_ALLOW_NO_CONFIG=1 git commit -m "feat(ui): connect landing and skill tutorial views seamlessly into App workspace"
```

---

### Task 5: Verificación Integral de Calidad, Linteo y Grafo Arquitectónico

**Files:**
- Graphify: `graphify update .`

- [ ] **Step 1: Ejecutar linteo y formato con Ruff y Oxlint**

Run:

```bash
poetry run ruff check backend skills run.py
cd frontend && npm run lint && cd ..
```

Expected: 0 errores.

- [ ] **Step 2: Ejecutar suite de pruebas completa del backend y frontend**

Run:

```bash
poetry run pytest backend -v
cd frontend && npm test && npm run build && cd ..
```

Expected: Todas las pruebas pasando.

- [ ] **Step 3: Actualizar el grafo de conocimiento Graphify**

Run: `graphify update .`  
Expected: Actualización exitosa de AST sin errores.

- [ ] **Step 4: Commit final de verificación**

```bash
PRE_COMMIT_ALLOW_NO_CONFIG=1 git add .
PRE_COMMIT_ALLOW_NO_CONFIG=1 git commit -m "chore: complete verification and graphify update for landing and skill hub"
```
