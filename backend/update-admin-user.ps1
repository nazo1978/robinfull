# Admin Kullanıcı Güncelleme Script'i
# Bu script mevcut kullanıcıları admin yapar ve yeni test admin oluşturur

Write-Host "🔧 Admin Kullanıcı Güncelleme Script'i Başlatılıyor..." -ForegroundColor Green

# PostgreSQL bağlantı bilgileri
$connectionString = "Server=localhost;Database=ShopAppDb;Trusted_Connection=true;TrustServerCertificate=true;"

try {
    # .NET PostgreSQL provider'ı yükle
    Add-Type -Path "C:\Users\$env:USERNAME\.nuget\packages\npgsql\6.0.11\lib\net6.0\Npgsql.dll"
    
    Write-Host "📡 PostgreSQL'e bağlanılıyor..." -ForegroundColor Yellow
    
    # Bağlantı oluştur
    $connection = New-Object Npgsql.NpgsqlConnection($connectionString)
    $connection.Open()
    
    Write-Host "✅ PostgreSQL bağlantısı başarılı!" -ForegroundColor Green
    
    # 1. Mevcut admin@shopapp.com kullanıcısını admin yap
    Write-Host "🔄 Mevcut admin@shopapp.com kullanıcısı admin yapılıyor..." -ForegroundColor Yellow
    
    $updateAdminQuery = @"
UPDATE "ApplicationUsers" 
SET "UserType" = 'Admin' 
WHERE "Id" IN (
    SELECT "Id" 
    FROM "Users" 
    WHERE "Email" = 'admin@shopapp.com'
);
"@
    
    $updateCommand = New-Object Npgsql.NpgsqlCommand($updateAdminQuery, $connection)
    $rowsAffected = $updateCommand.ExecuteNonQuery()
    
    if ($rowsAffected -gt 0) {
        Write-Host "✅ admin@shopapp.com kullanıcısı başarıyla admin yapıldı!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ admin@shopapp.com kullanıcısı bulunamadı veya zaten admin!" -ForegroundColor Yellow
    }
    
    # 2. Mevcut kullanıcıları kontrol et
    Write-Host "📋 Mevcut admin kullanıcıları kontrol ediliyor..." -ForegroundColor Yellow
    
    $checkQuery = @"
SELECT u."Email", u."Username", a."UserType", a."FirstName", a."LastName"
FROM "Users" u
JOIN "ApplicationUsers" a ON u."Id" = a."Id"
WHERE a."UserType" = 'Admin';
"@
    
    $checkCommand = New-Object Npgsql.NpgsqlCommand($checkQuery, $connection)
    $reader = $checkCommand.ExecuteReader()
    
    Write-Host "📊 Admin Kullanıcıları:" -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    
    $adminCount = 0
    while ($reader.Read()) {
        $adminCount++
        $email = $reader["Email"]
        $username = $reader["Username"]
        $userType = $reader["UserType"]
        $firstName = $reader["FirstName"]
        $lastName = $reader["LastName"]
        
        Write-Host "👤 $firstName $lastName" -ForegroundColor White
        Write-Host "   📧 Email: $email" -ForegroundColor Gray
        Write-Host "   👤 Username: $username" -ForegroundColor Gray
        Write-Host "   🔑 UserType: $userType" -ForegroundColor Gray
        Write-Host "----------------------------------------" -ForegroundColor Cyan
    }
    
    $reader.Close()
    
    if ($adminCount -eq 0) {
        Write-Host "⚠️ Hiç admin kullanıcısı bulunamadı!" -ForegroundColor Red
    } else {
        Write-Host "✅ Toplam $adminCount admin kullanıcısı bulundu!" -ForegroundColor Green
    }
    
    # 3. Yeni test admin oluştur (eğer yoksa)
    Write-Host "🆕 Yeni test admin kullanıcısı kontrol ediliyor..." -ForegroundColor Yellow
    
    $testAdminEmail = "testadmin@shopapp.com"
    
    # Test admin var mı kontrol et
    $checkTestAdminQuery = @"
SELECT COUNT(*) FROM "Users" WHERE "Email" = '$testAdminEmail';
"@
    
    $checkTestAdminCommand = New-Object Npgsql.NpgsqlCommand($checkTestAdminQuery, $connection)
    $testAdminExists = $checkTestAdminCommand.ExecuteScalar()
    
    if ($testAdminExists -eq 0) {
        Write-Host "🔄 Test admin kullanıcısı oluşturuluyor..." -ForegroundColor Yellow
        Write-Host "📧 Email: $testAdminEmail" -ForegroundColor Gray
        Write-Host "🔑 Password: TestAdmin123!" -ForegroundColor Gray
        Write-Host "" -ForegroundColor Gray
        Write-Host "⚠️ Bu kullanıcıyı Swagger'da manuel olarak oluşturmanız gerekiyor:" -ForegroundColor Yellow
        Write-Host "" -ForegroundColor Gray
        Write-Host "POST /api/Auth/register endpoint'ini kullanın:" -ForegroundColor Cyan
        Write-Host @"
{
  "username": "testadmin",
  "email": "testadmin@shopapp.com",
  "password": "TestAdmin123!",
  "firstName": "Test",
  "lastName": "Admin",
  "phoneNumber": "+90 555 000 0002"
}
"@ -ForegroundColor White
    } else {
        Write-Host "✅ Test admin kullanıcısı zaten mevcut!" -ForegroundColor Green
    }
    
    # Bağlantıyı kapat
    $connection.Close()
    
    Write-Host "" -ForegroundColor Gray
    Write-Host "🎉 Script başarıyla tamamlandı!" -ForegroundColor Green
    Write-Host "" -ForegroundColor Gray
    Write-Host "📋 Sonraki Adımlar:" -ForegroundColor Cyan
    Write-Host "1. Frontend'te admin@shopapp.com ile login test edin" -ForegroundColor White
    Write-Host "2. Eğer test admin yoksa Swagger'da oluşturun" -ForegroundColor White
    Write-Host "3. Console log'larında admin role kontrolü yapın" -ForegroundColor White
    
} catch {
    Write-Host "❌ Hata oluştu: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 PostgreSQL'in çalıştığından ve bağlantı bilgilerinin doğru olduğundan emin olun." -ForegroundColor Yellow
}

Write-Host "" -ForegroundColor Gray
Write-Host "Script tamamlandı. Herhangi bir tuşa basın..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
