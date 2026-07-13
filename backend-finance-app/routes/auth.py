from fastapi import APIRouter, HTTPException, status
from fastapi import Depends
from fastapi.security import OAuth2PasswordRequestForm

from pydantic import BaseModel

from db import get_conn
from auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

class RegisterRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT user_id FROM users WHERE username = %s;", (payload.username,))
            existing = cur.fetchone()
            if existing:
                raise HTTPException(status_code=400, detail="Username already taken")
            
            # Add username, password
            cur.execute(
                """
                    INSERT INTO users (username, password_hash)
                    VALUES (%s, %s)
                    RETURNING user_id;
                """,
                (payload.username, hash_password(payload.password))
            )

            # Get the user_id
            user_id = cur.fetchone()["user_id"]
            conn.commit()
    
    token = create_access_token({"sub": str(user_id)})
    return TokenResponse(access_token=token)

@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT user_id, password_hash FROM users WHERE username = %s;",
                (form_data.username,)
            )
            row = cur.fetchone()
    
    if not row or not verify_password(form_data.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    token = create_access_token({"sub": str(row["user_id"])})
    return TokenResponse(access_token=token)