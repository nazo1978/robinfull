UPDATE "Users"
SET "UserType" = 'Admin'
WHERE "Email" IN ('superadmin@shopapp.com', 'testadmin@shopapp.com', 'admin@shopapp.com');

SELECT "Email", "Username", "UserType"
FROM "Users"
WHERE "UserType" = 'Admin';
