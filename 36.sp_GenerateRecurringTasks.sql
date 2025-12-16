USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE todo.sp_GenerateRecurringTasks
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE 
        @TaskID INT,
        @RecurrenceType VARCHAR(20),
        @IsCompleted BIT,
        @CompletedAt DATETIME;

    DECLARE RecurringCursor CURSOR FOR
    SELECT TaskID, RecurrenceType, IsCompleted, CompletedAt
    FROM todo.Tasks
    WHERE RecurrenceType IS NOT NULL
      AND RecurrenceType <> 'none'
      AND IsCompleted = 1;     -- Tamamlanan görevler

    OPEN RecurringCursor;
    FETCH NEXT FROM RecurringCursor 
        INTO @TaskID, @RecurrenceType, @IsCompleted, @CompletedAt;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        ---------------------------------------------------------
        -- DAILY ? Bir sonraki gün için ekle
        ---------------------------------------------------------
        IF (@RecurrenceType = 'daily')
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM todo.DailyTasks
                WHERE TaskID = @TaskID
                  AND PlanDate = DATEADD(DAY, 1, @CompletedAt)
            )
            BEGIN
                INSERT INTO todo.DailyTasks (TaskID, PlanDate)
                VALUES (@TaskID, DATEADD(DAY, 1, @CompletedAt));
            END
        END


        ---------------------------------------------------------
        -- WEEKLY ? Gelecek hafta için ekle
        ---------------------------------------------------------
        IF (@RecurrenceType = 'weekly')
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM todo.WeeklyTasks
                WHERE TaskID = @TaskID
                  AND WeekStartDate = DATEADD(WEEK, 1, @CompletedAt)
            )
            BEGIN
                INSERT INTO todo.WeeklyTasks (TaskID, WeekStartDate)
                VALUES (@TaskID, DATEADD(WEEK, 1, @CompletedAt));
            END
        END


        ---------------------------------------------------------
        -- MONTHLY ? Gelecek ay için ekle
        ---------------------------------------------------------
        IF (@RecurrenceType = 'monthly')
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM todo.MonthlyTasks
                WHERE TaskID = @TaskID
                  AND MonthStartDate = DATEADD(MONTH, 1, @CompletedAt)
            )
            BEGIN
                INSERT INTO todo.MonthlyTasks (TaskID, MonthStartDate)
                VALUES (@TaskID, DATEADD(MONTH, 1, @CompletedAt));
            END
        END

        FETCH NEXT FROM RecurringCursor 
            INTO @TaskID, @RecurrenceType, @IsCompleted, @CompletedAt;
    END;

    CLOSE RecurringCursor;
    DEALLOCATE RecurringCursor;
END;
GO
