import sys
import os
from sqlalchemy import create_engine, text

# Add current directory to path
sys.path.insert(0, os.getcwd())

from backend import models
from backend.database import Base

def init_db():
    # Ask user for the connection string
    print("This script will attempt to create database tables in your Supabase DB.")
    db_url = input("Please paste your full Supabase connection string (starting with postgresql://): ").strip()
    
    if not db_url:
        print("No URL provided. Exiting.")
        return

    # Fix the hash if user forgot
    if "#" in db_url and "%23" not in db_url:
        print("Detected '#' in password. Replacing with '%23'...")
        db_url = db_url.replace("#", "%23")
    
    try:
        print(f"Connecting to: {db_url.split('@')[-1]} ...") # Hide password
        engine = create_engine(db_url)
        
        print("Creating tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Tables created successfully!")
        
        # Verify
        with engine.connect() as conn:
            result = conn.execute(text("SELECT * FROM users;"))
            print("✅ Verified: 'users' table exists.")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    init_db()
