import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StastisticComponent } from './statistic.component';

describe('StastisticComponent', () => {
  let component: StastisticComponent;
  let fixture: ComponentFixture<StastisticComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StastisticComponent]
    });
    fixture = TestBed.createComponent(StastisticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
