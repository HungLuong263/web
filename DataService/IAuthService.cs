using ChatApi.Models;

namespace ChatApi.Services
{
  public interface IAuthService
  {
    Task<User> RegisterAsync(User user);
    Task<LoginResult?> LoginAsync(LoginModel loginModel);
    Task<User> GetUserById(int userId);
  }
}
