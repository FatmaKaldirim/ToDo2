USE ToDo2Db
GO

-- Kullanıcı silme (Cascade delete ile tüm ilişkili veriler otomatik silinir)
-- Foreign key constraint'ler ON DELETE CASCADE olduğu için:
-- - Lists (FK_Lists_Users)
-- - Tasks (FK_Tasks_Users)
-- - DailyTasks (FK_DailyTasks_Users)
-- - WeeklyTasks (FK_WeeklyTasks_Users)
-- - MonthlyTasks (FK_MonthlyTasks_Users)
-- Tüm bu tablolardaki veriler otomatik olarak silinir.
-- Tasks silinince Steps de otomatik silinir (FK_Steps_Tasks ON DELETE CASCADE)
-- Notes tablosu için ON DELETE CASCADE yok, bu yüzden manuel silme gerekir
CREATE OR ALTER PROCEDURE sp_DeleteUser
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Kullanıcının var olup olmadığını kontrol et
        IF NOT EXISTS (SELECT 1 FROM Users WHERE UserID = @UserID AND IsActive = 1)
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR('Kullanıcı bulunamadı veya zaten silinmiş.', 16, 1);
            RETURN;
        END

        -- Notes tablosu için ON DELETE CASCADE yok, bu yüzden manuel silme
        DELETE FROM todo.Notes WHERE UserID = @UserID;

        -- Kullanıcıyı sil (CASCADE delete ile diğer tüm ilişkili veriler otomatik silinir)
        DELETE FROM Users
        WHERE UserID = @UserID;

        COMMIT TRANSACTION;
        
        SELECT 1 AS Success, 'Kullanıcı ve tüm ilişkili veriler başarıyla silindi.' AS Message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

