import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LocalizationModule, RootCoreModule } from '@abp/ng.core';
import { NgIf } from '@angular/common';
import { MapReportComponent } from '../share/map-report/map-report.component';
import { CompanyCardComponent } from './company-card/company-card.component';
import { QuillViewComponent } from 'ngx-quill';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { DiaryReportComponent } from '../diary-report/diary-report.component';

@Component({
  selector: 'app-journey-report',
  standalone: true,
  imports: [
    LocalizationModule,
    NgIf,
    RootCoreModule,
    MapReportComponent,
    CompanyCardComponent,
    QuillViewComponent,
    NgbCollapse,
    DiaryReportComponent,
  ],
  templateUrl: './journey-report.component.html',
  styleUrls: ['./journey-report.component.scss'],
})
export class JourneyReportComponent implements OnInit {
  @Input() traceCode = '';
  @Input() userType: number;
  @Input() lotId: string = '';
  @Input() gtin: string = '';
  @Output() lotIdEmit = new EventEmitter<string>();
  traceCodeTyping = '';
  isInputLotId: boolean = false;
  constructor() {}

  ngOnInit() {
    if (this.gtin) {
      this.isInputLotId = true;
    }
  }

  traceCodeEnter() {
    this.lotId = this.traceCodeTyping;
    this.lotIdEmit.emit(this.traceCodeTyping);
    this.isInputLotId = false;
  }
}
