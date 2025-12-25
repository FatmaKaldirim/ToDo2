namespace ToDo2_Backend.DTOs
{
    public class DailyTaskDto
    {
        public int DailyTaskID { get; set; }
        public int TaskID { get; set; }
        public DateTime TaskDate { get; set; }
        public string TaskName { get; set; }
        public string TaskContent { get; set; }
        public bool IsImportant { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? ReminderDate { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

}
