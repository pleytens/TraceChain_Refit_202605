import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { merge, Observable, OperatorFunction, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, filter } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { DropdownItemBaseDto } from '@proxy/traceverified/trace-farm/share';
import { NgbTypeahead, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-typehead-focus-custom',
  standalone: true,
  imports: [NgbTypeaheadModule, FormsModule, JsonPipe],
  templateUrl: './app-typehead-focus.html',
  styles: [
    `
      .form-control {
        width: 100%;
      }
      ::ng-deep .input-group {
        flex-wrap: nowrap;
      }
      ::ng-deep ngb-typeahead-window.dropdown-menu {
        overflow-y: auto !important;
      }
    `,
  ],
})
export class TypeheadFocusCustom implements OnInit {
  @Input() dataInput: any;
  @Input() placeholder: string = ''; // Add this line with a default value
  @Input() initialSelected: DropdownItemBaseDto;
  @Input() disabled: boolean = false;
  @Input() id: any;

  public model: DropdownItemBaseDto = {};
  @Output() dataReturn = new EventEmitter<any>();
  formatter = (state: DropdownItemBaseDto) => state.name;
  @ViewChild('instance', { static: true }) instance: NgbTypeahead;

  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  ngOnInit(): void {
    this.placeholder = this.placeholder;
    if (this.dataInput.selected) {
      this.model = this.dataInput.selected;
    }
    this.initializeModel();
  }

  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term =>
        (term === ''
          ? this.dataInput
          : this.dataInput.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1)
        ).slice(0, 100)
      )
    );
  };

  private initializeModel() {
    if (this.dataInput.selected) {
      this.model = this.dataInput.selected;
    } else if (this.initialSelected) {
      this.model = this.initialSelected;
    }
  }
  modelChange() {
    if (this.model.id) {
      this.dataReturn.emit({
        success: true,
        data: this.model,
      });
    } else {
      this.dataReturn.emit({
        success: false,
        data: null,
      });
    }
  }

  clearTypeahead() {
    this.model = {} as DropdownItemBaseDto;
  }
}
