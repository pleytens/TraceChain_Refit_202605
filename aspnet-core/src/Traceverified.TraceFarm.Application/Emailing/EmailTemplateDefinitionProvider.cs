using Volo.Abp.DependencyInjection;
using Volo.Abp.TextTemplating;
using Traceverified.TraceFarm.Emailing;
namespace TraceVerified.Cms5Area.Email
{
    public class EmailTemplateDefinitionProvider : TemplateDefinitionProvider, ITransientDependency
    {
        public override void Define(ITemplateDefinitionContext context)
        {
            context.Add(new TemplateDefinition(CustomEmailTemplate.ConfirmCreateQR)
                .WithVirtualFilePath(
                    "/Emailing/Templates/ConfirmCreateQRLink.tpl",
                    isInlineLocalized: true
                )
            );
        }
    }
}
