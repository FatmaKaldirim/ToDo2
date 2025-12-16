USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE todo.sp_RemoveDailyTask
    @DailyTaskID INT
AS
BEGIN
    DELETE FROM todo.DailyTasks WHERE DailyTaskID = @DailyTaskID;
END;
