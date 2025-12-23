CREATE OR ALTER TRIGGER trg_TaskCompletedDate
ON Tasks
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE T
    SET CompletedAt = GETDATE()
    FROM Tasks T
    INNER JOIN inserted i ON T.TaskID = i.TaskID
    INNER JOIN deleted d ON d.TaskID = i.TaskID
    WHERE i.IsCompleted = 1
      AND d.IsCompleted = 0
      AND T.CompletedAt IS NULL;
END;
GO
