import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { ReportScanTraceCodeService } from '@proxy/traceverified/trace-farm/user-interactions';

@Component({
  selector: 'app-map-location-report',
  standalone: true,
  imports: [],
  templateUrl: './map-location-report.component.html',
  styleUrl: './map-location-report.component.scss',
})
export class MapLocationReportComponent implements OnInit {
  map: google.maps.Map;
  clusterer: any;
  router = inject(ActivatedRoute);
  reportScanTraceCodeService = inject(ReportScanTraceCodeService);
  productId: string;
  traceabilityCode: string;
  listMarker = [];
  googleMarkers: google.maps.Marker[] = [];

  constructor() {}

  ngOnInit() {
    this.router.queryParams.subscribe(params => {
      if (params['productId']) {
        this.productId = params['productId'];
        this.getLocationsByProductId(this.productId);
      } else if (params['traceabilityCode']) {
        this.traceabilityCode = params['traceabilityCode'];
        this.getLocationsByTraceabilityCode(this.traceabilityCode);
      }
    });
    this.initMap(10.7896612, 106.6940754).then(() => {
      this.createClusterer();
    });
  }

  getLocationsByProductId(productId: string) {
    if (!productId) {
      return;
    }
    this.reportScanTraceCodeService.getLatLongInMapByProductIdByProductId(productId).subscribe({
      next: result => {
        if (result && result.length > 0) {
          this.listMarker = result;
          this.loadMarkers();
        }
      },
    });
  }

  getLocationsByTraceabilityCode(traceabilityCode: string) {
    if (!traceabilityCode) {
      return;
    }
    this.reportScanTraceCodeService
      .getLatLongInMapByTraceabilityCodeByTraceabilityCode(traceabilityCode)
      .subscribe({
        next: result => {
          if (result && result.length > 0) {
            this.listMarker = result;
            this.loadMarkers();
          }
        },
      });
  }

  private async initMap(lat: number, long: number) {
    try {
      let mapProp = {
        center: new google.maps.LatLng(lat, long),
        zoom: 6,
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
      this.map = new Map(document.getElementById('googleMap') as HTMLElement, mapProp);

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

  createClusterer() {
    this.clusterer = new MarkerClusterer({ map: this.map });
  }

  loadMarkers() {
    if (!this.map || !this.listMarker?.length) return;

    const bounds = new google.maps.LatLngBounds();

    const markers: google.maps.Marker[] = this.listMarker
      .filter(m => m.latitude && m.longitude) // skips null, undefined, 0
      .map(m => {
        const position = { lat: m.latitude, lng: m.longitude };
        bounds.extend(position);

        return new google.maps.Marker({
          position,
          icon: 'assets/icons/map_report_marker.png',
        });
      });

    this.googleMarkers = markers;

    if (this.clusterer) {
      this.clusterer.clearMarkers();
    }

    this.clusterer = new MarkerClusterer({ map: this.map, markers });

    this.map.fitBounds(bounds);
  }
}
