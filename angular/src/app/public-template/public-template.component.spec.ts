import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicTemplateComponent } from './public-template.component';

describe('PublicTemplateComponent', () => {
  let component: PublicTemplateComponent;
  let fixture: ComponentFixture<PublicTemplateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PublicTemplateComponent]
    });
    fixture = TestBed.createComponent(PublicTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
