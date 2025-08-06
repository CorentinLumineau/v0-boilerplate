-- CreateEnum
CREATE TYPE "ColorTheme" AS ENUM ('DEFAULT', 'RED', 'ORANGE', 'GREEN', 'BLUE', 'TEAL', 'PURPLE', 'PINK');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'FR');

-- CreateEnum
CREATE TYPE "ThemeMode" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "colorTheme" "ColorTheme" NOT NULL DEFAULT 'DEFAULT',
    "language" "Language" NOT NULL DEFAULT 'EN',
    "themeMode" "ThemeMode" NOT NULL DEFAULT 'SYSTEM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Function to map JSON values to enum values
CREATE OR REPLACE FUNCTION map_color_theme(json_value TEXT) RETURNS "ColorTheme" AS $$
BEGIN
    RETURN CASE 
        WHEN UPPER(json_value) = 'RED' THEN 'RED'::"ColorTheme"
        WHEN UPPER(json_value) = 'ORANGE' THEN 'ORANGE'::"ColorTheme"
        WHEN UPPER(json_value) = 'GREEN' THEN 'GREEN'::"ColorTheme"
        WHEN UPPER(json_value) = 'BLUE' THEN 'BLUE'::"ColorTheme"
        WHEN UPPER(json_value) = 'TEAL' THEN 'TEAL'::"ColorTheme"
        WHEN UPPER(json_value) = 'PURPLE' THEN 'PURPLE'::"ColorTheme"
        WHEN UPPER(json_value) = 'PINK' THEN 'PINK'::"ColorTheme"
        ELSE 'DEFAULT'::"ColorTheme"
    END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION map_language(json_value TEXT) RETURNS "Language" AS $$
BEGIN
    RETURN CASE 
        WHEN UPPER(json_value) = 'FR' THEN 'FR'::"Language"
        ELSE 'EN'::"Language"
    END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION map_theme_mode(json_value TEXT) RETURNS "ThemeMode" AS $$
BEGIN
    RETURN CASE 
        WHEN UPPER(json_value) = 'LIGHT' THEN 'LIGHT'::"ThemeMode"
        WHEN UPPER(json_value) = 'DARK' THEN 'DARK'::"ThemeMode"
        ELSE 'SYSTEM'::"ThemeMode"
    END;
END;
$$ LANGUAGE plpgsql;

-- Migrate existing preferences data from JSON field to new table
INSERT INTO "UserPreferences" (id, "userId", "colorTheme", "language", "themeMode", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::TEXT,
    id,
    map_color_theme(COALESCE((preferences->>'colorTheme')::TEXT, 'default')),
    map_language(COALESCE((preferences->>'language')::TEXT, 'en')),
    map_theme_mode(COALESCE((preferences->>'themeMode')::TEXT, 'system')),
    NOW(),
    NOW()
FROM "User"
WHERE preferences IS NOT NULL
ON CONFLICT ("userId") DO NOTHING;

-- Create default preferences for users without any preferences
INSERT INTO "UserPreferences" (id, "userId", "colorTheme", "language", "themeMode", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::TEXT,
    id,
    'DEFAULT'::"ColorTheme",
    'EN'::"Language",
    'SYSTEM'::"ThemeMode",
    NOW(),
    NOW()
FROM "User"
WHERE id NOT IN (SELECT "userId" FROM "UserPreferences")
ON CONFLICT ("userId") DO NOTHING;

-- Clean up helper functions
DROP FUNCTION map_color_theme(TEXT);
DROP FUNCTION map_language(TEXT);
DROP FUNCTION map_theme_mode(TEXT);