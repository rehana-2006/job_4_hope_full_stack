from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine
from backend import models
from backend.routers import auth, parents, educators, recruiters, reports, jobs, events, admin, profile, skills, contact

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = []

# Allow all localhost ports dynamically
origin_regex = r"http://(localhost|127\.0\.0\.1)(:\d+)?"

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=origin_regex,
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

@app.get("/")
def read_root():
    return {"message": "Job4Hope API is running"}
