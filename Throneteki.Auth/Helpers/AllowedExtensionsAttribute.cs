using System.ComponentModel.DataAnnotations;

namespace Throneteki.Auth.Helpers;

public class AllowedExtensionsAttribute : ValidationAttribute
{
    private readonly string[] extensions;

    public AllowedExtensionsAttribute(string[] extensions)
    {
        this.extensions = extensions;
    }

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is not IFormFile file)
        {
            return ValidationResult.Success!;
        }

        var extension = Path.GetExtension(file.FileName);

        return !extensions.Contains(extension.ToLower()) ? new ValidationResult(GetErrorMessage()) : ValidationResult.Success;
    }

    public string GetErrorMessage()
    {
        return "Unsupported image format.";
    }
}