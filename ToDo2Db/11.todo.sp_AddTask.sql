use ToDo2Db
go 

CREATE OR ALTER PROCEDURE todo.sp_AddTask
    @UserID INT,
    @ListID INT = NULL,
    @TaskName VARCHAR(200),
    @TaskContent VARCHAR(500) = NULL,
    @DueDate DATETIME = NULL,
    @ReminderDate DATETIME = NULL,
    @IsImportant BIT = 0,
    @RecurrenceType VARCHAR(20) = 'none'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRANSACTION;

    -- Liste kullanıcıya ait mi kontrol
    IF @ListID IS NOT NULL
    BEGIN
        IF NOT EXISTS (
            SELECT 1 
            FROM todo.Lists
            WHERE ListID = @ListID AND UserID = @UserID
        )
        BEGIN
            ROLLBACK;
            RAISERROR('Liste kullanıcıya ait değil.', 16, 1);
            RETURN;
        END
    END

    --  NULL gelirse otomatik 'none'
    SET @RecurrenceType = ISNULL(@RecurrenceType, 'none');

    DECLARE @NewTaskID INT;

    INSERT INTO todo.Tasks (
        UserID,
        ListID,
        TaskName,
        TaskContent,
        DueDate,
        ReminderDate,
        IsImportant,
        RecurrenceType
    )
    VALUES (
        @UserID,
        @ListID,
        @TaskName,
        @TaskContent,
        @DueDate,
        @ReminderDate,
        @IsImportant,
        @RecurrenceType
    );

    SET @NewTaskID = SCOPE_IDENTITY();

    -- Tekrarlayan görev planları oluştur
    DECLARE @StartDate DATE = CAST(ISNULL(@DueDate, GETDATE()) AS DATE);
    DECLARE @EndDate DATE = DATEADD(MONTH, 3, @StartDate); -- 3 ay ileriye kadar plan oluştur

    -- Günlük tekrarlama
    IF @RecurrenceType = 'daily'
    BEGIN
        DECLARE @CurrentDate DATE = @StartDate;
        WHILE @CurrentDate <= @EndDate
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM todo.DailyTasks
                WHERE TaskID = @NewTaskID AND PlanDate = @CurrentDate
            )
            BEGIN
                INSERT INTO todo.DailyTasks (TaskID, PlanDate)
                VALUES (@NewTaskID, @CurrentDate);
            END
            SET @CurrentDate = DATEADD(DAY, 1, @CurrentDate);
        END
    END

    -- Haftalık tekrarlama (Pazartesi günü)
    IF @RecurrenceType = 'weekly'
    BEGIN
        -- İlk haftanın pazartesi gününü bul
        DECLARE @DayOfWeek INT = DATEPART(WEEKDAY, @StartDate);
        DECLARE @DaysToMonday INT = CASE 
            WHEN @DayOfWeek = 1 THEN -6  -- Pazar ise 6 gün geri
            ELSE 2 - @DayOfWeek          -- Diğer günler için pazartesiye kadar gün sayısı
        END;
        DECLARE @WeekStart DATE = DATEADD(DAY, @DaysToMonday, @StartDate);
        
        WHILE @WeekStart <= @EndDate
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM todo.WeeklyTasks
                WHERE TaskID = @NewTaskID AND WeekStartDate = @WeekStart
            )
            BEGIN
                INSERT INTO todo.WeeklyTasks (TaskID, WeekStartDate)
                VALUES (@NewTaskID, @WeekStart);
            END
            SET @WeekStart = DATEADD(WEEK, 1, @WeekStart);
        END
    END

    -- Aylık tekrarlama (Ayın ilk günü)
    IF @RecurrenceType = 'monthly'
    BEGIN
        DECLARE @MonthStart DATE = DATEFROMPARTS(YEAR(@StartDate), MONTH(@StartDate), 1);
        
        WHILE @MonthStart <= @EndDate
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM todo.MonthlyTasks
                WHERE TaskID = @NewTaskID AND MonthStartDate = @MonthStart
            )
            BEGIN
                INSERT INTO todo.MonthlyTasks (TaskID, MonthStartDate)
                VALUES (@NewTaskID, @MonthStart);
            END
            SET @MonthStart = DATEADD(MONTH, 1, @MonthStart);
        END
    END

    COMMIT;

    SELECT @NewTaskID AS TaskID;
END;
GO
