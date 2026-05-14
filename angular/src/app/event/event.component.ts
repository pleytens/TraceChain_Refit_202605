import { Component, Inject, OnInit } from '@angular/core';
import { ListService, PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { EventDto, EventService, EventShowDto } from '@proxy/traceverified/trace-farm/events';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventModalComponent } from './event-modal/event-modal.component';
import { ProductService } from '@proxy/traceverified/trace-farm/product-managements';
import { GuiEmpty } from '../shared/common/constant.variable.model';
import { Confirmation, ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import { EventRandomModalComponent } from './event-random-modal/event-random-modal.component';
@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  providers: [ListService],
})
export class EventComponent implements OnInit {
  filterText: string = '';
  eventList: PagedResultDto<EventShowDto>;
  productData = [];

  constructor(
    private modalService: NgbModal,
    public readonly list: ListService,
    private eventService: EventService,
    private productService: ProductService,
    private confirmation: ConfirmationService,
    private toaster: ToasterService
  ) {}
  ngOnInit() {
    this.getEventList();
    this.getProductData();
  }

  getEventList() {
    const eventStreamCreator = query => {
      const filterPayload: PagedAndSortedResultRequestDto = {
        sorting: '',
        skipCount: query.skipCount,
        maxResultCount: query.maxResultCount,
      };

      return this.eventService.getListCustom(filterPayload);
    };

    this.list.hookToQuery(eventStreamCreator).subscribe({
      next: res => {
        this.eventList = res;
      },
    });
  }

  getProductData() {
    this.productData = [];
    this.productService.getProductDropdown().subscribe(res => {
      this.productData = res.items;
    });
  }

  findItemById(data: any[], id: string): any {
    if (data.length <= 0 || id === GuiEmpty) return;
    return data.find(item => item.id === id)?.name;
  }

  openEventModal(eventId?: string) {
    const eventModalRef = this.modalService.open(EventModalComponent, { size: 'xl' });
    if (eventId) {
      eventModalRef.componentInstance.eventId = eventId;
    }
    eventModalRef.closed.subscribe({
      complete: () => {
        this.list.get();
      },
    });
  }

  openRandomModal(eventId?: string) {
    const randomModalRef = this.modalService.open(EventRandomModalComponent, { size: 'lg' });
    if (eventId) {
      randomModalRef.componentInstance.eventId = eventId;
    }
    randomModalRef.closed.subscribe({
      complete: () => {
        this.list.get();
      },
    });
  }

  deleteEvent(id) {
    this.confirmation.warn('::AreYouSureToDelete', '::AreYouSure').subscribe(status => {
      if (status === Confirmation.Status.confirm) {
        this.eventService.deleteEventWithQuestions(id).subscribe({
          next: () => {
            this.list.get();
            this.toaster.success('::Delete:Success');
          },
        });
      }
    });
  }

  filter() {}
}
