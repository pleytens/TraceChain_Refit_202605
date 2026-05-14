using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Traceverified.TraceFarm.EnumTranslations;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace Traceverified.TraceFarm.ProcessManagements;

public class ProcessFieldAppService : CrudAppService<
        ProcessField,
        ProcessFieldDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateFieldOptionDto>,
    IProcessFieldAppService
{
    private readonly IEnumTranslationAppService _enumTranslationAppService;
    private readonly IRepository<ProcessFieldOption, Guid> _processFieldOptionRepository;
    private readonly IRepository<ProcessField, Guid> _processFieldRepository;
    private readonly IRepository<ProcessFieldResponse, Guid> _processFieldResponseRepository;

    public ProcessFieldAppService(IRepository<ProcessField, Guid> repository,
        IRepository<ProcessFieldOption, Guid> processFieldOptionRepository,
        IRepository<ProcessFieldResponse, Guid> processFieldResponseRepository,
        IEnumTranslationAppService enumTranslationAppService) : base(repository)
    {
        _processFieldRepository = repository;
        _processFieldOptionRepository = processFieldOptionRepository;
        _processFieldResponseRepository = processFieldResponseRepository;
        _enumTranslationAppService = enumTranslationAppService;
    }

    public async Task<PagedResultDto<ProcessFieldDto>> GetListCustomAsync(ProcessFieldFilterDto input)
    {
        var processFieldQuery = await _processFieldRepository.GetQueryableAsync();
        var processFieldOptionQuery = await _processFieldOptionRepository.GetQueryableAsync();
        var result = processFieldQuery.Where(n => n.StepId == input.ProcessStepId)
            .Select(n => new ProcessFieldDto
            {
                Id = n.Id,
                Name = n.Name,
                DataType = n.DataType,
                IsObligatory = n.IsObligatory,
                Position = n.Position,
                StepId = n.StepId,
                Options = processFieldOptionQuery.Where(x => x.ProcessFieldId == n.Id && !n.IsDeleted).Select(x =>
                    new ProcessFieldOptionDto
                    {
                        OptionValue = x.OptionValue,
                        Name = x.OptionValue,
                        Id = x.Id
                    }).ToList()
            }).OrderBy(n => n.Position).ToList();
        return new PagedResultDto<ProcessFieldDto>(result.Count, result);
    }

    public override async Task<ProcessFieldDto> CreateAsync(CreateUpdateFieldOptionDto input)
    {
        input.TenantId = CurrentTenant.Id;
        var output = await base.CreateAsync(input);
        if (output == null)
        {
            throw new Exception(L["Process:Step:Field:Create:Failed"]);
        }

        if (input.Options == null)
        {
            return output;
        }

        var listOption = input.Options.Select(n => new ProcessFieldOption
        {
            ProcessFieldId = output.Id,
            OptionValue = n.OptionValue
        });
        await _processFieldOptionRepository.InsertManyAsync(listOption);

        return output;
    }

    public override async Task<ProcessFieldDto> UpdateAsync(Guid id, CreateUpdateFieldOptionDto input)
    {
        var processFieldOptionQuery = await _processFieldOptionRepository.GetQueryableAsync();
        var processFieldOption = processFieldOptionQuery.Where(n => n.ProcessFieldId == id);

        // var deleteLst = processFieldOption.Where(n => n.)
        await _processFieldOptionRepository.DeleteManyAsync(processFieldOption);
        if (input.Options != null)
        {
            var listOption = input.Options.Select(n => new ProcessFieldOption
            {
                ProcessFieldId = id,
                OptionValue = n.OptionValue
            });
            await _processFieldOptionRepository.InsertManyAsync(listOption);
        }

        input.TenantId = CurrentTenant.Id;
        return await base.UpdateAsync(id, input);
    }

    public async Task<List<CreateUpdateFieldOptionDto>> UpdateListAsync(List<CreateUpdateFieldOptionDto> inputs)
    {
        foreach (var fieldDto in inputs)
        {
            var checkExist = await _processFieldRepository.FirstOrDefaultAsync(n => n.Id == fieldDto.Id);
            if (checkExist == null)
            {
                await CreateAsync(fieldDto);
            }
            else
            {
                await UpdateAsync(fieldDto.Id, fieldDto);
            }
        }

        return inputs;
    }

    public async Task<ListResultDto<EnumItemBaseDto>> GetFieldDataTypeAsync()
    {
        var input = new EnumTranslationFilterDto
        {
            EnumType = nameof(ProcessDataTypeEnum)
        };
        return await _enumTranslationAppService.GetListCustomAsync(input);
    }

    public override async Task DeleteAsync(Guid id)
    {
        var processFieldOptionQuery = await _processFieldOptionRepository.GetQueryableAsync();
        var processFieldOption = processFieldOptionQuery.Where(n => n.ProcessFieldId == id);
        await _processFieldOptionRepository.HardDeleteAsync(processFieldOption);
        var processFieldResponseQuery = await _processFieldResponseRepository.GetQueryableAsync();
        var processFieldResponse = processFieldResponseQuery.Where(n => n.ProcessFieldId == id);
        await _processFieldResponseRepository.HardDeleteAsync(processFieldResponse);
        await base.DeleteAsync(id);
    }
}