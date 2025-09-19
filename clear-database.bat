@echo off
echo 🗑️ Clearing database users...
powershell -ExecutionPolicy Bypass -File ".\scripts\db-utils.ps1" clear-users
pause