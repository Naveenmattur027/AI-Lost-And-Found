@echo off
echo Starting Lost ^& Found Hub Application
echo ======================================

echo Starting Backend Server...
start "Backend" cmd /k "cd backend && node server.js"

timeout /t 5 /nobreak >nul

echo Starting Frontend Server...
start "Frontend" cmd /k "npm run dev"

echo.
echo Application started successfully!
echo Frontend will be available at http://localhost:5173 (or next available port)
echo Backend API available at http://localhost:5000
echo.