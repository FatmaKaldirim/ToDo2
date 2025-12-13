USE ToDo2Db
GO 

DECLARE @constraintName NVARCHAR(200);

SELECT @constraintName = cc.name
FROM sys.check_constraints cc
JOIN sys.tables t ON cc.parent_object_id = t.object_id
JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE t.name = 'Tasks'
  AND s.name = 'todo';

IF @constraintName IS NOT NULL
BEGIN
    EXEC('ALTER TABLE todo.Tasks DROP CONSTRAINT ' + @constraintName);
END
GO
