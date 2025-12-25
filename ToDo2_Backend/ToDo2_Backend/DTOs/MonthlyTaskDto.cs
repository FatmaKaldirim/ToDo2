namespace ToDo2_Backend.DTOs
{
    public class MonthlyTaskDto
    {
        public int MonthlyTaskId { get; set; }
        public int TaskId { get; set; }
        public DateTime MonthDate { get; set; }
        public string TaskName { get; set; }
        public string TaskContent { get; set; }
        public bool IsImportant { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? ReminderDate { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

}
