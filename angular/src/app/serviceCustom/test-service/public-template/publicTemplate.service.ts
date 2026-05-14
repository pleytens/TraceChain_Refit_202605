import { Injectable } from '@angular/core';
import { delay, findIndex } from 'rxjs/operators';
import { TemplateDto, TemplateFilterDto } from 'src/app/serviceCustom/test-service/public-template';
import { throwError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MockProcessService {
  private templates: TemplateDto[] = [
    {
      id: '79152ae0-9394-952b-4b50-3a1031f8e41d',
      name: 'Process 1',
      userType: '1',
    },
    {
      id: '2',
      name: 'Process 2',
      userType: '2',
    },
  ];
  private userType = [
    {
      id: '1',
      name: 'consumer',
    },
    {
      id: '2',
      name: 'partner',
    },
  ];

  private shouldSimulateError: boolean = true;

  getTemplate(id: string) {
    const template = this.templates.find(p => p.id === id);
    return of(template).pipe(delay(500));
  }

  getListTemplate(filter: TemplateFilterDto) {
    // For simplicity, return all processes without actual filtering
    return of({ items: this.templates, totalCount: this.templates.length }).pipe(delay(500));
  }

  createTemplate(input: any) {
    // Simulate creating a process
    const newTemplate: TemplateDto = {
      id: (this.templates.length + 1).toString(),
      ...input,
      steps: [],
    };
    this.templates.push(newTemplate);
    return of(newTemplate).pipe(delay(500));
  }

  updateTemplate(id: string, input: any) {
    // Simulate updating a process
    const templateIndex = this.templates.findIndex(p => p.id === id);
    if (templateIndex !== -1) {
      this.templates[templateIndex] = { ...this.templates[templateIndex], ...input };
      return of(this.templates[templateIndex]).pipe(delay(500));
    }
    return of(null).pipe(delay(500));
  }

  delete(id: string) {
    // Simulate an error during the deletion process
    if (this.shouldSimulateError) {
      return throwError('Simulated deletion error');
    }

    // Simulate deleting a process
    const processIndex = this.templates.findIndex(p => p.id === id);
    if (processIndex !== -1) {
      this.templates.splice(processIndex, 1);
    }

    // Simulate a successful deletion with a delay
    return of(null).pipe(delay(500));
  }
  getDataType() {
    const dataType = Array.from(new Set(this.userType));
    return of(dataType).pipe(delay(500));
  }

  // Add similar methods for steps as needed
}
