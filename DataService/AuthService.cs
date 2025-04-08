using ChatApi.Context;
using ChatApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ChatApi.Services
{
  public class AuthService : IAuthService
  {
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext context, IConfiguration config)
    {
      _context = context;
      _config = config;
    }

    public async Task<User> RegisterAsync(User user)
    {

      _context.Users.Add(user);
      await _context.SaveChangesAsync();
      return user;
    }

    public async Task<User> GetProfileAsync(int userId)
    {
      return await _context.Users.FirstOrDefaultAsync(u => u.Id == userId)!;
    }

    public async Task<User> GetUserById(int userId)
    {
      return await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<LoginResult> LoginAsync(LoginModel loginModel)
    {
      var user = await _context.Users.FirstOrDefaultAsync(u =>
          u.Username == loginModel.Username && u.Password == loginModel.Password);

      if (user == null)
        return null;


      var tokenHandler = new JwtSecurityTokenHandler();
      var key = Encoding.ASCII.GetBytes(_config["JwtSettings:SecretKey"]!);
      var tokenDescriptor = new SecurityTokenDescriptor
      {
        Subject = new ClaimsIdentity(new Claim[]
          {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
          }),
        Expires = DateTime.UtcNow.AddHours(1),
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
      };
      var token = tokenHandler.CreateToken(tokenDescriptor);
      return new LoginResult
      {
        Token = tokenHandler.WriteToken(token),
        Username = user.Username
      };
    }
  }
}
