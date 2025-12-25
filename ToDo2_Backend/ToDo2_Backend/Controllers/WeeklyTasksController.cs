using Microsoft.AspNetCore.Mvc;
using ToDo2_Backend.Services.Interfaces;

[ApiController]
[Route("api/weekly-tasks")]
public class WeeklyTasksController : ControllerBase
{
    private readonly IWeeklyTaskService _service;

    public WeeklyTasksController(IWeeklyTaskService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Add(int taskId, DateTime weekStart)
    {
        await _service.AddWeeklyTask(taskId, weekStart);
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Remove(int id)
    {
        await _service.RemoveWeeklyTask(id);
        return Ok();
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> Get(int userId, [FromQuery] bool includePast = false)
    {
        return Ok(await _service.GetWeeklyTasks(userId, includePast));
    }
}
