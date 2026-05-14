import { Component, OnInit } from '@angular/core';
import { ListService, PagedResultDto } from '@abp/ng.core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MarketDto, MarketService } from '@proxy/traceverified/trace-farm/markets';
import { RequestCustomDto } from '@proxy/traceverified/trace-farm/share';
import { ConfirmationService,Confirmation } from '@abp/ng.theme.shared';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss'],
  providers: [ListService]
})
export class MarketComponent implements OnInit {
  market = { items: [], totalCount: 0 } as PagedResultDto<MarketDto>;
  form: FormGroup;
  isModalOpen = false;
  selectedMarket = {} as MarketDto;
  filterText: string = null;

  constructor(
    public readonly list: ListService,
    private marketService: MarketService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService
  ) {
    this.filterText = null;
  }

  ngOnInit() {
    const marketStreamCreator = (query) => {
      const filterModel = {} as RequestCustomDto;
      filterModel.filter = this.filterText;
      filterModel.sorting = query.sorting;
      filterModel.skipCount = query.skipCount;
      filterModel.maxResultCount = query.maxResultCount;
      return this.marketService.getListCustom(filterModel);
    };

    this.list.hookToQuery(marketStreamCreator).subscribe((response) => {
      this.market = response;
    });
  }

  createMarket() {
    this.selectedMarket = {} as MarketDto;
    this.buildForm();
    this.isModalOpen = true;
  }

  editMarket(id) {
    this.marketService.get(id).subscribe((market) => {
      this.selectedMarket = market;
      this.buildForm();
      this.isModalOpen = true;
    });
  }

  buildForm() {
    this.form = this.fb.group({
      name: [this.selectedMarket.name || '', Validators.required]
    });
  }

  save() {
    if (this.form.invalid) {
      return;
    }
    const request = this.selectedMarket.id
      ? this.marketService.update(this.selectedMarket.id, this.form.value)
      : this.marketService.create(this.form.value);

    request.subscribe(() => {
      this.isModalOpen = false;
      this.form.reset();
      this.list.get();
    });
  }

  filter($event: KeyboardEvent) {
    if ($event.key === 'Enter'){
      this.list.get();
    }
  }

  deleteMarket(id) {
    this.confirmation.warn('::AreYouSureToDelete', '::AreYouSure').subscribe((status) => {
      if (status === Confirmation.Status.confirm) {
        this.marketService.delete(id).subscribe(() => this.list.get());
      }
    });
  }
}
