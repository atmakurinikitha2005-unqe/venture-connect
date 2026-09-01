import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import settings
from database.seed_data import seed_database
from routers import auth, admin, entrepreneur, vc, graph

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Perform startup tasks: Seed database
    print(f"[*] Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    try:
        seed_database()
    except Exception as e:
        print(f"[!] Seed database warning: {e}")
    yield
    print(f"[*] Shutting down {settings.PROJECT_NAME}...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Startup Discovery, VC Evaluation Scorecard, Investment Pipeline & Graph Database Platform",
    lifespan=lifespan
)

# CORS Middleware setup for Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow Angular frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static file upload route for pitch deck PDFs
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(entrepreneur.router)
app.include_router(vc.router)
app.include_router(graph.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
