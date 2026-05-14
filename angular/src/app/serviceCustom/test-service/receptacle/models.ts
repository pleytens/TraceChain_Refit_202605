export interface CreateUpdateReceptacleDto {
    id: string;
    description: string;
  }

  export interface ReceptacleDto {
    id?: string;
    description?: string;
  }
  
  export interface ReceptacleFilterDto {
    skipCount: number;
    maxResultCount: number;
    sorting?: string;
    filter?: string;
  }