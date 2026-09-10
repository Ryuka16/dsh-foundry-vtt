@echo off
chcp 65001 >nul
node "%~dp0tools\doctor.mjs" %*
echo.
pause
