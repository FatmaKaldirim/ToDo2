using ToDo2_Backend.DTOs;

namespace ToDo2_Backend.Services.Interfaces
{
    public interface IMonthlyTaskService
    {
        Task AddMonthlyTask(int taskId, DateTime monthDate);
        Task RemoveMonthlyTask(int monthlyTaskId);
        Task<IEnumerable<MonthlyTaskDto>> GetMonthlyTasks(int userId, bool includePast = false);
    }
}

