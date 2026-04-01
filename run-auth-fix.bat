@echo off
echo.
echo 🛡️  CIVIC_PULSE: Authentication Fix Tool 🛡️
echo.
echo 👥 This will reset the following accounts to password: Admin@123
echo    - admin@civicpulse.in
echo    - commissioner@civicpulse.in
echo    - roads.manager@civicpulse.in
echo    - officer.w3.roads@civicpulse.in
echo.
pause
echo 🔄 Updating accounts in database...
node --env-file=.env.local scripts\create-fresh-accounts.js
echo.
echo 🩺 Running final diagnostics...
node --env-file=.env.local scripts\login-diagnostics.js
echo.
echo 📝 If everything shows '✅ PASSWORD MATCHES: Admin@123', you are ready!
echo 🚀 Use these credentials to test your staff dashboards.
echo.
pause
