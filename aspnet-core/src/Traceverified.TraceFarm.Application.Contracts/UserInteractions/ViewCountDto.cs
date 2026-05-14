namespace Traceverified.TraceFarm.UserInteractions;

public class ViewCountDto
{
    public int ObjectType { get; set; }
    public string ObjectId { get; set; } = string.Empty;
    public string DeviceId { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}