import { Component, OnInit, ViewChild } from '@angular/core';
import { ListService, PagedResultDto } from '@abp/ng.core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateNativeAdapter, NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';
import { Confirmation, ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { StorageService } from '@proxy/traceverified/trace-farm/file-management';
import { ProductCategoryService } from '@proxy/traceverified/trace-farm/product-categories';
import { MarketService } from '@proxy/traceverified/trace-farm/markets';
import {
  CreateUpdateProductDto,
  ProductDto,
  ProductFilterDto,
  ProductService,
} from '@proxy/traceverified/trace-farm/product-managements';
import * as QRCode from 'qrcode';
import { EditorComponent } from '../shared/components/editor/editor.component';
import { concatMap, EMPTY, forkJoin, lastValueFrom, mapTo, Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
const guiEmpty = '00000000-0000-0000-0000-000000000000'; // empty guid

@Component({
  selector: 'app-company-profile',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  providers: [ListService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }],
})
export class ProductComponent implements OnInit {
  @ViewChild('editor') editor: EditorComponent;
  isCollapsed = true;
  filterText: string = null;
  product = { items: [], totalCount: 0 } as PagedResultDto<ProductDto>;
  form: FormGroup;
  isModalOpen = false;
  selectedProduct = {} as ProductDto;
  marketData: any = {};
  categoryData: any = {};
  filterMarket: any = {};
  filterCategory: any = {};
  selectedFile: File;
  modules: {};
  certificationImages: any = [];
  selectedCertificationFiles:  File[];
  documentFiles:any = [];
  selectedDocumentFiles:any = [];
  images: any = [];
  selectedImageFiles: any = [];

  constructor(
    public readonly list: ListService,
    private productService: ProductService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private fileService: StorageService,
    private productCategoryService: ProductCategoryService,
    private marketService: MarketService,
    private toastyService: ToasterService,
  ) {
    this.filterText = null;
  }

  ngOnInit(): void {
    this.getCategoryData();
    this.getMarketData();
    const profileStreamCreator = query => {
      const filterModel = {} as ProductFilterDto;
      filterModel.filter = this.filterText;
      filterModel.sorting = query.sorting;
      filterModel.skipCount = query.skipCount;
      filterModel.maxResultCount = query.maxResultCount;
      if (this.filterMarket) {
        filterModel.marketId = this.filterMarket.id;
      }
      if (this.filterCategory) {
        filterModel.productCategoryId = this.filterCategory.id;
      }

      return this.productService.getListCustom(filterModel);
    };
    this.list.hookToQuery(profileStreamCreator).subscribe(response => {
      this.product = response;
    });
  }

  createProduct() {
    this.selectedImageFiles = [];
    this.images = [];
    this.certificationImages = [];
    this.selectedDocumentFiles = [];
    this.selectedProduct = {} as ProductDto;
    this.marketData.selected = '';
    this.categoryData.selected = {};
    this.buildForm();
    this.isModalOpen = true;
  }

  defineDocumentFile(){
  }

  filter($event: any) {
    this.list.get();
  }

  buildForm() {
    this.form = this.fb.group({
      productName: [this.selectedProduct.productName || '', Validators.required],
      marketId: [this.selectedProduct.marketId || guiEmpty],
      productCategoryId: [this.selectedProduct.productCategoryId || ''],
      gtinCode: [this.selectedProduct.gtinCode || '', Validators.required],
      description: [this.selectedProduct.description || ''],
      link: [this.selectedProduct.link || ''],
      certificationImages: [this.selectedProduct.certificateImagesName || []],
      images: [this.selectedProduct.imagesName || []],
      documentFiles: [
        (this.selectedProduct.documentFiles || []).map(file => file.id)
      ],
      videoUrls: this.fb.array(
        this.selectedProduct.videoUrls && this.selectedProduct.videoUrls.length > 0
          ? this.selectedProduct.videoUrls.map(url => this.fb.control(url))
          : [this.fb.control('')],
      ),
    });
  }

  get videoUrls(): FormArray {
    return this.form.get('videoUrls') as FormArray;
  }

  addUrl() {
    this.videoUrls.push(this.fb.control(''));
  }

  removeUrl(index: number) {
    this.videoUrls.removeAt(index);
  }

  onDocumentFileChange(event: any): void {
    // 1. Lấy danh sách file và giới hạn số lượng
    const files: File[] = Array.from(event.target.files);
    const validExtensions = ['pdf', 'doc', 'docx'];

    if (files.length > 10) {
      this.toastyService.error('::MaxFileUpload', '::MaxFileUpload');
      return;
    }

    // --- Logic Kiểm Tra Định Dạng File ---
    // 2. Lọc ra các file KHÔNG HỢP LỆ (để hiển thị thông báo lỗi)
    const invalidFiles = files.filter(file => {
      // Lấy phần mở rộng của file
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      // Trả về TRUE nếu phần mở rộng KHÔNG nằm trong danh sách hợp lệ
      return !validExtensions.includes(ext);
    });

    if (invalidFiles.length > 0) {
      this.toastyService.error('::UnsupportedFormat', '::Error');
      return;
    }

    // --- Tiếp tục xử lý nếu TẤT CẢ file đều HỢP LỆ ---
    const documentFilesToProcess = files.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      return validExtensions.includes(ext);
    });

    // Lưu trữ các file (File objects)
    this.selectedDocumentFiles.push(...documentFilesToProcess);
    // Xử lý đọc DataURL
    for (const file of documentFilesToProcess) {
      this.documentFiles.push(file);
    }
  }

  onFileChange(event: any): void {
    const files: File[] = Array.from(event.target.files);

    if (files.length > 5) {
      this.toastyService.error('::MaxFileUpload', '::MaxFileUpload');
      return;
    }

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));

    if (invalidFiles.length > 0) {
      this.toastyService.error('::UnsupportedFormat', '::Error');
    }

    this.selectedCertificationFiles = imageFiles;

    for (const file of imageFiles) {
      const reader = new FileReader();
      reader.onload = e => {
        this.certificationImages.push(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  }

  onFileChangeImage(event: any) {
    const files: File[] = Array.from(event.target.files);

    // Limit number of files
    if (files.length > 5) {
      this.toastyService.error('::MaxFileUpload', '::MaxFileUpload');
      return;
    }

    // Filter to only image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));

    if (invalidFiles.length > 0) {
      this.toastyService.error('::UnsupportedFormat', '::Error');
    }

    // Store only the valid image files
    this.selectedImageFiles = imageFiles;

    // Generate previews for valid images
    for (const file of imageFiles) {
      const reader = new FileReader();
      reader.onload = e => {
        this.images.push(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  }

  openModal() {
    this.buildForm();
    this.isModalOpen = true;
  }

  edit(id: string) {
    this.productService.get(id).subscribe(product => {
      this.selectedProduct = product;
      this.certificationImages = product.certificateImagesBase64;
      this.documentFiles = product.documentFiles;
      this.images = product.imagesBase64;
      this.buildForm();
      this.isModalOpen = true;
      this.categoryData.selected = this.findItemById(
        this.categoryData.data,
        product.productCategoryId,
      );
      this.marketData.selected = this.findItemById(this.marketData.data, product.marketId);
    });
  }

  findItemById(data: any[], id: string): any {
    return data.find(item => item.id === id);
  }

  async save() {
    if (this.editor) {
      const description = await this.editor.uploadImagesFromQuillContent(this.editor.content);
      this.form.patchValue({
        description: description,
      });
    }

    if (!this.form.valid) return;

    // --- Khởi tạo mảng Promises ---
    const uploadPromises: Promise<string>[] = [];

    // --- Xử lý upload Ảnh Sản phẩm ---
    if (this.selectedImageFiles && this.selectedImageFiles.length > 0) {
      for (const imageFile of this.selectedImageFiles) {
        if (!imageFile.type.startsWith('image')) {
          this.toastyService.error('::UnsupportedFormat', '::Error');
          return;
        }
        const currentDate: number = new Date().getTime();
        const fileName = currentDate.toString();
        const fileType = imageFile.name.split('.').pop();
        const imageName = fileName + '.' + fileType;

        // Thêm Promise vào mảng, sau này chúng ta sẽ xử lý kết quả
        // Chúng ta sẽ thêm tên file vào form sau khi Promise.all hoàn thành,
        // hoặc bạn có thể thêm GUID (res) nếu API trả về GUID.
        uploadPromises.push(
          this.uploadFile(imageFile, imageName).then(res => {
            // Giả sử API trả về GUID, push GUID vào mảng images
            this.form.value.images.push(res);
            return res; // Trả về GUID để Promise.all nhận
          })
        );
      }
    }

    // --- Xử lý upload Ảnh Chứng nhận ---
    if (this.selectedCertificationFiles && this.selectedCertificationFiles.length > 0) {
      for (const imageFile of this.selectedCertificationFiles) {
        if (!imageFile.type.startsWith('image')) {
          this.toastyService.error('::UnsupportedFormat', '::Error');
          return;
        }
        const currentDate: number = new Date().getTime();
        const fileName = currentDate.toString();
        const fileType = imageFile.name.split('.').pop();
        const certificationImageName = fileName + '.' + fileType;

        // Thêm Promise vào mảng
        uploadPromises.push(
          this.uploadFile(imageFile, certificationImageName).then(res => {
            // Giả sử API trả về GUID, push GUID vào mảng certificationImages
            this.form.value.certificationImages.push(res);
            return res; // Trả về GUID để Promise.all nhận
          })
        );
      }
    }

    // 3. Đợi tất cả các Promises upload ảnh hoàn thành
    try {
      await Promise.all(uploadPromises);
    } catch (error) {
      this.toastyService.error('::ImageUploadFailed', '::Error');
      // Nếu upload ảnh thất bại, dừng quá trình lưu
      console.error(error);
      return;
    }

    // --- Tiếp tục với logic upload Tài liệu và Lưu Sản phẩm (đã có ở lần sửa trước) ---

    let uploadDocs$: Observable<void> = of(undefined);
    if (this.selectedDocumentFiles && this.selectedDocumentFiles.length > 0) {
      uploadDocs$ = this.uploadDocumentFile(this.selectedDocumentFiles);
    }

    const { id } = this.selectedProduct || {};
    const productSave$: Observable<any> = (id
        ? this.productService.update(id, { ...this.form.value })
        : this.productService.create({ ...this.form.value })
    );

    // Bắt đầu chuỗi RxJS sau khi tất cả ảnh đã được await xong
    uploadDocs$
      .pipe(
        concatMap(() => productSave$),
        catchError(err => {
          this.toastyService.error('::SaveFailed', '::Error');
          return throwError(() => err);
        })
      )
      .subscribe({
        next: () => {
          this.isModalOpen = false;
          this.selectedImageFiles = [];
          this.selectedCertificationFiles = [];
          this.form.reset();
          this.list.get();
          this.toastyService.success('::Success');
        },
      });
  }

  // Trong class của bạn
  uploadDocumentFile(files: File[]): Observable<void> {
    if (!files || files.length === 0) {
      return of(undefined); // Hoàn thành ngay lập tức nếu không có file
    }
    // Tạo một mảng các Observable, mỗi Observable là một yêu cầu upload file
    const uploadObservables = files.map(file => {
      const formData: FormData = new FormData();
      formData.append('file', file, file.name);

      // Trả về Observable của yêu cầu upload
      return this.fileService.uploadFileWithSaveByFile(formData).pipe(
        // Sau khi upload thành công, xử lý kết quả
        tap(res => {
          // Áp dụng logic làm sạch GUID đã thảo luận
          let cleanedGuid = res.slice(1, -1);
          // Cập nhật form
          this.form.value.documentFiles.push(cleanedGuid);
          return
        }),
        // Bắt lỗi nếu upload một file nào đó thất bại (tùy chọn)
        catchError(err => {
          console.error("Upload failed for file:", file.name, err);
          // Có thể throw lỗi hoặc trả về một Observable rỗng (EMPTY)
          // để tiếp tục với các file khác nếu bạn muốn.
          return EMPTY;
        })
      );
    });
    // Sử dụng forkJoin để đợi TẤT CẢ các Observable upload hoàn thành
    // Sau đó sử dụng mapTo(undefined) để trả về Observable<void>
    return forkJoin(uploadObservables).pipe(
      mapTo(undefined)
    );
  }

  uploadFile(file: File, fileName: string): Promise<string> {
    const formData: FormData = new FormData();
    formData.append('file', file, fileName);

    // Giả định this.fileService.uploadFileByFile trả về Observable<string> (là GUID/UUID)
    const uploadObservable: Observable<string> = this.fileService.uploadFileByFile(formData);

    // Trả về một Promise sẽ giải quyết với kết quả upload
    return lastValueFrom(uploadObservable).then(res => {
      // Logic gán logo (nếu có, nhưng thường logo là 1 file, không phải nhiều file)
      // Giả sử res là GUID của file đã upload.

      // Nếu bạn không cần gán res vào this.form.value.logo ở đây,
      // chỉ cần trả về res (GUID)
      return res;
    });
  }

  getMarketData() {
    this.marketData.data = [];
    this.marketService.getMarketDropdown().subscribe(res => {
      this.marketData.data = res.items;
    });
  }

  getCategoryData() {
    this.categoryData.data = [];
    this.productCategoryService.getProductCategoryDropdown().subscribe(res => {
      this.categoryData.data = res.items;
    });
  }

  eventMarketSelectHandle($event: any) {
    if ($event.success) {
      this.marketData.selected = $event.data;
      this.form.patchValue({
        marketId: $event.data.id,
      });
    }
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

  eventMarketFilterSelectHandle($event: any) {
    if ($event.success) {
      this.filterMarket = $event.data;
    }
  }

  eventCategoryFilterSelectHandle($event: any) {
    if ($event.success) {
      this.filterCategory = $event.data;
    }
  }

  deleteProduct(id) {
    this.confirmation.warn('::AreYouSureToDelete', '::AreYouSure').subscribe(status => {
      if (status === Confirmation.Status.confirm) {
        this.productService.delete(id).subscribe(() => this.list.get());
      }
    });
  }

  deleteImage(i: number) {
    this.images.splice(i, 1);
    this.selectedProduct.imagesName.splice(i, 1);
  }

  deleteCertificationImage(i: number) {
    this.certificationImages.splice(i, 1);
    this.selectedProduct.certificateImagesName.splice(i, 1);
  }

  printQrCodeClick(gtinCode) {
    const fullUrl = window.location.origin;
    const fullLink = fullUrl + '/p?d=' + gtinCode;
    this.printQrCode(fullLink);
  }
  async printQrCode(url: any) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(url);
      const link = document.createElement('a');
      link.href = qrCodeDataURL;
      link.download = 'QRCode.png';
      link.click();
    } catch (err) {
      console.error(err);
    }
  }

  getFileIconClass(fileName: any): string {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    switch (ext) {
      case 'pdf':
        // Icon cho PDF
        return 'far fa-file-pdf file-icon pdf-icon';
      case 'doc':
      case 'docx':
        // Icon cho Word
        return 'far fa-file-word file-icon doc-icon';
      default:
        // Icon mặc định cho các loại file khác (nếu có)
        return 'far fa-file file-icon default-icon';
    }
  }

  deleteDocumentFile(i: number): void {
    this.documentFiles.splice(i, 1);
    const control = this.form.get('documentFiles');
    const current = control?.value || [];

    current.splice(i, 1);

    control?.setValue([...current]);
  }
}
