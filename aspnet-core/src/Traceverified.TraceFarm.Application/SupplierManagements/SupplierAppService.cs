using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace Traceverified.TraceFarm.SupplierManagements;

public class SupplierAppService : CrudAppService<
        Supplier,
        SupplierDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateSupplierDto>,
    ISupplierAppService
{
    private readonly IRepository<Supplier, Guid> _supplierRepository;

    public SupplierAppService(IRepository<Supplier,
        Guid> supplierRepository) : base(supplierRepository)
    {
        _supplierRepository = supplierRepository;
    }

    public async Task<PagedResultDto<SupplierDto>> GetListCustomAsync(SupplierFilterDto input)
    {
        var query = await _supplierRepository.GetQueryableAsync();

        var filter = query.Where(n => n.IsDeleted == false)
            .WhereIf(!string.IsNullOrEmpty(input.Filter), n =>
                n.Code.ToLower().Contains(input.Filter.ToLower()) ||
                n.Name.ToLower().Contains(input.Filter.ToLower()) ||
                n.PhoneNumber.ToLower().Contains(input.Filter.ToLower()) ||
                n.Address.ToLower().Contains(input.Filter.ToLower()))
            .WhereIf(input.NationId.HasValue, n => n.NationId == input.NationId)
            .WhereIf(input.ProvinceId.HasValue, n => n.ProvinceId == input.ProvinceId)
            .WhereIf(input.DistrictId.HasValue, n => n.DistrictId == input.DistrictId)
            .WhereIf(input.WardId.HasValue, n => n.WardId == input.WardId);

        var result = filter.Skip(input.SkipCount)
            .Take(input.MaxResultCount)
            .Select(p => new SupplierDto
            {
                Id = p.Id,
                Code = p.Code,
                Name = p.Name,
                PhoneNumber = p.PhoneNumber,
                Address = p.Address,
                NationId = p.NationId,
                ProvinceId = p.ProvinceId,
                DistrictId = p.DistrictId,
                WardId = p.WardId,
                CreationTime = p.CreationTime
            })
            .OrderBy(input.Sorting ?? "Name")
            .ToList();
        return new PagedResultDto<SupplierDto>(filter.Count(), result);
    }

    public async Task<ListResultDto<DropdownItemBaseDto>> GetDropdownListAsync()
    {
        var query = await _supplierRepository.GetQueryableAsync();
        var result = query.Where(n => n.IsDeleted == false)
            .Select(p => new DropdownItemBaseDto
            {
                Id = p.Id,
                Name = p.Name
            })
            .OrderBy(n => n.Name)
            .ToList();
        return new ListResultDto<DropdownItemBaseDto>(result);
    }
}