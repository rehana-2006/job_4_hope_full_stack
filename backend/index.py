import sys
import os

# Add parent directory to path so 'backend' module can be found
parent_dir = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, parent_dir)

# Now import using the backend module path
from backend.main import app

# This is the entry point for Vercel
handler = app
