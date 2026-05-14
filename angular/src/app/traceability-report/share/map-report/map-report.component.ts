import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CarouselMapService } from '../carousel-navigate.service';
import { ReportService } from '@proxy/traceverified/trace-farm/traceability-records-v2';
import { Coordinate } from '../../../end-user/models/coordinate.model';
import { MapInfoReportV2 } from '@proxy/traceverified/trace-farm/traceability-records/reports';
import { position } from 'html2canvas/dist/types/css/property-descriptors/position';

const guiEmpty = '00000000-0000-0000-0000-000000000000'; // empty guid
@Component({
  selector: 'app-map-report',
  standalone: true,
  imports: [],
  templateUrl: './map-report.component.html',
  styleUrls: ['./map-report.component.scss'],
})
export class MapReportComponent implements OnInit {
  map: google.maps.Map;
  @Input() fieldModel: any;
  @Input() traceCode: string;
  @Input() lotId: string;
  @Input() userType: number;
  @Input() gtin: string;
  mapInfo: any;
  defaultLat: number = 0;
  defaultLng: number = 0;
  listMarker: Array<any> = [];

  constructor(
    private reportService: ReportService,
    private carouselNavService: CarouselMapService,
  ) {}

  ngOnInit() {
    if (this.traceCode) {
      this.getMapInfo(this.traceCode);
    } else if (this.lotId) {
      this.getMapInfoByLot(this.lotId, this.gtin, this.userType);
    }
  }

  getMapInfo(traceCode: string) {
    this.reportService.getReportMapInfoByTraceCodeAndUserType(traceCode, this.userType).subscribe({
      next: res => {
        this.initMap(res.items[0].latitude, res.items[0].longitude).finally(() => {
          this.mapInfo = res.items;
          this.handleLocation(this.mapInfo);
        });

        this.carouselNavService.slideKey$.subscribe((key: string) => {
          if (key) {
            this.onCompanyChange(key);
          }
        });
      },
    });
  }

  getMapInfoByLot(lotId: string, gtin: string, userType: number) {
    this.reportService
      .getReportMapInfoForProductByLotIdAndGtinCodeAndUserType(lotId, gtin, userType)
      .subscribe({
        next: res => {
          this.initMap(res.items[0].latitude, res.items[0].longitude).finally(() => {
            this.mapInfo = res.items;
            this.handleLocation(this.mapInfo);
          });

          this.carouselNavService.slideKey$.subscribe((key: string) => {
            if (key) {
              this.onCompanyChange(key);
            }
          });
        },
      });
  }

  private async initMap(lat: number, long: number) {
    try {
      const mapElement = document.getElementById('googleMap');
      if (!mapElement) {
        throw new Error('Google Map element not found!');
      }

      let mapProp = {
        center: new google.maps.LatLng(lat, long),
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        styles: [
          {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'transit',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }],
          },
        ],
      };

      const { Map } = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary;
      this.map = new Map(mapElement, mapProp);

      // Wait for map to be ready
      await new Promise<void>(resolve => {
        google.maps.event.addListenerOnce(this.map, 'idle', () => {
          resolve();
        });
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }
  private allCoordinates: google.maps.LatLng[] = [];
  private handleLocation(val: any, latPar?: any, lngPar?: any, namePar?: any) {
    if (latPar === undefined) {
      this.allCoordinates = [];
    }
    if (val != undefined) {
      let mainLine = new Array<Coordinate>();
      let prePoint = new Coordinate();

      val.forEach(child => {
        if (child.latitude !== undefined && child.longitude !== undefined) {
          if (latPar == undefined || lngPar == undefined) {
            if (prePoint.lat != undefined && prePoint.lng != undefined)
              mainLine.push({ lat: prePoint.lat, lng: prePoint.lng });
            if (child.displayText !== 'Công Ty TNHH ADC') {
              mainLine.push({ lat: child.latitude, lng: child.longitude });
            }
            if (mainLine.length == 2) {
              this.drawLine(mainLine, child.isArea == true ? '#FFA500' : '#FF0000');
              mainLine = new Array<Coordinate>();
              prePoint = { lat: child.latitude, lng: child.longitude };
            }
          } else {
            let branchLine = new Array<Coordinate>();

            if (namePar !== 'Công Ty TNHH ADC') {
              branchLine.push({ lat: latPar, lng: lngPar });
            }
            branchLine.push({ lat: child.latitude, lng: child.longitude });
            this.drawLine(branchLine, child.isArea == true ? '#FFA500' : '#FF0000');
          }

          if (this.defaultLat == 0 && this.defaultLng == 0) {
            this.defaultLat = child.latitude;
            this.defaultLng = child.longitude;
          }
        }
        this.buildLocation(
          child.latitude,
          child.longitude,
          child.displayText,
          '',
          child.companyProfileId,
        );
        if (child.mapInfoReports != undefined && child.mapInfoReports.length > 0) {
          this.handleLocation(
            child.mapInfoReports,
            child.latitude,
            child.longitude,
            child.displayText,
          );
        }
      });
      if (latPar === undefined && this.allCoordinates.length > 0) {
        this.fitMapToAllPolylines();
      }
    }
  }

  private fitMapToAllPolylines() {
    const bounds = new google.maps.LatLngBounds();

    this.allCoordinates.forEach(coord => {
      bounds.extend(coord);
    });

    // Fit map with some padding
    this.map.fitBounds(bounds, {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50
    });
  }
  private buildLocation(Lat, Lng, name, img, companyProfileId: string) {
    if (name !== 'Công Ty TNHH ADC') {
      let marker = new google.maps.Marker({
        position: new google.maps.LatLng(Lat, Lng),
        map: this.map,
        icon: {
          labelOrigin: new google.maps.Point(11, 35),
          url: 'assets/images/trace_marker.png',
          scaledSize: new google.maps.Size(20, 20),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(10, 8),
        },
        // label: {
        //   color: '#163c9e',
        //   fontWeight: 'bold',
        //   text: name,
        // },
        title: '',
      });

      this.listMarker.push(marker);
    }
  }

  private drawLine(lineCoordinates: any, color: string) {
    var linePath = new google.maps.Polyline({
      path: lineCoordinates,
      geodesic: true,
      strokeColor: color,
    });

    linePath.setMap(this.map);

    lineCoordinates.forEach((coord: any) => {
      this.allCoordinates.push(new google.maps.LatLng(coord.lat, coord.lng));
    });
  }

  onCompanyChange(companyProfileId: string) {
    if (companyProfileId === guiEmpty) {
      return;
    }
    const selectedCompany = this.findByCompanyProfileId(this.mapInfo, companyProfileId);
    if (selectedCompany) {
      const companyLocation = new google.maps.LatLng(
        selectedCompany?.latitude,
        selectedCompany?.longitude,
      );
      const selectedMarker: google.maps.Marker = this.listMarker.find(
        (marker: google.maps.Marker) => marker.getPosition()?.equals(companyLocation),
      );
      if (selectedMarker) {
        this.listMarker.forEach(marker => {
          marker.setIcon({
            labelOrigin: new google.maps.Point(11, 35),
            url: 'assets/images/trace_marker.png',
            scaledSize: new google.maps.Size(20, 20),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(10, 8),
          });
        });
        selectedMarker.setIcon({
          labelOrigin: new google.maps.Point(11, 35),
          url: 'assets/images/trace_marker_highlight.png',
          scaledSize: new google.maps.Size(40, 40),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(20, 20),
        });
      }

      this.map.panTo(companyLocation);
      this.map.setZoom(13);
    }
  }

  findByCompanyProfileId(
    reports: MapInfoReportV2[],
    profileId: string,
  ): MapInfoReportV2 | undefined {
    if (!reports) {
      return;
    }
    for (const report of reports) {
      if (report.companyProfileId === profileId) {
        return report;
      }
      if (report.mapInfoReports?.length) {
        const found = this.findByCompanyProfileId(report.mapInfoReports, profileId);
        if (found) return found;
      }
    }
    return undefined;
  }
}
