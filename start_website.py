import subprocess
import sys
import os
import time
import webbrowser

def run_command(command, description):
    print(f"\n[*] {description}...")
    try:
        subprocess.check_call([sys.executable, "-m"] + command)
    except subprocess.CalledProcessError as e:
        print(f"[!] Error during {description}: {e}")
        return False
    return True

def main():
    print("====================================================")
    print("   Net Banking Fraud Detection - Startup Utility    ")
    print("====================================================")
    
    # 1. Install dependencies
    if not run_command(["pip", "install", "-r", "requirements.txt"], "Installing dependencies"):
        print("Failed to install dependencies. Please check your internet connection and try again.")
        return

    # 2. Train model if missing
    if not os.path.exists('data/fraud_model.joblib'):
        print("\n[*] Model not found. Training now...")
        try:
            subprocess.check_call([sys.executable, "ml/train_model.py"])
        except subprocess.CalledProcessError:
            print("[!] Training failed. The system will use fallback rules.")
    else:
        print("\n[+] ML model found and ready.")

    # 3. Handle redundant models.py (Warning only as we can't delete)
    if os.path.exists('backend/models.py'):
        print("\n[!] Warning: backend/models.py exists and may conflict with backend/models/ package.")
        print("    If you encounter import errors, please manually delete/rename backend/models.py.")

    # 4. Start the server
    print("\n[*] Starting Flask server at http://127.0.0.1:5000 ...")
    
    # Try to open browser after a short delay
    def open_browser():
        time.sleep(3)
        print("[*] Opening browser...")
        webbrowser.open("http://127.0.0.1:5000")

    import threading
    threading.Thread(target=open_browser, daemon=True).start()

    try:
        # We run this as a module to ensure absolute imports work
        subprocess.check_call([sys.executable, "-m", "backend.app"])
    except KeyboardInterrupt:
        print("\n[!] Server stopped by user.")
    except Exception as e:
        print(f"\n[!] Server error: {e}")

if __name__ == "__main__":
    main()
