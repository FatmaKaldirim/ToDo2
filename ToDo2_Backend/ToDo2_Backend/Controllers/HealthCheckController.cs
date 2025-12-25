using Dapper;
using Microsoft.AspNetCore.Mvc;
using System.Data;
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

        // =========================
        // HEALTH CHECK
        // Uses: sp_HealthCheck (66.sp_HealthCheck.sql)
        // =========================
        [HttpGet]
        public async Task<IActionResult> Check()
        {
            try
            {
                var result = await _connection.QueryFirstOrDefaultAsync<dynamic>(
                    "sp_HealthCheck",
                    commandType: CommandType.StoredProcedure
                );

                if (result != null && result.IsHealthy == true)
                {
                    return Ok(new
                    {
                        isHealthy = true,
                        message = result.Message,
                        userCount = result.UserCount,
                        taskCount = result.TaskCount,
                        listCount = result.ListCount,
                        noteCount = result.NoteCount,
                        checkTime = result.CheckTime
                    });
                }
                else
                {
                    return StatusCode(500, new
                    {
                        isHealthy = false,
                        message = result?.Message ?? "Veritabanı sağlık kontrolü başarısız."
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    isHealthy = false,
                    message = $"Database connection failed: {ex.Message}"
                });
            }
        }
    }
}
