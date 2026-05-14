import { ProfileService } from '@abp/ng.account.core/proxy';
import { fadeIn } from '@abp/ng.theme.shared';
import { transition, trigger, useAnimation } from '@angular/animations';
import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { eAccountComponents } from '../../enums';
import { ManageProfileStateService } from '../../services';
import { CompanyComponent } from 'src/app/company/company.component';
import { SessionStateService } from '@abp/ng.core';
import { RequestEdit } from 'src/app/shared/components/company-edit-service/company-edit.service';
import { ConfigStateService } from '@abp/ng.core';
@Component({
  selector: 'app-manage-profile',
  templateUrl: './manage-profile.component.html',
  animations: [trigger('fadeIn', [transition(':enter', useAnimation(fadeIn))])],
  styles: [
    `
      .min-h-400 {
        min-height: 400px;
      }
    `,
  ],
})
export class ManageProfileComponent implements OnInit, AfterViewInit {
  selectedTab = 0;

  changePasswordKey = eAccountComponents.ChangePassword;

  personalSettingsKey = eAccountComponents.PersonalSettings;

  profile$ = this.manageProfileState.getProfile$();

  currentUser = this.config.getOne('currentUser');

  tenantId: string;
  hideChangePasswordTab?: boolean;
  @ViewChild(CompanyComponent, { static: false }) companyComponent: CompanyComponent;

  constructor(
    protected profileService: ProfileService,
    protected manageProfileState: ManageProfileStateService,
    private sessionState: SessionStateService,
    private cdr: ChangeDetectorRef,
    private requestEdit: RequestEdit,
    private config: ConfigStateService
  ) {}

  ngOnInit() {
    this.tenantId = this.sessionState.getTenant().id;
    this.profileService.get().subscribe(profile => {
      this.manageProfileState.setProfile(profile);
      if (profile.isExternal) {
        this.hideChangePasswordTab = true;
        this.selectedTab = 1;
      }
    });
  }
  ngAfterViewInit(): void {
    this.cdr.detectChanges(); // Ensure view children are updated
  }

  checkUserAdmin() {
    return this.currentUser.roles.includes('admin');
  }
}
