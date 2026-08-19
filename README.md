# SlipSync

B2B SaaS tabanlı akıllı fiş okuma (OCR), müşteri ilişkileri yönetimi (CRM) ve veri analitiği platformu.

## Description

SlipSync, firmaların (markaların) kendi müşterilerinden gelen fiş verilerini kaydettiği, bu veriler üzerinden RFM Analizi (Recency, Frequency, Monetary) yaptığı ve satış trendlerini takip edebildiği kapsamlı bir web uygulamasıdır. Proje; .NET 8 ile güçlü bir backend, React ile modern bir arayüz ve Python/FastAPI tabanlı bir analitik mikroservisini API Gateway mantığında birleştirir.

## Getting Started

### Dependencies

* .NET 8 SDK
* Node.js (v18+)
* Python 3.10+
* PostgreSQL (5432 portunda çalışmalı)

### Installing

* Projeyi GitHub üzerinden bilgisayarınıza klonlayın.
* PostgreSQL'de `crs_smart_receipt_db` adında bir veritabanı oluşturulduğundan emin olun.
* `backend/appsettings.json` içerisindeki veritabanı şifresinin (postgres/postgres) kendi lokal veritabanınızla eşleştiğini doğrulayın.

### Executing program

* Backend API (.NET 8) çalıştırma
```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```
* Frontend (React SPA) çalıştırma
```bash
cd frontend
npm install
npm run dev
```
* Analytics Service (Python) çalıştırma
```bash
cd python-analytics
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Help

Veritabanı bağlantı hataları için PostgreSQL servisinin çalıştığından emin olun.
```bash
# Python tarafında kütüphane eksikliği yaşarsanız:
pip install -r requirements.txt
```

## Authors

Ali Kamer  
[@alikamer](https://github.com/alikamer)

## Version History

* 0.1
    * Initial Release (MVP) - Manuel Fiş Girişi, RFM Analizi, JWT Auth

## License

This project is licensed under the MIT License - see the LICENSE.md file for details

## Acknowledgments

* [Crs Soft](https://www.crssoft.com/) - Staj ve Geliştirme Süreci Destekleri
* [DomPizzie README Template](https://gist.github.com/DomPizzie/7a5ff55ffa9081f2de27c315f5018afc) //referene readme 
