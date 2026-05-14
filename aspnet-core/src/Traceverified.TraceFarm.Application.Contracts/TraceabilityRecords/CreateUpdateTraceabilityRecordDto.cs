using System;

namespace Traceverified.TraceFarm.TraceabilityRecords;

public class CreateUpdateTraceabilityRecordDto
{
    public Guid ProcessId { get; set; }
    public Guid CompanyProfileId { get; set; }
    public string Code { get; set; }
    public string? ContractNumber { get; set; }

    /// <summary>
    ///     TraceabilityRecordEnum: Recording = 1, Done = 5,
    /// </summary>
    public int Status { get; set; }

    public Guid? TenantId { get; set; }
    public Guid? CurrentStepId { get; set; }
}