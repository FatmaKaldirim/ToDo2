using System.Data;
using System.Data.SqlClient;
using Dapper;
using ToDo2_Backend.DTOs;
using ToDo2_Backend.Repositories.Interfaces;

namespace ToDo2_Backend.Repositories;

public class MonthlyTaskRepository : IMonthlyTaskRepository
{
    private readonly SqlConnection _connection;

    public MonthlyTaskRepository(SqlConnection connection)
    {
        _connection = connection;
    }

    public async Task AddMonthlyTaskAsync(int taskId, DateTime monthStartDate)
    {
        await _connection.ExecuteAsync(
            "todo.sp_AddMonthlyTask",
            new { TaskID = taskId, MonthStartDate = monthStartDate },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task RemoveMonthlyTaskAsync(int monthlyTaskId)
    {
        await _connection.ExecuteAsync(
            "todo.sp_RemoveMonthlyTask",
            new { MonthlyTaskID = monthlyTaskId },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<IEnumerable<MonthlyTaskDto>> GetMonthlyTasksAsync(int userId)
    {
        return await _connection.QueryAsync<MonthlyTaskDto>(
            "todo.sp_GetMonthlyTasks",
            new { UserID = userId },
            commandType: CommandType.StoredProcedure
        );
    }
}
