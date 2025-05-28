-- Mevcut kategorileri aktif hale getir
UPDATE "Categories" SET "IsActive" = true WHERE "IsActive" = false;

-- Kontrol sorgusu
SELECT "Id", "Name", "IsActive", "CreatedDate" FROM "Categories" ORDER BY "CreatedDate";
