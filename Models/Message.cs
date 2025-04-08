namespace ChatApi.Models
{
  public class Message
  {
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Text { get; set; } = string.Empty;


    public byte[]? FileData { get; set; }
    public string? FileName { get; set; }
    public string? FileType { get; set; }

    public DateTime Timestamp { get; set; }


    public User? User { get; set; }
  }
}
