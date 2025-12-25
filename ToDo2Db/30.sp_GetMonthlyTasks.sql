USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE todo.sp_GetMonthlyTasks
    @UserId INT,
    @IncludePast BIT = 0  -- 0 = sadece gelecek, 1 = tümü (geçmiş + gelecek)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        mt.MonthlyTaskID AS MonthlyTaskId,
        mt.TaskID AS TaskId,
        mt.MonthStartDate AS MonthDate,
        t.TaskName,
        t.TaskContent,
        t.IsImportant,
        t.IsCompleted,
        t.DueDate,
        t.ReminderDate,
        t.CompletedAt
    FROM todo.MonthlyTasks mt
    INNER JOIN todo.Tasks t ON mt.TaskID = t.TaskID
    WHERE t.UserID = @UserId
      AND t.IsCompleted = 0
      AND (@IncludePast = 1 OR mt.MonthStartDate >= CAST(GETDATE() AS DATE))
    ORDER BY mt.MonthStartDate DESC;
END;
GO
