using System.Collections.Generic;

namespace Traceverified.TraceFarm.Dashboards;

public class CompanyStatusDto
{
    // number of company activity and inactivity
    public IList<int> CompanyStatuses { get; set; }
    public CompanyStatusDetailDto? ProfitYear { get; set; }
    public CompanyStatusDetailDto? ProfitMonth { get; set; }
}

public class CompanyStatusDetailDto
{
    public int Percentage {get; set; }
    public int Profit { get; set; }
}