using CRS_INTERN_PROJECT.Data;
using CRS_INTERN_PROJECT.DTOs.Receipt;
using CRS_INTERN_PROJECT.Enums;
using Microsoft.EntityFrameworkCore;

namespace CRS_INTERN_PROJECT.Services.Receipts;

/// <summary>
/// Receipt yükleme, listeleme, onaylama işlemleri.
/// feedback üzerine güncelledni--> :  dosya yolları dinamik hale getirildi
/// </summary>
public class ReceiptService : IReceiptService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public ReceiptService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<Entities.Receipt> UploadReceiptAsync(UploadReceiptDto dto, Guid appUserId)
    {
       
        var consumerProfile = await _context.ConsumerProfiles
            .FirstOrDefaultAsync(cp => cp.AppUserId == appUserId);
            
        if (consumerProfile == null)
        {
            throw new Exception("Sadece Vatandaşlar (Consumer) fiş yükleyebilir. Profiliniz bulunamadı.");
        }

        var uploadsFolder = _configuration["FileUploadSettings:ReceiptImagesPath"] ?? "C:/CRS_Uploads/Receipts";
        
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder); // Klasör yoksa oluştur.
        }

      
        var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.Image.FileName);
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        // 3. Dosyayı diske kaydediyoruz.
        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await dto.Image.CopyToAsync(fileStream);
        }

        // 4. Veritabanına kaydedilecek fiş objemizi oluşturuyoruz.
        // Güvenlik: Fiş otomatik olarak Pending (Beklemede) statüsünde düşer ki hile yapılmasın.
        var newReceipt = new Entities.Receipt
        {
            ConsumerProfileId = consumerProfile.Id,
            BrandId = dto.BrandId,
            ReceiptDate = dto.ReceiptDate,
            TotalAmount = dto.TotalAmount,
            ImageUrl = filePath, // İleride Image sunucusuna (MinIO vb.) geçildiğinde burası o sunucunun URL'si olacak.
            Status = ReceiptStatus.Pending
        };

        _context.Receipts.Add(newReceipt);
        await _context.SaveChangesAsync();

        return newReceipt;
    }

    public async Task<List<ReceiptDto>> GetMyReceiptsAsync(Guid appUserId)
    {
        var consumerProfile = await _context.ConsumerProfiles
            .FirstOrDefaultAsync(cp => cp.AppUserId == appUserId);
            
        if (consumerProfile == null)
        {
            return new List<ReceiptDto>(); // Vatandaş profili yoksa boş liste döneriz.
        }

        // Vatandaşın kendi fişlerini, en yeniden en eskiye doğru sıralayıp DTO'ya dönüştürüp çekiyoruz.
        var receipts = await _context.Receipts
            .Where(r => r.ConsumerProfileId == consumerProfile.Id)
            .OrderByDescending(r => r.ReceiptDate)
            .Select(r => new ReceiptDto
            {
                Id = r.Id,
                BrandId = r.BrandId,
                ReceiptDate = r.ReceiptDate,
                TotalAmount = r.TotalAmount,
                Status = r.Status.ToString(),
                ImageUrl = r.ImageUrl
            }).ToListAsync();

        return receipts;
    }

    public async Task<bool> ApproveReceiptAsync(Guid receiptId)
    {
        // 1. Fişi bulalım
        var receipt = await _context.Receipts
            .FirstOrDefaultAsync(r => r.Id == receiptId);

        if (receipt == null) 
            throw new Exception("Böyle bir fiş bulunamadı.");
        
        if (receipt.Status == ReceiptStatus.Approved) 
            throw new Exception("Bu fiş zaten onaylanmış! İkinci defa puan dağıtamayız.");

        // 2. Fişi onaylayalım (Pending -> Approved)
        receipt.Status = ReceiptStatus.Approved;

        // 3. Oyunlaştırma (Gamification) - Vatandaşa puan verelim!
        if (receipt.ConsumerProfileId.HasValue) 
        {
            var loyalty = await _context.ConsumerLoyalties
                .FirstOrDefaultAsync(cl => cl.ConsumerProfileId == receipt.ConsumerProfileId.Value && cl.BrandId == receipt.BrandId);

            if (loyalty == null)
            {
                // Vatandaş bu markadan ilk defa fiş onaylatmış, hemen bir sadakat satırı açalım.
                loyalty = new Entities.ConsumerLoyalty
                {
                    ConsumerProfileId = receipt.ConsumerProfileId.Value,
                    BrandId = receipt.BrandId,
                    TotalReceiptCount = 0,
                    TotalPoints = 0
                };
                _context.ConsumerLoyalties.Add(loyalty);
            }

            // 1 fiş eklendi
            loyalty.TotalReceiptCount += 1;
            
            // Fiş tutarının %5'i kadar (Örnek Oran) vatandaşa puan hediye edelim!
            loyalty.TotalPoints += receipt.TotalAmount * 0.05m;
        }

        await _context.SaveChangesAsync();
        return true;
    }
}
