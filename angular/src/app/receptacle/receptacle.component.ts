import { Component, OnInit } from '@angular/core';
import { ListService, PagedResultDto } from '@abp/ng.core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Confirmation, ConfirmationService, ToasterService } from '@abp/ng.theme.shared';
import {
  ReceptacleDto,
  ReceptacleFilterDto,
  ReceptacleService,
} from '@proxy/traceverified/trace-farm/companies';

@Component({
  selector: 'app-receptacle',
  templateUrl: './receptacle.component.html',
  styleUrls: ['./receptacle.component.scss'],
  providers: [ListService],
})
export class ReceptacleComponent implements OnInit {
  filterText: string = null;
  receptacle = { items: [], totalCount: 0 } as PagedResultDto<ReceptacleDto>;
  form: FormGroup;
  isModalOpen = false;
  selectedReceptacle = {} as ReceptacleDto;
  constructor(
    public readonly list: ListService,
    private receptacleService: ReceptacleService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private toasterService: ToasterService,
  ) {
    this.filterText = null;
  }
  ngOnInit(): void {
    const receptacleStreamCreator = query => {
      const filterModel = {} as ReceptacleFilterDto;
      filterModel.filter = this.filterText;
      filterModel.sorting = query.sorting;
      filterModel.skipCount = query.skipCount;
      filterModel.maxResultCount = query.maxResultCount;
      return this.receptacleService.getListCustom(filterModel);
    };
    this.list.hookToQuery(receptacleStreamCreator).subscribe(response => {
      this.receptacle = response;
    });
  }
  filter($event: any) {
    this.list.get();
  }
  createReceptacle() {
    this.selectedReceptacle = {} as ReceptacleDto;
    this.buildForm();
    this.isModalOpen = true;
  }

  buildForm() {
    this.form = this.fb.group({
      code: [this.selectedReceptacle.code || '', Validators.required],
      description: [this.selectedReceptacle.description || ''],
    });
  }
  openModal() {
    this.buildForm();
    this.isModalOpen = true;
  }
  edit(id: string) {
    this.receptacleService.get(id).subscribe(receptacle => {
      this.selectedReceptacle = receptacle;
      this.buildForm();
      this.isModalOpen = true;
    });
  }
  delete(id) {
    this.confirmation.warn('::AreYouSureToDelete', '::AreYouSure').subscribe(status => {
      if (status === Confirmation.Status.confirm) {
        this.receptacleService.delete(id).subscribe(() => {
          this.list.get();
          this.toasterService.success('::Delete:Success');
        });
      }
    });
  }
  save() {
    if (!this.form.valid) return;

    const { id } = this.selectedReceptacle || {};
    (id
      ? this.receptacleService.update(id, {
          ...this.selectedReceptacle,
          ...this.form.value,
        })
      : this.receptacleService.create({ ...this.form.value })
    )
      .pipe()
      .subscribe(() => {
        this.isModalOpen = false;
        this.form.reset();
        this.list.get();
        this.toasterService.success('::Success');
      });
  }
}
