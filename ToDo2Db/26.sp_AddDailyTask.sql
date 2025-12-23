USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE todo.sp_AddDailyTask
    @TaskID INT,
    @PlanDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRAN;

    IF NOT EXISTS (
        SELECT 1 FROM todo.DailyTasks
        WHERE TaskID = @TaskID AND PlanDate = @PlanDate
    )
    BEGIN
        INSERT INTO todo.DailyTasks (TaskID, PlanDate)
        VALUES (@TaskID, @PlanDate);
    END

    COMMIT;
END;
