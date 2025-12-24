using Dapper;
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

namespace ToDo2_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly SqlConnection _connection;
        private readonly IConfiguration _config;

        public UsersController(SqlConnection connection, IConfiguration config)
        {
            _connection = connection;
            _config = config;
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
                @"SELECT UserID, UserName, UserMail 
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
                email = user.UserMail
            });
        }

        // =========================
        // UPDATE USER PROFILE
        // =========================
        [Authorize]
        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            // Email kontrolü (başka bir kullanıcı tarafından kullanılıyor mu?)
            var existingUser = await _connection.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT UserID FROM Users WHERE UserMail = @Email AND UserID != @UserID",
                new { Email = dto.Email, UserID = userId }
            );

            if (existingUser != null)
            {
                return BadRequest("Bu email adresi başka bir kullanıcı tarafından kullanılıyor.");
            }

            await _connection.ExecuteAsync(
                @"UPDATE Users 
                  SET UserName = @UserName, UserMail = @Email 
                  WHERE UserID = @UserID",
                new { UserID = userId, UserName = dto.Name, Email = dto.Email }
            );

            return Ok(new
            {
                message = "Profil güncellendi",
                name = dto.Name,
                email = dto.Email
            });
        }

        // =========================
        // DELETE USER ACCOUNT
        // =========================
        [Authorize]
        [HttpDelete("delete-account")]
        public async Task<IActionResult> DeleteAccount()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            // Kullanıcıyı sil (CASCADE ile ilgili tüm veriler silinecek)
            await _connection.ExecuteAsync(
                "DELETE FROM Users WHERE UserID = @UserID",
                new { UserID = userId }
            );

            return Ok(new { message = "Hesap silindi" });
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
