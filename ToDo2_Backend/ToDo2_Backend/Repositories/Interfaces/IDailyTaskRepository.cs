using ToDo2_Backend.DTOs;

namespace ToDo2_Backend.Repositories.Interfaces
{
    public interface IDailyTaskRepository
    {
        Task AddDailyTaskAsync(int taskId, DateTime date);
        Task RemoveDailyTaskAsync(int dailyTaskId);
        Task<IEnumerable<DailyTaskDto>> GetDailyTasksAsync(int userId);
    }

}
