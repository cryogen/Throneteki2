﻿namespace Throneteki.Web.Controllers.Api;

public class TokenResponse
{
    public string? AccessToken { get; set; }
    public string? TokenType { get; set; }
    public string? RefreshToken { get; set; }
    public int ExpiresIn { get; set; }
}