using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
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
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var existingUser = await _connection.QueryFirstOrDefaultAsync<User>(
                "SELECT * FROM Users WHERE UserMail = @mail",
                new { mail = dto.UserMail }
            );

            if (existingUser != null)
                return BadRequest("Bu email zaten kayıtlı.");

            CreatePasswordHash(dto.UserPassword, out byte[] passwordHash, out byte[] passwordSalt);

            var insertSql = @"
                INSERT INTO Users (UserName, UserMail, PasswordHash, PasswordSalt)
                VALUES (@UserName, @UserMail, @PasswordHash, @PasswordSalt);
                SELECT CAST(SCOPE_IDENTITY() AS INT);
            ";

            int newUserId = await _connection.ExecuteScalarAsync<int>(insertSql, new
            {
                dto.UserName,
                dto.UserMail,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt
            });

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
                token
            });
        }

        // =========================
        // LOGIN
        // =========================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _connection.QueryFirstOrDefaultAsync<User>(
                "SELECT * FROM Users WHERE UserMail = @mail",
                new { mail = dto.UserMail }
            );

            if (user == null)
                return Unauthorized("Email veya şifre yanlış.");

            if (!VerifyPassword(dto.UserPassword, user.PasswordHash, user.PasswordSalt))
                return Unauthorized("Email veya şifre yanlış.");

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                message = "Giriş başarılı",
                token
            });
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

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var expires = DateTime.UtcNow.AddHours(24);

            var token = new JwtSecurityToken(
                issuer: jwt["Issuer"],
                audience: jwt["Audience"],
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
