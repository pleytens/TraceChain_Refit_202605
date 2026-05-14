using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Traceverified.TraceFarm.FileManagement;
using Traceverified.TraceFarm.Stograges;
using Traceverified.TraceFarm.Storages;
using Traceverified.TraceFarm.TraceabilityRecords;
using Traceverified.TraceFarm.TraceabilityRecordsV2;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;

namespace Traceverified.TraceFarm.ProcessManagements;

public class ProcessMobileAppService : ApplicationService, IProcessMobileAppService
{
    private readonly IRepository<ImageStorage, Guid> _imageStorageRepository;
    private readonly IRepository<Process, Guid> _processRepository;
    private readonly IRepository<ProcessStep, Guid> _processStepRepository;
    private readonly IRepository<ProcessStepUser, Guid> _processStepUserRepository;
    private readonly IRepository<TraceabilityRecord, Guid> _recordRepository;
    private readonly IRepository<StepRecord, Guid> _stepRecordRepository;
    private readonly IStorageAppService _storageAppService;
    private readonly IRepository<IdentityUser, Guid> _userRepository;


    public ProcessMobileAppService(IRepository<Process, Guid> processRepository,
        IRepository<TraceabilityRecord, Guid> recordRepository, IRepository<ImageStorage, Guid> imageStorageRepository,
        IStorageAppService storageAppService, IRepository<StepRecord, Guid> stepRecordRepository,
        IRepository<ProcessStep, Guid> processStepRepository, IRepository<IdentityUser, Guid> userRepository,
        IRepository<ProcessStepUser, Guid> processStepUserRepository)
    {
        _processRepository = processRepository;
        _recordRepository = recordRepository;
        _imageStorageRepository = imageStorageRepository;
        _storageAppService = storageAppService;
        _stepRecordRepository = stepRecordRepository;
        _processStepRepository = processStepRepository;
        _userRepository = userRepository;
        _processStepUserRepository = processStepUserRepository;
    }

    public async Task<PagedResultDto<ProcessMobileDto>> PostListCustomAsync(ProcessFilterDto input)
    {
        var processQuery = await _processRepository.GetQueryableAsync();
        var query = processQuery.Where(n => n.IsDeleted == false)
            .WhereIf(!string.IsNullOrEmpty(input.Filter), n => n.Name.ToLower().Contains(input.Filter.ToLower()))
            .Select(n => new ProcessMobileDto
            {
                Id = n.Id,
                Name = n.Name,
                Note = n.Note,
                CreationTime = n.CreationTime
            });
        var result = query
            .OrderBy(input.Sorting ?? "Name")
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount).ToList();
        var images = await _imageStorageRepository.GetListAsync(n =>
            result.Select(g => g.Id).Contains(n.RelatedEntityId)
            && n.RelatedEntityType == (int)ImageStorageEnum.Process);
        foreach (var processDto in result)
        {
            var imageObj = images.FirstOrDefault(n => n.RelatedEntityId == processDto.Id);
            processDto.ImageUrl = _storageAppService.GetFileUrl(imageObj != null ? imageObj.ImageName : "default.png");
        }

        return new PagedResultDto<ProcessMobileDto>(query.Count(), result);
    }

    public async Task<ListResultDto<ProcessDetailDto>> GetListStepInProcessAsync(Guid processId)
    {
        var process = await _processRepository.FirstOrDefaultAsync(n => n.Id == processId);
        var userStep = await _processStepUserRepository.GetQueryableAsync();
        var userQuery = await _userRepository.GetQueryableAsync();
        if (process == null)
        {
            throw new UserFriendlyException(L["Process:Mobile:NotExisted"]);
        }

        var processStepQuery = await _processStepRepository.GetQueryableAsync();
        var query = processStepQuery.Where(n => n.ProcessId == processId).OrderBy(n => n.Position)
            .Select(n => new ProcessDetailDto
            {
                Id = n.Id,
                StepName = n.Name,
                StepDescription = n.Description,
                Position = n.Position,
                UserInStep = (from stepUser in userStep
                    join user in userQuery on stepUser.UserId equals user.Id
                    where stepUser.ProcessStepId == n.Id
                    select user.Name).ToList()
            });
        return new ListResultDto<ProcessDetailDto>(query.ToList());
    }
}