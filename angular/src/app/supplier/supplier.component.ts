import { ListService, PagedResultDto } from '@abp/ng.core';
import { Component, OnInit } from '@angular/core';
import {
  SupplierDto,
  SupplierFilterDto,
  SupplierService,
} from '@proxy/traceverified/trace-farm/supplier-managements';
import { LocationService } from '@proxy/traceverified/trace-farm/location-management';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Confirmation, ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { tap, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.scss'],
  providers: [ListService],
})
export class SupplierComponent implements OnInit {
  supplier = { items: [], totalCount: 0 } as PagedResultDto<SupplierDto>;
  form: FormGroup;

  countryData: any = {};
  provinceData: any = {};
  districtData: any = {};
  wardData: any = {};
  selectedSupplier = {} as SupplierDto;

  filterText: string = null;
  filterNation: string;
  filterProvince: string;
  filterDistrict: string;
  filterWard: string;

  isModalOpen = false;
  isCollapsed = true;

  constructor(
    public readonly list: ListService,
    private supplierService: SupplierService,
    private fb: FormBuilder,
    private locationService: LocationService,
    private confirmation: ConfirmationService,
    private toaster: ToasterService,
  ) {
    this.filterText = null;
  }

  ngOnInit() {
    this.getCountryData();

    const profileStreamCreator = query => {
      const filterModel = {} as SupplierFilterDto;
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

      return this.supplierService.getListCustom(filterModel);
    };
    this.list.hookToQuery(profileStreamCreator).subscribe(response => {
      this.supplier = response;
    });
  }

  createSupplier() {
    this.selectedSupplier = {} as SupplierDto;
    this.countryData.selected = {};
    this.provinceData.selected = {};
    this.districtData.selected = {};
    this.wardData.selected = {};
    this.buildForm();
    this.isModalOpen = true;
  }

  filter($event: any) {
    this.list.get();
  }

  buildForm() {
    this.form = this.fb.group({
      code: [this.selectedSupplier.code || '', Validators.required],
      name: [this.selectedSupplier.name || '', Validators.required],
      phoneNumber: [this.selectedSupplier.phoneNumber || ''],
      address: [this.selectedSupplier.address || ''],
      nationId: [this.selectedSupplier.nationId || '', Validators.required],
      provinceId: [this.selectedSupplier.provinceId || '', Validators.required],
      districtId: [this.selectedSupplier.districtId || '', Validators.required],
      wardId: [this.selectedSupplier.wardId || '', Validators.required],
    });
  }

  edit(id: string) {
    this.supplierService
      .get(id)
      .pipe(
        tap(partner => {
          this.selectedSupplier = partner;
          this.buildForm();
        }),
        switchMap(() => {
          this.countryData.selected = this.findItemById(
            this.countryData.data,
            this.selectedSupplier.nationId,
          );

          return this.getProvinceData(this.selectedSupplier.nationId);
        }),
        switchMap(() => {
          this.provinceData.selected = this.findItemById(
            this.provinceData.data,
            this.selectedSupplier.provinceId,
          );

          return this.getDistrictData(this.selectedSupplier.provinceId);
        }),
        switchMap(() => {
          this.districtData.selected = this.findItemById(
            this.districtData.data,
            this.selectedSupplier.districtId,
          );

          return this.getWardData(this.selectedSupplier.districtId);
        }),
      )
      .subscribe(() => {
        this.wardData.selected = this.findItemById(
          this.wardData.data,
          this.selectedSupplier.wardId,
        );
        this.isModalOpen = true;
      });
  }

  delete(id) {
    this.confirmation.warn('::AreYouSureToDelete', '::AreYouSure').subscribe(status => {
      if (status === Confirmation.Status.confirm) {
        this.supplierService.delete(id).subscribe(() => {
          this.list.get();
          this.toaster.success('::Delete:Success');
        });
      }
    });
  }

  save() {
    if (!this.form.valid) return;
    const { id } = this.selectedSupplier || {};

    (id
      ? this.supplierService.update(id, {
          ...this.selectedSupplier,
          ...this.form.value,
        })
      : this.supplierService.create({ ...this.form.value })
    )
      .pipe()
      .subscribe(() => {
        this.isModalOpen = false;
        this.form.reset();
        this.list.get();
        this.toaster.success('::Success');
      });
  }

  findItemById(data: any[], id: string): any {
    return data.find(item => item.id === id);
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
        nationId: null,
      });
      this.countryData.selected = null;
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
        provinceId: null,
      });
      this.provinceData.selected = null;
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
        districtId: null,
      });
      this.districtData.selected = null;
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
        wardId: null,
      });
      this.wardData.selected = null;
    }
  }

  eventCountryFilterSelectHandle($event: any) {
    if ($event.success) {
      this.getProvinceData($event.data.id).subscribe(() => {});
      this.filterNation = $event.data.id;
    } else {
      this.filterNation = null;
    }
  }

  eventProvinceFilterSelectHandle($event: any) {
    if ($event.success) {
      this.getDistrictData($event.data.id).subscribe(() => {});
      this.filterProvince = $event.data.id;
    } else {
      this.filterProvince = null;
    }
  }

  eventDistrictFilterSelectHandle($event: any) {
    if ($event.success) {
      this.getWardData($event.data.id).subscribe(() => {});
      this.filterDistrict = $event.data.id;
    } else {
      this.filterDistrict = null;
    }
  }

  eventWardFilterSelectHandle($event: any) {
    if ($event.success) {
      this.filterWard = $event.data.id;
    } else {
      this.filterWard = null;
    }
  }
}
