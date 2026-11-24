@echo off
rem Startet Pruefwerk nur auf diesem Rechner (127.0.0.1), nicht im Netz.
cd /d "%~dp0"
start "" http://127.0.0.1:8780/index.html
python -m http.server 8780 --bind 127.0.0.1
