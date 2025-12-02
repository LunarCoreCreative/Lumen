@echo off
chcp 65001 >nul
echo ========================================
echo   LUMEN - GUIA DE COMANDOS
echo ========================================
echo.
echo DESENVOLVIMENTO:
echo   iniciar_app.bat          - Inicia o app em modo desenvolvimento
echo.
echo BUILD E PUBLICAÇÃO:
echo   build_local.bat          - Gera instalador local (sem publicar)
echo   publicar_release.bat     - Publica release no GitHub
echo.
echo ATUALIZAR VERSÃO:
echo   npm version patch        - 0.1.0 -^> 0.1.1 (correção)
echo   npm version minor        - 0.1.0 -^> 0.2.0 (nova feature)
echo   npm version major        - 0.1.0 -^> 1.0.0 (mudança grande)
echo.
echo WORKFLOW COMPLETO:
echo   1. Desenvolver: iniciar_app.bat
echo   2. Testar: build_local.bat
echo   3. Atualizar versão: npm version patch
echo   4. Commitar: git add . ^&^& git commit -m "mensagem"
echo   5. Push: git push ^&^& git push --tags
echo   6. Publicar: publicar_release.bat
echo.
echo ========================================
echo.
echo Escolha uma opção:
echo   [1] Modo Desenvolvimento
echo   [2] Build Local
echo   [3] Publicar Release
echo   [4] Sair
echo.
set /p opcao="Digite o número da opção: "

if "%opcao%"=="1" (
    echo.
    echo Iniciando modo desenvolvimento...
    call iniciar_app.bat
) else if "%opcao%"=="2" (
    echo.
    echo Iniciando build local...
    call build_local.bat
) else if "%opcao%"=="3" (
    echo.
    echo Iniciando publicação...
    call publicar_release.bat
) else if "%opcao%"=="4" (
    echo.
    echo Até logo!
    timeout /t 2 >nul
    exit /b 0
) else (
    echo.
    echo Opção inválida!
    pause
)
