#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PORT="${PORT:-8000}"

echo "================================================================="
echo "🇨🇴 Iniciando Fiscol - Motor Tributario Colombiano (2026)"
echo "   Plataforma Fullstack: FastAPI + React + TypeScript"
echo "================================================================="

# 1. Compilar el frontend React + TypeScript si no existe dist o se solicita rebuild
if [ ! -d "$DIR/frontend/dist" ] || [ ! -f "$DIR/frontend/dist/index.html" ]; then
    echo "📦 Compilando aplicación React + TypeScript con Vite..."
    if command -v npm >/dev/null 2>&1; then
        (cd "$DIR/frontend" && npm run build)
    else
        echo "⚠️  Node/NPM no encontrado. Se utilizará la versión estática si está disponible."
    fi
fi

# 2. Liberar puertos si están ocupados
if command -v lsof >/dev/null 2>&1; then
    PIDS=$(lsof -ti:${PORT} 2>/dev/null || true)
    if [ -n "$PIDS" ]; then
        echo "⚠️  Liberando puerto $PORT ocupado por proceso(s): $PIDS..."
        echo "$PIDS" | xargs kill -9 2>/dev/null || true
        sleep 0.5
    fi
fi

# 3. Activar entorno virtual si existe (.venv en raíz o backend/venv)
if [ -d "$DIR/.venv" ]; then
    source "$DIR/.venv/bin/activate"
elif [ -d "$DIR/backend/venv" ]; then
    source "$DIR/backend/venv/bin/activate"
fi

# 4. Iniciar servidor
if command -v poetry >/dev/null 2>&1 && [ -f "$DIR/pyproject.toml" ]; then
    poetry run python "$DIR/run.py" --port "$PORT" "$@"
else
    python "$DIR/run.py" --port "$PORT" "$@"
fi
