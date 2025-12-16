using ToDo2_Backend.Dtos;
using ToDo2_Backend.DTOs;

namespace ToDo2_Backend.Repositories.Interfaces;

public interface IPlanRepository
{
    Task<IEnumerable<PlanDto>> GetPlansAsync(int userId);
}
