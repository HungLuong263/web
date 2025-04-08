using ChatApi.Models;

namespace ChatApi.Services
{
  public interface IMessageService
  {
    Task<Message> SendMessageAsync(IFormFile? file, int userId, string text);
    Task<List<Message>> GetMessageHistoryAsync();
  }
}
