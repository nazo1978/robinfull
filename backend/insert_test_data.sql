-- Test kategorileri ekleme (sadece yoksa ekle)
INSERT INTO "Categories" ("Id", "Name", "Description", "CreatedDate", "ModifiedDate")
SELECT gen_random_uuid(), 'Elektronik', 'Elektronik ürünler kategorisi', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Categories" WHERE "Name" = 'Elektronik');

INSERT INTO "Categories" ("Id", "Name", "Description", "CreatedDate", "ModifiedDate")
SELECT gen_random_uuid(), 'Giyim', 'Giyim ve aksesuar ürünleri', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Categories" WHERE "Name" = 'Giyim');

INSERT INTO "Categories" ("Id", "Name", "Description", "CreatedDate", "ModifiedDate")
SELECT gen_random_uuid(), 'Ev & Yaşam', 'Ev ve yaşam ürünleri', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Categories" WHERE "Name" = 'Ev & Yaşam');

INSERT INTO "Categories" ("Id", "Name", "Description", "CreatedDate", "ModifiedDate")
SELECT gen_random_uuid(), 'Spor', 'Spor ve outdoor ürünleri', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Categories" WHERE "Name" = 'Spor');

INSERT INTO "Categories" ("Id", "Name", "Description", "CreatedDate", "ModifiedDate")
SELECT gen_random_uuid(), 'Kitap', 'Kitap ve kırtasiye ürünleri', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Categories" WHERE "Name" = 'Kitap');

-- Test ürünleri ekleme
-- Elektronik kategorisi ürünleri
INSERT INTO "Products" ("Id", "Name", "Description", "Price", "StockQuantity", "CategoryId", "CreatedDate", "ModifiedDate")
SELECT
    gen_random_uuid(),
    'iPhone 15 Pro',
    'Apple iPhone 15 Pro 256GB Doğal Titanyum',
    45999.00,
    25,
    c."Id",
    NOW(),
    NOW()
FROM "Categories" c
WHERE c."Name" = 'Elektronik'
AND NOT EXISTS (SELECT 1 FROM "Products" WHERE "Name" = 'iPhone 15 Pro');

INSERT INTO "Products" ("Id", "Name", "Description", "Price", "StockQuantity", "CategoryId", "CreatedDate", "ModifiedDate")
SELECT
    gen_random_uuid(),
    'Samsung Galaxy S24 Ultra',
    'Samsung Galaxy S24 Ultra 512GB Titanyum Gri',
    42999.00,
    30,
    c."Id",
    NOW(),
    NOW()
FROM "Categories" c
WHERE c."Name" = 'Elektronik'
AND NOT EXISTS (SELECT 1 FROM "Products" WHERE "Name" = 'Samsung Galaxy S24 Ultra');

INSERT INTO "Products" ("Id", "Name", "Description", "Price", "StockQuantity", "CategoryId", "CreatedDate", "ModifiedDate")
SELECT
    gen_random_uuid(),
    'MacBook Air M3',
    'Apple MacBook Air 13" M3 Çip 8GB RAM 256GB SSD',
    34999.00,
    15,
    c."Id",
    NOW(),
    NOW()
FROM "Categories" c
WHERE c."Name" = 'Elektronik'
AND NOT EXISTS (SELECT 1 FROM "Products" WHERE "Name" = 'MacBook Air M3');

-- Giyim kategorisi ürünleri
INSERT INTO "Products" ("Id", "Name", "Description", "Price", "StockQuantity", "CategoryId", "CreatedDate", "ModifiedDate")
SELECT
    gen_random_uuid(),
    'Nike Air Max 270',
    'Nike Air Max 270 Erkek Spor Ayakkabı',
    2499.00,
    50,
    c."Id",
    NOW(),
    NOW()
FROM "Categories" c
WHERE c."Name" = 'Giyim'
AND NOT EXISTS (SELECT 1 FROM "Products" WHERE "Name" = 'Nike Air Max 270');

INSERT INTO "Products" ("Id", "Name", "Description", "Price", "StockQuantity", "CategoryId", "CreatedDate", "ModifiedDate")
SELECT
    gen_random_uuid(),
    'Levi''s 501 Jean',
    'Levi''s 501 Original Fit Erkek Jean Pantolon',
    899.00,
    75,
    c."Id",
    NOW(),
    NOW()
FROM "Categories" c
WHERE c."Name" = 'Giyim'
AND NOT EXISTS (SELECT 1 FROM "Products" WHERE "Name" = 'Levi''s 501 Jean');

-- Ev & Yaşam kategorisi ürünleri
INSERT INTO "Products" ("Id", "Name", "Description", "Price", "StockQuantity", "CategoryId", "CreatedDate", "ModifiedDate")
SELECT
    gen_random_uuid(),
    'Dyson V15 Detect',
    'Dyson V15 Detect Kablosuz Süpürge',
    8999.00,
    20,
    c."Id",
    NOW(),
    NOW()
FROM "Categories" c
WHERE c."Name" = 'Ev & Yaşam'
AND NOT EXISTS (SELECT 1 FROM "Products" WHERE "Name" = 'Dyson V15 Detect');

-- Spor kategorisi ürünleri
INSERT INTO "Products" ("Id", "Name", "Description", "Price", "StockQuantity", "CategoryId", "CreatedDate", "ModifiedDate")
SELECT
    gen_random_uuid(),
    'Adidas Ultraboost 22',
    'Adidas Ultraboost 22 Koşu Ayakkabısı',
    3299.00,
    40,
    c."Id",
    NOW(),
    NOW()
FROM "Categories" c
WHERE c."Name" = 'Spor'
AND NOT EXISTS (SELECT 1 FROM "Products" WHERE "Name" = 'Adidas Ultraboost 22');

-- Kitap kategorisi ürünleri
INSERT INTO "Products" ("Id", "Name", "Description", "Price", "StockQuantity", "CategoryId", "CreatedDate", "ModifiedDate")
SELECT
    gen_random_uuid(),
    'Clean Code',
    'Robert C. Martin - Clean Code: A Handbook of Agile Software Craftsmanship',
    299.00,
    100,
    c."Id",
    NOW(),
    NOW()
FROM "Categories" c
WHERE c."Name" = 'Kitap'
AND NOT EXISTS (SELECT 1 FROM "Products" WHERE "Name" = 'Clean Code');

-- Kategorileri ve ürünleri kontrol et
SELECT 'Kategoriler:' as info;
SELECT * FROM "Categories";

SELECT 'Ürünler:' as info;
SELECT p."Name", p."Price", p."StockQuantity", c."Name" as "CategoryName"
FROM "Products" p
JOIN "Categories" c ON p."CategoryId" = c."Id";
