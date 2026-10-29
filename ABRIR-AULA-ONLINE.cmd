@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo No se encuentra Node.js. Consulta GUIA-AULA-EN-DIRECTO.md.
 pause
 exit /b 1
)
echo EL CUERPO EN MOVIMIENTO - ABRIENDO EL AULA
echo El navegador se abrira automaticamente.
echo Minimiza esta ventana y mantenla abierta mientras dure la clase.
node scripts/start-classroom-online.mjs
if errorlevel 1 pause
