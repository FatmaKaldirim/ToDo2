using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/plans")]
[Authorize]
public class PlansController : ControllerBase
{
    private readonly IPlanService _service;

    public PlansController(IPlanService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetPlans()
    {
        int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        return Ok(await _service.GetPlansAsync(userId));
    }
}
