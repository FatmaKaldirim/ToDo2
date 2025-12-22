using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ToDo2_Backend.Dtos;
using ToDo2_Backend.Models;
using ToDo2_Backend.Repositories;

namespace ToDo2_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotesController : ControllerBase
    {
        private readonly NotesRepository _repo;

        public NotesController(NotesRepository repo)
        {
            _repo = repo;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        [HttpPost("add")]
        public async Task<IActionResult> Add(AddNoteDto dto)
        {
            await _repo.AddNoteAsync(GetUserId(), dto);
            return Ok(new { message = "Not eklendi" });
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyNotes()
        {
            return Ok(await _repo.GetMyNotesAsync(GetUserId()));
        }

        [HttpGet("me/task/{taskId}")]
        public async Task<IActionResult> GetMyNotesByTask(int taskId)
        {
            return Ok(await _repo.GetMyNotesByTaskAsync(GetUserId(), taskId));
        }

        [HttpPut("update")]
        public async Task<IActionResult> Update(NoteModel note)
        {
            await _repo.UpdateNoteAsync(GetUserId(), note);
            return Ok(new { message = "Not güncellendi" });
        }

        [HttpDelete("delete/{noteId}")]
        public async Task<IActionResult> Delete(int noteId)
        {
            await _repo.DeleteNoteAsync(GetUserId(), noteId);
            return Ok(new { message = "Not silindi" });
        }
    }
}
