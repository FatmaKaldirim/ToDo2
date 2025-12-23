using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Data.SqlClient;
using System.Security.Claims;
using ToDoList_Odev_Backend.DTOs;
using ToDo2_Backend.DTOs;

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
        // ADD TASK WITH PLAN
        // Uses: todo.sp_AddTaskWithPlan (50.sp_AddTaskWithPlan.sql)
        // Automatically adds task to DailyTasks, WeeklyTasks, or MonthlyTasks based on TaskType
        // Triggers: trg_TaskCompletedDate (53.Trigger.sql) will set CompletedAt when task is completed
        // ==========================
        [HttpPost("add-with-plan")]
        public async Task<IActionResult> AddTaskWithPlan([FromBody] AddTaskDto dto)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            // Validate that the list belongs to the user
            var listExists = await _connection.QueryFirstOrDefaultAsync<int?>(
                "SELECT ListID FROM todo.Lists WHERE ListID = @ListID AND UserID = @UserID",
                new { ListID = dto.ListID, UserID = userId }
            );

            if (listExists == null)
            {
                return BadRequest(new { message = "Liste kullanıcıya ait değil veya bulunamadı." });
            }

            try
            {
                await _connection.ExecuteAsync(
                    "todo.sp_AddTaskWithPlan",
                    new
                    {
                        UserID = userId,
                        ListID = dto.ListID,
                        TaskName = dto.TaskName,
                        // Convert enum to string: Daily, Weekly, Monthly
                        TaskType = dto.TaskType.ToString()
                    },
                    commandType: CommandType.StoredProcedure
                );

                return Ok(new { message = "Task plan ile oluşturuldu", taskType = dto.TaskType.ToString() });
            }
            catch (SqlException ex)
            {
                return BadRequest(new { message = "Task oluşturulurken hata oluştu", error = ex.Message });
            }
        }

        // ==========================
        // GET ALL TASKS FOR USER
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
        // GET TASKS BY LIST
        // ==========================
        [HttpGet("list/{listId}")]
        public async Task<IActionResult> GetTasksByList(int listId)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var tasks = await _connection.QueryAsync<TaskResponseDto>(
                "todo.sp_GetTasksByList",
                new { UserID = userId, ListID = listId },
                commandType: CommandType.StoredProcedure
            );

            return Ok(tasks);
        }

        // ==========================
        // SEARCH TASKS
        // ==========================
        [HttpGet("search/{keyword}")]
        public async Task<IActionResult> SearchTasks(string keyword)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var tasks = await _connection.QueryAsync<TaskResponseDto>(
                "todo.sp_SearchTasks",
                new { UserID = userId, Keyword = keyword },
                commandType: CommandType.StoredProcedure
            );

            return Ok(tasks);
        }


        // ==========================
        // UPDATE TASK
        // Triggers:
        // - trg_TaskCompletedDate (53.Trigger.sql): Sets CompletedAt when IsCompleted changes from 0 to 1
        // - trg_RemoveCompletedTaskFromPlans (52.trg_RemoveCompletedTaskFromPlans.sql): Removes task from DailyTasks/WeeklyTasks/MonthlyTasks when completed
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
