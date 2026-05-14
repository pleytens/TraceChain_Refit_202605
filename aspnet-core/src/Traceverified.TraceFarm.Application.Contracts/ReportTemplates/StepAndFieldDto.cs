using System;
using System.Collections.Generic;

namespace Traceverified.TraceFarm.ReportTemplates;

public class StepAndFieldDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public List<FieldDto> Fields { get; set; }
    public bool IsChecked { get; set; } = false;
}

public class FieldDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public bool IsChecked { get; set; } = false;
}