USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE todo.sp_GetStepsByTask
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

    SELECT
        StepID,
        TaskID,
        StepText,
        IsCompleted,
        CreatedAt
    FROM todo.Steps
    WHERE TaskID = @TaskID
    ORDER BY CreatedAt ASC;
END
GO
