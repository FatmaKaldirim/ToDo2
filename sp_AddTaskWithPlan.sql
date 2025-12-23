CREATE OR ALTER PROCEDURE sp_AddTaskWithPlan
    @UserID INT,
    @ListID INT,
    @TaskName NVARCHAR(200),
    @TaskType NVARCHAR(20) -- Daily | Weekly | Monthly
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TaskID INT;

    INSERT INTO Tasks (UserID, ListID, TaskName, IsCompleted, CreatedAt)
    VALUES (@UserID, @ListID, @TaskName, 0, GETDATE());

    SET @TaskID = SCOPE_IDENTITY();

    IF @TaskType = 'Daily'
    BEGIN
        INSERT INTO DailyTasks (TaskID)
        VALUES (@TaskID);
    END
    ELSE IF @TaskType = 'Weekly'
    BEGIN
        INSERT INTO WeeklyTasks (TaskID)
        VALUES (@TaskID);
    END
    ELSE IF @TaskType = 'Monthly'
    BEGIN
        INSERT INTO MonthlyTasks (TaskID)
        VALUES (@TaskID);
    END
END;
GO
