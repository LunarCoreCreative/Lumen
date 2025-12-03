@echo off
chcp 65001 >nul
echo ========================================
echo   LUMEN - PUBLICAR RELEASE COMPLETO
echo ========================================
echo.

REM Verificar se as variáveis de ambiente do Firebase estão configuradas
if "%FIREBASE_PROJECT_ID%"=="" (
    echo ❌ ERRO: Variáveis de ambiente do Firebase não configuradas!
    echo.
    echo Configure as seguintes variáveis:
    echo   - FIREBASE_PROJECT_ID
    echo   - FIREBASE_CLIENT_EMAIL
    echo   - FIREBASE_PRIVATE_KEY
    echo.
    echo Ou defina-as temporariamente neste script.
    pause
    exit /b 1
)

REM Ler versão do package.json
for /f "tokens=2 delims=:, " %%a in ('findstr /C:"\"version\"" package.json') do set VERSION=%%a
set VERSION=%VERSION:"=%
echo Versão atual: %VERSION%
echo.

echo ⚠️  ATENÇÃO: Este comando irá:
echo    1. Fazer build do projeto
echo    2. Criar instalador
echo    3. Publicar automaticamente no GitHub Releases
echo    4. Atualizar o Firestore com SHA512 e URL de download
echo.
set /p confirma="Deseja continuar? (S/N): "
if /i not "%confirma%"=="S" (
    echo Operação cancelada.
    pause
    exit /b 0
)

echo.
echo ========================================
echo   ETAPA 1/2: Publicando no GitHub
echo ========================================
echo.
call npm run publish:win
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERRO: Publicação no GitHub falhou!
    echo.
    echo Possíveis causas:
    echo - Token do GitHub inválido ou expirado
    echo - Sem permissão no repositório
    echo - Problema de conexão com internet
    echo - Erro no build
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ETAPA 2/2: Atualizando Firestore
echo ========================================
echo.
echo Aguardando 5 segundos para garantir que o release foi publicado...
timeout /t 5 /nobreak >nul
echo.

call npm run update-firestore
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERRO: Atualização do Firestore falhou!
    echo.
    echo O release foi publicado no GitHub, mas o Firestore não foi atualizado.
    echo Você pode tentar atualizar manualmente executando:
    echo   npm run update-firestore
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ PUBLICAÇÃO COMPLETA COM SUCESSO!
echo ========================================
echo.
echo Release v%VERSION% publicado e Firestore atualizado!
echo.
echo Acesse: https://github.com/LunarCoreCreative/Lumen/releases
echo.
echo Os usuários receberão a atualização automaticamente! 🎉
echo.
pause
