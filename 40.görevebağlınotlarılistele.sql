CREATE OR ALTER PROCEDURE todo.sp_GetNotesByTask
(
    @TaskID INT
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        NoteID,
        NoteText,
        CreatedAt
    FROM todo.Notes
    WHERE TaskID = @TaskID
    ORDER BY CreatedAt DESC;
END
GO
