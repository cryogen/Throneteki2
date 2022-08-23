using Throneteki.Data.Models;

namespace Throneteki.Web.Models.User;

public class SaveUserRequest
{
    public ThronetekiUserSettings Settings { get; set; } = new();
    public string? CustomBackground { get; set; }
}