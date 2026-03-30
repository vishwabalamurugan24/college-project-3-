import os
import webbrowser
import time

def main():
    print("====================================================")
    print("      THE GUARDIAN LEDGER - Static Frontend Loop     ")
    print("====================================================")
    print("[*] The backend and ML modules have been uninstalled.\n[*] Launching the frontend in static mode...")
    
    # Get absolute path to the HTML file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_path = os.path.join(current_dir, "fraudshield-frontend", "index.html")
    
    file_url = f"file:///{frontend_path.replace(os.sep, '/')}"
    
    time.sleep(1)
    print(f"[*] Opening browser securely to: {frontend_path}")
    
    # Open the file in the default browser
    webbrowser.open(file_url)
    print("[+] Browser launched successfully! You can close this window at any time.")

if __name__ == "__main__":
    main()
