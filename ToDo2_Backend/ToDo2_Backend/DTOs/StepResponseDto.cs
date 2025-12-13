namespace ToDoList_Odev_Backend.DTOs
{
    public class StepResponseDto
    {
        public int StepID { get; set; }
        public int TaskID { get; set; }
        public string StepText { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

