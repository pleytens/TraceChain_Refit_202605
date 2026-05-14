import { Injectable } from '@angular/core';
import { delay, findIndex } from 'rxjs/operators';
import {
  ProcessDto,
  StepDto,
  ProcessFilterDto,
  FieldDto,
} from 'src/app/serviceCustom/test-service/process';
import { throwError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MockProcessService {
  private processes: ProcessDto[] = [
    {
      id: '79152ae0-9394-952b-4b50-3a1031f8e41d',
      name: 'Process 1',
      note: 'Note 1',
    },
    {
      id: '2',
      name: 'Process 2',
      note: 'Note 2',
      steps: [],
    },
  ];

  private steps: StepDto[] = [
    {
      id: '1',
      processId: '79152ae0-9394-952b-4b50-3a1031f8e41d',
      name: 'Step 1',
      description: 'Description 1',
      receptacle: '101',
      userTagId: ['6b72f566-8c38-58c6-9434-3a0e4e33b4df', '4cfb835f-6561-9de6-8fd5-3a0f8deff19a'],
    },
    {
      id: '2',
      processId: '1',

      name: 'Step 2',
      description: 'Description 2',
      receptacle: '101',
      userTagId: ['4cfb835f-6561-9de6-8fd5-3a0f8deff19a', '4cfb835f-6561-9de6-8fd5-3a0f8deff19a'],
    },
    {
      id: '3',
      processId: '1',

      name: 'Step 3',
      description: 'Description 2',
      receptacle: '101',
      userTagId: ['4cfb835f-6561-9de6-8fd5-3a0f8deff19a', '4cfb835f-6561-9de6-8fd5-3a0f8deff19a'],
    },
    {
      id: '4',
      processId: '1',

      name: 'Step 4',
      description: 'Description 2',
      receptacle: '101',
      userTagId: ['4cfb835f-6561-9de6-8fd5-3a0f8deff19a', '4cfb835f-6561-9de6-8fd5-3a0f8deff19a'],
    },
    {
      id: '5',
      processId: '1',

      name: 'Step 5',
      description: 'Description 2',
      receptacle: '101',
      userTagId: ['4cfb835f-6561-9de6-8fd5-3a0f8deff19a', '4cfb835f-6561-9de6-8fd5-3a0f8deff19a'],
    },
  ];

  private field: FieldDto[] = [
    {
      fieldName: 'nghiavu',
      dataType: '1',
      options: [
        { id: '1', name: 'hehe' },
        { id: '2', name: 'haha' },
      ],
      stepId: '1',
    },
    {
      fieldName: 'nghiavu2',
      dataType: '1',
      options: ['haha', 'huhu'],
      stepId: '1',
    },
    { fieldName: 'nghiavu2', dataType: '3', options: ['101', '102'], stepId: '1' },
    { fieldName: 'nghiavu3', dataType: '5', options: [], stepId: '1' },
    {
      fieldName: 'nghiavu2',
      dataType: '2',
      options: [{ id: '1', name: 'hehe' }, 'haha', 'huhu'],
      stepId: '1',
    },
    { fieldName: 'nghiavu', dataType: '4', options: [2, 3], stepId: '1' },
    { fieldName: 'nghiavu', dataType: '6', options: [], stepId: '1' },
  ];
  private receptacleData = [
    { id: '101', name: 'Receptacle A' },
    { id: '102', name: 'Receptacle B' },
    { id: '103', name: 'Receptacle C' },
    { id: '104', name: 'Receptacle D' },
    // Add more sample data as needed
  ];
  private dataType = [
    { id: '1', name: 'Dropdown' },
    { id: '2', name: 'MultiDropdown' },
    { id: '3', name: 'Text' },
    { id: '4', name: 'Number' },
    { id: '5', name: 'DateTime' },
    { id: '6', name: 'Image ' },
  ];
  private shouldSimulateError: boolean = true;

  getProcess(id: string) {
    const process = this.processes.find(p => p.id === id);
    return of(process).pipe(delay(500));
  }

  getAllProcess() {
    const process = this.processes;
    return of(process);
  }
  getStep(processId: string) {
    const filteredSteps = this.steps ? this.steps.filter(step => step.processId === processId) : [];
    if (filteredSteps.length > 0) {
      return of(filteredSteps).pipe(delay(500));
    }
    return of(null).pipe(delay(500));
  }

  getField(stepId: string) {
    const filteredField = this.field ? this.field.filter(step => step.stepId === stepId) : [];
    if (filteredField.length > 0) {
      return of(filteredField).pipe(delay(500));
    }
    return of(null).pipe(delay(500));
  }

  getListProcess(filter: ProcessFilterDto) {
    // For simplicity, return all processes without actual filtering
    return of({ items: this.processes, totalCount: this.processes.length }).pipe(delay(500));
  }

  getListStep(id: string) {
    // Find the process with the given ID
    const process = this.processes.find(p => p.id === id);

    if (process) {
      // Return the steps if the process is found
      return of({ items: process.steps, totalCount: process.steps.length }).pipe(delay(500));
    } else {
      // Handle the case when the process with the given ID is not found
      console.error(`Process with ID ${id} not found.`);
      return of({ items: [], totalCount: 0 }).pipe(delay(500));
    }
  }
  createProcess(input: any) {
    // Simulate creating a process
    const newProcess: ProcessDto = {
      id: (this.processes.length + 1).toString(),
      ...input,
      steps: [],
    };
    this.processes.push(newProcess);
    return of(newProcess).pipe(delay(500));
  }

  createStep(input: any, processId: string) {
    // Simulate creating a process
    const processIndex = this.processes.findIndex(p => p.id === processId);
    const newStep: StepDto = {
      id: (this.processes[processIndex].steps.length + 1).toString(),
      ...input,
    };
    this.processes[processIndex].steps.push(newStep);
    return of(newStep).pipe(delay(500));
  }

  updateProcess(id: string, input: any) {
    // Simulate updating a process
    const processIndex = this.processes.findIndex(p => p.id === id);
    if (processIndex !== -1) {
      this.processes[processIndex] = { ...this.processes[processIndex], ...input };
      return of(this.processes[processIndex]).pipe(delay(500));
    }
    return of(null).pipe(delay(500));
  }

  updateStep(id: string, processId: string, input: any) {
    // Simulate updating a process
    const process = this.processes.find(p => p.id === processId);
    const processIndex = this.processes.findIndex(p => p.id === processId);

    const stepIndex = process.steps.findIndex(s => s.id === id);
    if (stepIndex !== -1) {
      this.processes[processIndex].steps[stepIndex] = {
        ...this.processes[processIndex].steps[stepIndex],
        ...input,
      };
      return of(this.processes[processIndex].steps[stepIndex]).pipe(delay(500));
    }
    return of(null).pipe(delay(500));
  }

  delete(id: string) {
    // Simulate an error during the deletion process
    if (this.shouldSimulateError) {
      return throwError('Simulated deletion error');
    }

    // Simulate deleting a process
    const processIndex = this.processes.findIndex(p => p.id === id);
    if (processIndex !== -1) {
      this.processes.splice(processIndex, 1);
    }

    // Simulate a successful deletion with a delay
    return of(null).pipe(delay(500));
  }

  deleteStep(stepId: string, processId: string) {
    const processIndex = this.processes.findIndex(p => p.id === processId);

    if (processIndex !== -1) {
      const process = this.processes[processIndex];
      const stepIndex = process.steps.findIndex(step => step.id === stepId);
      const updatedSteps = process.steps.splice(stepIndex, 1);
    }

    return of(null).pipe(delay(500));
  }

  getReceptacleDropDown() {
    // Simulate fetching receptacle dropdown data
    const receptacleDropDownData = Array.from(new Set(this.receptacleData));

    // Return an observable with a delay
    return of(receptacleDropDownData).pipe(delay(500));
  }

  getDataType() {
    const dataType = Array.from(new Set(this.dataType));
    return of(dataType).pipe(delay(500));
  }

  // Add similar methods for steps as needed
}
