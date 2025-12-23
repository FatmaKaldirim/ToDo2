CREATE OR ALTER PROCEDURE todo.sp_AddList
    @UserID INT,
    @ListName VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO todo.Lists (UserID, ListName)
    VALUES (@UserID, @ListName);

    SELECT SCOPE_IDENTITY() AS NewListID;
END
GO
