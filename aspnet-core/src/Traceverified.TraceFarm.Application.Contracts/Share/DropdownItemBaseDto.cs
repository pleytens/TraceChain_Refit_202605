using System;
using Traceverified.TraceFarm.ProcessManagements;

namespace Traceverified.TraceFarm.Share;

public class DropdownItemBaseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
}

public class DropdownForStepDto: DropdownItemBaseDto
{
    public int? IsSpecial { get; set; } = (int)StepSpecialEnum.Normal;
    public int TabIndex { get; set; } = 0;
}


public class EnumItemBaseDto
{
    public int Id { get; set; }
    public string Name { get; set; }
}

public class StepRecordDropdownDto : DropdownItemBaseDto
{
    public bool UseAll { get; set; }
}

public class DropdownItemForMobileDto :DropdownItemBaseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string? Code { get; set; }


}
