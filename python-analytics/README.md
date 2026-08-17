# python-analytics

CRS platformunun B2B analiz servisi (RFM/CRM ve basit müşteri içgörüleri). Aynı Postgres veritabanına doğrudan, read-only bağlanır; `backend/` (.NET) bu servisi HTTP üzerinden çağırır. Frontend bu servisi hiç bilmez, her zamanki gibi sadece .NET API'sine istek atar.

## Kurulum

```
cd python-analytics
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
copy .env.example .env     # DATABASE_URL'i doldur
```

## Çalıştırma

```
uvicorn main:app --reload --port 8000
```

`http://localhost:8000/health` → `{"status": "ok"}` dönmeli.

## Durum

Şu an sadece iskelet var: FastAPI app, DB bağlantı kurulumu, `/insights/customer-overview` endpoint'i tanımlı ama gövdesi boş (`NotImplementedError`). Sorgu/analiz mantığı henüz yazılmadı.
