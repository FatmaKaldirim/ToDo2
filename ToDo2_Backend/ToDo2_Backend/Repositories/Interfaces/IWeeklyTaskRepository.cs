
using ToDo2_Backend.DTOs;

namespace ToDo2_Backend.Repositories.Interfaces;

public interface IWeeklyTaskRepository
{
    Task AddWeeklyTaskAsync(int taskId, DateTime weekStartDate);
    Task RemoveWeeklyTaskAsync(int weeklyTaskId);
    Task<IEnumerable<WeeklyTaskDto>> GetWeeklyTasksAsync(int userId);
}
