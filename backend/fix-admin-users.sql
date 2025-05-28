-- Admin Kullanıcıları Düzeltme SQL Script'i

-- 1. Mevcut admin@shopapp.com kullanıcısını admin yap
UPDATE "ApplicationUsers"
SET "UserType" = 'Admin'
WHERE "Id" IN (
    SELECT "Id"
    FROM "Users"
    WHERE "Email" = 'admin@shopapp.com'
);

-- 2. Mevcut testadmin@shopapp.com kullanıcısını admin yap
UPDATE "ApplicationUsers"
SET "UserType" = 'Admin'
WHERE "Id" IN (
    SELECT "Id"
    FROM "Users"
    WHERE "Email" = 'testadmin@shopapp.com'
);

-- 3. Mevcut admin1@shopapp.com kullanıcısını admin yap (eğer varsa)
UPDATE "ApplicationUsers"
SET "UserType" = 'Admin'
WHERE "Id" IN (
    SELECT "Id"
    FROM "Users"
    WHERE "Email" = 'admin1@shopapp.com'
);

-- 4. Mevcut superadmin@shopapp.com kullanıcısını admin yap
UPDATE "ApplicationUsers"
SET "UserType" = 'Admin'
WHERE "Id" IN (
    SELECT "Id"
    FROM "Users"
    WHERE "Email" = 'superadmin@shopapp.com'
);

-- 4. Tüm admin kullanıcıları kontrol et
SELECT
    u."Email",
    u."Username",
    a."UserType",
    a."FirstName",
    a."LastName",
    u."CreatedDate"
FROM "Users" u
JOIN "ApplicationUsers" a ON u."Id" = a."Id"
WHERE a."UserType" = 'Admin'
ORDER BY u."CreatedDate";

-- 5. Tüm kullanıcıları göster (debug için)
SELECT
    u."Email",
    u."Username",
    a."UserType",
    a."FirstName",
    a."LastName"
FROM "Users" u
JOIN "ApplicationUsers" a ON u."Id" = a."Id"
ORDER BY a."UserType" DESC, u."Email";
