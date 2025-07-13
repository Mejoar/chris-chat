@echo off
echo Starting Socket.io Chat Application...
echo.

echo Starting server...
cd server
start "Chat Server" cmd /k "pnpm run dev"

echo Waiting for server to start...
timeout /t 5

echo Starting client...
cd ..\client
start "Chat Client" cmd /k "pnpm start"

echo.
echo Both server and client are starting...
echo Server: http://localhost:5000
echo Client: http://localhost:3000
echo.
pause
