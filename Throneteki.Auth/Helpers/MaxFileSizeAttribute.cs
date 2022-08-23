using System.Collections;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace Throneteki.Auth.Helpers;

public class MaxFileSizeAttribute : ValidationAttribute
{
    private readonly int maxFileSize;

    public MaxFileSizeAttribute(int maxFileSize)
    {
        this.maxFileSize = maxFileSize;
    }

    protected override ValidationResult IsValid(object? value, ValidationContext validationContext)
    {
        if (value is not IFormFile file)
        {
            return ValidationResult.Success!;
        }

        return file.Length > maxFileSize ? new ValidationResult(GetErrorMessage()) : ValidationResult.Success!;
    }

    public string GetErrorMessage()
    {
        return $"Maximum allowed file size is {maxFileSize} bytes.";
    }
}