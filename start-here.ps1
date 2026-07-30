Set-Location $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js 20+ est requis" }
node src/cli.js demo
node src/cli.js status
Invoke-Item workspace/KANBAN.md
