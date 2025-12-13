using ToDoList_Odev_Backend.DTOs.Enums;

namespace ToDoList_Odev_Backend.DTOs
{
    public class TaskUpdateDto
    {
        public int TaskID { get; set; }

        public string? TaskName { get; set; }

        public string? TaskContent { get; set; }

        public DateTime? DueDate { get; set; }

        public DateTime? ReminderDate { get; set; }

        public bool? IsCompleted { get; set; }

        public bool? IsImportant { get; set; }

        //  Nullable enum (update için doğru)
        public RecurrenceTypeEnum? RecurrenceType { get; set; }
    }
}
