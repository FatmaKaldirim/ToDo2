USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE todo.sp_AddTaskWithPlan
    @UserID     INT,
    @ListID     INT,
    @TaskName   NVARCHAR(200),
    @TaskType   NVARCHAR(20) -- 'Daily' | 'Weekly' | 'Monthly'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @TaskID INT;

        INSERT INTO todo.Tasks
        (
            UserID,
            ListID,
            TaskName,
            IsCompleted,
            CreatedAt
        )
        VALUES
        (
            @UserID,
            @ListID,
            @TaskName,
            0,
            GETDATE()
        );

        SET @TaskID = SCOPE_IDENTITY();

        IF @TaskType = 'Daily'
        BEGIN
            INSERT INTO todo.DailyTasks (TaskID)
            VALUES (@TaskID);
        END
        ELSE IF @TaskType = 'Weekly'
        BEGIN
            INSERT INTO todo.WeeklyTasks (TaskID)
            VALUES (@TaskID);
        END
        ELSE IF @TaskType = 'Monthly'
        BEGIN
            INSERT INTO todo.MonthlyTasks (TaskID)
            VALUES (@TaskID);
        END
        ELSE
        BEGIN
            RAISERROR ('Ge�ersiz TaskType de�eri!', 16, 1);
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH
END;
GO
