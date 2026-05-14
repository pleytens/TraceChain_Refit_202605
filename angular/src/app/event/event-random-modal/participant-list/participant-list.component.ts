import { Component, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ConfigTableInterface } from '../../../shared/interfaces/system.interface';
import { Action, Types } from '../../../shared/common/constant.variable.model';
import { TableSelectComponent } from '../../../shared/components/table-select/table-select.component';
import { EventService } from '@proxy/traceverified/trace-farm/events';
import { SurveyInstance4ShowDto } from '@proxy/traceverified/trace-farm/events/surveys';

@Component({
  selector: 'app-participant-list',
  standalone: true,
  imports: [TableSelectComponent],
  templateUrl: './participant-list.component.html',
  styleUrl: './participant-list.component.scss',
})
export class ParticipantListComponent implements OnInit {
  @Input() eventId: string;
  @Output() eventInstanceSelected: EventEmitter<SurveyInstance4ShowDto[]> = new EventEmitter();
  @ViewChild('appTableSelect') tableSelect: TableSelectComponent;
  configTable: ConfigTableInterface = {
    Data: [],
    ColWidth: ['auto', 'auto', 'auto', 'auto', 'auto'],

    Action: [
      {
        Key: Action.Delete,
        Name: '::Delete',
        Icon: 'fa fa-trash text-white',
        Permission: 'TraceValue.Fertilizers.Delete',
      },
    ],
    Header: [
      { Key: 'email', Name: '::Minigame:Email' },
      { Key: 'phoneNumber', Name: '::Minigame:Phone' },
      { Key: 'fullName', Name: '::Minigame:Name' },
      {
        Key: 'billImageUrl',
        Name: '::Minigame:Order',
        IconContainerClass: 'bg-gray text-white',
        Icon: 'bi-camera-fill',
        Type: Types.Hover,
      },
      { Key: 'result', Name: '::Minigame:Result' },
      { Key: 'creationTime', Name: '::Minigame:CreatedTime', Type: Types.Date },
    ],
  };
  eventSurveyInstance: SurveyInstance4ShowDto[];
  selectedPaticipant = [];

  private eventService = inject(EventService);
  constructor() {}

  ngOnInit() {
    if (this.eventId) {
      this.getEventResult();
    }
  }

  getEventResult() {
    this.eventService.getSurveyInstances(this.eventId).subscribe({
      next: result => {
        const tableData = {
          items: result.items.map(item => ({
            ...item,
            billImageUrl: [item.billImageUrl],
          })),
        };
        this.tableSelect.setData(tableData.items, result.totalCount);
        this.eventSurveyInstance = result.items;
      },
    });
  }
  onSelectionChange(selection: any) {
    this.selectedPaticipant = this.eventSurveyInstance.filter(instance =>
      selection.includes(instance.id),
    );
    this.eventInstanceSelected.emit(this.selectedPaticipant);
  }
}
