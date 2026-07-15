from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime
from typing import Literal
from datetime import date
from uuid import UUID

from db import get_conn
from auth import get_current_user
from routes.categories import get_category_by_id

router = APIRouter(prefix="/transactions", tags=["transactions"])

class AddTransactionRequest(BaseModel):
    name: str
    amount: int
    type: Literal["income", "expense"]
    transaction_date: datetime
    category_id: UUID

class TransactionResponse(BaseModel):
    transaction_id: UUID
    name: str
    amount: int
    type: Literal["income", "expense"]
    transaction_date: datetime
    user_id: UUID
    category_id: UUID | None   # NULL after its category is deleted (ON DELETE SET NULL)
    created_at: datetime

def get_transaction_by_id(transaction_id: UUID) -> TransactionResponse | None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM transactions WHERE transaction_id = %s;",
                (transaction_id,)
            )
            row = cur.fetchone()
    if row is None:
        return None
    return TransactionResponse(**row)

# Create a transaction
@router.post("", response_model=TransactionResponse)
def add_transaction(transaction: AddTransactionRequest, user: dict = Depends(get_current_user)) -> TransactionResponse:
    # Check category_id exist or not
    category = get_category_by_id(transaction.category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    if category.user_id != user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to use this category")
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                    INSERT INTO transactions
                    (name, amount, type, transaction_date, user_id, category_id)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING transaction_id, name, amount, type, transaction_date, user_id, category_id, created_at;
                """,
                (
                    transaction.name,
                    transaction.amount,
                    transaction.type,
                    transaction.transaction_date,
                    user.user_id,
                    transaction.category_id,
                ),
            )
            row = cur.fetchone()

    return TransactionResponse(**row)

# List all transactions, filterable by (start, end, category, type)
@router.get("")
def list_transactions(
    start: date | None = None,
    end: date | None = None,
    category_id: UUID | None = None,
    type: Literal["income", "expense"] | None = None,
    user: dict = Depends(get_current_user),
) -> list:
    # Base query
    query = """
            SELECT transaction_id, name, amount, type, transaction_date, user_id, category_id, created_at 
            FROM transactions
            WHERE user_id = %s
        """
    
    # Track active filters and their values
    conditions = []
    params = [user.user_id]

    # Dynamically append filters if they are provided
    if start is not None:
        conditions.append("transaction_date >= %s")
        params.append(start)
        
    if end is not None:
        conditions.append("transaction_date <= %s")
        params.append(end)
        
    if category_id is not None:
        conditions.append("category_id = %s")
        params.append(category_id)
        
    if type is not None:
        conditions.append("type = %s")
        params.append(type)

    # If any conditions exist, join them with AND and append to the query
    if conditions:
        query += " AND " + " AND ".join(conditions)

    # Newest first — the Dashboard's "recent transactions" relies on this
    query += " ORDER BY transaction_date DESC, created_at DESC"

    with get_conn() as conn:
        with conn.cursor() as cur:
            # Safely execute the query with the gathered parameters
            cur.execute(query, tuple(params))
            rows = cur.fetchall()
            
    return [TransactionResponse(**row) for row in rows]

# Get a transaction
@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(transaction_id: UUID, user: dict = Depends(get_current_user)):
    # Check user
    transaction = get_transaction_by_id(transaction_id)
    if transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if transaction.user_id != user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to get this transaction")
    return transaction

# Delete a transaction
@router.delete("/{transaction_id}")
def delete_transaction(transaction_id: UUID, user: dict = Depends(get_current_user)):
    transaction = get_transaction_by_id(transaction_id)
    if transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if transaction.user_id != user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this transaction")
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM transactions WHERE transaction_id = %s;",
                (transaction_id,)
            )
    return {"detail": "Transaction deleted"}