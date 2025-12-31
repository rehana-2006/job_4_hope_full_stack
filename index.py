import sys
import os

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

try:
    from fastapi import FastAPI, Depends, HTTPException, status
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker, Session
    from dotenv import load_dotenv
    from datetime import datetime, timedelta
    from typing import Optional
    
    # JWT and password hashing
    from jose import JWTError, jwt
    from passlib.context import CryptContext
    
    # Load environment variables
    load_dotenv()
    
    # Security configuration
    SECRET_KEY = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    
    # Password hashing
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
    
    # Database setup
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    if not DATABASE_URL:
        raise Exception("DATABASE_URL environment variable is not set")
    
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create FastAPI app
    app = FastAPI(title="Job4Hope API", version="1.0")
    
    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Database dependency
    def get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    
    # Auth functions
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)
    
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    # Root endpoint
    @app.get("/")
    def read_root():
        return {"message": "Job4Hope API is running", "status": "ok", "auth": "enabled"}
    
    # Login endpoint with FULL authentication
    @app.post("/token")
    async def login_for_access_token(
        form_data: OAuth2PasswordRequestForm = Depends(), 
        db: Session = Depends(get_db)
    ):
        try:
            # Import User model
            from backend.models.user import User
            
            # Find user by email
            user = db.query(User).filter(User.email == form_data.username).first()
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect username or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Verify password
            if not verify_password(form_data.password, user.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect username or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Create access token
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user.email, "role": user.role},
                expires_delta=access_token_expires
            )
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "role": user.role
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Login error: {str(e)}"
            )
    
    # Try to load other routers
    try:
        from backend.routers import parents, educators, recruiters, reports, jobs, events, admin, profile, skills, contact
        
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
        print("✅ All routers loaded successfully")
    except Exception as e:
        print(f"⚠️ Warning: Could not load some routers: {e}")
    
    print("✅ Job4Hope API initialized with full authentication")

except Exception as e:
    print(f"❌ CRITICAL ERROR: {e}")
    import traceback
    traceback.print_exc()
    raise
