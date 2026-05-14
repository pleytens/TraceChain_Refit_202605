using System;
using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.Events;

public class EventDto : AuditedEntityDto<Guid>
{
    public string Title { get; set; }
    public string? Slug { get; set; }
    public string? ShortDescription { get; set; }
    public string? Content { get; set; }
    public int Status { get; set; }
    public string Language { get; set; }
    public Guid GroupId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string CoverImageName { get; set; }
    public string CoverImageUrl { get; set; }
    public int Views { get; set; }
    public string CreationTimeStr { get; set; }
    public int EventType { get; set; }
    public string? Code { get; set; } = string.Empty;
    public Guid? ProductId { get; set; } = null;
}