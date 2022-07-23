
using OpenIddict.Validation.AspNetCore;
using Throneteki.Lobby;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("DontCare", policyBuilder => policyBuilder.WithOrigins("https://localhost:44460").AllowAnyHeader().AllowAnyMethod().AllowCredentials());
});

builder.Services.AddOpenIddict()
    .AddValidation(options =>
    {
        options.SetIssuer("https://localhost:44460/");
        options.AddAudiences("throneteki-lobby");

        options.UseIntrospection()
            .SetClientId("throneteki-lobby")
            .SetClientSecret("E4A95BCD-C8F8-45C4-A89A-6F7B62CF840F");

        options.UseSystemNetHttp();
        options.UseAspNetCore();
    });

builder.Services.AddAuthentication(OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseCors("DontCare");

app.MapHub<LobbyHub>("/lobbyhub");

app.Run();
