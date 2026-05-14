export class ReportProduct {
  productName: string;
  gtinCode: string;
  description: string;
  images: string[];
  certificationImages: string[];
  activationDate: string;
  companyLogo: string;
  constructor() {}
}

export class ReportCompany {
	name: string;
  gS1Code: string;
  description: string;
  address: string;
  country: string;
  phoneNumber: string;
  emailAddress: string;
  websiteUrl: string;
  certificationImages: string[];

  constructor() {}
}

export class ReportDiary {
  materialTraceCode: any[];
  steps: any = [];
}

export class DiaryReportStep {
  processName?: string;
  recordDate?: string;
  fieldRecords: FieldRecord[];
}

export class FieldRecord {
  fieldName?: string;
  fieldAnswer?: string;
  dataType?: string;
}
