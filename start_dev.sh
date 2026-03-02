#!/usr/bin/env bash
# Uruchamia backend i frontend w trybie dev
# Użycie: ./start_dev.sh

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "=== Product Discovery Web UI ==="
echo ""

# Backend
echo "[1/2] Startowanie backendu FastAPI (port 8000)..."
cd "$ROOT"
PYTHONPATH="$ROOT/src" uvicorn backend.main:app --reload --port 8000 &
BACKEND_PID=$!
echo "      Backend PID: $BACKEND_PID"

sleep 1

# Frontend
echo "[2/2] Startowanie frontendu Vite (port 5173)..."
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!
echo "      Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ Serwisy uruchomione:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo "   API docs: http://localhost:8000/docs"
echo ""
echo "Ctrl+C aby zatrzymać oba serwisy"

# Czekaj i zatrzymaj oba przy Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
