using Microsoft.AspNetCore.Mvc;
using ToDo2_Backend.DTOs;
using ToDo2_Backend.Repositories;

namespace ToDo2_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotesController : ControllerBase
    {
        private readonly NotesRepository _notesRepo;

        public NotesController(NotesRepository notesRepo)
        {
            _notesRepo = notesRepo;
        }

        // 1) NOT EKLE
        [HttpPost("add")]
        public async Task<IActionResult> AddNote(AddNoteDto dto)
        {
            await _notesRepo.AddNoteAsync(dto);
            return Ok("Not eklendi.");
        }

        // 2) KULLANICIYA AİT NOTLAR
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetNotesByUser(int userId)
        {
            var notes = await _notesRepo.GetNotesByUser(userId);
            return Ok(notes);
        }

        // 3) TASK'A AİT NOTLAR
        [HttpGet("task/{taskId}")]
        public async Task<IActionResult> GetNotesByTask(int taskId)
        {
            var notes = await _notesRepo.GetNotesByTask(taskId);
            return Ok(notes);
        }
    }
}
