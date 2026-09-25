$ErrorActionPreference = "Stop"
Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " LifePath - Vercel Production Deploy" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
  Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
  npm install -g vercel
}

Write-Host "Running a local type check before deployment..." -ForegroundColor Cyan
npm run typecheck

Write-Host "Deploying LifePath to production..." -ForegroundColor Cyan
vercel --prod
