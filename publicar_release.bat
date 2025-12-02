@echo off
chcp 65001 >nul
echo ========================================
echo   LUMEN - PUBLICAR RELEASE NO GITHUB
echo ========================================
echo.

REM Configurar token do GitHub (Defina GH_TOKEN nas variáveis de ambiente se necessário)
REM set GH_TOKEN=seu_token_aqui

echo Token do GitHub configurado ✓
echo.
echo ⚠️  ATENÇÃO: Este comando irá:
echo    - Fazer build do projeto
echo    - Criar instalador
echo    - Publicar automaticamente no GitHub Releases
echo.
echo Versão atual: 0.1.0
echo.
set /p confirma="Deseja continuar? (S/N): "
if /i not "%confirma%"=="S" (
    echo Operação cancelada.
    pause
    exit /b 0
)

echo.
echo Publicando release...
echo (Isso pode levar alguns minutos)
echo.
call npm run publish:win
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERRO: Publicação falhou!
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
echo   ✅ PUBLICADO COM SUCESSO!
echo ========================================
echo.
echo Acesse: https://github.com/RimuSrPao/Lumen/releases
echo.
echo Próximos passos:
echo 1. Verifique a release no GitHub
echo 2. Adicione notas de versão (changelog)
echo 3. Publique a release (se estiver como draft)
echo.
pause
