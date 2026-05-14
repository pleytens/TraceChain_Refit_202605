using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Traceverified.TraceFarm.ReportTemplates;

public class CreateUpdateReportTemplateDto
{
    [Required] public string Name { get; set; }

    [Required] public int UserType { get; set; }

    public bool? AllowShowFrontNode { get; set; }
    public bool? AllowShowFullInfo { get; set; }
    public bool? AllowOnlyArea { get; set; }
    public bool? AllowShowFollowNode { get; set; }
    public bool? AllowShowLink { get; set; }

    [NotMapped] public List<StepAndFieldDto>? Details { get; set; }
}