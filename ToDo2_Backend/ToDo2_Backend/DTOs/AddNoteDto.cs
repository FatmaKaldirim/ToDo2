namespace ToDo2_Backend.Dtos
{
    public class AddNoteDto
    {
        public int? TaskID { get; set; }
        public string NoteText { get; set; } = string.Empty;
    }
}
