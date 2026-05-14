import { Component, OnInit } from '@angular/core';
import { ListService, PagedResultDto } from '@abp/ng.core';
import { ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { FormBuilder } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { IMultiSelectSettings, IMultiSelectTexts } from 'ngx-bootstrap-multiselect';
import { LocalizationService } from '@abp/ng.core';
import { MarketService } from '@proxy/traceverified/trace-farm/markets';
import { ProductCategoryService } from '@proxy/traceverified/trace-farm/product-categories';

@Component({
  selector: 'app-stastistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.scss'],
  providers: [ListService],

})
export class StatisticComponent implements OnInit{
  fromdate: string;
  toDate: string;
  filterText: string = null;
  reportByData: any = {};
  multiSelectSetting: IMultiSelectSettings = {
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-light btn-block w-100 mw-100 font-weight-normal text-muted',
    itemClasses: 'w-100 mw-100',
    containerClasses: 'w-100 mw-100 dropdown-inline flex-fill',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
  };

  multiMarketSelectText: IMultiSelectTexts = {
    defaultTitle: this.localizationService.instant('::Market'),
  };
  multiCategorySelectText: IMultiSelectTexts = {
    defaultTitle: this.localizationService.instant('::Category'),
  };
  multiCompanySelectText: IMultiSelectTexts = {
    defaultTitle: this.localizationService.instant('::Company'),
  };
  catergoryData: any= {};
  marketData: any = {};
  companytData: any = {};

  constructor(
    public readonly list: ListService,
    private toaster: ToasterService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private localizationService: LocalizationService,
    private cdRef: ChangeDetectorRef,
    private marketService: MarketService,
    private categoryService: ProductCategoryService,

  ) {
    this.filterText = null;
  }
  ngOnInit(): void {
    this.getMarketData();
    this.getProductCategoryData();
    this.getReportByDropDownData();
    this.reportByData.selected = 1
    }


  filter($event: KeyboardEvent) {
    this.list.get();
  }

  filterDateChange() {
    this.list.get();
  }

  getProductCategoryData() {
    this.catergoryData.data = [];
    this.categoryService.getProductCategoryDropdown().subscribe(res => {
      this.catergoryData.data = res.items;
      this.cdRef.detectChanges();
    });
  }


  getMarketData() {
    this.marketData.data = [];
    this.marketService.getMarketDropdown().subscribe(res => {
      this.marketData.data = res.items;
      this.cdRef.detectChanges();
    });
  }

  convertDate(date: any) {
    let month = date.month.toString().padStart(2, '0');
    let day = date.day.toString().padStart(2, '0');
    return `${date.year}-${month}-${day}`;
  }

  getReportByDropDownData() {
    this.reportByData.data = [
      {
        id: 1,
        name: 'Report by date',
      },
      {
        id: 2,
        name: 'Report by month',
      },
      {
        id: 3,
        name: 'Report by Quarter',
      },
      {
        id: 4,
        name: 'Report by Year',
      },
    ];
  }

  eventReportBySelectHandle($event) {
    this.reportByData.selected = null
    if ($event.success) {
      this.reportByData.selected = $event.data.id
    } else {
      this.reportByData.selected = null
    }
  }

  findItemById(data: any[], id: any): any {
    return data.find(item => item.id === id) || {};
  }
}
