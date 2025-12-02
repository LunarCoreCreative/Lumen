@echo off
chcp 65001 >nul
echo ========================================
echo   LUMEN - REINSTALAR E BUILD
echo ========================================
echo.

echo [1/4] Removendo node_modules do electron-builder...
if exist node_modules\electron-builder rmdir /s /q node_modules\electron-builder
if exist node_modules\app-builder-bin rmdir /s /q node_modules\app-builder-bin
if exist node_modules\app-builder-lib rmdir /s /q node_modules\app-builder-lib
echo Removido ✓
echo.

echo [2/4] Reinstalando electron-builder...
call npm install electron-builder --save-dev
if %errorlevel% neq 0 (
    echo ❌ ERRO: Falha ao instalar electron-builder
    pause
    exit /b 1
)
echo Instalado ✓
echo.

REM Configurar token do GitHub (Defina GH_TOKEN nas variáveis de ambiente se necessário)
REM set GH_TOKEN=seu_token_aqui

echo [3/4] Limpando builds anteriores...
if exist dist rmdir /s /q dist
if exist dist-electron rmdir /s /q dist-electron
echo Limpo ✓
echo.

echo [4/4] Fazendo build...
call npm run build:win
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERRO: Build falhou!
    pause
    exit /b 1
)
echo.

echo ========================================
echo   ✅ BUILD CONCLUÍDO!
echo ========================================
echo.
dir dist-electron\*.exe
echo.
pause
