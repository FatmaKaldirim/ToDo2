using Dapper;
using System.Data;
using System.Data.SqlClient;
using ToDo2_Backend.Dtos;
using ToDo2_Backend.Models;

namespace ToDo2_Backend.Repositories
{
    public class NotesRepository
    {
        private readonly SqlConnection _connection;

        public NotesRepository(SqlConnection connection)
        {
            _connection = connection;
        }

        public async Task AddNoteAsync(int userId, AddNoteDto dto)
        {
            await _connection.ExecuteAsync(
                "todo.sp_AddNote",
                new { UserID = userId, TaskID = dto.TaskID, NoteText = dto.NoteText },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<IEnumerable<NoteModel>> GetMyNotesAsync(int userId)
        {
            return await _connection.QueryAsync<NoteModel>(
                "todo.sp_GetNotesByUser",
                new { UserID = userId },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<IEnumerable<NoteModel>> GetMyNotesByTaskAsync(int userId, int taskId)
        {
            return await _connection.QueryAsync<NoteModel>(
                "todo.sp_GetNotesByTask",
                new { UserID = userId, TaskID = taskId },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task UpdateNoteAsync(int userId, NoteModel note)
        {
            await _connection.ExecuteAsync(
                "todo.sp_UpdateNote",
                new { UserID = userId, NoteID = note.NoteID, NoteText = note.NoteText },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task DeleteNoteAsync(int userId, int noteId)
        {
            // Note: todo.sp_DeleteNote should be altered to accept UserID for security.
            await _connection.ExecuteAsync(
                "todo.sp_DeleteNote",
                new { UserID = userId, NoteID = noteId }, 
                commandType: CommandType.StoredProcedure
            );
        }
    }
}
