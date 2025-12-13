using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Data.SqlClient;
using System.Security.Claims;
using ToDoList_Odev_Backend.DTOs;

namespace ToDoList_Odev_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly SqlConnection _connection;

        public TasksController(SqlConnection connection)
        {
            _connection = connection;
        }

        // ==========================
        // ADD TASK
        // ==========================
        [HttpPost("add")]
        public async Task<IActionResult> AddTask([FromBody] TaskCreateDto dto)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var taskId = await _connection.ExecuteScalarAsync<int>(
                "todo.sp_AddTask",
                new
                {
                    UserID = userId,
                    dto.ListID,
                    dto.TaskName,
                    dto.TaskContent,
                    dto.DueDate,
                    dto.ReminderDate,
                    dto.IsImportant,

                    // 🔥 ENUM → STRING (CHECK constraint uyumlu)
                    RecurrenceType = dto.RecurrenceType.ToString()
                },
                commandType: CommandType.StoredProcedure
            );

            return Ok(new { message = "Task oluşturuldu", taskId });
        }

        // ==========================
        // GET TASKS
        // ==========================
        [HttpGet("list")]
        public async Task<IActionResult> GetTasks()
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var tasks = await _connection.QueryAsync<TaskResponseDto>(
                "todo.sp_GetTasks",
                new { UserID = userId },
                commandType: CommandType.StoredProcedure
            );

            return Ok(tasks);
        }

        // ==========================
        // UPDATE TASK
        // ==========================
        [HttpPut("update")]
        public async Task<IActionResult> UpdateTask([FromBody] TaskUpdateDto dto)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _connection.ExecuteAsync(
                "todo.sp_UpdateTask",
                new
                {
                    dto.TaskID,
                    UserID = userId,
                    dto.TaskName,
                    dto.TaskContent,
                    dto.DueDate,
                    dto.ReminderDate,
                    dto.IsCompleted,
                    dto.IsImportant,

                    // 🔥 Nullable enum → string
                    RecurrenceType = dto.RecurrenceType?.ToString()
                },
                commandType: CommandType.StoredProcedure
            );

            return Ok(new { message = "Task güncellendi" });
        }

        // ==========================
        // DELETE TASK
        // ==========================
        [HttpDelete("delete/{taskId}")]
        public async Task<IActionResult> DeleteTask(int taskId)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _connection.ExecuteAsync(
                "todo.sp_DeleteTask",
                new
                {
                    TaskID = taskId,
                    UserID = userId
                },
                commandType: CommandType.StoredProcedure
            );

            return Ok(new { message = "Task silindi" });
        }
    }
}
