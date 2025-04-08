using ChatApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace ChatApi.Hubs
{
  [Authorize]
  public class ChatHub : Hub
  {
    private readonly IMessageService _messageService;
    public ChatHub(IMessageService messageService)
    {
      _messageService = messageService;
    }


    public async Task JoinChat()
    {

      var messages = await _messageService.GetMessageHistoryAsync();
      await Clients.Caller.SendAsync("LoadMessages", messages);
    }


    public async Task SendMessage(string text)
    {

      var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier);
      if (userIdClaim == null)
        return;

      int userId = int.Parse(userIdClaim.Value);


      var message = await _messageService.SendMessageAsync(null, userId, text);

      await Clients.All.SendAsync("ReceiveMessage", new
      {
        User = new { Username = Context.User?.Identity?.Name ?? "Unknown" },
        Text = text,
        Timestamp = message.Timestamp
      });
    }
    private static readonly ConcurrentDictionary<string, string> OnlineUsers = new ConcurrentDictionary<string, string>();

    public override async Task OnConnectedAsync()
    {

      var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
      var username = Context.User?.Identity?.Name;

      if (userId != null && username != null)
      {
        OnlineUsers[Context.ConnectionId] = username;

        await Clients.All.SendAsync("UserOnline", OnlineUsers.Values.Distinct());
      }
      await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {

      OnlineUsers.TryRemove(Context.ConnectionId, out var removedUsername);
      await Clients.All.SendAsync("UserOnline", OnlineUsers.Values.Distinct());
      await base.OnDisconnectedAsync(exception);
    }
  }
}
