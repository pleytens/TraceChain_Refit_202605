export interface CreateUpdateProcessDto {
  name: string;
  id: string;
  Note: string;
  image: string;
}
export interface ProcessDto {
  image?: string;
  name?: string;
  id?: string;
  note?: string;
  steps?: StepDto[];
}
export interface ProcessFilterDto {
  skipCount: number;
  maxResultCount: number;
  sorting?: string;
  filter?: string;
}
export interface CreateUpdateStepDto {
  processId: string;
  name: string;
  description: string;
  Receptacle: string;
  userTagName: string;
  userTagId: string[];
}
export interface StepDto {
  processId?: string;
  id?: string;
  name?: string;
  description?: string;
  receptacle?: string;
  userTagName?: string;
  userTagId?: string[];
  field?: FieldDto[];
}
export interface CreateUpdateFieldDto {
  fieldId: string;
  fieldName: string;
  input: string[];
  dataType: string;
  obligatory: boolean;
}
export interface FieldDto {
  fieldId?: string;
  stepId?: string;
  fieldName?: string;
  options?: any[];
  dataType?: string;
  obligatory?: boolean;
  result?: string;
}
