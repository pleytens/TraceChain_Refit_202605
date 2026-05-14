using System;
using System.Threading.Tasks;
using Traceverified.TraceFarm.Share;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Identity;

namespace Traceverified.TraceFarm.AccountManagements;

public interface
    IUserCustomAppService : ICrudAppService<IdentityUserDto, Guid, PagedAndSortedResultRequestDto, UserCreateDto>
{
    Task<ListResultDto<DropdownItemBaseDto>> GetUserDropdownItem(string? filter);
    Task<ListResultDto<DropdownItemBaseDto>> GetUserDropdownItem2(string? filter);
    Task<UserCreateDto?> GetUserProfile(Guid userId);
    Task<string> UpdateAvatarAsync(Guid userId, string fileName);
}