using Microsoft.AspNetCore.Mvc;
using ToDo2_Backend.Services.Interfaces;

namespace ToDo2_Backend.Controllers
{
    [ApiController]
    [Route("api/monthly-tasks")]
    public class MonthlyTaskController : ControllerBase
    {
        private readonly IMonthlyTaskService _service;

        public MonthlyTaskController(IMonthlyTaskService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Add(int taskId, DateTime monthDate)
        {
            await _service.AddMonthlyTask(taskId, monthDate);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Remove(int id)
        {
            await _service.RemoveMonthlyTask(id);
            return Ok();
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> Get(int userId, [FromQuery] bool includePast = false)
        {
            return Ok(await _service.GetMonthlyTasks(userId, includePast));
        }
    }
}

