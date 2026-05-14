
export interface CodeSharedFilterDto {
  fromDate?: string;
  toDate?: string;
  partnerId?: string;
}

export interface CodeSharedPerCusFilterDto {
  fromDate?: string;
  toDate?: string;
  customerId?: string;
  productIds: string[];
}

export interface CompanyReportTv2Dto {
  name?: string;
  gS1Code?: string;
  address?: string;
  country?: string;
  phoneNumber?: string;
  emailAddress?: string;
  websiteUrl?: string;
  logoUrl?: string;
  logo?: string;
  participationDate?: string;
  expirationDate: number;
}

export interface CompanyStatusDetailDto {
  percentage: number;
  profit: number;
}

export interface CompanyStatusDto {
  companyStatuses: number[];
  profitYear: CompanyStatusDetailDto;
  profitMonth: CompanyStatusDetailDto;
}

export interface DatasetQrCodeSharedDto {
  label?: string;
  backgroundColor?: string;
  borderColor?: string;
  data: number[];
}

export interface DatasetQrCodeSharedPerCusDto {
  label?: string;
  backgroundColor?: string;
  borderColor?: string;
  data: number[];
}

export interface ProductFilterDto {
  fromDate?: string;
  toDate?: string;
  isExpired?: boolean;
  quantityToTake?: number;
}

export interface ProductInfoDto {
  id?: string;
  companyId?: string;
  productName?: string;
  gtinCode?: string;
  companyName?: string;
  isExpired: boolean;
  email?: string;
  creationTime?: string;
}

export interface StatisticalDto {
  displayTitle?: string;
  number: number;
}

export interface StatisticalQrCodeSharedDto {
  labels: string[];
  datasets: DatasetQrCodeSharedDto[];
}

export interface StatisticalQrCodeSharedPerCusDto {
  labels: string[];
  datasets: DatasetQrCodeSharedPerCusDto[];
}
