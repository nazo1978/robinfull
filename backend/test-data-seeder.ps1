# Test Data Seeder Script
# Bu script test verilerini API'ye yükler

$baseUrl = "http://localhost:5128/api"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "🚀 Test verilerini yüklemeye başlıyoruz..." -ForegroundColor Green

# 1. KULLANICI KAYITLARI
Write-Host "`n👤 Kullanıcıları oluşturuyor..." -ForegroundColor Yellow

# Admin kullanıcısı
$adminData = @{
    username = "admin"
    email = "admin@shopapp.com"
    password = "Admin123!"
    firstName = "Admin"
    lastName = "User"
    phoneNumber = "+90 555 000 0001"
    address = "Admin Address, Istanbul, Turkey"
} | ConvertTo-Json

try {
    $adminResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $adminData -Headers $headers
    $adminToken = $adminResponse.accessToken
    Write-Host "✅ Admin kullanıcısı oluşturuldu" -ForegroundColor Green
    Write-Host "   Token: $($adminToken.Substring(0,20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Admin kullanıcısı oluşturulamadı: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Seller kullanıcısı
$sellerData = @{
    username = "seller"
    email = "seller@shopapp.com"
    password = "Seller123!"
    firstName = "Seller"
    lastName = "User"
    phoneNumber = "+90 555 000 0002"
    address = "Seller Address, Ankara, Turkey"
} | ConvertTo-Json

try {
    $sellerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $sellerData -Headers $headers
    $sellerToken = $sellerResponse.accessToken
    Write-Host "✅ Seller kullanıcısı oluşturuldu" -ForegroundColor Green
    Write-Host "   Token: $($sellerToken.Substring(0,20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Seller kullanıcısı oluşturulamadı: $($_.Exception.Message)" -ForegroundColor Red
}

# Normal kullanıcı
$userData = @{
    username = "testuser"
    email = "testuser@shopapp.com"
    password = "User123!"
    firstName = "Test"
    lastName = "User"
    phoneNumber = "+90 555 000 0003"
    address = "User Address, Izmir, Turkey"
} | ConvertTo-Json

try {
    $userResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $userData -Headers $headers
    $userToken = $userResponse.accessToken
    Write-Host "✅ Test kullanıcısı oluşturuldu" -ForegroundColor Green
    Write-Host "   Token: $($userToken.Substring(0,20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Test kullanıcısı oluşturulamadı: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. KATEGORİLER
Write-Host "`n📂 Kategorileri oluşturuyor..." -ForegroundColor Yellow

$authHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $adminToken"
}

$categories = @(
    @{ name = "Elektronik"; description = "Elektronik ürünler ve aksesuarlar" },
    @{ name = "Giyim"; description = "Erkek, kadın ve çocuk giyim ürünleri" },
    @{ name = "Ev & Yaşam"; description = "Ev dekorasyonu ve yaşam ürünleri" },
    @{ name = "Spor"; description = "Spor malzemeleri ve fitness ürünleri" },
    @{ name = "Kitap"; description = "Kitaplar ve eğitim materyalleri" }
)

$categoryIds = @()

foreach ($category in $categories) {
    $categoryData = $category | ConvertTo-Json
    try {
        $categoryResponse = Invoke-RestMethod -Uri "$baseUrl/categories" -Method POST -Body $categoryData -Headers $authHeaders
        $categoryIds += $categoryResponse.id
        Write-Host "✅ Kategori oluşturuldu: $($category.name)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Kategori oluşturulamadı ($($category.name)): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 3. ÜRÜNLER
Write-Host "`n📦 Ürünleri oluşturuyor..." -ForegroundColor Yellow

if ($categoryIds.Count -gt 0) {
    $products = @(
        @{ name = "iPhone 15 Pro"; description = "Apple iPhone 15 Pro 256GB"; price = 45000; stockQuantity = 10; categoryId = $categoryIds[0] },
        @{ name = "Samsung Galaxy S24"; description = "Samsung Galaxy S24 Ultra 512GB"; price = 42000; stockQuantity = 8; categoryId = $categoryIds[0] },
        @{ name = "MacBook Air M3"; description = "Apple MacBook Air 13-inch M3 chip"; price = 35000; stockQuantity = 5; categoryId = $categoryIds[0] },
        @{ name = "Nike Air Max"; description = "Nike Air Max 270 Spor Ayakkabı"; price = 2500; stockQuantity = 20; categoryId = $categoryIds[1] },
        @{ name = "Adidas Hoodie"; description = "Adidas Originals Kapüşonlu Sweatshirt"; price = 800; stockQuantity = 15; categoryId = $categoryIds[1] },
        @{ name = "Kahve Makinesi"; description = "Delonghi Otomatik Kahve Makinesi"; price = 3500; stockQuantity = 12; categoryId = $categoryIds[2] },
        @{ name = "Yoga Matı"; description = "Premium Yoga ve Pilates Matı"; price = 150; stockQuantity = 30; categoryId = $categoryIds[3] },
        @{ name = "Dumbbell Set"; description = "Ayarlanabilir Dumbbell Seti 20kg"; price = 1200; stockQuantity = 8; categoryId = $categoryIds[3] },
        @{ name = "JavaScript Kitabı"; description = "Modern JavaScript Geliştirme Rehberi"; price = 120; stockQuantity = 25; categoryId = $categoryIds[4] },
        @{ name = "Python Programlama"; description = "Python ile Veri Bilimi"; price = 95; stockQuantity = 18; categoryId = $categoryIds[4] }
    )

    foreach ($product in $products) {
        $productData = $product | ConvertTo-Json
        try {
            $productResponse = Invoke-RestMethod -Uri "$baseUrl/products" -Method POST -Body $productData -Headers $authHeaders
            Write-Host "✅ Ürün oluşturuldu: $($product.name) - ₺$($product.price)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Ürün oluşturulamadı ($($product.name)): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ Kategori bulunamadı, ürünler oluşturulamadı" -ForegroundColor Red
}

Write-Host "`n🎉 Test verileri yükleme tamamlandı!" -ForegroundColor Green
Write-Host "`n📋 Oluşturulan Kullanıcılar:" -ForegroundColor Cyan
Write-Host "   👑 Admin: admin / Admin123!" -ForegroundColor White
Write-Host "   🛒 Seller: seller / Seller123!" -ForegroundColor White
Write-Host "   👤 User: testuser / User123!" -ForegroundColor White
Write-Host "`n🔗 API Base URL: $baseUrl" -ForegroundColor Cyan
Write-Host "📖 Swagger UI: http://localhost:5128/swagger" -ForegroundColor Cyan
