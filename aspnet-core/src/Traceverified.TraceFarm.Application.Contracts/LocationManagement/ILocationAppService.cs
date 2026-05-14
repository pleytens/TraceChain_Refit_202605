using System;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Traceverified.TraceFarm.LocationManagement;

public interface ILocationAppService : IApplicationService
{
    Task<ListResultDto<DropdownItemBaseDto>> GetCountryDropdownAsync();
    Task<ListResultDto<DropdownItemBaseDto>> GetProvinceDropdownAsync(Guid countryId);
    Task<ListResultDto<DropdownItemBaseDto>> GetDistrictDropdownAsync(Guid provinceId);
    Task<ListResultDto<DropdownItemBaseDto>> GetWardDropdownAsync(Guid districtId);
    Task<ListResultDto<LocationMasterDto>> GetAllLocationAsync();
}