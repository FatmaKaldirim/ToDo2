---------------------------------------------------------
-- DATABASE OLUŞTUR
---------------------------------------------------------
CREATE DATABASE ToDo2Db;
GO

USE ToDo2Db;
GO


---------------------------------------------------------
-- USERS TABLOSU
---------------------------------------------------------
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    UserName VARCHAR(100) NOT NULL,
    UserMail VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARBINARY(64) NOT NULL,
    PasswordSalt VARBINARY(128) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);
GO



---------------------------------------------------------
-- LISTS TABLOSU
---------------------------------------------------------
CREATE TABLE Lists (
    ListID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    ListName VARCHAR(100) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

ALTER TABLE Lists
ADD CONSTRAINT FK_Lists_Users
FOREIGN KEY (UserID) REFERENCES Users(UserID)
ON DELETE CASCADE;
GO



---------------------------------------------------------
-- TASKS TABLOSU
-- (RECURRENCE TYPE EKLENDİ)
---------------------------------------------------------
CREATE TABLE Tasks (
    TaskID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    ListID INT NULL,
    TaskName VARCHAR(200) NOT NULL,
    TaskContent VARCHAR(500) NULL,
    DueDate DATETIME NULL,
    ReminderDate DATETIME NULL,
    IsCompleted BIT DEFAULT 0,
    IsImportant BIT DEFAULT 0,           -- ⭐ önemli görev
    RecurrenceType VARCHAR(20) NULL,     -- ⭐ none / daily / weekly / monthly
    CreatedAt DATETIME DEFAULT GETDATE(),
    CompletedAt DATETIME NULL
);

ALTER TABLE Tasks
ADD CONSTRAINT FK_Tasks_Users
FOREIGN KEY (UserID) REFERENCES Users(UserID)
ON DELETE CASCADE;

ALTER TABLE Tasks
ADD CONSTRAINT FK_Tasks_Lists
FOREIGN KEY (ListID) REFERENCES Lists(ListID)
ON DELETE SET NULL;
GO



---------------------------------------------------------
-- STEPS TABLOSU
---------------------------------------------------------
CREATE TABLE Steps (
    StepID INT IDENTITY(1,1) PRIMARY KEY,
    TaskID INT NOT NULL,
    StepText VARCHAR(300) NOT NULL,
    IsCompleted BIT DEFAULT 0
);

ALTER TABLE Steps
ADD CONSTRAINT FK_Steps_Tasks
FOREIGN KEY (TaskID) REFERENCES Tasks(TaskID)
ON DELETE CASCADE;
GO



---------------------------------------------------------
-- DAILY TASKS (TEKRARLAMA İÇİN UYGUN YAPI)
---------------------------------------------------------
CREATE TABLE DailyTasks (
    DailyTaskID INT IDENTITY(1,1) PRIMARY KEY,
    TaskID INT NOT NULL,
    UserID INT NOT NULL,
    PlanDate DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    CreatedAt DATETIME DEFAULT GETDATE()
);

ALTER TABLE DailyTasks
ADD CONSTRAINT FK_DailyTasks_Tasks
FOREIGN KEY (TaskID) REFERENCES Tasks(TaskID)
ON DELETE CASCADE;

ALTER TABLE DailyTasks
ADD CONSTRAINT FK_DailyTasks_Users
FOREIGN KEY (UserID) REFERENCES Users(UserID)
ON DELETE CASCADE;
GO



---------------------------------------------------------
-- WEEKLY TASKS
---------------------------------------------------------
CREATE TABLE WeeklyTasks (
    WeeklyTaskID INT IDENTITY(1,1) PRIMARY KEY,
    TaskID INT NOT NULL,
    UserID INT NOT NULL,
    WeekStartDate DATE NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

ALTER TABLE WeeklyTasks
ADD CONSTRAINT FK_WeeklyTasks_Tasks
FOREIGN KEY (TaskID) REFERENCES Tasks(TaskID)
ON DELETE CASCADE;

ALTER TABLE WeeklyTasks
ADD CONSTRAINT FK_WeeklyTasks_Users
FOREIGN KEY (UserID) REFERENCES Users(UserID)
ON DELETE CASCADE;
GO



---------------------------------------------------------
-- MONTHLY TASKS
---------------------------------------------------------
CREATE TABLE MonthlyTasks (
    MonthlyTaskID INT IDENTITY(1,1) PRIMARY KEY,
    TaskID INT NOT NULL,
    UserID INT NOT NULL,
    MonthStartDate DATE NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

ALTER TABLE MonthlyTasks
ADD CONSTRAINT FK_MonthlyTasks_Tasks
FOREIGN KEY (TaskID) REFERENCES Tasks(TaskID)
ON DELETE CASCADE;

ALTER TABLE MonthlyTasks
ADD CONSTRAINT FK_MonthlyTasks_Users
FOREIGN KEY (UserID) REFERENCES Users(UserID)
ON DELETE CASCADE;
GO
