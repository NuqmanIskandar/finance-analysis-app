from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from uuid import UUID

from db import get_conn
from auth import get_current_user

router = APIRouter(prefix="/categories", tags=["categories"])

class CategoryResponse(BaseModel):
    category_id: UUID
    name: str
    user_id: UUID

def get_category_by_id(category_id: UUID) -> CategoryResponse:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                    "SELECT * FROM categories WHERE category_id = %s;",
                    (category_id,)
                )
            row = cur.fetchone()
    
    if row is None:
        return None
    return CategoryResponse(**row)

# List all categories
@router.get("")
def list_categories(user: dict = Depends(get_current_user)) -> list:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM categories WHERE user_id = %s",
                (user.user_id,)
            )
            rows = cur.fetchall()
    
    return rows

# Create a new category
@router.post("", response_model=CategoryResponse)
def create_category(name: str, user: dict = Depends(get_current_user)) -> CategoryResponse:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT name FROM categories WHERE name = %s AND user_id = %s",
                (name, user.user_id)
            )
            existing = cur.fetchone()
            if existing:
                raise HTTPException(status_code=400, detail="The category already exists.")
            
            cur.execute(
                """
                    INSERT INTO categories (name, user_id) VALUES (%s, %s)
                    RETURNING category_id, name, user_id;
                """, (name, user.user_id)
            )
            row = cur.fetchone()
            conn.commit()
    
    return CategoryResponse(**row)

@router.delete("/{category_id}")
def delete_category(category_id: UUID, user: dict = Depends(get_current_user)):
    category = get_category_by_id(category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    if category.user_id != user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM categories WHERE category_id = %s;",
                (category_id,)
            )
            conn.commit()
    return {"detail": "Category deleted"}