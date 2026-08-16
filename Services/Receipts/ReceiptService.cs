using CRS_INTERN_PROJECT.Data;
using CRS_INTERN_PROJECT.DTOs.Admin;
using CRS_INTERN_PROJECT.DTOs.Common;
using CRS_INTERN_PROJECT.DTOs.Receipt;
using CRS_INTERN_PROJECT.Entities;
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
            .Include(r => r.Brand)
            .Include(r => r.Items)
            .Where(r => r.ConsumerProfileId == consumerProfile.Id)
            .OrderByDescending(r => r.ReceiptDate)
            .Select(r => new ReceiptDto
            {
                Id = r.Id,
                BrandId = r.BrandId,
                BrandName = r.Brand.Name,
                ReceiptDate = r.ReceiptDate,
                TotalAmount = r.TotalAmount,
                Status = r.Status.ToString(),
                ImageUrl = r.ImageUrl,
                Items = r.Items.Select(i => new ReceiptItemDto
                {
                    Id = i.Id,
                    ProductName = i.ProductName,
                    UnitPrice = i.UnitPrice,
                    Quantity = i.Quantity,
                    TotalPrice = i.TotalPrice,
                    Category = i.ProductCategory ?? "Genel"
                }).ToList()
            }).ToListAsync();

        return receipts;
    }

    public async Task<PagedResult<ReceiptDto>> GetAllReceiptAsync(ReceiptFilterDto filter)
    {
        var query = _context.Receipts.AsQueryable();

        /* frontend'den dolu bir status gelmişse approved,pending var mı konrolu 
        varsa -> gelen string ReceiptStatus Enum'a çevirilir. 
        */

        if(!string.IsNullOrEmpty(filter.Status))
        {
            if(Enum.TryParse<ReceiptStatus>(filter.Status,true,out var parsedStatus))
            {
                query = query.Where(r => r.Status == parsedStatus);

            }
        }

        if (filter.BrandId.HasValue)
        {
            query = query.Where(r => r.BrandId == filter.BrandId.Value);
        }

        if (filter.DateFrom.HasValue)
        {
            // Query string'den gelen tarih Kind=Unspecified oluyor; Receipt.ReceiptDate kolonu
            // "timestamp with time zone" olduğu için Npgsql sadece Kind=Utc kabul ediyor.
            var dateFromUtc = DateTime.SpecifyKind(filter.DateFrom.Value, DateTimeKind.Utc);
            query = query.Where(r => r.ReceiptDate >= dateFromUtc);
        }

        if (filter.DateTo.HasValue)
        {
            var dateToUtc = DateTime.SpecifyKind(filter.DateTo.Value, DateTimeKind.Utc);
            query = query.Where(r => r.ReceiptDate <= dateToUtc);
        }

            /* Pagination işlemi,
            AsQueryAble()  kullanmak şart burda 
            
            PageNumber=5 ve PageSize=10 istendi diyelim
            skip((5-1)*10) yani skip(40) yapar
            SQL ilk 40 kaydı atlar
            Take(10) sonraki 10 kaydı getirir

            5. sayfa istenirse ilk 4 sayfa skiplenir take


            */
        var TotalCount = await query.CountAsync();

        /* Sıralama: SortBy "amount" ise tutara göre, aksi halde (varsayılan) tarihe göre.
        SortDescending false gelirse artan sıralama yapılır. */
        query = filter.SortBy?.ToLower() switch
        {
            "amount" => filter.SortDescending
                ? query.OrderByDescending(r => r.TotalAmount)
                : query.OrderBy(r => r.TotalAmount),
            _ => filter.SortDescending
                ? query.OrderByDescending(r => r.ReceiptDate)
                : query.OrderBy(r => r.ReceiptDate)
        };

        var items = await query
        .Include(r => r.Brand)
        .Include(r => r.Items)
        .Skip((filter.PageNumber - 1) * filter.PageSize)
        .Take(filter.PageSize)
        .Select(r => new ReceiptDto
        {
            Id = r.Id,
            BrandId = r.BrandId,
            BrandName = r.Brand.Name,
            ReceiptDate = r.ReceiptDate,
            TotalAmount = r.TotalAmount,
            Status = r.Status.ToString(),
            ImageUrl = r.ImageUrl,
            Items = r.Items.Select(i => new ReceiptItemDto
            {
                Id = i.Id,
                ProductName = i.ProductName,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity,
                TotalPrice = i.TotalPrice,
                Category = i.ProductCategory ?? "Genel"
            }).ToList()
        }).ToListAsync();

        return new PagedResult<ReceiptDto>
        {
            Items = items,
            TotalCount = TotalCount,
            PageNumber = filter.PageNumber,
            PageSize = filter.PageSize
        };
    }









}
