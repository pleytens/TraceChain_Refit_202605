import type { CompanyDto } from '../companies/models';

export interface CompanyForQrCodeDto extends CompanyDto {
  description?: string;
  companyProfileId?: string;
  updateToken?: string;
}

export interface GenerateQrCodeDto {
  companyLogo: string;
  gS1Code: string;
  name: string;
  emailAddress: string;
  phoneNumber: string;
  address: string;
  nationId: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  companyCertificationImages: string[];
  websiteUrl?: string;
  tenantId?: string;
  companyDescription?: string;
  productGTINCode: string;
  productName: string;
  productDescription: string;
  productCategoryId: string;
  productImages: string[];
  productCertificationImages: string[];
}

export interface GenerateQrCodeResponseDto extends GenerateQrCodeDto {
  updateToken?: string;
  productId?: string;
  companyId?: string;
  companyProfileId?: string;
}

export interface UpdateCompanyInfoDto {
  gS1Code?: string;
  updateToken?: string;
  emailAddress?: string;
  productId?: string;
}
