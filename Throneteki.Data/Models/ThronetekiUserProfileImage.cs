namespace Throneteki.Data.Models;

public class ThronetekiUserProfileImage
{
    public Guid ThronetekiUserProfileImageId { get; set; }
    public byte[] Image { get; set; } = Enumerable.Empty<byte>().ToArray();
}