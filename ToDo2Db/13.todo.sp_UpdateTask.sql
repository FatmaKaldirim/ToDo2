USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE todo.sp_UpdateTask
    @TaskID INT,
    @UserID INT,
    @TaskName VARCHAR(200) = NULL,
    @TaskContent VARCHAR(500) = NULL,
    @DueDate DATETIME = NULL,
    @ReminderDate DATETIME = NULL,
    @IsCompleted BIT = NULL,
    @IsImportant BIT = NULL,
    @RecurrenceType VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRANSACTION;

    IF NOT EXISTS (
        SELECT 1 FROM todo.Tasks
        WHERE TaskID = @TaskID AND UserID = @UserID
    )
    BEGIN
        ROLLBACK;
        RAISERROR('Görev bulunamadı veya kullanıcıya ait değil.', 16, 1);
        RETURN;
    END

    -- Eski RecurrenceType'ı al
    DECLARE @OldRecurrenceType VARCHAR(20);
    DECLARE @NewRecurrenceType VARCHAR(20);
    SELECT @OldRecurrenceType = RecurrenceType FROM todo.Tasks WHERE TaskID = @TaskID;
    SET @NewRecurrenceType = ISNULL(@RecurrenceType, @OldRecurrenceType);

    UPDATE todo.Tasks
    SET
        TaskName       = ISNULL(@TaskName, TaskName),
        TaskContent    = ISNULL(@TaskContent, TaskContent),
        DueDate        = ISNULL(@DueDate, DueDate),
        ReminderDate   = ISNULL(@ReminderDate, ReminderDate),
        IsImportant    = ISNULL(@IsImportant, IsImportant),
        RecurrenceType = @NewRecurrenceType,
        IsCompleted    = ISNULL(@IsCompleted, IsCompleted),
        CompletedAt    = CASE
                            WHEN @IsCompleted = 1 THEN GETDATE()
                            ELSE CompletedAt
                         END
    WHERE TaskID = @TaskID AND UserID = @UserID;

    -- RecurrenceType değiştiyse veya yeni eklendiyse planları güncelle
    IF (@RecurrenceType IS NOT NULL AND @OldRecurrenceType <> @NewRecurrenceType)
    BEGIN
        -- Eski planları temizle
        DELETE FROM todo.DailyTasks WHERE TaskID = @TaskID;
        DELETE FROM todo.WeeklyTasks WHERE TaskID = @TaskID;
        DELETE FROM todo.MonthlyTasks WHERE TaskID = @TaskID;

        -- Yeni planları oluştur
        DECLARE @StartDate DATE = CAST(ISNULL(@DueDate, GETDATE()) AS DATE);
        DECLARE @EndDate DATE = DATEADD(MONTH, 3, @StartDate);

        -- Günlük tekrarlama
        IF @NewRecurrenceType = 'daily'
        BEGIN
            DECLARE @CurrentDate DATE = @StartDate;
            WHILE @CurrentDate <= @EndDate
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM todo.DailyTasks
                    WHERE TaskID = @TaskID AND PlanDate = @CurrentDate
                )
                BEGIN
                    INSERT INTO todo.DailyTasks (TaskID, PlanDate)
                    VALUES (@TaskID, @CurrentDate);
                END
                SET @CurrentDate = DATEADD(DAY, 1, @CurrentDate);
            END
        END

        -- Haftalık tekrarlama
        IF @NewRecurrenceType = 'weekly'
        BEGIN
            DECLARE @DayOfWeek INT = DATEPART(WEEKDAY, @StartDate);
            DECLARE @DaysToMonday INT = CASE 
                WHEN @DayOfWeek = 1 THEN -6
                ELSE 2 - @DayOfWeek
            END;
            DECLARE @WeekStart DATE = DATEADD(DAY, @DaysToMonday, @StartDate);
            
            WHILE @WeekStart <= @EndDate
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM todo.WeeklyTasks
                    WHERE TaskID = @TaskID AND WeekStartDate = @WeekStart
                )
                BEGIN
                    INSERT INTO todo.WeeklyTasks (TaskID, WeekStartDate)
                    VALUES (@TaskID, @WeekStart);
                END
                SET @WeekStart = DATEADD(WEEK, 1, @WeekStart);
            END
        END

        -- Aylık tekrarlama
        IF @NewRecurrenceType = 'monthly'
        BEGIN
            DECLARE @MonthStart DATE = DATEFROMPARTS(YEAR(@StartDate), MONTH(@StartDate), 1);
            
            WHILE @MonthStart <= @EndDate
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM todo.MonthlyTasks
                    WHERE TaskID = @TaskID AND MonthStartDate = @MonthStart
                )
                BEGIN
                    INSERT INTO todo.MonthlyTasks (TaskID, MonthStartDate)
                    VALUES (@TaskID, @MonthStart);
                END
                SET @MonthStart = DATEADD(MONTH, 1, @MonthStart);
            END
        END
    END

    COMMIT;
END
GO
