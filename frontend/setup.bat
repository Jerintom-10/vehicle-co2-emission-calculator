@echo off
REM EcoVehicle - Frontend Setup Script (Windows)

echo 🚗 EcoVehicle - Frontend Setup
echo ==============================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 16 or higher.
    exit /b 1
)

echo ✅ Node found: 
node --version

echo ✅ npm found: 
npm --version

echo.
echo 📥 Installing dependencies...
npm install

echo.
echo ✅ Frontend setup complete!
echo.
echo 📝 Next steps:
echo   1. Make sure backend is running (python main.py in backend directory)
echo   2. Run: npm run dev
echo.
echo 🌐 Frontend will run at: http://localhost:5173
