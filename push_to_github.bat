@echo off
title LearnLoop Infinity 2.0 - Push to GitHub
cd /d "%~dp0"
echo =======================================================
echo    LEARNLOOP INFINITY 2.0 - GITHUB PUSH
echo    Target: https://github.com/tarunbehl69-dotcom/LearnLoop-Infinity-2.0.git
echo =======================================================
echo.
echo Make sure you have clicked 'Create repository' in your browser!
echo.
git push -u origin main
echo.
if %errorlevel% neq 0 (
    echo [ERROR] Push encountered an issue. See message above.
) else (
    echo [SUCCESS] Code successfully pushed to tarunbehl69-dotcom/LearnLoop-Infinity-2.0!
)
echo.
pause
