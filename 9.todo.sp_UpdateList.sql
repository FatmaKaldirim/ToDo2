CREATE OR ALTER PROCEDURE todo.sp_UpdateList
    @ListID INT,
    @UserID INT,
    @ListName VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1 FROM todo.Lists
        WHERE ListID = @ListID AND UserID = @UserID
    )
    BEGIN
        RAISERROR('Liste bulunamadý veya kullanýcýya ait deðil.', 16, 1);
        RETURN;
    END

    UPDATE todo.Lists
    SET ListName = @ListName
    WHERE ListID = @ListID;
END
GO
