import { Component, OnInit } from '@angular/core';
import { ListService, PagedResultDto } from '@abp/ng.core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StampDto, StampFilterDto, StampService } from '@proxy/traceverified/trace-farm/stamps';
import { Confirmation, ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { NgbDateNativeAdapter, NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';
import { DropdownItemBaseDto } from '@proxy/traceverified/trace-farm/share';
import { CompanyService } from '@proxy/traceverified/trace-farm/companies';
import { TraceabilityRecordV2Service } from '@proxy/traceverified/trace-farm/traceability-records-v2';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-stamp',
  templateUrl: './stamp.component.html',
  styleUrls: ['./stamp.component.scss'],
  providers: [ListService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class StampComponent implements OnInit {
  filterText: string = null;
  fromDate: string;
  filterCompanies: string[] = null;
  toDate: string;
  stamp = { items: [], totalCount: 0 } as PagedResultDto<StampDto>;
  form: FormGroup;
  isModalOpen = false;
  selectedStamp = {} as StampDto;
  selectBoxConfig: any = [];
  editSelectBoxConfig:any = [];
  companies = [];
  disable= true;
  editCompanySelected: DropdownItemBaseDto;
  constructor(
    public readonly list: ListService,
    private   stampService: StampService,
    private companyService: CompanyService,
    private toaster: ToasterService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private http: HttpClient
  ) {
    this.filterText = null;
    this.filterCompanies = [];
  }

  ngOnInit(): void {
    this.getCompanyDropdown();
    const stampStreamCreator = (query) => {
      const filterModel = {} as StampFilterDto;
      filterModel.filter = this.filterText;
      filterModel.sorting = query.sorting;
      filterModel.skipCount = query.skipCount;
      filterModel.maxResultCount = query.maxResultCount;
      filterModel.companyIds = this.filterCompanies;
      if (this.toDate){
        const date = new Date(this.toDate);
        filterModel.toDate = date.toLocaleDateString();
      }

      if(this.fromDate){
        const date = new Date(this.fromDate);
        filterModel.fromDate = date.toLocaleDateString();
      }

      return this.stampService.getListCustom(filterModel);
    };

    this.list.hookToQuery(stampStreamCreator).subscribe((response) => {
      this.stamp = response;
    });
  }

  createStamp() {
    this.selectedStamp = {} as StampDto;
    this.editCompanySelected = null;
    this.editSelectBoxConfig.selected = null;
    this.buildForm();
    this.isModalOpen = true;
  }

  filter($event: KeyboardEvent) {
    if ($event.key === 'Enter') {
      this.list.get();
    }
  }

  buildForm() {
    this.form = this.fb.group({
      startLotNumber: [this.selectedStamp.startLotNumber  || 0, Validators.required],
      endLotNumber: [this.selectedStamp.endLotNumber  || 0, Validators.required],
      quantity: [this.selectedStamp.quantity  || 0, Validators.required],
      companyId: [this.selectedStamp.companyId  || null],
      note: [this.selectedStamp.note  || null]
    });

    // this.form.get('startLotNumber').disable();
    // this.form.get('endLotNumber').disable();
  }

  editStamp(id) {
    this.stampService.get(id).subscribe((stamp) => {
      this.selectedStamp = stamp;
      const company = this.companies.find(n=>n.id == stamp.companyId);
      if (company){
        this.editSelectBoxConfig.selected = company;
      }
      this.buildForm();
      this.isModalOpen = true;
    });
  }

  deleteStamp(id) {
    this.confirmation.warn('::AreYouSureToDelete', '::AreYouSure').subscribe((status) => {
      if (status === Confirmation.Status.confirm) {
        this.stampService.delete(id).subscribe(() => this.list.get());
      }
    });
  }

  save() {
    if (this.editCompanySelected && this.editCompanySelected.id){
      this.form.value.companyId = this.editCompanySelected.id;
    }else{
      this.toaster.error("Please select company");
      return;
    }

    if (this.form.invalid) {
      return;
    }
    const request = this.selectedStamp.id
      ? this.stampService.update(this.selectedStamp.id, this.form.value)
      : this.stampService.create(this.form.value);

    request.subscribe(() => {
      this.isModalOpen = false;
      this.form.reset();
      this.list.get();
    });
  }

  eventSelectHandle($event: any) {
    if ($event.success)
    {
      this.filterCompanies.push($event.data.id+'');
    }else {
      this.filterCompanies = [];
    }
    this.list.get();
  }

  filterDateChange() {
    this.list.get();
  }

  eventEditSelectHandle($event: any) {
    if ($event.success)
    {
      this.editCompanySelected = $event.data;
      this.getStartEndNumber();
    }
  }

  getCompanyDropdown(){
    this.selectBoxConfig.data = [];
    this.editSelectBoxConfig.data = [];
    this.companyService.getCompanyDropdown().subscribe((res) => {
      this.companies = res.items;
      this.selectBoxConfig.data = res.items;
      this.editSelectBoxConfig.data = res.items;
    });
  }

  getStartEndNumber() {
    const quantity = this.form.get('quantity').value;
    if (this.editCompanySelected && quantity > 0){
      this.stampService.generateStampNumber(quantity, this.editCompanySelected.id).subscribe(res => {
        this.form.patchValue({
          startLotNumber:  res.startNumber,
          endLotNumber: res.endNumber
        });
      });
      return;
    }
  }
  downloadExcelFile(stampId: string) {
    const fullUrl = window.location.origin;
    this.stampService.getExcelFile(stampId,fullUrl).subscribe((res: any) => {
      let uri =
        'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' +
        res.data;
      let downloadLink = document.createElement('a');
      downloadLink.href = uri;
      downloadLink.download = res.fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      this.list.get();
    });
  }
}
