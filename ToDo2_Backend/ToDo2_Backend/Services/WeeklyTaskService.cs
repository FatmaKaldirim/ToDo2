using ToDo2_Backend.DTOs;
using ToDo2_Backend.Services.Interfaces;
using System.Data.SqlClient;
using Dapper;

public class WeeklyTaskService : IWeeklyTaskService
{
    private readonly SqlConnection _connection;

    public WeeklyTaskService(SqlConnection connection)
    {
        _connection = connection;
    }

    public async Task AddWeeklyTask(int taskId, DateTime weekStart)
    {
        await _connection.ExecuteAsync(
            "todo.sp_AddWeeklyTask",
            new { TaskId = taskId, WeekStartDate = weekStart },
            commandType: System.Data.CommandType.StoredProcedure
        );
    }

    public async Task RemoveWeeklyTask(int weeklyTaskId)
    {
        await _connection.ExecuteAsync(
            "todo.sp_RemoveWeeklyTask",
            new { WeeklyTaskId = weeklyTaskId },
            commandType: System.Data.CommandType.StoredProcedure
        );
    }

    public async Task<IEnumerable<WeeklyTaskDto>> GetWeeklyTasks(int userId, bool includePast = false)
    {
        return await _connection.QueryAsync<WeeklyTaskDto>(
            "todo.sp_GetWeeklyTasks",
            new { UserId = userId, IncludePast = includePast ? 1 : 0 },
            commandType: System.Data.CommandType.StoredProcedure
        );
    }
}
