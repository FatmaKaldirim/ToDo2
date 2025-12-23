USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE todo.sp_DeleteTask
    @TaskID INT,
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM todo.Tasks
    WHERE TaskID = @TaskID AND UserID = @UserID;
END
GO
