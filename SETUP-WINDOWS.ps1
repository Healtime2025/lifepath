$ErrorActionPreference = "Stop"
Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " LifePath - Local Setup" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js is not installed. Install Node.js 22 LTS or newer, then run this script again."
}

if (-not (Test-Path ".env.local")) {
  Copy-Item ".env.example" ".env.local"
  Write-Host "Created .env.local from .env.example" -ForegroundColor Yellow
  Write-Host "Open .env.local and add your Neon DATABASE_URL before continuing." -ForegroundColor Yellow
  notepad ".env.local"
  Read-Host "Press Enter after saving .env.local"
}

Write-Host "Installing packages..." -ForegroundColor Cyan
npm install

Write-Host "Applying database schema..." -ForegroundColor Cyan
npm run db:migrate

Write-Host "Loading LifePath career and public institution data..." -ForegroundColor Cyan
npm run db:seed

Write-Host ""
Write-Host "LifePath setup complete." -ForegroundColor Green
Write-Host "Run: npm run dev" -ForegroundColor Green
Write-Host "Then open: http://localhost:3000" -ForegroundColor Green
