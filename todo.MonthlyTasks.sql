CREATE TABLE todo.MonthlyTasks (
    MonthlyTaskID INT IDENTITY(1,1) PRIMARY KEY,
    TaskID INT NOT NULL,
    MonthStartDate DATE NOT NULL,
    CONSTRAINT FK_Monthly_Task FOREIGN KEY (TaskID) REFERENCES todo.Tasks(TaskID),
    CONSTRAINT UQ_Monthly UNIQUE (TaskID, MonthStartDate)
);
