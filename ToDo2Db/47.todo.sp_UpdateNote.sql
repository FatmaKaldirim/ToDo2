USE ToDo2Db;
GO


CREATE OR ALTER PROCEDURE todo.sp_UpdateNote
(
    @NoteID INT,
    @UserID INT,
    @NoteText NVARCHAR(MAX)
)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE todo.Notes
    SET
        NoteText = @NoteText,
        UpdatedAt = GETDATE()
    WHERE NoteID = @NoteID
      AND UserID = @UserID;
END
GO


