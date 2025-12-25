using ToDo2_Backend.DTOs;
using System.Data.SqlClient;
using Dapper;

public class PlanService : IPlanService
{
    private readonly SqlConnection _connection;

    public PlanService(SqlConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<PlanDto>> GetPlansAsync(int userId)
    {
        return await _connection.QueryAsync<PlanDto>(
            @"SELECT 
                v.TaskID AS TaskId,
                v.TaskName,
                v.PlanDate,
                v.PlanType,
                v.PlanID
            FROM todo.vw_AllPlans v
            INNER JOIN todo.Tasks t ON v.TaskID = t.TaskID
            WHERE t.UserID = @UserId",
            new { UserId = userId }
        );
    }
}
