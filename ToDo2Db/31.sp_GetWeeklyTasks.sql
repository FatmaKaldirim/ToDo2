USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE todo.sp_GetWeeklyTasks
    @UserId INT,
    @IncludePast BIT = 0  -- 0 = sadece gelecek, 1 = tümü (geçmiş + gelecek)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        wt.WeeklyTaskID AS WeeklyTaskId,
        wt.TaskID AS TaskId,
        wt.WeekStartDate,
        t.TaskName,
        t.TaskContent,
        t.IsImportant,
        t.IsCompleted,
        t.DueDate,
        t.ReminderDate,
        t.CompletedAt
    FROM todo.WeeklyTasks wt
    INNER JOIN todo.Tasks t ON wt.TaskID = t.TaskID
    WHERE t.UserID = @UserId
      AND t.IsCompleted = 0
      AND (@IncludePast = 1 OR wt.WeekStartDate >= CAST(GETDATE() AS DATE))
    ORDER BY wt.WeekStartDate DESC;
END;
GO
