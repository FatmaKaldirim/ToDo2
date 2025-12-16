using ToDo2_Backend.Dtos;
using ToDo2_Backend.DTOs;

namespace ToDo2_Backend.Repositories.Interfaces;

public interface IMonthlyTaskRepository
{
    Task AddMonthlyTaskAsync(int taskId, DateTime monthStartDate);
    Task RemoveMonthlyTaskAsync(int monthlyTaskId);
    Task<IEnumerable<MonthlyTaskDto>> GetMonthlyTasksAsync(int userId);
}
