namespace ChatApi.Models
{
  public class LoginModel
  {
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
  }
  public class LoginResult
  {
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
  }
}
