using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.UserInteractions;

public interface IUserInteractionAppService : IApplicationService
{
    Task ViewCounter(ViewCountDto input);
    Task<long> GetViewByObject(int objectType, string objectId);
}