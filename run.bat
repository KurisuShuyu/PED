@echo off
echo ===================================================
echo Inicializando Palvi Executive Dashboard (PED)...
echo ===================================================

:: Comprobar si Node.js esta instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado. Por favor, instalalo desde https://nodejs.org/
    pause
    exit
)

echo [1/3] Instalando dependencias (esto puede tomar un minuto la primera vez)...
call npm install

echo [2/3] Iniciando el servidor de desarrollo...
:: Iniciamos vite en segundo plano
start /b npm run dev

:: Damos 3 segundos para que el servidor levante correctamente
echo Esperando a que el servidor inicie...
timeout /t 3 /nobreak >nul

echo [3/3] Abriendo el dashboard...
set URL=http://localhost:5173

:: 1. Intentar con Google Chrome
start chrome %URL% 2>nul
if %errorlevel% equ 0 goto fin

:: 2. Intentar con Mozilla Firefox
start firefox %URL% 2>nul
if %errorlevel% equ 0 goto fin

:: 3. Intentar con Microsoft Edge (el reemplazo de Explorer)
start msedge %URL% 2>nul
if %errorlevel% equ 0 goto fin

:: 4. Fallback: Usar el navegador predeterminado de Windows como ultimo recurso
start %URL%

:fin
echo Listo! Puedes cerrar esta ventana negra cuando termines de revisar el proyecto.
pause
