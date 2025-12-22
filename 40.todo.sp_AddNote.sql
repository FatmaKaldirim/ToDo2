CREATE OR ALTER PROCEDURE todo.sp_AddNote
(
    @UserID   INT,
    @TaskID   INT = NULL,
    @NoteText NVARCHAR(500)
)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO todo.Notes (UserID, TaskID, NoteText)
    VALUES (@UserID, @TaskID, @NoteText);
END
GO
