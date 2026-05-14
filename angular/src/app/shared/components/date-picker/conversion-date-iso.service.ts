import { Injectable } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root',
})
export class ConversionDateIsoService {
  ngbDateStructToIsoString(date: NgbDateStruct | null): string {
    if (
      !date ||
      typeof date.year !== 'number' ||
      typeof date.month !== 'number' ||
      typeof date.day !== 'number'
    ) {
      return;
    }
    const jsDate = new Date(Date.UTC(date.year, date.month - 1, date.day));
    return jsDate.toISOString();
  }

  isoStringToNgDateStruct(isoDate: string): NgbDateStruct {
    if (!isoDate) return;
    const objectDate = new Date(isoDate);
    return {
      year: objectDate.getFullYear(),
      month: objectDate.getMonth() + 1,
      day: objectDate.getDate(),
    };
  }
}
