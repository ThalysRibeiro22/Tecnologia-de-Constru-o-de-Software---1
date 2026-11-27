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

node -e "if (Number(process.versions.node.split('.')[0]) < 22) process.exit(1)"
if errorlevel 1 (
  echo Esta etapa precisa do Node.js 22 ou superior por causa do driver SQLite.
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
  call npm install
  if errorlevel 1 (
    echo Nao foi possivel instalar as dependencias.
    pause
    exit /b 1
  )
)

echo Restaurando o banco inicial (os cadastros feitos serao apagados)...
node servidor\resetar-banco.js
echo.
pause
