import sys
import os
import traceback

print("Current working directory:", os.getcwd())
print("Python executable:", sys.executable)
print("Adding current directory to sys.path...")
sys.path.insert(0, os.getcwd())

try:
    print("Attempting to import backend.main...")
    from backend.main import app
    print("SUCCESS: backend.main imported successfully!")
except Exception as e:
    print("FAILURE: Could not import backend.main")
    traceback.print_exc()
