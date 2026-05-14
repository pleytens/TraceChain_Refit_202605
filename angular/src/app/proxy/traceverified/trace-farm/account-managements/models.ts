import type { IdentityUserCreateDto } from '../../../volo/abp/identity/models';

export interface UserCreateDto extends IdentityUserCreateDto {
  profileImageUrl?: string;
}
