using System;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace Traceverified.TraceFarm.EnumTranslations;

public class EnumTranslationAppService : CrudAppService<
        EnumTranslation,
        EnumTranslationDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateEnumTranslationDto>,
    IEnumTranslationAppService
{
    private readonly IRepository<EnumTranslation, Guid> _repository;

    public EnumTranslationAppService(IRepository<EnumTranslation, Guid> repository) : base(repository)
    {
        _repository = repository;
    }

    public async Task<ListResultDto<EnumItemBaseDto>> GetListCustomAsync(EnumTranslationFilterDto input)
    {
        var cultureInfo = CultureInfo.CurrentUICulture;
        var enumTranslationQuery = await _repository.GetQueryableAsync();
        var userTypeList = enumTranslationQuery
            .Where(n => n.EnumType == input.EnumType && n.Language == cultureInfo.Name)
            .Select(n => new EnumItemBaseDto
            {
                Id = n.EnumKey,
                Name = n.EnumValue
            }).ToList();
        return new ListResultDto<EnumItemBaseDto>(userTypeList);
    }
}