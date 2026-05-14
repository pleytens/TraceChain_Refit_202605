
export interface CreateUpdateProfileDto {
    profileName: string;
  marketName: string;
  categoryName: string;
  companyName: string;
  certification: string;
  description: string;
  }
  
  export interface ProfileDto  {
      profileName?: string;
      marketId?: string;
      marketName?: string;
      categoryId?: string;
      categoryName?: string;
      name?: string;
      certification?: string;
      description?: string;
  }
  
  export interface ProfileFilterDto {
    skipCount: number;
    maxResultCount: number;
    sorting?: string;
    filter?: string;
    marketId?:string;
    categoryId?: string;
  }
  
  export interface DropdownItemBaseDto {
    id?: string;
    name?: string;
  }
  