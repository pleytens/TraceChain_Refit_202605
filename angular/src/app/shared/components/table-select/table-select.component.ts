import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ThemeSharedModule } from '@abp/ng.theme.shared';
import { NgClass, NgForOf, NgStyle } from '@angular/common';
import { NgbActiveModal, NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { LocalizationModule } from '@abp/ng.core';
import { ConfigTableInterface } from '../../interfaces/system.interface';
import { FormatDataPipe } from '../../common/format-table-data';
import { ViewImageModalComponent } from './view-image-modal/view-image-modal.component';
import { Types } from '../../common/constant.variable.model';

@Component({
  selector: 'app-table-select',
  standalone: true,
  imports: [
    ThemeSharedModule,
    NgForOf,
    LocalizationModule,
    NgStyle,
    NgbPagination,
    NgClass,
    FormatDataPipe,
  ],
  templateUrl: './table-select.component.html',
  styleUrl: './table-select.component.scss',
})
export class TableSelectComponent {
  @Input() configTable: ConfigTableInterface;
  @Input() list: any;
  @Output() actionClicked = new EventEmitter<any>();
  @Output() selectionChanged = new EventEmitter<string[]>();
  @Output() sort = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<any>();

  dataTable: any[];
  pageItems: any[];
  totalPage = 0;
  pageSize = 10;
  currentPage = 1;
  isShowSearch = true;
  sortedColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedIds = [];
  modalService = inject(NgbModal);
  constructor() {
    this.dataTable = [];
  }

  setData(data: any[], total: number) {
    this.configTable.Data = this.dataTable = data;
    data
      .filter(item => item.isSelected)
      .forEach(item => {
        this.selectedIds.push(item.id);
      });
    this.totalPage = total;
    if (this.configTable.IsShowSearch != null) {
      this.isShowSearch = this.configTable.IsShowSearch;
    }
    this.updatePage();
  }

  isSort(columnKey: string) {
    return this.sortedColumn === columnKey;
  }

  eventSortChanged(columnKey: string) {
    if (this.sortedColumn === columnKey) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortedColumn = columnKey;
      this.sortDirection = 'asc';
    }

    this.sort.emit({
      columnKey: columnKey,
      data: `${columnKey} ${this.sortDirection}`,
    });
  }

  onPageChanged(page: number) {
    this.currentPage = page;
    this.updatePage();
  }

  openImageModal(imgSrc) {
    const viewImageModalRef = this.modalService.open(ViewImageModalComponent, {
      size: 'lg',
    });
    viewImageModalRef.componentInstance.imgSrc = imgSrc;
  }

  updatePage() {
    const startPage = (this.currentPage - 1) * this.pageSize;
    this.pageItems = this.dataTable.slice(startPage, startPage + this.pageSize);
  }

  getNestedValue(obj: any, key: string): any {
    return key.split('.').reduce((acc, part) => acc && acc[part], obj) ?? '';
  }

  onCheckBoxSelect($event: Event, selectedId: any) {
    const isChecked = ($event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedIds.push(selectedId);
    } else {
      this.selectedIds = this.selectedIds.filter(itemId => itemId !== selectedId);
    }

    this.selectionChanged.emit(this.selectedIds);
  }

  onSelectAll($event: Event) {
    const isChecked = ($event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.selectedIds = this.dataTable.map(item => item.id);
    } else {
      this.selectedIds = [];
    }
    this.selectionChanged.emit(this.selectedIds);
  }

  isSelectAll() {
    return this.selectedIds.length === this.dataTable.length;
  }

  protected readonly Types = Types;
}
