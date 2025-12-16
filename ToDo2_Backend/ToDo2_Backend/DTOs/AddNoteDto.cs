namespace ToDo2_Backend.DTOs
{
    public class AddNoteDto
    {
        public int UserID { get; set; }
        public int? TaskID { get; set; }  // İsteğe bağlı
        public string NoteText { get; set; } = string.Empty;
    }
}
