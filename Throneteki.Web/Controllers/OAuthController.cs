using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;

namespace Throneteki.Web.Controllers
{
    public class OAuthController : Controller
    {
        [HttpGet("/connect/link-tdb")]
        public IActionResult LinkThronesDb()
        {
            if (User.Identity is not { IsAuthenticated: true })
            {
                return Unauthorized();
            }

            var authProperties = new AuthenticationProperties
            {
                RedirectUri = "/decks/thronesdb"
            };

            authProperties.Items.Add("UserId", User.Identity.Name);

            return Challenge(authProperties, "ThronesDB");
        }
    }
}
