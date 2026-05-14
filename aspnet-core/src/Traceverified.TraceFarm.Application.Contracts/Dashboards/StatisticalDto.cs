namespace Traceverified.TraceFarm.Dashboards;

public class StatisticalDto(string displayTitle, int number)
{
    public string DisplayTitle { get; set; } = displayTitle;
    public int Number { get; set; } = number;
}