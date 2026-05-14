using Microsoft.EntityFrameworkCore;
using Traceverified.TraceFarm.Companies;
using Traceverified.TraceFarm.ConfirmationTokens;
using Traceverified.TraceFarm.EnumTranslations;
using Traceverified.TraceFarm.Events;
using Traceverified.TraceFarm.Events.Surveys;
using Traceverified.TraceFarm.Locations;
using Traceverified.TraceFarm.Markets;
using Traceverified.TraceFarm.Partners;
using Traceverified.TraceFarm.ProcessManagements;
using Traceverified.TraceFarm.ProductCategories;
using Traceverified.TraceFarm.ProductManagements;
using Traceverified.TraceFarm.ReportTemplates;
using Traceverified.TraceFarm.Stamps;
using Traceverified.TraceFarm.Storages;
using Traceverified.TraceFarm.SupplierManagements;
using Traceverified.TraceFarm.TraceabilityRecords;
using Traceverified.TraceFarm.TraceabilityRecordsV2;
using Traceverified.TraceFarm.UserInteractions;
using Volo.Abp.AuditLogging.EntityFrameworkCore;
using Volo.Abp.BackgroundJobs.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.FeatureManagement.EntityFrameworkCore;
using Volo.Abp.Identity;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.OpenIddict.EntityFrameworkCore;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.SettingManagement.EntityFrameworkCore;
using Volo.Abp.TenantManagement;
using Volo.Abp.TenantManagement.EntityFrameworkCore;

namespace Traceverified.TraceFarm.EntityFrameworkCore;

[ReplaceDbContext(typeof(IIdentityDbContext))]
[ReplaceDbContext(typeof(ITenantManagementDbContext))]
[ConnectionStringName("Default")]
public class TraceFarmDbContext :
    AbpDbContext<TraceFarmDbContext>,
    IIdentityDbContext,
    ITenantManagementDbContext
{
    public TraceFarmDbContext(DbContextOptions<TraceFarmDbContext> options)
        : base(options)
    {
    }

    public DbSet<Event> Events { get; set; }
    public DbSet<Answer> Answers { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<QuestionResponse> QuestionResponses { get; set; }
    public DbSet<ResponseOption> ResponseOptions { get; set; }
    public DbSet<SurveyInstance> SurveyInstances { get; set; }
    public DbSet<SpinResult> SpinResults { get; set; }
    
    public DbSet<Market> Markets { get; set; }
    public DbSet<ProductCategory> ProductCategories { get; set; }
    public DbSet<Stamp> Stamps { get; set; }
    public DbSet<Company> Companies { get; set; }

    // Locations
    public DbSet<LocationCountry> LocationCountries { get; set; }
    public DbSet<LocationProvince> LocationProvinces { get; set; }
    public DbSet<LocationDistrict> LocationDistricts { get; set; }
    public DbSet<LocationWard> LocationWards { get; set; }
    public DbSet<LocationTranslation> LocationTranslations { get; set; }

    // Company
    public DbSet<Partner> Partners { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<CompanyProfile> CompanyProfiles { get; set; }
    public DbSet<Receptacle> Receptacles { get; set; }
    public DbSet<Supplier> Suppliers { get; set; }

    // Process
    public DbSet<Process> Processes { get; set; }
    public DbSet<ProcessStep> ProcessSteps { get; set; }
    public DbSet<ProcessStepUser> ProcessStepUsers { get; set; }
    public DbSet<ProcessField> ProcessFields { get; set; }
    public DbSet<ProcessFieldOption> ProcessFieldOptions { get; set; }
    public DbSet<ProcessFieldResponse> ProcessFieldResponses { get; set; }
    public DbSet<ProcessStepResponse> ProcessStepResponses { get; set; }

    // Storage
    public DbSet<ImageStorage> ImageStorages { get; set; }

    // Enum Translation
    public DbSet<EnumTranslation> EnumTranslations { get; set; }

    // Traceability Record
    public DbSet<TraceabilityRecord> TraceabilityRecords { get; set; }
    public DbSet<TraceabilityRecordShare> TraceabilityRecordShares { get; set; }
    public DbSet<RecordReception> RecordReceptions { get; set; }
    public DbSet<ReportTemplate> ReportTemplates { get; set; }
    public DbSet<ProcessFieldTemplate> ProcessFieldTemplates { get; set; }

    // Traceability Record v2
    public DbSet<EntityStepRecord> EntityStepRecords { get; set; }
    public DbSet<FieldRecord> FieldRecords { get; set; }
    public DbSet<RecordReceptionV2> RecordReceptionsV2 { get; set; }
    public DbSet<RecordShare> RecordShares { get; set; }
    public DbSet<StepRecord> StepRecords { get; set; }
    
    // For generate Qr Code free
    public DbSet<ConfirmationToken> ConfirmationTokens { get; set; }
    public DbSet<ProductExpirationTime> ProductExpirationTimes { get; set; }

    // System modules
    public DbSet<DeviceView> DeviceViews { get; set; }
    public DbSet<UserInteraction> UserInteractions { get; set; }
    
    // Mini Game Management
    // public DbSet<MiniGameCampaign> MiniGameCampaigns { get; set; }
    // public DbSet<MiniGameQuestion> MiniGameQuestions { get; set; }
    // public DbSet<MiniGameAnswerOption> MiniGameAnswerOptions { get; set; }
    // public DbSet<SubmissionResult> SubmissionResults { get; set; }
    // public DbSet<AnswerDetail> AnswerDetails { get; set; }
    
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        /* Include modules to your migration db context */

        builder.ConfigurePermissionManagement();
        builder.ConfigureSettingManagement();
        builder.ConfigureBackgroundJobs();
        builder.ConfigureAuditLogging();
        builder.ConfigureIdentity();
        builder.ConfigureOpenIddict();
        builder.ConfigureFeatureManagement();
        builder.ConfigureTenantManagement();

        /* Configure your own tables/entities inside here */

        //builder.Entity<YourEntity>(b =>
        //{
        //    b.ToTable(TraceFarmConsts.DbTablePrefix + "YourEntities", TraceFarmConsts.DbSchema);
        //    b.ConfigureByConvention(); //auto configure for the base class props
        //    //...
        //});
    }
    /* Add DbSet properties for your Aggregate Roots / Entities here. */

    #region Entities from the modules

    /* Notice: We only implemented IIdentityDbContext and ITenantManagementDbContext
     * and replaced them for this DbContext. This allows you to perform JOIN
     * queries for the entities of these modules over the repositories easily. You
     * typically don't need that for other modules. But, if you need, you can
     * implement the DbContext interface of the needed module and use ReplaceDbContext
     * attribute just like IIdentityDbContext and ITenantManagementDbContext.
     *
     * More info: Replacing a DbContext of a module ensures that the related module
     * uses this DbContext on runtime. Otherwise, it will use its own DbContext class.
     */

    //Identity
    public DbSet<IdentityUser> Users { get; set; }
    public DbSet<IdentityRole> Roles { get; set; }
    public DbSet<IdentityClaimType> ClaimTypes { get; set; }
    public DbSet<OrganizationUnit> OrganizationUnits { get; set; }
    public DbSet<IdentitySecurityLog> SecurityLogs { get; set; }
    public DbSet<IdentityLinkUser> LinkUsers { get; set; }
    public DbSet<IdentityUserDelegation> UserDelegations { get; set; }

    // Tenant Management
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<TenantConnectionString> TenantConnectionStrings { get; set; }

    #endregion
}