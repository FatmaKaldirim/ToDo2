use ToDo2Db
go 


CREATE OR ALTER PROCEDURE todo.sp_AddNote
    @UserID INT,
    @TaskID INT = NULL,
    @NoteText NVARCHAR(1000)
AS
BEGIN
    INSERT INTO todo.Notes (UserID, TaskID, NoteText)
    VALUES (@UserID, @TaskID, @NoteText);
END
