import os

from fastapi import FastAPI
from contextlib import asynccontextmanager

from db import init_db

from routes import auth, transactions, categories, analytics

from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="Finance Analysis API", lifespan=lifespan)

# Local dev origin by default; add production origins (e.g. your Vercel URL)
# via a comma-separated FRONTEND_ORIGINS env var on Railway.
origins = ["http://localhost:5173"]
extra_origins = os.getenv("FRONTEND_ORIGINS")
if extra_origins:
    origins += [o.strip() for o in extra_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ['*'],
    allow_headers = ['*']
)

app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(categories.router)
app.include_router(analytics.router)

@app.get("/")
def root():
    return {"status": "ok", "service": "finance-analysis-backend"}
