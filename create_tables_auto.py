import os
import sys

# Add root to path
sys.path.insert(0, os.getcwd())

# Set the CORRECT database URL (with escaped #)
# We set this BEFORE importing backend.database so it picks it up
os.environ["DATABASE_URL"] = "postgresql://postgres.jjyqmiibckjoznyynsvf:rehana%23240609@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres"

try:
    from backend.database import engine
    from backend import models
    
    print(f"Connecting to database...")
    
    print("Creating all tables in Supabase...")
    models.Base.metadata.create_all(bind=engine)
    print("SUCCESS: Tables created!")

except Exception as e:
    print(f"FAILED: {e}")
