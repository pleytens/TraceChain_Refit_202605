import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GuidService {

  private readonly GUID_KEY = 'user-guid';

  constructor() {}

  getGuid(): string {
    let guid = localStorage.getItem(this.GUID_KEY);

    if (!guid) {
      guid = this.generateGuid();
      localStorage.setItem(this.GUID_KEY, guid);
    }

    return guid;
  }

  /**
   * Generates a new GUID.
   */
  private generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
