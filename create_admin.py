import os
import sys
from passlib.context import CryptContext

# Add root to path
sys.path.insert(0, os.getcwd())

# Configuration
# Users should typically set DATABASE_URL env var, or we can fallback/prompt
# For now, we will assume the one we just fixed:
DEFAULT_DB_URL = "postgresql://postgres.jjyqmiibckjoznyynsvf:rehana%23240609@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres"

os.environ["DATABASE_URL"] = DEFAULT_DB_URL

try:
    from backend.database import engine, SessionLocal
    from backend import models

    # Setup Password Hashing
    pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

    def create_admin():
        print("--- Create Admin User ---")
        email = input("Enter Admin Email: ").strip()
        password = input("Enter Admin Password: ").strip()
        
        if not email or not password:
            print("Error: Email and Password are required.")
            return

        db = SessionLocal()
        
        # Check if exists
        existing_user = db.query(models.User).filter(models.User.email == email).first()
        if existing_user:
            print(f"User {email} already exists!")
            return

        # Hash Password
        hashed_password = pwd_context.hash(password)
        
        # Create User
        new_admin = models.User(
            email=email,
            hashed_password=hashed_password,
            role="admin"
        )
        
        try:
            db.add(new_admin)
            db.commit()
            print(f"SUCCESS: Admin user '{email}' created!")
        except Exception as e:
            print(f"Error creating user: {e}")
            db.rollback()
        finally:
            db.close()

    if __name__ == "__main__":
        create_admin()

except Exception as e:
    print(f"Setup Error: {e}")
