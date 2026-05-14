using System.Collections.Generic;

namespace Traceverified.TraceFarm.Dashboards;

public class StatisticalQrCodeSharedPerCusDto(List<string> labels)
{
    public List<string> Labels { get; set; } = labels;
    public List<DatasetQrCodeSharedPerCusDto> Datasets { get; set; } = new();
}

public class DatasetQrCodeSharedPerCusDto(string label, List<int> data, string backgroundColor, string borderColor)
{
    public string Label { get; set; } = label;
    public string BackgroundColor { get; set; } = backgroundColor;
    public string BorderColor { get; set; } = borderColor;
    public List<int> Data { get; set; } = data;
}