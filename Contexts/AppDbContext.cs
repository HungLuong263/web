using Microsoft.EntityFrameworkCore;
using ChatApi.Models;

namespace ChatApi.Context
{
  public class AppDbContext : DbContext
  {
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Message> Messages { get; set; }
  }
}
