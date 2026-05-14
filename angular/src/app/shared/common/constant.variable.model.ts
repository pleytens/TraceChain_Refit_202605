/**
 * The all costant values will be define here
 */
import { IMultiSelectOption } from 'ngx-bootstrap-multiselect';

export const GuiEmpty = '00000000-0000-0000-0000-000000000000';
export class ConstantVariableModel {
  public static readonly DEFAULT_IMAGE: string = '/assets/default.jpg';
}

export declare const enum eCustomLayout {
  customHomeLayout = 'CustomHomeLayout',
}

export declare const enum RelatedEntityType {
  User = 1,
  CompanyProfileCertification = 5,
  Product = 10,
  ProductCertification = 11,
  Process = 20,
  ProcessResponse = 21,
}

export enum EnumConfirmationToken {
  Null = 0,
  Success = 1,
  IsUsed = 2,
  IsExpired = 3,
}

export enum Status {
  All = 3,
  Active = 1,
  Expired = 2,
}

export enum QrCodeType {
  QrCodeDefault = 1,
  QrCodeFree = 2,
}

export enum ImageStorageEnum {
  User = 1,
  CompanyProfileCertification = 5,
  Product = 10,
  ProductCertification = 11,
  Process = 20,
  ProcessResponse = 21,
}

export const QuestionDataType: IMultiSelectOption[] = [
  { id: 0, name: 'Text' },
  { id: 1, name: 'Select' },
  { id: 2, name: 'MultipleSelect' },
];

export enum QuestionDataTypeEnum {
  Text = 0,
  Select = 1,
  MultipleSelect = 2,
}

export const Types = {
  Date: "Date",
  Time: "Time",
  Number: "Number",
  Double: "Double",
  Hover: "Hover",
  Enum: "Enum",
};
export const Action = {
  Create: "Create",
  Back: "Back",
  Edit: "Edit",
  Delete: "Delete",
  View: "View",
  PrintQr: "PrintQr",
  Translate: "Translate",
  Filter: "Filter",
  Copy: "Copy",
  PageChange: "PageChange",
  Delivery: "Delivery",
  SelectFertilizer: "SelectFertilizer",
  SelectIssues: "SelectIssues",
  Inactive: "Inactive",
  Permission: "Permission",
  RowClick: "RowClick",
};

