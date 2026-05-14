using System.Collections.Generic;

namespace Traceverified.TraceFarm.Dashboards;

public class StatisticalQrCodeSharedDto(List<string> labels)
{
    public List<string> Labels { get; set; } = labels;
    public List<DatasetQrCodeSharedDto> Datasets { get; set; } = new();
}

public class DatasetQrCodeSharedDto(string label, List<int> data, string backgroundColor, string borderColor)
{
    public string Label { get; set; } = label;
    public string BackgroundColor { get; set; } = backgroundColor;
    public string BorderColor { get; set; } = borderColor;
    public List<int> Data { get; set; } = data;
}