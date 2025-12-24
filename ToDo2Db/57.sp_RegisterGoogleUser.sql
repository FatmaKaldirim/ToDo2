USE ToDo2Db
GO

-- Google ile giriş yapan kullanıcılar için kayıt stored procedure
-- (Şifre olmadan)
CREATE OR ALTER PROCEDURE sp_RegisterGoogleUser
    @UserName VARCHAR(100),
    @UserMail VARCHAR(100),
    @PasswordHash VARBINARY(64) = NULL,
    @PasswordSalt VARBINARY(128) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Email kontrol
    IF EXISTS (SELECT 1 FROM Users WHERE UserMail = @UserMail)
    BEGIN
        -- Kullanıcı zaten varsa ID'sini döndür
        SELECT UserID AS Result FROM Users WHERE UserMail = @UserMail;
        RETURN;
    END

    -- Yeni kullanıcı oluştur
    INSERT INTO Users (UserName, UserMail, PasswordHash, PasswordSalt)
    VALUES (@UserName, @UserMail, @PasswordHash, @PasswordSalt);

    SELECT SCOPE_IDENTITY() AS Result;
END
GO

