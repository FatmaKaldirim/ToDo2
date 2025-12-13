USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE todo.sp_SearchTasks
    @UserID INT,
    @Keyword VARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TaskID,
        TaskName,
        TaskContent,
        IsCompleted,
        IsImportant,
        RecurrenceType,
        CreatedAt
    FROM todo.Tasks
    WHERE UserID = @UserID
      AND (
            TaskName LIKE '%' + @Keyword + '%'
         OR TaskContent LIKE '%' + @Keyword + '%'
      )
    ORDER BY CreatedAt DESC;
END
GO
