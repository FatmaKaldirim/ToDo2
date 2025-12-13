USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE todo.sp_AddStep
    @TaskID INT,
    @UserID INT,
    @StepText VARCHAR(300)
AS
BEGIN
    SET NOCOUNT ON;

    -- Task kullanýcýya ait mi?
    IF NOT EXISTS (
        SELECT 1 FROM todo.Tasks
        WHERE TaskID = @TaskID AND UserID = @UserID
    )
    BEGIN
        RAISERROR('Bu göreve step ekleyemezsiniz (task size ait deðil).', 16, 1);
        RETURN;
    END

    INSERT INTO todo.Steps (TaskID, StepText)
    VALUES (@TaskID, @StepText);

    SELECT SCOPE_IDENTITY() AS NewStepID;
END
GO
