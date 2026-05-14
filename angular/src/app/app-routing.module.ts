import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RedirectComponent } from './shared/components/redirect-component/redirect-component.component';
import { AuthGuard } from '@abp/ng.core';
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
  },
  {
    path: 'gen-qr-code-free',
    pathMatch: 'full',
    loadChildren: () =>
      import('./home/custom-home-layout/layouts.module').then(m => m.LayoutsHomeModule),
  },
  {
    path: 'gen-qr-code-free/:token',
    loadChildren: () =>
      import('./home/custom-home-layout/layouts.module').then(m => m.LayoutsHomeModule),
  },
  {
    path: 'account',
    // loadChildren: () => import('@abp/ng.account').then(m => m.AccountModule.forLazy()),
    loadChildren: () => import('./account/account.module').then(m => m.AccountModule.forLazy()),
  },
  {
    path: 'identity',
    loadChildren: () => import('@abp/ng.identity').then(m => m.IdentityModule.forLazy()),
    // loadChildren: () => import('./identity/identity.module').then(m => m.IdentityModule.forLazy()),
  },
  {
    path: 'tenant-management',
    // loadChildren: () =>
    //   import('@abp/ng.tenant-management').then(m => m.TenantManagementModule.forLazy()),
    loadChildren: () =>
      import('./tenant/tenant-management.module').then(m => m.TenantManagementModule.forLazy()),
  },
  {
    path: 'setting-management',
    loadChildren: () =>
      import('@abp/ng.setting-management').then(m => m.SettingManagementModule.forLazy()),
  },
  { path: 'events', loadChildren: () => import('./event/event.module').then(m => m.EventModule) },
  {
    path: 'markets',
    loadChildren: () => import('./market/market.module').then(m => m.MarketModule),
  },
  {
    path: 'productCategories',
    loadChildren: () =>
      import('./product-category/product-category.module').then(m => m.ProductCategoryModule),
  },
  { path: 'stamps', loadChildren: () => import('./stamp/stamp.module').then(m => m.StampModule) },
  {
    path: 'companies',
    loadChildren: () => import('./company/company.module').then(m => m.CompanyModule),
  },
  { path: 'users', loadChildren: () => import('./users/users.module').then(m => m.UserModule) },
  {
    path: 'partner',
    loadChildren: () => import('./partner/partner.module').then(m => m.PartnerModule),
  },
  {
    path: 'company-profile',
    loadChildren: () =>
      import('./company-profile/company-profile.module').then(m => m.CompanyProfileModule),
  },
  {
    path: 'product',
    loadChildren: () => import('./product/product.module').then(m => m.ProductModule),
  },
  {
    path: 'process',
    loadChildren: () => import('./process/process.module').then(m => m.ProcessModule),
  },
  {
    path: 'receptacles',
    loadChildren: () => import('./receptacle/receptacle.module').then(m => m.ReceptacleModule),
  },
  {
    path: 'traceabilityRecords',
    loadChildren: () => import('./record/record.module').then(m => m.RecordModule),
  },
  {
    path: 'publicTemplate',
    loadChildren: () =>
      import('./public-template/public-template.module').then(m => m.PublicTemplateModule),
  },
  {
    path: 'supplier',
    loadChildren: () => import('./supplier/supplier.module').then(m => m.SupplierModule),
  },
  {
    path: 'policy',
    loadChildren: () => import('./Policy/policy.module').then(m => m.PolicyModule),
  },
  // {
  //   path: '',
  //   loadChildren: () => import('./end-user/end-user.module').then(m => m.EndUserModule),
  // },
  {
    path: '',
    loadChildren: () =>
      import('./traceability-report/traceability-report.module').then(
        m => m.TraceabilityReportModule
      ),
  },

  {
    path: 'mini-game',
    loadComponent: () =>
      import('./traceability-report/event-mini-game/event-minigame.component').then(
        m => m.EventMinigameComponent
      ),
  },
  // {
  //   path: '',
  //   loadChildren: () => import('./custom-layout-policy/layouts.module').then(m => m.LayoutsPolicyModule),
  // },
  {
    path: 'recordV2',
    loadChildren: () => import('./record-v2/record-v2.module').then(m => m.RecordV2Module),
  },

  {
    path: 'received',
    loadChildren: () => import('./record-v2/received/received.module').then(m => m.ReceivedModule),
  },
  {
    path: 'done',
    loadChildren: () => import('./record-v2/done/done.module').then(m => m.DoneModule),
  },
  {
    path: 'shared',
    loadChildren: () => import('./record-v2/shared/shared.module').then(m => m.SharedModule),
  },
  // {
  //   path: 'end-user/traceability-info',
  //   component: RedirectComponent
  // },
  // { path: 'gov/statistic', loadChildren: () => import('./statistic/statistic.module').then(m => m.StastisticModule) },
  {
    path: 'company-report',
    loadChildren: () =>
      import('./company-report/company-report.module').then(m => m.CompanyReportModule),
  },
  {
    path: 'admin-report',
    loadChildren: () => import('./admin-report/admin-report.module').then(m => m.AdminReportModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
