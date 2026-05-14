using System;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Domain.Entities;

namespace Traceverified.TraceFarm.UserInteractions;

[Table("sys.UserInteractions")]
public class UserInteraction : AggregateRoot<Guid>
{
    public string Url { get; set; } = null!;
    public long ViewCount { get; set; } = 0;
    public long LikeCount { get; set; } = 0;
    public long DislikeCount { get; set; }  = 0;
    public long ShareCount { get; set; } = 0;
    public long CommentCount { get; set; } = 0;
    public Guid? ProductId { get; set; }
    public DateTime? LastestInteractionTime { get; set; }
}