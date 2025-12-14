CREATE OR ALTER PROCEDURE todo.sp_AddMonthlyTask
    @TaskID INT,
    @MonthStartDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRAN;

    IF NOT EXISTS (
        SELECT 1 FROM todo.MonthlyTasks
        WHERE TaskID = @TaskID AND MonthStartDate = @MonthStartDate
    )
    BEGIN
        INSERT INTO todo.MonthlyTasks (TaskID, MonthStartDate)
        VALUES (@TaskID, @MonthStartDate);
    END

    COMMIT;
END;
