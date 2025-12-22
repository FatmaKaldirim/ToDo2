USE ToDo2Db;
GO

CREATE OR ALTER PROCEDURE todo.sp_GetTasksByList
    @UserID INT,
    @ListID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Kullanıcının o listeye erişimi var mı diye kontrol edilebilir (güvenlik)
    IF NOT EXISTS (SELECT 1 FROM todo.Lists WHERE ListID = @ListID AND UserID = @UserID)
    BEGIN
        -- Yetkisi yoksa boş sonuç döndür
        SELECT 
            TaskID = CAST(0 AS INT),
            TaskName = CAST('' AS VARCHAR(200)),
            TaskContent = CAST('' AS VARCHAR(500)),
            DueDate = CAST(NULL AS DATETIME),
            ReminderDate = CAST(NULL AS DATETIME),
            IsCompleted = CAST(0 AS BIT),
            IsImportant = CAST(0 AS BIT),
            RecurrenceType = CAST('' AS VARCHAR(20)),
            CreatedAt = CAST(NULL AS DATETIME),
            CompletedAt = CAST(NULL AS DATETIME),
            ListName = CAST('' AS VARCHAR(100))
        WHERE 1 = 0; -- Hiçbir sonuç dönmemesi için
        RETURN;
    END

    -- Belirtilen listeye ait görevleri döndür
    SELECT 
        t.TaskID,
        t.TaskName,
        t.TaskContent,
        t.DueDate,
        t.ReminderDate,
        t.IsCompleted,
        t.IsImportant,
        t.RecurrenceType,
        t.CreatedAt,
        t.CompletedAt,
        l.ListName
    FROM todo.Tasks t
    LEFT JOIN todo.Lists l ON t.ListID = l.ListID
    WHERE t.UserID = @UserID AND t.ListID = @ListID
    ORDER BY t.CreatedAt DESC;
END
GO
