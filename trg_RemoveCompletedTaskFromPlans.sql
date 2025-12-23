CREATE OR ALTER TRIGGER trg_RemoveCompletedTaskFromPlans
ON Tasks
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    DELETE DT
    FROM DailyTasks DT
    INNER JOIN inserted i ON DT.TaskID = i.TaskID
    INNER JOIN deleted d ON d.TaskID = i.TaskID
    WHERE i.IsCompleted = 1
      AND d.IsCompleted = 0;

    DELETE WT
    FROM WeeklyTasks WT
    INNER JOIN inserted i ON WT.TaskID = i.TaskID
    INNER JOIN deleted d ON d.TaskID = i.TaskID
    WHERE i.IsCompleted = 1
      AND d.IsCompleted = 0;

    DELETE MT
    FROM MonthlyTasks MT
    INNER JOIN inserted i ON MT.TaskID = i.TaskID
    INNER JOIN deleted d ON d.TaskID = i.TaskID
    WHERE i.IsCompleted = 1
      AND d.IsCompleted = 0;
END;
GO
