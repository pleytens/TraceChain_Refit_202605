export interface CreateUpdateRecordDto {
  id: string;
  code: string;
  profileName: string;
  processName: string;
  contractNumber: string;
}

export interface CreateUpdateDoneDto {
  id: string;
  code: string;
  profileName: string;
  processId: string;
  contractNumber: string;
  productId: string;
  startNumber: string;
  traceAbilityCode: string;
}

export interface RecordDto {
  id?: string;
  code?: string;
  profileName?: string;
  processId?: string;
  contractNumber?: string;
}

export interface DoneDto {
  id?: string;
  code?: string;
  profileName?: string;
  processId?: string;
  contractNumber?: string;
  productId?: string;
  startNumber?: string;
  traceAbility?: string;
}

export interface ShareDto {
  id?: string;
  code?: string;
  contractNumber?: string;
  productId?: string;
  traceAbility?: string;
  partner?: string;
  shareBy?: string;
  sendDate?: string;
}

export interface RecieveDto {
  id?: string;
  code?: string;
  contractNumber?: string;
  productId?: string;
  traceAbility?: string;
  partner?: string;
  shareBy?: string;
  recieveDate?: string;
}

export interface RecordFilterDto {
  skipCount: number;
  maxResultCount: number;
  sorting?: string;
  filter?: string;
  filterProfile?: string;
  filterProcess?: string;
  fromDate?: string;
  toDate?: string;
}
