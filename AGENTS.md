# AGENTS.md — Protocolo y Directivas para Agentes Autónomos en TributIA

Bienvenido agente. Este archivo es el **manual central y punto de entrada unificado** para agentes de codificación e IA (Codex, Google Jules / Antigravity, Claude Code, Cursor, Aider, Windsurf, Devin, etc.) que trabajen en **TributIA**.

---

## 🎯 1. Resumen del Proyecto y Capacidades

**TributIA** es una plataforma integral para la liquidación, conciliación y auditoría tributaria en Colombia bajo la normativa del Estatuto Tributario Nacional (Decreto Ley 624 de 1989 y Ley 2277 de 2022).

### Módulos Principales

- **Liquidación Persona Natural (Formulario 210):**
  - Cédula General (Rentas de Trabajo, Rentas de Capital, Rentas No Laborales).
  - Cédula de Pensiones y Cédula de Dividendos.
  - Ganancias Ocasionales (Art. 300, 313, 314, 316 E.T.).
  - Tabla de Tarifas Marginales del Impuesto de Renta (Art. 241 E.T.).
- **Liquidación Persona Jurídica (Formulario 110):**
  - Renta Ordinaria a tarifa general (Art. 240 E.T.).
  - Sobretasa Financiera y Sobretasa Energética.
  - Descuentos Tributarios (Art. 254 a 258 E.T.).
  - Tasa de Tributación Depurada (TTD mínima del 15% según Art. 240 Parágrafo 6).
- **Beneficio de Auditoría (Art. 689-3 E.T.):**
  - Firmeza en 6 meses (incremento $\ge 35\%$).
  - Firmeza en 12 meses (incremento $\ge 25\%$).
- **Sincronización Bidireccional:**
  - Comunicación en tiempo real entre la API, los Agentes CLI y la Interfaz de Usuario mediante Server-Sent Events (SSE) con backend en memoria o Redis.

---

## 🛠️ 2. Comandos del Entorno de Desarrollo

### Configuración e Instalación

```bash
# Instalar dependencias backend y herramientas de desarrollo
poetry install

# Instalar dependencias del frontend
cd frontend && npm install && cd ..
```

### Ejecución de la Aplicación

```bash
# Iniciar frontend y backend en simultáneo (auto-detecta puertos y entorno virtual)
poetry run python run.py

# Alternativa mediante script de arranque bash
./start.sh

# Ejecutar únicamente el backend FastAPI
poetry run uvicorn backend.app.main:app --reload --port 8000

# Ejecutar únicamente el servidor de desarrollo del frontend
cd frontend && npm run dev
```

### Grafo de Arquitectura (Graphify)

```bash
# Actualizar el grafo de conocimiento del repositorio
graphify update .

# Consultar arquitectura o relaciones de dependencias
graphify query "<pregunta sobre el código>"
graphify explain "<concepto o archivo>"
graphify god-nodes
```

---

## 🧪 3. Instrucciones de Pruebas y Verificación

Antes de enviar cambios o dar por concluida una tarea, **es obligatorio** ejecutar la suite de verificación completa y corregir cualquier fallo:

### 1. Pruebas Unitarias y de Integración (Pytest)

```bash
# Ejecutar toda la suite de pruebas del backend
poetry run pytest backend -v

# Ejecutar un archivo o test específico
poetry run pytest backend/tests/test_pn_calculator.py -v
poetry run pytest backend/tests/test_api_endpoints.py -k "test_calculate_persona_natural" -v

# Ejecutar con reporte de cobertura de código
poetry run pytest backend --cov=app --cov-report=term-missing
```

### 2. Linteo y Formato de Código (Ruff)

```bash
# Comprobar reglas de linteo
poetry run ruff check backend skills run.py

# Aplicar correcciones automáticas
poetry run ruff check --fix backend skills run.py

# Formatear código
poetry run ruff format backend skills run.py
```

### 3. Tipado Estático (Mypy)

```bash
# Validación estricta de tipos con plugin Pydantic
poetry run mypy --config-file pyproject.toml backend skills run.py
```

### 4. Linteo de Documentación (Markdownlint)

```bash
# Validar todos los archivos Markdown
markdownlint -c .markdownlint.json "docs/**/*.md" "README.md" "AGENTS.md"
```

### 5. Pruebas del Frontend

```bash
cd frontend && npm test && npm run build && cd ..
```

---

## 🏛️ 4. Estructura del Repositorio

```text
tribut-ia/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # Routers FastAPI (PN, PJ, Beneficios, Sync, Simulación)
│   │   ├── core/rules_engine/  # Motor declarativo de reglas tributarias (JSON)
│   │   ├── models/             # Esquemas de datos Pydantic v2
│   │   └── services/           # Liquidadores fiscales y almacenamiento de sesión
│   └── tests/                  # Suite integral de pruebas pytest (70+ tests)
├── frontend/                   # React 18 + TypeScript + Vite + Tailwind CSS
├── skills/                     # Habilidades y agentes autónomos CLI
│   └── declaracion-renta-persona-natural/
│       ├── SKILL.md            # Directivas y flujo en 4 fases del agente
│       └── scripts/            # Herramientas CLI (conciliar, consolidar, inyectar)
├── docs/                       # Documentación bajo estándar Diataxis
│   ├── tutorials/              # Tutoriales paso a paso
│   ├── how-to/                 # Guías prácticas
│   ├── reference/              # Referencias técnicas y esquemas
│   ├── explanation/            # Fundamentos legales y tributarios
│   ├── decisions/              # Architecture Decision Records (ADRs)
│   └── estatuto_tributario.md  # Estatuto Tributario Nacional completo en Markdown
├── graphify-out/               # Grafo arquitectónico y visualizador interactivo
└── pyproject.toml              # Configuración central de Poetry, Ruff y Mypy
```

---

## 📐 5. Reglas de Estilo de Código y Convenciones

### Python / Backend

- **Python 3.11+** con tipado estricto en todas las firmas de funciones y métodos.
- **Modelos Pydantic v2:** Usar `BaseModel` con `Field(description=..., default=...)`.
- **Determinismo Fiscal:** Los motores de cálculo en `backend/app/services/` deben ser funciones puras sin efectos secundarios ni estado mutable.
- **Valores Monetarios:** Usar enteros (`int`) o `Decimal` para valores en pesos colombianos ($ COP) para evitar imprecisiones de coma flotante. Redondear según reglas de la DIAN (al múltiplo de mil más cercano).
- **Parámetros UVT:** Nunca quemar valores de UVT fijos en el código; recibirlos como parámetro o tomarlos de `common.py`.
- **Manejo de Excepciones:** Encadenar siempre las excepciones capturadas (`raise HTTPException(...) from err`) para cumplir con la regla Ruff `B904`.
- **Sincronización:** Cualquier mutación de estado de sesión debe propagar eventos SSE a través de `session_store.py`.

### Frontend / UI

- **TypeScript Estricto:** Evitar el uso de `any`; definir interfaces para todos los estados y props.
- **Máscara Contable:** Formatear todas las entradas numéricas con formato de moneda colombiana.
- **Componentes Modulares:** Agrupar formularios por cédulas y pestañas temáticas.

### Documentación y Normativa

- Ante dudas sobre la legislación fiscal colombiana, consultar [`docs/estatuto_tributario.md`](docs/estatuto_tributario.md).
- Toda nueva documentación en `docs/` debe clasificarse en el cuadrante Diataxis correspondiente y cumplir con `.markdownlint.json`.

---

## 🚀 6. Guía de Contribución y Pull Requests para Agentes

1. **Formato de Commits:** Utilizar Conventional Commits:
   - `feat(...)`: Nueva característica tributaria, endpoint o componente UI.
   - `fix(...)`: Corrección de cálculo fiscal, endpoint o error de tipado.
   - `docs(...)`: Actualizaciones en documentación técnica o Estatuto Tributario.
   - `refactor(...)`: Reestructuración de código sin alterar comportamiento.
   - `test(...)`: Adición o modificación de pruebas unitarias/integración.
   - `chore(...)`: Tareas de configuración, dependencias o tooling.
2. **Checklist antes de finalizar:**
   - [ ] `poetry run ruff check backend skills run.py` sin errores.
   - [ ] `poetry run ruff format --check backend skills run.py` sin diferencias.
   - [ ] `poetry run mypy --config-file pyproject.toml backend skills run.py` exitoso.
   - [ ] `poetry run pytest backend -v` con todas las pruebas pasando.
   - [ ] `markdownlint -c .markdownlint.json "docs/**/*.md" "README.md" "AGENTS.md"` sin errores.
   - [ ] `graphify update .` ejecutado si se modificaron archivos de código.
