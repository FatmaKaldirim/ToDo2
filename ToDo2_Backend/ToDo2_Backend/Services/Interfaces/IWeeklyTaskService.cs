using ToDo2_Backend.DTOs;

namespace ToDo2_Backend.Services.Interfaces
{
    public interface IWeeklyTaskService
    {
        Task AddWeeklyTask(int taskId, DateTime weekStart);
        Task RemoveWeeklyTask(int weeklyTaskId);
        Task<IEnumerable<WeeklyTaskDto>> GetWeeklyTasks(int userId, bool includePast = false);
    }

}
