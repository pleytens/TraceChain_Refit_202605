import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CarouselMapService {
  private slideKeySubject = new Subject<string>();
  private traceCodeSubject = new Subject<string>();
  slideKey$ = this.slideKeySubject.asObservable();
  traceCode$ = this.traceCodeSubject.asObservable().pipe(distinctUntilChanged());

  navigateToSlide(key: string) {
    this.slideKeySubject.next(key);
  }

  changeCompanyDiary(key: string) {
    this.traceCodeSubject.next(key);
  }
}
