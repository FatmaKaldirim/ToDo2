USE ToDo2Db
GO

-- Kullanıcının email bildirim ayarını güncelleme stored procedure
-- ÖNEMLİ: Bu script'i çalıştırmadan önce 55.AddEmailNotifications.sql scriptini çalıştırın!

-- Eski stored procedure'u sil (varsa)
IF EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'sp_UpdateUserEmailNotifications' AND type = 'P')
BEGIN
    DROP PROCEDURE sp_UpdateUserEmailNotifications;
END
GO

-- Stored procedure'u oluştur
CREATE PROCEDURE sp_UpdateUserEmailNotifications
    @UserID INT,
    @EmailNotificationsEnabled BIT
AS
BEGIN
    SET NOCOUNT ON;

    -- Kolon kontrolü (runtime'da)
    IF NOT EXISTS (
        SELECT 1 
        FROM sys.columns 
        WHERE object_id = OBJECT_ID('Users') 
        AND name = 'EmailNotificationsEnabled'
    )
    BEGIN
        RAISERROR('EmailNotificationsEnabled kolonu bulunamadı. Önce 55.AddEmailNotifications.sql scriptini çalıştırın.', 16, 1);
        RETURN;
    END

    -- Kullanıcı kontrolü
    IF NOT EXISTS (SELECT 1 FROM Users WHERE UserID = @UserID)
    BEGIN
        RAISERROR('Kullanıcı bulunamadı.', 16, 1);
        RETURN;
    END

    -- Güncelleme
    UPDATE Users
    SET EmailNotificationsEnabled = @EmailNotificationsEnabled
    WHERE UserID = @UserID;

    SELECT @EmailNotificationsEnabled AS EmailNotificationsEnabled;
END
GO

