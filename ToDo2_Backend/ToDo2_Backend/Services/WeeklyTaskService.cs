using ToDo2_Backend.DTOs;
using ToDo2_Backend.Services.Interfaces;

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

    public async Task<IEnumerable<WeeklyTaskDto>> GetWeeklyTasks(int userId)
    {
        return await _connection.QueryAsync<WeeklyTaskDto>(
            "todo.sp_GetWeeklyTasks",
            new { UserId = userId },
            commandType: System.Data.CommandType.StoredProcedure
        );
    }
}
