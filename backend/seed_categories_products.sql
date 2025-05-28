-- Önce mevcut test verilerini temizle
DELETE FROM "Products" WHERE "Name" LIKE '%Test%' OR "Name" LIKE '%iPhone%' OR "Name" LIKE '%Samsung%';
DELETE FROM "Categories" WHERE "Name" IN ('Test Category', 'Elektronik', 'Giyim', 'Ev & Yaşam', 'Spor & Outdoor', 'Kitap & Medya');

-- Kategoriler ekle
INSERT INTO "Categories" ("Id", "Name", "Description", "CreatedDate", "ModifiedDate") VALUES
('a1111111-1111-1111-1111-111111111111', 'Elektronik', 'Elektronik ürünler ve aksesuarlar', NOW(), NOW()),
('b2222222-2222-2222-2222-222222222222', 'Giyim', 'Kadın, erkek ve çocuk giyim ürünleri', NOW(), NOW()),
('c3333333-3333-3333-3333-333333333333', 'Ev & Yaşam', 'Ev dekorasyonu ve yaşam ürünleri', NOW(), NOW()),
('d4444444-4444-4444-4444-444444444444', 'Spor & Outdoor', 'Spor malzemeleri ve outdoor ürünler', NOW(), NOW()),
('e5555555-5555-5555-5555-555555555555', 'Kitap & Medya', 'Kitaplar, dergiler ve medya ürünleri', NOW(), NOW());

-- Ürünler ekle
INSERT INTO "Products" ("Id", "Name", "Description", "Price", "StockQuantity", "CategoryId", "CreatedDate", "ModifiedDate") VALUES
-- Elektronik ürünleri
('f1111111-1111-1111-1111-111111111111', 'iPhone 15 Pro', 'Apple iPhone 15 Pro 128GB', 45999.99, 50, 'a1111111-1111-1111-1111-111111111111', NOW(), NOW()),
('f2222222-2222-2222-2222-222222222222', 'Samsung Galaxy S24', 'Samsung Galaxy S24 256GB', 38999.99, 30, 'a1111111-1111-1111-1111-111111111111', NOW(), NOW()),
('f3333333-3333-3333-3333-333333333333', 'MacBook Air M3', 'Apple MacBook Air 13" M3 Chip', 52999.99, 20, 'a1111111-1111-1111-1111-111111111111', NOW(), NOW()),
('f4444444-4444-4444-4444-444444444444', 'AirPods Pro', 'Apple AirPods Pro 2. Nesil', 8999.99, 100, 'a1111111-1111-1111-1111-111111111111', NOW(), NOW()),

-- Giyim ürünleri
('f5555555-5555-5555-5555-555555555555', 'Nike Air Max', 'Nike Air Max 270 Spor Ayakkabı', 3499.99, 75, 'b2222222-2222-2222-2222-222222222222', NOW(), NOW()),
('f6666666-6666-6666-6666-666666666666', 'Levi''s 501 Jean', 'Levi''s 501 Original Fit Jean', 1299.99, 60, 'b2222222-2222-2222-2222-222222222222', NOW(), NOW()),
('f7777777-7777-7777-7777-777777777777', 'Adidas Hoodie', 'Adidas Essentials Kapüşonlu Sweatshirt', 899.99, 40, 'b2222222-2222-2222-2222-222222222222', NOW(), NOW()),

-- Ev & Yaşam ürünleri
('f8888888-8888-8888-8888-888888888888', 'IKEA Masa Lambası', 'Modern LED masa lambası', 299.99, 80, 'c3333333-3333-3333-3333-333333333333', NOW(), NOW()),
('f9999999-9999-9999-9999-999999999999', 'Kahve Makinesi', 'Otomatik espresso kahve makinesi', 2499.99, 25, 'c3333333-3333-3333-3333-333333333333', NOW(), NOW()),
('fa111111-a111-a111-a111-a11111111111', 'Dekoratif Vazo', 'Handmade seramik vazo', 199.99, 35, 'c3333333-3333-3333-3333-333333333333', NOW(), NOW()),

-- Spor & Outdoor ürünleri
('fb222222-b222-b222-b222-b22222222222', 'Yoga Matı', 'Premium yoga ve pilates matı', 149.99, 90, 'd4444444-4444-4444-4444-444444444444', NOW(), NOW()),
('fc333333-c333-c333-c333-c33333333333', 'Dumbbell Set', '2x10kg ayarlanabilir dumbbell', 799.99, 15, 'd4444444-4444-4444-4444-444444444444', NOW(), NOW()),

-- Kitap & Medya ürünleri
('fd444444-d444-d444-d444-d44444444444', 'Sapiens', 'Yuval Noah Harari - Sapiens', 89.99, 120, 'e5555555-5555-5555-5555-555555555555', NOW(), NOW()),
('fe555555-e555-e555-e555-e55555555555', 'Atomic Habits', 'James Clear - Atomic Habits', 79.99, 95, 'e5555555-5555-5555-5555-555555555555', NOW(), NOW());

-- Kontrol sorgusu
SELECT
    c."Name" as "Kategori",
    COUNT(p."Id") as "Ürün Sayısı"
FROM "Categories" c
LEFT JOIN "Products" p ON c."Id" = p."CategoryId"
GROUP BY c."Id", c."Name"
ORDER BY c."Name";
