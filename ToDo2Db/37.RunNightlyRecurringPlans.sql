USE ToDo2Db;
GO

CREATE OR ALTER PROCEDURE todo.sp_RunNightlyRecurringPlans
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRAN;

        ------------------------------------------------------------
        -- 1) DAILY TASKS → Ertesi gün için yeni kayıt üret
        ------------------------------------------------------------
        INSERT INTO todo.DailyTasks (TaskID, PlanDate)
        SELECT 
            dt.TaskID,
            DATEADD(DAY, 1, dt.PlanDate)
        FROM todo.DailyTasks dt
        WHERE NOT EXISTS (
            SELECT 1
            FROM todo.DailyTasks x
            WHERE x.TaskID = dt.TaskID
              AND x.PlanDate = DATEADD(DAY, 1, dt.PlanDate)
        );

        ------------------------------------------------------------
        -- 2) WEEKLY TASKS → Gelecek hafta için yeni kayıt üret
        ------------------------------------------------------------
        INSERT INTO todo.WeeklyTasks (TaskID, WeekStartDate)
        SELECT 
            wt.TaskID,
            DATEADD(WEEK, 1, wt.WeekStartDate)
        FROM todo.WeeklyTasks wt
        WHERE NOT EXISTS (
            SELECT 1
            FROM todo.WeeklyTasks x
            WHERE x.TaskID = wt.TaskID
              AND x.WeekStartDate = DATEADD(WEEK, 1, wt.WeekStartDate)
        );

        ------------------------------------------------------------
        -- 3) MONTHLY TASKS → Gelecek ay için yeni kayıt üret
        ------------------------------------------------------------
        INSERT INTO todo.MonthlyTasks (TaskID, MonthStartDate)
        SELECT 
            mt.TaskID,
            DATEADD(MONTH, 1, mt.MonthStartDate)
        FROM todo.MonthlyTasks mt
        WHERE NOT EXISTS (
            SELECT 1
            FROM todo.MonthlyTasks x
            WHERE x.TaskID = mt.TaskID
              AND x.MonthStartDate = DATEADD(MONTH, 1, mt.MonthStartDate)
        );

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;

        THROW;  -- Hata fırlat
    END CATCH
END
GO
