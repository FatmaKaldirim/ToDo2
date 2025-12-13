CREATE OR ALTER PROCEDURE todo.sp_DeleteList
    @ListID INT,
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM todo.Lists
    WHERE ListID = @ListID AND UserID = @UserID;
END
GO
