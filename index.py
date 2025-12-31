from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create a simple app without database for testing
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Job4Hope API is running - TEST VERSION"}

@app.get("/test")
def test():
    return {"status": "working"}
