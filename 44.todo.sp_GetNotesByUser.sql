CREATE OR ALTER PROCEDURE todo.sp_GetNotesByUser
    @UserID INT
AS
BEGIN
    SELECT *
    FROM todo.Notes
    WHERE UserID = @UserID
    ORDER BY CreatedAt DESC;
END
