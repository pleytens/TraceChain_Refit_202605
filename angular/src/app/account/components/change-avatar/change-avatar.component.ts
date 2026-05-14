import { Component, Inject, Injector, OnInit } from '@angular/core';
import { ProfileDto, ProfileService } from '@abp/ng.account.core/proxy';
import { Confirmation, ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { finalize, filter } from 'rxjs/operators';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Account } from '../../models/account';
import { ManageProfileStateService } from '../../services/manage-profile.state.service';
import { AuthService } from '@abp/ng.core';
import { RE_LOGIN_CONFIRMATION_TOKEN } from '../../tokens';
import { EXTENSIONS_IDENTIFIER } from '@abp/ng.theme.shared/extensions';
import { eAccountComponents } from '../../enums';
import { StorageService } from '@proxy/traceverified/trace-farm/file-management';
import { SessionStateService } from '@abp/ng.core';
import { UserCustomService, UserCreateDto } from '@proxy/traceverified/trace-farm/account-managements';
import { ConfigStateService } from '@abp/ng.core';

@Component({
  selector: 'app-change-avatar',
  templateUrl: './change-avatar.component.html',
  styleUrls: ['./change-avatar.component.scss'],
  providers: [
    {
      provide: EXTENSIONS_IDENTIFIER,
      useValue: eAccountComponents.PersonalSettings,
    },
  ],
})
export class ChangeAvatarComponent
  implements
    OnInit,
    Account.PersonalSettingsComponentInputs,
    Account.PersonalSettingsComponentOutputs
{
  selected?: UserCreateDto;

  form!: UntypedFormGroup;

  inProgress?: boolean;
  selectedFiles: File;
  avatarImages: any;
  currentUser = this.config.getOne('currentUser');

  constructor(
    private fb: UntypedFormBuilder,
    private toasterService: ToasterService,
    private readonly authService: AuthService,
    private confirmationService: ConfirmationService,
    private sessionState: SessionStateService,
    private fileService: StorageService,
    @Inject(RE_LOGIN_CONFIRMATION_TOKEN)
    private isPersonalSettingsChangedConfirmationActive: boolean,
    protected injector: Injector,
    private userService: UserCustomService,
    private config: ConfigStateService,

  ) {}
  buildForm() {
   this.userService.getUserAvatarByUserId(this.currentUser.id).subscribe(res => {
    this.avatarImages = res;
  });

    this.form = this.fb.group({
      profileImageUrl: null
    });
  }
  ngOnInit(): void {
    this.buildForm();
  }
  submit() {
    if (this.form.invalid || !this.selectedFiles) return;

    if (this.selectedFiles) {
      const currentDate: number = new Date().getTime();
      const fileName = currentDate.toString();
      const fileType = this.selectedFiles[0].name.split('.').pop();
      const avatarImageName = fileName + '.' + fileType;
      this.uploadFile(this.selectedFiles[0], avatarImageName);
      this.form.value.profileImageUrl = avatarImageName;
      // Do not append the file type here
    } else {
      console.error('No file selected');
    }

    this.userService
      .updateAvatar(this.currentUser.id,this.form.value.profileImageUrl).subscribe(res => {
        this.toasterService.success("::Success")
      })

  }

  logoutConfirmation = () => {
    this.authService.logout().subscribe();
  };

  private isLogoutConfirmMessageActive() {
    return this.isPersonalSettingsChangedConfirmationActive;
  }

  private showLogoutConfirmMessage() {
    this.confirmationService
      .info(
        'AbpAccount::PersonalSettingsChangedConfirmationModalDescription',
        'AbpAccount::PersonalSettingsChangedConfirmationModalTitle'
      )
      .pipe(filter(status => status === Confirmation.Status.confirm))
      .subscribe(this.logoutConfirmation);
  }

  onFileChange(event: any): void {
    this.selectedFiles = event.target.files;
    if (event.target.files.length > 1) {
      this.toasterService.error('::MaxFileUpload', '::MaxFileUpload');
      return;
    }
    if (event.target.files.length > 0) {
      for (const item of event.target.files) {
        const reader = new FileReader();
        reader.onload = e => {
          this.avatarImages = e.target.result;
        };
        reader.readAsDataURL(item);
      }
    }
  }
  uploadFile(file: File, fileName: string): void {
    const formData: FormData = new FormData();
    formData.append('file', file, fileName);
    this.fileService.uploadFileByFile(formData).subscribe(res => {
      this.form.value.profileImageUrl = res;
    });
  }
  deleteImage() {
    this.avatarImages = null;
  }
}
