import sys
import os

# Add current directory to path so 'backend' module can be found
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Import the app from backend.main
from backend.main import app

# This is the entry point for Vercel
# The 'app' variable is what Vercel will use
