@echo off
chcp 65001 >nul
node "%~dp0tools\upgrade.mjs" %*
echo.
pause
