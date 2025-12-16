using System.Data;
using System.Data.SqlClient;
using Dapper;
using ToDo2_Backend.DTOs;
using ToDo2_Backend.Repositories.Interfaces;

namespace ToDo2_Backend.Repositories;

public class WeeklyTaskRepository : IWeeklyTaskRepository
{
    private readonly SqlConnection _connection;

    public WeeklyTaskRepository(SqlConnection connection)
    {
        _connection = connection;
    }

    public async Task AddWeeklyTaskAsync(int taskId, DateTime weekStartDate)
    {
        await _connection.ExecuteAsync(
            "todo.sp_AddWeeklyTask",
            new { TaskID = taskId, WeekStartDate = weekStartDate },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task RemoveWeeklyTaskAsync(int weeklyTaskId)
    {
        await _connection.ExecuteAsync(
            "todo.sp_RemoveWeeklyTask",
            new { WeeklyTaskID = weeklyTaskId },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<IEnumerable<WeeklyTaskDto>> GetWeeklyTasksAsync(int userId)
    {
        return await _connection.QueryAsync<WeeklyTaskDto>(
            "todo.sp_GetWeeklyTasks",
            new { UserID = userId },
            commandType: CommandType.StoredProcedure
        );
    }
}
