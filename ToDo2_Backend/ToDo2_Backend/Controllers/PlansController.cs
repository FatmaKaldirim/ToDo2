using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/plans")]
public class PlansController : ControllerBase
{
    private readonly IPlanService _service;

    public PlansController(IPlanService service)
    {
        _service = service;
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetPlans(int userId)
    {
        return Ok(await _service.GetPlansAsync(userId));
    }
}
