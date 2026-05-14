import { Environment } from '@abp/ng.core';

const baseUrl = 'https://unidouat.traceverified.com';

export const environment = {
  production: true,
  application: {
    baseUrl,
    name: 'TraceFarm',
    logoUrl: './assets/images/logo/logo-light.png',
  },
  oAuthConfig: {
    issuer: 'https://unidouatapi.traceverified.com/',
    redirectUri: baseUrl,
    clientId: 'TraceFarm_App',
    responseType: 'code',
    scope: 'offline_access TraceFarm',
    requireHttps: true,
  },
  apis: {
    default: {
      url: 'https://unidouatapi.traceverified.com',
      rootNamespace: 'Traceverified.TraceFarm',
    },
  },
} as Environment;
