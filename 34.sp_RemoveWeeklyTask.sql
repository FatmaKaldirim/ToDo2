USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE todo.sp_RemoveWeeklyTask
    @WeeklyTaskID INT
AS
BEGIN
    DELETE FROM todo.WeeklyTasks
    WHERE WeeklyTaskID = @WeeklyTaskID;
END