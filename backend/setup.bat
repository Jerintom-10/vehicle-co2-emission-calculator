@echo off
REM EcoVehicle - Backend Setup Script (Windows)

echo 🚗 EcoVehicle - Backend Setup
echo ==============================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8 or higher.
    exit /b 1
)

echo ✅ Python found: 
python --version

echo.
echo 📦 Creating virtual environment...
python -m venv venv

echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

echo ⬆️  Upgrading pip...
python -m pip install --upgrade pip

echo 📥 Installing dependencies...
pip install -r requirements.txt

echo.
echo ✅ Backend setup complete!
echo.
echo 📝 Next steps:
echo   1. Make sure MongoDB is running
echo   2. Configure .env file with your settings
echo   3. Run: python main.py
echo.
echo 🌐 Backend will run at: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
