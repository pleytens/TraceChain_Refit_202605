import { Component, OnInit } from '@angular/core';
import { ListService, PagedResultDto } from '@abp/ng.core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  UntypedFormGroup,
  UntypedFormArray,
} from '@angular/forms';

import {
  Confirmation,
  ConfirmationService,
  ToasterService,
  eFormComponets,
} from '@abp/ng.theme.shared';
import { NgbDateNativeAdapter, NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';
import { LocationService } from '@proxy/traceverified/trace-farm/location-management';
import { StorageService } from '@proxy/traceverified/trace-farm/file-management';
import { ePermissionManagementComponents } from '@abp/ng.permission-management';
import { switchMap, tap } from 'rxjs/operators';
import { UserDto, UserFilterDto, UserService } from '../serviceCustom/test-service/user';
import { IdentityRoleDto } from '@abp/ng.identity/proxy';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-user',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  standalone: false,
  providers: [ListService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }],
})
export class UsersComponent implements OnInit {
  isCollapsed = true;

  filterText: string = null;
  fromDate: string;
  toDate: string;
  user = { items: [], totalCount: 0 } as PagedResultDto<UserDto>;
  form!: UntypedFormGroup;
  isModalOpen = false;
  passwordVisible: any;
  selectedUser = {} as UserDto;
  selectedFile: File;
  imageSrc: string | ArrayBuffer = '';
  countryData: any = {};
  provinceData: any = {};
  districtData: any = {};
  wardData: any = {};
  filterNation: string;
  filterProvince: string;
  filterDistrict: string;
  filterWard: string;
  filterRoles: string;
  roles?: IdentityRoleDto[];
  selectedUserRoles?: IdentityRoleDto[];
  visiblePermissions = false;
  permissionManagementKey = ePermissionManagementComponents.PermissionManagement;
  providerKey?: string;
  entityDisplayName: string;
  rolesData: any = {};

  inputKey = eFormComponets.FormCheckboxComponent;
  constructor(
    public readonly list: ListService,
    private userService: UserService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private locationService: LocationService,
    private toaster: ToasterService,
    private fileService: StorageService,
  ) {
    this.filterText = null;
  }
  ngOnInit(): void {
    this.getCountryData();
    this.getRolesData();
    const userStreamCreator = query => {
      const filterModel = {} as UserFilterDto;
      filterModel.filter = this.filterText;
      filterModel.sorting = query.sorting;
      filterModel.skipCount = query.skipCount;
      filterModel.maxResultCount = query.maxResultCount;
      if (this.filterNation) {
        filterModel.nationId = this.filterNation;
      }
      if (this.toDate) {
        const date = new Date(this.toDate);
        filterModel.toDate = date.toLocaleDateString();
      }

      if (this.fromDate) {
        const date = new Date(this.fromDate);
        filterModel.fromDate = date.toLocaleDateString();
      }
      return this.userService.getListCustom(filterModel);
    };

    this.list.hookToQuery(userStreamCreator).subscribe(response => {
      this.user = response;

      this.user.items.forEach(user => this.getRolesForUser(user));
    });
  }
  onVisiblePermissionChange = (event: boolean) => {
    this.visiblePermissions = event;
  };
  createUser() {
    this.selectedUser = {} as UserDto;
    this.selectedUserRoles = [] as IdentityRoleDto[];
    this.countryData.selected = {};
    this.provinceData.selected = {};
    this.districtData.selected = {};
    this.wardData.selected = {};
    this.buildForm();
    this.isModalOpen = true;
  }

  filter() {
    this.list.get();
  }

  buildForm() {
    const { id } = this.selectedUser || {};

    this.form = this.fb.group({
      name: [this.selectedUser.name || '', Validators.required],
      code: [this.selectedUser.code || ''],
      logo: [this.selectedUser.logo || null],
      email: [this.selectedUser.email || '', [Validators.required, Validators.email]],
      phoneNumber: [this.selectedUser.phoneNumber || ''],
      address: [this.selectedUser.extraProperties?.Address || ''],
      countryId: [this.selectedUser.extraProperties?.CountryId || null, Validators.required],
      districtId: [this.selectedUser.extraProperties?.DistrictId || ''],
      provinceId: [this.selectedUser.extraProperties?.ProvinceId || ''],
      wardId: [this.selectedUser.extraProperties?.WardId || ''],
      creationTime: [this.selectedUser.creationTime || ''],
      displayName: [this.selectedUser.displayName || ''],
      userName: [this.selectedUser.userName || '', Validators.required],
      extraProperties: {},
      password: [
        null,
        id
          ? [
              Validators.minLength(6),
              Validators.maxLength(30),
              Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/),
            ]
          : [
              Validators.required,
              Validators.minLength(6),
              Validators.maxLength(30),
              Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/),
            ],
      ],

      isActive: [this.selectedUser.isActive || false],
      lockoutEnabled: [this.selectedUser.lockoutEnabled || false],
    });

    this.userService.getAssignableRoles().subscribe(({ items }) => {
      this.roles = items;
      if (this.roles) {
        this.form.addControl(
          'roleNames',
          this.fb.array(
            this.roles.map(role =>
              this.fb.group({
                [role.name as string]: [
                  this.selectedUser?.id
                    ? !!this.selectedUserRoles?.find(userRole => userRole.id === role.id)
                    : role.isDefault,
                ],
              }),
            ),
          ),
        );
      }
    });
  }

  openModal() {
    this.buildForm();
    this.isModalOpen = true;
  }

  edit(id: string) {
    this.userService
      .get(id)
      .pipe(
        tap(user => (this.selectedUser = user)),
        switchMap(() => this.userService.getRoles(id)),
        switchMap(userRole => {
          this.selectedUserRoles = userRole.items || [];
          this.selectedUser.address = this.selectedUser.extraProperties.Address;
          this.selectedUser.code = this.selectedUser.extraProperties.Code;

          this.countryData.selected = this.findItemById(
            this.countryData.data,
            this.selectedUser.extraProperties.CountryId,
          );

          return this.getProvinceData(this.selectedUser.extraProperties.CountryId);
        }),
        switchMap(() => {
          this.provinceData.selected = this.findItemById(
            this.provinceData.data,
            this.selectedUser.extraProperties.ProvinceId,
          );

          return this.getDistrictData(this.selectedUser.extraProperties.ProvinceId);
        }),
        switchMap(() => {
          this.districtData.selected = this.findItemById(
            this.districtData.data,
            this.selectedUser.extraProperties.DistrictId,
          );

          return this.getWardData(this.selectedUser.extraProperties.DistrictId);
        }),
      )
      .subscribe(() => {
        this.wardData.selected = this.findItemById(
          this.wardData.data,
          this.selectedUser.extraProperties.WardId,
        );
        this.openModal();
      });
  }

  findItemById(data: any[], id: string): any {
    const foundItem = data.find(item => item.id === id);
    return foundItem !== undefined ? foundItem : '';
  }

  getSelectedRoleCount(): number {
    return this.selectedUserRoles.length;
  }

  getFormControl(roleGroup: FormGroup, roleName: string): FormControl {
    return roleGroup.get(roleName) as FormControl;
  }

  deleteUser(id) {
    this.confirmation.warn('::AreYouSureToDelete', '::AreYouSure').subscribe(status => {
      if (status === Confirmation.Status.confirm) {
        this.userService.delete(id).subscribe({
          next: () => {
            this.form.reset();
            this.list.get();
            this.toaster.success('::Delete:Success');
          },
        });
      }
    });
  }
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  save() {
    if (!this.form.valid) return;
    if (this.selectedFile) {
      const currentDate: number = new Date().getTime();

      // Convert the date to a string
      // const dateString: string = currentDate.toString();
      // this.fileInfo.name = dateString;
      // this.uploadFile(this.selectedFile, this.fileInfo);
      // const logoName = this.fileInfo.name + this.fileInfo.type;
      // if (logoName) {
      //   this.form.value.logo = logoName;
      // }
    } else {
      console.error('No file selected');
    }

    const { roleNames = [] } = this.form.value;
    const mappedRoleNames =
      roleNames
        .filter((role: { [key: string]: any }) => !!role[Object.keys(role)[0]])
        .map((role: { [key: string]: any }) => Object.keys(role)[0]) || [];

    const { id } = this.selectedUser || {};
    this.form.value.extraProperties = {
      WardId: this.form.value.wardId,
      ProvinceId: this.form.value.provinceId,
      DistrictId: this.form.value.districtId,
      CountryId: this.form.value.countryId,
      Address: this.form.value.address,
      Code: this.form.value.code,
    };
    const updateOrCreateObservable = this.selectedUser?.id
      ? this.userService.update(this.selectedUser.id, {
          ...this.selectedUser,
          ...this.form.value,
          roleNames: mappedRoleNames,
        })
      : this.userService.create({ ...this.form.value, roleNames: mappedRoleNames });

    updateOrCreateObservable.pipe().subscribe({
      next: () => {
        this.isModalOpen = false;
        this.form.reset();
        this.list.get();
        this.toaster.success('::Success');
      },
    });
  }

  onFileChange(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      // this.fileInfo = {
      //   name: this.selectedFile.name,
      //   size: this.selectedFile.size,
      //   type: this.selectedFile.type,
      //   file: null,
      // };

      // Read the selected file as a data URL
      const reader = new FileReader();
      reader.onload = e => {
        this.imageSrc = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      // this.fileInfo = {} as FileInfoDto;
      this.imageSrc = '';
    }
  }

  uploadFile(file: File): void {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    // fileInfo.file = formData;
    this.fileService.uploadFileByFile(formData).subscribe(res => {
      this.form.value.logo = res;
    });
  }
  filterDateChange() {
    this.list.get();
  }

  getCountryData() {
    this.countryData.data = [];
    this.locationService.getCountryDropdown().subscribe(res => {
      this.countryData.data = res.items;
    });
  }

  getProvinceData(countryId: string) {
    if (countryId) {
      this.provinceData.data = [];
      return this.locationService.getProvinceDropdown(countryId).pipe(
        tap(res => {
          this.provinceData.data = res.items;
        }),
      );
    }
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
        countryId: $event.data.id,
      });
      this.countryData.selected = this.findItemById(this.countryData.data, $event.data.id);
    } else {
      this.form.patchValue({
        countryId: null,
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

  get roleGroups(): UntypedFormGroup[] {
    return ((this.form.get('roleNames') as UntypedFormArray)?.controls as UntypedFormGroup[]) || [];
  }
  openPermissionsModal(providerKey: string, entityDisplayName?: string) {
    this.providerKey = providerKey;
    this.entityDisplayName = entityDisplayName;
    setTimeout(() => {
      this.visiblePermissions = true;
    }, 0);
  }

  // Add this method to your component class
  getRolesForUser(user: UserDto): void {
    if (user?.id) {
      this.userService.getRoles(user.id).subscribe(roles => {
        user.roleNames = roles.items.map(roles => roles.name);
      });
    }
  }

  getRolesData(): void {
    this.rolesData.data = [];
    this.userService.getAssignableRoles().subscribe(roles => {
      this.rolesData.data = roles.items;
    });
  }

  eventRolesFilterSelectHandle($event: any) {
    if ($event.success) {
      this.filterRoles = $event.data.id;
    }
  }
}
