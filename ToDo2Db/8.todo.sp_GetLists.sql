CREATE OR ALTER PROCEDURE todo.sp_GetLists
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ListID,
        ListName,
        CreatedAt
    FROM todo.Lists
    WHERE UserID = @UserID
    ORDER BY CreatedAt DESC;
END
GO
