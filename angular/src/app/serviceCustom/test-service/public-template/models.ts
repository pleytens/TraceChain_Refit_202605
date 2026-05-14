export interface TemplateDto {
  id?: string;
  name?: string;
  userType?: string;
}

export interface CreateUpdateTemplateDto {
  name: string;
  userType: string;
}

export interface TemplateFilterDto {
  skipCount: number;
  maxResultCount: number;
  sorting?: string;
  filter?: string;
}
