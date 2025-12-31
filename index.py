import sys
import os

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
    
    # Import models and create tables
    try:
        from backend import models
        models.Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Warning: Could not create tables: {e}")

# Create FastAPI app
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
try:
    from backend.routers import auth, parents, educators, recruiters, reports, jobs, events, admin, profile, skills, contact
    
    app.include_router(auth.router)
    app.include_router(parents.router)
    app.include_router(educators.router)
    app.include_router(recruiters.router)
    app.include_router(reports.router)
    app.include_router(jobs.router)
    app.include_router(events.router)
    app.include_router(admin.router)
    app.include_router(profile.router)
    app.include_router(skills.router)
    app.include_router(contact.router)
except Exception as e:
    print(f"Warning: Could not load routers: {e}")

@app.get("/")
def read_root():
    return {"message": "Job4Hope API is running"}
