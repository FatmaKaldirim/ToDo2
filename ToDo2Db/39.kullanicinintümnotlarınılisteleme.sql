use ToDo2Db
go 

CREATE OR ALTER PROCEDURE todo.sp_GetNotesByUser
(
    @UserID INT
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        NoteID,
        TaskID,
        NoteText,
        CreatedAt
    FROM todo.Notes
    WHERE UserID = @UserID
    ORDER BY CreatedAt DESC;
END
GO
