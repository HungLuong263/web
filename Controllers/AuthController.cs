using System.ComponentModel;
using System.Security.Claims;
using ChatApi.Models;
using ChatApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace ChatApi.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class AuthController : ControllerBase
  {
    private readonly IAuthService _authService;
    public AuthController(IAuthService authService)
    {
      _authService = authService;
    }

    [HttpGet("profile")]
    public Task<string> GetProfile()
    {
      var identity = HttpContext.User.Identity as ClaimsIdentity;
      if (identity != null && identity.IsAuthenticated)
      {
        var usernameClaim = identity.FindFirst(ClaimTypes.Name);
        if (usernameClaim != null)
        {
          return Task.FromResult(usernameClaim.Value);
        }
      }
      return Task.FromResult("Unauthorized");
    }
    [HttpGet("userById/{userId}")]
    [Authorize]
    public async Task<string> GetUserById([FromRoute] string userId)
    {
      var id = int.Parse(userId);
      var user = await _authService.GetUserById(id);
      if (user != null)
      {
        return await Task.FromResult(user.Username);
      }
      return await Task.FromResult("User not found");
    }


    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] User user)
    {
      var registeredUser = await _authService.RegisterAsync(user);
      return CreatedAtAction(nameof(Register), new { id = registeredUser.Id }, registeredUser);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel loginModel)
    {
      var result = await _authService.LoginAsync(loginModel);
      if (result == null)
        return Unauthorized();

      return Ok(result);
    }
  }
}
