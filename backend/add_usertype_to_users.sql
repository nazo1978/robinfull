-- Add UserType column to Users table
ALTER TABLE "Users" ADD COLUMN "UserType" VARCHAR(50) NOT NULL DEFAULT 'User';

-- Update existing admin users
UPDATE "Users" 
SET "UserType" = 'Admin' 
WHERE "Email" IN ('superadmin@shopapp.com', 'testadmin@shopapp.com', 'admin@shopapp.com');

-- Verify the changes
SELECT "Id", "Email", "Username", "UserType" 
FROM "Users" 
WHERE "UserType" = 'Admin';
