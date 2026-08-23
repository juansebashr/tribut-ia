# ==============================================================================
# ETAPA 1: Construcción del Frontend React + TypeScript (Vite)
# ==============================================================================
FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend

# Copiar configuración de dependencias de Node
COPY frontend/package.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente y assets del frontend
COPY frontend/ ./

# Compilar SPA optimizada para producción
RUN npm run build

# ==============================================================================
# ETAPA 2: Runtime Backend FastAPI + Servidor de Producción Uvicorn
# ==============================================================================
FROM python:3.11-slim

# Evitar prompts interactivos y buffers de Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VERSION=1.8.5 \
    POETRY_HOME="/opt/poetry" \
    POETRY_VIRTUALENVS_CREATE=false \
    POETRY_NO_INTERACTION=1 \
    PORT=8080

ENV PATH="$POETRY_HOME/bin:$PATH"

WORKDIR /app

# Instalar dependencias del sistema mínimas y Poetry
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && curl -sSL https://install.python-poetry.org | python3 - \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de definición de dependencias de Python
COPY pyproject.toml /app/

# Instalar solo dependencias principales (sin dev) en el contenedor
RUN poetry install --only main --no-root

# Copiar código del backend, docs y recursos
COPY backend /app/backend
COPY docs /app/docs

# Copiar los artefactos estáticos compilados de React desde la Etapa 1
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

WORKDIR /app/backend

# Exponer puerto para despliegue en Cloud Run / Docker
EXPOSE 8080

# Comando de arranque optimizado (utilizando $PORT dinámico con fallback a 8080)
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
