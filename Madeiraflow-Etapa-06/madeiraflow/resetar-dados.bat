@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao foi encontrado neste computador.
  echo Baixe a versao LTS em https://nodejs.org, instale e tente de novo.
  echo.
  pause
  exit /b 1
)

echo Restaurando os dados iniciais (os cadastros feitos serao apagados)...
node servidor\servidor.js --resetar
echo.
pause
