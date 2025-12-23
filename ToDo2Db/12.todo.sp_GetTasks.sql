USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE todo.sp_GetTasks
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        T.TaskID,
        T.TaskName,
        T.TaskContent,
        T.DueDate,
        T.ReminderDate,
        T.IsCompleted,
        T.IsImportant,
        T.RecurrenceType,
        T.CreatedAt,
        T.CompletedAt,
        L.ListName
    FROM todo.Tasks T
    LEFT JOIN todo.Lists L ON T.ListID = L.ListID
    WHERE T.UserID = @UserID
    ORDER BY T.CreatedAt DESC;
END
GO
