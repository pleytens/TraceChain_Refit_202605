using System;
using System.Collections.Generic;
using Traceverified.TraceFarm.Events.Surveys;

namespace Traceverified.TraceFarm.Events;

public class EventCrudDto
{
     public string CoverImageName { get; set; }
     public string? Code { get; set; }
     public string Title { get; set; }
     public Guid? ProductId { get; set; }
     public DateTime StartDate { get; set; } = DateTime.Now;
     public DateTime EndDate { get; set; } 
     public List<QuestionCrudDto> Questions { get; set; } = new List<QuestionCrudDto>();
}