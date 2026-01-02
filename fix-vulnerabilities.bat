@echo off
echo Running security audit and fix...
echo.

echo Updating dependencies...
call npm install

echo.
echo Attempting to fix vulnerabilities...
call npm audit fix

echo.
echo Security check complete.
echo If any vulnerabilities persist, they may require manual review, but critical ones should be resolved.
pause