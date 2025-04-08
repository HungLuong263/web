using ChatApi.Context;
using ChatApi.Models;
using Microsoft.EntityFrameworkCore;
using System.IO;

namespace ChatApi.Services
{
  public class MessageService : IMessageService
  {
    private readonly AppDbContext _context;

    public MessageService(AppDbContext context)
    {
      _context = context;
    }

    public async Task<Message> SendMessageAsync(IFormFile? file, int userId, string text)
    {
      var message = new Message
      {
        UserId = userId,
        Text = string.IsNullOrWhiteSpace(text) ? "" : text,
        Timestamp = DateTime.UtcNow
      };

      if (file != null)
      {
        using (var memoryStream = new MemoryStream())
        {
          await file.CopyToAsync(memoryStream);
          message.FileData = memoryStream.ToArray();
        }
        message.FileName = file.FileName;
        message.FileType = file.ContentType;
      }

      _context.Messages.Add(message);
      await _context.SaveChangesAsync();
      return message;
    }


    public async Task<List<Message>> GetMessageHistoryAsync()
    {
      return await _context.Messages
                           .Include(m => m.User)
                           .OrderBy(m => m.Timestamp)
                           .ToListAsync();
    }
  }
}
