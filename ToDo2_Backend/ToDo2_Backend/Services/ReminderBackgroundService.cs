using Dapper;
using System.Data;
using System.Data.SqlClient;
using ToDo2_Backend.Services.Interfaces;

namespace ToDo2_Backend.Services
{
    public class ReminderBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ReminderBackgroundService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1); // Her 1 dakikada bir kontrol et

        public ReminderBackgroundService(IServiceProvider serviceProvider, ILogger<ReminderBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckAndSendRemindersAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Hatırlatma kontrolü sırasında hata oluştu");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }
        }

        private async Task CheckAndSendRemindersAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var connection = scope.ServiceProvider.GetRequiredService<SqlConnection>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

            // Şu anki zaman ile 1 dakika sonrası arasındaki hatırlatmaları bul
            var now = DateTime.Now;
            var oneMinuteLater = now.AddMinutes(1);

            var reminders = await connection.QueryAsync<dynamic>(
                @"SELECT t.TaskID, t.TaskName, t.ReminderDate, 
                         u.UserID, u.UserName, u.UserMail, u.EmailNotificationsEnabled
                  FROM todo.Tasks t
                  INNER JOIN Users u ON t.UserID = u.UserID
                  WHERE t.ReminderDate IS NOT NULL
                    AND t.ReminderDate >= @Now
                    AND t.ReminderDate <= @OneMinuteLater
                    AND t.IsCompleted = 0
                    AND (u.EmailNotificationsEnabled = 1 OR u.EmailNotificationsEnabled IS NULL)",
                new { Now = now, OneMinuteLater = oneMinuteLater }
            );

            foreach (var reminder in reminders)
            {
                try
                {
                    if (reminder.EmailNotificationsEnabled == true || reminder.EmailNotificationsEnabled == null)
                    {
                        await emailService.SendReminderEmailAsync(
                            reminder.UserMail,
                            reminder.UserName,
                            reminder.TaskName,
                            reminder.ReminderDate
                        );

                        _logger.LogInformation($"Hatırlatma emaili gönderildi: {reminder.UserMail} - {reminder.TaskName}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Hatırlatma emaili gönderilemedi: {reminder.UserMail} - {reminder.TaskName}");
                }
            }
        }
    }
}

