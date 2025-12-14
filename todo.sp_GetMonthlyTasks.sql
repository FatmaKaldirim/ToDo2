CREATE OR ALTER PROCEDURE todo.sp_GetMonthlyTasks
AS
BEGIN
    SELECT * FROM todo.MonthlyTasks;
END;
