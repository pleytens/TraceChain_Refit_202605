import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// import { PdfService } from '../end-user/export-pdf/pdf.service';

@Component({
  selector: 'app-custom-layout-policy',
  templateUrl: './custom-layout-policy.component.html',
  styleUrls: ['./custom-layout-policy.component.scss']
})
export class CustomLayoutComponentPolicy implements OnInit {
  gs1Code: string;
  gtinCode: string;
  currentUrl: string = '';
  userType: number = null;
  isDownloading = false;

  constructor(private route: ActivatedRoute,
              // private pdfService: PdfService
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const docOld = params['doc'];
      const path = this.route.snapshot.routeConfig.children[0]?.path
      if (docOld == '992145577-1') {
        window.location.href = 'https://tracefish.traceverified.com/end-user/traceability-info?doc=992145577-1';
      }
      this.currentUrl = window.location.href;

      if (path === 't'){
        this.gs1Code = params['d'];
      } else if (path === 'p') {
        this.gtinCode = params['d'];
      }
      if (params['t']) {
        this.userType = params['t'];
      }
    });
  }

  downloadPDF() {
    // this.isDownloading = true;
     // this.pdfService.generatePdf(this.gs1Code, this.gtinCode, this.currentUrl).then(res => {
     //   if (res) {
     //     this.isDownloading = false;
     //   }
     // }) ;
  }

}
