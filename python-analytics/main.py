from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

from db import get_db

app = FastAPI(title="CRS Analytics Service")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/insights/customer-overview")
def customer_overview(brand_id: str, db: Session = Depends(get_db)):
    # TODO: yaş/cinsiyet/şehir/gelir dağılımı, satış trendi, gün/saat yoğunluğu,
    # tekrar eden müşteri oranı, sepet büyüklüğü histogramı — burada doldurulacak.
    raise NotImplementedError
