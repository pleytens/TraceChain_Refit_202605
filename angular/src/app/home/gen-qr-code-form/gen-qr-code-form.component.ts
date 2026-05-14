import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChartModule } from '@abp/ng.components/chart.js';
import { ConfigStateService, CoreModule } from '@abp/ng.core';
import { TypeheadFocusComponent } from '../../shared/components/typehead-focus/app-typehead-focus';
import {
  NgbNav,
  NgbNavContent,
  NgbNavItem,
  NgbNavItemRole,
  NgbNavLink,
  NgbNavLinkBase,
  NgbNavOutlet,
} from '@ng-bootstrap/ng-bootstrap';
import { NgxValidateCoreModule, VALIDATION_BLUEPRINTS } from '@ngx-validate/core';
import { QuillEditorComponent } from 'ngx-quill';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Quill from 'quill';
import {
  BaseThemeSharedModule,
  DEFAULT_VALIDATION_BLUEPRINTS,
  ToasterService,
} from '@abp/ng.theme.shared';
import {
  GenerateQrCodeDto,
  GenerateQrCodeService,
} from '@proxy/traceverified/trace-farm/generate-qrcode-management';
import { tap } from 'rxjs/operators';
import { LocationService } from '@proxy/traceverified/trace-farm/location-management';
import { ProductCategoryService } from '@proxy/traceverified/trace-farm/product-categories';
import { StorageService } from '@proxy/traceverified/trace-farm/file-management';
import { TypeheadFocusCustomerComponent } from '../../shared/components/typehead-focus-customer/app-typehead-focus';
import QRCode from 'easyqrcodejs';
import { RelatedEntityType } from '../../shared/common/constant.variable.model';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationTokenService } from '@proxy/traceverified/trace-farm/controllers';
import { v4 as uuidv4 } from 'uuid';
import { DomSanitizer } from '@angular/platform-browser';
import BlotFormatter from '@enzedonline/quill-blot-formatter2';

const guiEmpty = '00000000-0000-0000-0000-000000000000'; // empty guid
Quill.register('modules/blotFormatter2', BlotFormatter);

@Component({
  selector: 'app-gen-qr-code-form',
  templateUrl: './gen-qr-code-form.component.html',
  standalone: true,
  providers: [
    {
      provide: VALIDATION_BLUEPRINTS,
      useValue: {
        ...DEFAULT_VALIDATION_BLUEPRINTS,
        unique: '::AlreadyExists',
      },
    },
  ],
  imports: [
    ChartModule,
    CoreModule,
    TypeheadFocusComponent,
    NgbNav,
    NgbNavContent,
    NgbNavItem,
    NgbNavItemRole,
    NgbNavLink,
    NgbNavLinkBase,
    NgxValidateCoreModule,
    QuillEditorComponent,
    NgbNavOutlet,
    BaseThemeSharedModule,
    TypeheadFocusCustomerComponent,
    NgxDropzoneModule,
  ],
  styleUrls: ['./gen-qr-code-form.component.scss'],
})
export class GenQrCodeFormComponent implements OnInit, AfterViewInit {
  @ViewChild('qrCode', { static: false }) qrCode!: ElementRef;
  @ViewChild(QuillEditorComponent) quillEditor: QuillEditorComponent;

  form: FormGroup;
  images: any = [];
  categoryData: any = {};
  companyCertificateImages: any = [];
  selectedCompanyCertificateFiles: any = [File];
  imageCompanyLogoSrc: string | ArrayBuffer = '';
  selectedCompanyLogoFiles: File;
  productCertificateImages: any = [];
  selectedProductCertificateFiles: any = [File];
  productImages: any = [];
  selectedProductImages: any = [File];
  gtinCode: string;
  modules: {};
  enterPressedInQuill = false;
  selectedProduct = {} as GenerateQrCodeDto;
  marketData: any = {};
  countryData: any = {};
  provinceData: any = {};
  districtData: any = {};
  wardData: any = {};
  isCompanyDisabled = true;
  formDisable = true;
  updateToken: string = '';
  updateEmailToken: string = '';
  productId: string;
  confirmStatus: string;
  safeProductContent: any;
  safeCompanyContent: any;
  isLoading = false;
  constructor(
    private generateQrCodeService: GenerateQrCodeService,
    private locationService: LocationService,
    private productCategoryService: ProductCategoryService,
    private toasterService: ToasterService,
    private fileService: StorageService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private confirmationTokenService: ConfirmationTokenService,
    private sanitizer: DomSanitizer,
    private config: ConfigStateService,
  ) {
    this.editerBuild();
  }

  editerBuild() {
    this.modules = {
      blotFormatter: {
        blotFormatter2: {
          align: {
            allowAligning: true,
          },
          resize: {
            allowResizing: true,
          },
          delete: {
            allowKeyboardDelete: true,
          },
          image: {
            allowAltTitleEdit: true,
            allowCompressor: true,
          },
        },
      },
    };
  }

  uploadEditorFile(file: File, fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const formData: FormData = new FormData();
      formData.append('file', file, fileName);

      this.fileService.uploadFileByFile(formData).subscribe({
        next: res => {
          resolve(res);
        },
        error: err => {
          console.error('Upload error:', err);
          reject(err);
        },
      });
    });
  }

  ngOnInit(): void {
    this.getQueryParams();
    this.getCountryData();
    this.getCategoryData();
    this.clearForm();
  }

  ngAfterViewInit() {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const url = `${protocol}//${hostname}/gen-qr-code-free`;
    this.genQrcode(url);
  }

  buildForm() {
    this.clearLocation();
    this.form = this.fb.group({
      companyLogo: [this.selectedProduct.companyLogo || ''],
      companyCertificationImages: [this.selectedProduct.companyCertificationImages || ''],
      gS1Code: [this.selectedProduct.gS1Code || '', Validators.required],
      name: [this.selectedProduct.name || '', Validators.required],
      emailAddress: [
        this.selectedProduct.emailAddress || '',
        [Validators.email, Validators.required],
      ],
      phoneNumber: [
        this.selectedProduct.phoneNumber || '',
        [Validators.required, Validators.pattern(/(84|0[0-9])+([0-9]{8})\b/)],
      ],
      address: [this.selectedProduct.address || ''],
      nationId: [this.selectedProduct.nationId || '', Validators.required],
      provinceId: [this.selectedProduct.provinceId || '', Validators.required],
      districtId: [this.selectedProduct.districtId || '', Validators.required],
      wardId: [this.selectedProduct.wardId || '', Validators.required],
      websiteUrl: [this.selectedProduct.websiteUrl || ''],
      tenantId: [this.selectedProduct.tenantId || guiEmpty],
      companyDescription: [this.selectedProduct.companyDescription || ''],
      productName: [this.selectedProduct.productName || '', Validators.required],
      productCategoryId: [this.selectedProduct.productCategoryId || ''],
      productGTINCode: [this.selectedProduct.productGTINCode || '', Validators.required],
      productDescription: [this.selectedProduct.productDescription || ''],
      productImages: [this.selectedProduct.productImages || ''],
      productCertificationImages: [this.selectedProduct.productCertificationImages || ''],
    });
  }

  clearLocation() {
    this.provinceData.data = [];
    this.districtData.data = [];
    this.wardData.data = [];
    this.provinceData.selected = {};
    this.districtData.selected = {};
    this.wardData.selected = {};
    this.countryData.selected = {};
  }

  clearForm() {
    this.imageCompanyLogoSrc = '';
    this.productCertificateImages = [];
    this.selectedCompanyLogoFiles = null;
    this.companyCertificateImages = [];
    this.selectedCompanyCertificateFiles = [];
    this.selectedProductCertificateFiles = [];
    this.selectedProductImages = [];
    this.productImages = [];
    this.selectedProduct = {} as GenerateQrCodeDto;
    this.marketData.selected = '';
    this.categoryData.selected = {};
    this.buildForm();
    this.form.valueChanges.subscribe(() => {});
  }

  getQueryParams() {
    this.route.params.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.confirmationTokenService.confirmTokenByToken(token).subscribe({
          next: () => {
            this.confirmStatus = '::QRCode:CreateSuccess';
          },
          error: response => {
            const message = response.error.message.name;

            if (message === 'TokenAlreadyUsed') {
              this.confirmStatus = '::QRCode:EmailAlreadyConfirm';
            } else if (message === 'TokenExpired') {
              this.confirmStatus = '::QRCode:ExpiredTime';
            } else {
              this.confirmStatus = '::QRCode:UnexpectedError';
            }
          },
        });
        this.generateQrCodeService.getQrCodeInformationByToken(token).subscribe({
          next: qrCodeData => {
            if (qrCodeData) {
              this.selectedProduct = qrCodeData;
              this.productId = qrCodeData.productId;
              this.buildForm();
              this.categoryData.selected = this.findItemById(
                this.categoryData.data,
                qrCodeData.productCategoryId,
              );

              this.countryData.selected = this.findItemById(
                this.countryData.data,
                qrCodeData.nationId,
              );

              this.getProvinceData(qrCodeData.nationId).subscribe(() => {
                this.provinceData.selected = this.findItemById(
                  this.provinceData.data,
                  qrCodeData.provinceId,
                );
              });

              this.getDistrictData(qrCodeData.provinceId).subscribe(() => {
                this.districtData.selected = this.findItemById(
                  this.districtData.data,
                  qrCodeData.districtId,
                );
              });

              this.getWardData(qrCodeData.districtId).subscribe(() => {
                this.wardData.selected = this.findItemById(this.wardData.data, qrCodeData.wardId);
              });
              this.imageCompanyLogoSrc = qrCodeData.companyLogo;

              this.fileService
                .getListImageBase64(
                  RelatedEntityType.CompanyProfileCertification,
                  qrCodeData.companyProfileId,
                )
                .subscribe(imageUrl => {
                  this.companyCertificateImages = imageUrl;
                });

              this.fileService
                .getListImageBase64(RelatedEntityType.Product, qrCodeData.productId)
                .subscribe(imageUrl => {
                  this.productImages = imageUrl;
                });
              this.fileService
                .getListImageBase64(RelatedEntityType.ProductCertification, qrCodeData.productId)
                .subscribe(imageUrl => {
                  this.productCertificateImages = imageUrl;
                });
              this.safeProductContent = this.sanitizer.bypassSecurityTrustHtml(
                qrCodeData.productDescription,
              );
              this.safeCompanyContent = this.sanitizer.bypassSecurityTrustHtml(
                qrCodeData.companyDescription,
              );
              this.updateToken = token;
              const protocol = window.location.protocol;
              const hostname = window.location.hostname;
              const url = `${protocol}//${hostname}/p?d=${qrCodeData.productGTINCode}&QrType=2`;
              this.genQrcode(url);
            }
          },
          error: () => {
            this.router.navigate(['/gen-qr-code-free']);
          },
        });
      }
    });
  }

  generateUniqueFileName(prefix: string, fileType: string): string {
    const uniqueId = uuidv4().replace(/-/g, '');
    return `${uniqueId}.${fileType}`;
  }

  async uploadImagesFromQuillContent(content: string): Promise<string> {
    const div = document.createElement('div');
    div.innerHTML = content;

    const images = div.querySelectorAll('img');
    const uploadPromises = [];
    images.forEach((img: HTMLImageElement) => {
      if (img.src.startsWith('data:image')) {
        const file = this.dataURLToFile(img.src, 'image.png');
        const fileType = file.name.split('.').pop();
        const imageName = this.generateUniqueFileName('', fileType);
        const uploadPromise = this.uploadEditorFile(file, imageName)
          .then(async () => {
            img.src = await this.fileService.getFileUrlByFileName(imageName).toPromise();
          })
          .catch(error => {
            console.error('Error uploading image:', error);
          });
        uploadPromises.push(uploadPromise);
      }
    });

    await Promise.all(uploadPromises);

    return div.innerHTML;
  }

  dataURLToFile(dataUrl: string, fileName: string): File {
    const [metadata, base64Data] = dataUrl.split(',');
    const mime = metadata.match(/:(.*?);/)[1];
    const binaryString = window.atob(base64Data);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new File([bytes], fileName, { type: mime });
  }

  async uploadImagesFromQuillContent2(content: string): Promise<string> {
    const div = document.createElement('div');
    div.innerHTML = content;

    const images = Array.from(div.querySelectorAll('img')); // Convert NodeList to an array
    const uploadPromises: Promise<void>[] = [];

    for (const img of images) {
      if (img.src.startsWith('data:image')) {
        try {
          const resizedFile = await this.dataURLToFileWithAspectResize(
            img.src,
            'image.png',
            800,
            800,
          );

          const fileType = resizedFile.name.split('.').pop();
          const imageName = this.generateUniqueFileName('', fileType);

          const uploadPromise = this.uploadEditorFile(resizedFile, imageName)
            .then(async () => {
              const uploadedUrl = await this.fileService
                .getFileUrlByFileName(imageName)
                .toPromise();
              img.src = uploadedUrl;
            })
            .catch(error => {
              console.error('Error uploading image:', error);
            });

          uploadPromises.push(uploadPromise);
        } catch (error) {
          console.error('Error resizing image:', error);
        }
      }
    }

    await Promise.all(uploadPromises);

    return div.innerHTML;
  }

  async dataURLToFileWithAspectResize(
    dataUrl: string,
    fileName: string,
    maxWidth: number,
    maxHeight: number,
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;

          if (width / maxWidth > height / maxHeight) {
            width = maxWidth;
            height = maxWidth / aspectRatio;
          } else {
            height = maxHeight;
            width = maxHeight * aspectRatio;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to get canvas context'));
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          blob => {
            if (blob) {
              const file = new File([blob], fileName, { type: blob.type });
              resolve(file);
            } else {
              reject(new Error('Failed to create Blob from canvas'));
            }
          },
          'image/jpeg',
          0.7,
        );
      };

      img.onerror = err => reject(err);
      img.src = dataUrl;
    });
  }

  async save() {
    if (this.enterPressedInQuill) {
      this.enterPressedInQuill = false;
      return;
    }

    this.isLoading = true;

    const updatedFormValues: any = {
      companyCertificationImages: [],
      productCertificationImages: [],
      productImages: [],
    };

    // Company Logo
    if (this.selectedCompanyLogoFiles) {
      const currentDate: number = new Date().getTime();
      const fileName = currentDate.toString();
      const fileType = this.selectedCompanyLogoFiles.name.split('.').pop();
      const imageName = this.generateUniqueFileName(fileName, fileType);
      await this.uploadFile(this.selectedCompanyLogoFiles, imageName);
      updatedFormValues.companyLogo = imageName;
    }

    // Company Certificate Images
    if (this.selectedCompanyCertificateFiles && this.selectedCompanyCertificateFiles.length > 0) {
      for (const imageFile of this.selectedCompanyCertificateFiles) {
        const currentDate: number = new Date().getTime();
        const fileName = currentDate.toString();
        const fileType = imageFile[0].name.split('.').pop();
        const certificationImageName = this.generateUniqueFileName(fileName, fileType);
        await this.uploadFile(imageFile[0], certificationImageName);
        updatedFormValues.companyCertificationImages.push(certificationImageName);
      }
    }

    // Product Images
    if (this.selectedProductImages && this.selectedProductImages.length > 0) {
      for (const imageFile of this.selectedProductImages) {
        const currentDate: number = new Date().getTime();
        const fileName = currentDate.toString();
        const fileType = imageFile[0].name.split('.').pop();
        const productImage = this.generateUniqueFileName(fileName, fileType);
        await this.uploadFile(imageFile[0], productImage);
        updatedFormValues.productImages.push(productImage);
      }
    }

    // Product Certificate Images
    if (this.selectedProductCertificateFiles && this.selectedProductCertificateFiles.length > 0) {
      for (const imageFile of this.selectedProductCertificateFiles) {
        const currentDate: number = new Date().getTime();
        const fileName = currentDate.toString();
        const fileType = imageFile[0].name.split('.').pop();
        const certificationImageName = this.generateUniqueFileName(fileName, fileType);
        await this.uploadFile(imageFile[0], certificationImageName);
        updatedFormValues.productCertificationImages.push(certificationImageName);
      }
    }

    // Handle Quill content
    const updatedCompanyDescription = await this.uploadImagesFromQuillContent2(
      this.form.value.companyDescription,
    );
    const updatedProductDescription = await this.uploadImagesFromQuillContent2(
      this.form.value.productDescription,
    );

    // Update the reactive form
    this.form.patchValue({
      ...updatedFormValues,
      companyDescription: updatedCompanyDescription,
      productDescription: updatedProductDescription,
    });
    this.generateQrCodeService.createQrCode(this.form.value).subscribe({
      next: res => {
        this.isCompanyDisabled = true;
        this.toasterService.success('::QRCode:CreateSuccess');
        this.updateEmailToken = res.updateToken;
        this.productId = res.productId;
        if (this.qrCode) {
          this.qrCode.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  updateEmail() {
    if (this.updateEmailToken) {
      const updateModel = {
        gS1Code: this.form.get('gS1Code').value,
        updateToken: this.updateEmailToken,
        emailAddress: this.form.get('emailAddress').value,
        productId: this.productId,
      };
      this.generateQrCodeService.updateCompanyEmailByInput(updateModel).subscribe({
        complete: () => {
          this.toasterService.success('::QRCode:UpdateEmailSuccess');
        },
      });
    } else {
      this.toasterService.error('::QRCode:UpdateEmailFailure');
    }
  }

  onMultiFileChange(event: any, sourceType: number): void {
    const selectedFiles = event.target.files;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    let lengthCheck = 0;
    if (sourceType === 1) {
      lengthCheck = this.companyCertificateImages.length;
    } else if (sourceType === 2) {
      lengthCheck = this.productCertificateImages.length;
    } else if (sourceType === 3) {
      lengthCheck = this.productImages.length;
    }

    if (selectedFiles && selectedFiles.length > 0) {
      if (selectedFiles.length > 3 || lengthCheck + selectedFiles.length > 3) {
        this.toasterService.error('::QRCode:UploadLimit3');
        return;
      }

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        if (!allowedTypes.includes(file.type)) {
          this.toasterService.error('::QRCode:InvalidFileType ' + file.type);
          continue;
        }

        const reader = new FileReader();
        reader.onload = e => {
          if (sourceType === 1) {
            this.companyCertificateImages.push(e.target.result);
          } else if (sourceType === 2) {
            this.productCertificateImages.push(e.target.result);
          } else if (sourceType === 3) {
            this.productImages.push(e.target.result);
          }
        };
        reader.readAsDataURL(file);
      }

      const input = event.target as HTMLInputElement;
      const filesArray = Array.from(input.files); // Convert FileList to an array
      if (sourceType === 1) {
        this.selectedCompanyCertificateFiles.push(filesArray);
      } else if (sourceType === 2) {
        this.selectedProductCertificateFiles.push(filesArray);
      } else if (sourceType === 3) {
        this.selectedProductImages.push(filesArray);
      }
    } else {
      if (sourceType === 1) {
        this.companyCertificateImages = [];
        this.selectedCompanyCertificateFiles = [];
      } else if (sourceType === 2) {
        this.productCertificateImages = [];
        this.selectedProductCertificateFiles = [];
      } else if (sourceType === 3) {
        this.productImages = [];
        this.selectedProductImages = [];
      }
    }
  }

  deleteImage(i: number, sourceType: number): void {
    if (sourceType === 1) {
      this.companyCertificateImages.splice(i, 1);
      this.selectedCompanyCertificateFiles.splice(i, 1);
    } else if (sourceType === 2) {
      this.productCertificateImages.splice(i, 1);
      this.selectedProductCertificateFiles.splice(i, 1);
    } else if (sourceType === 3) {
      this.productImages.splice(i, 1);
      this.selectedProductImages.splice(i, 1);
    }
  }
  yourFunc(event: any): void {
    if (event.key === 'Enter') {
      this.enterPressedInQuill = true;
      event.preventDefault();

      event.stopPropagation();
    }
  }

  onImageChange(event: any, imageSrcType: number): void {
    this.selectedCompanyLogoFiles = event.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (this.selectedCompanyLogoFiles) {
      // Check if the file's MIME type is in the allowedTypes array
      if (!allowedTypes.includes(this.selectedCompanyLogoFiles.type)) {
        this.toasterService.error('::QRCode:InvalidFileType ' + this.selectedCompanyLogoFiles.type);
      } else {
        // Read the selected file as a data URL
        const reader = new FileReader();
        reader.onload = e => {
          if (imageSrcType === 1) {
            this.imageCompanyLogoSrc = e.target.result;
          }
        };
        reader.readAsDataURL(this.selectedCompanyLogoFiles);
      }
    } else {
      if (imageSrcType === 1) {
        this.imageCompanyLogoSrc = '';
      }
    }
  }

  cancelClick() {
    this.clearForm();
  }
  setCompanyInfoNull() {
    this.getCountryData();
    this.clearLocation();
    this.formDisable = false;
    this.isCompanyDisabled = false;
    this.form.patchValue({
      // gS1Code: '',
      name: '',
      emailAddress: '',
      phoneNumber: '',
      address: '',
      nationId: '',
      provinceId: '',
      districtId: '',
      wardId: '',
      websiteUrl: '',
      latitude: '',
      longitude: '',
      tenantId: guiEmpty,
      tenantName: '',
      adminEmailAddress: '',
      adminPassword: '',
      userName: '',
      companyDescription: '',
      imageUrl: '',
    });
  }

  checkGtin() {
    const gtinInput = this.form.get('productGTINCode')?.value;
    if (gtinInput && !this.updateToken) {
      this.generateQrCodeService.checkGtinCodeByGtinCode(gtinInput).subscribe({
        next: res => {
          if (res) {
            this.form.get('productGTINCode')?.markAsTouched();
            this.form.get('productGTINCode')?.setErrors({ unique: true });
          }
        },
      });
    }
  }

  checkCompMail() {
    const mail = this.form.get('emailAddress').value;
    if (mail && (!this.isCompanyDisabled || this.updateEmailToken)) {
      this.generateQrCodeService.checkEmailCompanyByEmailInput(mail).subscribe(res => {
        if (res) {
          this.form.get('emailAddress')?.markAsTouched();
          this.form.get('emailAddress')?.setErrors({ unique: true });
        }
      });
    }
  }

  gs1CodeFilterClick() {
    const inputValue = this.form.value.gS1Code;
    this.companyCertificateImages = [];
    this.imageCompanyLogoSrc = '';
    if (!inputValue) {
      this.toasterService.error('::QRCode:GS1Require');
      return;
    }

    this.generateQrCodeService.getCompanyByGs1Code(inputValue).subscribe(companyInfo => {
      if (companyInfo) {
        this.isCompanyDisabled = true;
        this.formDisable = true;
        this.form.patchValue({
          gS1Code: companyInfo.gS1Code,
          name: companyInfo.name,
          emailAddress: companyInfo.emailAddress,
          phoneNumber: companyInfo.phoneNumber,
          address: companyInfo.address,
          nationId: companyInfo.nationId,
          provinceId: companyInfo.provinceId,
          districtId: companyInfo.districtId,
          wardId: companyInfo.wardId,
          websiteUrl: companyInfo.websiteUrl,
          latitude: companyInfo.latitude,
          longitude: companyInfo.longitude,
          tenantId: companyInfo.tenantId,
          tenantName: companyInfo.tenantName,
          adminEmailAddress: companyInfo.adminEmailAddress,
          adminPassword: companyInfo.adminPassword,
          userName: companyInfo.userName,
          companyDescription: companyInfo.description,
          companyLogo: companyInfo.logo,
        });

        this.countryData.selected = this.findItemById(this.countryData.data, companyInfo.nationId);

        this.getProvinceData(companyInfo.nationId).subscribe(() => {
          this.provinceData.selected = this.findItemById(
            this.provinceData.data,
            companyInfo.provinceId,
          );
        });

        this.getDistrictData(companyInfo.provinceId).subscribe(() => {
          this.districtData.selected = this.findItemById(
            this.districtData.data,
            companyInfo.districtId,
          );
        });

        this.getWardData(companyInfo.districtId).subscribe(() => {
          this.wardData.selected = this.findItemById(this.wardData.data, companyInfo.wardId);
        });
        this.imageCompanyLogoSrc = companyInfo.imageUrl;

        this.fileService
          .getListImageBase64(
            RelatedEntityType.CompanyProfileCertification,
            companyInfo.companyProfileId,
          )
          .subscribe(imageUrl => {
            this.companyCertificateImages = imageUrl;
          });
      } else {
        this.toasterService.info('::QRCode:GS1NotExist');
        this.setCompanyInfoNull();
      }
    });
  }

  getCountryData() {
    this.countryData.data = [];
    this.countryData.selected = {};
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
      this.getProvinceData($event.data.id);
      this.countryData.selected = $event.data;
      this.form.value.nationId = $event.data.id;
      this.getProvinceData($event.data.id).subscribe(() => {});
      this.form.patchValue({
        nationId: $event.data.id,
      });
    } else {
      this.form.patchValue({
        nationId: '',
      });
      this.countryData.selected = null;
    }
  }

  eventProvinceSelectHandle($event: any) {
    if ($event.success) {
      this.getDistrictData($event.data.id);
      this.provinceData.selected = $event.data;
      this.form.value.provinceId = $event.data.id;
      this.getDistrictData($event.data.id).subscribe(() => {});
      this.form.patchValue({
        provinceId: $event.data.id,
      });
    } else {
      this.form.patchValue({
        provinceId: '',
      });
      this.provinceData.selected = null;
    }
  }

  eventDistrictSelectHandle($event: any) {
    if ($event.success) {
      this.getWardData($event.data.id);
      this.districtData.selected = $event.data;
      this.form.value.districtId = $event.data.id;
      this.getWardData($event.data.id).subscribe(() => {});
      this.form.patchValue({
        districtId: $event.data.id,
      });
    } else {
      this.form.patchValue({
        districtId: '',
      });
      this.districtData.selected = null;
    }
  }

  eventWardSelectHandle($event: any) {
    if ($event.success) {
      this.wardData.selected = $event.data;
      this.form.value.wardId = $event.data.id;
      this.form.patchValue({
        wardId: $event.data.id,
      });
    } else {
      this.form.patchValue({
        wardId: '',
      });
      this.wardData.selected = null;
    }
  }

  findItemById(data: any[], id: string): any {
    const result = data.find(x => x.id === id);
    if (result === null || result === undefined) {
      return '';
    }
    return result;
  }

  getCategoryData() {
    this.categoryData.data = [];
    this.productCategoryService.getProductCategoryDropdown().subscribe(res => {
      this.categoryData.data = res.items;
    });
  }

  eventCategorySelectHandle($event: any) {
    if ($event.success) {
      this.categoryData.selected = $event.data;

      this.form.patchValue({
        productCategoryId: $event.data.id,
      });
    } else {
      this.form.patchValue({
        productCategoryId: null,
      });
      this.categoryData.selected = null;
    }
  }

  uploadFile(file: File, fileName: string): void {
    const formData: FormData = new FormData();
    formData.append('file', file, fileName);
    this.fileService.uploadFileByFile(formData).subscribe(res => {
      // this.form.value.logo = res;
    });
  }

  //Generate QR code
  genQrcode(data: any) {
    const qrcodeId = document.getElementById('qrcode1');

    qrcodeId.innerHTML = '';

    const qrcode = new QRCode(qrcodeId, {
      text: data,
      width: 200,
      height: 200,
      logo: 'assets/images/logo/logo-footer.png',
      logoWidth: 40,
      logoHeight: 40,
      logoBackgroundTransparent: true,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H,
    });
    setTimeout(() => {
      const qrCanvasOrImg = qrcodeId.querySelector('canvas') || qrcodeId.querySelector('img');

      if (qrCanvasOrImg && this.updateToken) {
        let dataUrl: string;

        if (qrCanvasOrImg.tagName === 'CANVAS') {
          dataUrl = (qrCanvasOrImg as HTMLCanvasElement).toDataURL('image/png');
        } else if (qrCanvasOrImg.tagName === 'IMG') {
          dataUrl = (qrCanvasOrImg as HTMLImageElement).src;
        }

        const downloadLink = document.getElementById('downloadLink') as HTMLAnchorElement;
        downloadLink.href = dataUrl;
        downloadLink.download = 'qrcode.png';
      }
    }, 500);
  }
  clearInputValue(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      input.value = ''; // Safely clear the input's value
    }
  }
}
