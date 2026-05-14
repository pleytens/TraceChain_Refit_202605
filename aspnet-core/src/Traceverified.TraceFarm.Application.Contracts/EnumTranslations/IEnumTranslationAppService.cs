using System;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.EnumTranslations;

public interface IEnumTranslationAppService : ICrudAppService<EnumTranslationDto, Guid, PagedAndSortedResultRequestDto,
    CreateUpdateEnumTranslationDto>
{
    Task<ListResultDto<EnumItemBaseDto>> GetListCustomAsync(EnumTranslationFilterDto input);
}