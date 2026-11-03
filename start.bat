@echo off
title LearnLoop Infinity 2.0 - Futuristic 3D Virtual University LMS
echo ================================================================
echo    LEARNLOOP INFINITY 2.0 - Full-Stack 3D Virtual University
echo    Your Learning Journey. A Whole New Universe.
echo ================================================================
echo Starting the full-stack server...

cd /d "%~dp0"
if exist "backend\venv\Scripts\python.exe" (
    backend\venv\Scripts\python.exe run.py
) else (
    python run.py
)
pause
