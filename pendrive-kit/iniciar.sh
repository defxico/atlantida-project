#!/bin/sh
# Mac/Linux: precisa de python3 (ou ruby) instalado.
cd "$(dirname "$0")/site" || exit 1
PORT=5173
abrir() { sleep 1; (command -v open >/dev/null && open "http://localhost:$PORT/") || (command -v xdg-open >/dev/null && xdg-open "http://localhost:$PORT/"); }
abrir &
if command -v python3 >/dev/null 2>&1; then exec python3 -m http.server "$PORT"
elif command -v ruby >/dev/null 2>&1; then exec ruby -run -e httpd . -p "$PORT"
else echo "Instale python3 ou use o Windows (Iniciar Nautilus.bat)."; exit 1; fi
