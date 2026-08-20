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

# Copiar archivos de definición de dependencias
COPY pyproject.toml /app/

# Instalar solo dependencias principales (sin dev) en el sistema del contenedor
RUN poetry install --only main --no-root

# Copiar código del backend y recursos de la app
COPY backend /app/backend
COPY frontend /app/frontend
COPY docs /app/docs

WORKDIR /app/backend

# Exponer puerto para Cloud Run
EXPOSE 8080

# Comando de arranque optimizado para Cloud Run (utilizando $PORT dinámico con fallback a 8080)
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
