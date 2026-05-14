using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Traceverified.TraceFarm.ConfirmationTokens;

public class ConfirmationToken: FullAuditedAggregateRoot<Guid>
{
    public string Token { get; set; }
    public DateTime ExpirationTime { get; set; }
    public bool IsUsed { get; set; }
    public Guid ProductId { get; set; }
}