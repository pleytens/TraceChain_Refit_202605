using System.Threading.Tasks;

namespace Traceverified.TraceFarm.Data;

public interface ITraceFarmDbSchemaMigrator
{
    Task MigrateAsync();
}