USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE sp_LoginUser
    @UserMail VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        UserID,
        UserName,
        UserMail,
        PasswordHash,
        PasswordSalt
    FROM Users
    WHERE UserMail = @UserMail AND IsActive = 1;
END
GO
