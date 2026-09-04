import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import api_router
from app.services.ibtracs_service import ibtracs_service
from app.services.frame_service import frame_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load real IBTrACS dataset & frame service
    print(f"[CYCLONEAI-SAT] Starting backend service...")
    ibtracs_service.initialize()
    frame_service.initialize()
    yield
    # Shutdown
    print(f"[CYCLONEAI-SAT] Shutting down backend service...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# CORS configuration for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes under /api
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "CYCLONEAI-SAT Mission Intelligence & Prediction System API",
        "version": "1.0.0",
        "docs": f"{settings.API_V1_STR}/docs",
        "health": f"{settings.API_V1_STR}/health"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host=settings.API_HOST, port=settings.API_PORT, reload=True)
