from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from . import models
from .routers import auth, parents, educators, recruiters, reports, jobs, events, admin, profile, skills, contact

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        models.Base.metadata.create_all(bind=engine)
        print("Tables created")
    except Exception as e:
        print(f"DB Init Error: {e}")
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all domains (Netlify, Vercel, Localhost)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request logging to see if traffic hits the server
@app.middleware("http")
async def log_requests(request, call_next):
    print(f"Incoming request: {request.method} {request.url} from {request.client.host}")
    response = await call_next(request)
    print(f"Response status: {response.status_code}")
    return response

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

# Mount Static Files
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

if os.path.exists(os.path.join(FRONTEND_DIR, "style")):
    app.mount("/style", StaticFiles(directory=os.path.join(FRONTEND_DIR, "style")), name="style")
if os.path.exists(os.path.join(FRONTEND_DIR, "js")):
    app.mount("/js", StaticFiles(directory=os.path.join(FRONTEND_DIR, "js")), name="js")
if os.path.exists(os.path.join(FRONTEND_DIR, "pages")):
    app.mount("/pages", StaticFiles(directory=os.path.join(FRONTEND_DIR, "pages")), name="pages")
if os.path.exists(os.path.join(FRONTEND_DIR, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")), name="assets")

@app.get("/")
async def read_index():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
