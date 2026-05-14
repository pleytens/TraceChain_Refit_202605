using System;
using Volo.Abp.Application.Dtos;

namespace Traceverified.TraceFarm.Events.Surveys;

public class QuestionDto: AuditedEntityDto<Guid>
{
    public Guid EventId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public int DataType { get; set; }
    public int Order { get; set; } = 0;
    public bool IsObligatory { get; set; } = false;
}