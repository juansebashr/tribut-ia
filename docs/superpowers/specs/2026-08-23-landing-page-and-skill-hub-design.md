# Especificación de Diseño: Landing Page y Hub de Instalación de Skills de IA en TributIA

**Fecha:** 2026-08-23  
**Estado:** Aprobado por el usuario  
**Alcance:** Frontend React / TypeScript + Navegación SPA + Módulos de Landing y Tutorial de Skill

---

## 1. Resumen Ejecutivo y Propósito

TributIA evoluciona su interfaz de usuario incorporando una **Página de Entrada (Landing Page) de Alto Impacto Visual** y un **Hub de Instalación y Tutorial de Skills de IA**. El objetivo es brindar una bienvenida gráfica e intuitiva que explique inmediatamente las capacidades de la plataforma (Suite Tributaria DIAN y Asistente Contable Autónomo) y ofrezca dos Call to Actions (CTAs) claros y directos:
1. **"Empecemos" (Ir a la Suite):** Abre la aplicación principal de liquidación tributaria (Formulario 210, 110, Calendario, etc.).
2. **"Descargar Skill de IA":** Lleva a un portal interactivo con tutoriales paso a paso para instalar y utilizar el agente en **Claude Desktop / Claude Code**, **Google Antigravity (AGY)** y **OpenAI ChatGPT / Codex**.

---

## 2. Arquitectura de Navegación y Estado

### 2.1 Modelo de Vistas en `AppContext`

Se introduce un estado principal `currentView` en el contexto global de React:
- `'landing'`: Vista de bienvenida y presentación gráfica.
- `'app'`: Espacio de trabajo de la suite tributaria (`AppShell` con sidebar, cabecera y módulos).
- `'skill-tutorial'`: Centro interactivo de tutoriales y descarga de la skill.

### 2.2 Sincronización de Hash URL (`window.location.hash`)

- `#landing`: Carga directa de la Landing Page.
- `#app` (o `#pn`, `#pj`, `#calendario`, etc.): Carga directa del workspace de la suite.
- `#skill-tutorial`: Carga directa del Hub de Instalación.
- Soporta navegación nativa del historial del navegador (atrás/adelante) y persistencia en sesión.

### 2.3 Navegación Bidireccional

- Desde la **Landing Page**:
  - Botón CTA 1 ("Empecemos") $\to$ `#app` / Módulo PN.
  - Botón CTA 2 ("Descargar Skill") $\to$ `#skill-tutorial`.
  - Header superior con accesos a Módulos, Tutorial, Documentación API y Selector de Tema (Claro/Oscuro).
- Desde el **App Workspace (Sidebar / HeaderBar)**:
  - Clic en el Logo de TributIA o botón de "Inicio" en la barra lateral $\to$ Regresa a `#landing`.
  - Botón "Instalar Skill IA" en la barra lateral $\to$ Abre `#skill-tutorial`.
- Desde el **Hub de Tutorial de Skill**:
  - Botón "Ir a la Suite" $\to$ `#app`.
  - Botón "Volver al Inicio" $\to$ `#landing`.

---

## 3. Componentes y Contenido Visual

### 3.1 `LandingPage.tsx`

- **Navbar Global:**
  - Logo estilizado con badge dinámico.
  - Links directos a Módulos, Tutorial, Swagger API y Conmutador de Tema claro/oscuro.
  - Botón primario de acceso rápido a la App.
- **Hero Section:**
  - **Badge de Confianza:** `⚡ Suite Tributaria DIAN 2025-2026 | Cumplimiento 100% Determinista`.
  - **Título:** *"La Suite Contable y Asistente de IA para Liquidar Impuestos en Colombia"*.
  - **Subtítulo:** *"Calcula, concilia y audita declaraciones de Persona Natural (F-210) y Jurídica (F-110) en segundos con exactitud matemática, o delega el trabajo en tu IA favorita con nuestra Skill oficial."*
  - **Doble Call to Action:**
    - Botón 1 (Primario): `🚀 Empecemos (Abrir Suite)`
    - Botón 2 (Secundario con gradiente e icono de IA): `🤖 Descargar Skill de IA`
  - **Visual Mockup Interactivo / Gráfico:**
    - Tarjeta flotante simulando una liquidación en tiempo real (Cédula General, UVT dinámico, Termómetro marginal progresivo y respuesta del Asistente IA en terminal).
- **Métricas Clave:**
  - `4 Cédulas F-210`: Rentas de trabajo, capital, no laborales, pensiones y dividendos.
  - `70 Años DANE`: Tabla oficial histórica Art. 73 E.T. (1955-2025).
  - `100% Conciliación`: Cruce automático de extractos y facturas vs Información Exógena DIAN.
  - `3 Plataformas de IA`: Claude, Antigravity, ChatGPT/Codex.
- **Parrilla de Módulos (Acceso Directo con 1 Clic):**
  - Persona Natural (F-210), Persona Jurídica (F-110), Conciliación Exógena, Reajuste Art. 73, Régimen Simple, Beneficio de Auditoría.
- **Footer Institucional:** Enlaces a Estatuto Tributario, Swagger Docs, GitHub y estado de sincronización SSE.

---

### 3.2 `SkillTutorialPage.tsx`

- **Cabecera de Acción Inmediata:**
  - Botón **"Descargar Paquete de la Skill (.zip / bundle)"** que empaqueta o genera la descarga de los archivos de la skill (`SKILL.md`, `scripts/`, `templates/`).
  - Botón para inspeccionar la especificación OpenAPI de la API REST local (`http://localhost:8000/docs`).
- **Pestañas Interactivas por Plataforma de IA:**
  1. **Anthropic Claude:**
     - **Claude Desktop (App de Escritorio):**
       - Ubicación de configuración (`claude_desktop_config.json`).
       - Instrucciones para Proyectos de Claude Desktop con prompt de sistema y subida de documentos.
       - Botón "Copiar Configuración JSON".
     - **Claude Code (CLI):**
       - Comandos de instalación: `claude skills add ...`.
       - Workflow en 4 fases de conciliación e inyección en TributIA.
  2. **Google Antigravity (AGY):**
     - **Antigravity Desktop / Extension:**
       - Instrucciones para registrar la skill en `.gemini/skills/declaracion-renta-persona-natural/` o `.agents/skills/`.
       - Prompts de sistema y definición de herramientas.
     - **Antigravity CLI:**
       - Invocación con soporte de AST y Graphify.
  3. **OpenAI ChatGPT & Codex:**
     - **ChatGPT Desktop / Custom GPT:**
       - Instrucciones para crear un Custom GPT con el archivo `SKILL.md` como base de conocimiento.
       - Configuración de OpenAPI Actions conectadas a TributIA.
       - Configuración en la app de escritorio de ChatGPT (Custom Instructions).
     - **OpenAI Codex:**
       - Instrucciones para plugins de Codex y scripts locales en Python.
- **Banco de Prompts y Verificación ("Test Drive"):**
  - Prompts copiables en 1 clic para probar con extractos bancarios y Formularios 220.

---

## 4. Estructura de Archivos y Componentes

```text
frontend/src/
├── components/
│   ├── landing/
│   │   ├── LandingPage.tsx          # Vista principal de entrada (Hero, Métricas, Módulos, CTA)
│   │   ├── LandingNavbar.tsx        # Barra de navegación superior de la landing
│   │   └── LandingHeroPreview.tsx   # Gráfico/Mockup interactivo de liquidación + IA
│   ├── skills/
│   │   ├── SkillTutorialPage.tsx    # Centro interactivo de tutoriales y descarga
│   │   ├── ClaudeTutorialTab.tsx    # Guía Desktop y CLI para Claude
│   │   ├── AntigravityTutorialTab.tsx # Guía Desktop y CLI para Antigravity
│   │   └── ChatGptTutorialTab.tsx   # Guía Desktop / Custom GPT y Codex
│   └── layout/
│       ├── AppShell.tsx             # Workspace principal de la suite
│       └── Sidebar.tsx              # Barra lateral con enlaces a Inicio y Tutorial
├── context/
│   └── AppContext.tsx               # Estado de navegación (currentView, navigateToView)
└── App.tsx                          # Router condicional según currentView
```

---

## 5. Criterios de Aceptación y Verificación

1. **Impacto Visual y Responsividad:**
   - La Landing Page carga de manera instantánea, es atractiva y legible tanto en tema claro como oscuro.
   - En pantallas móviles y tablets, los botones CTA y las tarjetas se adaptan sin desbordamiento.
2. **Funcionamiento de los CTAs:**
   - Clic en "Empecemos" abre la suite en el módulo de Persona Natural (`#app`).
   - Clic en "Descargar Skill de IA" abre el hub de tutoriales (`#skill-tutorial`).
3. **Tutoriales Completos y Funcionales:**
   - Cada pestaña (Claude, Antigravity, ChatGPT/Codex) contiene instrucciones detalladas tanto para la aplicación Desktop como para la CLI/Agentes.
   - Los botones de copiar al portapapeles funcionan con feedback visual.
   - El botón de descarga de la skill entrega los archivos o el bundle funcional.
4. **Navegación Intuitiva:**
   - El usuario puede alternar libremente entre la Landing, el Tutorial y la Suite sin perder datos ni estado de cálculo.
5. **Calidad de Código y Pruebas:**
   - TypeScript estricto sin `any`.
   - `npm run build` y `npm test` pasan sin errores.
   - Linteo con `oxlint` sin advertencias.
