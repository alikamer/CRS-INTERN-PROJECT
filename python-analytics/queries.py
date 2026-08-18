from collections import Counter
from datetime import date

from sqlalchemy import text

CUSTOMERS_FOR_BRAND_SQL = text("""
    SELECT DISTINCT cp."Id" AS id, cp."Gender" AS gender, cp."City" AS city,
           cp."IncomeLevel" AS income_level, cp."DateOfBirth" AS date_of_birth
    FROM "Receipts" r
    JOIN "ConsumerProfiles" cp ON cp."Id" = r."ConsumerProfileId"
    WHERE r."BrandId" = :brand_id AND r."Status" = 1
""")

CUSTOMERS_ALL_BRANDS_SQL = text("""
    SELECT DISTINCT cp."Id" AS id, cp."Gender" AS gender, cp."City" AS city,
           cp."IncomeLevel" AS income_level, cp."DateOfBirth" AS date_of_birth
    FROM "Receipts" r
    JOIN "ConsumerProfiles" cp ON cp."Id" = r."ConsumerProfileId"
    WHERE r."Status" = 1
""")


def fetch_brand_customers(db, brand_id=None):
    if brand_id is None:
        result = db.execute(CUSTOMERS_ALL_BRANDS_SQL)
    else:
        result = db.execute(CUSTOMERS_FOR_BRAND_SQL, {"brand_id": brand_id})
    return result.mappings().all()
    

RECEIPTS_FOR_BRAND_SQL = text("""
    SELECT "ConsumerProfileId" AS customer_id, "ReceiptDate" AS receipt_date, "TotalAmount" AS total_amount
    FROM "Receipts"
    WHERE "BrandId" = :brand_id AND "Status" = 1 AND "ConsumerProfileId" IS NOT NULL
""") 

RECEIPTS_ALL_BRANDS_SQL = text("""
   SELECT "ConsumerProfileId" AS customer_id, "ReceiptDate" AS receipt_date, "TotalAmount" AS total_amount
   FROM "Receipts"
   WHERE "Status" = 1 AND "ConsumerProfileId" IS NOT NULL
""")

def fetch_brand_receipts(db, brand_id=None):
    if brand_id is None:
        result = db.execute(RECEIPTS_ALL_BRANDS_SQL)
    else:
        result = db.execute(RECEIPTS_FOR_BRAND_SQL, {"brand_id": brand_id})
    return result.mappings().all()


RFM_FOR_BRAND_SQL = text("""
    SELECT "ConsumerProfileId" AS customer_id,
           MAX("ReceiptDate") AS last_receipt_date,
           COUNT(*) AS frequency,
           SUM("TotalAmount") AS monetary
    FROM "Receipts"
    WHERE "BrandId" = :brand_id AND "Status" = 1 AND "ConsumerProfileId" IS NOT NULL
    GROUP BY "ConsumerProfileId"
""")

RFM_ALL_BRANDS_SQL = text("""
    SELECT "ConsumerProfileId" AS customer_id,
           MAX("ReceiptDate") AS last_receipt_date,
           COUNT(*) AS frequency,
           SUM("TotalAmount") AS monetary
    FROM "Receipts"
    WHERE "Status" = 1 AND "ConsumerProfileId" IS NOT NULL
    GROUP BY "ConsumerProfileId"
""")

def fetch_customer_rfm(db, brand_id=None):
    if brand_id is None:
        result = db.execute(RFM_ALL_BRANDS_SQL)
    else:
        result = db.execute(RFM_FOR_BRAND_SQL, {"brand_id": brand_id})
    return result.mappings().all()






def age_band(date_of_birth):
    if date_of_birth is None:
        return "Bilinmiyor"
    dob = date_of_birth.date() if hasattr(date_of_birth, "date") else date_of_birth
    today = date.today()
    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    if age < 25:
        return "18-24"
    if age < 35:
        return "25-34"
    if age < 45:
        return "35-44"
    if age < 55:
        return "45-54"
    return "55+"


AGE_BAND_ORDER = ["18-24", "25-34", "35-44", "45-54", "55+", "Bilinmiyor"]
INCOME_LEVEL_ORDER = ["Düşük", "Orta", "Yüksek", "Bilinmiyor"]


def to_percentages(counter):
    total = sum(counter.values())
    if total == 0:
        return []
    return [
        {"label": label, "count": count, "percentage": round(count / total * 100, 1)}
        for label, count in counter.most_common()
    ]


def to_ordered_percentages(counter, order):
    total = sum(counter.values())
    if total == 0:
        return []

    ordered_labels = [label for label in order if label in counter]
    leftover_labels = [label for label, _ in counter.most_common() if label not in order]

    return [
        {"label": label, "count": counter[label], "percentage": round(counter[label] / total * 100, 1)}
        for label in ordered_labels + leftover_labels
    ]


def build_demographics(customers):
    age_counter = Counter(age_band(c["date_of_birth"]) for c in customers)
    gender_counter = Counter(c["gender"] or "Bilinmiyor" for c in customers)
    city_counter = Counter(c["city"] or "Bilinmiyor" for c in customers)

    return {
        "totalCustomers": len(customers),
        "ageDistribution": to_ordered_percentages(age_counter, AGE_BAND_ORDER),
        "genderDistribution": to_percentages(gender_counter),
        "cityDistribution": to_percentages(city_counter),
    }


KNOWN_INCOME_LEVELS = {"Düşük", "Orta", "Yüksek"}


def normalize_income_level(income_level):
    return income_level if income_level in KNOWN_INCOME_LEVELS else "Bilinmiyor"


def build_income_distribution(customers):
    income_counter = Counter(normalize_income_level(c["income_level"]) for c in customers)
    return {
        "totalCustomers": len(customers),
        "incomeDistribution": to_ordered_percentages(income_counter, INCOME_LEVEL_ORDER),
    }




#HESAPLAMALAR

#1-  SATIŞ TRENDİ 
def build_sales_trend(receipts):
    trend = {}
    for r in receipts:
        #tarihi yyyy-mm çevirelim ay bazında gruplamak için
        dt = r["receipt_date"]
        month_key = f"{dt.year}-{dt.month:02d}"
        amount = float(r["total_amount"])
        if month_key not in trend:
            trend[month_key] = 0.0
        trend[month_key] += amount

    sorted_months = sorted(trend.keys())
    return [
        {"label":month,"value":round(trend[month],2)}
        for month in sorted_months
    ]



def build_repeat_customer_rate(receipts):
    customer_counts = Counter(r["customer_id"] for r in receipts)
    
    total_customers = len(customer_counts)
    if total_customers == 0:
        return []

    repeat_count = sum(1 for count in customer_counts.values() if count>1)
    one_time_count = total_customers-repeat_count

    return [
        {"label": "Tek Seferlik", "count": one_time_count, "percentage": round((one_time_count / total_customers) * 100, 1)},
        {"label": "Tekrar Eden", "count": repeat_count, "percentage": round((repeat_count / total_customers) * 100, 1)}
     ]


def quantile_scores(values, reverse=False):
    n = len(values)
    if n == 0:
        return []
    order = sorted(range(n), key=lambda i: values[i])
    scores = [0] * n
    for rank, idx in enumerate(order):
        bucket = min(4, (rank * 5) // n)
        scores[idx] = bucket + 1
    if reverse:
        scores = [6 - s for s in scores]
    return scores


RFM_GRID = {
    (1, 5): "Kaybetmek Üzereyiz", (2, 5): "Kaybetmek Üzereyiz",
    (1, 4): "Riskli", (2, 4): "Riskli", (1, 3): "Riskli", (2, 3): "Riskli",
    (1, 2): "Uykuda", (2, 2): "Uykuda", (1, 1): "Uykuda", (2, 1): "Uykuda",
    (3, 5): "Sadık Müşteri", (3, 4): "Sadık Müşteri",
    (3, 3): "İlgi Bekleyen",
    (3, 2): "Uykuya Dalıyor", (3, 1): "Uykuya Dalıyor",
    (4, 5): "Şampiyon", (5, 5): "Şampiyon", (4, 4): "Şampiyon", (5, 4): "Şampiyon",
    (4, 3): "Potansiyel Sadık", (5, 3): "Potansiyel Sadık", (4, 2): "Potansiyel Sadık", (5, 2): "Potansiyel Sadık",
    (4, 1): "Umut Vaadeden",
    (5, 1): "Yeni Müşteri",
}

RFM_SEGMENT_ORDER = [
    "Şampiyon", "Sadık Müşteri", "Potansiyel Sadık", "Yeni Müşteri", "Umut Vaadeden",
    "İlgi Bekleyen",
    "Uykuya Dalıyor", "Riskli", "Kaybetmek Üzereyiz", "Uykuda",
]


def build_rfm_segments(rfm_rows):
    n = len(rfm_rows)
    if n == 0:
        return []

    today = date.today()
    days_since_last = []
    for row in rfm_rows:
        last_date = row["last_receipt_date"]
        last_date = last_date.date() if hasattr(last_date, "date") else last_date
        days_since_last.append((today - last_date).days)

    frequency = [row["frequency"] for row in rfm_rows]
    monetary = [float(row["monetary"]) for row in rfm_rows]

    r_scores = quantile_scores(days_since_last, reverse=True)
    f_scores = quantile_scores(frequency)

    segment_counts = Counter()
    segment_monetary_sum = Counter()
    for r_score, f_score, m_value in zip(r_scores, f_scores, monetary):
        segment = RFM_GRID[(r_score, f_score)]
        segment_counts[segment] += 1
        segment_monetary_sum[segment] += m_value

    results = to_ordered_percentages(segment_counts, RFM_SEGMENT_ORDER)
    for item in results:
        count = segment_counts[item["label"]]
        item["avgMonetary"] = round(segment_monetary_sum[item["label"]] / count, 2) if count else 0

    return results


