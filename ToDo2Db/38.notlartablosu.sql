USE ToDo2Db;
GO

CREATE TABLE todo.Notes (
    NoteID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    TaskID INT NULL,               -- Göreve baðlý olmayabilir
    NoteText NVARCHAR(500) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT(GETDATE()),

    CONSTRAINT FK_Notes_User
        FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID),

    CONSTRAINT FK_Notes_Task
        FOREIGN KEY (TaskID) REFERENCES todo.Tasks(TaskID)
);
GO

-- Performans iyileþtirmesi
CREATE INDEX IX_Notes_UserID ON todo.Notes(UserID);
CREATE INDEX IX_Notes_TaskID ON todo.Notes(TaskID);
GO
