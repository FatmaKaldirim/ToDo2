using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;

namespace ToDo2_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthCheckController : ControllerBase
    {
        private readonly SqlConnection _connection;

        public HealthCheckController(SqlConnection connection)
        {
            _connection = connection;
        }

        [HttpGet]
        public IActionResult Check()
        {
            try
            {
                _connection.Open();
                var query = "SELECT COUNT(*) FROM Users";
                using (var command = new SqlCommand(query, _connection))
                {
                    var count = (int)command.ExecuteScalar();
                    return Ok($"Database connection successful. Users table has {count} rows.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database connection failed: {ex.Message}");
            }
            finally
            {
                if (_connection.State == System.Data.ConnectionState.Open)
                {
                    _connection.Close();
                }
            }
        }
    }
}
