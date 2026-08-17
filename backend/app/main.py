from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database import engine, Base

# Import all models so SQLAlchemy can create their tables
from app.models import domain  # noqa: F401

from app.api.v1 import auth, tasks, sessions, settings as settings_router, stats, appdata


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all DB tables on startup
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS – allow the Vite dev server and any configured origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router,             prefix=f"{settings.API_V1_STR}/auth",     tags=["Auth"])
app.include_router(tasks.router,            prefix=f"{settings.API_V1_STR}/tasks",    tags=["Tasks"])
app.include_router(sessions.router,         prefix=f"{settings.API_V1_STR}/sessions", tags=["Sessions"])
app.include_router(settings_router.router,  prefix=f"{settings.API_V1_STR}/settings", tags=["Settings"])
app.include_router(stats.router,            prefix=f"{settings.API_V1_STR}/stats",    tags=["Stats"])
app.include_router(appdata.router,          prefix=f"{settings.API_V1_STR}/appdata",  tags=["App Data"])


@app.get("/")
def root():
    return {"message": f"{settings.PROJECT_NAME} is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
