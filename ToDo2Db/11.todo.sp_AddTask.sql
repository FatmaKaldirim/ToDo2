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

    COMMIT;

    SELECT SCOPE_IDENTITY() AS TaskID;
END;
GO
