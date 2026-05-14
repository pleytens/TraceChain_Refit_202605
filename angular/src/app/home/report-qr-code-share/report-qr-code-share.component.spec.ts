import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportQrCodeShareComponent } from './report-qr-code-share.component';

describe('ReportQrCodeShareComponent', () => {
  let component: ReportQrCodeShareComponent;
  let fixture: ComponentFixture<ReportQrCodeShareComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportQrCodeShareComponent]
    });
    fixture = TestBed.createComponent(ReportQrCodeShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
