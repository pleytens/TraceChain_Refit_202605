import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionStateService } from '@abp/ng.core';
import { ConfigStateService } from '@abp/ng.core';
import { NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-language',
  standalone: true,
  imports: [CommonModule, NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle],
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss'],
})
export class LanguageComponent {
  public language: boolean = false;
  public lang: any;
  public langList: any;

  constructor(
    private sessionState: SessionStateService,
    private config: ConfigStateService
  ) {
    this.lang = this.sessionState.getLanguage();
    this.langList = this.config.getDeep('localization.languages');
  }

  changeLanguage(lang: any) {
    this.sessionState.setLanguage(lang.twoLetterISOLanguageName);
  }

  getFlagClass(code: any): string {
    if (code === 'en') {
      code = 'gb';
    }
    if (code === 'vi') {
      code = 'vn';
    }
    return `flag-icon flag-icon-${code}`;
  }
}
