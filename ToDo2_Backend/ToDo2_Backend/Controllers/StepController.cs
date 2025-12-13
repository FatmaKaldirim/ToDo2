using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using System.Security.Claims;
using ToDoList_Odev_Backend.DTOs;

namespace ToDoList_Odev_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StepsController : ControllerBase
    {
        private readonly SqlConnection _connection;

        public StepsController(SqlConnection connection)
        {
            _connection = connection;
        }

        // STEP EKLE
        [HttpPost("add")]
        public async Task<IActionResult> AddStep([FromBody] StepCreateDto dto)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var stepId = await _connection.ExecuteScalarAsync<int>(
                "todo.sp_AddStep",
                new
                {
                    TaskID = dto.TaskID,
                    UserID = userId,
                    StepText = dto.StepText
                },
                commandType: System.Data.CommandType.StoredProcedure
            );

            return Ok(new { message = "Step eklendi", stepId });
        }

        // TASK'E AİT STEPLERİ GETİR
        [HttpGet("task/{taskId}")]
        public async Task<IActionResult> GetStepsByTask(int taskId)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var steps = await _connection.QueryAsync<StepResponseDto>(
                "todo.sp_GetStepsByTask",
                new
                {
                    TaskID = taskId,
                    UserID = userId
                },
                commandType: System.Data.CommandType.StoredProcedure
            );

            return Ok(steps);
        }

        // STEP GÜNCELLE
        [HttpPut("update")]
        public async Task<IActionResult> UpdateStep([FromBody] StepUpdateDto dto)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _connection.ExecuteAsync(
                "todo.sp_UpdateStep",
                new
                {
                    StepID = dto.StepID,
                    UserID = userId,
                    StepText = dto.StepText,
                    IsCompleted = dto.IsCompleted
                },
                commandType: System.Data.CommandType.StoredProcedure
            );

            return Ok(new { message = "Step güncellendi" });
        }

        // STEP SİL
        [HttpDelete("delete/{stepId}")]
        public async Task<IActionResult> DeleteStep(int stepId)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _connection.ExecuteAsync(
                "todo.sp_DeleteStep",
                new
                {
                    StepID = stepId,
                    UserID = userId
                },
                commandType: System.Data.CommandType.StoredProcedure
            );

            return Ok(new { message = "Step silindi" });
        }
    }
}
