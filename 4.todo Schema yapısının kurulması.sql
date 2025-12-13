USE ToDo2Db
GO

CREATE SCHEMA todo;
GO

CREATE TABLE todo.Lists (
    ListID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    ListName VARCHAR(100) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Lists_Users
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
        ON DELETE CASCADE
);
GO

CREATE TABLE todo.Tasks (
    TaskID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    ListID INT NULL,

    TaskName VARCHAR(200) NOT NULL,
    TaskContent VARCHAR(500) NULL,

    DueDate DATETIME NULL,
    ReminderDate DATETIME NULL,

    IsCompleted BIT DEFAULT 0,
    IsImportant BIT DEFAULT 0,

    RecurrenceType VARCHAR(20) NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CompletedAt DATETIME NULL,

    CONSTRAINT FK_Tasks_Lists
        FOREIGN KEY (ListID) REFERENCES todo.Lists(ListID)
        ON DELETE SET NULL,

    CONSTRAINT CK_Tasks_Recurrence
        CHECK (RecurrenceType IN ('daily','weekly','monthly','yearly') OR RecurrenceType IS NULL)
);
GO

CREATE TABLE todo.Steps (
    StepID INT IDENTITY(1,1) PRIMARY KEY,
    TaskID INT NOT NULL,
    StepText VARCHAR(300) NOT NULL,
    IsCompleted BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Steps_Tasks
        FOREIGN KEY (TaskID) REFERENCES todo.Tasks(TaskID)
        ON DELETE CASCADE
);
GO
