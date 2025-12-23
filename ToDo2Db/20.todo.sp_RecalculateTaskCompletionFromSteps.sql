USE ToDo2Db
GO
--tüm stepler bittiyse taski otomatik tamamlar
CREATE OR ALTER PROCEDURE todo.sp_RecalculateTaskCompletionFromSteps
    @TaskID INT,
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Task kullanýcýya ait mi?
    IF NOT EXISTS (
        SELECT 1 FROM todo.Tasks
        WHERE TaskID = @TaskID AND UserID = @UserID
    )
    BEGIN
        RAISERROR('Bu task size ait deðil.', 16, 1);
        RETURN;
    END

    -- Hiç step kalmadýysa veya tamamlanmamýþ step yoksa: task completed
    IF NOT EXISTS (
        SELECT 1 FROM todo.Steps
        WHERE TaskID = @TaskID AND IsCompleted = 0
    )
    BEGIN
        UPDATE todo.Tasks
        SET IsCompleted = 1,
            CompletedAt = ISNULL(CompletedAt, GETDATE())
        WHERE TaskID = @TaskID AND UserID = @UserID;
    END
END
GO
