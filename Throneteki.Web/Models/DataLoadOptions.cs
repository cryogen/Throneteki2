namespace Throneteki.Web.Models
{
    public class DataLoadOptions
    {
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
        public IEnumerable<SortOptions>? Sorting { get; set; }
        public IEnumerable<FilterOptions>? Filters { get; set; }
    }
}
