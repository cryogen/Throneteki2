namespace Throneteki.Web.Models.User;

public class AdminSaveUserRequest
{
    public bool Disabled { get; set; }
    public bool Verified { get; set; }
    public Dictionary<string, bool> Permissions { get; set; } = new();
}