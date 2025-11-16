@echo off
REM Setup script for backend (Windows)

echo 🚀 Setting up Email Security Analyzer Backend...

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo ✅ Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from .env.example...
    copy .env.example .env
    echo ⚠️  Please edit .env file and add your API keys!
)

echo ✅ Setup complete!
echo.
echo To start the server:
echo   venv\Scripts\activate
echo   python app.py

pause

