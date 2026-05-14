using System;

namespace Traceverified.TraceFarm.Events;

public class EventPublicDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string ShortDescription { get; set; }
    public string Content { get; set; }
    public string CoverImageName { get; set; }
    public string CoverImageUrl { get; set; }
    public int Views { get; set; }
}