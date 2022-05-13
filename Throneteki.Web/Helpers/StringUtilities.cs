using System.Security.Cryptography;

namespace Throneteki.Web.Helpers;

public static class StringUtilities
{
    public static string GetRandomString(int charCount)
    {
        var randomNumber = new byte[charCount];
        using var rng = RandomNumberGenerator.Create();

        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}