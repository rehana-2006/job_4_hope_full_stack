@echo off
echo ===================================================
echo   Job4Hope Server Launcher
echo ===================================================
echo.
echo [1/2] Checking for existing server processes...

:: Find the process ID (PID) listening on port 8000
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do (
    echo       Found old process (PID: %%a). Killing it...
    taskkill /F /PID %%a >nul 2>&1
)

echo       Port 8000 is clean.
echo.
echo [2/2] Starting server...
echo.

:: Try to activate virtual environment if it exists
if exist "venv\Scripts\activate.bat" (
    echo       Activating virtual environment (venv)...
    call venv\Scripts\activate.bat
) else if exist ".venv\Scripts\activate.bat" (
    echo       Activating virtual environment (.venv)...
    call .venv\Scripts\activate.bat
) else if exist "env\Scripts\activate.bat" (
    echo       Activating virtual environment (env)...
    call env\Scripts\activate.bat
) else if exist "project\Scripts\activate.bat" (
    echo       Activating virtual environment (project)...
    call project\Scripts\activate.bat
)

:: Start the server
uvicorn backend.main:app --reload

:: Pause so the user can see errors if it crashes immediately
pause
