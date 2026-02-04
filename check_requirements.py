import sys
import subprocess
import importlib.metadata
import urllib.request
from pathlib import Path

def check_internet(host='http://google.com'):
    try:
        urllib.request.urlopen(host, timeout=3)
        return True
    except:
        return False

def get_installed_packages():
    return {dist.metadata['Name'].lower(): dist.version for dist in importlib.metadata.distributions()}

def install_requirements(requirements_path):
    print("Installing missing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", str(requirements_path)])
        print("Dependencies installed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error installing dependencies: {e}")
        sys.exit(1)

def main():
    # Define path to requirements.txt relative to this script
    current_dir = Path(__file__).parent
    requirements_path = current_dir / "python_service" / "requirements.txt"

    if not requirements_path.exists():
        print(f"Error: {requirements_path} not found.")
        sys.exit(1)

    print(f"Checking dependencies from {requirements_path}...")

    required_packages = []
    with open(requirements_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                # Handle possible version specifiers (simple parsing)
                pkg_name = line.split('==')[0].split('>=')[0].split('<=')[0].strip().lower()
                required_packages.append(pkg_name)

    installed_packages = get_installed_packages()
    missing_packages = []

    for pkg in required_packages:
        if pkg not in installed_packages:
            missing_packages.append(pkg)

    if missing_packages:
        print(f"Missing packages: {', '.join(missing_packages)}")
        print("Exception: Dependencies missing.")
        
        if check_internet():
            install_requirements(requirements_path)
            print("Ready to use")
        else:
            print("Error: No internet connection. Cannot install missing dependencies.")
            print("Please connect to the internet and try again.")
            sys.exit(1)
    else:
        print("All dependencies are satisfied.")
        print("Ready to use")

if __name__ == "__main__":
    main()
