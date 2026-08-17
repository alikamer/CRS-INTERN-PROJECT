//CLAUDE


using Bogus;
using CRS_INTERN_PROJECT.Entities;
using CRS_INTERN_PROJECT.Enums;
using Microsoft.EntityFrameworkCore;

namespace CRS_INTERN_PROJECT.Data;

/// <summary>
/// Bir markanın fiyat segmenti. RFM/analytics demo verisinde fiş tutarlarını
/// gerçekçi aralıklarda üretebilmek için kullanılıyor.
/// </summary>
public enum BrandPriceSegment
{
    Ekonomik,
    Orta,
    OrtaUstu,
    Luks
}

/// <summary>
/// Sentetik veri kataloğundaki bir markanın tanımı: adı, fiyat segmenti ve
/// bize gerçekten abone (Tenant) olup olmadığı.
/// </summary>
public record BrandSeedInfo(string Name, BrandPriceSegment Segment, bool IsTenant);

/// <summary>
/// DbSeeder'daki küçük/tanıdık demo verisinden (Zara, Mavi, birkaç hesap) ayrı olarak,
/// RFM/analytics ekranlarını gerçekçi göstermek için 30 markalık büyük bir sentetik veri seti üretir.
/// DbSeeder'ın aksine otomatik çalışmaz; Program.cs'te sadece "--seed-bulk" argümanıyla tetiklenir.
/// </summary>
public static class BulkSeeder
{
    public static readonly List<BrandSeedInfo> BrandCatalog = new()
    {
        // 8 abone (Tenant) marka — Türkiye'de herkesin bildiği, geniş kitleye hitap eden markalar
        new("LC Waikiki", BrandPriceSegment.Ekonomik, true),
        new("DeFacto", BrandPriceSegment.Ekonomik, true),
        new("Koton", BrandPriceSegment.Ekonomik, true),
        new("Penti", BrandPriceSegment.Ekonomik, true),
        new("Zara", BrandPriceSegment.Orta, true),
        new("Mavi", BrandPriceSegment.Orta, true),
        new("US Polo Assn.", BrandPriceSegment.Orta, true),
        new("Nike", BrandPriceSegment.OrtaUstu, true),

        // 22 marka — sadece Brand kataloğunda duruyor, panel/hesap sahibi değil (Premium'un gördüğü pazar verisi)
        new("Colin's", BrandPriceSegment.Ekonomik, false),
        new("Ekol", BrandPriceSegment.Ekonomik, false),
        new("Kiğılı", BrandPriceSegment.Orta, false),
        new("Damat Tween", BrandPriceSegment.Orta, false),
        new("Network", BrandPriceSegment.Orta, false),
        new("H&M", BrandPriceSegment.Orta, false),
        new("Pull&Bear", BrandPriceSegment.Orta, false),
        new("Bershka", BrandPriceSegment.Orta, false),
        new("Stradivarius", BrandPriceSegment.Orta, false),
        new("Puma", BrandPriceSegment.Orta, false),
        new("Twist", BrandPriceSegment.Orta, false),
        new("Suwen", BrandPriceSegment.Orta, false),
        new("Aeropostale", BrandPriceSegment.Orta, false),
        new("Jack & Jones", BrandPriceSegment.Orta, false),
        new("Mango", BrandPriceSegment.OrtaUstu, false),
        new("Adidas", BrandPriceSegment.OrtaUstu, false),
        new("İpekyol", BrandPriceSegment.OrtaUstu, false),
        new("Machka", BrandPriceSegment.OrtaUstu, false),
        new("Levi's", BrandPriceSegment.OrtaUstu, false),
        new("Vakko", BrandPriceSegment.Luks, false),
        new("Beymen", BrandPriceSegment.Luks, false),
        new("Tommy Hilfiger", BrandPriceSegment.Luks, false),
    };

    private static readonly Dictionary<string, string> BrandDomains = new()
    {
        ["LC Waikiki"] = "lcwaikiki.com",
        ["DeFacto"] = "defacto.com.tr",
        ["Koton"] = "koton.com",
        ["Penti"] = "penti.com",
        ["Zara"] = "zara.com",
        ["Mavi"] = "mavi.com",
        ["US Polo Assn."] = "uspoloassn.com",
        ["Nike"] = "nike.com",
        ["Colin's"] = "colins.com.tr",
        ["Kiğılı"] = "kigili.com",
        ["Damat Tween"] = "damat.com.tr",
        ["Network"] = "network.com.tr",
        ["H&M"] = "hm.com",
        ["Pull&Bear"] = "pullandbear.com",
        ["Bershka"] = "bershka.com",
        ["Stradivarius"] = "stradivarius.com",
        ["Puma"] = "puma.com",
        ["Twist"] = "twist.com.tr",
        ["Suwen"] = "suwen.com.tr",
        ["Aeropostale"] = "aeropostale.com",
        ["Jack & Jones"] = "jackjones.com",
        ["Mango"] = "mango.com",
        ["Adidas"] = "adidas.com",
        ["Levi's"] = "levi.com",
        ["Beymen"] = "beymen.com",
        ["Tommy Hilfiger"] = "tommy.com",
        ["Starbucks"] = "starbucks.com",
    };

    /// <summary>
    /// Google favicon servisinden gelen görsel bazı markalarda (bulanık/aşırı yakınlaştırılmış)
    /// kötü göründüğü için, o markalar için Wikipedia'daki gerçek logo dosyasına doğrudan bağlanıyoruz.
    /// İpekyol, Machka ve Ekol için Wikipedia'da uygun bir logo bulunamadı; LogoUrl boş kalıp
    /// BrandLogo.jsx bileşeni baş harf avatarına düşüyor.
    /// </summary>
    private static readonly Dictionary<string, string> BrandLogoOverrides = new()
    {
        ["Vakko"] = "https://upload.wikimedia.org/wikipedia/en/thumb/2/26/Vakko_Turkish_fashion_company.png/120px-Vakko_Turkish_fashion_company.png",
        ["US Polo Assn."] = "https://upload.wikimedia.org/wikipedia/commons/d/d2/Uspa_logo2.jpg",
        ["LC Waikiki"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/LC_Waikiki_logo.svg/250px-LC_Waikiki_logo.svg.png",
        ["Aeropostale"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Aeropostale_logo17.svg/250px-Aeropostale_logo17.svg.png",
        ["İpekyol"] = "https://upload.wikimedia.org/wikipedia/commons/9/91/Ipekyol-logo.svg",
    };

    /// <summary>
    /// Sırayla: 1) markalar + tenant'lar, 2) tüketiciler + fişler + sadakat puanları.
    /// </summary>
    public static async Task SeedAsync(AppDbContext context)
    {
        await SeedBrandsAndTenantsAsync(context);
        await SeedConsumersAndReceiptsAsync(context);
    }

    /// <summary>
    /// 1. aşama: 30 markayı ve bunlardan 8'i için Tenant + CorporateProfile + AppUser (Owner) kaydını oluşturur.
    /// </summary>
    private static async Task SeedBrandsAndTenantsAsync(AppDbContext context)
    {
        if (await context.Brands.CountAsync() >= BrandCatalog.Count)
        {
            Console.WriteLine("[BulkSeeder] Marka kataloğu zaten tam görünüyor, atlanıyor.");
            return;
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");
        var brandEntities = new Dictionary<string, Brand>();

        foreach (var info in BrandCatalog)
        {
            // DbSeeder'dan zaten gelmiş olabilecek markaları (Zara, Mavi) tekrar oluşturmuyoruz.
            var existingBrand = await context.Brands.FirstOrDefaultAsync(b => b.Name == info.Name);
            if (existingBrand != null)
            {
                brandEntities[info.Name] = existingBrand;
                continue;
            }

            string? logoUrl;
            if (BrandLogoOverrides.TryGetValue(info.Name, out var overrideUrl))
            {
                logoUrl = overrideUrl;
            }
            else if (BrandDomains.TryGetValue(info.Name, out var domain))
            {
                logoUrl = $"https://www.google.com/s2/favicons?domain={domain}&sz=128";
            }
            else
            {
                logoUrl = null;
            }
            var brand = new Brand { Name = info.Name, IsActive = true, LogoUrl = logoUrl };
            context.Brands.Add(brand);
            brandEntities[info.Name] = brand;
        }

        await context.SaveChangesAsync();

        foreach (var info in BrandCatalog.Where(b => b.IsTenant))
        {
            var brand = brandEntities[info.Name];

            var existingTenant = await context.Tenants.FirstOrDefaultAsync(t => t.BrandId == brand.Id);
            if (existingTenant != null)
            {
                continue; // Zara/Mavi için DbSeeder'da zaten Tenant + Owner kurulu.
            }

            var subscriptionTier = info.Segment switch
            {
                BrandPriceSegment.OrtaUstu => SubscriptionTier.Premium,
                BrandPriceSegment.Orta => SubscriptionTier.Normal,
                _ => SubscriptionTier.Basic
            };

            var tenant = new Tenant
            {
                CompanyName = $"{info.Name} Perakende A.Ş.",
                Status = TenantStatus.Active,
                SubscriptionTier = subscriptionTier,
                BrandId = brand.Id
            };
            context.Tenants.Add(tenant);
            await context.SaveChangesAsync(); // Owner'ı bağlarken TenantId lazım.

            var ownerUser = new AppUser
            {
                FirstName = "Marka",
                LastName = "Yöneticisi",
                PhoneNumber = "5000000000",
                Email = $"corporate@{Slugify(info.Name)}.com",
                PasswordHash = passwordHash,
                Role = UserRole.CorporateUser
            };
            context.Users.Add(ownerUser);
            await context.SaveChangesAsync(); // CorporateProfile'da AppUserId lazım.

            context.CorporateProfiles.Add(new CorporateProfile
            {
                AppUserId = ownerUser.Id,
                TenantId = tenant.Id,
                Role = TenantRole.Owner,
                Department = "Genel Yönetim"
            });
        }

        await context.SaveChangesAsync();

        Console.WriteLine($"[BulkSeeder] {BrandCatalog.Count} marka hazır ({BrandCatalog.Count(b => b.IsTenant)} tanesi Tenant). Tüketici/fiş üretimi henüz eklenmedi.");
    }

    /// <summary>
    /// "Tommy Hilfiger" -> "tommyhilfiger" gibi, marka adından Türkçe karakter/boşluk/özel karakter
    /// temizlenmiş, e-posta adresine gömülebilir sade bir metin üretir.
    /// </summary>
    private static string Slugify(string name)
    {
        return name
            .ToLowerInvariant()
            .Replace("ı", "i").Replace("ğ", "g").Replace("ü", "u")
            .Replace("ş", "s").Replace("ö", "o").Replace("ç", "c")
            .Replace(" ", "").Replace("'", "").Replace("&", "").Replace(".", "");
    }

    private const string BulkEmailDomain = "@bulk.crssynthetic.local";
    private const int ConsumerCount = 5000;

    // Türkiye'deki e-ticaret/nüfus yoğunluğuna kabaca yakın, ağırlıklı şehir dağılımı.
    private static readonly (string City, int Weight)[] CityWeights =
    {
        ("İstanbul", 30), ("Ankara", 12), ("İzmir", 10), ("Bursa", 6), ("Antalya", 5),
        ("Adana", 4), ("Konya", 4), ("Gaziantep", 3), ("Mersin", 3), ("Kayseri", 3),
        ("Eskişehir", 3), ("Samsun", 3), ("Denizli", 2), ("Kocaeli", 3), ("Sakarya", 2),
        ("Trabzon", 2), ("Diyarbakır", 2), ("Şanlıurfa", 2), ("Manisa", 2), ("Balıkesir", 2),
    };

    // Marka fiyat segmentine göre "referans ürün" fiyat aralığı (TL). Gerçek ürün fiyatı
    // bu aralıktan seçilip aşağıdaki katalogdaki ağırlık çarpanıyla ölçekleniyor.
    private static readonly Dictionary<BrandPriceSegment, (decimal Min, decimal Max)> SegmentPriceRange = new()
    {
        [BrandPriceSegment.Ekonomik] = (150m, 500m),
        [BrandPriceSegment.Orta] = (400m, 1200m),
        [BrandPriceSegment.OrtaUstu] = (900m, 2500m),
        [BrandPriceSegment.Luks] = (2000m, 8000m),
    };

    // Paylaşılan giyim ürün kataloğu (marka bağımsız): (ürün adı, kategori, fiyat ağırlık çarpanı)
    private static readonly (string Name, string Category, decimal Weight)[] ProductCatalog =
    {
        ("Basic Tişört", "Giyim & Aksesuar", 0.3m),
        ("Gömlek", "Giyim & Aksesuar", 0.5m),
        ("Slim Fit Pantolon", "Giyim & Aksesuar", 0.6m),
        ("Kazak", "Giyim & Aksesuar", 0.6m),
        ("Eşofman Takımı", "Giyim & Aksesuar", 0.9m),
        ("Kot Ceket", "Giyim & Aksesuar", 0.9m),
        ("Elbise", "Giyim & Aksesuar", 1.0m),
        ("Spor Ayakkabı", "Ayakkabı", 1.2m),
        ("Çanta", "Çanta & Aksesuar", 1.1m),
        ("Klasik Ayakkabı", "Ayakkabı", 1.3m),
        ("Blazer Ceket", "Giyim & Aksesuar", 1.4m),
        ("Mont", "Giyim & Aksesuar", 1.8m),
        ("Kemer", "Çanta & Aksesuar", 0.3m),
        ("Şapka", "Çanta & Aksesuar", 0.25m),
        ("Atkı & Bere Seti", "Çanta & Aksesuar", 0.4m),
    };

    /// <summary>
    /// 2. aşama: ~5.000 tüketici ve onlara bağlı, Pareto (80/20) dağılımıyla üretilmiş ~25-30k fiş.
    /// Sadakat verisi (ConsumerLoyalty), fişleri tek tek onaylatmak yerine, üretilen Approved
    /// fişlerden doğrudan hesaplanıp toplu olarak yazılıyor (ApproveReceiptAsync'in yaptığı
    /// %5 puan mantığıyla birebir aynı sonucu üretir).
    /// </summary>
    private static async Task SeedConsumersAndReceiptsAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync(u => u.Email.EndsWith(BulkEmailDomain)))
        {
            Console.WriteLine("[BulkSeeder] Sentetik tüketici/fiş verisi zaten üretilmiş, atlanıyor.");
            return;
        }

        var brands = await context.Brands
            .Where(b => BrandCatalog.Select(c => c.Name).Contains(b.Name))
            .ToListAsync();
        var brandInfoByName = BrandCatalog.ToDictionary(b => b.Name);

        Randomizer.Seed = new Random(20260814); // Tekrarlanabilir sonuç için sabit seed
        var random = new Random(20260814);
        var nameFaker = new Faker("tr");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");
        context.ChangeTracker.AutoDetectChangesEnabled = false;

        // (ConsumerProfileId, BrandId) -> (onaylı fiş sayısı, onaylı fiş toplam tutarı)
        var loyaltyAccumulator = new Dictionary<(Guid ConsumerId, Guid BrandId), (int Count, decimal Total)>();

        const int batchSize = 500;
        for (int batchStart = 0; batchStart < ConsumerCount; batchStart += batchSize)
        {
            var consumersInBatch = new List<ConsumerProfile>();
            var usersInBatch = new List<AppUser>();
            var receiptsInBatch = new List<Receipt>();

            int batchEnd = Math.Min(batchStart + batchSize, ConsumerCount);
            for (int i = batchStart; i < batchEnd; i++)
            {
                var firstName = nameFaker.Name.FirstName();
                var lastName = nameFaker.Name.LastName();

                var user = new AppUser
                {
                    FirstName = firstName,
                    LastName = lastName,
                    PhoneNumber = "5" + random.Next(100000000, 999999999),
                    Email = $"consumer{i}{BulkEmailDomain}",
                    PasswordHash = passwordHash,
                    Role = UserRole.Consumer
                };

                // 18-65 yaş arası, iki zar atıp ortalamasını alarak uçlardan çok ortaya yığılan
                // kaba bir "normal dağılım" hissi veriyoruz (gerçek Gauss'a gerek yok, demo için yeterli).
                int age = (random.Next(18, 66) + random.Next(18, 66)) / 2;
                var consumerProfile = new ConsumerProfile
                {
                    AppUserId = user.Id,
                    DateOfBirth = DateTime.UtcNow.AddYears(-age).AddDays(-random.Next(0, 365)),
                    Gender = random.Next(2) == 0 ? "Kadın" : "Erkek",
                    City = PickWeightedCity(random),
                    IncomeLevel = random.Next(100) switch { < 30 => "Düşük", < 80 => "Orta", _ => "Yüksek" }
                };

                usersInBatch.Add(user);
                consumersInBatch.Add(consumerProfile);

                // Pareto 80/20: tüketicilerin ~%20'si "sadık" (çok fişli), ~%80'i seyrek alıcı.
                bool isLoyalSegment = (i % 5) == 0; // her 5 kişiden 1'i (~%20) sadık segment
                int receiptCount = isLoyalSegment ? random.Next(6, 26) : random.Next(1, 5);

                // Bu tüketicinin favori 1-2 markası; fişlerin %75'i favorilerden, %25'i pazardan geneline dağılır.
                var favoriteBrands = new List<Brand> { brands[random.Next(brands.Count)] };
                if (random.Next(2) == 0)
                {
                    favoriteBrands.Add(brands[random.Next(brands.Count)]);
                }

                for (int r = 0; r < receiptCount; r++)
                {
                    var brand = random.Next(100) < 75
                        ? favoriteBrands[random.Next(favoriteBrands.Count)]
                        : brands[random.Next(brands.Count)];

                    var receipt = BuildReceipt(consumerProfile, brand, brandInfoByName[brand.Name].Segment, random);
                    receiptsInBatch.Add(receipt);

                    if (receipt.Status == ReceiptStatus.Approved)
                    {
                        var key = (consumerProfile.Id, brand.Id);
                        loyaltyAccumulator.TryGetValue(key, out var current);
                        loyaltyAccumulator[key] = (current.Count + 1, current.Total + receipt.TotalAmount);
                    }
                }
            }

            context.Users.AddRange(usersInBatch);
            context.ConsumerProfiles.AddRange(consumersInBatch);
            context.Receipts.AddRange(receiptsInBatch); // ReceiptItem'lar Items koleksiyonu üzerinden otomatik ekleniyor
            await context.SaveChangesAsync();

            Console.WriteLine($"[BulkSeeder] {batchEnd}/{ConsumerCount} tüketici işlendi...");
        }

        // Sadakat puanlarını tek seferde, toplanan verilerden yazıyoruz.
        var loyaltyRows = loyaltyAccumulator.Select(kv => new ConsumerLoyalty
        {
            ConsumerProfileId = kv.Key.ConsumerId,
            BrandId = kv.Key.BrandId,
            TotalReceiptCount = kv.Value.Count,
            TotalPoints = kv.Value.Total * 0.05m
        });
        context.ConsumerLoyalties.AddRange(loyaltyRows);
        await context.SaveChangesAsync();

        context.ChangeTracker.AutoDetectChangesEnabled = true;

        Console.WriteLine($"[BulkSeeder] Tamamlandı: {ConsumerCount} tüketici, {loyaltyAccumulator.Count} sadakat kaydı üretildi.");
    }

    /// <summary>
    /// Bir fiş ve içindeki 1-4 ürün kalemini, markanın fiyat segmentine göre gerçekçi tutarlarla üretir.
    /// </summary>
    private static Receipt BuildReceipt(ConsumerProfile consumer, Brand brand, BrandPriceSegment segment, Random random)
    {
        var receiptDate = DateTime.UtcNow.AddDays(-random.Next(0, 365)).AddHours(-random.Next(0, 23));

        // %90 Approved, %7 Pending, %3 Rejected
        var statusRoll = random.Next(100);
        var status = statusRoll switch
        {
            < 90 => ReceiptStatus.Approved,
            < 97 => ReceiptStatus.Pending,
            _ => ReceiptStatus.Rejected
        };

        var receipt = new Receipt
        {
            ConsumerProfileId = consumer.Id,
            BrandId = brand.Id,
            ReceiptDate = receiptDate,
            Status = status,
            CreatedAt = receiptDate,
            ImageUrl = $"https://storage.crs-smartreceipt.com/receipts/synthetic_{Guid.NewGuid():N}.jpg",
            Items = new List<ReceiptItem>()
        };

        var (priceMin, priceMax) = SegmentPriceRange[segment];
        int itemCount = random.Next(1, 5);
        decimal totalAmount = 0m;

        for (int j = 0; j < itemCount; j++)
        {
            var product = ProductCatalog[random.Next(ProductCatalog.Length)];
            var basePrice = priceMin + (decimal)random.NextDouble() * (priceMax - priceMin);
            var unitPrice = Math.Round(basePrice * product.Weight, 2);
            int quantity = random.Next(1, 3);
            var totalPrice = unitPrice * quantity;
            totalAmount += totalPrice;

            receipt.Items.Add(new ReceiptItem
            {
                ProductName = product.Name,
                ProductCategory = product.Category,
                Quantity = quantity,
                UnitPrice = unitPrice,
                TotalPrice = totalPrice
            });
        }

        receipt.TotalAmount = totalAmount;
        return receipt;
    }

    private static string PickWeightedCity(Random random)
    {
        int totalWeight = CityWeights.Sum(c => c.Weight);
        int roll = random.Next(totalWeight);
        int cumulative = 0;

        foreach (var (city, weight) in CityWeights)
        {
            cumulative += weight;
            if (roll < cumulative)
            {
                return city;
            }
        }

        return CityWeights[^1].City; // Kuramsal olarak buraya düşmez, güvenlik için.
    }
}
