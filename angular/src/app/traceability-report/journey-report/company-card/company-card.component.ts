import {
  AfterViewInit,
  Component,
  ElementRef, HostListener,
  Input,
  OnInit,
  QueryList, ViewChild,
  ViewChildren
} from '@angular/core';
import { CarouselMapService } from '../../share/carousel-navigate.service';
import { LocalizationModule } from '@abp/ng.core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import {
  CompanyCardInfoDto,
  ReportService,
} from '@proxy/traceverified/trace-farm/traceability-records-v2';

const guiEmpty = '00000000-0000-0000-0000-000000000000'; // empty guid
@Component({
  selector: 'app-company-card',
  standalone: true,
  imports: [LocalizationModule, NgForOf, NgIf, DatePipe],
  templateUrl: './company-card.component.html',
  styleUrls: ['./company-card.component.scss'],
})
export class CompanyCardComponent implements OnInit, AfterViewInit {
  @ViewChildren('cardEl', { read: ElementRef }) cardEls!: QueryList<ElementRef>;
  @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef<HTMLDivElement>;
  @Input() traceCode: string;
  @Input() userType: number;
  nodeInfo: CompanyCardInfoDto[];
  activeCompanyId: string | null = null;
  private observer!: IntersectionObserver;
  private isScrolling = false;
  constructor(
    private carouselService: CarouselMapService,
    private reportService: ReportService,
  ) {}

  ngOnInit() {
    if (this.traceCode) {
      this.getCompanyInfo(this.traceCode, this.userType);
    }
  }

  ngAfterViewInit() {
    this.updateActiveCard()
    this.scrollContainer.nativeElement.addEventListener('scroll', () => {
      if (!this.isScrolling) {
        this.updateActiveCard();
      }
    });
    setTimeout(() => this.updateActiveCard(), 0);
    this.cardEls.changes.subscribe(() => {
      this.updateActiveCard();
    });
  }

  @HostListener('scroll', ['$event'])
  onScroll() {
    if (!this.isScrolling) {
      this.updateActiveCard();
    }
  }

  private updateActiveCard() {
    if (!this.cardEls || !this.cardEls.length) return;

    const scrollHost = this.scrollContainer.nativeElement as HTMLElement;
    const scrollLeft = scrollHost.scrollLeft;
    const maxScroll = scrollHost.scrollWidth - scrollHost.clientWidth;

    if (Math.abs(scrollLeft - maxScroll) < 5) {
      const lastCard = this.cardEls.last;
      const id = lastCard.nativeElement.getAttribute('id');
      if (id && this.activeCompanyId !== id) {
        this.activeCompanyId = id;
        this.onChangeCompany(id);
        this.cardEls.forEach(c => c.nativeElement.classList.remove('active'));
        lastCard.nativeElement.classList.add('active');
      }
      return;
    }

    let closestCard: ElementRef | null = null;
    let minDistance = Infinity;

    this.cardEls.forEach(card => {
      const cardEl = card.nativeElement as HTMLElement;
      const cardLeft = cardEl.offsetLeft;
      const distance = Math.abs(cardLeft - scrollLeft);

      if (distance < minDistance) {
        minDistance = distance;
        closestCard = card;
      }
    });

    if (closestCard) {
      const id = closestCard.nativeElement.getAttribute('id');
      const index = closestCard.nativeElement.getAttribute('data-index');
      if (id && this.activeCompanyId !== id) {
        this.activeCompanyId = id;
        const traceCode = this.getTraceCodeByCardId(this.activeCompanyId);
        if (traceCode) {
          this.carouselService.changeCompanyDiary(traceCode);
        } else {
          this.carouselService.changeCompanyDiary('none')
        }
        this.onChangeCompany(id);
        this.cardEls.forEach(c => c.nativeElement.classList.remove('active'));
        closestCard.nativeElement.classList.add('active');
      }
    }
  }

  private getTraceCodeByCardId(cardId: string): string | null {
    const company = this.nodeInfo.find(c => c.companyProfileId === cardId);
    return company ? company.traceabilityCode : null;
  }

  getCompanyInfo(traceCode: string, userType: number) {
    this.reportService.getReportCompanyInfoByTraceCodeAndUserType(traceCode, userType).subscribe({
      next: res => {
        this.nodeInfo = res.items;
      },
    });
  }

  onChangeCompany(companyProfileId: any) {
    if (companyProfileId !== guiEmpty) {
      this.carouselService.navigateToSlide(companyProfileId);
    }
  }

  onClickCompany(traceCode: string, index: number, event: Event) {
    const clickedCard = (event.currentTarget as HTMLElement);
    this.scrollToCard(clickedCard, index);

    if (traceCode) {
      this.carouselService.changeCompanyDiary(traceCode);
    } else {
      this.carouselService.changeCompanyDiary('none');
    }
  }

  private scrollToCard(cardElement: HTMLElement, index: number) {
    this.isScrolling = true;
    const scrollHost = this.scrollContainer.nativeElement;
    const cardId = cardElement.getAttribute('id');

    cardElement.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start'
    });

    if (cardId && this.activeCompanyId !== cardId) {
      this.activeCompanyId = cardId;
      this.onChangeCompany(cardId);
      this.cardEls.forEach(c => c.nativeElement.classList.remove('active'));
      cardElement.classList.add('active');
    }

    setTimeout(() => {
      this.isScrolling = false;
    }, 500);
  }
}
