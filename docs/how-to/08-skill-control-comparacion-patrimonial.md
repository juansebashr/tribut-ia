# Cómo Auditar Borradores del Formulario 210 y Regularizar Desajustes con el Skill de IA `control-comparacion-patrimonial`

Esta guía práctica explica cómo utilizar el agente autónomo de IA y los scripts CLI del skill `control-comparacion-patrimonial` para auditar declaraciones de personas naturales en Colombia, detectar inconsistencias bajo los **Artículos 236 y 237 del Estatuto Tributario**, responder el cuestionario probatorio y generar un plan de regularización y optimización tributaria.

---

## 1. Instalación del Skill en Asistentes de IA

### Google Antigravity / Jules
```bash
mkdir -p ~/.gemini/skills/control-comparacion-patrimonial
curl -o ~/.gemini/skills/control-comparacion-patrimonial/SKILL.md \
  https://raw.githubusercontent.com/juansebashr/tribut-ia/main/skills/control-comparacion-patrimonial/SKILL.md
```

### Claude Code
```bash
mkdir -p skills/control-comparacion-patrimonial
curl -o skills/control-comparacion-patrimonial/SKILL.md \
  https://raw.githubusercontent.com/juansebashr/tribut-ia/main/skills/control-comparacion-patrimonial/SKILL.md
```

### Cursor / Windsurf / OpenAI Codex
Copiar la carpeta `skills/control-comparacion-patrimonial/` dentro de la raíz de tu proyecto local o `.cursor/skills/`.

---

## 2. Flujo Operativo en 4 Fases

### Fase 1: Diagnóstico Matemático del Borrador F210
El agente extrae las casillas patrimoniales y cedulares del Formulario 210 y ejecuta el CLI:

```bash
poetry run python skills/control-comparacion-patrimonial/scripts/analizar_comparacion.py borrador_f210.json --out diagnostico.json
```

El script evalúa la fórmula legal:
$$\text{Patrimonio Líquido Actual} - \text{Patrimonio Líquido Anterior} \le \text{Rentas Justificadas (Ingresos Netos - Impuestos - Gastos)}$$

Si existe `diferencia_no_justificada > 0`, el agente entra en modo de alerta y activa el cuestionario.

### Fase 2: Interrogatorio Probatorio & Solicitud de Documentos
El agente interroga al usuario sobre 5 ejes críticos:
1. **Inmuebles y Vehículos Adquiridos:** Escrituras públicas y matrículas.
2. **Nuevas Deudas (Art. 283 E.T.):** Certificados bancarios a dic 31 o contratos de mutuo privado con **fecha cierta** ante notario.
3. **Desahorros de Años Anteriores:** Extractos bancarios a dic 31 del año previo o constancias de cancelación de CDTs.
4. **Cesantías y Ganancias Extraordinarias:** Retiro de cesantías para vivienda o indemnizaciones de seguros (Art. 303-1).
5. **Reajustes Fiscales DANE (Art. 73 E.T.):** Incremento nominal del costo fiscal que no requiere fondos del periodo.

### Fase 3: Elaboración del Plan de Regularización en Markdown
El agente consolida las respuestas y soportes para generar el informe:

```bash
poetry run python skills/control-comparacion-patrimonial/scripts/generar_plan_optimizacion.py diagnostico.json --answers respuestas.json --out-md plan_optimizacion_patrimonial.md
```

El documento resultante (`plan_optimizacion_patrimonial.md`) contiene:
* Cuadro comparativo antes y después de la regularización.
* Estrategias de defensa y justificación jurídica ante la DIAN.
* Cuantificación del riesgo prevenido por **Sanción de Inexactitud del 100% (Art. 648 E.T.)**.
* Recomendación sobre **Beneficio de Auditoría (Art. 689-3 E.T.)** para lograr firmeza en 6 meses ($\ge 35\%$).

### Fase 4: Sincronización con la Interfaz de Fiscol
```bash
poetry run python skills/control-comparacion-patrimonial/scripts/inyectar_session_patrimonial.py diagnostico.json --api-url https://fiscol-31954329640.us-central1.run.app --session-id ses_12345
```
