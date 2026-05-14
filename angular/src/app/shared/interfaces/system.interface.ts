export interface ConfigTableInterface {
  Data: any;
  ColWidth: Array<string>;
  Action: Array<Action>;
  Header: Array<HeaderTableInterface>;
  IsShowSearch?: boolean;
  ClientPaging?: boolean;
  HideAction?: boolean;
  Type?: string;
  ResetSelectionsOnNewData?: boolean;
}

export interface HeaderTableInterface {
  Key: string;
  Type?: string;
  Name: string;
  IconContainerClass?: string;
  Icon?: string;
  Editable?: boolean;
  BadgeClass?: string;
  DataMin?: string;
  DataMax?: string;
  IsSort?: boolean
}

export interface Action {
  Key: string;
  Name: string;
  Icon: string;
  Permission?: string;
  disabled?: boolean;
}

