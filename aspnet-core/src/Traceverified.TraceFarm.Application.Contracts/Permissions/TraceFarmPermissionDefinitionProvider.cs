using Traceverified.TraceFarm.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;
using Volo.Abp.MultiTenancy;

namespace Traceverified.TraceFarm.Permissions;

public class TraceFarmPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var traceFarmGroup = context.AddGroup(TraceFarmPermissions.GroupName);
        var eventsPermission = traceFarmGroup.AddPermission(TraceFarmPermissions.Events.Default, L("Permission:Event"));
        eventsPermission.AddChild(TraceFarmPermissions.Events.Create, L("Permission:Events.Create"));
        eventsPermission.AddChild(TraceFarmPermissions.Events.Edit, L("Permission:Events.Edit"));
        eventsPermission.AddChild(TraceFarmPermissions.Events.Delete, L("Permission:Events.Delete"));

        var marketPermission = traceFarmGroup.AddPermission(TraceFarmPermissions.Markets.Default,
            L("Permission:Market"), MultiTenancySides.Host);
        marketPermission.AddChild(TraceFarmPermissions.Markets.Create, L("Permission:Market.Create"),
            MultiTenancySides.Host);
        marketPermission.AddChild(TraceFarmPermissions.Markets.Edit, L("Permission:Market.Edit"),
            MultiTenancySides.Host);
        marketPermission.AddChild(TraceFarmPermissions.Markets.Delete, L("Permission:Market.Delete"),
            MultiTenancySides.Host);
        
        var govPermission = traceFarmGroup.AddPermission(TraceFarmPermissions.Govs.Default,
            L("Permission:Gov"), MultiTenancySides.Host);
        govPermission.AddChild(TraceFarmPermissions.Govs.Create, L("Permission:Gov.Create"),
            MultiTenancySides.Host);
        govPermission.AddChild(TraceFarmPermissions.Govs.Edit, L("Permission:Gov.Edit"),
            MultiTenancySides.Host);
        govPermission.AddChild(TraceFarmPermissions.Govs.Delete, L("Permission:Gov.Delete"),
            MultiTenancySides.Host);

        var productCategoryPermission = traceFarmGroup.AddPermission(TraceFarmPermissions.ProductCategories.Default,
            L("Permission:ProductCategory"), MultiTenancySides.Host);
        productCategoryPermission.AddChild(TraceFarmPermissions.ProductCategories.Create,
            L("Permission:ProductCategory.Create"), MultiTenancySides.Host);
        productCategoryPermission.AddChild(TraceFarmPermissions.ProductCategories.Edit,
            L("Permission:ProductCategory.Edit"), MultiTenancySides.Host);
        productCategoryPermission.AddChild(TraceFarmPermissions.ProductCategories.Delete,
            L("Permission:ProductCategory.Delete"), MultiTenancySides.Host);

        var stampPermission = traceFarmGroup.AddPermission(TraceFarmPermissions.Stamps.Default, L("Permission:Stamp"),
            MultiTenancySides.Host);
        stampPermission.AddChild(TraceFarmPermissions.Stamps.Create, L("Permission:Stamp.Create"),
            MultiTenancySides.Host);
        stampPermission.AddChild(TraceFarmPermissions.Stamps.Edit, L("Permission:Stamp.Edit"), MultiTenancySides.Host);
        stampPermission.AddChild(TraceFarmPermissions.Stamps.Delete, L("Permission:Stamp.Delete"),
            MultiTenancySides.Host);

        var companyPermission = traceFarmGroup.AddPermission(TraceFarmPermissions.Companies.Default,
            L("Permission:Company"),
            MultiTenancySides.Host);
        companyPermission.AddChild(TraceFarmPermissions.Companies.Create, L("Permission:Company.Create"),
            MultiTenancySides.Host);
        companyPermission.AddChild(TraceFarmPermissions.Companies.Edit, L("Permission:Company.Edit"),
            MultiTenancySides.Host);
        companyPermission.AddChild(TraceFarmPermissions.Companies.Delete, L("Permission:Company.Delete"),
            MultiTenancySides.Host);

        var partnerPermission =
            traceFarmGroup.AddPermission(TraceFarmPermissions.Partners.Default, L("Permission:Partner"));
        partnerPermission.AddChild(TraceFarmPermissions.Partners.Create, L("Permission:Partner.Create"));
        partnerPermission.AddChild(TraceFarmPermissions.Partners.Edit, L("Permission:Partner.Edit"));
        partnerPermission.AddChild(TraceFarmPermissions.Partners.Delete, L("Permission:Partner.Delete"));

        var companyProfilePermission = traceFarmGroup.AddPermission(TraceFarmPermissions.CompanyProfiles.Default,
            L("Permission:CompanyProfile"));
        companyProfilePermission.AddChild(TraceFarmPermissions.CompanyProfiles.Create,
            L("Permission:CompanyProfile.Create"));
        companyProfilePermission.AddChild(TraceFarmPermissions.CompanyProfiles.Edit,
            L("Permission:CompanyProfile.Edit"));
        companyProfilePermission.AddChild(TraceFarmPermissions.CompanyProfiles.Delete,
            L("Permission:CompanyProfile.Delete"));

        var productPermission =
            traceFarmGroup.AddPermission(TraceFarmPermissions.Products.Default, L("Permission:Product"));
        productPermission.AddChild(TraceFarmPermissions.Products.Create, L("Permission:Product.Create"));
        productPermission.AddChild(TraceFarmPermissions.Products.Edit, L("Permission:Product.Edit"));
        productPermission.AddChild(TraceFarmPermissions.Products.Delete, L("Permission:Product.Delete"));
        // productPermission.AddChild(TraceFarmPermissions.Products.PrintQrCode, L("Permission:Product.PrintQrCode"));
        var supplierPermission =
            traceFarmGroup.AddPermission(TraceFarmPermissions.Suppliers.Default, L("Permission:Supplier"));
        supplierPermission.AddChild(TraceFarmPermissions.Suppliers.Create, L("Permission:Supplier.Create"));
        supplierPermission.AddChild(TraceFarmPermissions.Suppliers.Edit, L("Permission:Supplier.Edit"));
        supplierPermission.AddChild(TraceFarmPermissions.Suppliers.Delete, L("Permission:Supplier.Delete"));
        
        var processPermission =
            traceFarmGroup.AddPermission(TraceFarmPermissions.Processes.Default, L("Permission:Process"));
        processPermission.AddChild(TraceFarmPermissions.Processes.Create, L("Permission:Process.Create"));
        processPermission.AddChild(TraceFarmPermissions.Processes.Edit, L("Permission:Process.Edit"));
        processPermission.AddChild(TraceFarmPermissions.Processes.Delete, L("Permission:Process.Delete"));

        var processReceptaclePermission =
            traceFarmGroup.AddPermission(TraceFarmPermissions.Receptacles.Default, L("Permission:Receptacles"));
        processReceptaclePermission.AddChild(TraceFarmPermissions.Receptacles.Create,
            L("Permission:Receptacles.Create"));
        processReceptaclePermission.AddChild(TraceFarmPermissions.Receptacles.Edit, L("Permission:Receptacles.Edit"));
        processReceptaclePermission.AddChild(TraceFarmPermissions.Receptacles.Delete,
            L("Permission:Receptacles.Delete"));
        var userPermission =
            traceFarmGroup.AddPermission(TraceFarmPermissions.UserCustoms.Default, L("Permission:Users"));
        userPermission.AddChild(TraceFarmPermissions.UserCustoms.Create,
            L("Permission:Receptacles.Create"));
        userPermission.AddChild(TraceFarmPermissions.UserCustoms.Edit, L("Permission:Receptacles.Edit"));
        userPermission.AddChild(TraceFarmPermissions.UserCustoms.Delete,
            L("Permission:Receptacles.Delete"));
        userPermission.AddChild(TraceFarmPermissions.UserCustoms.ManagePermissions,
            L("Permission:Receptacles.ManagePermissions"));
        userPermission.AddChild(TraceFarmPermissions.UserCustoms.ManageRoles,
            L("Permission:Receptacles.ManageRoles"));

        var recordPermission = traceFarmGroup.AddPermission(TraceFarmPermissions.TraceabilityRecords.Default,
            L("Permission:TraceabilityRecords"));
        recordPermission.AddChild(TraceFarmPermissions.TraceabilityRecords.Create,
            L("Permission:TraceabilityRecords.Create"));
        recordPermission.AddChild(TraceFarmPermissions.TraceabilityRecords.Edit,
            L("Permission:TraceabilityRecords.Edit"));
        recordPermission.AddChild(TraceFarmPermissions.TraceabilityRecords.Delete,
            L("Permission:TraceabilityRecords.Delete"));
        
      
        var templatePermission = traceFarmGroup.AddPermission(TraceFarmPermissions.Templates.Default,
            L("Permission:Templates"));
        templatePermission.AddChild(TraceFarmPermissions.Templates.Create,
            L("Permission:Template.Create"));
        templatePermission.AddChild(TraceFarmPermissions.Templates.Edit,
            L("Permission:Template.Edit"));
        templatePermission.AddChild(TraceFarmPermissions.Templates.Delete,
            L("Permission:Template.Delete"));
        
        var scanReportPermission = traceFarmGroup.AddPermission(TraceFarmPermissions.ScanReports.Default,
            L("Permission:ScanReports"));
        scanReportPermission.AddChild(TraceFarmPermissions.ScanReports.View,
            L("Permission:ScanReports.View"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<TraceFarmResource>(name);
    }
}