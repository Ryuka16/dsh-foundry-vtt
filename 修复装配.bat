@echo off
chcp 65001 >nul
node "%~dp0tools\repair.mjs" %*
echo.
pause
