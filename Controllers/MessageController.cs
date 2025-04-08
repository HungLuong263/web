using System.Security.Claims;
using ChatApi.Context;
using ChatApi.Services;
using ChatApi.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;

namespace ChatApi.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class MessageController : ControllerBase
  {
    private readonly IMessageService _messageService;
    private readonly IHubContext<ChatHub> _hubContext;

    public MessageController(IMessageService messageService, IHubContext<ChatHub> hubContext)
    {
      _messageService = messageService;
      _hubContext = hubContext;
    }

    [HttpPost("send")]
    [Authorize]
    public async Task<IActionResult> Send(
      [FromForm] string? text,
      [FromForm] IFormFile? file)
    {
      var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
      if (userIdClaim == null)
      {
        return Unauthorized();
      }
      int userId = int.Parse(userIdClaim.Value);

      var message = await _messageService.SendMessageAsync(file, userId, text);

      await _hubContext.Clients.All.SendAsync("ReceiveMessage", new
      {
        Id = message.Id,
        Text = message.Text,
        UserId = message.UserId,
        Timestamp = message.Timestamp,
        FileName = message.FileName,
        FileType = message.FileType
      });

      return Ok(message);
    }

    [HttpGet("history")]
    [Authorize]
    public async Task<IActionResult> History()
    {
      var messages = await _messageService.GetMessageHistoryAsync();
      return Ok(messages);
    }

    [HttpGet("file/{messageId}")]
    public async Task<IActionResult> GetFile(int messageId, [FromServices] AppDbContext db)
    {
      var message = await db.Messages
                            .Include(m => m.User)
                            .FirstOrDefaultAsync(m => m.Id == messageId);
      if (message == null || message.FileData == null)
      {
        return NotFound();
      }
      return File(message.FileData, message.FileType, message.FileName);
    }
  }
}
