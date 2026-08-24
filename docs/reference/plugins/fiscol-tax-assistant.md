# Plugin: `fiscol-tax-assistant`

El plugin **`fiscol-tax-assistant`** es el paquete principal de extensiones, herramientas y agentes autónomos especializados en la normativa fiscal de la República de Colombia para el ecosistema **Fiscol**.

---

## 1. Estructura del Plugin

```text
fiscol-tax-assistant/
├── .claude-plugin/
│   └── plugin.json                    # Manifiesto y registro de habilidades
└── skills/
    └── declaracion-renta-persona-natural/
        ├── SKILL.md                   # Directivas y workflow en 4 fases del agente
        ├── beneficios_tributarios_pn.md # Catálogo de beneficios y artículos E.T.
        ├── scripts/
        │   ├── conciliar_exogena.py   # Motor CLI de cruce con Exógena DIAN
        │   ├── consolidar_transacciones.py # Validador y generador de payload API
        │   ├── inyectar_session.py    # Cliente de sincronización bidireccional
        │   └── inyectar_tributia.py   # Alias de compatibilidad
        └── templates/
            └── transacciones_template.csv # Plantilla estándar de transacciones
```

---

## 2. Habilidades (*Skills*) Incluidas

| Skill | Nombre Identificador | Propósito Principal |
| :--- | :--- | :--- |
| **Declaración de Renta Persona Natural** | `declaracion-renta-persona-natural` | Análisis de certificados F220, extractos bancarios, conciliación con información exógena DIAN y liquidación de Cédula General y Formulario 210. |

---

## 3. Instalación e Invocación

Para agentes autónomos o entornos de desarrollo asistido:

```bash
# Invocación en CLI o prompt
"Usa el skill declaracion-renta-persona-natural del plugin fiscol-tax-assistant para analizar mi carpeta de certificados 2025"
```
