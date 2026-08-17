from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.exc import DataError
from sqlalchemy.orm import Session

from db import get_db
from queries import build_demographics, build_income_distribution, fetch_brand_customers

app = FastAPI(title="CRS Analytics Service")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/insights/customer-overview")
def customer_overview(brand_id: str | None = None, db: Session = Depends(get_db)):
    try:
        customers = fetch_brand_customers(db, brand_id)
    except DataError:
        raise HTTPException(status_code=400, detail="Geçersiz brand_id")

    # TODO: satış trendi, gün/saat yoğunluğu, tekrar eden müşteri oranı,
    # sepet büyüklüğü histogramı — sırayla buraya eklenecek.
    return {
        "demographics": build_demographics(customers),
        "incomeLevel": build_income_distribution(customers),
    }
