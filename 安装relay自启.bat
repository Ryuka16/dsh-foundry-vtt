@echo off
chcp 65001 >nul
node "%~dp0tools\relay-autostart.mjs" install %*
echo.
pause
