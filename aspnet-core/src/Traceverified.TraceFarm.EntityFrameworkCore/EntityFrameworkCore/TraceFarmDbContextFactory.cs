using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Traceverified.TraceFarm.EntityFrameworkCore;

/* This class is needed for EF Core console commands
 * (like Add-Migration and Update-Database commands) */
public class TraceFarmDbContextFactory : IDesignTimeDbContextFactory<TraceFarmDbContext>
{
    public TraceFarmDbContext CreateDbContext(string[] args)
    {
        TraceFarmEfCoreEntityExtensionMappings.Configure();

        var configuration = BuildConfiguration();

        var builder = new DbContextOptionsBuilder<TraceFarmDbContext>()
            .UseSqlServer(configuration.GetConnectionString("Default"));

        return new TraceFarmDbContext(builder.Options);
    }

    private static IConfigurationRoot BuildConfiguration()
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../Traceverified.TraceFarm.DbMigrator/"))
            .AddJsonFile("appsettings.json", false);

        return builder.Build();
    }
}