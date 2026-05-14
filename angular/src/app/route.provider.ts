import { eLayoutType, RoutesService } from '@abp/ng.core';
import { APP_INITIALIZER } from '@angular/core';
import { eThemeSharedRouteNames } from '@abp/ng.theme.shared';

export const APP_ROUTE_PROVIDER = [
  { provide: APP_INITIALIZER, useFactory: configureRoutes, deps: [RoutesService], multi: true },
];

function configureRoutes(routesService: RoutesService) {
  return () => {
    routesService.add([
      {
        path: '/',
        name: '::Menu:Home',
        iconClass: 'fas fa-home',
        order: 1,
        layout: eLayoutType.application,
      },
      {
        path: '/home/admin-home',
        name: '::Menu:HomeAdmin',
        iconClass: 'fas fa-user',
        order: 0,
        layout: eLayoutType.application,
        parentName: eThemeSharedRouteNames.Administration,
        requiredPolicy: 'AbpTenantManagement.Tenants',
      },
      {
        path: '/markets',
        name: '::Menu:Market',
        iconClass: 'fa fa-list-alt',
        order: 2,
        layout: eLayoutType.application,
        parentName: eThemeSharedRouteNames.Administration,
        requiredPolicy: 'TraceFarm.Markets',
      },
      {
        path: '/productCategories',
        name: '::Menu:ProductCategory',
        iconClass: 'fa fa-eercast',
        order: 3,
        layout: eLayoutType.application,
        parentName: eThemeSharedRouteNames.Administration,
        requiredPolicy: 'TraceFarm.ProductCategories',
      },
      {
        path: '/stamps',
        name: '::Menu:Stamp',
        iconClass: 'fa fa-certificate',
        order: 4,
        parentName: eThemeSharedRouteNames.Administration,
        layout: eLayoutType.application,
        requiredPolicy: 'TraceFarm.Stamps',
      },
      {
        path: '/companies',
        name: '::Menu:Company',
        iconClass: 'fa fa-building',
        order: 5,
        parentName: eThemeSharedRouteNames.Administration,
        layout: eLayoutType.application,
        requiredPolicy: 'TraceFarm.Companies',
      },
      {
        path: '/events',
        name: '::Minigame',
        iconClass: 'fa fa-gamepad',
        order: 5,
        parentName: eThemeSharedRouteNames.Administration,
        layout: eLayoutType.application,
        requiredPolicy: 'TraceFarm.Products',
      },
      {
        path: '/partner',
        name: '::Menu:Partner',
        iconClass: 'fa fa-address-card',
        order: 3,
        layout: eLayoutType.application,
        requiredPolicy: 'TraceFarm.Partners',
      },
      {
        path: '/company-profile',
        name: '::Menu:Profile',
        iconClass: 'fa fa-info-circle',
        order: 4,
        layout: eLayoutType.application,
        requiredPolicy: 'TraceFarm.CompanyProfiles',
      },
      {
        path: '/product',
        name: '::Menu:Product',
        iconClass: 'fa fa-eercast',
        order: 5,
        layout: eLayoutType.application,
        requiredPolicy: 'TraceFarm.Products',
      },
      {
        path: '/process',
        name: '::Menu:Process',
        iconClass: 'fa fa-cogs',
        order: 6,
        layout: eLayoutType.application,
        requiredPolicy: 'TraceFarm.Processes',
      },
      {
        path: '/receptacles',
        name: '::Menu:Receptacle',
        iconClass: 'fa fa-archive',
        order: 7,
        layout: eLayoutType.application,
        requiredPolicy: 'TraceFarm.Receptacles',
      },
      {
        path: '/publicTemplate',
        name: '::Menu:Templates',
        iconClass: 'fa fa-tasks',
        order: 8,
        layout: eLayoutType.application,
        requiredPolicy: 'TraceFarm.Templates',
      },
      {
        path: '/supplier',
        name: '::Menu:Supplier',
        iconClass: 'fa fa-address-book',
        order: 9,
        layout: eLayoutType.application,
        requiredPolicy: 'TraceFarm.Suppliers',
      },
      {
        path: '/admin-report',
        name: '::Menu:AdminReport',
        requiredPolicy: 'TraceFarm.ScanReports',
        order: 10,
        iconClass: 'fa fa-map-marker',
        layout: eLayoutType.application,
      },
      {
        path: '/',
        name: '::Menu:Record',
        requiredPolicy: 'TraceFarm.TraceabilityRecords',
        order: 11,
        iconClass: 'fa fa-folder-open',
        layout: eLayoutType.application,
      },
      {
        path: '/recordV2',
        name: '::Menu:Recording',
        parentName: '::Menu:Record',
        requiredPolicy: 'TraceFarm.TraceabilityRecords', //todo: change policy
        order: 0,
        layout: eLayoutType.application,
      },
      {
        path: '/done',
        name: '::Menu:Record:Done',
        parentName: '::Menu:Record',
        requiredPolicy: 'TraceFarm.TraceabilityRecords', //todo: change policy
        order: 1,
      },
      {
        path: '/received',
        name: '::Menu:Record:Received',
        parentName: '::Menu:Record',
        requiredPolicy: 'TraceFarm.TraceabilityRecords', //todo: change policy
        order: 2,
      },
      {
        path: '/shared',
        name: '::Menu:Record:Shared',
        parentName: '::Menu:Record',
        requiredPolicy: 'TraceFarm.TraceabilityRecords', //todo: change policy
        order: 3,
      },
      {
        path: '/company-report',
        name: '::Menu:Gov',
        requiredPolicy: 'TraceFarm.Govs',
        order: 12,
        iconClass: 'fa fa-folder-open',
        layout: eLayoutType.application,
      },
      {
        path: '/t',
        name: 'end-user',
        iconClass: 'fas fa-user',
        invisible: true,
      },
      {
        path: '/export',
        name: '::Menu:Export',
        invisible: true,
      },
      {
        path: '/p',
        name: 'product-traceability',
        layout: eLayoutType.empty,
        iconClass: 'fas fa-product-hunt',
        invisible: true,
      },
      {
        path: '/policy',
        name: 'policy',
        iconClass: 'fas fa-user',
        invisible: true,
      },
      {
        path: '/gen-qr-code-free',
        name: '::Menu:HomeTest',
        iconClass: 'fas fa-user',
        layout: eLayoutType.empty,
        invisible: true,
      },
      {
        path: '/admin-report/map-location',
        name: '',
        requiredPolicy: 'TraceFarm.ScanReports',
        iconClass: 'fa fa-folder-open',
        layout: eLayoutType.empty,
        invisible: true,
      },

      {
        path: '/mini-game',
        name: '',
        iconClass: 'fa fa-folder-open',
        layout: eLayoutType.empty,
        invisible: true,
      },
    ]);
  };
}
