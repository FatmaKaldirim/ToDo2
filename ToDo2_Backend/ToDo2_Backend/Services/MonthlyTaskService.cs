using ToDo2_Backend.DTOs;
using ToDo2_Backend.Services.Interfaces;
using System.Data.SqlClient;
using Dapper;
using System.Data;

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
            new
            {
                TaskId = taskId,
                MonthDate = monthDate
            },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<IEnumerable<MonthlyTaskDto>> GetMonthlyTasks(int userId, bool includePast = false)
    {
        return await _connection.QueryAsync<MonthlyTaskDto>(
            "todo.sp_GetMonthlyTasks",
            new
            {
                UserId = userId,
                IncludePast = includePast ? 1 : 0
            },
            commandType: CommandType.StoredProcedure
        );
    }

    // 🔴 EKSİK OLAN METOT (HATAYI ÇÖZEN KISIM)
    public async Task RemoveMonthlyTask(int monthlyTaskId)
    {
        await _connection.ExecuteAsync(
            "todo.sp_RemoveMonthlyTask",
            new
            {
                MonthlyTaskId = monthlyTaskId
            },
            commandType: CommandType.StoredProcedure
        );
    }
}
