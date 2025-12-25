USE ToDo2Db
GO

-- Veritabanı sağlık kontrolü
CREATE OR ALTER PROCEDURE sp_HealthCheck
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserCount INT;
    DECLARE @TaskCount INT;
    DECLARE @ListCount INT;
    DECLARE @NoteCount INT;
    DECLARE @IsHealthy BIT = 1;
    DECLARE @Message NVARCHAR(500) = '';

    BEGIN TRY
        -- Temel tabloların varlığını ve veri sayılarını kontrol et
        SELECT @UserCount = COUNT(*) FROM Users;
        SELECT @TaskCount = COUNT(*) FROM todo.Tasks;
        SELECT @ListCount = COUNT(*) FROM todo.Lists;
        SELECT @NoteCount = COUNT(*) FROM todo.Notes;

        SET @Message = 'Veritabanı bağlantısı başarılı. ' +
                       'Kullanıcılar: ' + CAST(@UserCount AS NVARCHAR(10)) + ', ' +
                       'Görevler: ' + CAST(@TaskCount AS NVARCHAR(10)) + ', ' +
                       'Listeler: ' + CAST(@ListCount AS NVARCHAR(10)) + ', ' +
                       'Notlar: ' + CAST(@NoteCount AS NVARCHAR(10));

        SELECT 
            @IsHealthy AS IsHealthy,
            @Message AS Message,
            @UserCount AS UserCount,
            @TaskCount AS TaskCount,
            @ListCount AS ListCount,
            @NoteCount AS NoteCount,
            GETDATE() AS CheckTime;
    END TRY
    BEGIN CATCH
        SET @IsHealthy = 0;
        SET @Message = 'Veritabanı sağlık kontrolü başarısız: ' + ERROR_MESSAGE();
        
        SELECT 
            @IsHealthy AS IsHealthy,
            @Message AS Message,
            NULL AS UserCount,
            NULL AS TaskCount,
            NULL AS ListCount,
            NULL AS NoteCount,
            GETDATE() AS CheckTime;
    END CATCH
END
GO

