USE ToDo2Db
GO

CREATE OR ALTER TRIGGER todo.trg_DeleteTasksWithList
ON todo.Lists
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Daily Plans
    DELETE DT
    FROM todo.DailyTasks DT
    INNER JOIN todo.Tasks T   ON DT.TaskID = T.TaskID
    INNER JOIN deleted d      ON T.ListID  = d.ListID;

    -- Weekly Plans
    DELETE WT
    FROM todo.WeeklyTasks WT
    INNER JOIN todo.Tasks T   ON WT.TaskID = T.TaskID
    INNER JOIN deleted d      ON T.ListID  = d.ListID;

    -- Monthly Plans
    DELETE MT
    FROM todo.MonthlyTasks MT
    INNER JOIN todo.Tasks T   ON MT.TaskID = T.TaskID
    INNER JOIN deleted d      ON T.ListID  = d.ListID;

    -- Tasks
    DELETE T
    FROM todo.Tasks T
    INNER JOIN deleted d ON T.ListID = d.ListID;
END;
GO
