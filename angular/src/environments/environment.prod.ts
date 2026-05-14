import { Environment } from '@abp/ng.core';

const baseUrl = 'https://traceability.traceverified.com';

export const environment = {
  production: true,
  application: {
    baseUrl,
    name: 'TraceFarm',
    logoUrl: './assets/images/logo/logo-light.png',
  },
  oAuthConfig: {
    issuer: 'https://tv2api.traceverified.com/',
    redirectUri: baseUrl,
    clientId: 'TraceFarm_App',
    responseType: 'code',
    scope: 'offline_access TraceFarm',
    requireHttps: true,
  },
  apis: {
    default: {
      url: 'https://tv2api.traceverified.com',
      rootNamespace: 'Traceverified.TraceFarm',
    },
  },
} as Environment;
