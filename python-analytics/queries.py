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
