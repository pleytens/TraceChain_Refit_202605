using Traceverified.TraceFarm.EntityFrameworkCore;
using Volo.Abp.Modularity;

namespace Traceverified.TraceFarm;

[DependsOn(
    typeof(TraceFarmEntityFrameworkCoreTestModule)
)]
public class TraceFarmDomainTestModule : AbpModule
{
}