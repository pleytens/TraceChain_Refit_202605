import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ProductTraceabilityRoutingModule } from './product-traceability-routing.module';
import { ProductTraceabilityComponent } from './product-traceability/product-traceability.component';
import { LayoutsModule } from '../layouts/layouts.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { YouTubePlayerModule } from '@angular/youtube-player';
import {
  NgbNav,
  NgbNavContent,
  NgbNavItem,
  NgbNavItemRole,
  NgbNavLink,
  NgbNavLinkBase
} from '@ng-bootstrap/ng-bootstrap';
import { QuillEditorComponent } from 'ngx-quill';
import { TypeheadFocusComponent } from '../shared/components/typehead-focus/app-typehead-focus';
@NgModule({
  declarations: [ProductTraceabilityComponent],
  imports: [
    SharedModule,
    ProductTraceabilityRoutingModule,
    LayoutsModule,
    TabsModule,
    YouTubePlayerModule,
    CollapseModule,
    SlickCarouselModule,
    ModalModule.forRoot(),
    NgbNav,
    NgbNavContent,
    NgbNavItem,
    NgbNavItemRole,
    NgbNavLink,
    NgbNavLinkBase,
    QuillEditorComponent,
    TypeheadFocusComponent
  ]
})
export class ProductTraceabilityModule {}
