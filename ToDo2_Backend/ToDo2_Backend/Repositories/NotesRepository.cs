using Dapper;
using System.Data.SqlClient;
using ToDo2_Backend.DTOs;
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

        // 1) NOT EKLE
        public async Task AddNoteAsync(AddNoteDto dto)
        {
            await _connection.ExecuteAsync(
                "todo.sp_AddNote",
                new
                {
                    UserID = dto.UserID,
                    TaskID = dto.TaskID,
                    NoteText = dto.NoteText
                },
                commandType: System.Data.CommandType.StoredProcedure
            );
        }

        // 2) KULLANICIYA AİT NOTLARI GETİR
        public async Task<IEnumerable<NoteModel>> GetNotesByUser(int userId)
        {
            return await _connection.QueryAsync<NoteModel>(
                "todo.sp_GetNotesByUser",
                new { UserID = userId },
                commandType: System.Data.CommandType.StoredProcedure
            );
        }

        // 3) TASK'A AİT NOTLARI GETİR
        public async Task<IEnumerable<NoteModel>> GetNotesByTask(int taskId)
        {
            return await _connection.QueryAsync<NoteModel>(
                "todo.sp_GetNotesByTask",
                new { TaskID = taskId },
                commandType: System.Data.CommandType.StoredProcedure
            );
        }
    }
}
