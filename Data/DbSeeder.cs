using CRS_INTERN_PROJECT.Entities;
using CRS_INTERN_PROJECT.Enums;
using Microsoft.EntityFrameworkCore;

namespace CRS_INTERN_PROJECT.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            // Veritabanı oluşturulmuş mu kontrol et ve migration'ları uygula
            await context.Database.MigrateAsync();

            // Eğer veritabanında zaten fiş varsa seeder'ı çalıştırma
            if (await context.Receipts.AnyAsync())
            {
                return;
            }

            // 1. MARKALAR (BRANDS)
            var zaraBrand = new Brand { Name = "Zara", LogoUrl = "https://logo.clearbit.com/zara.com" };
            var maviBrand = new Brand { Name = "Mavi", LogoUrl = "https://logo.clearbit.com/mavi.com" };
            var starbucksBrand = new Brand { Name = "Starbucks", LogoUrl = "https://logo.clearbit.com/starbucks.com" };
            var lcwBrand = new Brand { Name = "LC Waikiki", LogoUrl = "https://logo.clearbit.com/lcwaikiki.com" };
            var nikeBrand = new Brand { Name = "Nike", LogoUrl = "https://logo.clearbit.com/nike.com" };

            var brands = new List<Brand> { zaraBrand, maviBrand, starbucksBrand, lcwBrand, nikeBrand };
            await context.Brands.AddRangeAsync(brands);
            await context.SaveChangesAsync();

            // 2. KİRACILAR / ŞİRKETLER (TENANTS)
            var zaraTenant = new Tenant
            {
                CompanyName = "Zara Tekstil A.Ş.",
                Status = TenantStatus.Active, // Seed verisi zaten onaylanmış kabul edilir
                SubscriptionTier = SubscriptionTier.Normal, // Rakip isimleri MASKELİ görecek
                BrandId = zaraBrand.Id
            };

            var maviTenant = new Tenant
            {
                CompanyName = "Mavi Giyim A.Ş.",
                Status = TenantStatus.Active, // Seed verisi zaten onaylanmış kabul edilir
                SubscriptionTier = SubscriptionTier.Premium, // Rakiplerin GERÇEK İSİMLERİNİ görecek
                BrandId = maviBrand.Id
            };

            await context.Tenants.AddRangeAsync(zaraTenant, maviTenant);
            await context.SaveChangesAsync();

            // 3. KULLANICILAR (USERS & PROFILES)
            var passwordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");

            // B2B Zara Kurumsal Kullanıcı
            var zaraUser = new AppUser
            {
                Email = "corporate@zara.com",
                PasswordHash = passwordHash,
                Role = UserRole.CorporateUser
            };
            var zaraCorpProfile = new CorporateProfile
            {
                AppUserId = zaraUser.Id,
                TenantId = zaraTenant.Id,
                Department = "Pazar Araştırma & Satış"
            };

            // B2B Mavi Kurumsal Kullanıcı
            var maviUser = new AppUser
            {
                Email = "corporate@mavi.com",
                PasswordHash = passwordHash,
                Role = UserRole.CorporateUser
            };
            var maviCorpProfile = new CorporateProfile
            {
                AppUserId = maviUser.Id,
                TenantId = maviTenant.Id,
                Department = "Genel Yönetim"
            };

            // B2C Consumer Vatandaş
            var consumerUser = new AppUser
            {
                Email = "ali.consumer@gmail.com",
                PasswordHash = passwordHash,
                Role = UserRole.Consumer
            };
            var consumerProfile = new ConsumerProfile
            {
                AppUserId = consumerUser.Id,
                City = "İstanbul",
                Gender = "Erkek"
            };

            // System Admin
            var adminUser = new AppUser
            {
                Email = "admin@crs.com",
                PasswordHash = passwordHash,
                Role = UserRole.SystemAdmin
            };

            await context.Users.AddRangeAsync(zaraUser, maviUser, consumerUser, adminUser);
            await context.CorporateProfiles.AddRangeAsync(zaraCorpProfile, maviCorpProfile);
            await context.ConsumerProfiles.AddAsync(consumerProfile);
            await context.SaveChangesAsync();

            // 4. 100 ADET RASTGELE TEST FİŞİ ÜRETİMİ
            var random = new Random(42); // Sabit seed (tekrarlanabilir tutarlı rastgelelik)

            var productCatalog = new Dictionary<string, (string name, string category, decimal price)[]>
            {
                ["Zara"] = new[]
                {
                    ("Oversize Blazer Ceket", "Giyim & Aksesuar", 1899.90m),
                    ("Slim Fit Denim Pantolon", "Giyim & Aksesuar", 1299.00m),
                    ("Deri Ayakkabı", "Ayakkabı", 2499.00m),
                    ("Nuit Spray Parfüm", "Kozmetik & Parfüm", 799.50m)
                },
                ["Mavi"] = new[]
                {
                    ("Jake Jean Pantolon", "Giyim & Aksesuar", 1199.90m),
                    ("Basic Logolu T-Shirt", "Giyim & Aksesuar", 499.00m),
                    ("Kot Ceket", "Giyim & Aksesuar", 1699.00m),
                    ("Deri Kemer", "Giyim & Aksesuar", 349.90m)
                },
                ["Starbucks"] = new[]
                {
                    ("Iced Caramel Macchiato", "Yiyecek & İçecek", 145.00m),
                    ("Filter Coffee Tall", "Yiyecek & İçecek", 85.00m),
                    ("Çikolatalı Muffin", "Yiyecek & İçecek", 110.00m),
                    ("Termos 500ml", "Yiyecek & İçecek", 890.00m)
                },
                ["LC Waikiki"] = new[]
                {
                    ("Pamuklu T-Shirt 3'lü", "Giyim & Aksesuar", 399.90m),
                    ("Çocuk Eşofman Altı", "Giyim & Aksesuar", 299.00m),
                    ("Spor Ayakkabı", "Ayakkabı", 749.00m)
                },
                ["Nike"] = new[]
                {
                    ("Air Force 1 '07", "Ayakkabı", 4299.00m),
                    ("Dri-FIT Spor T-Shirt", "Giyim & Aksesuar", 1149.00m),
                    ("Spor Çantası", "Giyim & Aksesuar", 1499.00m)
                }
            };

            var receipts = new List<Receipt>();

            for (int i = 1; i <= 100; i++)
            {
                var selectedBrand = brands[random.Next(brands.Count)];
                var catalog = productCatalog[selectedBrand.Name];

                // Fiş tarihi son 30 gün içinde rastgele
                var receiptDate = DateTime.UtcNow.AddDays(-random.Next(0, 30)).AddHours(-random.Next(1, 12));
                
                // %90 Onaylanmış, %10 Beklemede
                var status = random.Next(100) < 90 ? ReceiptStatus.Approved : ReceiptStatus.Pending;

                var receipt = new Receipt
                {
                    BrandId = selectedBrand.Id,
                    ConsumerProfileId = consumerProfile.Id,
                    ReceiptDate = receiptDate,
                    Status = status,
                    CreatedAt = receiptDate,
                    ImageUrl = $"https://storage.crs-smartreceipt.com/receipts/receipt_{i}.jpg",
                    Items = new List<ReceiptItem>()
                };

                // Fişe 1 ile 4 arasında rastgele ürün kalemi ekleme
                int itemCount = random.Next(1, 5);
                decimal totalAmount = 0m;

                for (int j = 0; j < itemCount; j++)
                {
                    var product = catalog[random.Next(catalog.Length)];
                    int quantity = random.Next(1, 3);
                    decimal totalPrice = product.price * quantity;
                    totalAmount += totalPrice;

                    receipt.Items.Add(new ReceiptItem
                    {
                        ProductName = product.name,
                        ProductCategory = product.category,
                        Quantity = quantity,
                        UnitPrice = product.price,
                        TotalPrice = totalPrice
                    });
                }

                receipt.TotalAmount = totalAmount;
                receipts.Add(receipt);
            }

            await context.Receipts.AddRangeAsync(receipts);
            await context.SaveChangesAsync();
        }
    }
}




