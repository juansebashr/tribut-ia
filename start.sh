#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PORT="${PORT:-8000}"

echo "================================================================="
echo "🇨🇴 Iniciando TributIA - Motor Tributario Colombiano (2026)"
echo "================================================================="

# Liberar puerto si está ocupado
if command -v lsof >/dev/null 2>&1; then
    PIDS=$(lsof -ti:${PORT} 2>/dev/null || true)
    if [ -n "$PIDS" ]; then
        echo "⚠️  Liberando puerto ${PORT} ocupado por proceso(s): $PIDS..."
        echo "$PIDS" | xargs kill -9 2>/dev/null || true
        sleep 0.5
    fi
fi

# Activar entorno virtual si existe (.venv en raíz o backend/venv)
if [ -d "$DIR/.venv" ]; then
    source "$DIR/.venv/bin/activate"
elif [ -d "$DIR/backend/venv" ]; then
    source "$DIR/backend/venv/bin/activate"
fi

python "$DIR/run.py" --port "$PORT"
