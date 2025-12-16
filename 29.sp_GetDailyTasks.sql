USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE todo.sp_GetDailyTasks
AS
BEGIN
    SELECT * FROM todo.DailyTasks;
END;
