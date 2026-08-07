# CRS-INTERN-PROJECT: Revize Edilmiş Proje Mimarisi ve Gerçek Vizyon

> **DİKKAT (Antigravity İçin Not):** Bu dosya projenin anayasasıdır. Eski "Masraf Yönetimi (Expense Management)" mantığı tamamen çöpe atılmış, proje aşağıda açıklanan **B2B Veri Analiz Platformu** olarak baştan yazılmıştır. Gelecek oturumlarda (sessions) kod yazmadan önce mutlaka bu dosya baz alınacaktır.

## 1. Projenin Asıl Amacı ve Olayı Nedir?
Biz sıradan bir "masraf girme" uygulaması değiliz; biz devasa bir **B2B (Şirketten Şirkete) Veri Analiz Firmasıyız**.
Asıl satacağımız ürün; büyük markalara (Zara, Mavi, Starbucks vb.) müşterilerinin pazar alışkanlıklarını grafiksel olarak (Dashboard/Analytics) satmaktır.

## 2. B2C (Vatandaş) Cephesi - "Altın Madenimiz"
Şirketlere analiz satabilmek için "veriye" ihtiyacımız var. Veriyi vatandaştan oyunlaştırma (Gamification) ile topluyoruz:
*   Vatandaş uygulamayı indirir (`Consumer` rolü).
*   Yaptığı alışverişin fiş fotoğrafını, genel tarihini ve tutarını yükler (`UploadReceipt`).
*   Fiş veritabanına `Pending` (Beklemede) statüsüyle düşer. *(İleride Yapay Zeka/OCR bu fişi okuyup içindeki ürün kalemlerini JSONB formatında veritabanına basacaktır).*
*   Fiş onaylandığında vatandaşa `ConsumerLoyalty` (Sadakat Puanı) verilir.

**ALTIN KURAL (Veri Bizim Öz Malımızdır):**
Vatandaş yarın bir gün sinirlenip uygulamasını silse/hesabını kapatsa bile, **onun yüklediği fişler veritabanımızdan ASLA SİLİNMEZ.** Entity Framework üzerinde `DeleteBehavior.SetNull` kullanılmıştır. Vatandaş gider, ama veri bizde kalır.

## 3. B2B (Şirket) Cephesi - "Parayı Vurduğumuz Yer" (Sıradaki Aşama)
Toplanan fişler işlendikten sonra şirketlere satılır:
*   Şirket yöneticileri sisteme `Tenant` (Şirket) kimliğiyle ve `CorporateUser` rolüyle kaydolur.
*   Yöneticiler sisteme girdiğinde fiş yüklemezler, **Analitik Dashboard** ekranlarını görürler.
*   **Abonelik Kısıtı:** Normal paket alan şirket sadece kendi markasının verilerini görür. "Premium" paket alan şirket, rakiplerinin verilerini de (rakiplerin isimleri "Marka X" olarak maskelenmiş şekilde) görür. Pazarın röntgenini çeker.

## 4. Kodlama ve Mimari Kuralları (Mentör Onaylı)
1. **Scalability (Ölçeklenebilirlik):** Fiş resimleri veya dosyalar ASLA projenin içine (`wwwroot` veya `CurrentDirectory`) kaydedilmez. Dosya yolları daima `appsettings.json` içinden okunur ve dışarıdaki statik/ortak bir diske (MinIO, S3 veya Ortak Klasör) kaydedilir.
2. **Yorum Satırları:** Kod içinde çift slash (`//`) kullanılmaz. Kodun amacı, sadece gerektiğinde ve sade bir dille `/// <summary>` etiketleri arasına yazılır.
3. **Trafik Polisi ve Beyin:** Controller sınıfları sadece istekleri karşılayan trafik polisidir. Veritabanı sorguları, if/else iş kuralları ve tüm beyin işlemleri `Services` klasöründeki dosyalarda yapılır.
4. **Güvenlik (DTO):** Veritabanı Entity'leri asla dışarıya (Frontend'e) direkt gönderilmez (Circular Reference önlemi). Daima `DTO` (Data Transfer Object) sınıfları kullanılır.
5. **Giriş (Auth):** Bütün sistem JWT Token ile korunur. `BCrypt` ile şifreler hash'lenir.

## 5. Gelecek / İleride Eklenecek Geliştirmeler Listesi
*   **Refresh Token Hırsızlık Alarmı (Reuse Detection):** İptal edilmiş bir Refresh Token ile tekrar istek gelirse, o kullanıcıya ait veritabanındaki TÜM aktif Refresh Token'ları anında iptal edip kullanıcıyı tüm cihazlardan çıkış yapmaya (Login) zorlama güvenlik önlemi.
*   **B2B Analitik Hesaplamaları:** Gelişmiş ciro, ortalama sepet ve pazar payı hesaplama algoritmaları.
*   **SignalR Bildirimleri:** Canlı fiş onay ve durum bildirimleri.
*   **MinIO Entegrasyonu:** Fiş fotoğraflarının harici dosya sunucusunda depolanması.
