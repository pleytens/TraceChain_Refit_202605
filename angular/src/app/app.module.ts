import { AccountConfigModule } from '@abp/ng.account/config';
import { CoreModule } from '@abp/ng.core';
import { registerLocale } from '@abp/ng.core/locale';
import { storeLocaleData } from '@abp/ng.core/locale';
import { registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';

registerLocaleData(localeVi);

import localeEn from '@angular/common/locales/en';

registerLocaleData(localeEn);
import(
  /* webpackChunkName: "_locale-your-locale-js"*/
  /* webpackMode: "eager" */
  '@angular/common/locales/km'
).then(m => storeLocaleData(m.default, 'km'));
import(
  /* webpackChunkName: "_locale-your-locale-js"*/
  /* webpackMode: "eager" */
  '@angular/common/locales/vi'
).then(m => storeLocaleData(m.default, 'vi'));

import(
  '@angular/common/locales/en'
  ).then(m => storeLocaleData(m.default, 'en'));
import { IdentityConfigModule } from '@abp/ng.identity/config';
import { SettingManagementConfigModule } from '@abp/ng.setting-management/config';
import { TenantManagementConfigModule } from '@abp/ng.tenant-management/config';
import { eThemeLeptonXComponents, ThemeLeptonXModule } from '@abp/ng.theme.lepton-x';
import { SideMenuLayoutModule } from '@abp/ng.theme.lepton-x/layouts';
import { eThemeSharedRouteNames, ThemeSharedModule } from '@abp/ng.theme.shared';
import { inject, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { APP_ROUTE_PROVIDER } from './route.provider';
import { FeatureManagementModule } from '@abp/ng.feature-management';
import { AbpOAuthModule } from '@abp/ng.oauth';
import { AccountModule } from './account/account.module';
import { CustomDateParserFormatter } from './shared/components/date-picker/custom-parser-formatter.service';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';

import { APP_INITIALIZER } from '@angular/core';
import { ReplaceableComponentsService } from '@abp/ng.core';
import { CustomLayoutComponent } from './layouts/custom-layout/custom-layout.component';
import { eThemeSharedComponents } from '@abp/ng.theme.shared/extensions';
@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AccountModule,
    CoreModule.forRoot({
      environment,
      registerLocaleFn: registerLocale(),
    }),
    AbpOAuthModule.forRoot(),
    ThemeSharedModule.forRoot(),
    AccountConfigModule.forRoot(),
    IdentityConfigModule.forRoot(),
    TenantManagementConfigModule.forRoot(),
    SettingManagementConfigModule.forRoot(),
    ThemeLeptonXModule.forRoot(),
    SideMenuLayoutModule.forRoot(),
    FeatureManagementModule.forRoot(),
  ],
  declarations: [AppComponent],
  providers: [
    APP_ROUTE_PROVIDER,
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
    {
      provide: APP_INITIALIZER,
      useFactory: initEmptyLayout,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
export function initEmptyLayout() {
  const replaceableComponents = inject(ReplaceableComponentsService);
  return function () {
    replaceableComponents.add({
      key: eThemeLeptonXComponents.EmptyLayout,
      component: CustomLayoutComponent,
    });
  };
}
