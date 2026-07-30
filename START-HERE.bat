@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 20 ou plus est requis.
  pause
  exit /b 1
)
node src\cli.js demo
node src\cli.js status
start "" workspace\KANBAN.md
pause
