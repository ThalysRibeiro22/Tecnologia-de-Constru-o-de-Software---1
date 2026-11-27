@echo off
setlocal
cd /d "%~dp0"
title MadeiraFlow

rem Confere se o Node.js esta instalado
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao foi encontrado neste computador.
  echo Baixe a versao LTS em https://nodejs.org, instale e tente de novo.
  echo.
  pause
  exit /b 1
)

node -e "if (Number(process.versions.node.split('.')[0]) < 22) process.exit(1)"
if errorlevel 1 (
  echo Esta etapa precisa do Node.js 22 ou superior por causa do driver SQLite.
  echo Atualize o Node.js e tente novamente.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\better-sqlite3\package.json" (
  where npm >nul 2>nul
  if errorlevel 1 (
    echo npm nao foi encontrado. Instale o Node.js completo e tente novamente.
    pause
    exit /b 1
  )
  echo Instalando a dependencia SQLite...
  call npm install
  if errorlevel 1 (
    echo Nao foi possivel instalar as dependencias.
    pause
    exit /b 1
  )
)

echo Iniciando o MadeiraFlow...
echo O navegador vai abrir em instantes.
echo Para encerrar, feche esta janela ou aperte Ctrl+C.
echo.

rem Abre o navegador depois de 2 segundos, enquanto o servidor sobe
start "" /min cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

node servidor\servidor.js

echo.
echo O servidor foi encerrado.
pause
