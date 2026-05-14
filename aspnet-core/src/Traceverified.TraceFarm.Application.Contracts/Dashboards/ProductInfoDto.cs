using System;

namespace Traceverified.TraceFarm.Dashboards;

public class ProductInfoDto
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public string ProductName { get; set; }
    public string GtinCode { get; set; }
    public string CompanyName { get; set; }
    public bool IsExpired { get; set; }
    public string Email { get; set; }
    public DateTime CreationTime { get; set; }
}