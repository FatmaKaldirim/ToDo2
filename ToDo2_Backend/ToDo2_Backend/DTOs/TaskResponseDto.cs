namespace ToDoList_Odev_Backend.DTOs
{
    public class TaskResponseDto
    {
        public int TaskID { get; set; }
        public string TaskName { get; set; }
        public string? TaskContent { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? ReminderDate { get; set; }
        public bool IsCompleted { get; set; }
        public bool IsImportant { get; set; }
        public string? RecurrenceType { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? ListName { get; set; }
    }
}
