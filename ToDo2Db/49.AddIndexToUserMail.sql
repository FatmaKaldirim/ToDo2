IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_Users_UserMail'
      AND object_id = OBJECT_ID('dbo.Users')
)
BEGIN
    CREATE INDEX IX_Users_UserMail
    ON dbo.Users(UserMail);
END