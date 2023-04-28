using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Throneteki.Data.Converters;

public class DateTimeConverter : ValueConverter<DateTime, DateTime>
{
    public DateTimeConverter() :
        base(date => DateTime.SpecifyKind(date, DateTimeKind.Utc), date => DateTime.SpecifyKind(date, DateTimeKind.Utc))
    {
    }
}