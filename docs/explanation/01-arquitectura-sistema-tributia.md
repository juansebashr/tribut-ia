# Explicación: Arquitectura del Sistema TributIA

Este documento expone la filosofía de diseño, principios de ingeniería y decisiones técnicas fundamentales detrás de la plataforma TributIA.

---

## 1. Principios de Diseño
1. **Motor Tributario Desacoplado**: La lógica tributaria (`liquidacion_pn.py`, `liquidacion_pj.py`) es agnóstica de la interfaz gráfica y de la base de datos. Recibe modelos de dominio Pydantic y matrices de reglas en memoria, facilitando pruebas unitarias exhaustivas y ejecución en microservicios o CLI.
2. **Sincronización Bidireccional Reactiva (API ↔ UI)**: El navegador no es un consumidor pasivo. La interfaz mantiene un canal unidireccional persistente vía Server-Sent Events (SSE) y un canal de reporte debounced vía REST, logrando reactividad sin la sobrecarga de WebSockets con estado complejo.
3. **Reglas como Código Versionado**: Cada año gravable posee su propio artefacto de configuración JSON (`rules_2026.json`, `rules_2025.json`, etc.), permitiendo liquidar vigencias anteriores o proyectar reformas tributarias futuras sin tocar el código fuente.
4. **Trazabilidad y Auditoría de Cada Peso**: Cada cálculo produce un log de auditoría (`audit_trace`) que documenta cada tope legal aplicado, el artículo estatutario y el valor aceptado o rechazado.

