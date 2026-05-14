import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptacleComponent } from './receptacle.component';

describe('ReceptacleComponent', () => {
  let component: ReceptacleComponent;
  let fixture: ComponentFixture<ReceptacleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReceptacleComponent]
    });
    fixture = TestBed.createComponent(ReceptacleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
