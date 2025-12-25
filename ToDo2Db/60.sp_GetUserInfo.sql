USE ToDo2Db
GO

-- Kullanıcı bilgilerini getir
CREATE OR ALTER PROCEDURE sp_GetUserInfo
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        UserID,
        UserName,
        UserMail,
        CreatedAt,
        IsActive
    FROM Users
    WHERE UserID = @UserID
      AND IsActive = 1;
END
GO

