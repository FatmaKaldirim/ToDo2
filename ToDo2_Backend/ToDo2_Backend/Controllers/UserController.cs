using Dapper;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.Data.SqlClient;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using ToDo2_Backend.DTOs;
using ToDo2_Backend.Models;
using ToDo2_Backend.Services.Interfaces;

namespace ToDo2_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly SqlConnection _connection;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(SqlConnection connection, IConfiguration config, IEmailService emailService, ILogger<UsersController> logger)
        {
            _connection = connection;
            _config = config;
            _emailService = emailService;
            _logger = logger;
        }

        // =========================
        // REGISTER
        // =========================
        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            CreatePasswordHash(dto.UserPassword, out byte[] passwordHash, out byte[] passwordSalt);

            var parameters = new DynamicParameters();
            parameters.Add("@UserName", dto.UserName);
            parameters.Add("@UserMail", dto.UserMail);
            parameters.Add("@PasswordHash", passwordHash);
            parameters.Add("@PasswordSalt", passwordSalt);

            int newUserId = await _connection.ExecuteScalarAsync<int>(
                "sp_RegisterUser",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            if (newUserId == -1)
            {
                return BadRequest("Bu email zaten kayıtlı.");
            }
            
            // Stored procedure'dan dönen ID ile tam bir kullanıcı nesnesi oluşturalım.
            // Bu, token oluşturma için gereklidir.
            var user = new User
            {
                UserID = newUserId,
                UserName = dto.UserName,
                UserMail = dto.UserMail,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt
            };

            var token = GenerateJwtToken(user);

            // Email bildirimleri aktifse hoş geldin emaili gönder
            // Her zaman email göndermeyi dene (kullanıcı ayarı varsayılan olarak açık)
            _ = Task.Run(async () =>
            {
                try
                {
                    // Kısa bir gecikme ekle (kayıt işleminin tamamlanması için)
                    await Task.Delay(1000);
                    
                    // Kullanıcı ayarını kontrol et
                    var userSettings = await _connection.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT EmailNotificationsEnabled FROM Users WHERE UserID = @UserID",
                        new { UserID = newUserId }
                    );

                    // Email bildirimleri açıksa veya null ise (varsayılan açık) email gönder
                    if (userSettings?.EmailNotificationsEnabled == true || userSettings?.EmailNotificationsEnabled == null)
                    {
                        await _emailService.SendWelcomeEmailAsync(dto.UserMail, dto.UserName);
                        _logger.LogInformation($"Hoş geldin emaili gönderildi: {dto.UserMail}");
                    }
                    else
                    {
                        _logger.LogInformation($"Kullanıcı email bildirimlerini kapatmış: {dto.UserMail}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Hoş geldin emaili gönderilemedi: {dto.UserMail}");
                    _logger.LogError($"Hata detayı: {ex.Message}");
                    if (ex.InnerException != null)
                    {
                        _logger.LogError($"İç hata: {ex.InnerException.Message}");
                    }
                    // Email gönderilemese bile kayıt başarılı, hata loglanır ama kullanıcıya gösterilmez
                }
            });

            return Ok(new
            {
                message = "Kayıt başarılı",
                userId = newUserId,
                token
            });
        }

        // =========================
        // LOGIN
        // =========================
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _connection.QueryFirstOrDefaultAsync<User>(
                "sp_LoginUser",
                new { UserMail = dto.UserMail },
                commandType: CommandType.StoredProcedure
            );

            if (user == null)
                return Unauthorized("Email veya şifre yanlış.");

            if (!VerifyPassword(dto.UserPassword, user.PasswordHash, user.PasswordSalt))
                return Unauthorized("Email veya şifre yanlış.");

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                message = "Giriş başarılı",
                userId = user.UserID,
                token
            });
        }

        // =========================
        // GET USER INFO
        // =========================
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var user = await _connection.QueryFirstOrDefaultAsync<dynamic>(
                @"SELECT UserID, UserName, UserMail, EmailNotificationsEnabled 
                  FROM Users 
                  WHERE UserID = @UserID",
                new { UserID = userId }
            );

            if (user == null)
            {
                return NotFound("Kullanıcı bulunamadı.");
            }

            return Ok(new
            {
                id = user.UserID,
                name = user.UserName,
                email = user.UserMail,
                emailNotificationsEnabled = user.EmailNotificationsEnabled ?? true
            });
        }

        // =========================
        // UPDATE EMAIL NOTIFICATIONS
        // =========================
        [Authorize]
        [HttpPut("email-notifications")]
        public async Task<IActionResult> UpdateEmailNotifications([FromBody] UpdateEmailNotificationsDto dto)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var parameters = new DynamicParameters();
            parameters.Add("@UserID", userId);
            parameters.Add("@EmailNotificationsEnabled", dto.EmailNotificationsEnabled);

            await _connection.ExecuteAsync(
                "sp_UpdateUserEmailNotifications",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return Ok(new
            {
                message = "Email bildirim ayarı güncellendi",
                emailNotificationsEnabled = dto.EmailNotificationsEnabled
            });
        }

        // =========================
        // GOOGLE LOGIN
        // =========================
        [AllowAnonymous]
        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto dto)
        {
            try
            {
                // Google token'ı doğrula
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _config["Google:ClientId"] }
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(dto.IdToken, settings);

                if (payload == null)
                {
                    return Unauthorized("Geçersiz Google token.");
                }

                // Kullanıcıyı veritabanında ara veya oluştur
                var existingUser = await _connection.QueryFirstOrDefaultAsync<User>(
                    "SELECT * FROM Users WHERE UserMail = @Email",
                    new { Email = payload.Email }
                );

                User user;
                int userId;

                if (existingUser == null)
                {
                    // Yeni kullanıcı oluştur (Google ile giriş yapanlar için şifre yok)
                    var parameters = new DynamicParameters();
                    parameters.Add("@UserName", payload.Name ?? payload.Email.Split('@')[0]);
                    parameters.Add("@UserMail", payload.Email);
                    parameters.Add("@PasswordHash", DBNull.Value);
                    parameters.Add("@PasswordSalt", DBNull.Value);

                    userId = await _connection.ExecuteScalarAsync<int>(
                        "sp_RegisterGoogleUser",
                        parameters,
                        commandType: CommandType.StoredProcedure
                    );

                    if (userId == -1)
                    {
                        return BadRequest("Kullanıcı oluşturulamadı.");
                    }

                    user = new User
                    {
                        UserID = userId,
                        UserName = payload.Name ?? payload.Email.Split('@')[0],
                        UserMail = payload.Email,
                        PasswordHash = null,
                        PasswordSalt = null
                    };

                    // Hoş geldin emaili gönder
                    try
                    {
                        _ = Task.Run(async () =>
                        {
                            try
                            {
                                await _emailService.SendWelcomeEmailAsync(payload.Email, user.UserName);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, "Hoş geldin emaili gönderilemedi");
                            }
                        });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Email gönderme kontrolü sırasında hata");
                    }
                }
                else
                {
                    user = existingUser;
                    userId = existingUser.UserID;
                }

                // JWT token oluştur
                var token = GenerateJwtToken(user);

                return Ok(new
                {
                    message = "Google ile giriş başarılı",
                    userId = userId,
                    token
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Google login hatası");
                return Unauthorized("Google ile giriş başarısız.");
            }
        }

        // =========================
        // GOOGLE LOGIN (SIMPLE - Access Token ile)
        // =========================
        [AllowAnonymous]
        [HttpPost("google-login-simple")]
        public async Task<IActionResult> GoogleLoginSimple([FromBody] GoogleLoginSimpleDto dto)
        {
            try
            {
                // Kullanıcıyı veritabanında ara veya oluştur
                var existingUser = await _connection.QueryFirstOrDefaultAsync<User>(
                    "SELECT * FROM Users WHERE UserMail = @Email",
                    new { Email = dto.Email }
                );

                User user;
                int userId;

                if (existingUser == null)
                {
                    // Yeni kullanıcı oluştur
                    var parameters = new DynamicParameters();
                    parameters.Add("@UserName", dto.Name ?? dto.Email.Split('@')[0]);
                    parameters.Add("@UserMail", dto.Email);
                    parameters.Add("@PasswordHash", DBNull.Value);
                    parameters.Add("@PasswordSalt", DBNull.Value);

                    userId = await _connection.ExecuteScalarAsync<int>(
                        "sp_RegisterGoogleUser",
                        parameters,
                        commandType: CommandType.StoredProcedure
                    );

                    if (userId == -1)
                    {
                        return BadRequest("Kullanıcı oluşturulamadı.");
                    }

                    user = new User
                    {
                        UserID = userId,
                        UserName = dto.Name ?? dto.Email.Split('@')[0],
                        UserMail = dto.Email,
                        PasswordHash = null,
                        PasswordSalt = null
                    };

                    // Hoş geldin emaili gönder
                    try
                    {
                        _ = Task.Run(async () =>
                        {
                            try
                            {
                                await _emailService.SendWelcomeEmailAsync(dto.Email, user.UserName);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, "Hoş geldin emaili gönderilemedi");
                            }
                        });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Email gönderme kontrolü sırasında hata");
                    }
                }
                else
                {
                    user = existingUser;
                    userId = existingUser.UserID;
                }

                // JWT token oluştur
                var token = GenerateJwtToken(user);

                return Ok(new
                {
                    message = "Google ile giriş başarılı",
                    userId = userId,
                    token
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Google login hatası");
                return Unauthorized("Google ile giriş başarısız.");
            }
        }

        // =========================
        // PASSWORD HELPERS
        // =========================
        private void CreatePasswordHash(string password, out byte[] hash, out byte[] salt)
        {
            using var hmac = new HMACSHA512();
            salt = hmac.Key; // 128 byte
            hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password)); // 64 byte
        }

        private bool VerifyPassword(string password, byte[] storedHash, byte[] storedSalt)
        {
            using var hmac = new HMACSHA512(storedSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));

            if (computedHash.Length != storedHash.Length)
                return false;

            for (int i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != storedHash[i])
                    return false;
            }

            return true;
        }

        // =========================
        // JWT
        // =========================
        private string GenerateJwtToken(User user)
        {
            var jwt = _config.GetSection("Jwt");

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
                new Claim(ClaimTypes.Email, user.UserMail),
                new Claim(ClaimTypes.Name, user.UserName)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwt["Key"]!)
            );

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwt["Issuer"],
                audience: jwt["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
