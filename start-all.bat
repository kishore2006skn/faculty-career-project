@echo off
title Faculty Career Advancement Portal Launcher
echo ======================================================================
echo  Faculty Career Advancement & Publication Summary Generator
echo ======================================================================
echo.
echo [1/2] Starting Backend API Server (Port 5000)...
start "Backend Server (Port 5000)" cmd /k "cd server && node src/server.js"

echo Waiting for backend initialization...
timeout /t 4 /nobreak >nul

echo [2/2] Starting Frontend Vite Client (Port 5173)...
start "Frontend Client (Port 5173)" cmd /k "cd client && npm run dev"

echo.
echo ======================================================================
echo  Both services launched successfully!
echo  - Frontend: http://localhost:5173
echo  - Backend:  http://localhost:5000/api/v1
echo.
echo  Demo Accounts (Password: Password@123):
echo  - Admin:    admin@institution.edu
echo  - Reviewer: hod.cse@institution.edu
echo  - Faculty:  dr.sharma@institution.edu
echo ======================================================================
pause
