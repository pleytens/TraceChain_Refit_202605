import { SharedModule } from '../shared/shared.module';
import { NgModule } from '@angular/core';
import { TraceabilityReportRoutingModule } from './traceability-report-routing.module';
import { LocalizationModule } from '@abp/ng.core';
import { TraceabilityReportComponent } from './traceability-report.component';
import { SelectLanguageComponent } from './select-language/select-language.component';
import { JourneyReportComponent } from './journey-report/journey-report.component';
import { ProductReportComponent } from './product-report/product-report.component';
import { CompanyReportComponent } from './company-report/company-report.component';
import { ContactUsReportComponent } from './contact-us-report/contact-us-report.component';
import { MapReportComponent } from './share/map-report/map-report.component';
import { NgbCollapse, NgbCollapseModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { DiaryReportComponent } from './diary-report/diary-report.component';
import { EventMinigameComponent } from './event-mini-game/event-minigame.component';
import { NgOptimizedImage } from '@angular/common';
@NgModule({
  declarations: [TraceabilityReportComponent],
  imports: [
    NgbNavModule,
    SharedModule,
    TraceabilityReportRoutingModule,
    LocalizationModule,
    SelectLanguageComponent,
    JourneyReportComponent,
    ProductReportComponent,
    CompanyReportComponent,
    ContactUsReportComponent,
    MapReportComponent,
    DiaryReportComponent,
    EventMinigameComponent,
    NgOptimizedImage,
    NgbCollapseModule,
  ],
  providers: [],
})
export class TraceabilityReportModule {}
