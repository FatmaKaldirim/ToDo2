USE ToDo2Db
GO

-- Users tablosuna EmailNotificationsEnabled kolonu ekle
IF NOT EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('Users') 
    AND name = 'EmailNotificationsEnabled'
)
BEGIN
    ALTER TABLE Users
    ADD EmailNotificationsEnabled BIT;
END
GO

-- Mevcut kullanıcılar için varsayılan olarak aktif (ayrı batch)
IF EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('Users') 
    AND name = 'EmailNotificationsEnabled'
)
BEGIN
    UPDATE Users
    SET EmailNotificationsEnabled = 1
    WHERE EmailNotificationsEnabled IS NULL;
END
GO

-- Varsayılan değeri ekle (eğer constraint yoksa)
IF NOT EXISTS (
    SELECT 1 
    FROM sys.default_constraints 
    WHERE name = 'DF_Users_EmailNotificationsEnabled'
)
BEGIN
    ALTER TABLE Users
    ADD CONSTRAINT DF_Users_EmailNotificationsEnabled DEFAULT 1 FOR EmailNotificationsEnabled;
END
GO

