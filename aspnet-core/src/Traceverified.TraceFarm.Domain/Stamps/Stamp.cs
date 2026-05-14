using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Traceverified.TraceFarm.Stamps;

public class Stamp : FullAuditedAggregateRoot<Guid>
{
    public Guid CompanyId { get; set; }
    public int StartLotNumber { get; set; }
    public int EndLotNumber { get; set; }
    public int Quantity { get; set; }
    public string? Note { get; set; }
    public int Status { get; set; } = 0;
}