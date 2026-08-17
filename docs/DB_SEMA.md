# Veritabanı Şeması (ER Diyagramı)

> Bu dosya `Entities/` + `Data/AppDbContext.cs` (`OnModelCreating`) baz alınarak 14.08.2026'da elle çıkarılmıştır.
> Kod değiştikçe (yeni entity/migration) bu dosya da güncellenmeli — otomatik senkronize olmuyor.

```mermaid 
erDiagram
    AppUser ||--o| ConsumerProfile : "1 kullanıcı, en fazla 1 tüketici profili"
    AppUser ||--o| CorporateProfile : "1 kullanıcı, en fazla 1 kurumsal profil"
    AppUser ||--o{ RefreshToken : "1 kullanıcının birden çok cihaz token'ı olabilir"

    Tenant ||--o{ CorporateProfile : "1 şirkette birden çok çalışan"
    Tenant ||--o{ TenantInvite : "bekleyen ekip davetleri"
    Brand ||--o{ Tenant : "1 marka, teoride birden çok tenant'a atanabilir"

    ConsumerProfile ||--o{ Receipt : "1 tüketicinin birden çok fişi"
    Brand ||--o{ Receipt : "1 markaya ait birden çok fiş"
    Receipt ||--o{ ReceiptItem : "1 fişte birden çok ürün kalemi"

    ConsumerProfile ||--o{ ConsumerLoyalty : "tüketicinin marka bazlı puan durumu"
    Brand ||--o{ ConsumerLoyalty : "markanın tüm tüketicilerdeki puan durumu"

    AppUser {
        Guid Id PK
        string FirstName
        string LastName
        string PhoneNumber
        string Email
        string PasswordHash
        UserRole Role "Consumer / CorporateUser / SystemAdmin"
        DateTime CreatedAt
    }

    ConsumerProfile {
        Guid Id PK
        Guid AppUserId FK
        DateTime DateOfBirth "nullable"
        string Gender "nullable"
        string City "nullable"
        string IncomeLevel "nullable"
    }

    CorporateProfile {
        Guid Id PK
        Guid AppUserId FK
        Guid TenantId FK
        TenantRole Role "Owner / Member"
        string Department "nullable"
    }

    RefreshToken {
        Guid Id PK
        Guid AppUserId FK
        string Token
        DateTime ExpiresAt
        DateTime CreatedAt
        DateTime RevokedAt "nullable"
    }

    Tenant {
        Guid Id PK
        string CompanyName
        TenantStatus Status "WaitingForApproval / Active / Rejected / Inactive"
        SubscriptionTier SubscriptionTier "Basic / Normal / Premium"
        Guid BrandId FK "nullable"
        DateTime CreatedAt
    }

    TenantInvite {
        Guid Id PK
        string Email
        Guid TenantId FK
        DateTime CreatedAt
    }

    Brand {
        Guid Id PK
        string Name
        string LogoUrl "nullable"
        bool IsActive
    }

    Receipt {
        Guid Id PK
        Guid ConsumerProfileId FK "nullable"
        Guid BrandId FK
        DateTime ReceiptDate
        decimal TotalAmount
        string ImageUrl "nullable"
        ReceiptStatus Status "Pending / Approved / Rejected"
        DateTime CreatedAt
    }

    ReceiptItem {
        Guid Id PK
        Guid ReceiptId FK
        string ProductName
        string ProductCategory "nullable"
        int Quantity
        decimal UnitPrice
        decimal TotalPrice
        string AttributesJson "jsonb, nullable"
    }

    ConsumerLoyalty {
        Guid Id PK
        Guid ConsumerProfileId FK
        Guid BrandId FK
        int TotalReceiptCount
        decimal TotalPoints
    }
```

## Foreign key'lerin silme davranışı (`OnDelete`)

Diyagram ilişkinin var olduğunu gösteriyor ama **bir satır silinince ne olacağını** göstermiyor — bu proje için bu kısım kritik, çünkü "veri asla silinmez" altın kuralı burada uygulanıyor. `Data/AppDbContext.cs`'teki `OnModelCreating`'den:

| İlişki | Silme davranışı | Anlamı |
|---|---|---|
| `AppUser` → `ConsumerProfile` | **Cascade** | Kullanıcı silinirse tüketici profili de silinir |
| `AppUser` → `CorporateProfile` | **Cascade** | Kullanıcı silinirse kurumsal profili de silinir |
| `AppUser` → `RefreshToken` | **Cascade** | Kullanıcı silinirse tüm oturum token'ları da silinir |
| `Tenant` → `CorporateProfile` | **Restrict** | İçinde hâlâ çalışanı olan bir Tenant silinemez |
| `Tenant` → `TenantInvite` | **Cascade** | Tenant silinirse bekleyen davetleri de silinir |
| `Brand` → `Tenant` (`Tenant.BrandId`) | **SetNull** | Marka silinirse, ona bağlı tenant'lar silinmez, sadece `BrandId = null` olur |
| `ConsumerProfile` → `Receipt` | **SetNull** | **Altın kural burada:** tüketici hesabını silse bile fişi silinmez, sadece `ConsumerProfileId = null` olur |
| `Brand` → `Receipt` | **Restrict** | İçinde hâlâ fişi olan bir marka silinemez (fiş geçmişi hiç kaybolmasın diye) |
| `Receipt` → `ReceiptItem` | **Cascade** | Fiş silinirse (nadiren olur) içindeki ürün kalemleri de silinir |
| `ConsumerProfile` → `ConsumerLoyalty` | **Cascade** | Tüketici profili silinirse puan kayıtları da silinir |
| `Brand` → `ConsumerLoyalty` | **Cascade** | Marka silinirse o markaya ait puan kayıtları da silinir |

## Notlar / dikkat noktaları

- **`Tenant` ↔ `Brand` ilişkisi 1:N değil, aslında serbest bir eşleştirme:** `Tenant.BrandId` tekil bir FK, `Brand` tarafında geri dönük bir koleksiyon (`ICollection<Tenant>`) tanımlı değil (`WithMany()` boş). Şema seviyesinde birden fazla Tenant aynı Brand'i gösterebilir ama bugün pratikte her tenant'a farklı bir marka atanıyor (bkz. Tenant/Brand ilişkisi tartışması — brand kataloğu tenant'tan bağımsız, admin onayda elle eşleştiriyor).
- **`Receipt.ConsumerProfileId` nullable** — bu, "veri bizim malımız" kuralının teknik implementasyonu.
- **`Brand.IsActive`** 14.08.2026'da eklendi (Marka Yönetimi ekranı için); pasif bir marka silinmiyor, sadece yeni tenant onaylarındaki dropdown'dan düşüyor.
