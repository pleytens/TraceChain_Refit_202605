import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportQrCodeSharePerCustomerComponent } from './report-qr-code-share-per-customer.component';

describe('ReportQrCodeSharePerCustomerComponent', () => {
  let component: ReportQrCodeSharePerCustomerComponent;
  let fixture: ComponentFixture<ReportQrCodeSharePerCustomerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportQrCodeSharePerCustomerComponent]
    });
    fixture = TestBed.createComponent(ReportQrCodeSharePerCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
