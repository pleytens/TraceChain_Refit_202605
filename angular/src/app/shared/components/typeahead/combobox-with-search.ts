import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, filter } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { DropdownItemBaseDto } from '@proxy/traceverified/trace-farm/share';


@Component({
  selector: 'combobox-with-search',
  standalone: true,
  imports: [NgbTypeaheadModule, FormsModule, JsonPipe],
  templateUrl: './combobox-with-search.html',
  styles: [
    `.form-control {
        width: 100%;
      }
    `,
  ],
})
export class ComboboxWithSearch implements OnInit {
  @Input() dataInput: any;
  public model: DropdownItemBaseDto;
  @Output() dataReturn = new EventEmitter<any>();
  placehoder= 'Company';
  formatter = (state: DropdownItemBaseDto) => state.name;

  ngOnInit(): void {
    // this.model = this.dataInput[0];
    this.placehoder = this.dataInput.placehoder?this.dataInput.placehoder:'';
    if (this.dataInput.selected){
      this.model = this.dataInput.selected;
    }
  }
  search: OperatorFunction<string, readonly { id; name }[]> = (text$: Observable<string>) => {
    return text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      filter((term) => term.length >= 0),
      map((term) => {
        return term=== ''? this.dataInput.data :  this.dataInput.data.filter((state) => {
          return new RegExp(term, 'mi').test(state.name);
        }).slice(0, 10);
      })
    );
  };
  modelChange() {
    if (this.model){
      this.dataReturn.emit({
        success:true,
        data:this.model
      })
    }else {
      this.dataReturn.emit({
        success:false,
        data:null,
      })
    }

  }
}
