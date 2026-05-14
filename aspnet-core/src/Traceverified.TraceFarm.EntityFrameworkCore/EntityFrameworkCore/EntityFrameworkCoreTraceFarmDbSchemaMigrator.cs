using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Traceverified.TraceFarm.Data;
using Volo.Abp.DependencyInjection;

namespace Traceverified.TraceFarm.EntityFrameworkCore;

public class EntityFrameworkCoreTraceFarmDbSchemaMigrator
    : ITraceFarmDbSchemaMigrator, ITransientDependency
{
    private readonly IServiceProvider _serviceProvider;

    public EntityFrameworkCoreTraceFarmDbSchemaMigrator(
        IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task MigrateAsync()
    {
        /* We intentionally resolving the TraceFarmDbContext
         * from IServiceProvider (instead of directly injecting it)
         * to properly get the connection string of the current tenant in the
         * current scope.
         */

        await _serviceProvider
            .GetRequiredService<TraceFarmDbContext>()
            .Database
            .MigrateAsync();
    }
}