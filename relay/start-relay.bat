@echo off
rem Foundry REST API Relay - one-click launcher (Windows)
rem 1) Edit ADMIN_EMAIL / ADMIN_PASSWORD below
rem 2) Double-click this file
set DB_TYPE=sqlite
set PORT=3010
set APP_ENV=production
set LOG_LEVEL=info
set PER_MINUTE_REQUEST_LIMIT=0
set KEY_REQUEST_RATE_LIMIT=100000
set PAIRING_RATE_LIMIT=100000
set FRONTEND_URL=http://localhost:3010
set DATA_DIR=%~dp0data
set ADMIN_EMAIL=you@example.com
set ADMIN_PASSWORD=CHANGE_ME
cd /d %~dp0go-relay
relay.exe
pause
