using ToDo2_Backend.DTOs;

public interface IPlanService
{
    Task<IEnumerable<PlanDto>> GetPlansAsync(int userId);
}
