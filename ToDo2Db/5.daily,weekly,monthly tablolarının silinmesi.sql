IF OBJECT_ID('dbo.DailyTasks', 'U') IS NOT NULL
    DROP TABLE dbo.DailyTasks;
GO

IF OBJECT_ID('dbo.WeeklyTasks', 'U') IS NOT NULL
    DROP TABLE dbo.WeeklyTasks;
GO

IF OBJECT_ID('dbo.MonthlyTasks', 'U') IS NOT NULL
    DROP TABLE dbo.MonthlyTasks;
GO
