use ToDo2Db
go 

CREATE OR ALTER PROCEDURE todo.sp_DeleteNote
(
    @NoteID INT,
    @UserID INT
)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRAN;

        DELETE FROM todo.Notes
        WHERE NoteID = @NoteID AND UserID = @UserID;

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;

        THROW;
    END CATCH
END
GO
