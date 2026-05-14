using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Traceverified.TraceFarm.FileManagement;
using Traceverified.TraceFarm.Permissions;
using Traceverified.TraceFarm.Share;
using Traceverified.TraceFarm.Stograges;
using Traceverified.TraceFarm.Storages;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Volo.Abp.ObjectExtending;

namespace Traceverified.TraceFarm.AccountManagements;

public class UserCustomAppService(
    IRepository<IdentityUser, Guid> repository,
    IdentityUserManager userManager,
    IIdentityUserRepository userRepository,
    IIdentityRoleRepository roleRepository,
    IOptions<IdentityOptions> identityOptions,
    IPermissionChecker permissionChecker,
    IRepository<ImageStorage, Guid> imageStorageRepository,
    IStorageAppService storageAppService)
    : CrudAppService<
            IdentityUser, //The Market entity
            IdentityUserDto, //Used to show markets
            Guid, //Primary key of the market entity
            PagedAndSortedResultRequestDto, //Used for paging/sorting
            UserCreateDto>(repository), //Used to create/update a market, 
        IUserCustomAppService
{
    private readonly IRepository<IdentityUser, Guid> _repository = repository;

    private IdentityUserManager UserManager { get; } = userManager;
    private IOptions<IdentityOptions> IdentityOptions { get; } = identityOptions;
    private IPermissionChecker PermissionChecker { get; } = permissionChecker;


    public override async Task<IdentityUserDto> CreateAsync(UserCreateDto input)
    {
        await IdentityOptions.SetAsync();

        var user = new IdentityUser(
            GuidGenerator.Create(),
            input.UserName,
            input.Email,
            CurrentTenant.Id
        );
        input.MapExtraPropertiesTo(user);

        (await UserManager.CreateAsync(user, input.Password)).CheckErrors();
        await UpdateUserByInput(user, input);
        (await UserManager.UpdateAsync(user)).CheckErrors();

        await CurrentUnitOfWork.SaveChangesAsync();

        return ObjectMapper.Map<IdentityUser, IdentityUserDto>(user);
    }

    public async Task<ListResultDto<DropdownItemBaseDto>> GetUserDropdownItem(string? filter)
    {
        var query = await _repository.GetQueryableAsync();
        var result = query
            .WhereIf(
                !filter.IsNullOrWhiteSpace(),
                u => u.UserName.Contains(filter) || u.Email.Contains(filter) || u.Name.Contains(filter) ||
                     u.Surname.Contains(filter) || u.PhoneNumber.Contains(filter)
            )
            .Select(u => new DropdownItemBaseDto
            {
                Id = u.Id,
                Name = u.UserName
            })
            .ToList();
        return new ListResultDto<DropdownItemBaseDto>(result);
    }
    
    public async Task<ListResultDto<DropdownItemBaseDto>> GetUserDropdownItem2(string? filter)
    {
        var query = await _repository.GetQueryableAsync();
        var result = query
            .WhereIf(
                !filter.IsNullOrWhiteSpace(),
                u => filter != null && (u.UserName.Contains(filter) || u.Email.Contains(filter) || u.Name.Contains(filter) ||
                                        u.Surname.Contains(filter) || u.PhoneNumber.Contains(filter))
            )
            .Select(u => new DropdownItemBaseDto
            {
                Id = u.Id,
                Name = $"{u.Name}- {u.UserName}",
            })
            .ToList();
        return new ListResultDto<DropdownItemBaseDto>(result);
    }

    public async Task<UserCreateDto?> GetUserProfile(Guid userId)
    {
        var user = await _repository.FirstOrDefaultAsync(n => n.Id == userId);
        if (user == null)
        {
            return null;
        }

        var result = ObjectMapper.Map<IdentityUser, UserCreateDto>(user);
        var image = await imageStorageRepository.FirstOrDefaultAsync(n =>
            n.RelatedEntityId == user.Id && n.RelatedEntityType == (int)ImageStorageEnum.User);
        if (image != null)
        {
            result.ProfileImageUrl = storageAppService.GetFileUrl(image.ImageName);
        }

        return result;
    }

    public async Task<string> GetUserAvatar(Guid userId)
    {
        var user = await _repository.FirstOrDefaultAsync(n => n.Id == userId);
        if (user == null)
        {
            return string.Empty;
        }

        var image = await imageStorageRepository.FirstOrDefaultAsync(n =>
            n.RelatedEntityId == user.Id && n.RelatedEntityType == (int)ImageStorageEnum.User);
        if (image != null)
        {
            return storageAppService.GetFileUrl(image.ImageName);
        }

        return string.Empty;
    }

    protected virtual async Task UpdateUserByInput(IdentityUser user, IdentityUserCreateOrUpdateDtoBase input)
    {
        if (!string.Equals(user.Email, input.Email, StringComparison.InvariantCultureIgnoreCase))
        {
            (await UserManager.SetEmailAsync(user, input.Email)).CheckErrors();
        }

        if (!string.Equals(user.PhoneNumber, input.PhoneNumber, StringComparison.InvariantCultureIgnoreCase))
        {
            (await UserManager.SetPhoneNumberAsync(user, input.PhoneNumber)).CheckErrors();
        }

        if (user.Id != CurrentUser.Id)
        {
            (await UserManager.SetLockoutEnabledAsync(user, input.LockoutEnabled)).CheckErrors();
        }

        user.Name = input.Name;
        user.Surname = input.Surname;
        (await UserManager.UpdateAsync(user)).CheckErrors();
        user.SetIsActive(input.IsActive);
        if (input.RoleNames != null &&
            await PermissionChecker.IsGrantedAsync(TraceFarmPermissions.UserCustoms.ManageRoles))
        {
            (await UserManager.SetRolesAsync(user, input.RoleNames)).CheckErrors();
        }
    }
    
    public async Task<string> UpdateAvatarAsync(Guid userId, string fileName)
    {
        var image = await imageStorageRepository.FirstOrDefaultAsync(n =>
            n.RelatedEntityId == userId && n.RelatedEntityType == (int)ImageStorageEnum.User);
        if (image == null)
        {
            var imageObj = new ImageStorage
            {
                RelatedEntityId = userId,
                RelatedEntityType = (int)ImageStorageEnum.User,
                ImageName = fileName
            };
            await imageStorageRepository.InsertAsync(imageObj);
        }else
        {
            image.ImageName = fileName;
            await imageStorageRepository.UpdateAsync(image);
        }

        return storageAppService.GetFileUrl(fileName);
    } 
}