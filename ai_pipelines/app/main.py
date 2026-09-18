import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import db_manager
from app.scheduler import scheduler
from app.api.routes import router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("AI-Pipeline-Bootstrap")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing AI Pipelines service...")
    db_manager.connect()
    scheduler.start()
    yield
    # Shutdown
    logger.info("Shutting down AI Pipelines service...")
    scheduler.stop()
    db_manager.close()

app = FastAPI(
    title="Petrodyn AI Pipeline & Digital Twin Service",
    description="Analytics and Prediction Engine for Baghewala CSS & SRP Wells",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=False)
