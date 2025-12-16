USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE todo.sp_RemoveMonthlyTask
    @MonthlyTaskID INT
AS
BEGIN
    DELETE FROM todo.MonthlyTasks WHERE MonthlyTaskID = @MonthlyTaskID;
END;
