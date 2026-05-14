using System;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Domain.Entities;

namespace Traceverified.TraceFarm.UserInteractions;

[Table("sys.DeviceViews")]
public class DeviceView : AggregateRoot<Guid>
{
    public Guid UserInteractionId { get; set; }
    public string DeviceId { get; set; } = null!;
    public Guid? UserId { get; set; }
    public DateTime? LastestUpdateTime{ get; set; } = DateTime.Now;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}