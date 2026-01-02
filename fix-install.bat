@echo off
echo Cleaning up project dependencies...
echo.

echo Deleting node_modules...
rmdir /s /q node_modules
if exist node_modules (
    echo Failed to delete node_modules. Please close any programs using files in that folder.
    pause
    exit /b 1
)

echo Deleting package-lock.json...
del package-lock.json
echo Deleting pnpm-lock.yaml...
del pnpm-lock.yaml

echo.
echo Installing dependencies with npm...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo npm install failed! See errors above.
    pause
    exit /b 1
)

echo.
echo Success! Dependencies installed.
echo You can now run 'npm run dev' to start the server.
pause