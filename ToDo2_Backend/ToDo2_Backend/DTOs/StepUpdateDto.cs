namespace ToDoList_Odev_Backend.DTOs
{
    public class StepUpdateDto
    {
        public int StepID { get; set; }
        public string? StepText { get; set; }
        public bool? IsCompleted { get; set; }
    }
}
