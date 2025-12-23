USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE sp_RegisterUser
    @UserName VARCHAR(100),
    @UserMail VARCHAR(100),
    @PasswordHash VARBINARY(64),
    @PasswordSalt VARBINARY(128)
AS
BEGIN
    SET NOCOUNT ON;

    -- Email kontrol
    IF EXISTS (SELECT 1 FROM Users WHERE UserMail = @UserMail)
    BEGIN
        SELECT -1 AS Result;
        RETURN;
    END

    INSERT INTO Users (UserName, UserMail, PasswordHash, PasswordSalt)
    VALUES (@UserName, @UserMail, @PasswordHash, @PasswordSalt);

    SELECT SCOPE_IDENTITY() AS Result;
END
GO
