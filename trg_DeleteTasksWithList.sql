CREATE OR ALTER TRIGGER trg_DeleteTasksWithList
ON Lists
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Plan tablolarýný temizle
    DELETE DT
    FROM DailyTasks DT
    INNER JOIN Tasks T ON DT.TaskID = T.TaskID
    INNER JOIN deleted d ON T.ListID = d.ListID;

    DELETE WT
    FROM WeeklyTasks WT
    INNER JOIN Tasks T ON WT.TaskID = T.TaskID
    INNER JOIN deleted d ON T.ListID = d.ListID;

    DELETE MT
    FROM MonthlyTasks MT
    INNER JOIN Tasks T ON MT.TaskID = T.TaskID
    INNER JOIN deleted d ON T.ListID = d.ListID;

    -- Görevleri sil
    DELETE T
    FROM Tasks T
    INNER JOIN deleted d ON T.ListID = d.ListID;
END;
GO
