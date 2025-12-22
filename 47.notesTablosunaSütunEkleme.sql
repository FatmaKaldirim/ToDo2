use ToDo2Db
go

--eksik sütunu tanýmlýyor
ALTER TABLE todo.Notes
ADD UpdatedAt DATETIME NULL;