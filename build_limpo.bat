@echo off
chcp 65001 >nul
echo ========================================
echo   LUMEN - LIMPAR CACHE E BUILD
echo ========================================
echo.

REM Configurar token do GitHub (Defina GH_TOKEN nas variáveis de ambiente se necessário)
REM set GH_TOKEN=seu_token_aqui

echo [1/3] Limpando cache e builds anteriores...
if exist dist rmdir /s /q dist
if exist dist-electron rmdir /s /q dist-electron
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo Cache limpo ✓
echo.

echo [2/3] Executando build do Vite...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERRO: Build do Vite falhou!
    pause
    exit /b 1
)
echo Build do Vite concluído ✓
echo.

echo [3/3] Gerando instalador...
echo (Isso pode levar alguns minutos)
echo.
call npm run build:win
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERRO: Build falhou!
    pause
    exit /b 1
)
echo.

echo ========================================
echo   ✅ BUILD CONCLUÍDO COM SUCESSO!
echo ========================================
echo.
echo Arquivos gerados em: dist-electron\
echo.
dir dist-electron\*.exe
echo.
pause
