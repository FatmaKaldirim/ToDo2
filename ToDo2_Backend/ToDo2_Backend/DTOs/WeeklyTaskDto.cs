namespace ToDo2_Backend.DTOs
{
    public class WeeklyTaskDto
    {
        public int WeeklyTaskId { get; set; }
        public int TaskId { get; set; }
        public DateTime WeekStartDate { get; set; }
        public string TaskName { get; set; }
        public string TaskContent { get; set; }
        public bool IsImportant { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? ReminderDate { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

}
