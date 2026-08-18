from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.exc import DataError
from sqlalchemy.orm import Session

from db import get_db
from queries import (
    build_demographics,
    build_income_distribution,
    fetch_brand_customers,
    fetch_brand_receipts,
    fetch_customer_rfm,
    build_sales_trend,
    build_repeat_customer_rate,
    build_rfm_segments
)
app = FastAPI(title="CRS Analytics Service")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/insights/customer-overview")
def customer_overview(brand_id: str | None = None, db: Session = Depends(get_db)):
    try:
        customers = fetch_brand_customers(db, brand_id)
        receipts = fetch_brand_receipts(db, brand_id)
        rfm_rows = fetch_customer_rfm(db, brand_id)
    except DataError:
        raise HTTPException(status_code=400, detail="Geçersiz brand_id")


    return {
        "demographics": build_demographics(customers),
        "incomeLevel": build_income_distribution(customers),
        "salesTrend": build_sales_trend(receipts),  #satış t rendi
        "repeatCustomerRate": build_repeat_customer_rate(receipts), #sadakat oranı
        "rfmSegments": build_rfm_segments(rfm_rows)
    }
