"""
LearnLoop Infinity 2.0 — Main Application Launcher
Runs the full-stack Futuristic 3D LMS application and opens your browser.
"""
import sys
import os
import subprocess
import webbrowser
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def main():
    print("=" * 70)
    print("  🌐 LEARNLOOP INFINITY 2.0 — Futuristic 3D Virtual University LMS")
    print("  Tagline: Your Learning Journey. A Whole New Universe.")
    print("=" * 70)
    print("\nStarting the server at http://127.0.0.1:8000 ...")

    # Check python venv
    venv_python = os.path.join(os.path.dirname(__file__), "backend", "venv", "Scripts", "python.exe")
    python_exe = venv_python if os.path.exists(venv_python) else sys.executable

    # Command to run uvicorn
    cmd = [python_exe, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"]

    print("\n✨ University Campus Online! Opening your browser...")
    try:
        import threading
        def open_browser():
            time.sleep(1.8)
            webbrowser.open("http://127.0.0.1:8000")
        threading.Thread(target=open_browser, daemon=True).start()

        # Run Uvicorn
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\nServer offline. Thank you for exploring LearnLoop Infinity 2.0! 🌐")

if __name__ == "__main__":
    main()
