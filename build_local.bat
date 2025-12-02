@echo off
chcp 65001 >nul
echo ========================================
echo   LUMEN - BUILD E PUBLICAÇÃO
echo ========================================
echo.

REM Configurar token do GitHub (Defina GH_TOKEN nas variáveis de ambiente se necessário)
REM set GH_TOKEN=seu_token_aqui

echo [1/2] Configurando ambiente...
echo Token do GitHub configurado ✓
echo.

echo [2/2] Executando build completo...
echo (Isso pode levar alguns minutos)
echo.
call npm run build:win
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERRO: Build falhou!
    echo.
    echo Possíveis causas:
    echo - Erro no código
    echo - Falta de dependências
    echo - Problema de memória
    echo.
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
echo Próximos passos:
echo 1. Instale o executável gerado
echo 2. Teste o aplicativo
echo 3. Use 'publicar_release.bat' para publicar no GitHub
echo.
pause
