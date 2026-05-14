using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Traceverified.TraceFarm.EnumTranslations;
using Traceverified.TraceFarm.ProcessManagements;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace Traceverified.TraceFarm.ReportTemplates;

public class ReportTemplateAppService : CrudAppService<
        ReportTemplate,
        ReportTemplateDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateReportTemplateDto>,
    IReportTemplateAppService
{
    private readonly IRepository<EnumTranslation, Guid> _enumTranslationRepository;
    private readonly IRepository<ProcessField, Guid> _processFieldRepository;
    private readonly IRepository<ProcessFieldTemplate, Guid> _processFieldTemplateRepository;
    private readonly IRepository<Process, Guid> _processRepository;
    private readonly IRepository<ProcessStep, Guid> _processStepRepository;
    private readonly IRepository<ReportTemplate, Guid> _repository;

    public ReportTemplateAppService(IRepository<ReportTemplate, Guid> repository,
        IRepository<Process, Guid> processRepository,
        IRepository<ProcessStep, Guid> processStepRepository,
        IRepository<ProcessField, Guid> processFieldRepository,
        IRepository<EnumTranslation, Guid> enumTranslationRepository,
        IRepository<ProcessFieldTemplate, Guid> processFieldTemplateRepository) : base(repository)
    {
        _repository = repository;
        _processRepository = processRepository;
        _processStepRepository = processStepRepository;
        _processFieldRepository = processFieldRepository;
        _enumTranslationRepository = enumTranslationRepository;
        _processFieldTemplateRepository = processFieldTemplateRepository;
    }

    public async Task<PagedResultDto<ReportTemplateDto>> GetListCustomAsync(ReportTemplateFilterDto input)
    {
        var cultureInfo = CultureInfo.CurrentUICulture;
        var reportTemplateQuery = await _repository.GetQueryableAsync();
        var enumTranslationQuery = await _enumTranslationRepository.GetQueryableAsync();
        var query = reportTemplateQuery
            .WhereIf(!string.IsNullOrEmpty(input.Filter), n => n.Name.ToLower().Contains(input.Filter.ToLower()));
        var joinQuery = from reportTemplate in query
            select new ReportTemplateDto
            {
                Id = reportTemplate.Id,
                CreationTime = reportTemplate.CreationTime,
                Name = reportTemplate.Name,
                UserType = reportTemplate.UserType,
                UserTypeName = enumTranslationQuery.FirstOrDefault(n =>
                    n.EnumKey == reportTemplate.UserType && n.Language == cultureInfo.Name)!.EnumValue
            };
        var result = joinQuery
            .OrderBy(input.Sorting ?? "Name")
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount).ToList();
        return new PagedResultDto<ReportTemplateDto>(joinQuery.Count(), result);
    }

    public async Task<ListResultDto<EnumItemBaseDto>> GetUserTypeDropdownAsync()
    {
        var cultureInfo = CultureInfo.CurrentUICulture;
        var enumTranslationQuery = await _enumTranslationRepository.GetQueryableAsync();
        var userTypeList = enumTranslationQuery
            .Where(n => n.EnumType == nameof(TemplateUserTypeEnum)
                        && n.Language == cultureInfo.Name
                // && n.EnumKey > (int)TemplateUserTypeEnum.Government
            )
            .Select(n => new EnumItemBaseDto
            {
                Id = n.EnumKey,
                Name = n.EnumValue
            }).ToList();
        return new ListResultDto<EnumItemBaseDto>(userTypeList);
    }

    public async Task<ListResultDto<StepAndFieldDto>> GetStepAndField(Guid? reportTemplateId, Guid processId)
    {
        var returnList = new List<StepAndFieldDto>();
        var stepQuery = await _processStepRepository.GetQueryableAsync();
        var fieldQuery = await _processFieldRepository.GetQueryableAsync();
        var processFieldTemplateQuery = await _processFieldTemplateRepository.GetQueryableAsync();

        var query = (from step in stepQuery
            join field in fieldQuery on step.Id equals field.StepId
            where step.ProcessId == processId
            select new
            {
                step.Id,
                step.Name,
                FieldId = field.Id,
                FieldName = field.Name,
                step.Position
            }).ToList();
        var group = query.GroupBy(n => new { n.Id, n.Position }).ToList().OrderBy(g => g.Key.Position);
        returnList.AddRange(group.Select(step => new StepAndFieldDto
        {
            Id = step.Key.Id, Name = query.FirstOrDefault(n => n.Id == step.Key.Id)!.Name,
            Fields = step.Select(n => new FieldDto { Id = n.FieldId, Name = n.FieldName }).ToList()
        }));
        if (reportTemplateId == null)
        {
            return new ListResultDto<StepAndFieldDto>(returnList);
        }

        var processFieldTemplateList = processFieldTemplateQuery
            .Where(n => n.ReportTemplateId == reportTemplateId).ToList();
        foreach (var stepAndFieldDto in returnList)
        {
            foreach (var fieldDto in stepAndFieldDto.Fields.Where(fieldDto =>
                         processFieldTemplateList.Any(n => n.ProcessFieldId == fieldDto.Id)))
            {
                fieldDto.IsChecked = true;
            }

            stepAndFieldDto.IsChecked =
                stepAndFieldDto.Fields.Count == stepAndFieldDto.Fields.Count(n => n.IsChecked);
        }

        return new ListResultDto<StepAndFieldDto>(returnList);
    }

    public override async Task<ReportTemplateDto> CreateAsync(CreateUpdateReportTemplateDto input)
    {
        var reportTemplate = ObjectMapper.Map<CreateUpdateReportTemplateDto, ReportTemplate>(input);
        reportTemplate.TenantId = CurrentTenant.Id;
        var insertOutput = await _repository.InsertAsync(reportTemplate, true);

        if (input.Details == null)
        {
            return ObjectMapper.Map<ReportTemplate, ReportTemplateDto>(reportTemplate);
        }

        var processFieldTemplateList = input.Details.SelectMany(n => n.Fields)
            .Where(n => n.IsChecked).Select(n => n.Id)
            .Select(fieldId => new ProcessFieldTemplate
                { ReportTemplateId = reportTemplate.Id, ProcessFieldId = fieldId }).ToList();
        await _processFieldTemplateRepository.InsertManyAsync(processFieldTemplateList, true);
        return ObjectMapper.Map<ReportTemplate, ReportTemplateDto>(reportTemplate);
    }

    public override async Task<ReportTemplateDto> UpdateAsync(Guid id, CreateUpdateReportTemplateDto input)
    {
        var processFieldQuery = await _processFieldRepository.GetQueryableAsync();
        var processFieldTempQuery = await _processFieldTemplateRepository.GetQueryableAsync();
        var stepQuery = await _processStepRepository.GetQueryableAsync();
        var reportTemplate = await _repository.GetAsync(id);
        ObjectMapper.Map(input, reportTemplate);
        var updateOutput = await _repository.UpdateAsync(reportTemplate, true);

        if (input.Details == null)
        {
            return ObjectMapper.Map<ReportTemplate, ReportTemplateDto>(reportTemplate);
        }

        var processFieldTemplateList = input.Details.SelectMany(n => n.Fields)
            .Where(n => n.IsChecked).Select(n => n.Id)
            .Select(fieldId => new ProcessFieldTemplate
                { ReportTemplateId = reportTemplate.Id, ProcessFieldId = fieldId }).ToList();

        if (!processFieldTemplateList.Any())
        {
            return ObjectMapper.Map<ReportTemplate, ReportTemplateDto>(reportTemplate);
        }

        var processFieldTemplate = processFieldTemplateList.FirstOrDefault();
        if (processFieldTemplate == null)
        {
            return ObjectMapper.Map<ReportTemplate, ReportTemplateDto>(reportTemplate);
        }

        var processId = (from field in processFieldQuery
            join step in stepQuery on field.StepId equals step.Id
            where processFieldTemplate.ProcessFieldId == field.Id
            select step.ProcessId).FirstOrDefault();

        var lstFieldTemplate = from fieldTemp in processFieldTempQuery
            join field in processFieldQuery on fieldTemp.ProcessFieldId equals field.Id
            join step in stepQuery on field.StepId equals step.Id
            where fieldTemp.ReportTemplateId == reportTemplate.Id && step.ProcessId == processId
            select fieldTemp;

        await _processFieldTemplateRepository.HardDeleteAsync(lstFieldTemplate);
        await _processFieldTemplateRepository.InsertManyAsync(processFieldTemplateList, true);
        return ObjectMapper.Map<ReportTemplate, ReportTemplateDto>(reportTemplate);
    }
}