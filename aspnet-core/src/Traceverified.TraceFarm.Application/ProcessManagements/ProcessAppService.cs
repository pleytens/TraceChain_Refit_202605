using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Traceverified.TraceFarm.FileManagement;
using Traceverified.TraceFarm.Share;
using Traceverified.TraceFarm.Stograges;
using Traceverified.TraceFarm.Storages;
using Traceverified.TraceFarm.TraceabilityRecords;
using Traceverified.TraceFarm.TraceabilityRecordsV2;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace Traceverified.TraceFarm.ProcessManagements;

public class ProcessAppService : CrudAppService<
        Process,
        ProcessDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateProcessDto>,
    IProcessAppService
{
    private readonly IRepository<ImageStorage, Guid> _imageStorageRepository;
    private readonly IRepository<Process, Guid> _processRepository;
    private readonly IRepository<ProcessStep, Guid> _processStepRepository;
    private readonly IRepository<TraceabilityRecord, Guid> _recordRepository;
    private readonly IRepository<StepRecord, Guid> _stepRecordRepository;
    private readonly IStorageAppService _storageAppService;

    public ProcessAppService(IRepository<Process, Guid> processRepository,
        IRepository<TraceabilityRecord, Guid> recordRepository, IRepository<ImageStorage, Guid> imageStorageRepository,
        IStorageAppService storageAppService, IRepository<StepRecord, Guid> stepRecordRepository,
        IRepository<ProcessStep, Guid> processStepRepository) : base(processRepository)
    {
        _processRepository = processRepository;
        _recordRepository = recordRepository;
        _imageStorageRepository = imageStorageRepository;
        _storageAppService = storageAppService;
        _stepRecordRepository = stepRecordRepository;
        _processStepRepository = processStepRepository;
    }

    public async Task<PagedResultDto<ProcessDto>> GetListCustomAsync(ProcessFilterDto input)
    {
        var processQuery = await _processRepository.GetQueryableAsync();
        var recordQuery = await _recordRepository.GetQueryableAsync();
        var stepRecordQuery = await _stepRecordRepository.GetQueryableAsync();
        var processStepQuery = await _processStepRepository.GetQueryableAsync();
        var query = processQuery.Where(n => n.IsDeleted == false)
            .WhereIf(!string.IsNullOrEmpty(input.Filter), n => n.Name.ToLower().Contains(input.Filter.ToLower()))
            .Select(n => new ProcessDto
            {
                Id = n.Id,
                Name = n.Name,
                Note = n.Note,
                CreationTime = n.CreationTime,
                IdEditable = recordQuery.Any(g => g.ProcessId == n.Id)
            });
        var result = query
            .OrderBy(input.Sorting ?? "Name")
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount).ToList();
        foreach (var processDto in result)
        {
            var checkProcessId = (from stepRecord in stepRecordQuery
                join processStep in processStepQuery on stepRecord.ProcessStepId equals processStep.Id
                where processStep.ProcessId == processDto.Id
                select stepRecord.Id).Any();
            processDto.IdEditable = checkProcessId;
        }

        return new PagedResultDto<ProcessDto>(query.Count(), result);
    }

    public async Task<ListResultDto<DropdownItemBaseDto>> GetDropdownListAsync()
    {
        var query = (await _processRepository.GetListAsync())
            .Where(x => !x.IsDeleted)
            .Select(x => new DropdownItemBaseDto
            {
                Id = x.Id,
                Name = x.Name
            }).ToList();
        return new ListResultDto<DropdownItemBaseDto>(query);
    }

    public override async Task<ProcessDto> CreateAsync(CreateUpdateProcessDto input)
    {
        var output = base.CreateAsync(input);
        if (output.Result != null && input.LogoImage != null)
        {
            await _imageStorageRepository.InsertAsync(new ImageStorage
            {
                RelatedEntityId = output.Result.Id,
                RelatedEntityType = (int)ImageStorageEnum.Process,
                ImageName = input.LogoImage,
                TenantId = CurrentTenant.Id
            });
        }

        return output.Result ?? new ProcessDto();
    }

    public override async Task<ProcessDto> UpdateAsync(Guid id, CreateUpdateProcessDto input)
    {
        if (input.LogoImage == null)
        {
            return base.UpdateAsync(id, input).Result;
        }

        var checkImage = await _imageStorageRepository.FirstOrDefaultAsync(
            n => n.RelatedEntityId == id
                 && n.RelatedEntityType == (int)ImageStorageEnum.Process
                 && n.ImageName == input.LogoImage
        );
        if (checkImage != null)
        {
            return base.UpdateAsync(id, input).Result;
        }

        {
            await _imageStorageRepository.DeleteAsync(n =>
                n.RelatedEntityId == id && n.RelatedEntityType == (int)ImageStorageEnum.Process);
            await _imageStorageRepository.InsertAsync(new ImageStorage
            {
                RelatedEntityId = id,
                RelatedEntityType = (int)ImageStorageEnum.Process,
                ImageName = input.LogoImage,
                TenantId = CurrentTenant.Id
            });
        }
        return base.UpdateAsync(id, input).Result;
    }

    public override async Task<ProcessDto> GetAsync(Guid id)
    {
        var logoImage = await _imageStorageRepository.FirstOrDefaultAsync(
            n => n.RelatedEntityId == id
                 && n.RelatedEntityType == (int)ImageStorageEnum.Process
        );
        var output = base.GetAsync(id);
        if (output.Result == null || logoImage == null)
        {
            return base.GetAsync(id).Result ?? new ProcessDto();
        }

        output.Result.LogoImage = logoImage.ImageName;
        output.Result.ImageBase64 = _storageAppService.GetBase64Image(logoImage.ImageName);

        return output.Result ?? new ProcessDto();
    }
}