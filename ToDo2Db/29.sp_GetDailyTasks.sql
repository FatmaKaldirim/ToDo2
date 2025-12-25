USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE todo.sp_GetDailyTasks
    @UserId INT,
    @IncludePast BIT = 0  -- 0 = sadece gelecek, 1 = tümü (geçmiş + gelecek)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        dt.DailyTaskID,
        dt.TaskID,
        dt.PlanDate AS TaskDate,
        t.TaskName,
        t.TaskContent,
        t.IsImportant,
        t.IsCompleted,
        t.DueDate,
        t.ReminderDate,
        t.CompletedAt
    FROM todo.DailyTasks dt
    INNER JOIN todo.Tasks t ON dt.TaskID = t.TaskID
    WHERE t.UserID = @UserId
      AND t.IsCompleted = 0
      AND (@IncludePast = 1 OR dt.PlanDate >= CAST(GETDATE() AS DATE))
    ORDER BY dt.PlanDate DESC;
END;
GO
