using Microsoft.AspNetCore.Mvc;
using ToDo2_Backend.Services.Interfaces;

[ApiController]
[Route("api/daily-tasks")]
public class DailyTasksController : ControllerBase
{
    private readonly IDailyTaskService _service;

    public DailyTasksController(IDailyTaskService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Add(int taskId, DateTime date)
    {
        await _service.AddDailyTask(taskId, date);
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Remove(int id)
    {
        await _service.RemoveDailyTask(id);
        return Ok();
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> Get(int userId, [FromQuery] bool includePast = false)
    {
        var result = await _service.GetDailyTasks(userId, includePast);
        return Ok(result);
    }
}
