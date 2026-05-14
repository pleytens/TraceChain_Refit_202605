import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Coordinate } from '../models/coordinate.model';
import { ActivatedRoute } from '@angular/router';
import { ReportCompany, ReportDiary, ReportProduct } from '../models/report.model';
import { ConstantVariableModel, QrCodeType } from 'src/app/shared/common/constant.variable.model';
import { ReportService } from '@proxy/traceverified/trace-farm/traceability-records-v2';
import { DomSanitizer } from '@angular/platform-browser';
import { ProductService } from '@proxy/traceverified/trace-farm/product-managements';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { GuidService } from '../../shared/services/guid.service';
import { UserInteractionService } from '@proxy/traceverified/trace-farm/user-interactions';

declare var google: any;

@Component({
  selector: 'app-product-traceability',
  templateUrl: './product-traceability.component.html',
  styleUrls: ['./product-traceability.component.scss'],
  providers: [NgbModalConfig, NgbModal]

})
export class ProductTraceabilityComponent implements AfterViewInit, OnInit {
	modalRef?: any;
  gs1Code: string;
  reportType: string;
  userType: number = null;
	map: any;
	listMarker: Array<any> = [];
	markerCluster: any;
	isLoadComponent: boolean = false;
	mapData: any = {};
	defaultLat: number = 0;
	defaultLng: number = 0;
	imgSrc: string;
	productData: ReportProduct = new ReportProduct();
	companyData: ReportCompany = new ReportCompany();
	diaryData: ReportDiary = new ReportDiary();
	isCollapsed = true;
  lotId: string = null;
  safeCompanyContent: any;
  safeProductContent: any;
  userGuid: string;
  @ViewChild('expired') expiredTemplate: TemplateRef<any>;
  isExpired: boolean = false;
	slideProConfig = {"slidesToShow": 1, "slidesToScroll": 1};
	slideCerConfig = {"slidesToShow": 2, "slidesToScroll": 1};
	slideComConfig = {"slidesToShow": 3, "slidesToScroll": 1};


	constructor(private route: ActivatedRoute,
              private reportService: ReportService,
              private productService: ProductService,
              private sanitizer: DomSanitizer,
              private guidService: GuidService,
              private userInteractionService: UserInteractionService,
              config: NgbModalConfig,
              private ngModalService: NgbModal
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
    config.centered = true;
    config.size = 'sm'
}

	ngOnInit(): void {
    this.userGuid = this.guidService.getGuid();

    this.route.queryParams.subscribe(params => {
			this.gs1Code = params['d'];
      this.reportType = params['t'];
		});
		this.initYoutube();
	}

	ngAfterViewInit(): void {
		setTimeout(_ => {
			this.initMap(9.976431687513815, 106.33612187609513);
			this.isLoadComponent = true;
      if (this.reportType == '1') {
        this.getReportProductForFree();
        this.getReportCompanyForFree();
        this.checkProductExpired(this.gs1Code)
        this.addViewCount(this.gs1Code, QrCodeType.QrCodeFree)
      }else
      {
        this.getReportProduct();
        this.getReportCompany();
      }
		}, 1);
	}
  getDomainName(code:any){
    if (code && code !== '#') {
      const fullUrl = window.location.origin;
      window.location.href = fullUrl + '/p?d=' + code;
    }
  };

  eventFieldTypeHandle($event: any) {
    if ($event == 6) {
      return true;
    }
    return false;
  }

  showImage(event: any, template: TemplateRef<void>) {
    const target = event.target || event.srcElement || event.currentTarget;
    const srcAttr = target.attributes.src;
    this.imgSrc = srcAttr.nodeValue;
    this.modalRef = this.ngModalService.open(template, {size: 'sm'});
  }

  setDefaultImage(event) {
    event.target.src = ConstantVariableModel.DEFAULT_IMAGE;
  }

  private initMap(lat, lng) {
    let mapProp = {
      center: new google.maps.LatLng(lat, lng),
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
    };
    this.map = new google.maps.Map(document.getElementById('googleMap'), mapProp);
  }

	private setCenter(lat, lng) {
		this.map.setCenter(new google.maps.LatLng(lat, lng));
	}

  private buildLocation(lat, log, name, img) {
    let marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, log),
      map: this.map,
      icon: {
        labelOrigin: new google.maps.Point(11, 35),
        url: 'assets/images/marker_house.png',
        size: new google.maps.Size(22, 40),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(11, 40),
      },
      label: {
        color: '#163c9e',
        fontWeight: 'bold',
        text: name,
      },
      title: '',
    });

    this.listMarker.push(marker);
  }

  private deleteMarkers() {
    if (this.markerCluster) this.markerCluster.removeMarkers(this.listMarker);
    this.listMarker.forEach(element => {
      element.setMap(null);
    });
    this.listMarker = [];

    if (this.markerCluster) this.markerCluster.setMap(null);
  }

  private initYoutube() {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
  }

  private getMapInfo() {
    this.mapData = [];
    this.reportService.getReportMapInfoForProductByLotIdAndGtinCodeAndUserType(this.lotId, this.gs1Code, this.userType).subscribe(res => {
      this.mapData = res.items;
      this.handleLocation(this.mapData);
      this.setCenter(this.defaultLat, this.defaultLng);
    });
  }

	private handleLocation(val: any, latPar?: any, lngPar?: any) {
		if (val != undefined) {
			let mainLine = new Array<Coordinate>();
			let prePoint = new Coordinate();
			val.forEach(child => {
				if (child.latitude > 0 && child.longitude > 0) {
					if (latPar == undefined || lngPar == undefined) {
						if (prePoint.lat != undefined && prePoint.lng != undefined)
							mainLine.push({ lat: prePoint.lat, lng: prePoint.lng });
						mainLine.push({ lat: child.latitude, lng: child.longitude });
						if (mainLine.length == 2) {
							this.drawLine(mainLine, child.isArea == true ? '#FFA500' : '#FF0000');
							mainLine = new Array<Coordinate>();
							prePoint = { lat: child.latitude, lng: child.longitude };
						}
					} else {
						let branchLine = new Array<Coordinate>();
						branchLine.push({ lat: latPar, lng: lngPar });
						branchLine.push({ lat: child.latitude, lng: child.longitude });
						this.drawLine(branchLine, child.isArea == true ? '#FFA500' : '#FF0000');
					}

					if (this.defaultLat == 0 && this.defaultLng == 0) {
						this.defaultLat = child.latitude;
						this.defaultLng = child.longitude;
					}
				}
				this.buildLocation(child.latitude, child.longitude, child.displayText, '');
				if (child.mapInfoReports != undefined && child.mapInfoReports.length > 0) {
					this.handleLocation(child.mapInfoReports, child.latitude, child.longitude);
				}
			});
		}
	}

	private drawLine(lineCoordinates: any, color: string) {
		var linePath = new google.maps.Polyline({
			path: lineCoordinates,
			geodesic: true,
			strokeColor: color
		});

		linePath.setMap(this.map);
	}

  private getReportProduct() {
    this.productData = new ReportProduct();
    this.reportService.getReportProductForProByGtinCodeAndLotId(this.gs1Code, this.lotId).subscribe(res => {
      this.productData = {
        productName: res.productName,
        gtinCode: res.gtinCode,
        description: res.description,
        images: res.images,
        certificationImages: res.certificationImages,
        activationDate: res.activationDate,
        companyLogo: res.companyLogo,
      };
    });
  }

  private getReportCompany() {
    this.companyData = new ReportCompany();
    this.reportService.getReportCompanyForProductByGtinCodeAndLotId(this.gs1Code, this.lotId).subscribe(res => {
      this.companyData = {
        name: res.name,
        gS1Code: res.gS1Code,
        description: res.description,
        address: res.address,
        country: res.country,
        phoneNumber: res.phoneNumber,
        emailAddress: res.emailAddress,
        websiteUrl: res.websiteUrl,
        certificationImages: res.certificationImages,
      };
    });
  }

  private getReportProductForFree() {
    this.productData = new ReportProduct();
    this.reportService.getReportProductForFreeByGtinCode(this.gs1Code).subscribe(res => {
      this.productData = {
        productName: res.productName,
        gtinCode: res.gtinCode,
        description: res.description,
        images: res.images,
        certificationImages: res.certificationImages,
        activationDate: res.activationDate,
        companyLogo: res.companyLogo,
      };
      this.safeProductContent = this.sanitizer.bypassSecurityTrustHtml(res.description);
    });
  }

  private getReportCompanyForFree() {
    this.companyData = new ReportCompany();
    this.reportService.getReportCompanyForFreeByGtinCode(this.gs1Code).subscribe(res => {
      this.companyData = {
        name: res.name,
        gS1Code: res.gS1Code,
        description: res.description,
        address: res.address,
        country: res.country,
        phoneNumber: res.phoneNumber,
        emailAddress: res.emailAddress,
        websiteUrl: res.websiteUrl,
        certificationImages: res.certificationImages,
      };
      this.safeCompanyContent = this.sanitizer.bypassSecurityTrustHtml(res.description);

    });
  }

  private getReportDiary() {
    this.diaryData = new ReportDiary();
    this.reportService.getReportDiaryByGtinCodeAndLotIdAndUserType(this.gs1Code, this.lotId, this.userType).subscribe(res => {
      this.diaryData = {
        materialTraceCode: res.materialTraceCodes,
        steps: res.steps,
      };
    });
  }

  searchLotId() {
    if (this.lotId)
    {
      this.isCollapsed = false;
      this.getReportDiary();
      this.getMapInfo();
      this.getReportCompany();
      this.getReportProduct();
    }
  }

  checkProductExpired(gtinCode: any) {
    this.productService.getCheckExpiredTimeProductByGtinCode(gtinCode).subscribe(res => {
      this.isExpired = !res
      if (this.isExpired) {
        this.ngModalService.open(this.expiredTemplate);
      }
    });
  }


  addViewCount(caseStudyId: string, objectType: QrCodeType) {
    const model = {
      objectType: objectType,
      objectId: caseStudyId,
      deviceId: this.userGuid
    };
    this.userInteractionService.viewCounterByObjectTypeAndObjectIdAndDeviceId(model.objectType, model.objectId, model.deviceId).subscribe({
      complete: () => {
      }
    });
  }
}
