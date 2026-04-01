@echo off
echo AUTH FIX TOOL
echo -------------
echo Step 1: Updating accounts...
node --env-file=.env.local scripts\create-fresh-accounts.js
echo.
echo Step 2: Running diagnostics...
node --env-file=.env.local scripts\login-diagnostics.js
echo.
echo DONE. Test login with Admin@123
pause
