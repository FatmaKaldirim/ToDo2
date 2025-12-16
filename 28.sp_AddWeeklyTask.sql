USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE todo.sp_AddWeeklyTask
    @TaskID INT,
    @WeekStartDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRAN;

    IF NOT EXISTS (
        SELECT 1 FROM todo.WeeklyTasks
        WHERE TaskID = @TaskID AND WeekStartDate = @WeekStartDate
    )
    BEGIN
        INSERT INTO todo.WeeklyTasks (TaskID, WeekStartDate)
        VALUES (@TaskID, @WeekStartDate);
    END

    COMMIT;
END;
