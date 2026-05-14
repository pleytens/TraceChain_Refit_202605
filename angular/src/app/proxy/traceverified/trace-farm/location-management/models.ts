
export interface LocationMasterDto {
  id?: string;
  name?: string;
  children: LocationMasterDto[];
}
