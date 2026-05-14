import { Component, OnInit } from '@angular/core';
import { ListService, PagedResultDto } from '@abp/ng.core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  PartnerDto,
  PartnerFilterDto,
  PartnerService,
} from '@proxy/traceverified/trace-farm/partners';
import { switchMap, tap } from 'rxjs/operators';

import { Confirmation, ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { LocationService } from '@proxy/traceverified/trace-farm/location-management';
import { ChangeDetectorRef } from '@angular/core';
const guiEmpty = '00000000-0000-0000-0000-000000000000'; // empty guid

@Component({
  selector: 'app-partner',
  templateUrl: './partner.component.html',
  styleUrls: ['./partner.component.scss'],
  providers: [ListService],
})
export class PartnerComponent implements OnInit {
  isCollapsed = true;
  filterText: string = null;
  partner = { items: [], totalCount: 0 } as PagedResultDto<PartnerDto>;
  form: FormGroup;
  isModalOpen = false;
  selectedPartner = {} as PartnerDto;
  countryData: any = {};
  provinceData: any = {};
  districtData: any = {};
  wardData: any = {};
  filterNation: string;
  filterProvince: string;
  filterDistrict: string;
  filterWard: string;
  isShowCheckSuccess: any = false;
  constructor(
    public readonly list: ListService,
    private partnerService: PartnerService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private locationService: LocationService,
    private toasterService: ToasterService,
    private cdr: ChangeDetectorRef,
  ) {
    this.filterText = null;
  }
  ngOnInit(): void {
    this.getCountryData();
    this.isShowCheckSuccess = false;
    const partnerStreamCreator = query => {
      const filterModel = {} as PartnerFilterDto;
      filterModel.filter = this.filterText;
      filterModel.sorting = query.sorting;
      filterModel.skipCount = query.skipCount;
      filterModel.maxResultCount = query.maxResultCount;
      if (this.filterNation) {
        filterModel.nationId = this.filterNation;
      }
      if (this.filterProvince) {
        filterModel.provinceId = this.filterProvince;
      }
      if (this.filterDistrict) {
        filterModel.districtId = this.filterDistrict;
      }
      if (this.filterWard) {
        filterModel.wardId = this.filterWard;
      }

      return this.partnerService.getListCustom(filterModel);
    };
    this.list.hookToQuery(partnerStreamCreator).subscribe(response => {
      this.partner = response;
    });
  }

  createPartner() {
    this.selectedPartner = {} as PartnerDto;
    this.isShowCheckSuccess = false;

    this.countryData.selected = '';
    this.provinceData.selected = '';
    this.districtData.selected = '';
    this.wardData.selected = '';
    this.buildForm();
    this.isModalOpen = true;
  }

  filter($event: any) {
    this.list.get();
  }
  buildForm() {
    this.form = this.fb.group({
      name: [this.selectedPartner.name || '', Validators.required],
      gs1Code: [this.selectedPartner.gs1Code || ''],
      email: [this.selectedPartner.email || ''],
      phoneNumber: [this.selectedPartner.phoneNumber || '', Validators.pattern('^[0-9]*$')],
      address: [this.selectedPartner.address || '', Validators.required],
      nationId: [this.selectedPartner.nationId || guiEmpty],
      provinceId: [this.selectedPartner.provinceId || guiEmpty],
      districtId: [this.selectedPartner.districtId || guiEmpty],
      wardId: [this.selectedPartner.wardId || guiEmpty],
      website: [this.selectedPartner.website || ''],
      longitude: [this.selectedPartner.longitude || null],
      latitude: [this.selectedPartner.latitude || null],
      creationTime: [this.selectedPartner.creationTime || ''],
      companyId: [this.selectedPartner.companyId || null],
    });
  }
  openModal() {
    this.buildForm();
    this.isModalOpen = true;
  }
  edit(id: string) {
    this.partnerService.get(id).subscribe(partner => {
      this.selectedPartner = partner;
      this.buildForm();
      this.isModalOpen = true;
      this.isShowCheckSuccess = true;
      this.countryData.selected = this.findItemById(
        this.countryData.data,
        this.selectedPartner.nationId,
      );
      this.getProvinceData(this.selectedPartner.nationId).subscribe(() => {
        this.provinceData.selected = this.findItemById(
          this.provinceData.data,
          this.selectedPartner.provinceId,
        );
        this.provinceData = {
          ...this.provinceData,
          selected: this.findItemById(this.provinceData.data, this.selectedPartner.provinceId),
        };
      });

      this.getDistrictData(this.selectedPartner.provinceId).subscribe(() => {
        this.districtData.selected = this.findItemById(
          this.districtData.data,
          this.selectedPartner.districtId,
        );
      });

      this.getWardData(this.selectedPartner.districtId).subscribe(() => {
        this.wardData.selected = this.findItemById(this.wardData.data, this.selectedPartner.wardId);
      });
    });
  }

  edit2(id: string) {
    this.partnerService
      .get(id)
      .pipe(
        tap(partner => {
          this.selectedPartner = partner;
          this.buildForm();
          this.isShowCheckSuccess = true;
        }),
        switchMap(() => {
          this.countryData.selected = this.findItemById(
            this.countryData.data,
            this.selectedPartner.nationId,
          );

          return this.getProvinceData(this.selectedPartner.nationId);
        }),
        switchMap(() => {
          this.provinceData.selected = this.findItemById(
            this.provinceData.data,
            this.selectedPartner.provinceId,
          );

          return this.getDistrictData(this.selectedPartner.provinceId);
        }),
        switchMap(() => {
          this.districtData.selected = this.findItemById(
            this.districtData.data,
            this.selectedPartner.districtId,
          );

          return this.getWardData(this.selectedPartner.districtId);
        }),
      )
      .subscribe(() => {
        this.wardData.selected = this.findItemById(this.wardData.data, this.selectedPartner.wardId);
        this.isModalOpen = true;
      });
  }

  findItemById(data: any[], id: string): any {
    const result = data.find(x => x.id === id);
    if (result === null || result === undefined) {
      return '';
    }
    return result;
  }
  deletePartner(id) {
    this.confirmation.warn('::AreYouSureToDelete', '::AreYouSure').subscribe(status => {
      if (status === Confirmation.Status.confirm) {
        this.partnerService.delete(id).subscribe({
          next: () => {
            this.list.get();
            this.toasterService.success('::Delete:Success');
          },
        });
      }
    });
  }

  save() {
    if (!this.form.valid) return;
    const { id } = this.selectedPartner || {};
    (id
      ? this.partnerService.update(id, {
          ...this.selectedPartner,
          ...this.form.value,
        })
      : this.partnerService.create({ ...this.form.value })
    )
      .pipe()
      .subscribe({
        next: () => {
          this.isModalOpen = false;
          this.form.reset();
          this.list.get();
          this.toasterService.success('::Success');
        },
      });
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
      }),
    );
  }

  getDistrictData(provinceId: string) {
    this.districtData.data = [];
    return this.locationService.getDistrictDropdown(provinceId).pipe(
      tap(res => {
        this.districtData.data = res.items;
      }),
    );
  }

  getWardData(districtId: string) {
    this.wardData.data = [];
    return this.locationService.getWardDropdown(districtId).pipe(
      tap(res => {
        this.wardData.data = res.items;
      }),
    );
  }

  eventCountrySelectHandle($event: any) {
    if ($event.success) {
      this.getProvinceData($event.data.id).subscribe(() => {});
      this.form.patchValue({
        nationId: $event.data.id,
      });
      this.countryData.selected = this.findItemById(this.countryData.data, $event.data.id);
    } else {
      this.form.patchValue({
        nationId: guiEmpty,
      });
      this.countryData.selected = '0';
    }
  }
  eventProvinceSelectHandle($event: any) {
    if ($event.success) {
      this.getDistrictData($event.data.id).subscribe(() => {});
      this.form.patchValue({
        provinceId: $event.data.id,
      });
      this.provinceData.selected = this.findItemById(this.provinceData.data, $event.data.id);
    } else {
      this.form.patchValue({
        provinceId: guiEmpty,
      });
      this.provinceData.selected = '0';
    }
  }

  eventDistrictSelectHandle($event: any) {
    if ($event.success) {
      this.getWardData($event.data.id).subscribe(() => {});
      this.form.patchValue({
        districtId: $event.data.id,
      });
      this.districtData.selected = this.findItemById(this.districtData.data, $event.data.id);
    } else {
      this.form.patchValue({
        districtId: guiEmpty,
      });
      this.districtData.selected = '0';
    }
  }

  eventWardSelectHandle($event: any) {
    if ($event.success) {
      this.form.patchValue({
        wardId: $event.data.id,
      });
      this.wardData.selected = this.findItemById(this.wardData.data, $event.data.id);
    } else {
      this.form.patchValue({
        wardId: guiEmpty,
      });
      this.wardData.selected = '0';
    }
  }

  eventCountryFilterSelectHandle($event: any) {
    if ($event.success) {
      this.getProvinceData($event.data.id).subscribe(() => {});
      this.filterNation = $event.data.id;
      this.list.get();
    } else {
      this.filterNation = null;
      this.list.get();
    }
  }

  eventProvinceFilterSelectHandle($event: any) {
    if ($event.success) {
      this.getDistrictData($event.data.id).subscribe(() => {});
      this.filterProvince = $event.data.id;
      this.list.get();
    } else {
      this.filterProvince = null;
      this.list.get();
    }
  }

  eventDistrictFilterSelectHandle($event: any) {
    if ($event.success) {
      this.getWardData($event.data.id).subscribe(() => {});
      this.filterDistrict = $event.data.id;
      this.list.get();
    } else {
      this.filterDistrict = null;
      this.list.get();
    }
  }

  eventWardFilterSelectHandle($event: any) {
    if ($event.success) {
      this.filterWard = $event.data.id;
      this.list.get();
    } else {
      this.filterWard = null;
      this.list.get();
    }
  }

  checkGs1Code($event: any) {
    if (this.form.value.gs1Code === '') {
      this.toasterService.error('::Partner:GS1CodeIsRequired');
      return;
    }
    this.partnerService.getCompanyInfo(this.form.value.gs1Code).subscribe(res => {
      this.selectedPartner = res;
      if (res === null) {
        this.selectedPartner = {} as PartnerDto;
        this.selectedPartner.gs1Code = this.form.value.gs1Code;
        this.countryData.selected = '';
        this.provinceData.selected = '';
        this.wardData.selected = '';
        this.districtData.selected = '';

        this.buildForm();
        this.isShowCheckSuccess = true;
        return;
      } else {
        this.selectedPartner.id = null;
        this.isShowCheckSuccess = true;
        this.buildForm();
        this.countryData.selected = this.findItemById(this.countryData.data, res.nationId);

        this.getProvinceData(res.nationId).subscribe(() => {
          this.provinceData.selected = this.findItemById(this.provinceData.data, res.provinceId);
        });

        this.getDistrictData(res.provinceId).subscribe(() => {
          this.districtData.selected = this.findItemById(this.districtData.data, res.districtId);
        });

        this.getWardData(res.districtId).subscribe(() => {
          this.wardData.selected = this.findItemById(this.wardData.data, res.wardId);
        });
      }
    });
  }

  checkGs1Code2($event: any) {
    if (this.form.value.gs1Code === '') {
      this.toasterService.error('::Partner:GS1CodeIsRequired');
      return;
    }

    this.partnerService
      .getCompanyInfo(this.form.value.gs1Code)
      .pipe(
        switchMap(res => {
          this.selectedPartner = res;
          if (res === null) {
            this.selectedPartner = {} as PartnerDto;
            this.selectedPartner.gs1Code = this.form.value.gs1Code;
            this.countryData.selected = '0';
            this.provinceData.selected = '0';
            this.wardData.selected = '0';
            this.districtData.selected = '0';
            this.buildForm();
            this.isShowCheckSuccess = true;
            return [];
          } else {
            this.selectedPartner.id = null;
            this.isShowCheckSuccess = true;
            this.buildForm();

            this.countryData.selected = this.findItemById(this.countryData.data, res.nationId);
            this.cdr.detectChanges();
            return this.getProvinceData(res.nationId);
          }
        }),
        switchMap(() => {
          this.provinceData.selected = this.findItemById(
            this.provinceData.data,
            this.selectedPartner.provinceId,
          );
          return this.getDistrictData(this.selectedPartner.provinceId);
        }),
        switchMap(() => {
          this.districtData.selected = this.findItemById(
            this.districtData.data,
            this.selectedPartner.districtId,
          );
          return this.getWardData(this.selectedPartner.districtId);
        }),
      )
      .subscribe(() => {
        this.wardData.selected = this.findItemById(this.wardData.data, this.selectedPartner.wardId);
      });
  }
}
