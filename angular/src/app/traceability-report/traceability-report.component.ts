import { AfterViewInit, Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QrCodeType } from '../shared/common/constant.variable.model';
import { UserInteractionService } from '@proxy/traceverified/trace-farm/user-interactions';
import { GuidService } from '../shared/services/guid.service';
import { EventService } from '@proxy/traceverified/trace-farm/events';
import { ReportService } from '@proxy/traceverified/trace-farm/traceability-records-v2';
import { StorageService } from '@proxy/traceverified/trace-farm/file-management';
import { Observable } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-traceability-report',
  templateUrl: './traceability-report.component.html',
  styleUrls: ['./traceability-report.component.scss'],
})
export class TraceabilityReportComponent implements OnInit, AfterViewInit {
  @ViewChild('bannerTemplate') bannerTemplate!: TemplateRef<any>;
  traceCode: string;
  gtin: string;
  lotId: string;
  qrCodeType: number;
  productName: string;
  productCode: string;
  productId: string;
  userType: number;
  activeId: number = 1;
  visitedIds = new Set<number>([this.activeId]);
  userGuid: string;
  isHasMinigame: boolean = false;
  currentLocation = {
    lat: 0,
    lng: 0,
  };
  isCustomReport = false;
  isLoading = false;
  bannerMinigame: string;
  bannerRef: NgbModalRef;

  private eventService = inject(EventService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private userInteractionService = inject(UserInteractionService);
  private guidService = inject(GuidService);
  private reportService = inject(ReportService);
  private storageService = inject(StorageService);
  private modalService = inject(NgbModal);
  constructor() {}

  ngOnInit() {
    this.userGuid = this.guidService.getGuid();
    const currentRoute = this.router.url.split('?')[0];
    this.activatedRoute.queryParams.subscribe(params => {
      const docOld = params['doc'];
      if (Number(params['QrType']) === QrCodeType.QrCodeFree) {
        this.qrCodeType = QrCodeType.QrCodeFree;
      } else {
        this.qrCodeType = QrCodeType.QrCodeDefault;
      }
      if (docOld == '992145577-1') {
        window.location.href =
          'https://tracefish.traceverified.com/end-user/traceability-info?doc=992145577-1';
      }
      if (currentRoute === '/p') {
        this.gtin = params['d'];
        this.productCode = params['d'];
        this.getMiniGameByGtin(this.gtin)
      } else {
        this.traceCode = params['d'];
      }
      if (params['t']) {
        this.userType = params['t'];
      }
    });
    if (this.traceCode) {
      this.isLoading = true;
      this.getCompanyInfo(this.traceCode);
    }
  }

  async ngAfterViewInit() {
    try {
      await this.getCurrentLocation();
    } catch (error) {
      console.error('Failed to get location:', error);
    }

    this.addViewCount(this.traceCode ? this.traceCode : this.gtin, this.qrCodeType);
  }

  addViewCount(caseStudyId: string, objectType: QrCodeType) {
    const model = {
      objectType: objectType,
      objectId: caseStudyId,
      deviceId: this.userGuid,
      latitude: this.currentLocation.lat,
      longitude: this.currentLocation.lng,
    };
    this.userInteractionService.viewCounterByInput(model).subscribe({
      complete: () => {},
    });
  }

  getMiniGame(productId: string) {
    this.eventService.getByProductId(productId).subscribe({
      next: res => {
        if (res) {
          this.isHasMinigame = true;
          this.getImageUrl(res.coverImageName).subscribe(url => {
            this.bannerMinigame = url;
            setTimeout(() => {
              this.openBanner();
            });
          });
        }
      },
    });
  }

  getMiniGameByGtin(gtinCode: string) {
    this.eventService.getByGtinCode(gtinCode).subscribe({
      next: res => {
        if (res) {
          this.isHasMinigame = true;
          this.getImageUrl(res.coverImageName).subscribe(url => {
            this.bannerMinigame = url;
            setTimeout(() => {
              this.openBanner();
            });
          });
        }
      },
    });
  }

  openBanner() {
    if (this.bannerTemplate && this.bannerMinigame) {
      this.bannerRef = this.modalService.open(this.bannerTemplate, {
        size: 'lg',
        centered: true,
        backdrop: true,
        keyboard: true,
        modalDialogClass: 'banner-modal',
      });
    }
  }

  closeBanner() {
    this.bannerRef.close();
  }

  getImageUrl(imageName: string): Observable<string> {
    return this.storageService.getFileUrlByFileName(imageName);
  }

  getCurrentLocation(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.error('Geolocation not supported!');
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.permissions
        .query({ name: 'geolocation' })
        .then(result => {
          if (result.state === 'granted' || result.state === 'prompt') {
            navigator.geolocation.getCurrentPosition(
              position => {
                this.currentLocation.lng = position.coords.longitude;
                this.currentLocation.lat = position.coords.latitude;
                resolve();
              },
              err => {
                console.error('Location error:', err.message);
                reject(err);
              },
              {
                timeout: 10000,
                enableHighAccuracy: true,
                maximumAge: 300000,
              },
            );
          } else {
            console.warn('Location access denied by user.');
            reject(new Error('Location access denied'));
          }
        })
        .catch(reject);
    });
  }

  getCompanyInfo(traceCode: string) {
    this.reportService.getReportCompanyByTraceCode(traceCode).subscribe({
      next: res => {
        if (res.tenantId === '1f73ac4b-0f26-c2cf-7e08-3a1def2266f0') {
          this.isCustomReport = true;
        }
        this.isLoading = false;
      },
    });
  }

  lotIdChange($event: any) {
    this.lotId = $event;
  }

  productNameChange($event: any) {
    this.productName = $event;
  }

  productCodeChange($event: any) {
    this.productId = $event;
    this.getMiniGame(this.productId);
  }

  navigateMiniGame() {
    let url: string
      if (this.productId) {
        url = this.router.serializeUrl(
          this.router.createUrlTree(['/mini-game'], { queryParams: { productId: this.productId } }),
        );
      } else if (this.gtin) {
        url = this.router.serializeUrl(
          this.router.createUrlTree(['/mini-game'], { queryParams: { gtin: this.gtin } }),
        );
      }

    window.open(url);
  }
}
