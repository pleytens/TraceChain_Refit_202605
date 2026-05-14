using System;
using System.Linq;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Companies;
using Traceverified.TraceFarm.Stograges;
using Traceverified.TraceFarm.TraceabilityRecordsV2;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;
using Volo.Abp.Users;

namespace Traceverified.TraceFarm.UserInteractions;

public class UserInteractionAppService(
    IRepository<DeviceView, Guid> deviceViewRepository,
    ICurrentUser currentUser,
    IDataFilter dataFilter,
    IRepository<Company, Guid> companyRepository,
    IRepository<RecordShare, Guid> recordShareRepository,
    IRepository<UserInteraction, Guid> userInteractionRepository)
    : ApplicationService, IUserInteractionAppService
{
    public async Task ViewCounter(ViewCountDto input)
    {
        var url =  $"{Enum.GetName(typeof(ObjectTypeEnum), input.ObjectType)}/{input.ObjectId}";
        var userInteraction = await userInteractionRepository.FirstOrDefaultAsync(x => x.Url == url);
        if (userInteraction == null)
        {
            var productId = await GetProductId(input.ObjectId);
            userInteraction = new UserInteraction
            {
                Url = url,
                ViewCount = 1,
                ProductId = productId,
                LastestInteractionTime = DateTime.Now
            };
            await userInteractionRepository.InsertAsync(userInteraction, autoSave: true);
            var deviceView = new DeviceView
            {
                DeviceId = input.DeviceId,
                UserId = currentUser.Id,
                UserInteractionId = userInteraction.Id,
                LastestUpdateTime = DateTime.Now,
                Latitude = input.Latitude,
                Longitude = input.Longitude
            };
            await deviceViewRepository.InsertAsync(deviceView, autoSave: true);
            return;
        }
        if (await deviceViewRepository.AnyAsync(x => x.DeviceId == input.DeviceId && x.UserInteractionId == userInteraction.Id))
        {
            return;
        }

        userInteraction.ViewCount++;
        userInteraction.LastestInteractionTime = DateTime.Now;
        if (userInteraction.ProductId == null || userInteraction.ProductId == Guid.Empty)
        {
            userInteraction.ProductId = await GetProductId(input.ObjectId);
        }
        await userInteractionRepository.UpdateAsync(userInteraction, autoSave: true);
        var deviceViewNew = new DeviceView
        {
            DeviceId = input.DeviceId,
            UserId = currentUser.Id,
            UserInteractionId = userInteraction.Id,
            LastestUpdateTime = DateTime.Now,
            Latitude = input.Latitude,
            Longitude = input.Longitude
        };
        await deviceViewRepository.InsertAsync(deviceViewNew, autoSave: true);
    }

    private async Task<Guid> GetProductId(string traceCode)
    {
        var traceCodeSplit = traceCode.Split('-');
        var result = Guid.Empty;
        if (traceCodeSplit.Length != 2)
        {
            return result;
        }
        using (dataFilter.Disable<IMultiTenant>())
        {
            var companyQuery = await companyRepository.GetQueryableAsync();
            var recordShareQuery = await recordShareRepository.GetQueryableAsync();

            var company = companyQuery.FirstOrDefault(n => n.GS1Code == traceCodeSplit[0]);
            if (company == null)
            {
                return result;
            }

            var traceabilityCode = int.Parse(traceCodeSplit[1]);
            var recordShare = recordShareQuery
                .FirstOrDefault(n => n.StartNumber <= traceabilityCode
                                     && n.EndNumber >= traceabilityCode
                                     && company.TenantId == n.SourceTenantId
                );
            return recordShare?.ProductId ?? result;
        }
    }
    
    public async Task<long> GetViewByObject(int objectType, string objectId)
    {
        var url =  $"{Enum.GetName(typeof(ObjectTypeEnum), objectType)}/{objectId}";
        var userInteraction = await userInteractionRepository.FirstOrDefaultAsync(x => x.Url == url);
        return userInteraction?.ViewCount ?? 0;
    }
}