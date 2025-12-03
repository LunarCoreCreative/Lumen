@echo off
chcp 65001 >nul
echo ========================================
echo   LUMEN - CRIAR RELEASE VIA GITHUB
echo ========================================
echo.

REM Ler versão do package.json
for /f "tokens=2 delims=:, " %%a in ('findstr /C:"\"version\"" package.json') do set VERSION=%%a
set VERSION=%VERSION:"=%

echo Versão detectada no package.json: v%VERSION%
echo.
echo Este script irá:
echo   1. Fazer commit das mudanças
echo   2. Criar tag v%VERSION%
echo   3. Fazer push para o GitHub
echo   4. GitHub Actions fará o resto automaticamente:
echo      - Build do app
echo      - Publicação no GitHub Releases
echo      - Atualização do Firestore
echo.

set /p confirma="Deseja continuar? (S/N): "
if /i not "%confirma%"=="S" (
    echo Operação cancelada.
    pause
    exit /b 0
)

echo.
echo ========================================
echo   ETAPA 1/3: Commit das mudanças
echo ========================================
echo.

set /p commit_msg="Digite a mensagem do commit (ou Enter para usar 'Release v%VERSION%'): "
if "%commit_msg%"=="" set commit_msg=Release v%VERSION%

git add .
git commit -m "%commit_msg%"
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Nenhuma mudança para commitar ou erro no commit.
    echo Continuando mesmo assim...
    echo.
)

echo.
echo ========================================
echo   ETAPA 2/3: Criando tag v%VERSION%
echo ========================================
echo.

git tag v%VERSION%
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERRO: Falha ao criar tag!
    echo.
    echo Possíveis causas:
    echo - Tag já existe (delete com: git tag -d v%VERSION%)
    echo - Erro no Git
    echo.
    pause
    exit /b 1
)

echo ✅ Tag v%VERSION% criada!

echo.
echo ========================================
echo   ETAPA 3/3: Push para GitHub
echo ========================================
echo.

echo Fazendo push do código...
git push origin main
if %errorlevel% neq 0 (
    echo ⚠️  Aviso: Push do código falhou ou já estava atualizado
)

echo.
echo Fazendo push da tag...
git push origin v%VERSION%
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERRO: Falha ao fazer push da tag!
    echo.
    echo Tente manualmente:
    echo   git push origin v%VERSION%
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ RELEASE INICIADO COM SUCESSO!
echo ========================================
echo.
echo Tag v%VERSION% enviada para o GitHub!
echo.
echo 🤖 GitHub Actions está trabalhando agora...
echo.
echo Acompanhe o progresso em:
echo https://github.com/LunarCoreCreative/Lumen/actions
echo.
echo Quando concluir, o release estará em:
echo https://github.com/LunarCoreCreative/Lumen/releases
echo.
echo ⏱️  Tempo estimado: 5-10 minutos
echo.
pause
