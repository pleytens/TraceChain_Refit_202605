namespace Traceverified.TraceFarm.Locations;

public class LocationCountry : BaseLocation
{
    public string LanguageCode { get; set; }
    public string? CurrencyCode { get; set; }
    public string? CurrencySymbol { get; set; }
    public string? CurrencyName { get; set; }
    public string? FormalName { get; set; }
    public string? TelephoneCode { get; set; }
}