USE ToDo2Db
GO

CREATE OR ALTER TRIGGER todo.trg_TaskCompletedDate
ON todo.Tasks
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE T
    SET CompletedAt = GETDATE()
    FROM todo.Tasks T
    INNER JOIN inserted i ON T.TaskID = i.TaskID
    INNER JOIN deleted d  ON d.TaskID = i.TaskID
    WHERE i.IsCompleted = 1
      AND d.IsCompleted = 0
      AND T.CompletedAt IS NULL;
END;
GO
