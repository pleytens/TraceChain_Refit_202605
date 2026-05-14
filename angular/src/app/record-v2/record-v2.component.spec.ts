import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordV2Component } from './record-v2.component';

describe('RecordV2Component', () => {
  let component: RecordV2Component;
  let fixture: ComponentFixture<RecordV2Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecordV2Component]
    });
    fixture = TestBed.createComponent(RecordV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
