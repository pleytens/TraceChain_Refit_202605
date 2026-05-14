namespace Traceverified.TraceFarm.Share;

public class RequestCustomDto
{
    public int SkipCount { get; set; } = 0;
    public int MaxResultCount { get; set; } = 0;
    public string? Sorting { get; set; }
    public string? Filter { get; set; }
}