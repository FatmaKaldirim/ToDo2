CREATE OR ALTER VIEW todo.vw_AllPlans
AS
    -- DAILY
    SELECT
        t.TaskID,
        t.TaskName AS TaskName,
        'Daily' AS PlanType,
        d.PlanDate AS PlanDate,
        d.DailyTaskID AS PlanID
    FROM todo.DailyTasks d
    INNER JOIN todo.Tasks t ON t.TaskID = d.TaskID

    UNION ALL

    -- WEEKLY
    SELECT
        t.TaskID,
        t.TaskName AS TaskName,
        'Weekly' AS PlanType,
        w.WeekStartDate AS PlanDate,
        w.WeeklyTaskID AS PlanID
    FROM todo.WeeklyTasks w
    INNER JOIN todo.Tasks t ON t.TaskID = w.TaskID

    UNION ALL

    -- MONTHLY
    SELECT
        t.TaskID,
        t.TaskName AS TaskName,
        'Monthly' AS PlanType,
        m.MonthStartDate AS PlanDate,
        m.MonthlyTaskID AS PlanID
    FROM todo.MonthlyTasks m
    INNER JOIN todo.Tasks t ON t.TaskID = m.TaskID;
