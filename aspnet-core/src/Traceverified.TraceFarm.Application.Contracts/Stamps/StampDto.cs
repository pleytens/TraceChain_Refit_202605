using System;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.Stamps;

public class StampDto : AuditedEntityDto<Guid>
{
    public string CompanyName { get; set; }
    public Guid CompanyId { get; set; }
    public int StartLotNumber { get; set; }
    public int EndLotNumber { get; set; }
    public int Quantity { get; set; }
    public DateTime CreatedDate { get; set; }
    public string? Note { get; set; }
    public int Status { get; set; } = 0;
    [NotMapped]
    public string StatusText { get; set; } = nameof(StampStatusEnum.Ready);
}