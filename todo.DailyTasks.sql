CREATE TABLE todo.DailyTasks (
    DailyTaskID INT IDENTITY(1,1) PRIMARY KEY,
    TaskID INT NOT NULL,
    PlanDate DATE NOT NULL,
    CONSTRAINT FK_Daily_Task FOREIGN KEY (TaskID) REFERENCES todo.Tasks(TaskID),
    CONSTRAINT UQ_Daily UNIQUE (TaskID, PlanDate)
);
