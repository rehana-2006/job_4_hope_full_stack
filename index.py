import sys
import os

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Now we can import everything
from backend.main import app

# Vercel serverless function handler
def handler(request, context):
    return app(request, context)

# For direct ASGI compatibility
app = app
