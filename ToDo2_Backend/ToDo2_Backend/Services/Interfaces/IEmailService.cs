namespace ToDo2_Backend.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendWelcomeEmailAsync(string userEmail, string userName);
        Task SendReminderEmailAsync(string userEmail, string userName, string taskName, DateTime reminderDate);
    }
}

