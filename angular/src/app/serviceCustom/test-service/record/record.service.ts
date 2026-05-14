import { Injectable } from '@angular/core';
import { delay } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
import { RecordDto, RecordFilterDto } from './models';
@Injectable({
  providedIn: 'root',
})
export class MockRecordService {
  private records: RecordDto[] = [
    {
      id: '1',
      code: 'code1',
      profileName: '101',
      processId: '79152ae0-9394-952b-4b50-3a1031f8e41d',

      contractNumber: '123',
    },
    {
      id: '2',
      code: '103',
      profileName: 'hehe',
      processId: '2',
      contractNumber: '1234',
    },
  ];
  private shouldSimulateError: boolean = false;
  private profileName = [
    { id: '101', name: 'text' },
    { id: '102', name: 'dropdown' },
    { id: '103', name: 'date' },
    { id: '104', name: 'multi-dropdown' },
    { id: '105', name: 'number' },
    { id: '106', name: 'checkbox' },
    { id: '107', name: 'image' },
  ];
  getRecord(id: string) {
    const process = this.records.find(p => p.id === id);
    return of(process).pipe(delay(500));
  }
  getDone(id: string) {
    const process = this.records.find(p => p.id === id);
    return of(process).pipe(delay(500));
  }

  getListShare(filter: RecordFilterDto) {
    return of({ items: this.records, totalCount: this.records.length }).pipe(delay(500));
  }

  getListRecieve(filter: RecordFilterDto) {
    return of({ items: this.records, totalCount: this.records.length }).pipe(delay(500));
  }

  getListRecord(filter: RecordFilterDto) {
    return of({ items: this.records, totalCount: this.records.length }).pipe(delay(500));
  }

  getListDone(filter: RecordFilterDto) {
    return of({ items: this.records, totalCount: this.records.length }).pipe(delay(500));
  }
  createRecord(input: any) {
    const newStep: RecordDto = { id: (this.records.length + 1).toString(), ...input };
    this.records.push(newStep);
    return of(newStep).pipe(delay(500));
  }
  updateRecord(id: string, input: any) {
    // Simulate updating a process
    const recordIndex = this.records.findIndex(p => p.id === id);
    if (recordIndex !== -1) {
      this.records[recordIndex] = { ...this.records[recordIndex], ...input };
      return of(this.records[recordIndex]).pipe(delay(500));
    }
    return of(null).pipe(delay(500));
  }
  updateDone(id: string, input: any) {
    // Simulate updating a process
    const recordIndex = this.records.findIndex(p => p.id === id);
    if (recordIndex !== -1) {
      this.records[recordIndex] = { ...this.records[recordIndex], ...input };
      return of(this.records[recordIndex]).pipe(delay(500));
    }
    return of(null).pipe(delay(500));
  }
  delete(id: string) {
    // Simulate an error during the deletion process
    if (this.shouldSimulateError) {
      return throwError('Simulated deletion error');
    }

    // Simulate deleting a process
    const processIndex = this.records.findIndex(p => p.id === id);
    if (processIndex !== -1) {
      this.records.splice(processIndex, 1);
    }

    // Simulate a successful deletion with a delay
    return of(null).pipe(delay(500));
  }
  getProfileNameDropDown() {
    const profileName = Array.from(new Set(this.profileName));
    return of(profileName).pipe(delay(500));
  }
}
