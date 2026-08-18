FROM python:3.11-slim

# Evitar prompts interactivos y buffers de Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

WORKDIR /app

# Instalar dependencias del sistema mínimas
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código del backend y reglas
COPY backend /app/backend

WORKDIR /app/backend

# Exponer puerto para Cloud Run
EXPOSE 8080

# Health check básico
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/v1/health || exit 1

# Comando de arranque optimizado para Cloud Run (utilizando $PORT dinámico)
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --workers 2
