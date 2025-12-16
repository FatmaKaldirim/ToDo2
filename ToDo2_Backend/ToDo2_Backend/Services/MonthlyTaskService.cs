using ToDo2_Backend.DTOs;
using ToDo2_Backend.Services.Interfaces;

public class MonthlyTaskService : IMonthlyTaskService
{
    private readonly SqlConnection _connection;

    public MonthlyTaskService(SqlConnection connection)
    {
        _connection = connection;
    }

    public async Task AddMonthlyTask(int taskId, DateTime monthDate)
    {
        await _connection.ExecuteAsync(
            "todo.sp_AddMonthlyTask",
            new { TaskId = taskId, MonthDate = monthDate },
            commandType: System.Data.CommandType.StoredProcedure
        );
    }

    public async Task<IEnumerable<MonthlyTaskDto>> GetMonthlyTasks(int userId)
    {
        return await _connection.QueryAsync<MonthlyTaskDto>(
            "todo.sp_GetMonthlyTasks",
            new { UserId = userId },
            commandType: System.Data.CommandType.StoredProcedure
        );
    }
}
