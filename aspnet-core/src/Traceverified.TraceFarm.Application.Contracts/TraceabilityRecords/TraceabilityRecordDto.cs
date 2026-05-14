using System;
using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.TraceabilityRecords;

public class TraceabilityRecordDto : AuditedEntityDto<Guid>
{
    public Guid ProcessId { get; set; }
    public string ProcessName { get; set; }
    public Guid CompanyProfileId { get; set; }
    public string CompanyProfileName { get; set; }
    public string Code { get; set; }
    public string CreatedBy { get; set; }
    public DateTime CreationTime { get; set; }
    public string CurrentStepName { get; set; }
    public string ProductName { get; set; }

    /// <summary>
    ///     TraceabilityRecordEnum: Recording = 1, Done = 5,
    /// </summary>
    public int Status { get; set; }

    public Guid? CurrentStepId { get; set; }
    public string? StepName { get; set; }
    public Guid? TenantId { get; set; }
}