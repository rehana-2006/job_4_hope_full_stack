@echo off
cd /d "%~dp0"
echo Starting Job4Hope Server...

:: 1. Try to activate venv (if exists)
:: 1. Try to activate venv (if exists)
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else if exist "project\Scripts\activate.bat" (
    call project\Scripts\activate.bat
) else (
    echo No virtual environment found! Attempting to run with global python...
)

:: 2. Install Dependencies
echo Installing dependencies...
python -m pip install PyJWT
python -m pip install -r requirements.txt

:: 3. Start Server
echo Starting API...
python -m uvicorn backend.main:app --reload

pause
