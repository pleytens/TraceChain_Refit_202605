import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GenQrCodeFormComponent } from './gen-qr-code-form.component';


describe('ReportQrCodeShareComponent', () => {
  let component: GenQrCodeFormComponent;
  let fixture: ComponentFixture<GenQrCodeFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenQrCodeFormComponent]
    });
    fixture = TestBed.createComponent(GenQrCodeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
