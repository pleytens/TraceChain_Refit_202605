using Volo.Abp.Modularity;

namespace Traceverified.TraceFarm;

[DependsOn(
    typeof(TraceFarmApplicationModule),
    typeof(TraceFarmDomainTestModule)
)]
public class TraceFarmApplicationTestModule : AbpModule
{
}