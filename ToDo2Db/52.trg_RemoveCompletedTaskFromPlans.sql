USE ToDo2Db
GO

CREATE OR ALTER TRIGGER todo.trg_RemoveCompletedTaskFromPlans
ON todo.Tasks
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Daily
    DELETE DT
    FROM todo.DailyTasks DT
    INNER JOIN inserted i ON DT.TaskID = i.TaskID
    INNER JOIN deleted d  ON d.TaskID  = i.TaskID
    WHERE i.IsCompleted = 1
      AND d.IsCompleted = 0;

    -- Weekly
    DELETE WT
    FROM todo.WeeklyTasks WT
    INNER JOIN inserted i ON WT.TaskID = i.TaskID
    INNER JOIN deleted d  ON d.TaskID  = i.TaskID
    WHERE i.IsCompleted = 1
      AND d.IsCompleted = 0;

    -- Monthly
    DELETE MT
    FROM todo.MonthlyTasks MT
    INNER JOIN inserted i ON MT.TaskID = i.TaskID
    INNER JOIN deleted d  ON d.TaskID  = i.TaskID
    WHERE i.IsCompleted = 1
      AND d.IsCompleted = 0;
END;
GO
