using Dapper;
using System.Data.SqlClient;
using ToDo2_Backend.DTOs;
using ToDo2_Backend.Services.Interfaces;

public class DailyTaskService : IDailyTaskService
{
    private readonly SqlConnection _connection;

    public DailyTaskService(SqlConnection connection)
    {
        _connection = connection;
    }

    public async Task AddDailyTask(int taskId, DateTime date)
    {
        await _connection.ExecuteAsync(
            "todo.sp_AddDailyTask",
            new { TaskId = taskId, TaskDate = date },
            commandType: System.Data.CommandType.StoredProcedure
        );
    }

    public async Task RemoveDailyTask(int dailyTaskId)
    {
        await _connection.ExecuteAsync(
            "todo.sp_RemoveDailyTask",
            new { DailyTaskId = dailyTaskId },
            commandType: System.Data.CommandType.StoredProcedure
        );
    }

    public async Task<IEnumerable<DailyTaskDto>> GetDailyTasks(int userId, bool includePast = false)
    {
        return await _connection.QueryAsync<DailyTaskDto>(
            "todo.sp_GetDailyTasks",
            new { UserId = userId, IncludePast = includePast ? 1 : 0 },
            commandType: System.Data.CommandType.StoredProcedure
        );
    }
}
