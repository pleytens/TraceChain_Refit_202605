using System;

namespace Traceverified.TraceFarm.ProcessManagements;

public class UpdateStepPositionDto
{
    public Guid Id { get; set; }
    public int Position { get; set; } = 0;
}