using ToDo2_Backend.DTOs;

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
            "SELECT * FROM todo.vw_AllPlans WHERE UserId = @UserId",
            new { UserId = userId }
        );
    }
}
