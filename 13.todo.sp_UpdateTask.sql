USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE todo.sp_UpdateTask
    @TaskID INT,
    @UserID INT,
    @TaskName VARCHAR(200) = NULL,
    @TaskContent VARCHAR(500) = NULL,
    @DueDate DATETIME = NULL,
    @ReminderDate DATETIME = NULL,
    @IsCompleted BIT = NULL,
    @IsImportant BIT = NULL,
    @RecurrenceType VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1 FROM todo.Tasks
        WHERE TaskID = @TaskID AND UserID = @UserID
    )
    BEGIN
        RAISERROR('Görev bulunamadý veya kullanýcýya ait deðil.', 16, 1);
        RETURN;
    END

    UPDATE todo.Tasks
    SET
        TaskName       = ISNULL(@TaskName, TaskName),
        TaskContent    = ISNULL(@TaskContent, TaskContent),
        DueDate        = ISNULL(@DueDate, DueDate),
        ReminderDate   = ISNULL(@ReminderDate, ReminderDate),
        IsImportant    = ISNULL(@IsImportant, IsImportant),
        RecurrenceType = ISNULL(@RecurrenceType, RecurrenceType),
        IsCompleted    = ISNULL(@IsCompleted, IsCompleted),
        CompletedAt    = CASE
                            WHEN @IsCompleted = 1 THEN GETDATE()
                            ELSE CompletedAt
                         END
    WHERE TaskID = @TaskID AND UserID = @UserID;
END
GO
