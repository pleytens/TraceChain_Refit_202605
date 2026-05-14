using Volo.Abp.Settings;

namespace Traceverified.TraceFarm.Settings;

public class TraceFarmSettingDefinitionProvider : SettingDefinitionProvider
{
    public override void Define(ISettingDefinitionContext context)
    {
        //Define your own settings here. Example:
        //context.Add(new SettingDefinition(TraceFarmSettings.MySetting1));
    }
}