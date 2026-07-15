from fastapi import APIRouter, Depends
from datetime import date
from typing import Literal

from db import get_conn
from auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


def build_date_filter(start: date | None, end: date | None, params: list) -> str:
    """Append optional date conditions and their params. Returns SQL fragment."""
    sql = ""
    if start is not None:
        sql += " AND transaction_date >= %s"
        params.append(start)
    if end is not None:
        sql += " AND transaction_date <= %s"
        params.append(end)
    return sql


# Totals for a period: income, expense, net, count
@router.get("/summary")
def summary(
    start: date | None = None,
    end: date | None = None,
    user: dict = Depends(get_current_user),
):
    params = [user.user_id]
    date_filter = build_date_filter(start, end, params)

    query = f"""
        SELECT
            COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0)  AS income,
            COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) AS expense,
            COUNT(*)                                                 AS transaction_count
        FROM transactions
        WHERE user_id = %s{date_filter}
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(query, tuple(params))
            row = cur.fetchone()

    income = row["income"]
    expense = row["expense"]
    return {
        "income": income,
        "expense": expense,
        "net": income - expense,
        "transaction_count": row["transaction_count"],
    }


# Totals grouped by category (for the donut chart)
@router.get("/by-category")
def by_category(
    type: Literal["income", "expense"] = "expense",
    start: date | None = None,
    end: date | None = None,
    user: dict = Depends(get_current_user),
):
    params = [user.user_id, type]
    date_filter = build_date_filter(start, end, params)

    # LEFT JOIN so transactions whose category was deleted (category_id NULL)
    # still show up, grouped under "Uncategorized".
    query = f"""
        SELECT
            t.category_id,
            COALESCE(c.name, 'Uncategorized') AS name,
            SUM(t.amount)                     AS total,
            COUNT(*)                          AS transaction_count
        FROM transactions t
        LEFT JOIN categories c ON c.category_id = t.category_id
        WHERE t.user_id = %s AND t.type = %s{date_filter.replace("transaction_date", "t.transaction_date")}
        GROUP BY t.category_id, c.name
        ORDER BY total DESC
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(query, tuple(params))
            rows = cur.fetchall()

    return rows


# Income vs expense per period (for the bar chart)
@router.get("/timeline")
def timeline(
    granularity: Literal["day", "week", "month"] = "month",
    start: date | None = None,
    end: date | None = None,
    user: dict = Depends(get_current_user),
):
    params = [granularity, user.user_id]
    date_filter = build_date_filter(start, end, params)

    # granularity is constrained by Literal and passed as a bound parameter
    # to date_trunc, so the query stays fully parameterized.
    query = f"""
        SELECT
            date_trunc(%s, transaction_date)                         AS period,
            COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0)  AS income,
            COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) AS expense
        FROM transactions
        WHERE user_id = %s{date_filter}
        GROUP BY period
        ORDER BY period
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(query, tuple(params))
            rows = cur.fetchall()

    return rows
