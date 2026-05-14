using System;
using System.Linq;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Locations;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace Traceverified.TraceFarm.LocationManagement;

public class LocationAppService : ApplicationService, ILocationAppService
{
    private readonly IRepository<LocationCountry, Guid> _countryRepository;
    private readonly IRepository<LocationDistrict, Guid> _districtRepository;
    private readonly IRepository<LocationProvince, Guid> _provinceRepository;
    private readonly IRepository<LocationWard, Guid> _wardRepository;
    private IRepository<LocationTranslation, Guid> _locationTranslationRepository;

    public LocationAppService(
        IRepository<LocationTranslation, Guid> locationTranslationRepository,
        IRepository<LocationCountry, Guid> countryRepository,
        IRepository<LocationProvince, Guid> provinceRepository,
        IRepository<LocationDistrict, Guid> districtRepository,
        IRepository<LocationWard, Guid> wardRepository)
    {
        _locationTranslationRepository = locationTranslationRepository;
        _countryRepository = countryRepository;
        _provinceRepository = provinceRepository;
        _districtRepository = districtRepository;
        _wardRepository = wardRepository;
    }

    public async Task<ListResultDto<DropdownItemBaseDto>> GetCountryDropdownAsync()
    {
        var query = (await _countryRepository.GetQueryableAsync())
            .Where(x => !x.IsDeleted && x.IsPublished)
            .Select(x => new DropdownItemBaseDto
            {
                Id = x.Id,
                Name = x.OriginalName
            }).ToList();
        return new ListResultDto<DropdownItemBaseDto>(query);
    }

    public async Task<ListResultDto<DropdownItemBaseDto>> GetProvinceDropdownAsync(Guid countryId)
    {
        var query = (await _provinceRepository.GetQueryableAsync())
            .Where(x => !x.IsDeleted && x.IsPublished && x.LocationCountryId == countryId)
            .Select(x => new DropdownItemBaseDto
            {
                Id = x.Id,
                Name = x.OriginalName
            }).ToList();
        return new ListResultDto<DropdownItemBaseDto>(query);
    }

    public async Task<ListResultDto<DropdownItemBaseDto>> GetDistrictDropdownAsync(Guid provinceId)
    {
        var query = (await _districtRepository.GetQueryableAsync())
            .Where(x => !x.IsDeleted && x.IsPublished && x.LocationProvinceId == provinceId)
            .Select(x => new DropdownItemBaseDto
            {
                Id = x.Id,
                Name = x.OriginalName
            }).ToList();
        return new ListResultDto<DropdownItemBaseDto>(query);
    }

    public async Task<ListResultDto<DropdownItemBaseDto>> GetWardDropdownAsync(Guid districtId)
    {
        var query = (await _wardRepository.GetQueryableAsync())
            .Where(x => !x.IsDeleted && x.IsPublished && x.LocationDistrictId == districtId)
            .Select(x => new DropdownItemBaseDto
            {
                Id = x.Id,
                Name = x.OriginalName
            }).ToList();
        return new ListResultDto<DropdownItemBaseDto>(query);
    }

    public async Task<ListResultDto<LocationMasterDto>> GetAllLocationAsync()
    {
        var countryQuery = await _countryRepository.GetQueryableAsync();
        var provinceQuery = await _provinceRepository.GetQueryableAsync();
        var districtQuery = await _districtRepository.GetQueryableAsync();
        var wardQuery = await _wardRepository.GetQueryableAsync();
        var query = countryQuery
            .Select(x => new LocationMasterDto
            {
                Id = x.Id,
                Name = x.OriginalName,
                Children = provinceQuery.Where(n => n.LocationCountryId == x.Id)
                    .Select(n => new LocationMasterDto
                    {
                        Id = n.Id,
                        Name = n.OriginalName,
                        Children = districtQuery.Where(g => g.LocationProvinceId == n.Id)
                            .Select(g => new LocationMasterDto
                            {
                                Id = g.Id,
                                Name = g.OriginalName,
                                Children = wardQuery.Where(o => o.LocationDistrictId == g.Id)
                                    .Select(o => new LocationMasterDto
                                    {
                                        Id = o.Id,
                                        Name = o.OriginalName
                                    }).ToList()
                            }).ToList()
                    }).ToList()
            }).OrderByDescending(o=>o.Name).ToList();
        return new ListResultDto<LocationMasterDto>(query);
    }
}