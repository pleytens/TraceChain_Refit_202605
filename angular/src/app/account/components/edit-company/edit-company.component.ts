import { Component, Input, OnInit } from '@angular/core';
import { AuthService, ListService, PagedResultDto } from '@abp/ng.core';
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyDto, CompanyFilterDto, CompanyService } from '@proxy/traceverified/trace-farm/companies';
import { Confirmation, ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { StorageService } from '@proxy/traceverified/trace-farm/file-management';
import { LocationService } from '@proxy/traceverified/trace-farm/location-management';
import { tap } from 'rxjs/operators';
import { SessionStateService } from '@abp/ng.core';
@Component({
  selector: 'app-edit-company',
  templateUrl: './edit-company.component.html',
  providers: [ListService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }],
  styleUrls: ['./edit-company.component.scss'],

})
export class EditCompanyComponent implements OnInit {
tenantId: any;
  form: FormGroup;
  selectedFile: File;
  imageSrc: string | ArrayBuffer = '';
  countryData: any = {};
  provinceData: any = {};
  districtData: any = {};
  wardData: any = {};
  selectedCompany = {} as CompanyDto;

  constructor(
    public readonly list: ListService,
    private companyService: CompanyService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private authService: AuthService,
    private fileService: StorageService,
    private locationService: LocationService,
    private toasterService: ToasterService,
    private sessionService : SessionStateService
  ) {
  }

  ngOnInit(): void {
    this.getCountryData();
    this.buildForm();

    this.editCompany2()
  }

  buildForm() {
    this.form = this.fb.group({
        name: [this.selectedCompany.name || '', Validators.required],
        gS1Code: [this.selectedCompany.gS1Code || null, Validators.required],
        logo: [this.selectedCompany.logo || null],
        emailAddress: [
          this.selectedCompany.emailAddress || null,
          [Validators.required, Validators.email],
        ],
        phoneNumber: [this.selectedCompany.phoneNumber || null, Validators.required],
        address: [this.selectedCompany.address || null],
        nationId: [this.selectedCompany.nationId || null],
        provinceId: [this.selectedCompany.provinceId || null],
        districtId: [this.selectedCompany.districtId || null],
        wardId: [this.selectedCompany.wardId || null],
        websiteUrl: [this.selectedCompany.websiteUrl || null],
        longitude: [this.selectedCompany.longitude || null],
        latitude: [this.selectedCompany.latitude || null],
        tenantName: [this.selectedCompany.tenantName || null, Validators.required],
        adminEmailAddress: [
          this.selectedCompany.adminEmailAddress || null,
          [Validators.required, Validators.email],
        ],
        tenantId: [this.selectedCompany.tenantId || null],
        adminPassword: [
          this.selectedCompany.adminPassword || null,
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(30),
            // Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})/),
          ],
        ],
      });
  }

  editCompany2() {
    this.tenantId = this.sessionService.getTenant().id
    this.companyService.getByTenant(this.tenantId).subscribe(company => {
      this.selectedCompany = company;
      this.selectedCompany.adminEmailAddress = 'NOCHANGE@gmail2.com';
      this.selectedCompany.adminPassword = 'NOCHANGE231qwe@#';
      this.buildForm();

      if (!company.imageUrl){
        this.imageSrc = 'https://marouapi.traceverified.com/Temp/FarmSeason/public/default.jpg';
      }else{
        this.imageSrc = company.imageUrl;
      }
      this.countryData.selected = this.findItemById(this.countryData.data, company.nationId);
      this.getProvinceData(company.nationId).subscribe(() => {
        this.provinceData.selected = this.findItemById(this.provinceData.data, company.provinceId);
      });

      this.getDistrictData(company.provinceId).subscribe(() => {
        this.districtData.selected = this.findItemById(this.districtData.data, company.districtId);
      });

      this.getWardData(company.districtId).subscribe(() => {
        this.wardData.selected = this.findItemById(this.wardData.data, company.wardId);
      });
    });
  }
  findItemById(data: any[], id: string): any {
    return data.find(item => item.id === id);
  }

  save() {
    if (this.countryData.selected){
      this.form.value.countryId = this.countryData.selected.id;
    }else{
      this.toasterService.error("Please select country");
      return;
    }

    if (this.provinceData.selected){
      this.form.value.provinceId = this.provinceData.selected.id;
    }else{
      this.toasterService.error("Please select province");
      return;
    }

    if (this.districtData.selected){
      this.form.value.districtId = this.districtData.selected.id;
    }else{
      this.toasterService.error("Please select district");
      return;
    }

    if (this.wardData.selected){
      this.form.value.wardId = this.wardData.selected.id;
    }else{
      this.toasterService.error("Please select ward");
      return;
    }

    if (this.form.invalid) {
      return;
    }

    if (this.selectedFile) {
      const currentDate: number = new Date().getTime();
      // Convert the date to a string
      const fileName = currentDate.toString();
      const fileType =  this.selectedFile.name.split('.').pop();
      const logoName = fileName+'.'+fileType;

      this.uploadFile(this.selectedFile, logoName);
      if (logoName) {
        this.form.value.logo = logoName;
      }
    } else {
      console.error('No file selected');
    }

    if (!this.selectedCompany.id){
      this.selectedCompany.tenantId='0dbd0a09-3e98-42d9-a215-f2a9e854e55e';
    }
    const request = this.companyService.updateByAdmin(this.selectedCompany.id, this.form.value)

    request.subscribe(() => {
      this.toasterService.success("::Success")
    });
  }


  onFileChange(event: any): void {
    this.selectedFile = event.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (this.selectedFile) {
      // Check if the file's MIME type is in the allowedTypes array
      if (!allowedTypes.includes(this.selectedFile.type)) {
        this.toasterService.error('Invalid file type '+this.selectedFile.type);
      } else {
        // Read the selected file as a data URL
        const reader = new FileReader();
        reader.onload = e => {
          this.imageSrc = e.target.result;
        };
        reader.readAsDataURL(this.selectedFile);
      }
    } else {
      this.imageSrc = '';
    }
  }

  uploadFile(file: File, fileName:string): void {
    const formData: FormData = new FormData();
    formData.append('file', file, fileName);
    this.fileService.uploadFileByFile(formData).subscribe(res => {
      this.form.value.logo = res;
    });
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getCountryData() {
    this.countryData.data = [];
    this.locationService.getCountryDropdown().subscribe(res => {
      this.countryData.data = res.items;
    });
  }

  getProvinceData(countryId: string) {
    this.provinceData.data = [];
    return this.locationService.getProvinceDropdown(countryId).pipe(
      tap(res => {
        this.provinceData.data = res.items;
      })
    );
  }

  getDistrictData(provinceId: string) {
    this.districtData.data = [];
    return this.locationService.getDistrictDropdown(provinceId).pipe(
      tap(res => {
        this.districtData.data = res.items;
      })
    );
  }

  getWardData(districtId: string) {
    this.wardData.data = [];
    return this.locationService.getWardDropdown(districtId).pipe(
      tap(res => {
        this.wardData.data = res.items;
      })
    );
  }
  eventCountrySelectHandle($event: any) {
    if ($event.success){
      this.getProvinceData($event.data.id);
      this.countryData.selected = $event.data;
      this.form.value.nationId = $event.data.id;
      this.getProvinceData($event.data.id).subscribe(() => {});
      this.form.patchValue({
        nationId: $event.data.id,
      });
    }
  }

  eventProvinceSelectHandle($event: any) {
    if ($event.success){
      this.getDistrictData($event.data.id);
      this.provinceData.selected = $event.data;
      this.form.value.provinceId = $event.data.id;
      this.getDistrictData($event.data.id).subscribe(() => {});
      this.form.patchValue({
        provinceId: $event.data.id,
      });
    }
  }

  eventDistrictSelectHandle($event: any) {
    if ($event.success){
      this.getWardData($event.data.id);
      this.districtData.selected = $event.data;
      this.form.value.districtId = $event.data.id;
      this.getWardData($event.data.id).subscribe(() => {});
      this.form.patchValue({
        districtId: $event.data.id,
      });
    }
  }

  eventWardSelectHandle($event: any) {
    if ($event.success){
      this.wardData.selected = $event.data;
      this.form.value.wardId = $event.data.id;
      this.form.patchValue({
        wardId: $event.data.id,
      });
    }
  }
}
