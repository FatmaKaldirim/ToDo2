USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE todo.sp_GetWeeklyTasks
AS
BEGIN
    SELECT * FROM todo.WeeklyTasks;
END;
