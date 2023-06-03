using Microsoft.AspNetCore.Mvc;

namespace Throneteki.Auth.Controllers;

public class HomeController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}