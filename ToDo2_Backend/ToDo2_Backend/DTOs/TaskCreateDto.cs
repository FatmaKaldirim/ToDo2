using System.Text.Json.Serialization;
using ToDoList_Odev_Backend.DTOs.Enums;



public class TaskCreateDto
{
    public int? ListID { get; set; }
    public string TaskName { get; set; } = null!;
    public string? TaskContent { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? ReminderDate { get; set; }
    public bool IsImportant { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public RecurrenceTypeEnum RecurrenceType { get; set; } = RecurrenceTypeEnum.none;
}
