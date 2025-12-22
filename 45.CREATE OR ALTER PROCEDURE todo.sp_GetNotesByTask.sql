CREATE OR ALTER PROCEDURE todo.sp_GetNotesByTask
    @UserID INT,
    @TaskID INT
AS
BEGIN
    SELECT *
    FROM todo.Notes
    WHERE UserID = @UserID AND TaskID = @TaskID
    ORDER BY CreatedAt DESC;
END
