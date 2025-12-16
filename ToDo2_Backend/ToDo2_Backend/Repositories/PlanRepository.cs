using System.Data.SqlClient;
using Dapper;
using ToDo2_Backend.DTOs;
using ToDo2_Backend.Repositories.Interfaces;

namespace ToDo2_Backend.Repositories;

public class PlanRepository : IPlanRepository
{
    private readonly SqlConnection _connection;

    public PlanRepository(SqlConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<PlanDto>> GetPlansAsync(int userId)
    {
        return await _connection.QueryAsync<PlanDto>(
            "SELECT * FROM todo.vw_AllPlans WHERE UserID = @UserID",
            new { UserID = userId }
        );
    }
}
