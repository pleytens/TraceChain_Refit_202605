
export interface DropdownItemBaseDto {
  id?: string;
  name?: string;
}

export interface RequestCustomDto {
  skipCount: number;
  maxResultCount: number;
  sorting?: string;
  filter?: string;
}

export interface StepRecordDropdownDto extends DropdownItemBaseDto {
  useAll: boolean;
}

export interface DropdownForStepDto extends DropdownItemBaseDto {
  isSpecial?: number;
  tabIndex: number;
}

export interface DropdownItemForMobileDto extends DropdownItemBaseDto {
  id?: string;
  name?: string;
  code?: string;
}

export interface EnumItemBaseDto {
  id: number;
  name?: string;
}
