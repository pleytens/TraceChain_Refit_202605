using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace Traceverified.TraceFarm.Data;

/* This is used if database provider does't define
 * ITraceFarmDbSchemaMigrator implementation.
 */
public class NullTraceFarmDbSchemaMigrator : ITraceFarmDbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}