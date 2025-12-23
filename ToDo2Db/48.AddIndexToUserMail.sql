USE ToDo2Db
GO

-- Add a non-clustered index to the UserMail column in the Users table
-- to speed up login queries.
CREATE NONCLUSTERED INDEX IX_Users_UserMail ON Users(UserMail)
INCLUDE (UserID, UserName, PasswordHash, PasswordSalt, IsActive);
GO