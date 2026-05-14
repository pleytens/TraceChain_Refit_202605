using System;
using System.Collections.Generic;

namespace Traceverified.TraceFarm.CompanyTraceabilityReports;

public class CompanyTraceabilityReportDto
{
    public Guid CompanyId { get; set; }
    public string CompanyName { get; set; }
    public string ProductName { get; set; }
    public int NumberOfProducts { get; set; }
    public List<SupplierDto> Suppliers { get; set; }
    public string? Customer { get; set; }
    public int NumberOfNotes { get; set; }
    public DateTime CreatedDate { get; set; }
    public string ViewTraceabilityUrl { get; set; }
    public Guid StepRecordId { get; set; }
    public Guid ShareRecordId { get; set; }
    public string TraceabilityCode { get; set; }
    public Guid? SourceTenantId { get; set; }
    public int EndNumber { get; set; }
    public int Status { get; set; }
    public string? LotId { get; set; }
}

public class SupplierDto
{
    public string Name { get; set; }
    public string? RedirectUrl { get; set; }
}