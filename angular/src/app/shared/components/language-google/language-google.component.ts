import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionStateService } from '@abp/ng.core';
import { ConfigStateService } from '@abp/ng.core';
import { NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-language-google',
  standalone: true,
  imports: [CommonModule, NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle],
  templateUrl: './language-google.component.html',
  styleUrls: ['./language-google.component.scss']
})
export class LanguageGoogleComponent implements AfterViewInit{
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

  ngAfterViewInit() {
    this.loadGoogleTranslateScript()
  }


  changeLanguage(lang: any) {
    this.triggerGoogleTranslate(lang.twoLetterISOLanguageName);
    this.lang = lang.twoLetterISOLanguageName
  }


  loadGoogleTranslateScript() {
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: this.lang },
        'google_translate_element'
      );
      setTimeout(() => {
        const translateButton = document.querySelector('.goog-te-menu-value');
        const dropdown = document.querySelector('.goog-te-menu2');

        if (translateButton) {
          translateButton.classList.add('btn', 'btn-outline-secondary');
        }

        if (dropdown) {
          dropdown.classList.add('dropdown-menu');
        }
      }, 1000);
    };
  }


  triggerGoogleTranslate(language: string) {
    const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = language;
      const event = new Event('change');
      selectElement.dispatchEvent(event);
    }
  }


}
