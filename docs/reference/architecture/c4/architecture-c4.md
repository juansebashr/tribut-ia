# 🏛️ Arquitectura C4 — TributIA

Este documento define la estructura y diseño arquitectónico de **TributIA** usando el modelo C4 de Simon Brown (Nivel 1: Contexto, Nivel 2: Contenedores, Nivel 3: Componentes).

---

## 1. Nivel 1: Diagrama de Contexto del Sistema (C1)

El diagrama de contexto muestra la interacción de TributIA con los diferentes usuarios, agentes externos y normatividad legal de la DIAN.

```mermaid
C4Context
    title Diagrama de Contexto del Sistema (C1) - TributIA

    Person(user, "Contribuyente / Contador", "Usuario humano que liquida sus impuestos, simula auditorías y consulta el calendario.")
    Person(agent, "Agente Autónomo / Script IA", "Cliente automatizado que inyecta datos y consulta el estado de la UI en tiempo real.")
    
    System(tributia, "TributIA Platform", "Suite tributaria colombiana de liquidación automatizada (F210, F110, TTD 15%) y sincronización bidireccional.")
    
    System_Ext(dian, "DIAN (Normatividad Legal)", "Estatuto Tributario, Resoluciones UVT y Calendarios de Vencimientos.")

    Rel(user, tributia, "Usa la interfaz web, diligencia valores y simula escenarios", "HTTPS")
    Rel(agent, tributia, "Inyecta estado vía API REST y escucha actualizaciones vía SSE", "HTTP / SSE")
    Rel(tributia, dian, "Aplica fórmulas exactas de Ley 2277/2022 y Art. 241 E.T.", "Reglas")
```

---

## 2. Nivel 2: Diagrama de Contenedores (C2)

Muestra los bloques ejecutables y tecnologías que conforman la solución.

```mermaid
C4Container
    title Diagrama de Contenedores (C2) - TributIA

    Person(user, "Usuario / Contador", "Navegador Web")
    Person(agent, "Agente / API Client", "cURL / Python")

    Container_Boundary(c1, "TributIA Platform") {
        Container(spa, "Single Page Application (SPA)", "HTML5, Vanilla CSS, Modern JavaScript", "Interfaz reactiva con Formulario 210, termómetro marginal 7 tramos y calendario.")
        Container(api, "Backend API & Tax Engine", "Python 3.11+, FastAPI, Pydantic v2, Uvicorn", "Servicios REST, motor de reglas, almacén de sesiones y streaming SSE.")
        ContainerDb(rules, "Tax Rules Store", "JSON Files (versionados 2022-2026)", "Parámetros de UVT, topes de rentas exentas, tablas marginales y tarifas.")
    }

    Rel(user, spa, "Interactúa y visualiza formularios", "HTTPS")
    Rel(agent, api, "Llama POST /session/state y lee GET /session/state", "REST/JSON")
    Rel(spa, api, "Envía cálculos (/calculate) y sincroniza cambios del DOM", "HTTP REST")
    Rel(api, spa, "Transmite eventos reactivos de actualización", "Server-Sent Events (SSE)")
    Rel(api, rules, "Carga reglas y parámetros tributarios según año gravable", "File I/O")
```

---

## 3. Nivel 3: Diagrama de Componentes del Backend (C3)

Desglose interno de los módulos del backend FastAPI.

```mermaid
C4Component
    title Diagrama de Componentes (C3) - Backend FastAPI

    Container_Boundary(backend, "FastAPI Backend Application") {
        Component(router, "API Router (v1)", "FastAPI APIRouter", "Expone rutas de cálculo, reglas, beneficios, calendario y sesión.")
        Component(session_store, "Session Store & SSE Broadcaster", "Python Service", "Almacena en memoria el estado actual de la UI y difunde eventos a colas SSE.")
        Component(engine_pn, "Motor Persona Natural", "Python Service (Liquidación PN)", "Calcula Cédula General, 25% exenta, topes 1.340 UVT, F210 y Art. 241.")
        Component(engine_pj, "Motor Persona Jurídica", "Python Service (Liquidación PJ)", "Calcula Formulario 110 y Tasa de Tributación Depurada (TTD 15%).")
        Component(calendar_svc, "Servicio de Calendario & NIT", "Python Service", "Calcula DV DIAN (Módulo 11) y mapea plazos de vencimiento.")
        Component(rules_engine, "Rules Loader & Overrides", "Python Service", "Carga matrices JSON y aplica UVT personalizada en memoria.")
    }

    ContainerDb(rules_files, "Reglas JSON", "rules_2026.json, rules_2025.json...")

    Rel(router, session_store, "Lee/Escribe estado de sesión", "async")
    Rel(router, engine_pn, "Ejecuta cálculo PN", "Pydantic Model")
    Rel(router, engine_pj, "Ejecuta cálculo PJ", "Pydantic Model")
    Rel(router, calendar_svc, "Consulta vencimientos NIT", "Helper")
    Rel(engine_pn, rules_engine, "Consulta parámetros año", "Rules Object")
    Rel(engine_pj, rules_engine, "Consulta parámetros año", "Rules Object")
    Rel(rules_engine, rules_files, "Lee archivo JSON correspondiente", "File Read")
```
