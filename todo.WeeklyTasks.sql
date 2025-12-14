CREATE TABLE todo.WeeklyTasks (
    WeeklyTaskID INT IDENTITY(1,1) PRIMARY KEY,
    TaskID INT NOT NULL,
    WeekStartDate DATE NOT NULL,
    CONSTRAINT FK_Weekly_Task FOREIGN KEY (TaskID) REFERENCES todo.Tasks(TaskID),
    CONSTRAINT UQ_Weekly UNIQUE (TaskID, WeekStartDate)
);
