# TributIA — Manual de Asistente IA (CLAUDE.md)

**TributIA** es una plataforma colombiana de liquidación tributaria profesional que automatiza el diligenciamiento, cálculo y conciliación de declaraciones de impuestos (Formulario 210 para Personas Naturales, Formulario 110 y Tasa Mínima TTD para Personas Jurídicas, Beneficio de Auditoría Art. 689-3 E.T. y Calendario DIAN con sincronización bidireccional en tiempo real vía SSE).

---

## 🛠️ Comandos Principales de Desarrollo

### 1. Entorno y Ejecución

```bash
# Iniciar frontend y backend conjuntamente (detección automática de puertos y .venv)
poetry run python run.py
# o mediante el launcher bash:
./start.sh
```

### 2. Pruebas y Cobertura (Pytest)

```bash
# Ejecutar la suite completa de pruebas unitarias y de integración
poetry run pytest backend -v

# Ejecutar con reporte de cobertura
poetry run pytest backend --cov=app --cov-report=term-missing
```

### 3. Calidad de Código y Linteo (Ruff)

```bash
# Chequeo de linter
poetry run ruff check backend skills run.py

# Formateo automático de código
poetry run ruff format backend skills run.py
```

### 4. Tipado Estático (Mypy)

```bash
# Validación estricta de tipos con plugin de Pydantic
poetry run mypy --config-file pyproject.toml backend skills run.py
```

### 5. Documentación y Linteo Markdown (Markdownlint)

```bash
# Validar toda la documentación técnica y el Estatuto Tributario
markdownlint -c .markdownlint.json "docs/**/*.md" "docs/*.md" "README.md"
```

### 6. Frontend (React / Vite / TypeScript)

```bash
cd frontend
npm run dev     # Servidor de desarrollo
npm test        # Pruebas unitarias frontend
npm run build   # Compilación de producción
```

### 7. Grafo de Conocimiento Arquitectónico (Graphify)

```bash
# Actualizar el grafo de arquitectura y dependencias
graphify update .
```

---

## 🏛️ Arquitectura del Sistema

```text
tribut-ia/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # Routers FastAPI (PN, PJ, Beneficios, Sync, Simulación)
│   │   ├── core/rules_engine/  # Motor declarativo de reglas tributarias (JSON)
│   │   ├── models/             # Esquemas de datos Pydantic v2
│   │   └── services/           # Liquidadores puros y gestores de sesión (Memory/Redis)
│   └── tests/                  # Suite integral de pruebas pytest
├── frontend/                   # React 18 + Vite + TypeScript + Tailwind CSS
├── skills/                     # Habilidades y agentes autónomos CLI
├── docs/                       # Documentación estructurada bajo estándar Diataxis
│   └── estatuto_tributario.md  # Estatuto Tributario Nacional completo (Decreto Ley 624 de 1989)
└── pyproject.toml              # Gestión de dependencias y configuración Poetry
```

---

## 📋 Reglas y Estándares de Codificación

1. **Exactitud Normativa:** Todas las fórmulas fiscales deben ceñirse estrictamente al Estatuto Tributario colombiano (E.T.) y a la Ley 2277 de 2022.
2. **Determinismo y Funciones Puras:** Los liquidadores tributarios (`liquidacion_pn.py`, `liquidacion_pj.py`) no deben mantener estado mutable ni acoplarse directamente a la capa HTTP.
3. **Encadenamiento de Excepciones:** Al capturar y relanzar errores, usar siempre `raise HTTPException(...) from err` para preservar el rastro de la pila (regla B904).
4. **Sincronización Bidireccional:** Cualquier modificación de sesión debe emitir eventos SSE limpios (`state_update`, `reset`) a través de `session_store.py`.
5. **No Regresiones:** Antes de completar tareas, verificar que `ruff`, `mypy`, `markdownlint` y `pytest` pasen al 100%.
