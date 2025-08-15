@echo off
title Galileosky Parser - Stopping Application
color 0C

echo ========================================
echo    Galileosky Parser Windows
echo    Stopping Application...
echo ========================================
echo.

echo [INFO] Stopping all Galileosky Parser processes...

:: Stop Node.js processes related to Galileosky
echo [INFO] Stopping Node.js processes...
taskkill /f /im node.exe 2>nul
if %errorLevel% equ 0 (
    echo [INFO] Node.js processes stopped successfully.
) else (
    echo [INFO] No Node.js processes were running.
)

:: Stop specific command prompt windows
echo [INFO] Closing application windows...
taskkill /f /fi "WINDOWTITLE eq Galileosky Backend*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Galileosky Frontend*" 2>nul

echo.
echo ========================================
echo    Application Stopped Successfully!
echo ========================================
echo.
echo [INFO] All Galileosky Parser processes have been stopped.
echo [INFO] You can now safely close this window.
echo.
pause 