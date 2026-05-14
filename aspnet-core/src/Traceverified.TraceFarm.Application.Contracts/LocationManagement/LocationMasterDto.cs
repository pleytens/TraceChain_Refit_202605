using System;
using System.Collections.Generic;

namespace Traceverified.TraceFarm.LocationManagement;

public class LocationMasterDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public List<LocationMasterDto> Children { get; set; } = new();
}