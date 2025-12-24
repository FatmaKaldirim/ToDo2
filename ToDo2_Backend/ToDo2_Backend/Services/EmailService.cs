using System.Net;
using System.Net.Mail;
using ToDo2_Backend.Services.Interfaces;

namespace ToDo2_Backend.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendWelcomeEmailAsync(string userEmail, string userName)
        {
            try
            {
                var smtpSettings = _configuration.GetSection("SmtpSettings");
                var smtpHost = smtpSettings["Host"] ?? "smtp.gmail.com";
                var smtpPort = int.Parse(smtpSettings["Port"] ?? "587");
                var smtpUser = smtpSettings["User"];
                var smtpPassword = smtpSettings["Password"];
                var fromEmail = smtpSettings["FromEmail"] ?? smtpUser;
                var fromName = smtpSettings["FromName"] ?? "To Do List";

                if (string.IsNullOrEmpty(smtpUser) || string.IsNullOrEmpty(smtpPassword) || 
                    smtpUser == "your-email@gmail.com" || smtpPassword == "your-app-password")
                {
                    _logger.LogError("SMTP ayarları yapılandırılmamış! Lütfen appsettings.json dosyasında SmtpSettings bölümünü doldurun.");
                    _logger.LogError("User: {User}, Password: {Password}", 
                        string.IsNullOrEmpty(smtpUser) ? "BOŞ" : smtpUser, 
                        string.IsNullOrEmpty(smtpPassword) ? "BOŞ" : "***");
                    throw new InvalidOperationException("SMTP ayarları yapılandırılmamış. Email gönderilemedi.");
                }

                using var client = new SmtpClient(smtpHost, smtpPort)
                {
                    EnableSsl = true,
                    Credentials = new NetworkCredential(smtpUser, smtpPassword)
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail, fromName),
                    Subject = "To Do List'e Hoş Geldiniz! 🎉",
                    Body = $@"
                        <html>
                        <head>
                            <meta charset='utf-8'>
                        </head>
                        <body style='font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #323130; margin: 0; padding: 0; background-color: #f5f5f5;'>
                            <div style='max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);'>
                                <!-- Header -->
                                <div style='background: linear-gradient(135deg, #0078d4 0%, #106ebe 100%); padding: 40px 30px; text-align: center;'>
                                    <div style='font-size: 48px; margin-bottom: 10px;'>✓</div>
                                    <h1 style='color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;'>To Do List</h1>
                                </div>
                                
                                <!-- Content -->
                                <div style='padding: 40px 30px;'>
                                    <h2 style='color: #0078d4; margin-top: 0; font-size: 24px; font-weight: 600;'>Hoş Geldiniz, {userName}!</h2>
                                    
                                    <p style='color: #323130; font-size: 16px; margin: 20px 0;'>To Do List uygulamasına başarıyla kayıt oldunuz. Artık görevlerinizi daha organize bir şekilde yönetebilirsiniz!</p>
                                    
                                    <div style='background-color: #f3f2f1; border-left: 4px solid #0078d4; padding: 20px; margin: 30px 0; border-radius: 4px;'>
                                        <h3 style='color: #323130; margin-top: 0; font-size: 18px; font-weight: 600;'>Neler Yapabilirsiniz?</h3>
                                        <ul style='color: #605e5c; font-size: 15px; line-height: 1.8; margin: 10px 0; padding-left: 20px;'>
                                            <li>Görevlerinizi oluşturun ve organize edin</li>
                                            <li>Önemli görevleri yıldızla işaretleyin</li>
                                            <li>Hatırlatmalar oluşturun ve zamanında bildirim alın</li>
                                            <li>Görevlerinize adımlar ve notlar ekleyin</li>
                                            <li>Takvim görünümünde planlarınızı görüntüleyin</li>
                                        </ul>
                                    </div>
                                    
                                    <div style='text-align: center; margin: 40px 0;'>
                                        <a href='#' style='display: inline-block; background-color: #0078d4; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 4px; font-weight: 600; font-size: 16px;'>Uygulamaya Başla</a>
                                    </div>
                                    
                                    <p style='color: #605e5c; font-size: 14px; margin-top: 40px; border-top: 1px solid #edebe9; padding-top: 20px;'>
                                        Sorularınız için bizimle iletişime geçebilirsiniz. İyi çalışmalar! 🚀
                                    </p>
                                </div>
                                
                                <!-- Footer -->
                                <div style='background-color: #faf9f8; padding: 20px 30px; text-align: center; border-top: 1px solid #edebe9;'>
                                    <p style='color: #8a8886; font-size: 12px; margin: 0;'>Bu bir otomatik e-postadır, lütfen yanıtlamayın.</p>
                                    <p style='color: #8a8886; font-size: 12px; margin: 5px 0 0 0;'>© {DateTime.Now.Year} To Do List. Tüm hakları saklıdır.</p>
                                </div>
                            </div>
                        </body>
                        </html>",
                    IsBodyHtml = true
                };

                mailMessage.To.Add(userEmail);

                await client.SendMailAsync(mailMessage);
                _logger.LogInformation($"Hoş geldin emaili gönderildi: {userEmail}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Email gönderme hatası: {userEmail}");
                // Hata durumunda uygulama çalışmaya devam etsin
            }
        }

        public async Task SendReminderEmailAsync(string userEmail, string userName, string taskName, DateTime reminderDate)
        {
            try
            {
                var smtpSettings = _configuration.GetSection("SmtpSettings");
                var smtpHost = smtpSettings["Host"] ?? "smtp.gmail.com";
                var smtpPort = int.Parse(smtpSettings["Port"] ?? "587");
                var smtpUser = smtpSettings["User"];
                var smtpPassword = smtpSettings["Password"];
                var fromEmail = smtpSettings["FromEmail"] ?? smtpUser;
                var fromName = smtpSettings["FromName"] ?? "To Do List";

                if (string.IsNullOrEmpty(smtpUser) || string.IsNullOrEmpty(smtpPassword) || 
                    smtpUser == "your-email@gmail.com" || smtpPassword == "your-app-password")
                {
                    _logger.LogError("SMTP ayarları yapılandırılmamış! Lütfen appsettings.json dosyasında SmtpSettings bölümünü doldurun.");
                    _logger.LogError("User: {User}, Password: {Password}", 
                        string.IsNullOrEmpty(smtpUser) ? "BOŞ" : smtpUser, 
                        string.IsNullOrEmpty(smtpPassword) ? "BOŞ" : "***");
                    throw new InvalidOperationException("SMTP ayarları yapılandırılmamış. Email gönderilemedi.");
                }

                using var client = new SmtpClient(smtpHost, smtpPort)
                {
                    EnableSsl = true,
                    Credentials = new NetworkCredential(smtpUser, smtpPassword)
                };

                var reminderDateStr = reminderDate.ToString("dd.MM.yyyy HH:mm");

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail, fromName),
                    Subject = $"Hatırlatma: {taskName}",
                    Body = $@"
                        <html>
                        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                                <h2 style='color: #0078d4;'>Hatırlatma</h2>
                                <p>Merhaba {userName},</p>
                                <p>Size bir hatırlatma gönderiyoruz:</p>
                                <div style='background-color: #f3f2f1; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                                    <h3 style='margin: 0; color: #323130;'>{taskName}</h3>
                                    <p style='margin: 10px 0 0 0; color: #605e5c;'>Hatırlatma Tarihi: {reminderDateStr}</p>
                                </div>
                                <p>Görevinizi tamamlamayı unutmayın!</p>
                                <p style='color: #666; font-size: 12px; margin-top: 30px;'>Bu bir otomatik e-postadır, lütfen yanıtlamayın.</p>
                            </div>
                        </body>
                        </html>",
                    IsBodyHtml = true
                };

                mailMessage.To.Add(userEmail);

                await client.SendMailAsync(mailMessage);
                _logger.LogInformation($"Hatırlatma emaili gönderildi: {userEmail} - {taskName}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Email gönderme hatası: {userEmail}");
                // Hata durumunda uygulama çalışmaya devam etsin
            }
        }
    }
}

