using Dapper;
using System.Data.SqlClient;
using ToDo2_Backend.DTOs;
using ToDo2_Backend.Repositories.Interfaces;

public class DailyTaskRepository : IDailyTaskRepository
{
    private readonly SqlConnection _connection;

    public DailyTaskRepository(SqlConnection connection)
    {
        _connection = connection;
    }

    public async Task AddDailyTaskAsync(int taskId, DateTime date)
    {
        await _connection.ExecuteAsync(
            "todo.sp_AddDailyTask",
            new { TaskId = taskId, TaskDate = date },
            commandType: System.Data.CommandType.StoredProcedure
        );
    }

    public async Task RemoveDailyTaskAsync(int dailyTaskId)
    {
        await _connection.ExecuteAsync(
            "todo.sp_RemoveDailyTask",
            new { DailyTaskId = dailyTaskId },
            commandType: System.Data.CommandType.StoredProcedure
        );
    }

    public async Task<IEnumerable<DailyTaskDto>> GetDailyTasksAsync(int userId)
    {
        return await _connection.QueryAsync<DailyTaskDto>(
            "todo.sp_GetDailyTasks",
            new { UserId = userId },
            commandType: System.Data.CommandType.StoredProcedure
        );
    }
}
