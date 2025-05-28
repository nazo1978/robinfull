-- Mevcut ürünlere default image URL'leri ekle
UPDATE "Products" 
SET 
  "ImageUrl" = 'https://picsum.photos/400/300?random=' || "Id",
  "ImageAlt" = "Name" || ' ürün resmi'
WHERE "ImageUrl" = '' OR "ImageUrl" IS NULL;

-- Kontrol sorgusu
SELECT "Id", "Name", "ImageUrl", "ImageAlt", "Price", "StockQuantity" FROM "Products" ORDER BY "CreatedDate" LIMIT 10;
