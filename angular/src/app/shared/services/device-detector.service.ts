import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeviceDetectorService {
  private userAgent = window.navigator.userAgent;

  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(this.userAgent);
  }

  isTablet(): boolean {
    return /(iPad|tablet|Tablet)/i.test(this.userAgent);
  }

  isDesktop(): boolean {
    return !this.isMobile() && !this.isTablet();
  }

  getScreenSize(): {width: number, height: number} {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  getBrowserInfo(): string {
    return this.userAgent;
  }
}
