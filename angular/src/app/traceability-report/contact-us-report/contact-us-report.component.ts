import { Component } from '@angular/core';
import {LocalizationModule} from "@abp/ng.core";

@Component({
  selector: 'app-contact-us-report',
  standalone: true,
    imports: [
        LocalizationModule
    ],
  templateUrl: './contact-us-report.component.html',
  styleUrls: ['./contact-us-report.component.scss']
})
export class ContactUsReportComponent {

}
