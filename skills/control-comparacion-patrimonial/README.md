# Skill: Control por Comparación Patrimonial (Formulario 210)

Habilidad autónoma de IA para auditar borradores de declaración de renta de personas naturales en Colombia, detectar inconsistencias patrimoniales bajo los **Artículos 236 y 237 del Estatuto Tributario**, guiar al contribuyente con un cuestionario probatorio y formular planes de optimización tributaria.

---

## 📦 Estructura del Skill

```text
skills/control-comparacion-patrimonial/
├── SKILL.md                                # Directivas para agentes autónomos
├── README.md                               # Guía rápida de uso
├── beneficios_justificacion_patrimonial.md # Catálogo de fuentes y requisitos probatorios
├── scripts/
│   ├── analizar_comparacion.py             # CLI de análisis matemático y detección de desajuste
│   ├── extraer_f210_borrador.py            # CLI parser de casillas de F210
│   ├── generar_plan_optimizacion.py        # Generador de informe de regularización en Markdown
│   └── inyectar_session_patrimonial.py     # Sincronizador con la API / UI de Fiscol
└── templates/
    ├── f210_borrador_ejemplo.json          # Ejemplo de prueba con desajuste
    └── cuestionario_diagnostico.json       # Preguntas diagnósticas y documentos
```

---

## 🚀 Uso Rápido en Línea de Comandos

```bash
# 1. Analizar un borrador del Formulario 210
poetry run python skills/control-comparacion-patrimonial/scripts/analizar_comparacion.py skills/control-comparacion-patrimonial/templates/f210_borrador_ejemplo.json --out diagnostico.json

# 2. Generar el Plan de Optimización en Markdown
poetry run python skills/control-comparacion-patrimonial/scripts/generar_plan_optimizacion.py diagnostico.json --out-md plan_regularizacion.md

# 3. Sincronizar con la sesión web de Fiscol
poetry run python skills/control-comparacion-patrimonial/scripts/inyectar_session_patrimonial.py diagnostico.json --session-id default
```
