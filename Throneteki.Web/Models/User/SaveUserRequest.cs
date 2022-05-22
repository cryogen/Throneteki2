using Throneteki.Data.Models;

namespace Throneteki.Web.Models.User;

public class SaveUserRequest
{
    public string? Avatar { get; set; }
    public string? Email { get; set; }
    public string? Username { get; set; }
    public ThronetekiUserSettings Settings { get; set; } = new();
    public string? CustomBackground { get; set; }
}