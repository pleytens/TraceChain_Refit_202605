import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RequestEdit {
  private editRequest = new Subject<void>();

  editRequest$ = this.editRequest.asObservable();

  requestEdit() {
    this.editRequest.next();
  }
}
