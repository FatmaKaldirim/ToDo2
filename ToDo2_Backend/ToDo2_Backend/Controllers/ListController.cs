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
    public class ListsController : ControllerBase
    {
        private readonly SqlConnection _connection;

        public ListsController(SqlConnection connection)
        {
            _connection = connection;
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddList([FromBody] ListCreateDto dto)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var listId = await _connection.ExecuteScalarAsync<int>(
                "todo.sp_AddList",
                new { UserID = userId, ListName = dto.ListName },
                commandType: System.Data.CommandType.StoredProcedure
            );

            return Ok(new { message = "Liste oluşturuldu", listId });
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetLists()
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var lists = await _connection.QueryAsync<ListResponseDto>(
                "todo.sp_GetLists",
                new { UserID = userId },
                commandType: System.Data.CommandType.StoredProcedure
            );

            return Ok(lists);
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateList([FromBody] ListUpdateDto dto)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _connection.ExecuteAsync(
                "todo.sp_UpdateList",
                new
                {
                    ListID = dto.ListID,
                    UserID = userId,
                    ListName = dto.ListName
                },
                commandType: System.Data.CommandType.StoredProcedure
            );

            return Ok(new { message = "Liste güncellendi" });
        }

        [HttpDelete("delete/{listId}")]
        public async Task<IActionResult> DeleteList(int listId)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _connection.ExecuteAsync(
                "todo.sp_DeleteList",
                new { ListID = listId, UserID = userId },
                commandType: System.Data.CommandType.StoredProcedure
            );

            return Ok(new { message = "Liste silindi" });
        }
    }
}
