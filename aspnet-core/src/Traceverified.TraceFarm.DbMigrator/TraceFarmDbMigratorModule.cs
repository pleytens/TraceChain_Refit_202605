using Traceverified.TraceFarm.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace Traceverified.TraceFarm.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(TraceFarmEntityFrameworkCoreModule),
    typeof(TraceFarmApplicationContractsModule)
)]
public class TraceFarmDbMigratorModule : AbpModule
{
}