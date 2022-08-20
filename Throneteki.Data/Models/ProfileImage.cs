namespace Throneteki.Data.Models;

public class ProfileImage
{
    public Guid Id { get; set; }
    public byte[] Image { get; set; } = Enumerable.Empty<byte>().ToArray();
}