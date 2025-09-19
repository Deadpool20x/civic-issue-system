# PowerShell script to manage database operations
param(
    [string]$Action = "help"
)

# Get the current script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

switch ($Action) {
    "clear-users" {
        Write-Host "🗑️  Clearing users from database..." -ForegroundColor Yellow
        Set-Location $ProjectRoot
        node "$ScriptDir/simple-clear-users.js"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Users cleared successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to clear users." -ForegroundColor Red
        }
    }
    "seed-departments" {
        Write-Host "🌱 Seeding departments..." -ForegroundColor Yellow
        Set-Location $ProjectRoot
        node "$ScriptDir/seed-departments.js"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Departments seeded successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to seed departments." -ForegroundColor Red
        }
    }
    "help" {
        Write-Host "🛠️  Database Utilities" -ForegroundColor Cyan
        Write-Host "Usage:" -ForegroundColor Green
        Write-Host "  .\scripts\db-utils.ps1 clear-users     - Clear all users from database" -ForegroundColor White
        Write-Host "  .\scripts\db-utils.ps1 seed-departments - Seed sample departments" -ForegroundColor White
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor Green
        Write-Host "  cd c:\path\to\civic-issue-system" -ForegroundColor Gray
        Write-Host "  .\scripts\db-utils.ps1 clear-users" -ForegroundColor Gray
    }
    default {
        Write-Host "❌ Unknown action: $Action" -ForegroundColor Red
        Write-Host "Use 'help' for available commands." -ForegroundColor Yellow
        exit 1
    }
}