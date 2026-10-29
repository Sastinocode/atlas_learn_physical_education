@echo off
cd /d "%~dp0"
if not exist "dist-offline\index.html" (
 echo Falta compilar: instala Node.js 24 y ejecuta npm ci y npm run build:pages.
 pause
 exit /b 1
)
start "" "%~dp0dist-offline\index.html"
