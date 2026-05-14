using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using OpenIddict.Validation.AspNetCore;
using Traceverified.TraceFarm.EntityFrameworkCore;
using Traceverified.TraceFarm.MultiTenancy;
using Volo.Abp;
using Volo.Abp.Account;
using Volo.Abp.Account.Web;
using Volo.Abp.AspNetCore.MultiTenancy;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc.UI.Bundling;
using Volo.Abp.AspNetCore.Mvc.UI.Theme.LeptonXLite;
using Volo.Abp.AspNetCore.Mvc.UI.Theme.LeptonXLite.Bundling;
using Volo.Abp.AspNetCore.Mvc.UI.Theme.Shared;
using Volo.Abp.AspNetCore.Serilog;
using Volo.Abp.Autofac;
using Volo.Abp.Emailing;
using Volo.Abp.Modularity;
using Volo.Abp.OpenIddict;
using Volo.Abp.SettingManagement;
using Volo.Abp.Swashbuckle;
using Volo.Abp.UI.Navigation.Urls;
using Volo.Abp.VirtualFileSystem;

namespace Traceverified.TraceFarm;

[DependsOn(
    typeof(TraceFarmHttpApiModule),
    typeof(AbpAutofacModule),
    typeof(AbpAspNetCoreMultiTenancyModule),
    typeof(TraceFarmApplicationModule),
    typeof(TraceFarmEntityFrameworkCoreModule),
    typeof(AbpAspNetCoreMvcUiLeptonXLiteThemeModule),
    typeof(AbpAccountWebOpenIddictModule),
    typeof(AbpAspNetCoreSerilogModule),
    typeof(AbpSwashbuckleModule)
)]
public class TraceFarmHttpApiHostModule : AbpModule
{
    public override void PreConfigureServices(ServiceConfigurationContext context)
    {
        var hostingEnvironment = context.Services.GetHostingEnvironment();
        if (!hostingEnvironment.IsDevelopment())
        {
            PreConfigure<AbpOpenIddictAspNetCoreOptions>(options =>
            {
                options.AddDevelopmentEncryptionAndSigningCertificate = false;
            });

            var encryptionCertificate = GetSigningCertificate(hostingEnvironment, "encryption-certificate.pfx");
            var signingCertificate = GetSigningCertificate(hostingEnvironment, "signing-certificate.pfx");
            PreConfigure<OpenIddictServerBuilder>(builder =>
            {
                builder.AddEncryptionCertificate(encryptionCertificate);
                builder.AddSigningCertificate(signingCertificate);
                builder.SetAuthorizationCodeLifetime(TimeSpan.FromDays(30));
                builder.SetAccessTokenLifetime(TimeSpan.FromDays(30));
                builder.SetIdentityTokenLifetime(TimeSpan.FromDays(30));
                builder.SetRefreshTokenLifetime(TimeSpan.FromDays(60));
            });
        }

        PreConfigure<OpenIddictBuilder>(builder =>
        {
            builder.AddValidation(options =>
            {
                options.AddAudiences("TraceFarm");
                options.UseLocalServer();
                options.UseAspNetCore();
            });
        });
    }

    private X509Certificate2 GetSigningCertificate(IWebHostEnvironment hostingEnvironment, string fileName)
    {
        // TODO: temporary solution to use self-sign certificate, we should change to real certificate in future
        var passPhrase = "f6e7a2b7-c8bd-4789-bc29-3a5f6e982a7b";

        var file = Path.Combine(hostingEnvironment.ContentRootPath, fileName);

        if (!File.Exists(file))
        {
            throw new FileNotFoundException($"Signing Certificate couldn't found: {file}");
        }

        return new X509Certificate2(file, passPhrase);
    }

    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        var configuration = context.Services.GetConfiguration();
        var hostingEnvironment = context.Services.GetHostingEnvironment();
        context.Services.Configure<KestrelServerOptions>(options => { options.AllowSynchronousIO = true; });
        // context.Services.Configure<IISServerOptions>(options =>
        // {
        //     options.AllowSynchronousIO = true;
        // });
        ConfigureAuthentication(context);
        ConfigureBundles();
        ConfigureUrls(configuration);
        ConfigureConventionalControllers();
        ConfigureVirtualFileSystem(context);
        ConfigureCors(context, configuration);
        ConfigureSwaggerServices(context, configuration);
        Configure<CultureInfo>(options => { options.DateTimeFormat.ShortDatePattern = "dd/MM/yyyy"; });
    }
    
    private void ConfigureAuthentication(ServiceConfigurationContext context)
    {
        context.Services.ForwardIdentityAuthenticationForBearer(OpenIddictValidationAspNetCoreDefaults
            .AuthenticationScheme);
    }

    private void ConfigureBundles()
    {
        Configure<AbpBundlingOptions>(options =>
        {
            options.StyleBundles.Configure(
                LeptonXLiteThemeBundles.Styles.Global,
                bundle => { bundle.AddFiles("/global-styles.css"); }
            );
        });
    }

    private void ConfigureUrls(IConfiguration configuration)
    {
        Configure<AppUrlOptions>(options =>
        {
            options.Applications["MVC"].RootUrl = configuration["App:SelfUrl"];
            options.RedirectAllowedUrls.AddRange(configuration["App:RedirectAllowedUrls"]?.Split(',') ??
                                                 Array.Empty<string>());

            options.Applications["Angular"].RootUrl = configuration["App:ClientUrl"];
            options.Applications["Angular"].Urls[AccountUrlNames.PasswordReset] = "account/reset-password";
        });
    }

    private void ConfigureVirtualFileSystem(ServiceConfigurationContext context)
    {
        var hostingEnvironment = context.Services.GetHostingEnvironment();

        if (hostingEnvironment.IsDevelopment())
        {
            Configure<AbpVirtualFileSystemOptions>(options =>
            {
                options.FileSets.ReplaceEmbeddedByPhysical<TraceFarmDomainSharedModule>(
                    Path.Combine(hostingEnvironment.ContentRootPath,
                        $"..{Path.DirectorySeparatorChar}Traceverified.TraceFarm.Domain.Shared"));
                options.FileSets.ReplaceEmbeddedByPhysical<TraceFarmDomainModule>(
                    Path.Combine(hostingEnvironment.ContentRootPath,
                        $"..{Path.DirectorySeparatorChar}Traceverified.TraceFarm.Domain"));
                options.FileSets.ReplaceEmbeddedByPhysical<TraceFarmApplicationContractsModule>(
                    Path.Combine(hostingEnvironment.ContentRootPath,
                        $"..{Path.DirectorySeparatorChar}Traceverified.TraceFarm.Application.Contracts"));
                options.FileSets.ReplaceEmbeddedByPhysical<TraceFarmApplicationModule>(
                    Path.Combine(hostingEnvironment.ContentRootPath,
                        $"..{Path.DirectorySeparatorChar}Traceverified.TraceFarm.Application"));
            });
        }
    }

    private void ConfigureConventionalControllers()
    {
        Configure<AbpAspNetCoreMvcOptions>(options =>
        {
            options.ConventionalControllers.Create(typeof(TraceFarmApplicationModule).Assembly);
        });
    }

    private static void ConfigureSwaggerServices(ServiceConfigurationContext context, IConfiguration configuration)
    {
        context.Services.AddAbpSwaggerGenWithOAuth(
            configuration["AuthServer:Authority"],
            new Dictionary<string, string>
            {
                { "TraceFarm", "TraceFarm API" }
            },
            options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo { Title = "TraceFarm API", Version = "v1" });
                options.DocInclusionPredicate((docName, description) => true);
                options.CustomSchemaIds(type => type.FullName);
            });
    }

    private void ConfigureCors(ServiceConfigurationContext context, IConfiguration configuration)
    {
        context.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(builder =>
            {
                builder
                    .WithOrigins(configuration["App:CorsOrigins"]?
                        .Split(",", StringSplitOptions.RemoveEmptyEntries)
                        .Select(o => o.RemovePostFix("/"))
                        .ToArray() ?? Array.Empty<string>())
                    .WithAbpExposedHeaders()
                    .SetIsOriginAllowedToAllowWildcardSubdomains()
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });
    }

    public override void OnApplicationInitialization(ApplicationInitializationContext context)
    {
        var app = context.GetApplicationBuilder();
        var env = context.GetEnvironment();

        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseAbpRequestLocalization();

        if (!env.IsDevelopment())
        {
            app.UseErrorPage();
        }

        app.UseCorrelationId();
        app.UseStaticFiles();
        app.UseRouting();
        app.UseCors();
        app.UseAuthentication();
        app.UseAbpOpenIddictValidation();
        if (MultiTenancyConsts.IsEnabled)
        {
            app.UseMultiTenancy();
        }

        app.UseUnitOfWork();
        app.UseAuthorization();

        app.UseSwagger();
        app.UseAbpSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "TraceFarm API");

            var configuration = context.ServiceProvider.GetRequiredService<IConfiguration>();
            c.OAuthClientId(configuration["AuthServer:SwaggerClientId"]);
            c.OAuthScopes("TraceFarm");
        });

        app.UseAuditing();
        app.UseAbpSerilogEnrichers();
        app.UseConfiguredEndpoints();
        OnAppEmailConfig(context);
    }

    private void OnAppEmailConfig(ApplicationInitializationContext context)
    {
        var configuration = context.ServiceProvider.GetRequiredService<IConfiguration>();
        var settingManager = context.ServiceProvider.GetRequiredService<SettingManager>();
        //var encryptionService = context.ServiceProvider.GetRequiredService<IStringEncryptionService>();
        var defaultFromAddress = configuration["Settings:Abp.Mailing.DefaultFromAddress"];
        var defaultFromDisplayName = configuration["Settings:Abp.Mailing.DefaultFromDisplayName"];
        var smtpHost = configuration["Settings:Abp.Mailing.Smtp.Host"];
        var smtpPort = configuration["Settings:Abp.Mailing.Smtp.Port"];
        var smtpUserName = configuration["Settings:Abp.Mailing.Smtp.UserName"];
        var smtpPassword = configuration["Settings:Abp.Mailing.Smtp.Password"];
        //smtpPassword = encryptionService.Encrypt(smtpPassword);
        var enableSsl = configuration["Settings:Abp.Mailing.Smtp.EnableSsl"];
        var useDefaultCredentials = configuration["Settings:Abp.Mailing.Smtp.UseDefaultCredentials"];
        var domain = configuration["Settings:Abp.Mailing.Smtp.Domain"];

        // Setting SMTP configuration
        settingManager.SetGlobalAsync(EmailSettingNames.DefaultFromAddress, defaultFromAddress).GetAwaiter().GetResult();
        settingManager.SetGlobalAsync(EmailSettingNames.DefaultFromDisplayName, defaultFromDisplayName).GetAwaiter().GetResult();
        settingManager.SetGlobalAsync(EmailSettingNames.Smtp.Host, smtpHost).GetAwaiter().GetResult();
        settingManager.SetGlobalAsync(EmailSettingNames.Smtp.Port, smtpPort).GetAwaiter().GetResult();
        settingManager.SetGlobalAsync(EmailSettingNames.Smtp.UserName, smtpUserName).GetAwaiter().GetResult();
        settingManager.SetGlobalAsync(EmailSettingNames.Smtp.Password, smtpPassword).GetAwaiter().GetResult();
        settingManager.SetGlobalAsync(EmailSettingNames.Smtp.EnableSsl, enableSsl).GetAwaiter().GetResult();
        settingManager.SetGlobalAsync(EmailSettingNames.Smtp.UseDefaultCredentials, useDefaultCredentials).GetAwaiter().GetResult();
        settingManager.SetGlobalAsync(EmailSettingNames.Smtp.Domain, domain).GetAwaiter().GetResult();
    }
}