using ToDo2_Backend.DTOs;

namespace ToDo2_Backend.Services.Interfaces
{
    public interface IDailyTaskService
    {
        Task AddDailyTask(int taskId, DateTime date);
        Task RemoveDailyTask(int dailyTaskId);
        Task<IEnumerable<DailyTaskDto>> GetDailyTasks(int userId, bool includePast = false);
    }

}
