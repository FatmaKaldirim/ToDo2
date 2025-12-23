using System.ComponentModel.DataAnnotations;
using ToDo2_Backend.DTOs;

namespace ToDo2_Backend.DTOs
{
    public class AddTaskDto
    {
        [Required]
        public int UserID { get; set; }

        [Required]
        public int ListID { get; set; }

        [Required]
        [MaxLength(200)]
        public string TaskName { get; set; } = string.Empty;

        [Required]
        public TaskType TaskType { get; set; }
    }
}
