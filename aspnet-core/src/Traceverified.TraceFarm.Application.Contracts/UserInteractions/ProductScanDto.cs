
using System;

namespace Traceverified.TraceFarm.UserInteractions;

public class ProductScanDto
{
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string GtinCode { get; set; } = string.Empty;
    public long NumberOfScans { get; set; } = 0;
}