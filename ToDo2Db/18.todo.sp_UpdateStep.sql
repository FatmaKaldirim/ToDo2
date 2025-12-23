USE ToDo2Db
GO

CREATE OR ALTER PROCEDURE todo.sp_UpdateStep
    @StepID INT,
    @UserID INT,
    @StepText VARCHAR(300) = NULL,
    @IsCompleted BIT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Step gerçekten bu kullanýcýya mý ait? (Step -> Task -> User kontrol)
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

    UPDATE todo.Steps
    SET
        StepText    = ISNULL(@StepText, StepText),
        IsCompleted = ISNULL(@IsCompleted, IsCompleted)
    WHERE StepID = @StepID;
END
GO
