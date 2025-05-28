-- Mevcut ürünleri aktif hale getir
UPDATE "Products" SET "IsActive" = true WHERE "IsActive" = false;

-- Kontrol sorgusu
SELECT "Id", "Name", "IsActive", "Price", "StockQuantity", "CreatedDate" FROM "Products" ORDER BY "CreatedDate";
