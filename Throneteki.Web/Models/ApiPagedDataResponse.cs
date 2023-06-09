namespace Throneteki.Web.Models;

public class ApiPagedDataResponse<T> : ApiDataResponse<T>
{
    public int TotalCount { get; set; }
}