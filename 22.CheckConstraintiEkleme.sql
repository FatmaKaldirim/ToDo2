USE ToDo2Db
GO
ALTER TABLE todo.Tasks
ADD CONSTRAINT CK_Tasks_Recurrence
CHECK (RecurrenceType IN ('none', 'daily', 'weekly', 'monthly'));
GO

