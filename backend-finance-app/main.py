from fastapi import FastAPI
from contextlib import asynccontextmanager

from db import init_db

from routes import auth, transactions, categories

from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="Finance Analysis API", lifespan=lifespan)

origins = [
    "http://localhost:5173"
]

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

@app.get("/")
def root():
    return {"status": "ok", "service": "finance-analysis-backend"}
