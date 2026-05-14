using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Identity;

namespace Traceverified.TraceFarm.AccountManagements;

public class UserCreateDto : IdentityUserCreateDto
{
    // public Guid CountryId { get; set; }
    // public Guid ProvinceId { get; set; }
    // public Guid DistrictId { get; set; }
    // public Guid WardId { get; set; }
    // public string Address { get; set; }
    [NotMapped] public string? ProfileImageUrl { get; set; }
}