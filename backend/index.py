import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Now import from main.py in the same directory
from main import app

# This is the entry point for Vercel
handler = app
