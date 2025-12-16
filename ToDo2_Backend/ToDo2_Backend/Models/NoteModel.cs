namespace ToDo2_Backend.Models
{
    public class NoteModel
    {
        public int NoteID { get; set; }
        public int UserID { get; set; }
        public int? TaskID { get; set; }   // Task’a bağlı olmayabilir
        public string NoteText { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
