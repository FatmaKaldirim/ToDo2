USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE todo.sp_DeleteStep
    @StepID INT,
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Step gerçekten bu kullanýcýya mý ait?
    IF NOT EXISTS (
        SELECT 1
        FROM todo.Steps S
        JOIN todo.Tasks T ON S.TaskID = T.TaskID
        WHERE S.StepID = @StepID AND T.UserID = @UserID
    )
    BEGIN
        RAISERROR('Bu step size ait deðil veya bulunamadý.', 16, 1);
        RETURN;
    END

    DELETE FROM todo.Steps
    WHERE StepID = @StepID;
END
GO
